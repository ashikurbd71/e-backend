import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";
import { User } from "src/users/entities/user.entity";
import { OrdersitemEntity } from "src/ordersitem/entities/ordersitem.entity";

@Entity("orders")
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true })
  customer?: User;

  @Column({ nullable: true })
  customerName?: string;

  @Column({ nullable: true })
  customerPhone?: string;

  @Column({ nullable: true })
  customerAddress?: string;

  @OneToMany(() => OrdersitemEntity, (item) => item.order, { cascade: true })
  items: OrdersitemEntity[];

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ default: "pending" })
  status: "pending" | "processing" | "paid" | "shipped" | "delivered" | "cancelled" | "refunded";

  @Column({ nullable: true })
  paymentReference?: string;

  @Column({ default: "DIRECT" })
  paymentMethod: "DIRECT" | "COD";

  @Column({ nullable: true })
  shippingTrackingId?: string;

  @Column({ nullable: true })
  shippingProvider?: string;

  @Column({ default: false })
  isPaid: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
