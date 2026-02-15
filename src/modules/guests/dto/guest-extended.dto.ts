// src/modules/guests/dto/guest-extended.dto.ts
export interface CardapioOpcao {
    id: string;
    nome: string;
    descricao: string;
    tipo: 'entrada' | 'principal' | 'sobremesa' | 'bebida';
    imagem?: string;
    restricoes?: string[];
}

export interface Presente {
    id: string;
    nome: string;
    descricao: string;
    imagem?: string;
    valorTotal: number;
    valorCota: number;
    cotasDisponiveis: number;
    cotasCompradas: number;
    loja?: string;
    linkExterno?: string;
}

export interface PresenteSelecionado {
    presenteId: string;
    nome: string;
    valor: number;
    quantidade: number;
}

export interface ConfirmacaoEstendidaDto {
    confirmado: boolean;
    numAcompanhantes: number;
    acompanhantes?: Array<{
        nome: string;
        idade?: number;
        restricaoAlimentar?: string[];
    }>;
    presente?: PresenteSelecionado;
    mensagem?: string;
    ip?: string;
    userAgent?: string;
}