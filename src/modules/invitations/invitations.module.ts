// modules/invitations/invitations.module.ts
import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { GuestsModule } from '../guests/guests.module';
import { InvitationsController } from './invitations.controller';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
    imports: [
        GuestsModule,
        MailerModule,
    ],
    controllers: [InvitationsController],
    providers: [InvitationsService],
    exports: [InvitationsService],
})
export class InvitationsModule { }