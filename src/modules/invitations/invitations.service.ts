import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuestsService } from '../guests/guests.service';
import { Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';

// ✅ ADICIONADO 'export' para que o Controller possa enxergar esses tipos
export interface BulkResult {
    message: string;
    guestId: string | Types.ObjectId;
}

export interface BulkError {
    guestId: string;
    error: string;
}

@Injectable()
export class InvitationsService {
    private readonly logger = new Logger(InvitationsService.name);

    constructor(
        private readonly guestsService: GuestsService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService,
    ) { }

    async generateWhatsAppLink(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.telefone) {
            throw new BadRequestException('Convidado não possui telefone cadastrado');
        }

        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/invite/${guest.tokenUnico}`;

        const shortLink = await this.shortenUrl(inviteLink);
        const phoneClean = guest.telefone.replace(/\D/g, '');

        const mensagem =
            `🎉 CONVITE DE CASAMENTO 🎉

Olá ${guest.nome}! Tudo bem?

👉 ACESSE SEU CONVITE AQUI:
${shortLink}

📍 Igreja: 19:00
🎉 Recepção: 20:30

Te esperamos! 🥂`;

        const mensagemCodificada = encodeURIComponent(mensagem);
        const whatsappUrl = `https://wa.me/${phoneClean}?text=${mensagemCodificada}`;

        // Atualiza o status no banco de dados ao gerar o link
        await this.guestsService.update(guestId, {
            conviteEnviado: true,
            dataEnvioConvite: new Date(),
        });

        this.logger.log(`Link de WhatsApp gerado e status atualizado para: ${guest.nome}`);

        return {
            guestName: guest.nome,
            inviteLink: inviteLink,
            shortLink: shortLink,
            whatsappUrl: whatsappUrl,
        };
    }

    async shortenUrl(url: string): Promise<string> {
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = await response.text();
            return shortUrl;
        } catch (error) {
            this.logger.error('Erro ao encurtar link:', error);
            return url;
        }
    }

    async sendEmailInvitation(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.email) {
            throw new BadRequestException('Convidado não possui email cadastrado');
        }

        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3001';
        const inviteLink = `${frontendUrl}/invite/${guest.tokenUnico}`;

        try {
            await this.mailerService.sendMail({
                to: guest.email,
                subject: '💍 Convite de Casamento - Confirme sua presença!',
                html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <title>Convite de Casamento</title>
                </head>
                <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center;">
                        <h1 style="color: #d4af37;">💍 Convite de Casamento</h1>
                    </div>
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
                        <h2>Olá, ${guest.nome}!</h2>
                        <p>Temos o prazer de convidar você para celebrar nosso casamento!</p>
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteLink}" style="background-color: #d4af37; color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold;">🔗 ACESSAR MEU CONVITE</a>
                        </div>
                    </div>
                </body>
                </html>`,
            });

            await this.guestsService.update(guestId, {
                conviteEnviado: true,
                dataEnvioConvite: new Date(),
            });

            return { message: 'Email enviado com sucesso', guestId: guest._id };
        } catch (error: any) {
            throw new BadRequestException(`Falha ao enviar email: ${error.message}`);
        }
    }

    async sendSmsInvitation(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);
        if (!guest.telefone) throw new BadRequestException('Sem telefone');

        await this.guestsService.update(guestId, {
            conviteEnviado: true,
            dataEnvioConvite: new Date(),
        });

        return { message: 'SMS enviado com sucesso', guestId: guest._id };
    }

    async sendBulkInvitations(guestIds: string[], method: 'email' | 'sms') {
        const results: BulkResult[] = [];
        const errors: BulkError[] = [];

        for (const guestId of guestIds) {
            try {
                const res = method === 'email'
                    ? await this.sendEmailInvitation(guestId)
                    : await this.sendSmsInvitation(guestId);

                results.push(res);
            } catch (error: any) {
                errors.push({
                    guestId,
                    error: error.message || 'Erro desconhecido'
                });
            }
        }

        return {
            success: results.length,
            errors: errors.length,
            errorDetails: errors
        };
    }
}