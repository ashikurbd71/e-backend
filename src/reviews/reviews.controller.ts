import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CompanyIdGuard } from '../common/guards/company-id.guard';
import { CompanyId } from '../common/decorators/company-id.decorator';
import { UserId } from '../common/decorators/user-id.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, CompanyIdGuard)
  create(@Body() createReviewDto: CreateReviewDto, @CompanyId() companyId: string, @UserId() userId: number) {
    return this.reviewsService.create(createReviewDto, companyId, userId);
  }

  @Get('my-reviews')
  @UseGuards(JwtAuthGuard, CompanyIdGuard)
  findMyReviews(@UserId() userId: number, @CompanyId() companyId: string) {
    return this.reviewsService.findByUser(userId, companyId);
  }

  @Get()
  findAll(@Query('companyId') companyId: string) {
    return this.reviewsService.findAll(companyId);
  }

  @Get('product/:productId')
  findByProduct(
    @Param('productId', ParseIntPipe) productId: number,
    @Query('companyId') companyId: string
  ) {
    return this.reviewsService.findByProduct(productId, companyId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number, @Query('companyId') companyId: string) {
    return this.reviewsService.findOne(id, companyId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, CompanyIdGuard)
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
    @CompanyId() companyId: string,
  ) {
    return this.reviewsService.update(id, updateReviewDto, companyId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, CompanyIdGuard)
  remove(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    return this.reviewsService.remove(id, companyId);
  }
}
