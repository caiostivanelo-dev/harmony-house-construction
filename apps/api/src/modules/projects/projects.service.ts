import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Role } from '../../common/enums/role.enum';
import * as puppeteer from 'puppeteer';
import { BrandingService } from '../branding/branding.service';
import { generateProjectFinancialHTML } from './templates/project-financial.template';
import { CreateProjectDto } from './dto/create-project.dto';

interface ProjectFinancials {
  totalEstimatedValue: number;
  totalInvoicedValue: number;
  totalPaid: number;
  totalOutstanding: number;
}

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private brandingService?: BrandingService,
  ) {}

  async findAll(customerId?: string, userRole?: Role) {
    const projects = await this.prisma.project.findMany({
      where: customerId ? { customerId } : undefined,
      include: {
        customer: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate financial aggregates for each project
    const projectsWithFinancials = await Promise.all(
      projects.map(async (project) => {
        const financials = await this.calculateProjectFinancials(project.id);
        return {
          ...project,
          ...financials,
        };
      }),
    );

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return projectsWithFinancials.map((project) => ({
        ...project,
        totalPaid: undefined,
        totalOutstanding: undefined,
      }));
    }

    return projectsWithFinancials;
  }

  async findOne(id: string, userRole?: Role) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        customer: true,
      },
    });

    if (!project) {
      return null;
    }

    const financials = await this.calculateProjectFinancials(id);
    const result = {
      ...project,
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

  async create(createDto: CreateProjectDto, companyId: string) {
    // Verify customer exists and belongs to company
    const customer = await this.prisma.customer.findUnique({
      where: { id: createDto.customerId },
    });

    if (!customer) {
      throw new BadRequestException('Customer not found');
    }

    if (customer.companyId !== companyId) {
      throw new BadRequestException('Customer does not belong to your company');
    }

    return this.prisma.project.create({
      data: {
        name: createDto.name,
        customerId: createDto.customerId,
        companyId,
        status: createDto.status || 'PENDING',
      },
      include: {
        customer: true,
      },
    });
  }

  private async calculateProjectFinancials(projectId: string): Promise<ProjectFinancials> {
    const documents = await this.prisma.document.findMany({
      where: { projectId },
    });

    let totalEstimatedValue = 0;
    let totalInvoicedValue = 0;
    let totalPaid = 0;
    let totalOutstanding = 0;

    documents.forEach((doc) => {
      if (doc.type === 'ESTIMATE') {
        totalEstimatedValue += doc.totalValue;
      } else if (doc.type === 'INVOICE') {
        totalInvoicedValue += doc.totalValue;
        if (doc.status === 'PAID' || doc.balanceDue === 0) {
          totalPaid += doc.totalValue;
        }
        totalOutstanding += doc.balanceDue;
      }
    });

    return {
      totalEstimatedValue,
      totalInvoicedValue,
      totalPaid,
      totalOutstanding,
    };
  }

  async getFinancials(projectId: string, userRole?: Role) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        customer: true,
      },
    });

    if (!project) {
      return null;
    }

    const documents = await this.prisma.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    const financials = await this.calculateProjectFinancials(projectId);

    const summary = {
      project: {
        id: project.id,
        name: project.name,
        status: project.status,
      },
      customer: {
        id: project.customer.id,
        name: project.customer.name,
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
      })),
      financials: {
        totalEstimatedValue: financials.totalEstimatedValue,
        totalInvoicedValue: financials.totalInvoicedValue,
        totalPaid: financials.totalPaid,
        totalOutstanding: financials.totalOutstanding,
      },
      generatedAt: new Date().toISOString(),
    };

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return {
        ...summary,
        documents: summary.documents.map((doc) => {
          if (doc.type === 'INVOICE') {
            return {
              ...doc,
              balanceDue: undefined,
              totalValue: undefined,
            };
          }
          return doc;
        }),
        financials: {
          totalEstimatedValue: summary.financials.totalEstimatedValue,
          totalInvoicedValue: summary.financials.totalInvoicedValue,
          totalPaid: undefined,
          totalOutstanding: undefined,
        },
      };
    }

    return summary;
  }

  async generateFinancialsPDF(projectId: string, userRole?: Role, companyId?: string): Promise<Buffer> {
    const financials = await this.getFinancials(projectId, userRole);
    
    if (!financials) {
      throw new Error('Project not found');
    }

    const includeFinancials = userRole === Role.ADMIN || userRole === Role.MANAGER;
    
    // Get branding if companyId provided and brandingService available
    let branding = undefined;
    if (companyId && this.brandingService) {
      branding = await this.brandingService.getBrandingForCompany(companyId);
    }
    
    const html = generateProjectFinancialHTML(financials, includeFinancials, branding);

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
}
