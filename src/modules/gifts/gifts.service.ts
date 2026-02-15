// src/modules/gifts/gifts.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Presente } from '../guests/dto/guest-extended.dto';

@Injectable()
export class GiftsService {
    constructor(
        @InjectModel('Presente') private presenteModel: Model<any>,
    ) { }

    // Lista de presentes pré-definida
    private presentes: Presente[] = [
        {
            id: '1',
            nome: 'Liquidificador',
            descricao: 'Liquidificador Philips Walita 1000W',
            imagem: '/images/liquidificador.jpg',
            valorTotal: 299.90,
            valorCota: 50.00,
            cotasDisponiveis: 6,
            cotasCompradas: 0,
            loja: 'Amazon',
            linkExterno: 'https://amazon.com/...'
        },
        {
            id: '2',
            nome: 'Jogo de Panelas',
            descricao: 'Jogo de panelas Tramontina 5 peças',
            imagem: '/images/panelas.jpg',
            valorTotal: 450.00,
            valorCota: 75.00,
            cotasDisponiveis: 6,
            cotasCompradas: 0,
            loja: 'Magazine Luiza',
            linkExterno: 'https://magazineluiza.com.br/...'
        },
        {
            id: '3',
            nome: 'Fogão',
            descricao: 'Fogão Brastemp 5 bocas',
            imagem: '/images/fogao.jpg',
            valorTotal: 1200.00,
            valorCota: 100.00,
            cotasDisponiveis: 12,
            cotasCompradas: 0,
            loja: 'Casas Bahia',
            linkExterno: 'https://casasbahia.com.br/...'
        },
        {
            id: '4',
            nome: 'Geladeira',
            descricao: 'Geladeira Frost Free Brastemp',
            imagem: '/images/geladeira.jpg',
            valorTotal: 2500.00,
            valorCota: 150.00,
            cotasDisponiveis: 17,
            cotasCompradas: 0,
            loja: 'Ponto Frio',
            linkExterno: 'https://pontofrio.com.br/...'
        },
        {
            id: '5',
            nome: 'Micro-ondas',
            descricao: 'Micro-ondas LG 30L',
            imagem: '/images/microondas.jpg',
            valorTotal: 450.00,
            valorCota: 75.00,
            cotasDisponiveis: 6,
            cotasCompradas: 0,
            loja: 'Amazon',
            linkExterno: 'https://amazon.com/...'
        },
        {
            id: '6',
            nome: 'Jogo de Cama',
            descricao: 'Jogo de cama queen size 200 fios',
            imagem: '/images/cama.jpg',
            valorTotal: 180.00,
            valorCota: 45.00,
            cotasDisponiveis: 4,
            cotasCompradas: 0,
            loja: 'Renner',
            linkExterno: 'https://renner.com.br/...'
        }
    ];

    async listarPresentes() {
        return this.presentes;
    }

    async comprarCota(presenteId: string, quantidade: number) {
        const presente = this.presentes.find(p => p.id === presenteId);

        if (!presente) {
            throw new NotFoundException('Presente não encontrado');
        }

        if (presente.cotasDisponiveis < quantidade) {
            throw new BadRequestException(`Apenas ${presente.cotasDisponiveis} cotas disponíveis`);
        }

        // Atualizar cotas
        presente.cotasDisponiveis -= quantidade;
        presente.cotasCompradas += quantidade;

        return {
            presente,
            valorTotal: quantidade * presente.valorCota
        };
    }
}