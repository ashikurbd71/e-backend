"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const request_context_service_1 = require("../common/services/request-context.service");
let NotificationsService = class NotificationsService {
    usersService;
    mailer;
    httpService;
    requestContextService;
    constructor(usersService, mailer, httpService, requestContextService) {
        this.usersService = usersService;
        this.mailer = mailer;
        this.httpService = httpService;
        this.requestContextService = requestContextService;
    }
    async sendEmailToCustomers(dto) {
        const companyId = this.requestContextService.getCompanyId();
        const recipients = (await this.usersService.findCustomers(companyId, {
            ids: dto.customerIds,
        })).filter((user) => !!user.email);
        if (!recipients.length) {
            throw new common_1.NotFoundException('No customers with a valid email address were found');
        }
        const fromAddress = process.env.SMTP_FROM ?? process.env.SMTP_USER;
        const results = await Promise.allSettled(recipients.map((user) => {
            const personalizedBody = dto.body.replace(/{{\s*name\s*}}/gi, user.name ?? 'there');
            return this.mailer.sendMail({
                from: fromAddress,
                to: user.email,
                subject: dto.subject,
                text: personalizedBody,
                html: dto.html,
            });
        }));
        return this.buildSummary('email', recipients, results);
    }
    async sendSmsToCustomers(dto) {
        const companyId = this.requestContextService.getCompanyId();
        const recipients = (await this.usersService.findCustomers(companyId)).filter((user) => !!user.phone);
        if (!recipients.length) {
            throw new common_1.NotFoundException('No customers with a phone number were found');
        }
        const config = this.getSmsConfig();
        const results = await Promise.allSettled(recipients.map((user) => this.dispatchSms(config, user.phone, dto.message)));
        return this.buildSummary('sms', recipients, results);
    }
    buildSummary(channel, recipients, results) {
        const failed = [];
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
    getSmsConfig() {
        const apiUrl = process.env.SMS_API_URL;
        const apiKey = process.env.SMS_API_KEY;
        const senderId = process.env.SMS_SENDER_ID ?? 'ECOMM';
        if (!apiUrl || !apiKey) {
            throw new common_1.ServiceUnavailableException('SMS provider is not configured');
        }
        return { apiUrl, apiKey, senderId };
    }
    async dispatchSms(config, to, message) {
        await (0, rxjs_1.firstValueFrom)(this.httpService.post(config.apiUrl, {
            to,
            message,
            senderId: config.senderId,
        }, {
            headers: {
                Authorization: `Bearer ${config.apiKey}`,
            },
        }));
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('MAILER_TRANSPORT')),
    __metadata("design:paramtypes", [users_service_1.UsersService, Object, axios_1.HttpService,
        request_context_service_1.RequestContextService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map