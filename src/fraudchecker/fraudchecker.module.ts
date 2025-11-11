import { Module } from '@nestjs/common';
import { FraudcheckerService } from './fraudchecker.service';
import { FraudcheckerController } from './fraudchecker.controller';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [FraudcheckerController],
  providers: [FraudcheckerService],
})
export class FraudcheckerModule {}
