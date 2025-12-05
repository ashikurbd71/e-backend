import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { FeaturePermission } from '../feature-permission.enum';

@Entity('system_users')
export class SystemUser {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: false })
  companyName: string;

  @Column({ unique: true, nullable: false })
  companyId: string;

  @Column({ nullable: true })
  companyLogo: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  branchLocation: string;

  /**
   * Stored as a salted hash – never return this field from APIs.
   */
  @Column({ nullable: true })
  passwordHash: string;

  @Column({ nullable: true })
  passwordSalt: string;

  @Column('simple-array')
  permissions: FeaturePermission[];

  @Column({ default: true })
  isActive: boolean;

  @Column('json', { nullable: true })
  paymentInfo: {
    paymentstatus?: string;
    paymentmethod?: string;
    amount?: number;
    packagename?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}