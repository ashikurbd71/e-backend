import { HttpStatus } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { BroadcastEmailDto } from './dto/broadcast-email.dto';
import { BroadcastSmsDto } from './dto/broadcast-sms.dto';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    broadcastEmail(dto: BroadcastEmailDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            channel: "email" | "sms";
            totalRecipients: number;
            delivered: number;
            failed: number;
            failedRecipients: {
                userId: number;
                contact?: string;
                reason: string;
            }[];
        };
    }>;
    broadcastSms(dto: BroadcastSmsDto): Promise<{
        statusCode: HttpStatus;
        message: string;
        data: {
            channel: "email" | "sms";
            totalRecipients: number;
            delivered: number;
            failed: number;
            failedRecipients: {
                userId: number;
                contact?: string;
                reason: string;
            }[];
        };
    }>;
}
