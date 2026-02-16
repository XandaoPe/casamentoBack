// src/modules/gifts/gifts.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GiftsController } from './gifts.controller';
import { GiftsService } from './gifts.service';
import { Gift, GiftSchema } from './schemas/gift.schema';

@Module({
    imports: [
        MongooseModule.forFeature([{ name: Gift.name, schema: GiftSchema }]),
    ],
    controllers: [GiftsController],
    providers: [GiftsService],
    exports: [GiftsService],
})
export class GiftsModule { }