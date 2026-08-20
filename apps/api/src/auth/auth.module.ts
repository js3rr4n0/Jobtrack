import { Module } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { OptionalJwtGuard } from './optional-jwt.guard';
import { KEY_SET_FACTORY, TokenVerifierService, defaultKeySetFactory } from './token-verifier.service';

@Module({
  providers: [
    TokenVerifierService,
    JwtAuthGuard,
    OptionalJwtGuard,
    { provide: KEY_SET_FACTORY, useValue: defaultKeySetFactory },
  ],
  exports: [TokenVerifierService, JwtAuthGuard, OptionalJwtGuard],
})
export class AuthModule {}
