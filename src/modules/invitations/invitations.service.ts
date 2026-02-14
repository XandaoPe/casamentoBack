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
        // 1. Busca o convidado no banco
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.telefone) {
            throw new BadRequestException('Convidado não possui telefone cadastrado');
        }

        // 2. Monta o link do seu Frontend (onde o convidado vai confirmar)
        const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:5173';
        const inviteLink = `${frontendUrl}/invite/${guest.tokenUnico}`; // Ajuste a rota conforme seu frontend

        // 3. Limpa o telefone (mantém apenas números)
        const phoneClean = guest.telefone.replace(/\D/g, '');

        // 4. Cria a mensagem personalizada
        const mensagem = encodeURIComponent(
            `Olá, *${guest.nome}*! 🥂\n\n` +
            `Preparamos um convite especial para o nosso casamento. ` +
            `Por favor, acesse o link abaixo para visualizar os detalhes e confirmar sua presença:\n\n` +
            `👉 ${inviteLink}\n\n` +
            `Ficaremos muito felizes com sua presença! 🎉`
        );

        // 5. Gera o link final do WhatsApp
        const whatsappUrl = `https://wa.me/${phoneClean}?text=${mensagem}`;

        // 6. Atualiza o status no banco (opcional, para controle do admin)
        await this.guestsService.update(guestId, {
            conviteEnviado: true,
            dataEnvioConvite: new Date(),
        });

        this.logger.log(`Link de WhatsApp gerado para: ${guest.nome}`);

        return {
            guestName: guest.nome,
            phone: phoneClean,
            inviteLink: inviteLink,
            whatsappUrl: whatsappUrl, // Este é o link que o frontend deve abrir
            message: 'Link do WhatsApp gerado com sucesso! Clique para enviar ao convidado.'
        };
    }

    async sendEmailInvitation(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.email) {
            throw new BadRequestException('Convidado não possui email cadastrado');
        }

        const inviteLink = `${this.configService.get('FRONTEND_URL')}/invite/${guest.tokenUnico}`;

        // ✅ AGORA USA O MAILER SERVICE REAL
        try {
            await this.mailerService.sendMail({
                to: guest.email,
                subject: 'Convite de Casamento - Confirme sua presença! 💍',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h1 style="color: #d4af37;">Olá, ${guest.nome}!</h1>
                        <p>Você foi convidado para o nosso casamento!</p>
                        <p>Confirme sua presença clicando no link abaixo:</p>
                        <a href="${inviteLink}" style="display: inline-block; background-color: #d4af37; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmar Presença</a>
                    </div>
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
                email: guest.email
            };
        } catch (error) {
            this.logger.error(`Erro ao enviar email: ${error.message}`);
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