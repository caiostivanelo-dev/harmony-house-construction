import { IsEnum, IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, DocumentStatus } from '../../../common/enums/document.enum';
import { EstimateItemDto, EstimateSectionDto } from './create-document.dto';

export class UpdateDocumentDto {
  @IsOptional()
  @IsEnum(DocumentType)
  type?: DocumentType;

  @IsOptional()
  @IsString()
  customerId?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsNumber()
  totalValue?: number;

  @IsOptional()
  @IsNumber()
  balanceDue?: number;

  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus;

  @IsOptional()
  @IsDateString()
  sentDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  // Estimate-specific fields
  @IsOptional()
  @IsDateString()
  estimateDate?: string;

  @IsOptional()
  @IsString()
  projectDates?: string;

  @IsOptional()
  @IsString()
  preparedBy?: string;

  @IsOptional()
  @IsInt()
  validityDays?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  introduction?: string;

  @IsOptional()
  @IsNumber()
  taxRate?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateItemDto)
  items?: EstimateItemDto[]; // Legacy format

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateSectionDto)
  sections?: EstimateSectionDto[]; // New advanced format
}
