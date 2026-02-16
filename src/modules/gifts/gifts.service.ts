import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gift, GiftDocument } from './schemas/gift.schema';

@Injectable()
export class GiftsService {
    private readonly logger = new Logger(GiftsService.name);

    constructor(@InjectModel(Gift.name) private giftModel: Model<GiftDocument>) { }

    // Auxiliar para processar a imagem
    private processImage(data: any, file?: Express.Multer.File) {
        if (file) {
            // Se você não tiver um storage como S3 ou Cloudinary, 
            // salvamos como Base64 no banco por enquanto (prático para imagens pequenas)
            const base64 = file.buffer.toString('base64');
            data.imagemUrl = `data:${file.mimetype};base64,${base64}`;
        }
        return data;
    }

    async create(data: any, file?: Express.Multer.File): Promise<GiftDocument> {
        // Converter strings do FormData para números reais
        const preparedData = {
            ...data,
            valorTotal: Number(data.valorTotal),
            totalCotas: Number(data.totalCotas || 1),
            temCotas: data.temCotas === 'true', // FormData envia "true" como string
        };

        const giftData = this.processImage(preparedData, file);
        return new this.giftModel(giftData).save();
    }

    async update(id: string, data: any, file?: Express.Multer.File) {
        const preparedData = {
            ...data,
            valorTotal: data.valorTotal ? Number(data.valorTotal) : undefined,
            totalCotas: data.totalCotas ? Number(data.totalCotas) : undefined,
            temCotas: data.temCotas === 'true',
        };

        const giftData = this.processImage(preparedData, file);
        return this.giftModel.findByIdAndUpdate(id, giftData, { new: true }).exec();
    }

    // ... (restante do código: findAllAtivos, findAllAdmin, remove seguem iguais)

    async findAllAtivos(): Promise<GiftDocument[]> {
        return this.giftModel.find({ ativo: true }).sort({ valorTotal: 1 }).exec();
    }

    async findAllAdmin(): Promise<GiftDocument[]> {
        return this.giftModel.find({}).sort({ createdAt: -1 }).exec();
    }

    async buyGift(id: string, quantidade: number): Promise<GiftDocument> {
        const gift = await this.giftModel.findOneAndUpdate(
            {
                _id: id,
                $expr: { $gte: [{ $subtract: ["$totalCotas", "$cotasVendidas"] }, quantidade] }
            },
            { $inc: { cotasVendidas: quantidade } },
            { new: true }
        ).exec();

        if (!gift) {
            const exists = await this.giftModel.findById(id);
            if (!exists) throw new NotFoundException('Presente não encontrado');
            throw new BadRequestException('Desculpe, este presente ou cota acabou de ser reservado por outro convidado.');
        }

        return gift;
    }

    async remove(id: string): Promise<void> {
        const result = await this.giftModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Presente não encontrado');
        }
    }
}