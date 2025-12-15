import { FeaturePermission } from '../feature-permission.enum';
export declare class SystemUser {
    id: number;
    name: string;
    email: string;
    companyName: string;
    companyId: string;
    companyLogo: string;
    phone: string;
    branchLocation: string;
    passwordHash: string;
    passwordSalt: string;
    permissions: FeaturePermission[];
    isActive: boolean;
    paymentInfo: {
        paymentstatus?: string;
        paymentmethod?: string;
        amount?: number;
        packagename?: string;
    };
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
}
