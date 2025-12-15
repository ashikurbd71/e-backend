import { CreateSystemuserDto } from './dto/create-systemuser.dto';
import { UpdateSystemuserDto } from './dto/update-systemuser.dto';
import { Repository } from 'typeorm';
import { SystemUser } from './entities/systemuser.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { CompanyIdService } from '../common/services/company-id.service';
export declare class SystemuserService {
    private readonly systemUserRepo;
    private readonly jwtService;
    private readonly companyIdService;
    constructor(systemUserRepo: Repository<SystemUser>, jwtService: JwtService, companyIdService: CompanyIdService);
    private hashPassword;
    create(dto: CreateSystemuserDto): Promise<any>;
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
    findOne(id: number): Promise<any>;
    update(id: number, dto: UpdateSystemuserDto): Promise<any>;
    remove(id: number): Promise<{
        success: boolean;
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: any;
    }>;
}
