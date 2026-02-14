import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
    imports: [
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule.registerAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
                const secret = configService.get<string>('JWT_SECRET');
                const expiresIn = configService.get<string>('JWT_EXPIRATION') || '7d';

                if (!secret) {
                    throw new Error('JWT_SECRET não configurado');
                }

                return {
                    secret: secret,
                    signOptions: {
                        // Fazemos o cast para 'any' ou para o formato esperado 
                        // para evitar o erro de atribuição do TypeScript
                        expiresIn: expiresIn as any,
                    },
                };
            },
            inject: [ConfigService],
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy],
    exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule { }