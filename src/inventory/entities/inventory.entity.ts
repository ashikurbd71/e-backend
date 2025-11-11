import { ProductEntity } from "src/products/entities/product.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn, DeleteDateColumn } from "typeorm";

@Entity("tbl_inventory")
export class InventoryEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => ProductEntity)
  product: ProductEntity;

  @Column("int", { default: 0 })
  stock: number;

  @Column("int", { default: 0 })
  sold: number;

  @Column("decimal", { precision: 12, scale: 2, default: 0 })
  totalIncome: number;

  @Column({ default: false })
  isLowStock: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
