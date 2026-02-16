// src/modules/gifts/gifts.service.ts
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Gift, GiftDocument } from './schemas/gift.schema';

@Injectable()
export class GiftsService {
    private readonly logger = new Logger(GiftsService.name);

    constructor(@InjectModel(Gift.name) private giftModel: Model<GiftDocument>) { }

    async create(data: any): Promise<GiftDocument> {
        this.logger.log(`Criando presente: ${data.nome}`);
        return new this.giftModel(data).save();
    }

    async findAllAtivos(): Promise<GiftDocument[]> {
        return this.giftModel.find({ ativo: true }).sort({ valorTotal: 1 }).exec();
    }

    async buyGift(id: string, quantidade: number): Promise<GiftDocument> {
        // Buscamos e atualizamos apenas se houver cotas suficientes (Operação Atômica)
        const gift = await this.giftModel.findOneAndUpdate(
            {
                _id: id,
                // Garantia de estoque: total - vendidas >= quantidade pedida
                $expr: { $gte: [{ $subtract: ["$totalCotas", "$cotasVendidas"] }, quantidade] }
            },
            { $inc: { cotasVendidas: quantidade } },
            { new: true }
        ).exec();

        if (!gift) {
            // Se não encontrou, ou o ID é inválido ou as cotas acabaram enquanto ele tentava comprar
            const exists = await this.giftModel.findById(id);
            if (!exists) throw new NotFoundException('Presente não encontrado');
            throw new BadRequestException('Desculpe, este presente ou cota acabou de ser reservado por outro convidado.');
        }

        return gift;
    }

    async update(id: string, data: any) {
        return this.giftModel.findByIdAndUpdate(id, data, { new: true }).exec();
    }

    async remove(id: string): Promise<void> {
        const result = await this.giftModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Presente não encontrado');
        }
    }
}