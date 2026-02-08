import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MailerModule } from '@nestjs-modules/mailer';
import { AuthModule } from './auth/auth.module';
import { User } from './user/user.entity';
import { ComponentModule } from './component/component.module';
import { UserModule } from './user/user.module';
import { Component } from './component/component.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'root',
      database: 'mecalens_db',
      entities: [User, Component],
      synchronize: true,
       logging: true, 
    }),
    
    // ✅ Configuration Mailer
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Ou un autre service
        port: 587,
        secure: false, // true pour 465, false pour autres ports
        auth: {
          user: 'deontae.mckenzie@ethereal.email', // Remplacez par votre email
          pass: 'votre-mot-de-passe-app', // Mot de passe d'application Gmail
        },
      },
      defaults: {
        from: '"MecaLens" <votre-email@gmail.com>',
      },
    }),
    
    AuthModule,
    ComponentModule, 
    UserModule,
  ],
})
export class AppModule {}