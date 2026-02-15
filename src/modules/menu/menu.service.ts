// src/modules/menu/menu.service.ts
import { Injectable } from '@nestjs/common';
import { CardapioOpcao } from '../guests/dto/guest-extended.dto';

@Injectable()
export class MenuService {
    private cardapio: CardapioOpcao[] = [
        // Entradas
        {
            id: 'ent1',
            nome: 'Bruschetta',
            descricao: 'Pão italiano, tomate, manjericão e azeite',
            tipo: 'entrada',
            imagem: '/images/bruschetta.jpg',
            restricoes: ['glúten']
        },
        {
            id: 'ent2',
            nome: 'Camarão Empanado',
            descricao: 'Camarões empanados com molho agridoce',
            tipo: 'entrada',
            imagem: '/images/camarao.jpg',
            restricoes: ['crustáceos']
        },
        // Pratos principais
        {
            id: 'pri1',
            nome: 'Filé Mignon ao Molho Madeira',
            descricao: 'Filé mignon com molho madeira, arroz e batata soufflé',
            tipo: 'principal',
            imagem: '/images/file.jpg',
        },
        {
            id: 'pri2',
            nome: 'Salmão Grelhado',
            descricao: 'Salmão com molho de maracujá, legumes e arroz',
            tipo: 'principal',
            imagem: '/images/salmao.jpg',
        },
        {
            id: 'pri3',
            nome: 'Risoto de Funghi',
            descricao: 'Risoto cremoso com funghi secchi e parmesão',
            tipo: 'principal',
            imagem: '/images/risoto.jpg',
            restricoes: ['lactose']
        },
        // Sobremesas
        {
            id: 'sob1',
            nome: 'Cheesecake de Frutas Vermelhas',
            descricao: 'Cheesecake com calda de frutas vermelhas',
            tipo: 'sobremesa',
            imagem: '/images/cheesecake.jpg',
            restricoes: ['lactose', 'glúten']
        },
        {
            id: 'sob2',
            nome: 'Petit Gateau',
            descricao: 'Bolo de chocolate com recheio cremoso e sorvete',
            tipo: 'sobremesa',
            imagem: '/images/petit.jpg',
            restricoes: ['lactose', 'glúten']
        },
        // Bebidas
        {
            id: 'beb1',
            nome: 'Vinho Tinto',
            descricao: 'Vinho tinto seco (cálice)',
            tipo: 'bebida',
        },
        {
            id: 'beb2',
            nome: 'Vinho Branco',
            descricao: 'Vinho branco suave (cálice)',
            tipo: 'bebida',
        },
        {
            id: 'beb3',
            nome: 'Refrigerante',
            descricao: 'Coca-Cola, Guaraná, Sprite',
            tipo: 'bebida',
        },
        {
            id: 'beb4',
            nome: 'Suco Natural',
            descricao: 'Laranja, uva, abacaxi',
            tipo: 'bebida',
        },
    ];

    async listarCardapio() {
        return this.cardapio;
    }

    async listarPorTipo(tipo: string) {
        return this.cardapio.filter(item => item.tipo === tipo);
    }
}