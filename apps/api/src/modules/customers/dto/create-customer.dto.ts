import { IsString, IsOptional, IsObject, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class EmailDto {
  @IsString()
  work: string;

  @IsString()
  @IsOptional()
  personal?: string;
}

class PhoneDto {
  @IsString()
  work: string;

  @IsString()
  @IsOptional()
  personal?: string;
}

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  state: string;

  @IsString()
  zip: string;

  @IsString()
  country: string;
}

export class CreateCustomerDto {
  @IsString()
  name: string;

  @IsObject()
  @ValidateNested()
  @Type(() => EmailDto)
  emails: EmailDto;

  @IsObject()
  @ValidateNested()
  @Type(() => PhoneDto)
  phones: PhoneDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddressDto)
  addresses: AddressDto[];

  @IsString()
  @IsOptional()
  leadSource?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
