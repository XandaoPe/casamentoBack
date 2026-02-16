// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { GuestsModule } from './modules/guests/guests.module';
import { AuthModule } from './modules/auth/auth.module';
import { InvitationsModule } from './modules/invitations/invitations.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { GiftsModule } from './modules/gifts/gifts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    // Configuração corrigida do ThrottlerModule
    ThrottlerModule.forRoot([{
      ttl: 60000, // 60 segundos em milissegundos
      limit: 100, // 100 requisições
    }]),

    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get('EMAIL_HOST'),
          port: configService.get('MAIL_PORT'),
          secure: false, // true para 465, false para outras portas como 587
          auth: {
            user: configService.get('MAIL_USER'),
            pass: configService.get('MAIL_PASS'),
          },
        },
        defaults: {
          from: configService.get('MAIL_FROM'),
        },
      }),
      inject: [ConfigService],
    }),

    GuestsModule,
    AuthModule,
    InvitationsModule,
    GiftsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }