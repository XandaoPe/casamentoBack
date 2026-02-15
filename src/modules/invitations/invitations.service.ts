// modules/invitations/invitations.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuestsService } from '../guests/guests.service';
import { Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer'; // ✅ APENAS ADICIONAR ESTA LINHA

@Injectable()
export class InvitationsService {
    private readonly logger = new Logger(InvitationsService.name);

    constructor(
        private readonly guestsService: GuestsService,
        private readonly configService: ConfigService,
        private readonly mailerService: MailerService, // ✅ APENAS ADICIONAR ESTA LINHA
    ) { }

    // ✅ SEU MÉTODO generateWhatsAppLink (INTACTO)
    async generateWhatsAppLink(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.telefone) {
            throw new BadRequestException('Convidado não possui telefone cadastrado');
        }

        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
        const inviteLink = `${frontendUrl}/invite/${guest.tokenUnico}`;

        // 🔥 ENCURTAR O LINK usando TinyURL
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

        return {
            guestName: guest.nome,
            inviteLink: inviteLink,
            shortLink: shortLink,
            whatsappUrl: whatsappUrl,
        };
    }

    // Função para encurtar link usando TinyURL
    async shortenUrl(url: string): Promise<string> {
        try {
            const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
            const shortUrl = await response.text();
            return shortUrl;
        } catch (error) {
            console.error('Erro ao encurtar link:', error);
            return url; // Se falhar, retorna o link original
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
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Convite de Casamento</title>
                </head>
                <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #d4af37; font-size: 32px;">💍 Convite de Casamento</h1>
                    </div>
                    
                    <div style="background-color: #f9f9f9; padding: 30px; border-radius: 10px;">
                        <h2 style="margin-top: 0; color: #333;">Olá, ${guest.nome}!</h2>
                        
                        <p style="font-size: 16px;">Temos o prazer de convidar você para celebrar nosso casamento!</p>
                        
                        <div style="background-color: #fff; padding: 20px; border-radius: 5px; margin: 20px 0;">
                            <h3 style="margin-top: 0; color: #d4af37;">📅 Informações do Evento</h3>
                            <p><strong>Data:</strong> 15 de Dezembro de 2024</p>
                            <p><strong>Horário:</strong> 19:00</p>
                            <p><strong>Local:</strong> Igreja do Evangelho Quadrangular</p>
                            <p><strong>Endereço:</strong> Rua Minas Gerais, 14-50 - Presidente Epitácio-SP</p>
                            <p><strong>Recepção:</strong> Espaço Planet - 20:30</p>
                        </div>
                        
                        <p style="font-size: 16px;">Clique no botão abaixo para acessar seu convite personalizado e confirmar sua presença:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${inviteLink}" 
                               style="display: inline-block; background-color: #d4af37; color: #fff; text-decoration: none; padding: 15px 40px; border-radius: 50px; font-weight: bold; font-size: 18px;">
                                🔗 ACESSAR MEU CONVITE
                            </a>
                        </div>
                        
                        <p style="font-size: 14px; color: #666;">Ou copie o link abaixo:</p>
                        <p style="background-color: #eee; padding: 10px; border-radius: 5px; word-break: break-all;">
                            <a href="${inviteLink}" style="color: #d4af37;">${inviteLink}</a>
                        </p>
                        
                        <p style="font-size: 14px; color: #666; margin-top: 20px;">
                            ⚠️ Este link é pessoal e intransferível. Não compartilhe com outras pessoas.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #999;">
                        <p>Aguardamos você para celebrar esse momento especial!</p>
                        <p>Com carinho,<br>Os Noivos</p>
                    </div>
                </body>
                </html>
            `,
            });

            await this.guestsService.update(guestId, {
                conviteEnviado: true,
                dataEnvioConvite: new Date(),
            });

            this.logger.log(`Email enviado com sucesso para: ${guest.email}`);

            return {
                message: 'Email enviado com sucesso',
                guestId: guest._id,
                email: guest.email,
                link: inviteLink
            };
        } catch (error) {
            this.logger.error(`Erro ao enviar email para ${guest.email}: ${error.message}`);
            throw new BadRequestException(`Falha ao enviar email: ${error.message}`);
        }
    }

    // ✅ SEUS MÉTODOS sendSmsInvitation e sendBulkInvitations (INTACTOS)
    async sendSmsInvitation(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.telefone) {
            throw new BadRequestException('Convidado não possui telefone cadastrado');
        }

        this.logger.log(`Simulando envio de SMS para ${guest.telefone} com token ${guest.tokenUnico}`);

        await this.guestsService.update(guestId, {
            conviteEnviado: true,
            dataEnvioConvite: new Date(),
        });

        return {
            message: 'SMS enviado com sucesso',
            guestId: guest._id,
            telefone: guest.telefone
        };
    }

    async sendBulkInvitations(guestIds: string[], method: 'email' | 'sms') {
        const results: Array<{
            message: string;
            guestId: Types.ObjectId;
            email?: string;
            telefone?: string;
        }> = [];

        const errors: Array<{
            guestId: string;
            error: any;
        }> = [];

        for (const guestId of guestIds) {
            try {
                if (method === 'email') {
                    const result = await this.sendEmailInvitation(guestId);
                    results.push(result);
                } else {
                    const result = await this.sendSmsInvitation(guestId);
                    results.push(result);
                }
            } catch (error) {
                errors.push({
                    guestId,
                    error: error.message
                });
            }
        }

        return {
            message: `Enviados ${results.length} convites com sucesso`,
            success: results.length,
            errors: errors.length,
            errorDetails: errors
        };
    }
}