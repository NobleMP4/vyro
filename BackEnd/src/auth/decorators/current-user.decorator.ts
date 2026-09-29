import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { AuthUser, RequestWithUser } from '../auth.types';

/** Injects the authenticated user ({ id, role }) into a route handler. */
export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();
  return request.user as AuthUser;
});
