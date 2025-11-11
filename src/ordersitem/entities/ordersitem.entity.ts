import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity('tbl_order_items')
export class OrdersitemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { nullable: false, onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => ProductEntity, { nullable: false })
  product: ProductEntity;

  @Column('int')
  quantity: number;

  @Column('decimal', { precision: 12, scale: 2 })
  unitPrice: number;

  @Column('decimal', { precision: 12, scale: 2 })
  totalPrice: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}