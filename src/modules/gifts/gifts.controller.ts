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

    @Public()
    @Post('reserve')
    @HttpCode(HttpStatus.OK) // Retorna 200 em vez de 201
    async reserve(@Body() data: { giftId: string; quantidade: number }) {
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