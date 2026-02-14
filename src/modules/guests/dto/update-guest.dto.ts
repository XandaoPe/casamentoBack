// modules/guests/dto/update-guest.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateGuestDto } from './create-guest.dto';
import { IsBoolean, IsNumber, IsDate, IsOptional } from 'class-validator';

export class UpdateGuestDto extends PartialType(CreateGuestDto) {
    @IsOptional()
    @IsBoolean()
    confirmado?: boolean;

    @IsOptional()
    @IsNumber()
    numAcompanhantes?: number;

    @IsOptional()
    @IsBoolean()
    conviteEnviado?: boolean;

    @IsOptional()
    @IsDate()
    dataEnvioConvite?: Date;
}