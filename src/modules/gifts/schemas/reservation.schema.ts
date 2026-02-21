import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
    @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
    giftId: Types.ObjectId;

    // Novo campo para vínculo absoluto
    @Prop({ type: Types.ObjectId, ref: 'Guest', required: true })
    guestId: Types.ObjectId;

    @Prop({ required: true })
    nomeConvidado: string;

    @Prop()
    mensagem: string;

    @Prop({ required: true })
    quantidadeCotas: number;

    @Prop({ required: true })
    valorPago: number;
}

export const ReservationSchema = SchemaFactory.createForClass(Reservation);