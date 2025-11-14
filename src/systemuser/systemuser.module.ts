import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Systemuser } from './entities/systemuser.entity';
import { SystemuserController } from './systemuser.controller';
import { SystemuserService } from './systemuser.service';

@Module({
  imports: [TypeOrmModule.forFeature([Systemuser])],
  controllers: [SystemuserController],
  providers: [SystemuserService],
})
export class SystemuserModule {}
