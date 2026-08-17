import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { AuthenticatedUser } from './authenticated-user';

/** Inyecta en el controlador el usuario resuelto por `JwtAuthGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<{ user: AuthenticatedUser }>();
    return request.user;
  },
);
