// UsersService
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findOne({ where: { email: createUserDto.email } });
    if (existing) throw new BadRequestException('Email already exists');

    const user = this.userRepo.create({
      name: createUserDto.name,
      email: createUserDto.email,
      phone: createUserDto.phone,
      address: createUserDto.address,
      role: (createUserDto as any).role ?? 'customer',
      isActive: (createUserDto as any).isActive ?? true,
    });
    return this.userRepo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    const dto: Partial<UpdateUserDto> = updateUserDto ?? {};

    if (dto.email && dto.email !== user.email) {
      const exists = await this.userRepo.findOne({ where: { email: dto.email } });
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
  async ban(id: number, reason?: string): Promise<User> {
    const user = await this.findOne(id);
    if (user.isBanned) throw new BadRequestException('User already banned');

    user.isBanned = true;
    user.bannedAt = new Date();
    user.banReason = reason ?? null;

    return this.userRepo.save(user);
  }

  async unban(id: number): Promise<User> {
    const user = await this.findOne(id);
    if (!user.isBanned) throw new BadRequestException('User is not banned');

    user.isBanned = false;
    user.bannedAt = null;
    user.banReason = null;

    return this.userRepo.save(user);
  }

  async remove(id: number): Promise<void> {
    const result = await this.userRepo.softDelete(id);
    if (!result.affected) throw new NotFoundException('User not found');
  }

  // Add lookups for FraudChecker
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByName(name: string): Promise<User[]> {
    return this.userRepo.find({ where: { name } });
  }

    // Add lookup by phone number for FraudChecker
    async findByPhone(phone: string): Promise<User> {
        const user = await this.userRepo.findOne({ where: { phone } });
        if (!user) throw new NotFoundException('User not found');
        return user;
    }
}
