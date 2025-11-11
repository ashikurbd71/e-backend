import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, HttpCode, HttpStatus, NotFoundException } from '@nestjs/common';
import { BannerService } from './banner.service';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';

@Controller('banners')
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBannerDto) {
    const banner = await this.bannerService.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Banner created successfully',
      data: banner,
    };
  }

  @Get()
  async findAll() {
    const banners = await this.bannerService.findAll();
    return {
      statusCode: HttpStatus.OK,
      message: 'Banner list fetched successfully',
      data: banners,
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const banner = await this.bannerService.findOne(id);
    if (!banner) {
      throw new NotFoundException('Banner not found');
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Banner fetched successfully',
      data: banner,
    };
  }

  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBannerDto) {
    const updated = await this.bannerService.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Banner updated successfully',
      data: updated,
    };
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.bannerService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Banner deleted successfully',
    };
  }
}
