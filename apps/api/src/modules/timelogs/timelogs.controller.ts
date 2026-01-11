import { Controller, Get, Post, Patch, Param, Query, Body, UseGuards, ForbiddenException } from '@nestjs/common';
import { TimelogsService } from './timelogs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('timelogs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimelogsController {
  constructor(private readonly timelogsService: TimelogsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.WORKER)
  findAll(@Query('userId') userId?: string, @CurrentUser() user?: any) {
    // WORKER can only see their own time logs
    if (user?.role === Role.WORKER) {
      return this.timelogsService.findAll(user.id);
    }
    return this.timelogsService.findAll(userId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.WORKER)
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    const timeLog = await this.timelogsService.findOne(id);
    
    // WORKER can only see their own time logs
    if (user?.role === Role.WORKER && timeLog?.userId !== user.id) {
      throw new ForbiddenException('Access denied');
    }
    
    return timeLog;
  }

  @Post()
  @Roles(Role.WORKER)
  create(@Body() createDto: any, @CurrentUser() user: any) {
    // WORKER can only create time logs for themselves
    return this.timelogsService.create({
      ...createDto,
      userId: user.id,
    });
  }
}
