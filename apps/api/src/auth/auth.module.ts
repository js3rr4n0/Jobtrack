import { Module } from '@nestjs/common';

import { JwtAuthGuard } from './jwt-auth.guard';
import { KEY_SET_FACTORY, TokenVerifierService, defaultKeySetFactory } from './token-verifier.service';

@Module({
  providers: [
    TokenVerifierService,
    JwtAuthGuard,
    { provide: KEY_SET_FACTORY, useValue: defaultKeySetFactory },
  ],
  exports: [TokenVerifierService, JwtAuthGuard],
})
export class AuthModule {}
