import { Controller, Get, Patch, Post, Body, UseGuards } from '@nestjs/common';
import { BrandingService } from './branding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '../../common/enums/role.enum';

@Controller('branding')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get('me')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES, Role.WORKER)
  async getBranding(@CurrentUser() user: any) {
    return this.brandingService.getBrandingForCompany(user.companyId);
  }

  @Patch('me')
  @Roles(Role.ADMIN)
  async updateBranding(
    @CurrentUser() user: any,
    @Body() branding: {
      displayName?: string;
      logoUrl?: string;
      primaryColor?: string;
      accentColor?: string;
      emailFromName?: string;
      emailFromAddress?: string;
    },
  ) {
    return this.brandingService.updateBranding(user.companyId, branding);
  }

  @Post('seed')
  @Roles(Role.ADMIN)
  async seedBranding(@CurrentUser() user: any) {
    return this.brandingService.seedBrandingForCompany(user.companyId);
  }
}
