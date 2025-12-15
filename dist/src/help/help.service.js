"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HelpService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const common_2 = require("@nestjs/common");
const help_entity_1 = require("./entities/help.entity");
let HelpService = class HelpService {
    helpRepo;
    mailer;
    constructor(helpRepo, mailer) {
        this.helpRepo = helpRepo;
        this.mailer = mailer;
    }
    async create(createHelpDto, companyId) {
        if (!companyId) {
            throw new common_1.NotFoundException('CompanyId is required');
        }
        const entity = this.helpRepo.create({
            email: createHelpDto.email,
            issue: createHelpDto.issue,
            status: createHelpDto.status ?? help_entity_1.SupportStatus.PENDING,
            companyId: companyId,
        });
        const saved = await this.helpRepo.save(entity);
        await this.sendSupportEmail(saved, createHelpDto.email);
        return saved;
    }
    async findAll(companyId) {
        return this.helpRepo.find({
            where: { companyId },
            order: { id: 'DESC' },
        });
    }
    async findOne(id, companyId) {
        const entity = await this.helpRepo.findOne({ where: { id, companyId } });
        if (!entity)
            throw new common_1.NotFoundException(`Help ticket ${id} not found`);
        return entity;
    }
    async update(id, updateHelpDto, companyId) {
        const entity = await this.findOne(id, companyId);
        const merged = this.helpRepo.merge(entity, updateHelpDto);
        merged.companyId = companyId;
        return this.helpRepo.save(merged);
    }
    async remove(id, companyId) {
        const entity = await this.findOne(id, companyId);
        await this.helpRepo.softRemove(entity);
        return { success: true };
    }
    async sendSupportEmail(help, email) {
        try {
            const adminEmail = 'ashikurovi2003@gmail.com';
            await this.mailer.sendMail({
                from: email,
                to: adminEmail,
                subject: `New Support Issue from ${help.email}`,
                text: `Issue:\n${help.issue}\nStatus: ${help.status}\nTicket ID: ${help.id}`,
            });
        }
        catch (e) {
            console.error('Failed to send support email:', e);
        }
    }
};
exports.HelpService = HelpService;
exports.HelpService = HelpService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(help_entity_1.Help)),
    __param(1, (0, common_2.Inject)('MAILER_TRANSPORT')),
    __metadata("design:paramtypes", [typeorm_2.Repository, Object])
], HelpService);
//# sourceMappingURL=help.service.js.map