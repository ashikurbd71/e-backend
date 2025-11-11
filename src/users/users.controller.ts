// UsersController
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, ParseIntPipe, HttpCode } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BanUserDto } from './dto/ban-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.usersService.create(createUserDto);
    return { statusCode: HttpStatus.CREATED, message: 'User created', data: user };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const users = await this.usersService.findAll();
    return { statusCode: HttpStatus.OK, message: 'Users list fetched', data: users };
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const user = await this.usersService.findOne(id);
    return { statusCode: HttpStatus.OK, message: 'User fetched', data: user };
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id', ParseIntPipe) id: number, @Body() updateUserDto: UpdateUserDto) {
    const updated = await this.usersService.update(id, updateUserDto);
    return { statusCode: HttpStatus.OK, message: 'User updated', data: updated };
  }

  // Add ban/unban endpoints
  @Patch(':id/ban')
  @HttpCode(HttpStatus.OK)
  async ban(@Param('id', ParseIntPipe) id: number, @Body() dto: BanUserDto) {
    const banned = await this.usersService.ban(id, dto?.reason);
    return { statusCode: HttpStatus.OK, message: 'User banned', data: banned };
  }

  @Patch(':id/unban')
  @HttpCode(HttpStatus.OK)
  async unban(@Param('id', ParseIntPipe) id: number) {
    const unbanned = await this.usersService.unban(id);
    return { statusCode: HttpStatus.OK, message: 'User unbanned', data: unbanned };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
    return { statusCode: HttpStatus.OK, message: 'User removed' };
  }
}
