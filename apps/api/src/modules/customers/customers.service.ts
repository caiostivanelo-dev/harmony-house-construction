import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import * as puppeteer from 'puppeteer';
import { BrandingService } from '../branding/branding.service';
import { generateCustomerStatementHTML } from './templates/customer-statement.template';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

interface CustomerFinancials {
  totalEstimatesValue: number;
  totalInvoicesValue: number;
  totalPaid: number;
  totalOutstanding: number;
  documentsCount: number;
  projectsCount: number;
}

@Injectable()
export class CustomersService {
  constructor(
    private prisma: PrismaService,
    private brandingService?: BrandingService,
  ) {}

  async findAll(userRole?: Role) {
    const customers = await this.prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
    });

    // Calculate financial aggregates for each customer
    const customersWithFinancials = await Promise.all(
      customers.map(async (customer) => {
        const financials = await this.calculateCustomerFinancials(customer.id);
        return {
          ...customer,
          ...financials,
        };
      }),
    );

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return customersWithFinancials.map((customer) => ({
        ...customer,
        totalPaid: undefined,
        totalOutstanding: undefined,
      }));
    }

    return customersWithFinancials;
  }

  async findOne(id: string, userRole?: Role) {
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      return null;
    }

    const financials = await this.calculateCustomerFinancials(id);
    const result = {
      ...customer,
      ...financials,
    };

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return {
        ...result,
        totalPaid: undefined,
        totalOutstanding: undefined,
      };
    }

    return result;
  }

  async create(createDto: CreateCustomerDto, companyId: string) {
    // Parse JSON fields
    const customer = await this.prisma.customer.create({
      data: {
        companyId,
        name: createDto.name,
        emails: JSON.stringify(createDto.emails),
        phones: JSON.stringify(createDto.phones),
        addresses: JSON.stringify(createDto.addresses || []),
        leadSource: createDto.leadSource || null,
        notes: createDto.notes || null,
      },
    });

    return {
      ...customer,
      emails: JSON.parse(customer.emails),
      phones: JSON.parse(customer.phones),
      addresses: JSON.parse(customer.addresses),
      totalEstimatesValue: 0,
      totalInvoicesValue: 0,
      totalPaid: 0,
      totalOutstanding: 0,
      documentsCount: 0,
      projectsCount: 0,
    };
  }

  async update(id: string, updateDto: UpdateCustomerDto) {
    const existing = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new Error('Customer not found');
    }

    // Parse JSON fields if provided
    const updateData: any = {};
    if (updateDto.name !== undefined) updateData.name = updateDto.name;
    if (updateDto.emails !== undefined) updateData.emails = JSON.stringify(updateDto.emails);
    if (updateDto.phones !== undefined) updateData.phones = JSON.stringify(updateDto.phones);
    if (updateDto.addresses !== undefined) updateData.addresses = JSON.stringify(updateDto.addresses);
    if (updateDto.leadSource !== undefined) updateData.leadSource = updateDto.leadSource || null;
    if (updateDto.notes !== undefined) updateData.notes = updateDto.notes || null;

    const customer = await this.prisma.customer.update({
      where: { id },
      data: updateData,
    });

    const financials = await this.calculateCustomerFinancials(id);

    return {
      ...customer,
      emails: JSON.parse(customer.emails),
      phones: JSON.parse(customer.phones),
      addresses: JSON.parse(customer.addresses),
      ...financials,
    };
  }

  async getStatement(customerId: string, userRole?: Role) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      return null;
    }

    const documents = await this.prisma.document.findMany({
      where: { customerId },
      include: {
        project: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let totalInvoiced = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    documents.forEach((doc) => {
      if (doc.type === 'INVOICE') {
        totalInvoiced += doc.totalValue;
        if (doc.status === 'PAID' || doc.balanceDue === 0) {
          totalPaid += doc.totalValue;
        }
        totalOutstanding += doc.balanceDue;
      }
    });

    const statement = {
      customer: {
        id: customer.id,
        name: customer.name,
        emails: customer.emails,
        phones: customer.phones,
        addresses: customer.addresses,
      },
      documents: documents.map((doc) => ({
        id: doc.id,
        number: doc.number,
        type: doc.type,
        status: doc.status,
        totalValue: doc.totalValue,
        balanceDue: doc.balanceDue,
        sentDate: doc.sentDate,
        dueDate: doc.dueDate,
        project: doc.project ? { id: doc.project.id, name: doc.project.name } : null,
      })),
      totals: {
        totalInvoiced,
        totalPaid,
        totalOutstanding,
      },
      generatedAt: new Date().toISOString(),
    };

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return {
        ...statement,
        documents: statement.documents.map((doc) => {
          if (doc.type === 'INVOICE') {
            return {
              ...doc,
              balanceDue: undefined,
              totalValue: undefined,
            };
          }
          return doc;
        }),
        totals: {
          totalInvoiced: undefined,
          totalPaid: undefined,
          totalOutstanding: undefined,
        },
      };
    }

    return statement;
  }

  async generateStatementPDF(customerId: string, userRole?: Role, companyId?: string): Promise<Buffer> {
    const statement = await this.getStatement(customerId, userRole);
    
    if (!statement) {
      throw new Error('Customer not found');
    }

    const includeFinancials = userRole === Role.ADMIN || userRole === Role.MANAGER;
    
    // Get branding if companyId provided and brandingService available
    let branding = undefined;
    if (companyId && this.brandingService) {
      branding = await this.brandingService.getBrandingForCompany(companyId);
    }
    
    const html = generateCustomerStatementHTML(statement, includeFinancials, branding);

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
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      return Buffer.from(pdf);
    } finally {
      await browser.close();
    }
  }

  private async calculateCustomerFinancials(customerId: string): Promise<CustomerFinancials> {
    const [documents, projects] = await Promise.all([
      this.prisma.document.findMany({
        where: { customerId },
      }),
      this.prisma.project.findMany({
        where: { customerId },
      }),
    ]);

    let totalEstimatesValue = 0;
    let totalInvoicesValue = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    documents.forEach((doc) => {
      if (doc.type === 'ESTIMATE') {
        totalEstimatesValue += doc.totalValue;
      } else if (doc.type === 'INVOICE') {
        totalInvoicesValue += doc.totalValue;
        if (doc.status === 'PAID' || doc.balanceDue === 0) {
          totalPaid += doc.totalValue;
        }
        totalOutstanding += doc.balanceDue;
      }
    });

    return {
      totalEstimatesValue,
      totalInvoicesValue,
      totalPaid,
      totalOutstanding,
      documentsCount: documents.length,
      projectsCount: projects.length,
    };
  }
}
