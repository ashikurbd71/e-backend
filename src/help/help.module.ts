import { Module } from '@nestjs/common';
import { HelpService } from './help.service';
import { HelpController } from './help.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Help } from './entities/help.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Help])],
  controllers: [HelpController],
  providers: [HelpService],
})
export class HelpModule {}
