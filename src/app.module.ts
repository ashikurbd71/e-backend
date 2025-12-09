import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './products/products.module';
import { InventoryModule } from './inventory/inventory.module';
import { OrdersModule } from './orders/orders.module';
import { UsersModule } from './users/users.module';
import { OrdersitemModule } from './ordersitem/ordersitem.module';
import { PaymentsModule } from './payments/payments.module';
import { Global } from '@nestjs/common';

import { FraudcheckerModule } from './fraudchecker/fraudchecker.module';
// removed: import { DeliveryaddressModule } from './deliveryaddress/deliveryaddress.module';
import { CartproductsModule } from './cartproducts/cartproducts.module';
import { BannerModule } from './banner/banner.module';
import { PromocodeModule } from './promocode/promocode.module';
import { SettingModule } from './setting/setting.module';
import { HelpModule } from './help/help.module';
import { SystemuserModule } from './systemuser/systemuser.module';
import { EarningsModule } from './earnings/earnings.module';
import { OverviewModule } from './overview/overview.module';
import { Resend } from 'resend';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrivecyPolicyModule } from './privecy-policy/privecy-policy.module';
import { TremsCondetionsModule } from './trems-condetions/trems-condetions.module';
import { RefundPolicyModule } from './refund-policy/refund-policy.module';
import { ReviewsModule } from './reviews/reviews.module';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      synchronize: true,
      logging: true,
      ssl: {
        rejectUnauthorized: false,
      },
      autoLoadEntities: true,
    }),

    CategoryModule,

    ProductModule,

    InventoryModule,

    OrdersModule,

    UsersModule,

    OrdersitemModule,

    PaymentsModule,



    FraudcheckerModule,

    // removed DeliveryaddressModule,
    CartproductsModule,

    BannerModule,

    PromocodeModule,

    SettingModule,

    HelpModule,

    SystemuserModule,
    EarningsModule,
    OverviewModule,
    NotificationsModule,
    DashboardModule,
    PrivecyPolicyModule,
    TremsCondetionsModule,
    RefundPolicyModule,
    ReviewsModule,

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'MAILER_TRANSPORT',
      useFactory: async () => {
        const apiKey = 're_1234567890';
        if (!apiKey) {
          throw new Error('RESEND_API_KEY is not configured');
        }

        const resend = new Resend(apiKey);
        const defaultFrom = 'ashikurovi2003@gmail.com';

        return {
          // Minimal nodemailer-compatible surface used by the app.
          async sendMail(message: {
            from?: string;
            to: string | string[];
            subject: string;
            text?: string;
            html?: string;
            attachments?: Array<{ filename: string; content: Buffer | string }>;
          }) {
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

            const { data, error } = await resend.emails.send(sendOptions as any);
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
export class AppModule {
  // ... existing code ...
}
