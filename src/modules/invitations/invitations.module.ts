// modules/invitations/invitations.module.ts
import { Module } from '@nestjs/common';
import { InvitationsService } from './invitations.service';
import { GuestsModule } from '../guests/guests.module';
import { InvitationsController } from './invitations.controller';

@Module({
    imports: [GuestsModule],
    controllers: [InvitationsController],
    providers: [InvitationsService],
    exports: [InvitationsService],
})
export class InvitationsModule { }