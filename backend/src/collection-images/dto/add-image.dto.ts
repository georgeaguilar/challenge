import { IsOptional, IsString } from 'class-validator';

export class AddImageDto {
  @IsString()
  nasaId!: string;

  @IsString()
  title!: string;

  @IsString()
  url!: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
