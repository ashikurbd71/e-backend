import { UsersService } from 'src/users/users.service';
import { BroadcastEmailDto } from './dto/broadcast-email.dto';
import { BroadcastSmsDto } from './dto/broadcast-sms.dto';
import { HttpService } from '@nestjs/axios';
import { RequestContextService } from 'src/common/services/request-context.service';
type NotificationChannel = 'email' | 'sms';
export declare class NotificationsService {
    private readonly usersService;
    private readonly mailer;
    private readonly httpService;
    private readonly requestContextService;
    constructor(usersService: UsersService, mailer: {
        sendMail: (message: unknown) => Promise<{
            id?: string;
        }>;
    }, httpService: HttpService, requestContextService: RequestContextService);
    sendEmailToCustomers(dto: BroadcastEmailDto): Promise<{
        channel: NotificationChannel;
        totalRecipients: number;
        delivered: number;
        failed: number;
        failedRecipients: {
            userId: number;
            contact?: string;
            reason: string;
        }[];
    }>;
    sendSmsToCustomers(dto: BroadcastSmsDto): Promise<{
        channel: NotificationChannel;
        totalRecipients: number;
        delivered: number;
        failed: number;
        failedRecipients: {
            userId: number;
            contact?: string;
            reason: string;
        }[];
    }>;
    private buildSummary;
    private getSmsConfig;
    private dispatchSms;
}
export {};
