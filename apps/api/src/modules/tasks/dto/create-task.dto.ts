import { IsString, IsNumber, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { TaskStatus } from '../../../common/enums/task.enum';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  projectId: string;

  @IsDateString()
  date: string;

  @IsNumber()
  duration: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsEnum(TaskStatus)
  status: TaskStatus;
}
