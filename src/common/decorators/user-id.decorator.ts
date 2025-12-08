import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator to extract userId from request object (from JWT token).
 * Usage: @UserId() userId: number
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): number => {
    const request = ctx.switchToHttp().getRequest();
    const userId = request.user?.userId || request.user?.sub;
    if (!userId) {
      throw new Error('User ID not found in the request context.');
    }
    return userId;
  },
);

