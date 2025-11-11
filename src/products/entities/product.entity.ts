import { CategoryEntity } from "src/category/entities/category.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";


@Entity("tbl_products")
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  sku: string;

  @Column("decimal", { precision: 10, scale: 2 })
  price: number;

  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  discountPrice?: number;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'simple-json', nullable: true })
  images?: { url: string; alt?: string; isPrimary?: boolean }[];

  @Column({ nullable: true })
  thumbnail?: string;

  @Column({ default: true })
  isActive: boolean;

  @ManyToOne(() => CategoryEntity, { nullable: false })
  category: CategoryEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date; // soft delete
}
