// modules/guests/schemas/guest.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export type GuestDocument = Guest & Document;

@Schema({
    timestamps: true,
    collection: 'guests' // Isso define o nome da "tabela" dentro do db casamento
})
export class Guest {
    @Prop({ required: true })
    nome: string;

    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ required: true })
    telefone: string;

    @Prop({ required: true, unique: true, default: () => uuidv4() }) // Use função anônima para gerar novo a cada insert
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

    @Prop({ type: Object, default: {} })
    metadata: {
        ipConfirmacao?: string;
        userAgent?: string;
        visualizacoes?: number;
    };
}

export const GuestSchema = SchemaFactory.createForClass(Guest);