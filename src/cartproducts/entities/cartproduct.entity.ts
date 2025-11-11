import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Unique } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { ProductEntity } from 'src/products/entities/product.entity';

@Entity('tbl_cart_products')
@Unique(['user', 'product'])
export class Cartproduct {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
  user: User;

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