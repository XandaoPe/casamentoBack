import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Put,
    Delete,
    HttpCode,
    HttpStatus,
    UseInterceptors,
    UploadedFile,
    BadRequestException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { GiftsService } from './gifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../auth/decorators/public.decorator';

@Controller('gifts')
export class GiftsController {
    constructor(private readonly giftsService: GiftsService) { }

    /**
     * ROTAS PÚBLICAS (Para os convidados)
     */

    @Public()
    @Get()
    async findAll() {
        return this.giftsService.findAllAtivos();
    }

    @Public()
    @Post('buy')
    @HttpCode(HttpStatus.OK)
    async reserve(@Body() data: {
        giftId: string;
        quantidade: number;
        nome: string;
        mensagem: string
    }) {
        // Validação básica dos dados de entrada
        if (!data.giftId) {
            throw new BadRequestException('ID do presente é obrigatório');
        }
        if (!data.nome) {
            throw new BadRequestException('Seu nome é obrigatório para identificar o presente');
        }

        const qtd = data.quantidade || 1;

        return this.giftsService.buyGift(data.giftId, qtd, {
            nome: data.nome,
            mensagem: data.mensagem
        });
    }

    /**
     * ROTAS ADMINISTRATIVAS (Protegidas por JWT)
     */

    @UseGuards(JwtAuthGuard)
    @Get('admin')
    async findAllForAdmin() {
        return this.giftsService.findAllAdmin();
    }

    // Rota que alimenta o botão "Ver Nomes" da sua AdminGiftsPage
    @UseGuards(JwtAuthGuard)
    @Get(':id/reservations')
    async getReservations(@Param('id') id: string) {
        return this.giftsService.findReservationsByGift(id);
    }

    @UseGuards(JwtAuthGuard)
    @Post('admin')
    @UseInterceptors(FileInterceptor('image'))
    async create(
        @Body() createGiftDto: any,
        @UploadedFile() file: Express.Multer.File
    ) {
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