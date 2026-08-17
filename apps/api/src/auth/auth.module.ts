import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { JwtStrategy } from './jwt.strategy';
import { TokenVerifierService } from './token-verifier.service';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }), JwtModule.register({})],
  providers: [JwtStrategy, TokenVerifierService],
  exports: [PassportModule, TokenVerifierService],
})
export class AuthModule {}
