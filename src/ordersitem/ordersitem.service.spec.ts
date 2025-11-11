import { Test, TestingModule } from '@nestjs/testing';
import { OrdersitemService } from './ordersitem.service';

describe('OrdersitemService', () => {
  let service: OrdersitemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersitemService],
    }).compile();

    service = module.get<OrdersitemService>(OrdersitemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
