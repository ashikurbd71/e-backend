import { FeaturePermission } from '../feature-permission.enum';
export declare class PaymentInfoDto {
    paymentstatus?: string;
    paymentmethod?: string;
    amount?: number;
    packagename?: string;
}
export declare class CreateSystemuserDto {
    name: string;
    email: string;
    password: string;
    companyName: string;
    companyLogo?: string;
    phone?: string;
    branchLocation?: string;
    permissions: FeaturePermission[];
    paymentInfo?: PaymentInfoDto;
}
