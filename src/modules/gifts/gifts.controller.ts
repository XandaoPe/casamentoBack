// src/modules/gifts/gifts.controller.ts
import { Controller, Get, Post, Body, Param, UseGuards, Put, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { GiftsService } from './gifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('gifts')
export class GiftsController {
    constructor(private readonly giftsService: GiftsService) { }

    @Public()
    @Get()
    async findAll() {
        return this.giftsService.findAllAtivos();
    }

    @UseGuards(JwtAuthGuard)
    @Get('admin')
    async findAllForAdmin() {
        return this.giftsService.findAllAdmin();
    }

    @Public()
    @Post('buy') // Alterado de 'reserve' para 'buy' para coincidir com o Front-end
    @HttpCode(HttpStatus.OK)
    async reserve(@Body() data: { giftId: string; quantidade: number }) {
        // Adicione uma validação simples para evitar o 'null' que vimos no log
        if (!data.quantidade || data.quantidade < 1) {
            data.quantidade = 1;
        }
        return this.giftsService.buyGift(data.giftId, data.quantidade);
    }

    // --- ROTAS ADMINISTRATIVAS ---

    @UseGuards(JwtAuthGuard)
    @Post('admin')
    async create(@Body() createGiftDto: any) {
        return this.giftsService.create(createGiftDto);
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin/:id')
    async update(@Param('id') id: string, @Body() updateDto: any) {
        return this.giftsService.update(id, updateDto);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('admin/:id')
    async remove(@Param('id') id: string) {
        return this.giftsService.remove(id);
    }
}