"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const typeorm_1 = require("@nestjs/typeorm");
const config_1 = require("@nestjs/config");
const category_module_1 = require("./category/category.module");
const products_module_1 = require("./products/products.module");
const inventory_module_1 = require("./inventory/inventory.module");
const orders_module_1 = require("./orders/orders.module");
const users_module_1 = require("./users/users.module");
const ordersitem_module_1 = require("./ordersitem/ordersitem.module");
const payments_module_1 = require("./payments/payments.module");
const common_2 = require("@nestjs/common");
const fraudchecker_module_1 = require("./fraudchecker/fraudchecker.module");
const cartproducts_module_1 = require("./cartproducts/cartproducts.module");
const banner_module_1 = require("./banner/banner.module");
const promocode_module_1 = require("./promocode/promocode.module");
const setting_module_1 = require("./setting/setting.module");
const help_module_1 = require("./help/help.module");
const systemuser_module_1 = require("./systemuser/systemuser.module");
const earnings_module_1 = require("./earnings/earnings.module");
const overview_module_1 = require("./overview/overview.module");
const resend_1 = require("resend");
const notifications_module_1 = require("./notifications/notifications.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const privecy_policy_module_1 = require("./privecy-policy/privecy-policy.module");
const trems_condetions_module_1 = require("./trems-condetions/trems-condetions.module");
const refund_policy_module_1 = require("./refund-policy/refund-policy.module");
const reviews_module_1 = require("./reviews/reviews.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_2.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRoot({
                type: 'postgres',
                url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_JlI1h9YCKmjb@ep-proud-hall-a4mak280-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
                synchronize: true,
                logging: true,
                ssl: {
                    rejectUnauthorized: false,
                },
                autoLoadEntities: true,
            }),
            category_module_1.CategoryModule,
            products_module_1.ProductModule,
            inventory_module_1.InventoryModule,
            orders_module_1.OrdersModule,
            users_module_1.UsersModule,
            ordersitem_module_1.OrdersitemModule,
            payments_module_1.PaymentsModule,
            fraudchecker_module_1.FraudcheckerModule,
            cartproducts_module_1.CartproductsModule,
            banner_module_1.BannerModule,
            promocode_module_1.PromocodeModule,
            setting_module_1.SettingModule,
            help_module_1.HelpModule,
            systemuser_module_1.SystemuserModule,
            earnings_module_1.EarningsModule,
            overview_module_1.OverviewModule,
            notifications_module_1.NotificationsModule,
            dashboard_module_1.DashboardModule,
            privecy_policy_module_1.PrivecyPolicyModule,
            trems_condetions_module_1.TremsCondetionsModule,
            refund_policy_module_1.RefundPolicyModule,
            reviews_module_1.ReviewsModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: 'MAILER_TRANSPORT',
                useFactory: async () => {
                    const apiKey = 're_1234567890';
                    if (!apiKey) {
                        throw new Error('RESEND_API_KEY is not configured');
                    }
                    const resend = new resend_1.Resend(apiKey);
                    const defaultFrom = 'ashikurovi2003@gmail.com';
                    return {
                        async sendMail(message) {
                            const to = Array.isArray(message.to) ? message.to : [message.to];
                            const from = message.from ?? defaultFrom;
                            if (!from) {
                                throw new Error('No from address configured for Resend email');
                            }
                            const sendOptions = {
                                from,
                                to,
                                subject: message.subject,
                                text: message.text ?? undefined,
                                html: message.html ?? undefined,
                                attachments: message.attachments?.map((att) => ({
                                    filename: att.filename,
                                    content: att.content,
                                })),
                                headers: {
                                    'X-Priority': '1 (Highest)',
                                    'X-MSMail-Priority': 'High',
                                    Importance: 'High',
                                },
                            };
                            const { data, error } = await resend.emails.send(sendOptions);
                            if (error) {
                                throw new Error(error.message ?? 'Failed to send email via Resend');
                            }
                            return { id: data?.id };
                        },
                    };
                },
            },
        ],
        exports: ['MAILER_TRANSPORT'],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map