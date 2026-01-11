import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { BrandingService } from './branding.service';
import { BrandingController } from './branding.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule, ConfigModule],
  controllers: [BrandingController],
  providers: [BrandingService],
  exports: [BrandingService],
})
export class BrandingModule {}
