import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { TaskStatus } from '../../../common/enums/task.enum';

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  projectId?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsNumber()
  duration?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;
}
