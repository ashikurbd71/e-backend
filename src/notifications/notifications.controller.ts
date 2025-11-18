import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BroadcastEmailDto } from './dto/broadcast-email.dto';
import { BroadcastSmsDto } from './dto/broadcast-sms.dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('email/customers')
  @HttpCode(HttpStatus.ACCEPTED)
  async broadcastEmail(@Body() dto: BroadcastEmailDto) {
    const summary = await this.notificationsService.sendEmailToCustomers(dto);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Customer email broadcast triggered',
      data: summary,
    };
  }

  @Post('sms/customers')
  @HttpCode(HttpStatus.ACCEPTED)
  async broadcastSms(@Body() dto: BroadcastSmsDto) {
    const summary = await this.notificationsService.sendSmsToCustomers(dto);
    return {
      statusCode: HttpStatus.ACCEPTED,
      message: 'Customer SMS broadcast triggered',
      data: summary,
    };
  }
}

