import { Injectable, UnauthorizedException, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService implements OnModuleInit {
    // Objeto mockado
    private adminCredentials = {
        id: '1',
        username: 'admin',
        password: '', // Vamos preencher ao iniciar
    };

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    // Este método roda assim que o módulo inicia
    async onModuleInit() {
        // Gera o hash automaticamente para garantir compatibilidade total
        this.adminCredentials.password = await bcrypt.hash('admin123', 10);
        console.log('✅ Hash do Admin gerado e pronto para uso.');
    }

    async validateAdmin(username: string, password: string): Promise<any> {
        console.log(`Verificando: ${username} | Pass: ${password}`);

        if (username === this.adminCredentials.username) {
            // Compara a senha enviada com o hash gerado no onModuleInit
            const isValid = await bcrypt.compare(password, this.adminCredentials.password);

            if (isValid) {
                const { password: _, ...result } = this.adminCredentials;
                return result;
            }
        }
        return null;
    }

    async login(username: string, password: string) {
        const admin = await this.validateAdmin(username, password);

        if (!admin) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const payload = {
            username: admin.username,
            sub: admin.id
        };

        return {
            access_token: this.jwtService.sign(payload),
            expires_in: this.configService.get('JWT_EXPIRATION') || '3600',
            user: {
                username: admin.username,
                id: admin.id
            }
        };
    }
}