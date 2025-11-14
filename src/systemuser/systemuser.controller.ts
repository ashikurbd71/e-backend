import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SystemuserService } from './systemuser.service';
import { CreateSystemuserDto } from './dto/create-systemuser.dto';
import { UpdateSystemuserDto } from './dto/update-systemuser.dto';
import { LoginDto } from './dto/login.dto';


@Controller('systemuser')
export class SystemuserController {
  constructor(private readonly systemuserService: SystemuserService) {}

  @Post()
  create(@Body() createSystemuserDto: CreateSystemuserDto) {
    return this.systemuserService.create(createSystemuserDto);
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.systemuserService.login(dto);
  }

  @Get()
  findAll() {
    return this.systemuserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.systemuserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSystemuserDto: UpdateSystemuserDto) {
    return this.systemuserService.update(+id, updateSystemuserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.systemuserService.remove(+id);
  }
}
