// src/modules/gifts/schemas/gift.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GiftDocument = Gift & Document;

@Schema({
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
})
export class Gift {
    @Prop({ required: true, trim: true })
    nome: string;

    @Prop()
    imagemUrl: string;

    @Prop({ required: true, min: 0 })
    valorTotal: number;

    @Prop({ default: false })
    temCotas: boolean;

    @Prop({ default: 1, min: 1 })
    totalCotas: number;

    @Prop({ default: 0, min: 0 })
    cotasVendidas: number;

    @Prop({ default: true })
    ativo: boolean;
}

export const GiftSchema = SchemaFactory.createForClass(Gift);

GiftSchema.virtual('valorCota').get(function () {
    return this.valorTotal / this.totalCotas;
});

GiftSchema.virtual('cotasRestantes').get(function () {
    return this.totalCotas - this.cotasVendidas;
});