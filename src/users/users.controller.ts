// UsersController
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe, HttpCode, UseGuards, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { CompanyIdGuard } from 'src/common/guards/company-id.guard';
import { CompanyId } from 'src/common/decorators/company-id.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: CreateUserDto & { companyId?: string }) {
    const { companyId, ...createUserDto } = body;
    if (!companyId) {
      throw new BadRequestException('CompanyId is required');
    }
    if (!createUserDto.password) {
      throw new BadRequestException('Password is required');
    }
    const user = await this.usersService.create(createUserDto, companyId);
    return { statusCode: HttpStatus.CREATED, message: 'User registered successfully', data: user };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    const { accessToken, user } = await this.usersService.login(
      loginDto.email,
      loginDto.password,
      loginDto.companyId
    );
    return { statusCode: HttpStatus.OK, message: 'Login successful', accessToken, user };
  }

  @Post()
  @UseGuards(JwtAuthGuard, CompanyIdGuard)
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
