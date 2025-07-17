import { IsString, IsNumber, IsOptional, Min, Max, IsNotEmpty } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsNumber()
  @Min(0)
  @Transform(({ value }) => parseFloat(value))
  actualPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Transform(({ value }) => parseFloat(value))
  discount?: number = 0;

  @IsString()
  @IsNotEmpty()
  productDescription!: string;

  @IsString()
  @IsNotEmpty()
  productType!: string;
}