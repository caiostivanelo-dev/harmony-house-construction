import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Role } from '../../common/enums/role.enum';
import * as puppeteer from 'puppeteer';
import { generateEstimateHTML, EstimateData } from './templates/estimate.template';
import { BrandingService } from '../branding/branding.service';

@Injectable()
export class DocumentsService {
  constructor(
    private prisma: PrismaService,
    private brandingService?: BrandingService,
  ) {}

  async findAll(customerId?: string, projectId?: string, type?: string, userRole?: Role) {
    const documents = await this.prisma.document.findMany({
      where: {
        ...(customerId && { customerId }),
        ...(projectId && { projectId }),
        ...(type && { type }),
      },
      include: {
        customer: true,
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Parse JSON fields
    const parsedDocuments = documents.map((doc) => {
      const parsed: any = { ...doc };
      if (doc.items) {
        try {
          parsed.items = JSON.parse(doc.items);
        } catch {
          parsed.items = null;
        }
      }
      return parsed;
    });

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return parsedDocuments.map((doc) => {
        if (doc.type === 'INVOICE') {
          return {
            ...doc,
            balanceDue: undefined,
            totalValue: doc.type === 'INVOICE' ? undefined : doc.totalValue,
          };
        }
        return doc;
      });
    }

    return parsedDocuments;
  }

  async findOne(id: string, userRole?: Role) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        customer: true,
        project: true,
      },
    });

    if (!document) {
      return null;
    }

    // Parse JSON fields
    const parsed: any = { ...document };
    if (document.items) {
      try {
        const parsedItems = JSON.parse(document.items);
        // Check if it's sections (array of objects with 'items' property) or legacy items
        if (Array.isArray(parsedItems) && parsedItems.length > 0 && parsedItems[0].items) {
          parsed.sections = parsedItems;
          parsed.items = null; // Legacy format not used
        } else {
          parsed.items = parsedItems;
          parsed.sections = null;
        }
      } catch {
        parsed.items = null;
        parsed.sections = null;
      }
    }

    // Filter financial data for SALES role
    if (userRole === Role.SALES && document.type === 'INVOICE') {
      return {
        ...parsed,
        balanceDue: undefined,
        totalValue: undefined,
      };
    }

    return parsed;
  }

  async create(createDto: CreateDocumentDto) {
    // Calculate balanceDue based on status if not explicitly set
    const balanceDue = this.calculateBalanceDue(
      createDto.totalValue,
      createDto.balanceDue ?? createDto.totalValue,
      createDto.status,
    );
    
    // Validate financial rules
    this.validateFinancialRules(createDto.totalValue, balanceDue, createDto.status);
    
    // Generate document number if not provided
    const number = createDto.number || await this.generateDocumentNumber(createDto.type);
    
    // Calculate total from sections (advanced) or items (legacy)
    let finalTotalValue = createDto.totalValue;
    if (createDto.sections && createDto.sections.length > 0 && !createDto.totalValue) {
      // Calculate from advanced sections
      let subtotal = 0;
      let taxAmount = 0;
      const taxRate = createDto.taxRate || 0;

      createDto.sections.forEach((section) => {
        section.items.forEach((item) => {
          if (item.visible !== 0) { // Only visible items
            subtotal += item.customerPrice || 0;
            const itemTax = item.taxAmount || (item.tax || taxRate) * (item.customerPrice || 0) / 100;
            taxAmount += itemTax;
          }
        });
      });

      finalTotalValue = subtotal + taxAmount;
    } else if (createDto.items && createDto.items.length > 0 && !createDto.totalValue) {
      // Legacy format
      finalTotalValue = createDto.items.reduce((sum, item) => sum + item.cost, 0);
    }
    
    // Store sections or items
    const itemsData = createDto.sections 
      ? JSON.stringify(createDto.sections) 
      : (createDto.items ? JSON.stringify(createDto.items) : null);
    
    return this.prisma.document.create({
      data: {
        type: createDto.type,
        customerId: createDto.customerId,
        projectId: createDto.projectId || null,
        totalValue: finalTotalValue,
        balanceDue,
        status: createDto.status,
        number,
        sentDate: createDto.sentDate ? new Date(createDto.sentDate) : null,
        dueDate: createDto.dueDate ? new Date(createDto.dueDate) : null,
        // Estimate-specific fields
        estimateDate: createDto.estimateDate ? new Date(createDto.estimateDate) : null,
        projectDates: createDto.projectDates || null,
        preparedBy: createDto.preparedBy || null,
        validityDays: createDto.validityDays || (createDto.type === 'ESTIMATE' ? 30 : null),
        notes: createDto.notes || null,
        introduction: createDto.introduction || null,
        taxRate: createDto.taxRate || null,
        items: itemsData,
      },
      include: {
        customer: true,
        project: true,
      },
    });
  }

  async update(id: string, updateDto: UpdateDocumentDto) {
    const existing = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new BadRequestException('Document not found');
    }

    // Calculate total from sections (advanced) or items (legacy)
    let finalTotalValue = updateDto.totalValue ?? existing.totalValue;
    if (updateDto.sections && updateDto.sections.length > 0) {
      // Calculate from advanced sections
      let subtotal = 0;
      let taxAmount = 0;
      const taxRate = updateDto.taxRate ?? (existing as any).taxRate ?? 0;

      updateDto.sections.forEach((section) => {
        section.items.forEach((item) => {
          if (item.visible !== 0) { // Only visible items
            subtotal += item.customerPrice || 0;
            const itemTax = item.taxAmount || (item.tax || taxRate) * (item.customerPrice || 0) / 100;
            taxAmount += itemTax;
          }
        });
      });

      finalTotalValue = subtotal + taxAmount;
    } else if (updateDto.items && updateDto.items.length > 0) {
      // Legacy format
      finalTotalValue = updateDto.items.reduce((sum, item) => sum + item.cost, 0);
    }

    // Get final values after update
    const status = (updateDto.status ?? existing.status) as any;
    const balanceDue = this.calculateBalanceDue(
      finalTotalValue,
      updateDto.balanceDue ?? existing.balanceDue,
      status,
    );

    // Validate financial rules
    this.validateFinancialRules(finalTotalValue, balanceDue, status);

    const updateData: any = {
      ...(updateDto.type !== undefined && { type: updateDto.type }),
      ...(updateDto.customerId !== undefined && { customerId: updateDto.customerId }),
      ...(updateDto.projectId !== undefined && { projectId: updateDto.projectId || null }),
      ...(updateDto.totalValue !== undefined || updateDto.items !== undefined ? { totalValue: finalTotalValue } : {}),
      balanceDue,
      ...(updateDto.status !== undefined && { status: updateDto.status }),
      ...(updateDto.sentDate !== undefined && { sentDate: updateDto.sentDate ? new Date(updateDto.sentDate) : null }),
      ...(updateDto.dueDate !== undefined && { dueDate: updateDto.dueDate ? new Date(updateDto.dueDate) : null }),
      // Estimate-specific fields
      ...(updateDto.estimateDate !== undefined && { estimateDate: updateDto.estimateDate ? new Date(updateDto.estimateDate) : null }),
      ...(updateDto.projectDates !== undefined && { projectDates: updateDto.projectDates }),
      ...(updateDto.preparedBy !== undefined && { preparedBy: updateDto.preparedBy }),
      ...(updateDto.validityDays !== undefined && { validityDays: updateDto.validityDays }),
      ...(updateDto.notes !== undefined && { notes: updateDto.notes }),
      ...(updateDto.introduction !== undefined && { introduction: updateDto.introduction }),
      ...(updateDto.taxRate !== undefined && { taxRate: updateDto.taxRate }),
      ...(updateDto.sections !== undefined ? { items: updateDto.sections ? JSON.stringify(updateDto.sections) : null } : {}),
      ...(updateDto.items !== undefined && updateDto.sections === undefined ? { items: updateDto.items ? JSON.stringify(updateDto.items) : null } : {}),
    };

    return this.prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        customer: true,
        project: true,
      },
    });
  }

  private calculateBalanceDue(
    totalValue: number,
    providedBalanceDue: number,
    status: string,
  ): number {
    // If status is PAID, balance is always 0
    if (status === 'PAID') {
      return 0;
    }

    // If status is PENDING or ACCEPTED, balance equals total
    if (status === 'PENDING' || status === 'ACCEPTED') {
      return totalValue;
    }

    // For DRAFT or OVERDUE, use provided balance or default to totalValue
    // But ensure it doesn't exceed totalValue
    return Math.min(providedBalanceDue, totalValue);
  }

  private validateFinancialRules(
    totalValue: number,
    balanceDue: number,
    status: string,
  ): void {
    if (totalValue < 0) {
      throw new BadRequestException('Total value cannot be negative');
    }

    if (balanceDue < 0) {
      throw new BadRequestException('Balance due cannot be negative');
    }

    if (balanceDue > totalValue) {
      throw new BadRequestException('Balance due cannot exceed total value');
    }

    // Additional validation: PAID status must have balanceDue = 0
    if (status === 'PAID' && balanceDue !== 0) {
      throw new BadRequestException('Paid documents must have balance due of 0');
    }
  }

  private async generateDocumentNumber(type: string): Promise<string> {
    const prefix = type === 'ESTIMATE' ? 'EST' : type === 'INVOICE' ? 'INV' : 'CO';
    const year = new Date().getFullYear();
    const count = await this.prisma.document.count({
      where: {
        type: type as any,
        number: {
          startsWith: `${prefix}-${year}`,
        },
      },
    });
    return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
  }

  async generateEstimatePDF(documentId: string, companyId?: string): Promise<Buffer> {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: {
        customer: true,
        project: true,
      },
    });

    if (!document || document.type !== 'ESTIMATE') {
      throw new BadRequestException('Document not found or is not an estimate');
    }

    // Parse items
    let items: any[] = [];
    if (document.items) {
      try {
        items = JSON.parse(document.items);
      } catch {
        items = [];
      }
    }

    // Get customer address
    let clientAddress = '';
    if (document.customer.addresses) {
      try {
        const addresses = JSON.parse(document.customer.addresses);
        if (addresses.length > 0) {
          const addr = addresses[0];
          clientAddress = `${addr.street}, ${addr.city}, ${addr.state} ${addr.zip}`;
        }
      } catch {
        // Ignore parse error
      }
    }

    // Get branding
    let branding = undefined;
    if (companyId && this.brandingService) {
      branding = await this.brandingService.getBrandingForCompany(companyId);
    }

    const estimateData: EstimateData = {
      number: document.number,
      projectName: document.project?.name,
      estimateDate: document.estimateDate || document.createdAt,
      projectDates: document.projectDates || 'TBT',
      preparedBy: document.preparedBy || '',
      clientName: document.customer.name,
      clientAddress,
      items: items.length > 0 ? items : [{ category: 'General Work', description: 'Construction work per plans', cost: document.totalValue }],
      totalCost: document.totalValue,
      validityDays: document.validityDays || 30,
      notes: document.notes || undefined,
      branding,
    };

    const html = generateEstimateHTML(estimateData);

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const pdf = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '15mm',
          right: '15mm',
          bottom: '15mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  async calculateEstimateFinancials(documentId: string) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document || document.type !== 'ESTIMATE') {
      throw new BadRequestException('Document not found or is not an estimate');
    }

    let sections: any[] = [];
    if (document.items) {
      try {
        const parsed = JSON.parse(document.items);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].items) {
          sections = parsed;
        }
      } catch {
        sections = [];
      }
    }

    let totalCompanyLaborCost = 0;
    let totalCompanyMaterialCost = 0;
    let totalCompanyOtherCost = 0;
    let totalCustomerSubtotal = 0;
    let totalTaxAmount = 0;
    const taxRate = (document as any).taxRate || 0;

    sections.forEach((section) => {
      section.items.forEach((item: any) => {
        if (item.visible !== 0) {
          totalCustomerSubtotal += item.customerPrice || 0;
          const itemTax = item.taxAmount || (item.tax || taxRate) * (item.customerPrice || 0) / 100;
          totalTaxAmount += itemTax;

          if (item.type === 'LABOR') {
            totalCompanyLaborCost += item.companyCost || 0;
          } else if (item.type === 'MATERIAL') {
            totalCompanyMaterialCost += item.companyCost || 0;
          } else if (item.type === 'OTHER_COST') {
            totalCompanyOtherCost += item.companyCost || 0;
          }
        }
      });
    });

    const totalCompanyCosts = totalCompanyLaborCost + totalCompanyMaterialCost + totalCompanyOtherCost;
    const grossProfit = totalCustomerSubtotal - totalCompanyCosts;
    const markup = totalCompanyCosts > 0 ? ((totalCustomerSubtotal - totalCompanyCosts) / totalCompanyCosts) * 100 : 0;
    const margin = totalCustomerSubtotal > 0 ? (grossProfit / totalCustomerSubtotal) * 100 : 0;
    const estimatedTotal = totalCustomerSubtotal + totalTaxAmount;

    return {
      companyCosts: {
        labor: totalCompanyLaborCost,
        material: totalCompanyMaterialCost,
        other: totalCompanyOtherCost,
        total: totalCompanyCosts,
      },
      customerCosts: {
        subtotal: totalCustomerSubtotal,
        tax: totalTaxAmount,
        total: estimatedTotal,
      },
      profit: {
        gross: grossProfit,
        markup: markup,
        margin: margin,
      },
      taxRate,
    };
  }

  async remove(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });

    if (!document) {
      throw new BadRequestException('Document not found');
    }

    await this.prisma.document.delete({
      where: { id },
    });

    return { message: 'Document deleted successfully' };
  }
}
