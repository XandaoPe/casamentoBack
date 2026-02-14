// modules/invitations/invitations.controller.ts
import { Controller, Post, Param, UseGuards, Body } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('invitations')
@UseGuards(JwtAuthGuard)
export class InvitationsController {
    constructor(private readonly invitationsService: InvitationsService) { }

    @Post('email/:guestId')
    async sendEmailInvitation(@Param('guestId') guestId: string) {
        return this.invitationsService.sendEmailInvitation(guestId);
    }

    @Post('sms/:guestId')
    async sendSmsInvitation(@Param('guestId') guestId: string) {
        return this.invitationsService.sendSmsInvitation(guestId);
    }

    @Post('bulk')
    async sendBulkInvitations(@Body() body: { guestIds: string[]; method: 'email' | 'sms' }) {
        return this.invitationsService.sendBulkInvitations(body.guestIds, body.method);
    }
}