// UsersController
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe, HttpCode, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, CompanyIdGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto, @CompanyId() companyId: string) {
    const user = await this.usersService.create(createUserDto, companyId);
    return { statusCode: HttpStatus.CREATED, message: 'User created', data: user };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CompanyId() companyId: string) {
    const users = await this.usersService.findAll(companyId);
    return { statusCode: HttpStatus.OK, message: 'Users list fetched', data: users };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const user = await this.usersService.findOne(id, companyId);
    return { statusCode: HttpStatus.OK, message: 'User fetched', data: user };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto, @CompanyId() companyId: string) {
    const updated = await this.usersService.update(id, updateUserDto, companyId);
    return { statusCode: HttpStatus.OK, message: 'User updated', data: updated };
  }

  // Add ban/unban endpoints
  @Patch(':id/ban')
  @HttpCode(HttpStatus.OK)
  async ban(@Param('id', ParseIntPipe) id: number, @Body() dto: BanUserDto, @CompanyId() companyId: string) {
    const banned = await this.usersService.ban(id, companyId, dto?.reason);
    return { statusCode: HttpStatus.OK, message: 'User banned', data: banned };
  }

  @Patch(':id/unban')
  @HttpCode(HttpStatus.OK)
  async unban(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    const unbanned = await this.usersService.unban(id, companyId);
    return { statusCode: HttpStatus.OK, message: 'User unbanned', data: unbanned };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number, @CompanyId() companyId: string) {
    await this.usersService.remove(id, companyId);
    return { statusCode: HttpStatus.OK, message: 'User removed' };
  }
}
