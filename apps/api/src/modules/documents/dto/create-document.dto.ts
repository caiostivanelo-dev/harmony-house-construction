import { IsEnum, IsString, IsNumber, IsOptional, IsDateString, IsArray, ValidateNested, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { DocumentType, DocumentStatus } from '../../../common/enums/document.enum';

export class EstimateLineItemDto {
  @IsString()
  type: string; // 'LABOR' | 'MATERIAL' | 'OTHER_COST'

  @IsString()
  name: string; // Item name/description

  @IsOptional()
  @IsNumber()
  hours?: number; // For LABOR items

  @IsOptional()
  @IsNumber()
  quantity?: number; // For MATERIAL items

  @IsNumber()
  companyCost: number; // Internal company cost

  @IsNumber()
  customerPrice: number; // Price charged to customer

  @IsOptional()
  @IsNumber()
  tax?: number; // Tax percentage (e.g., 10.0 for 10%)

  @IsOptional()
  @IsNumber()
  taxAmount?: number; // Calculated tax amount

  @IsOptional()
  @IsNumber()
  visible?: number; // 0 = hidden, 1 = visible to customer
}

export class EstimateSectionDto {
  @IsString()
  name: string; // Section name (e.g., "Demolition & Disposal", "Plumbing")

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EstimateLineItemDto)
  items: EstimateLineItemDto[];
}

export class EstimateItemDto {
  @IsString()
  category: string; // e.g., "Demolition Per Plans", "WOOD FLOOR INSTALLATION" (legacy)

  @IsString()
  description: string; // Notes/description (legacy)

  @IsOptional()
  @IsNumber()
  labor?: number; // Labor cost (legacy - for simple estimates)

  @IsOptional()
  @IsNumber()
  materials?: number; // Materials cost (legacy - for simple estimates)

  @IsNumber()
  cost: number; // Total cost for this item (legacy - labor + materials, or direct value)
}

export class CreateDocumentDto {
  @IsEnum(DocumentType)
  type: DocumentType;

  @IsString()
  customerId: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsNumber()
  totalValue: number;

  @IsOptional()
  @IsNumber()
  balanceDue?: number;

  @IsEnum(DocumentStatus)
  status: DocumentStatus;

  @IsOptional()
  @IsDateString()
  sentDate?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  number?: string;

  // Estimate-specific fields
  @IsOptional()
  @IsDateString()
  estimateDate?: string;

  @IsOptional()
  @IsString()
  projectDates?: string; // e.g., "TBT"

  @IsOptional()
  @IsString()
  preparedBy?: string;

  @IsOptional()
  @IsInt()
  validityDays?: number; // Default 30

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  introduction?: string; // Introduction text for estimate

  @IsOptional()
  @IsNumber()
  taxRate?: number; // Tax rate percentage (e.g., 10.0 for 10%)

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
