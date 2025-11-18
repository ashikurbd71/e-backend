import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UsersModule } from 'src/users/users.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}

