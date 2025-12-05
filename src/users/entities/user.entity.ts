import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';

@Entity('tbl_users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 'customer' })
  role: 'customer' | 'admin';

  @OneToMany(() => Order, (order) => order.customer)
  orders: Order[];

  @Column({ type: 'int', default: 0 })
  successfulOrdersCount: number;

  @Column({ type: 'int', default: 0 })
  cancelledOrdersCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'text', nullable: true })
  banReason?: string | null;

  @Column({ type: 'timestamp', nullable: true })
  bannedAt?: Date | null;

  @Column({ nullable: false })
  companyId: string;

  
}