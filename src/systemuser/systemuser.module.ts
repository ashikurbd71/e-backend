import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemUser } from './entities/systemuser.entity';
import { SystemuserController } from './systemuser.controller';
import { SystemuserService } from './systemuser.service';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { CompanyIdService } from '../common/services/company-id.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemUser]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'change-me-in-prod',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [SystemuserController],
  providers: [SystemuserService, JwtStrategy, CompanyIdService],
  exports: [JwtModule, PassportModule, CompanyIdService],
})
export class SystemuserModule {}
