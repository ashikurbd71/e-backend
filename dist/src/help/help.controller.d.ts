import { HelpService } from './help.service';
import { CreateHelpDto } from './dto/create-help.dto';
import { UpdateHelpDto } from './dto/update-help.dto';
export declare class HelpController {
    private readonly helpService;
    constructor(helpService: HelpService);
    create(createHelpDto: CreateHelpDto, companyId: string): Promise<import("./entities/help.entity").Help>;
    findAll(companyId: string): Promise<import("./entities/help.entity").Help[]>;
    findOne(id: number, companyId: string): Promise<import("./entities/help.entity").Help>;
    update(id: number, updateHelpDto: UpdateHelpDto, companyId: string): Promise<import("./entities/help.entity").Help>;
    remove(id: number, companyId: string): Promise<{
        success: boolean;
    }>;
}
