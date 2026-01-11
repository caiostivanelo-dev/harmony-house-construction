import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

export interface CompanyBranding {
  displayName: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  emailFromName: string;
  emailFromAddress: string;
}

@Injectable()
export class BrandingService {
  private defaultBranding: CompanyBranding;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    // Initialize default branding with config service
    this.defaultBranding = {
      displayName: 'Harmony House Construction',
      logoUrl: undefined,
      primaryColor: '#1ECAD3',
      accentColor: '#1ECAD3',
      emailFromName: 'Harmony House Construction',
      emailFromAddress: this.configService.get<string>('EMAIL_FROM') || 'noreply@harmonyhouse.com',
    };
  }

  async getBrandingForCompany(companyId: string): Promise<CompanyBranding> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        displayName: true,
        logoUrl: true,
        primaryColor: true,
        accentColor: true,
        emailFromName: true,
        emailFromAddress: true,
      },
    });

    if (!company) {
      return this.defaultBranding;
    }

    return {
      displayName: this.resolveDisplayName(company.displayName, company.name),
      logoUrl: company.logoUrl || undefined,
      primaryColor: this.sanitizeColor(company.primaryColor) || this.defaultBranding.primaryColor,
      accentColor: this.sanitizeColor(company.accentColor) || this.defaultBranding.accentColor,
      emailFromName: company.emailFromName || this.defaultBranding.emailFromName,
      emailFromAddress: company.emailFromAddress || this.defaultBranding.emailFromAddress,
    };
  }

  private resolveDisplayName(displayName?: string | null, companyName?: string): string {
    if (displayName) return displayName;
    if (companyName) return companyName;
    return this.defaultBranding.displayName;
  }

  private sanitizeColor(color?: string | null): string | null {
    if (!color) return null;
    
    // Remove leading # if present for validation
    const hex = color.startsWith('#') ? color.substring(1) : color;
    
    // Validate hex color format (3 or 6 characters, hexadecimal)
    if (!/^[0-9A-Fa-f]{3}$|^[0-9A-Fa-f]{6}$/.test(hex)) {
      return null;
    }

    // Return with leading #
    return `#${hex}`;
  }

  async updateBranding(
    companyId: string,
    branding: {
      displayName?: string;
      logoUrl?: string;
      primaryColor?: string;
      accentColor?: string;
      emailFromName?: string;
      emailFromAddress?: string;
    },
  ): Promise<CompanyBranding> {
    // Sanitize colors if provided
    const updateData: any = {};
    
    if (branding.displayName !== undefined) {
      updateData.displayName = branding.displayName || null;
    }
    if (branding.logoUrl !== undefined) {
      updateData.logoUrl = branding.logoUrl || null;
    }
    if (branding.primaryColor !== undefined) {
      updateData.primaryColor = this.sanitizeColor(branding.primaryColor) || null;
    }
    if (branding.accentColor !== undefined) {
      updateData.accentColor = this.sanitizeColor(branding.accentColor) || null;
    }
    if (branding.emailFromName !== undefined) {
      updateData.emailFromName = branding.emailFromName || null;
    }
    if (branding.emailFromAddress !== undefined) {
      updateData.emailFromAddress = branding.emailFromAddress || null;
    }

    await this.prisma.company.update({
      where: { id: companyId },
      data: updateData,
    });

    return this.getBrandingForCompany(companyId);
  }

  /**
   * Seed default branding for a company if branding fields are empty/null.
   * This method is idempotent - it only updates fields that are null/empty.
   * It never overwrites existing branding configuration.
   */
  async seedBrandingForCompany(companyId: string): Promise<CompanyBranding> {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      select: {
        name: true,
        displayName: true,
        logoUrl: true,
        primaryColor: true,
        accentColor: true,
        emailFromName: true,
        emailFromAddress: true,
      },
    });

    if (!company) {
      throw new Error('Company not found');
    }

    // Build update data only for null/empty fields
    const updateData: any = {};
    let hasChanges = false;

    if (!company.displayName || company.displayName.trim() === '') {
      updateData.displayName = this.defaultBranding.displayName;
      hasChanges = true;
    }

    if (!company.logoUrl || company.logoUrl.trim() === '') {
      // Keep null, don't set default logo
      // updateData.logoUrl = null;
    }

    if (!company.primaryColor || company.primaryColor.trim() === '') {
      updateData.primaryColor = this.defaultBranding.primaryColor;
      hasChanges = true;
    }

    if (!company.accentColor || company.accentColor.trim() === '') {
      updateData.accentColor = this.defaultBranding.accentColor;
      hasChanges = true;
    }

    if (!company.emailFromName || company.emailFromName.trim() === '') {
      updateData.emailFromName = this.defaultBranding.emailFromName;
      hasChanges = true;
    }

    if (!company.emailFromAddress || company.emailFromAddress.trim() === '') {
      updateData.emailFromAddress = this.defaultBranding.emailFromAddress;
      hasChanges = true;
    }

    // Only update if there are changes
    if (hasChanges) {
      await this.prisma.company.update({
        where: { id: companyId },
        data: updateData,
      });
    }

    return this.getBrandingForCompany(companyId);
  }
}
