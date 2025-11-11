import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { Order } from "./entities/order.entity";
import { CreateOrderDto } from "./dto/create-order.dto";
import { ProductEntity } from "src/products/entities/product.entity";
import { InventoryEntity } from "src/inventory/entities/inventory.entity";
import { User } from "src/users/entities/user.entity";
import { OrdersitemEntity } from "src/ordersitem/entities/ordersitem.entity";
import { PaymentsService } from "src/payments/payments.service";
import { Inject } from "@nestjs/common";
import { Transporter } from "nodemailer";


@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrdersitemEntity) private orderItemRepo: Repository<OrdersitemEntity>,
    @InjectRepository(ProductEntity) private productRepo: Repository<ProductEntity>,
    @InjectRepository(InventoryEntity) private inventoryRepo: Repository<InventoryEntity>,
    @InjectRepository(User) private userRepo: Repository<User>,

    private dataSource: DataSource,
    private readonly paymentsService: PaymentsService,
    @Inject('MAILER_TRANSPORT') private readonly mailer: Transporter,
  ) {}

  // Create order: will check stock and reserve (atomic transaction)
  async create(createDto: CreateOrderDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let customer: User | null = null;
      if (typeof createDto.customerId === "number") {
        customer = await this.userRepo.findOneBy({ id: createDto.customerId });
        if (!customer) throw new NotFoundException("Customer not found");
      }

      const order = new Order();
      order.customer = customer ?? undefined;
      order.customerName = customer?.name ?? createDto.customerName ?? "";
      order.customerPhone = customer?.phone ?? createDto.customerPhone ?? "";
      order.customerAddress = customer?.address ?? createDto.customerAddress ?? "";
      order.status = "pending";
      order.paymentMethod = createDto.paymentMethod ?? "DIRECT";



    

      const items: OrdersitemEntity[] = [];
      let total = 0;

      for (const it of createDto.items) {
        const product = await this.productRepo.findOne({ where: { id: it.productId } });
        if (!product) throw new NotFoundException(`Product ${it.productId} not found`);

        const inventory = await this.inventoryRepo.findOne({ where: { product: { id: product.id } } });
        if (!inventory || inventory.stock < it.quantity) throw new BadRequestException(`Insufficient stock for product ${product.id}`);

        const oi = new OrdersitemEntity();
        oi.order = order;
        oi.product = product;
        oi.quantity = it.quantity;
        oi.unitPrice = +product.price;
        oi.totalPrice = +product.price * it.quantity;

        total += oi.totalPrice;
        items.push(oi);
      }

      order.items = items;
      order.totalAmount = total;

      const savedOrder = await queryRunner.manager.save(order);
      await queryRunner.commitTransaction();

      const fullOrder = await this.orderRepo.findOne({
        where: { id: savedOrder.id },
        relations: ["items", "items.product", "customer"],
      });

      const customerAddress = fullOrder?.customerAddress ?? "";
      let payment: any = null;
      if (fullOrder!.paymentMethod === "DIRECT") {
        payment = await this.paymentsService.initiateSslPayment({
          amount: fullOrder ? +fullOrder.totalAmount : 0,
          currency: "BDT",
          orderId: fullOrder!.id.toString(),
          customerName: fullOrder!.customer?.name ?? fullOrder!.customerName ?? "",
          customerEmail: fullOrder!.customer?.email ?? "",
          customerPhone: fullOrder!.customer?.phone ?? fullOrder!.customerPhone ?? "",
          customerAddress,
        });
      }

      return { order: fullOrder, payment };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll() {
    return this.orderRepo.find({ relations: ["items", "items.product", "customer"] });
  }

  async findOne(id: number) {
    const o = await this.orderRepo.findOne({ where: { id }, relations: ["items", "items.product", "customer"] });
    if (!o) throw new NotFoundException("Order not found");
    return o;
  }

  // mark as completed (paid & completed) => update inventory.sold
  async completeOrder(id: number, paymentRef?: string) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status === "cancelled") throw new BadRequestException("Order cancelled");

    order.isPaid = true;
    order.paymentReference = paymentRef ?? undefined;
    order.status = "paid";
    await this.orderRepo.save(order);

    // increment sold counters in inventory
    for (const it of order.items) {
      const inv = await this.inventoryRepo.findOne({ where: { product: { id: it.product.id } }, relations: ["product"] });
      if (inv) {
        inv.sold += it.quantity;
        // stock already decreased on create (reservation)
        await this.inventoryRepo.save(inv);
      }
    }

    return this.findOne(id);
  }

  // cancel: restore stock
  async cancelOrder(id: number) {
    const order = await this.findOne(id);
    if (order.status === "cancelled") throw new BadRequestException("Already cancelled");

    order.status = "cancelled";
    await this.orderRepo.save(order);

    for (const it of order.items) {
      const inv = await this.inventoryRepo.findOne({ where: { product: { id: it.product.id } } });
      if (inv) {
        inv.stock += it.quantity;
        // optionally reduce sold if already counted
        await this.inventoryRepo.save(inv);
      }
    }

    // increment user's cancelledOrdersCount if customer exists
    if (order.customer?.id) {
      const user = await this.userRepo.findOne({ where: { id: order.customer.id } });
      if (user) {
        user.cancelledOrdersCount = (user.cancelledOrdersCount ?? 0) + 1;
        await this.userRepo.save(user);
      }
    }

    return { message: "Order cancelled" };
  }

  async deliverOrder(id: number) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status === "cancelled") throw new BadRequestException("Order cancelled");

    order.status = "delivered";
    await this.orderRepo.save(order);

    const LOW_STOCK_THRESHOLD = +(process.env.LOW_STOCK_THRESHOLD ?? 5);

    for (const it of order.items) {
      const inv = await this.inventoryRepo.findOne({ where: { product: { id: it.product.id } }, relations: ["product"] });
      if (!inv) continue;

      // Decrease stock on delivery
      inv.stock -= it.quantity;
      if (inv.stock < 0) inv.stock = 0;

      // Increase sold count
      inv.sold += it.quantity;

      // Accumulate product income
      const itemIncome = Number(it.unitPrice) * Number(it.quantity);
      inv.totalIncome = Number(inv.totalIncome || 0) + itemIncome;

      // Check low stock and notify
      inv.isLowStock = inv.stock <= LOW_STOCK_THRESHOLD;
      await this.inventoryRepo.save(inv);

      if (inv.isLowStock) {
        await this.sendLowStockEmail(inv);
      }
    }

    // increment user's successfulOrdersCount if customer exists
    if (order.customer?.id) {
      const user = await this.userRepo.findOne({ where: { id: order.customer.id } });
      if (user) {
        user.successfulOrdersCount = (user.successfulOrdersCount ?? 0) + 1;
        await this.userRepo.save(user);
      }
    }

    return this.findOne(id);
  }

  async shipOrder(id: number, trackingId?: string, provider?: string) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status === "cancelled") throw new BadRequestException("Order cancelled");

    order.status = "shipped";
    if (trackingId) order.shippingTrackingId = trackingId;
    if (provider) order.shippingProvider = provider;
    await this.orderRepo.save(order);

    return this.findOne(id);
  }

  async refundOrder(id: number) {
    const order = await this.findOne(id);
    if (!order) throw new NotFoundException("Order not found");
    if (order.status === "cancelled") throw new BadRequestException("Order cancelled");

    order.status = "refunded";
    order.isPaid = false;
    await this.orderRepo.save(order);

    // Reverse sold/income and restock items
    for (const it of order.items) {
        const inv = await this.inventoryRepo.findOne({ where: { product: { id: it.product.id } }, relations: ["product"] });
        if (!inv) continue;
    
        // Restock the returned quantity
        inv.stock += it.quantity;
    
        // Reverse sold and income if previously counted
        inv.sold = Math.max(0, inv.sold - it.quantity);
        const itemIncome = Number(it.unitPrice) * Number(it.quantity);
        inv.totalIncome = Math.max(0, Number(inv.totalIncome || 0) - itemIncome);
    
        await this.inventoryRepo.save(inv);
    }

    return this.findOne(id);
  }

  private async sendLowStockEmail(inv: InventoryEntity) {
    try {
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        console.warn("ADMIN_EMAIL is not set. Low stock alert:", {
          productId: inv.product?.id,
          sku: inv.product?.sku,
          stock: inv.stock,
        });
        return;
      }

      const info = await this.mailer.sendMail({
        from: process.env.SMTP_FROM ?? process.env.SMTP_USER,
        to: adminEmail,
        subject: `Low Stock Alert: ${inv.product?.name ?? "Product"} (${inv.product?.sku ?? ""})`,
        text: `Product ${inv.product?.name} (${inv.product?.sku}) is low on stock.\nCurrent stock: ${inv.stock}\nThreshold: ${process.env.LOW_STOCK_THRESHOLD ?? 5}`,
      });

      if (process.env.NODE_ENV !== "production") {
        console.log("Low stock email sent:", info.messageId);
      }
    } catch (e) {
      console.error("Failed to send low stock email:", e);
    }
  }
}
