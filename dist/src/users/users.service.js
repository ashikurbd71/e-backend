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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("./entities/user.entity");
const jwt_1 = require("@nestjs/jwt");
const crypto = require("crypto");
let UsersService = class UsersService {
    userRepo;
    jwtService;
    constructor(userRepo, jwtService) {
        this.userRepo = userRepo;
        this.jwtService = jwtService;
    }
    hashPassword(password, salt) {
        return crypto.createHmac('sha256', salt).update(password).digest('hex');
    }
    async create(createUserDto, companyId) {
        const existing = await this.userRepo.findOne({
            where: { email: createUserDto.email, companyId }
        });
        if (existing)
            throw new common_1.BadRequestException('Email already exists');
        const userData = {
            name: createUserDto.name,
            email: createUserDto.email,
            phone: createUserDto.phone,
            address: createUserDto.address,
            role: createUserDto.role ?? 'customer',
            isActive: createUserDto.isActive ?? true,
            companyId,
        };
        if (createUserDto.password) {
            const salt = crypto.randomBytes(16).toString('hex');
            const hash = this.hashPassword(createUserDto.password, salt);
            userData.passwordSalt = salt;
            userData.passwordHash = hash;
        }
        const user = this.userRepo.create(userData);
        const saved = await this.userRepo.save(user);
        return saved;
    }
    async findAll(companyId) {
        return this.userRepo.find({
            where: { companyId },
            order: { id: 'DESC' }
        });
    }
    async findOne(id, companyId) {
        const user = await this.userRepo.findOne({ where: { id, companyId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async update(id, updateUserDto, companyId) {
        const user = await this.findOne(id, companyId);
        const dto = updateUserDto ?? {};
        if (dto.email && dto.email !== user.email) {
            const exists = await this.userRepo.findOne({
                where: { email: dto.email, companyId }
            });
            if (exists)
                throw new common_1.BadRequestException('Email already exists');
        }
        if (dto.name !== undefined)
            user.name = dto.name;
        if (dto.email !== undefined)
            user.email = dto.email;
        if (dto.phone !== undefined)
            user.phone = dto.phone;
        if (dto.address !== undefined)
            user.address = dto.address;
        if (dto.district !== undefined)
            user.district = dto.district;
        if (dto.role !== undefined)
            user.role = dto.role;
        if (dto.isActive !== undefined)
            user.isActive = dto.isActive;
        return this.userRepo.save(user);
    }
    async ban(id, companyId, reason) {
        const user = await this.findOne(id, companyId);
        if (user.isBanned)
            throw new common_1.BadRequestException('User already banned');
        user.isBanned = true;
        user.bannedAt = new Date();
        user.banReason = reason ?? null;
        return this.userRepo.save(user);
    }
    async unban(id, companyId) {
        const user = await this.findOne(id, companyId);
        if (!user.isBanned)
            throw new common_1.BadRequestException('User is not banned');
        user.isBanned = false;
        user.bannedAt = null;
        user.banReason = null;
        return this.userRepo.save(user);
    }
    async remove(id, companyId) {
        const user = await this.findOne(id, companyId);
        const result = await this.userRepo.softDelete(id);
        if (!result.affected)
            throw new common_1.NotFoundException('User not found');
    }
    async findByEmail(email, companyId) {
        const user = await this.userRepo.findOne({ where: { email, companyId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findByName(name, companyId) {
        return this.userRepo.find({ where: { name, companyId } });
    }
    async findByPhone(phone, companyId) {
        const user = await this.userRepo.findOne({ where: { phone, companyId } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async findCustomers(companyId, filter) {
        const qb = this.userRepo.createQueryBuilder('user')
            .where('user.role = :role', { role: 'customer' })
            .andWhere('user.companyId = :companyId', { companyId });
        if (!filter?.includeInactive) {
            qb.andWhere('user.isActive = :active', { active: true });
        }
        if (filter?.ids?.length) {
            const ids = Array.from(new Set(filter.ids));
            qb.andWhere('user.id IN (:...ids)', { ids });
        }
        return qb.orderBy('user.id', 'DESC').getMany();
    }
    async login(email, password, companyId) {
        const user = await this.userRepo.findOne({
            where: { email, companyId }
        });
        if (!user)
            throw new common_1.NotFoundException('Invalid credentials');
        if (!user.passwordHash || !user.passwordSalt) {
            throw new common_1.BadRequestException('Password not set for this user');
        }
        const hash = this.hashPassword(password, user.passwordSalt);
        if (hash !== user.passwordHash)
            throw new common_1.NotFoundException('Invalid credentials');
        if (!user.isActive)
            throw new common_1.BadRequestException('User account is inactive');
        if (user.isBanned)
            throw new common_1.BadRequestException('User account is banned');
        const payload = {
            sub: user.id,
            userId: user.id,
            email: user.email,
            name: user.name,
            companyId: user.companyId,
            role: user.role,
        };
        const accessToken = this.jwtService.sign(payload);
        const { passwordHash, passwordSalt, ...safe } = user;
        return { accessToken, user: safe };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService])
], UsersService);
//# sourceMappingURL=users.service.js.map