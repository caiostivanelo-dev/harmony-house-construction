import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.companyId) {
      throw new ForbiddenException('Company not found');
    }

    const company = await this.prisma.company.findUnique({
      where: { id: user.companyId },
    });

    if (!company) {
      throw new ForbiddenException('Company not found');
    }

    const status = company.subscriptionStatus || 'TRIALING';
    const validStatuses = ['ACTIVE', 'TRIALING'];

    if (!validStatuses.includes(status)) {
      throw new ForbiddenException(
        `Subscription is ${status.toLowerCase()}. Please update your subscription.`,
      );
    }

    return true;
  }
}
