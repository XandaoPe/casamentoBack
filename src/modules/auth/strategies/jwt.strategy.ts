// modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    private readonly logger = new Logger(JwtStrategy.name);

    constructor(private configService: ConfigService) {
        const secret = configService.get<string>('JWT_SECRET');

        if (!secret) {
            throw new Error('JWT_SECRET não configurado no ambiente');
        }

        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: secret,
        });
    }

    async validate(payload: any) {
        this.logger.debug(`Validando payload: ${JSON.stringify(payload)}`);

        // Verificar se o payload tem as propriedades necessárias
        if (!payload || !payload.sub || !payload.username) {
            throw new UnauthorizedException('Token inválido');
        }

        return {
            userId: payload.sub,
            username: payload.username
        };
    }
}