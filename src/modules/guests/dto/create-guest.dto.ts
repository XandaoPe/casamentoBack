// modules/guests/dto/create-guest.dto.ts
import { IsEmail, IsNotEmpty, IsString, IsNumber, Min, Max, IsOptional } from 'class-validator';

export class CreateGuestDto {
    @IsNotEmpty()
    @IsString()
    nome: string;

    @IsNotEmpty()
    @IsEmail()
    email: string;

    @IsNotEmpty()
    @IsString()
    telefone: string;

    @IsNotEmpty()
    @IsString()
    grupo: string;

    @IsNumber()
    @Min(0)
    @Max(10)
    maxAcompanhantes: number;

    @IsOptional()
    @IsString()
    observacoes?: string;
}