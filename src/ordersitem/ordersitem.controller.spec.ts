import { Test, TestingModule } from '@nestjs/testing';
import { OrdersitemController } from './ordersitem.controller';
import { OrdersitemService } from './ordersitem.service';

describe('OrdersitemController', () => {
  let controller: OrdersitemController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersitemController],
      providers: [OrdersitemService],
    }).compile();

    controller = module.get<OrdersitemController>(OrdersitemController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
