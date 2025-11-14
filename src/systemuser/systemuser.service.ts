import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateSystemuserDto } from './dto/create-systemuser.dto';
import { UpdateSystemuserDto } from './dto/update-systemuser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Systemuser, SystemUserRole } from './entities/systemuser.entity';

import * as crypto from 'crypto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class SystemuserService {
  constructor(
    @InjectRepository(Systemuser)
    private readonly systemUserRepo: Repository<Systemuser>,
  ) {}

  private hashPassword(password: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

  async create(dto: CreateSystemuserDto) {
    const exists = await this.systemUserRepo.findOne({ where: { email: (dto as any).email } });
    if (exists) throw new BadRequestException('Email already exists');

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.hashPassword((dto as any).password, salt);

    const entity = this.systemUserRepo.create({
      companyName: (dto as any).companyName,
      email: (dto as any).email,
      phone: (dto as any).phone,
      passwordSalt: salt,
      passwordHash: hash,
      role: (dto as any).role ?? SystemUserRole.systemOwner,
      isActive: true,
    });

    const saved = await this.systemUserRepo.save(entity);
    // do not return sensitive fields
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

    if ((dto as any).companyName !== undefined) entity.companyName = (dto as any).companyName;
    if ((dto as any).phone !== undefined) entity.phone = (dto as any).phone;
    if ((dto as any).role !== undefined) entity.role = (dto as any).role;

    if ((dto as any).password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = this.hashPassword((dto as any).password, salt);
      entity.passwordSalt = salt;
      entity.passwordHash = hash;
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

    // simple access token (placeholder); swap to JWT later
    const accessToken = crypto.randomBytes(24).toString('hex');

    const { passwordHash, passwordSalt, ...safe } = user as any;
    return { accessToken, user: safe };
  }
}
