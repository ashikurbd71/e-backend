import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class CompanyIdGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
