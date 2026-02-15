// src/modules/guests/schemas/guest.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type GuestDocument = Guest & Document;

@Schema({ timestamps: true })
export class Guest {
    @Prop({ required: true })
    nome: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    telefone: string;

    @Prop({ required: true, unique: true, default: uuidv4 })
    tokenUnico: string;

    @Prop({ default: false })
    confirmado: boolean;

    @Prop()
    confirmadoEm: Date;

    @Prop({ default: 0 })
    numAcompanhantes: number;

    @Prop({ required: true, default: 2 })
    maxAcompanhantes: number;

    @Prop({ required: true })
    grupo: string;

    @Prop()
    observacoes: string;

    @Prop({ default: false })
    conviteEnviado: boolean;

    @Prop()
    dataEnvioConvite: Date;

    // NOVOS CAMPOS
    @Prop({ type: Array })
    acompanhantes?: Array<{
        nome: string;
        idade?: number;
        restricaoAlimentar?: string[];
    }>;

    @Prop({ type: Object })
    presenteSelecionado?: {
        presenteId: string;
        nome: string;
        valor: number;
        quantidade: number;
    };

    @Prop({ type: Array })
    visualizacoes?: Array<{
        data: Date;
        ip?: string;
        userAgent?: string;
    }>;

    @Prop()
    ultimoAcesso?: Date;

    @Prop({ default: false })
    tokenUtilizado: boolean;

    @Prop()
    tokenExpiraEm?: Date;

    @Prop({ type: Object })
    metadata: {
        visualizacoes?: number;
        ipConfirmacao?: string;
        userAgent?: string;
        ultimoAcesso?: Date;
    };
}

export const GuestSchema = SchemaFactory.createForClass(Guest);