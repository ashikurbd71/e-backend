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
exports.SystemuserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const systemuser_entity_1 = require("./entities/systemuser.entity");
const crypto = require("crypto");
const jwt_1 = require("@nestjs/jwt");
const company_id_service_1 = require("../common/services/company-id.service");
let SystemuserService = class SystemuserService {
    systemUserRepo;
    jwtService;
    companyIdService;
    constructor(systemUserRepo, jwtService, companyIdService) {
        this.systemUserRepo = systemUserRepo;
        this.jwtService = jwtService;
        this.companyIdService = companyIdService;
    }
    hashPassword(password, salt) {
        return crypto.createHmac('sha256', salt).update(password).digest('hex');
    }
    async create(dto) {
        const exists = await this.systemUserRepo.findOne({ where: { email: dto.email } });
        if (exists)
            throw new common_1.BadRequestException('Email already exists');
        const companyId = await this.companyIdService.generateNextCompanyId();
        const salt = crypto.randomBytes(16).toString('hex');
        const hash = this.hashPassword(dto.password, salt);
        const entity = this.systemUserRepo.create({
            name: dto.name,
            email: dto.email,
            companyName: dto.companyName,
            companyId,
            companyLogo: dto.companyLogo ?? null,
            phone: dto.phone ?? null,
            branchLocation: dto.branchLocation ?? null,
            passwordSalt: salt,
            passwordHash: hash,
            permissions: dto.permissions ?? [],
            isActive: true,
            paymentInfo: dto.paymentInfo ?? null,
        });
        const saved = await this.systemUserRepo.save(entity);
        const { passwordHash, passwordSalt, ...safe } = saved;
        return safe;
    }
    async findAll() {
        const list = await this.systemUserRepo.find({ order: { id: 'DESC' } });
        return list.map(({ passwordHash, passwordSalt, ...safe }) => safe);
    }
    async findOne(id) {
        const entity = await this.systemUserRepo.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('System user not found');
        const { passwordHash, passwordSalt, ...safe } = entity;
        return safe;
    }
    async update(id, dto) {
        const entity = await this.systemUserRepo.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('System user not found');
        if (dto.email && dto.email !== entity.email) {
            const exists = await this.systemUserRepo.findOne({ where: { email: dto.email } });
            if (exists)
                throw new common_1.BadRequestException('Email already exists');
            entity.email = dto.email;
        }
        if (dto.name !== undefined)
            entity.name = dto.name;
        if (dto.companyName !== undefined) {
            entity.companyName = dto.companyName;
        }
        if (dto.companyLogo !== undefined) {
            entity.companyLogo = dto.companyLogo;
        }
        if (dto.phone !== undefined) {
            entity.phone = dto.phone;
        }
        if (dto.branchLocation !== undefined) {
            entity.branchLocation = dto.branchLocation;
        }
        if (dto.password) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = this.hashPassword(dto.password, salt);
            entity.passwordSalt = salt;
            entity.passwordHash = hash;
        }
        if (dto.permissions) {
            entity.permissions = dto.permissions;
        }
        if (dto.paymentInfo !== undefined) {
            entity.paymentInfo = dto.paymentInfo;
        }
        const saved = await this.systemUserRepo.save(entity);
        const { passwordHash, passwordSalt, ...safe } = saved;
        return safe;
    }
    async remove(id) {
        const entity = await this.systemUserRepo.findOne({ where: { id } });
        if (!entity)
            throw new common_1.NotFoundException('System user not found');
        await this.systemUserRepo.softRemove(entity);
        return { success: true };
    }
    async login(dto) {
        const user = await this.systemUserRepo.findOne({ where: { email: dto.email } });
        if (!user)
            throw new common_1.NotFoundException('Invalid credentials');
        const hash = this.hashPassword(dto.password, user.passwordSalt);
        if (hash !== user.passwordHash)
            throw new common_1.NotFoundException('Invalid credentials');
        const payload = {
            sub: user.id,
            userId: user.id,
            email: user.email,
            companyId: user.companyId,
            permissions: user.permissions,
            paymentInfo: user.paymentInfo ?? null,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            isActive: user.isActive,
            companyName: user.companyName,
            companyLogo: user.companyLogo,
            phone: user.phone,
            branchLocation: user.branchLocation,
            name: user.name,
        };
        const accessToken = this.jwtService.sign(payload);
        const { passwordHash, passwordSalt, ...safe } = user;
        return { accessToken, user: safe };
    }
};
exports.SystemuserService = SystemuserService;
exports.SystemuserService = SystemuserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(systemuser_entity_1.SystemUser)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        company_id_service_1.CompanyIdService])
], SystemuserService);
//# sourceMappingURL=systemuser.service.js.map