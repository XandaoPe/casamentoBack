import {
    Controller, Get, Post, Body, Param, UseGuards, Put, Delete,
    HttpCode, HttpStatus, UseInterceptors, UploadedFile
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express'; // Importante
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
    @Post('buy')
    @HttpCode(HttpStatus.OK)
    async reserve(@Body() data: { giftId: string; quantidade: number }) {
        if (!data.quantidade || data.quantidade < 1) {
            data.quantidade = 1;
        }
        return this.giftsService.buyGift(data.giftId, data.quantidade);
    }

    // --- ROTAS ADMINISTRATIVAS COM SUPORTE A UPLOAD ---

    @UseGuards(JwtAuthGuard)
    @Post('admin')
    @UseInterceptors(FileInterceptor('image')) // Nome deve bater com o data.append('image') do Front
    async create(@Body() createGiftDto: any, @UploadedFile() file: Express.Multer.File) {
        return this.giftsService.create(createGiftDto, file);
    }

    @UseGuards(JwtAuthGuard)
    @Put('admin/:id')
    @UseInterceptors(FileInterceptor('image'))
    async update(
        @Param('id') id: string,
        @Body() updateDto: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        return this.giftsService.update(id, updateDto, file);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('admin/:id')
    async remove(@Param('id') id: string) {
        return this.giftsService.remove(id);
    }
}