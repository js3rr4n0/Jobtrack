import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';

import { AuthenticatedUser } from '../auth/authenticated-user';
import { ApplicationConfig, CONFIG_TOKEN } from '../config/environment';

const CLOSED = 'El panel de administración no está disponible.';

/**
 * Deja pasar únicamente a la cuenta declarada en `ADMIN_EMAIL`. Sin esa
 * variable el panel queda cerrado para todos, incluido quien tenga sesión
 * válida: un panel que se abre solo por olvidar una variable no es un panel.
 *
 * La comparación ignora mayúsculas y espacios, que es como se comportan los
 * proveedores de correo, pero exige coincidencia exacta del resto.
 */
@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@Inject(CONFIG_TOKEN) private readonly config: ApplicationConfig) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.config.adminEmail) {
      throw new ForbiddenException(CLOSED);
    }

    const request = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    const email = request.user?.email?.trim().toLowerCase();

    if (!email || email !== this.config.adminEmail) {
      throw new ForbiddenException(CLOSED);
    }

    return true;
  }
}
