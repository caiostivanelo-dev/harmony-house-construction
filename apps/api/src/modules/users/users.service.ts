import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';

interface UserEntity {
  id: string;
  email: string;
  name: string;
  password?: string; // Optional for findOne/findAll (can exclude password)
  role: Role;
  companyId: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as Role, // Cast Prisma Role to local Role enum
    };
  }

  async findOne(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) return null;
    return {
      ...user,
      role: user.role as Role, // Cast Prisma Role to local Role enum
    };
  }

  async findAll(companyId: string): Promise<UserEntity[]> {
    const users = await this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        companyId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return users.map(user => ({
      ...user,
      role: user.role as Role, // Cast Prisma Role to local Role enum
      password: undefined, // Exclude password from list
    }));
  }
}
