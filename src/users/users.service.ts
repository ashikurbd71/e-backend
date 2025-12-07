// UsersService
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) { }

  private hashPassword(password: string, salt: string): string {
    return crypto.createHmac('sha256', salt).update(password).digest('hex');
  }

  async create(createUserDto: CreateUserDto, companyId: string): Promise<User> {
    const existing = await this.userRepo.findOne({ 
      where: { email: createUserDto.email, companyId } 
    });
    if (existing) throw new BadRequestException('Email already exists');

    const userData: any = {
      name: createUserDto.name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      address: createUserDto.address,
      role: (createUserDto as any).role ?? 'customer',
      isActive: (createUserDto as any).isActive ?? true,
      companyId,
    };

    // If password is provided, hash it
    if (createUserDto.password) {
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = this.hashPassword(createUserDto.password, salt);
      userData.passwordSalt = salt;
      userData.passwordHash = hash;
    }

    const user = this.userRepo.create(userData) as unknown as User;
    const saved = await this.userRepo.save(user);
    return saved;
  }

  async findAll(companyId: string): Promise<User[]> {
    return this.userRepo.find({ 
      where: { companyId },
      order: { id: 'DESC' } 
    });
  }

  async findOne(id: number, companyId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id, companyId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto, companyId: string): Promise<User> {
    const user = await this.findOne(id, companyId);

    const dto: Partial<UpdateUserDto> = updateUserDto ?? {};

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({ 
        where: { email: dto.email, companyId } 
      });
      if (exists) throw new BadRequestException('Email already exists');
    }

    if (dto.name !== undefined) user.name = dto.name as any;
    if (dto.email !== undefined) user.email = dto.email as any;
    if (dto.phone !== undefined) user.phone = dto.phone as any;
    if (dto.address !== undefined) user.address = dto.address as any;

    if (dto.role !== undefined) user.role = dto.role as any;
    if (dto.isActive !== undefined) user.isActive = dto.isActive as any;

    return this.userRepo.save(user);
  }

  // Add ban/unban methods
  async ban(id: number, companyId: string, reason?: string): Promise<User> {
    const user = await this.findOne(id, companyId);
    if (user.isBanned) throw new BadRequestException('User already banned');

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason ?? null;

    return this.userRepo.save(user);
  }

  async unban(id: number, companyId: string): Promise<User> {
    const user = await this.findOne(id, companyId);
    if (!user.isBanned) throw new BadRequestException('User is not banned');

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;

    return this.userRepo.save(user);
  }

  async remove(id: number, companyId: string): Promise<void> {
    const user = await this.findOne(id, companyId);
    const result = await this.userRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException('User not found');
  }

  // Add lookups for FraudChecker
  async findByEmail(email: string, companyId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email, companyId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByName(name: string, companyId: string): Promise<User[]> {
    return this.userRepo.find({ where: { name, companyId } });
  }

  // Add lookup by phone number for FraudChecker
  async findByPhone(phone: string, companyId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { phone, companyId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findCustomers(companyId: string, filter?: { ids?: number[]; includeInactive?: boolean }): Promise<User[]> {
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

  async login(email: string, password: string, companyId: string) {
    const user = await this.userRepo.findOne({ 
      where: { email, companyId } 
    });
    if (!user) throw new NotFoundException('Invalid credentials');

    if (!user.passwordHash || !user.passwordSalt) {
      throw new BadRequestException('Password not set for this user');
    }

    const hash = this.hashPassword(password, user.passwordSalt);
    if (hash !== user.passwordHash) throw new NotFoundException('Invalid credentials');

    if (!user.isActive) throw new BadRequestException('User account is inactive');
    if (user.isBanned) throw new BadRequestException('User account is banned');

    const payload = {
      sub: user.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      companyId: user.companyId,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload);

    const { passwordHash, passwordSalt, ...safe } = user as any;
    return { accessToken, user: safe };
  }
}
