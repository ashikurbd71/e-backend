import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { UsersModule } from '../users/users.module';
import { HttpModule } from '@nestjs/axios';
import { RequestContextService } from '../common/services/request-context.service';

@Module({
  imports: [HttpModule, UsersModule],
  controllers: [NotificationsController],
  providers: [NotificationsService, RequestContextService],
})
export class NotificationsModule {}

