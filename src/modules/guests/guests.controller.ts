// modules/guests/guests.controller.ts (trecho corrigido)
import {
    Controller, Get, Post, Body, Put, Delete, Param,
    UseGuards, Req, Ip, Headers, Query, HttpCode, HttpStatus
} from '@nestjs/common';
import { GuestsService } from './guests.service';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { ConfirmPresenceDto } from './dto/confirm-presence.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { GuestDocument } from './schemas/guest.schema';

@Controller('guests')
export class GuestsController {
    constructor(private readonly guestsService: GuestsService) { }

    @Public()
    @Get('invite/:token')
    async getByToken(@Param('token') token: string): Promise<GuestDocument> {
        return this.guestsService.findByToken(token);
    }

    @Public()
    @Throttle({ default: { limit: 5, ttl: 60000 } })
    @Post('confirm/:token')
    @HttpCode(HttpStatus.OK)
    async confirmPresence(
        @Param('token') token: string,
        @Body() confirmDto: ConfirmPresenceDto,
        @Ip() ip: string,
        @Headers('user-agent') userAgent: string,
    ): Promise<GuestDocument> {
        return this.guestsService.confirmPresence(token, confirmDto, { ip, userAgent });
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin')
    async create(@Body() createGuestDto: CreateGuestDto): Promise<GuestDocument> {
        return this.guestsService.create(createGuestDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin')
    async findAll(@Query() query: any): Promise<GuestDocument[]> {
        return this.guestsService.findAll(query);
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin/statistics')
    async getStatistics() {
        return this.guestsService.getStatistics();
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin/:id')
    async findOne(@Param('id') id: string): Promise<GuestDocument> {
        return this.guestsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin/:id')
    async update(
        @Param('id') id: string,
        @Body() updateGuestDto: UpdateGuestDto
    ): Promise<GuestDocument> {
        return this.guestsService.update(id, updateGuestDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('admin/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
        await this.guestsService.remove(id);
    }
}