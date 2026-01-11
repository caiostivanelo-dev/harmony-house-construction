import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '../../common/enums/role.enum';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WORKER)
  findAll(@Query('projectId') projectId?: string, @Query('assignedUserId') assignedUserId?: string, @CurrentUser() user?: any) {
    // If ADMIN/MANAGER requests specific user's tasks, pass that
    // Otherwise, use current user context for filtering
    if (assignedUserId && (user?.role === Role.ADMIN || user?.role === Role.MANAGER)) {
      // For now, just return all tasks - filtering by assignedUserId can be added if needed
      return this.tasksService.findAll(projectId, user);
    }
    return this.tasksService.findAll(projectId, user);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WORKER)
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.tasksService.findOne(id, user);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER)
  create(@Body() createDto: CreateTaskDto) {
    return this.tasksService.create(createDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WORKER)
  async update(@Param('id') id: string, @Body() updateDto: UpdateTaskDto, @CurrentUser() user?: any) {
    // WORKER can only update status and notes, not other fields
    if (user?.role === Role.WORKER) {
      const restrictedUpdate: UpdateTaskDto = {
        status: updateDto.status,
        notes: updateDto.notes,
      };
      return this.tasksService.update(id, restrictedUpdate, user);
    }
    return this.tasksService.update(id, updateDto, user);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN, Role.MANAGER)
  async assignUsers(@Param('id') id: string, @Body() body: { userIds: string[] }, @CurrentUser() user: any) {
    return this.tasksService.assignUsers(id, body.userIds, user.companyId);
  }
}
