import { IsString } from 'class-validator';

export class AddTagDto {
  @IsString()
  name!: string;
}
