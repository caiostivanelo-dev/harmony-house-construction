import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class TimelogsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    return this.prisma.timeLog.findMany({
      where: userId ? { userId } : undefined,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          include: {
            project: true,
          },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.timeLog.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          include: {
            project: true,
          },
        },
      },
    });
  }

  async create(data: {
    taskId: string;
    userId: string;
    date: string;
    hours: number;
    type: 'REGULAR' | 'OVERTIME';
  }) {
    return this.prisma.timeLog.create({
      data: {
        taskId: data.taskId,
        userId: data.userId,
        date: new Date(data.date),
        hours: data.hours,
        type: data.type,
        approved: false,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          include: {
            project: true,
          },
        },
      },
    });
  }
}
