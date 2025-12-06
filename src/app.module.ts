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
import * as nodemailer from 'nodemailer';
import { NotificationsModule } from './notifications/notifications.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PrivecyPolicyModule } from './privecy-policy/privecy-policy.module';
import { TremsCondetionsModule } from './trems-condetions/trems-condetions.module';
import { RefundPolicyModule } from './refund-policy/refund-policy.module';

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

  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: 'MAILER_TRANSPORT',
      useFactory: async () => {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: +(process.env.SMTP_PORT ?? 587),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
        return transporter;
      },
    },
  ],
  exports: ['MAILER_TRANSPORT'],
})
export class AppModule {
  // ... existing code ...
}
