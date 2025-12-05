import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSystemuserDto } from './dto/create-systemuser.dto';
import { UpdateSystemuserDto } from './dto/update-systemuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemUser } from './entities/systemuser.entity';

import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import { CompanyIdService } from '../common/services/company-id.service';

@Injectable()
export class SystemuserService {
  constructor(
    @InjectRepository(SystemUser)
    private readonly systemUserRepo: Repository<SystemUser>,
    private readonly jwtService: JwtService,
    private readonly companyIdService: CompanyIdService,
  ) { }

  private hashPassword(password: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

  async create(dto: CreateSystemuserDto) {
    const exists = await this.systemUserRepo.findOne({ where: { email: dto.email } });
    if (exists) throw new BadRequestException('Email already exists');

    // Generate unique companyId
    const companyId = await this.companyIdService.generateNextCompanyId();

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword(dto.password, salt);

    const entity = this.systemUserRepo.create({
      name: dto.name,
      email: dto.email,
      companyName: (dto as any).companyName,
      companyId,
      companyLogo: (dto as any).companyLogo ?? null,
      phone: (dto as any).phone ?? null,
      branchLocation: (dto as any).branchLocation ?? null,
      passwordSalt: salt,
      passwordHash: hash,
      permissions: dto.permissions ?? [],
      isActive: true,
      paymentInfo: (dto as any).paymentInfo ?? null,
    });

    const saved = await this.systemUserRepo.save(entity);
    const { passwordHash, passwordSalt, ...safe } = saved as any;
    return safe;
  }

  async findAll() {
    const list = await this.systemUserRepo.find({ order: { id: 'DESC' } });
    return list.map(({ passwordHash, passwordSalt, ...safe }) => safe);
  }

  async findOne(id: number) {
    const entity = await this.systemUserRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('System user not found');
    const { passwordHash, passwordSalt, ...safe } = entity as any;
    return safe;
  }

  async update(id: number, dto: UpdateSystemuserDto) {
    const entity = await this.systemUserRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('System user not found');

    if ((dto as any).email && (dto as any).email !== entity.email) {
      const exists = await this.systemUserRepo.findOne({ where: { email: (dto as any).email } });
      if (exists) throw new BadRequestException('Email already exists');
      entity.email = (dto as any).email;
    }

    if ((dto as any).name !== undefined) entity.name = (dto as any).name;
    if ((dto as any).companyName !== undefined) {
      (entity as any).companyName = (dto as any).companyName;
    }

    if ((dto as any).companyLogo !== undefined) {
      (entity as any).companyLogo = (dto as any).companyLogo;
    }
    if ((dto as any).phone !== undefined) {
      (entity as any).phone = (dto as any).phone;
    }
    if ((dto as any).branchLocation !== undefined) {
      (entity as any).branchLocation = (dto as any).branchLocation;
    }

    if ((dto as any).password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = this.hashPassword((dto as any).password, salt);
      entity.passwordSalt = salt;
      entity.passwordHash = hash;
    }

    if ((dto as any).permissions) {
      (entity as any).permissions = (dto as any).permissions;
    }

    if ((dto as any).paymentInfo !== undefined) {
      (entity as any).paymentInfo = (dto as any).paymentInfo;
    }

    const saved = await this.systemUserRepo.save(entity);
    const { passwordHash, passwordSalt, ...safe } = saved as any;
    return safe;
  }

  async remove(id: number) {
    const entity = await this.systemUserRepo.findOne({ where: { id } });
    if (!entity) throw new NotFoundException('System user not found');
    await this.systemUserRepo.softRemove(entity);
    return { success: true };
  }

  async login(dto: LoginDto) {
    const user = await this.systemUserRepo.findOne({ where: { email: dto.email } });
    if (!user) throw new NotFoundException('Invalid credentials');

    const hash = this.hashPassword(dto.password, user.passwordSalt);
    if (hash !== user.passwordHash) throw new NotFoundException('Invalid credentials');

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

    const { passwordHash, passwordSalt, ...safe } = user as any;
    return { accessToken, user: safe };
  }
}
