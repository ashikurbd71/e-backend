import { PartialType } from '@nestjs/mapped-types';
import { CreateOrdersitemDto } from './create-ordersitem.dto';

export class UpdateOrdersitemDto extends PartialType(CreateOrdersitemDto) {}
