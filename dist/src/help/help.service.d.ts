import { Repository } from 'typeorm';
import { CreateHelpDto } from './dto/create-help.dto';
import { UpdateHelpDto } from './dto/update-help.dto';
import { Help } from './entities/help.entity';
export declare class HelpService {
    private readonly helpRepo;
    private readonly mailer;
    constructor(helpRepo: Repository<Help>, mailer: {
        sendMail: (message: unknown) => Promise<{
            id?: string;
        }>;
    });
    create(createHelpDto: CreateHelpDto, companyId: string): Promise<Help>;
    findAll(companyId: string): Promise<Help[]>;
    findOne(id: number, companyId: string): Promise<Help>;
    update(id: number, updateHelpDto: UpdateHelpDto, companyId: string): Promise<Help>;
    remove(id: number, companyId: string): Promise<{
        success: boolean;
    }>;
    private sendSupportEmail;
}
