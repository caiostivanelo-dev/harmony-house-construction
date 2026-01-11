import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { Role } from '../../common/enums/role.enum';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId?: string, user?: any) {
    // WORKER can only see tasks assigned to them
    if (user?.role === Role.WORKER) {
      return this.prisma.task.findMany({
        where: {
          AND: [
            projectId ? { projectId } : {},
            { assignedUsers: { some: { id: user.id } } },
          ],
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { date: 'desc' },
      });
    }

    // ADMIN and MANAGER see all tasks
    return this.prisma.task.findMany({
      where: projectId ? { projectId } : undefined,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, user?: any) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!task) {
      return null;
    }

    // WORKER can only see tasks assigned to them
    if (user?.role === Role.WORKER) {
      const isAssigned = task.assignedUsers.some((u) => u.id === user.id);
      if (!isAssigned) {
        throw new ForbiddenException('Access denied');
      }
    }

    return task;
  }

  async create(createDto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        title: createDto.title,
        projectId: createDto.projectId,
        date: new Date(createDto.date),
        duration: createDto.duration,
        notes: createDto.notes,
        status: createDto.status,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, updateDto: UpdateTaskDto, user?: any) {
    // WORKER can only update status and notes
    if (user?.role === Role.WORKER) {
      const task = await this.prisma.task.findUnique({
        where: { id },
        include: { assignedUsers: true },
      });
      
      if (!task) {
        throw new Error('Task not found');
      }
      
      // Verify user is assigned to task
      const isAssigned = task.assignedUsers.some((u) => u.id === user.id);
      if (!isAssigned) {
        throw new ForbiddenException('You are not assigned to this task');
      }
      
      return this.prisma.task.update({
        where: { id },
        data: {
          status: updateDto.status,
          notes: updateDto.notes,
        },
        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
            },
          },
          assignedUsers: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...updateDto,
        date: updateDto.date ? new Date(updateDto.date) : undefined,
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async assignUsers(taskId: string, userIds: string[], companyId: string) {
    // Verify task exists and belongs to company
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: true,
      },
    });

    if (!task) {
      throw new BadRequestException('Task not found');
    }

    // Verify task's project belongs to company
    const project = await this.prisma.project.findUnique({
      where: { id: task.projectId },
    });

    if (!project || project.companyId !== companyId) {
      throw new ForbiddenException('Task does not belong to your company');
    }

    // Verify all users exist and belong to company (and optionally have WORKER role)
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        companyId,
      },
    });

    if (users.length !== userIds.length) {
      throw new BadRequestException('One or more users not found or do not belong to your company');
    }

    // Update task assignments
    return this.prisma.task.update({
      where: { id: taskId },
      data: {
        assignedUsers: {
          set: users.map((u) => ({ id: u.id })),
        },
      },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },
        assignedUsers: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }
}
