import { Inject, Injectable, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { BroadcastEmailDto } from './dto/broadcast-email.dto';
import { BroadcastSmsDto } from './dto/broadcast-sms.dto';
import { User } from '../users/entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RequestContextService } from '../common/services/request-context.service';

type NotificationChannel = 'email' | 'sms';

@Injectable()
export class NotificationsService {
    constructor(
        private readonly usersService: UsersService,
        @Inject('MAILER_TRANSPORT')
        private readonly mailer: { sendMail: (message: unknown) => Promise<{ id?: string }> },
        private readonly httpService: HttpService,
        private readonly requestContextService: RequestContextService,
    ) { }

    async sendEmailToCustomers(dto: BroadcastEmailDto) {
        const companyId = this.requestContextService.getCompanyId();
        const recipients = (
            await this.usersService.findCustomers(companyId, {
                ids: dto.customerIds,
            })
        ).filter((user) => !!user.email);

        if (!recipients.length) {
            throw new NotFoundException('No customers with a valid email address were found');
        }

        const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER;

        const results = await Promise.allSettled(
            recipients.map((user) => {
                const personalizedBody = dto.body.replace(/{{\s*name\s*}}/gi, user.name ?? 'there');
                return this.mailer.sendMail({
                    from: fromAddress,
                    to: user.email,
                    subject: dto.subject,
                    text: personalizedBody,
                    html: dto.html,
                });
            }),
        );

        return this.buildSummary('email', recipients, results);
    }

    async sendSmsToCustomers(dto: BroadcastSmsDto) {
        const companyId = this.requestContextService.getCompanyId();
        const recipients = (await this.usersService.findCustomers(companyId)).filter((user) => !!user.phone);

        if (!recipients.length) {
            throw new NotFoundException('No customers with a phone number were found');
        }

        const config = this.getSmsConfig();

        const results = await Promise.allSettled(
            recipients.map((user) => this.dispatchSms(config, user.phone as string, dto.message)),
        );

        return this.buildSummary('sms', recipients, results);
    }

    private buildSummary(
        channel: NotificationChannel,
        recipients: User[],
        results: PromiseSettledResult<unknown>[],
    ) {
        const failed: Array<{ userId: number; contact?: string; reason: string }> = [];

        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                failed.push({
                    userId: recipients[index].id,
                    contact: channel === 'email' ? recipients[index].email : recipients[index].phone,
                    reason: result.reason?.message ?? 'Unknown error',
                });
            }
        });

        return {
            channel,
            totalRecipients: recipients.length,
            delivered: recipients.length - failed.length,
            failed: failed.length,
            failedRecipients: failed,
        };
    }

    private getSmsConfig() {
        const apiUrl = process.env.SMS_API_URL;
        const apiKey = process.env.SMS_API_KEY;
        const senderId = process.env.SMS_SENDER_ID ?? 'ECOMM';

        if (!apiUrl || !apiKey) {
            throw new ServiceUnavailableException('SMS provider is not configured');
        }

        return { apiUrl, apiKey, senderId };
    }

    private async dispatchSms(
        config: { apiUrl: string; apiKey: string; senderId: string },
        to: string,
        message: string,
    ) {
        await firstValueFrom(
            this.httpService.post(
                config.apiUrl,
                {
                    to,
                    message,
                    senderId: config.senderId,
                },
                {
                    headers: {
                        Authorization: `Bearer ${config.apiKey}`,
                    },
                },
            ),
        );
    }
}

