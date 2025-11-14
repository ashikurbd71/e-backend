import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CreatePromocodeDto } from './dto/create-promocode.dto';
import { UpdatePromocodeDto } from './dto/update-promocode.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PromocodeEntity, PromocodeDiscountType } from './entities/promocode.entity';

@Injectable()
export class PromocodeService {
  constructor(
    @InjectRepository(PromocodeEntity)
    private readonly promoRepo: Repository<PromocodeEntity>,
  ) {}

  async create(dto: CreatePromocodeDto) {
    const exists = await this.promoRepo.findOne({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('Promocode already exists');

    const startsAt = dto.startsAt ? new Date(dto.startsAt) : undefined;
    const expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;

    if (startsAt && expiresAt && startsAt > expiresAt) {
      throw new BadRequestException('startsAt must be before expiresAt');
    }

    const promo = this.promoRepo.create({
      code: dto.code,
      description: dto.description,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      maxUses: dto.maxUses,
      currentUses: 0,
      minOrderAmount: dto.minOrderAmount,
      startsAt,
      expiresAt,
      isActive: dto.isActive ?? true,
    });

    return this.promoRepo.save(promo);
  }

  async findAll() {
    return this.promoRepo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number) {
    const promo = await this.promoRepo.findOne({ where: { id } });
    if (!promo) throw new NotFoundException('Promocode not found');
    return promo;
  }

  async update(id: number, dto: UpdatePromocodeDto) {
    const promo = await this.findOne(id);

    if (dto.code && dto.code !== promo.code) {
      const exists = await this.promoRepo.findOne({ where: { code: dto.code } });
      if (exists) throw new BadRequestException('Promocode already exists');
      promo.code = dto.code;
    }

    if (dto.description !== undefined) promo.description = dto.description;
    if (dto.discountType !== undefined) promo.discountType = dto.discountType as PromocodeDiscountType;
    if (dto.discountValue !== undefined) promo.discountValue = dto.discountValue as any;
    if (dto.maxUses !== undefined) promo.maxUses = dto.maxUses as any;
    if (dto.minOrderAmount !== undefined) promo.minOrderAmount = dto.minOrderAmount as any;

    if (dto.startsAt !== undefined) promo.startsAt = dto.startsAt ? new Date(dto.startsAt) : undefined;
    if (dto.expiresAt !== undefined) promo.expiresAt = dto.expiresAt ? new Date(dto.expiresAt) : undefined;

    if (promo.startsAt && promo.expiresAt && promo.startsAt > promo.expiresAt) {
      throw new BadRequestException('startsAt must be before expiresAt');
    }

    if (dto.isActive !== undefined) promo.isActive = dto.isActive as any;

    return this.promoRepo.save(promo);
  }

  async remove(id: number) {
    const res = await this.promoRepo.softDelete(id);
    if (!res.affected) throw new NotFoundException('Promocode not found');
  }

  async toggleActive(id: number, active: boolean) {
    const promo = await this.findOne(id);
    promo.isActive = active;
    return this.promoRepo.save(promo);
  }
}
