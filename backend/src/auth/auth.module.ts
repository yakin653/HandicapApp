import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../user/user.entity';
import { EmailModule } from '../email/email.module';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    // ✅ Module pour l'entité User
    TypeOrmModule.forFeature([User]),
    
    // ✅ Module Email
    EmailModule,
    
    // ✅ Module Passport
    PassportModule,
    
    // ✅ Module JWT
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}