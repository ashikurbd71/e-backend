import { SystemuserService } from './systemuser.service';
import { CreateSystemuserDto } from './dto/create-systemuser.dto';
import { UpdateSystemuserDto } from './dto/update-systemuser.dto';
import { LoginDto } from './dto/login.dto';
export declare class SystemuserController {
    private readonly systemuserService;
    constructor(systemuserService: SystemuserService);
    create(createSystemuserDto: CreateSystemuserDto): Promise<any>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        email: string;
        companyName: string;
        companyId: string;
        companyLogo: string;
        phone: string;
        branchLocation: string;
        permissions: import("./feature-permission.enum").FeaturePermission[];
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
    }[]>;
    findOne(id: string): Promise<any>;
    update(id: string, updateSystemuserDto: UpdateSystemuserDto): Promise<any>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
