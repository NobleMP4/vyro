import { UserRole } from '@prisma/client';

/** The authenticated caller, attached to the request by JwtAuthGuard. */
export interface AuthUser {
  id: string;
  role: UserRole;
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
}

export interface RequestWithUser {
  user?: AuthUser;
}
