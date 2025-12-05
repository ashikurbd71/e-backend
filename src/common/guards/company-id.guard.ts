import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';

/**
 * Guard that extracts companyId from JWT and injects it into the request object.
 * This ensures that req.companyId is available for all subsequent service calls.
 */
@Injectable()
export class CompanyIdGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        if (!user.companyId) {
            throw new UnauthorizedException('CompanyId not found in token');
        }

        // Inject companyId into request object for easy access in services
        request.companyId = user.companyId;

        return true;
    }
}

