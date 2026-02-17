import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

// A exportação deste tipo é crucial para o Service
export type ReservationDocument = Reservation & Document;

@Schema({ timestamps: true })
export class Reservation {
    @Prop({ type: Types.ObjectId, ref: 'Gift', required: true })
    giftId: Types.ObjectId;

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