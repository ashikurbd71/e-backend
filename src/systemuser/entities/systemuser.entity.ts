import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

export enum SystemUserRole {
  systemOwner = 'systemOwner',
  orderManagement = 'orderManagement',
  productsManagement = 'productsManagement',
  inventoryManagement = 'inventoryManagement',
  moderator = 'moderator',
  developer = 'developer',
}

@Entity('tbl_system_users')
export class Systemuser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  companyName: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column()
  passwordHash: string;

  @Column()
  passwordSalt: string;

  @Column({ type: 'enum', enum: SystemUserRole, default: SystemUserRole.systemOwner })
  role: SystemUserRole;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}