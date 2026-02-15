// modules/guests/guests.service.ts (trecho corrigido)
import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Guest, GuestDocument } from './schemas/guest.schema';
import { CreateGuestDto } from './dto/create-guest.dto';
import { UpdateGuestDto } from './dto/update-guest.dto';
import { ConfirmPresenceDto } from './dto/confirm-presence.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class GuestsService {
    private readonly logger = new Logger(GuestsService.name);

    constructor(
        @InjectModel(Guest.name) private guestModel: Model<GuestDocument>,
    ) { }

    async create(createGuestDto: CreateGuestDto): Promise<GuestDocument> {
        this.logger.log(`Criando novo convidado: ${createGuestDto.nome}`);

        const existingGuest = await this.guestModel.findOne({ email: createGuestDto.email }).exec();
        if (existingGuest) {
            throw new BadRequestException('Email já cadastrado');
        }

        const guest = new this.guestModel({
            ...createGuestDto,
            tokenUnico: uuidv4(),
        });

        return guest.save();
    }

    async findAll(filters?: any): Promise<GuestDocument[]> {
        const query: any = {};

        if (filters?.grupo) {
            query['grupo'] = filters.grupo;
        }

        if (filters?.confirmado !== undefined) {
            query['confirmado'] = filters.confirmado === 'true';
        }

        return this.guestModel.find(query).sort({ createdAt: -1 }).exec();
    }

    async findOne(id: string): Promise<GuestDocument> {
        const guest = await this.guestModel.findById(id).exec();
        if (!guest) {
            throw new NotFoundException('Convidado não encontrado');
        }
        return guest;
    }

    async findByToken(token: string): Promise<GuestDocument> {
        const guest = await this.guestModel.findOne({ tokenUnico: token }).exec();

        if (!guest) {
            throw new NotFoundException('Convite não encontrado');
        }

        // Verificar se o token já foi utilizado
        if (guest.tokenUtilizado && guest.confirmado) {
            throw new BadRequestException('Este convite já foi utilizado por outro dispositivo');
        }

        // Registrar visualização
        guest.visualizacoes = guest.visualizacoes || [];
        guest.visualizacoes.push({
            data: new Date(),
        });

        guest.ultimoAcesso = new Date();
        guest.metadata = guest.metadata || {};
        guest.metadata.visualizacoes = (guest.metadata.visualizacoes || 0) + 1;

        await guest.save();

        return guest;
    }

    async confirmPresence(
        token: string,
        confirmDto: any,
        metadata?: { ip: string; userAgent: string }
    ): Promise<GuestDocument> {
        this.logger.log(`Confirmando presença para token: ${token}`);

        const guest = await this.findByToken(token);

        if (guest.confirmado) {
            throw new BadRequestException('Presença já confirmada anteriormente');
        }

        // Validar acompanhantes
        if (confirmDto.numAcompanhantes > guest.maxAcompanhantes) {
            throw new BadRequestException(
                `Número máximo de acompanhantes é ${guest.maxAcompanhantes}`
            );
        }

        // Atualizar dados do convidado
        guest.confirmado = confirmDto.confirmado;
        guest.numAcompanhantes = confirmDto.numAcompanhantes;
        guest.confirmadoEm = new Date();
        guest.acompanhantes = confirmDto.acompanhantes || [];
        guest.presenteSelecionado = confirmDto.presente;
        guest.tokenUtilizado = true;

        if (metadata) {
            guest.metadata = {
                ...guest.metadata,
                ipConfirmacao: metadata.ip,
                userAgent: metadata.userAgent,
            };
        }

        return guest.save();
    }

    async update(id: string, updateGuestDto: UpdateGuestDto): Promise<GuestDocument> {
        this.logger.log(`Atualizando convidado: ${id}`);

        const guest = await this.guestModel
            .findByIdAndUpdate(id, updateGuestDto, { new: true })
            .exec();

        if (!guest) {
            throw new NotFoundException('Convidado não encontrado');
        }

        return guest;
    }

    async remove(id: string): Promise<void> {
        this.logger.log(`Removendo convidado: ${id}`);

        const result = await this.guestModel.deleteOne({ _id: id }).exec();
        if (result.deletedCount === 0) {
            throw new NotFoundException('Convidado não encontrado');
        }
    }

    async getStatistics() {
        this.logger.log('Gerando estatísticas');

        const total = await this.guestModel.countDocuments();
        const confirmados = await this.guestModel.countDocuments({ confirmado: true });

        const totalAcompanhantesResult = await this.guestModel.aggregate([
            { $match: { confirmado: true } },
            { $group: { _id: null, total: { $sum: '$numAcompanhantes' } } }
        ]);

        const porGrupo = await this.guestModel.aggregate([
            {
                $group: {
                    _id: '$grupo',
                    total: { $sum: 1 },
                    confirmados: { $sum: { $cond: [{ $eq: ['$confirmado', true] }, 1, 0] } }
                }
            }
        ]);

        const totalAcompanhantes = totalAcompanhantesResult[0]?.total || 0;

        return {
            total,
            confirmados,
            totalPessoas: confirmados + totalAcompanhantes,
            taxaConfirmacao: total > 0 ? Number(((confirmados / total) * 100).toFixed(2)) : 0,
            porGrupo
        };
    }
    
}