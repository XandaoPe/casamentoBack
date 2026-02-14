// modules/invitations/invitations.service.ts
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GuestsService } from '../guests/guests.service';
import { Types } from 'mongoose';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class InvitationsService {
    private readonly logger = new Logger(InvitationsService.name);

    constructor(
        private readonly mailerService: MailerService,
        private readonly guestsService: GuestsService,
        private readonly configService: ConfigService,
    ) { }

    async sendEmailInvitation(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.email) {
            throw new BadRequestException('Convidado não possui email cadastrado');
        }

        // Link para o frontend (ajuste conforme sua necessidade)
        const inviteLink = `${this.configService.get('FRONTEND_URL')}/convite/${guest.tokenUnico}`;

        try {
            await this.mailerService.sendMail({
                to: guest.email,
                subject: 'Você foi convidado para o nosso casamento! 🥂',
                html: `
                    <div style="font-family: sans-serif; max-width: 600px;">
                        <h1>Olá, ${guest.nome}!</h1>
                        <p>Temos o prazer de convidar você para celebrar nosso casamento.</p>
                        <p>Para confirmar sua presença, por favor clique no link abaixo:</p>
                        <a href="${inviteLink}" style="padding: 10px 20px; background-color: #d4af37; color: white; text-decoration: none; border-radius: 5px;">
                            Confirmar Presença
                        </a>
                        <p>Ou copie o link: ${inviteLink}</p>
                        <br>
                        <p>Esperamos por você!</p>
                    </div>
                `,
            });

            await this.guestsService.update(guestId, {
                conviteEnviado: true,
                dataEnvioConvite: new Date(),
            });

            return { message: 'Email enviado com sucesso', guestId: guest._id };
        } catch (error) {
            this.logger.error(`Erro ao enviar email: ${error.message}`);
            throw new BadRequestException('Falha ao disparar o e-mail. Verifique as credenciais SMTP.');
        }
    }

    async sendSmsInvitation(guestId: string) {
        const guest = await this.guestsService.findOne(guestId);

        if (!guest.telefone) {
            throw new BadRequestException('Convidado não possui telefone cadastrado');
        }

        this.logger.log(`Enviando SMS para ${guest.telefone} com token ${guest.tokenUnico}`);

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
        // Tipando explicitamente os arrays
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