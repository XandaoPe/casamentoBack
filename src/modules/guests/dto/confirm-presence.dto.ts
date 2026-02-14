// modules/guests/dto/confirm-presence.dto.ts
import { IsBoolean, IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class ConfirmPresenceDto {
    @IsBoolean()
    confirmado: boolean;

    @IsNumber()
    @Min(0)
    @Max(10)
    numAcompanhantes: number;

    @IsOptional()
    @IsString()
    mensagem?: string;
}