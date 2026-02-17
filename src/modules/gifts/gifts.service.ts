import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Gift, GiftDocument } from './schemas/gift.schema';
import { Reservation, ReservationDocument } from './schemas/reservation.schema';

@Injectable()
export class GiftsService {
    private readonly logger = new Logger(GiftsService.name);

    constructor(
        @InjectModel(Gift.name) private giftModel: Model<GiftDocument>,
        @InjectModel(Reservation.name) private reservationModel: Model<ReservationDocument>
    ) { }

    private processImage(data: any, file?: Express.Multer.File) {
        if (file) {
            const base64 = file.buffer.toString('base64');
            data.imagemUrl = `data:${file.mimetype};base64,${base64}`;
        }
        return data;
    }

    async create(data: any, file?: Express.Multer.File): Promise<GiftDocument> {
        const preparedData = {
            ...data,
            valorTotal: Number(data.valorTotal),
            totalCotas: Number(data.totalCotas || 1),
            temCotas: String(data.temCotas) === 'true',
        };
        const giftData = this.processImage(preparedData, file);
        return new this.giftModel(giftData).save();
    }

    async update(id: string, data: any, file?: Express.Multer.File) {
        const preparedData = {
            ...data,
            valorTotal: data.valorTotal ? Number(data.valorTotal) : undefined,
            totalCotas: data.totalCotas ? Number(data.totalCotas) : undefined,
            temCotas: String(data.temCotas) === 'true',
        };
        const giftData = this.processImage(preparedData, file);
        return this.giftModel.findByIdAndUpdate(id, giftData, { new: true }).exec();
    }

    async findAllAtivos(): Promise<GiftDocument[]> {
        return this.giftModel.find({ ativo: true }).sort({ valorTotal: 1 }).exec();
    }

    async findAllAdmin(): Promise<GiftDocument[]> {
        return this.giftModel.find({}).sort({ createdAt: -1 }).exec();
    }

    async buyGift(id: string, quantidade: number, dadosConvidado: { nome: string, mensagem: string }): Promise<any> {
        const gift = await this.giftModel.findById(id);
        if (!gift) throw new NotFoundException('Presente não encontrado');

        const disponivel = gift.totalCotas - gift.cotasVendidas;
        if (disponivel < quantidade) {
            throw new BadRequestException('Quantidade de cotas indisponível');
        }

        // Atualiza as cotas vendidas
        gift.cotasVendidas += quantidade;
        await gift.save();

        // Salva quem deu o presente
        const valorUnitario = gift.valorTotal / gift.totalCotas;
        const novaReserva = new this.reservationModel({
            giftId: gift._id,
            nomeConvidado: dadosConvidado.nome,
            mensagem: dadosConvidado.mensagem,
            quantidadeCotas: quantidade,
            valorPago: valorUnitario * quantidade
        });

        await novaReserva.save();
        return gift;
    }

    // NOVO: Busca quem comprou um presente específico
    async findReservationsByGift(giftId: string): Promise<ReservationDocument[]> {
        return this.reservationModel.find({ giftId: new Types.ObjectId(giftId) })
            .sort({ createdAt: -1 })
            .exec();
    }

    async remove(id: string): Promise<void> {
        const result = await this.giftModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Presente não encontrado');
        }
        // Opcional: Remover reservas vinculadas ao excluir presente
        await this.reservationModel.deleteMany({ giftId: new Types.ObjectId(id) }).exec();
    }
}