import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BannerEntity } from './entities/banner.entity';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Injectable()
export class BannerService {
  constructor(
    @InjectRepository(BannerEntity)
    private readonly bannerRepository: Repository<BannerEntity>,
  ) {}

  async create(dto: CreateBannerDto): Promise<BannerEntity> {
    const banner = this.bannerRepository.create(dto);
    return this.bannerRepository.save(banner);
  }

  async findAll(): Promise<BannerEntity[]> {
    return this.bannerRepository.find({ order: { order: 'ASC' } });
  }

  async findOne(id: number): Promise<BannerEntity | null> {
    return this.bannerRepository.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateBannerDto): Promise<BannerEntity> {
    const banner = await this.bannerRepository.findOne({ where: { id } });
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    Object.assign(banner, dto);
    return this.bannerRepository.save(banner);
  }

  async remove(id: number): Promise<void> {
    const result = await this.bannerRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Banner not found');
    }
  }
}
