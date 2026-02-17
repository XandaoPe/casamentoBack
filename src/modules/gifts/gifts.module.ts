import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';
import { Gift, GiftSchema } from './schemas/gift.schema';
import { Reservation, ReservationSchema } from './schemas/reservation.schema';

@Module({
    imports: [
        // Registro de ambos os Schemas no MongooseModule
        MongooseModule.forFeature([
            { name: Gift.name, schema: GiftSchema },
            { name: Reservation.name, schema: ReservationSchema },
        ]),
    ],
    controllers: [GiftsController],
    providers: [GiftsService],
    exports: [GiftsService], 
})
export class GiftsModule { }