import { IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmailDto {
  @IsString()
  @IsOptional()
  work?: string;

  @IsString()
  @IsOptional()
  personal?: string;
}

class PhoneDto {
  @IsString()
  @IsOptional()
  work?: string;

  @IsString()
  @IsOptional()
  personal?: string;
}

class AddressDto {
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  state?: string;

  @IsString()
  @IsOptional()
  zip?: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class UpdateCustomerDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsObject()
  @ValidateNested()
  @Type(() => EmailDto)
  @IsOptional()
  emails?: EmailDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PhoneDto)
  @IsOptional()
  phones?: PhoneDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  @IsOptional()
  addresses?: AddressDto[];

  @IsString()
  @IsOptional()
  leadSource?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
