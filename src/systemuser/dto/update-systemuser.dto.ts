import { PartialType } from '@nestjs/mapped-types';
import { CreateSystemuserDto } from './create-systemuser.dto';

export class UpdateSystemuserDto extends PartialType(CreateSystemuserDto) {}
