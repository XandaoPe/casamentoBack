// modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(
        context: ExecutionContext,
    ): boolean | Promise<boolean> | Observable<boolean> {
        // Verifica se a rota ou a classe tem o decorator @Public()
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        // Se não for pública, segue a validação padrão do JWT
        return super.canActivate(context);
    }

    handleRequest(err: any, user: any, info: any) {
        // Se houver erro ou o usuário não for encontrado (e não for rota pública)
        if (err || !user) {
            throw err || new UnauthorizedException('Token inválido ou expirado');
        }
        return user;
    }
}