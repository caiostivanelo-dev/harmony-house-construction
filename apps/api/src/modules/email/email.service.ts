import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Role } from '../../common/enums/role.enum';
import { CustomersService } from '../customers/customers.service';
import { ProjectsService } from '../projects/projects.service';
import { BrandingService } from '../branding/branding.service';
import { generateCustomerStatementEmailHTML } from './templates/customer-statement.email';
import { generateProjectFinancialEmailHTML } from './templates/project-financial.email';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(
    private configService: ConfigService,
    private customersService: CustomersService,
    private projectsService: ProjectsService,
    private brandingService: BrandingService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST') || 'smtp.gmail.com',
      port: parseInt(this.configService.get<string>('SMTP_PORT') || '587'),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASSWORD'),
      },
    });
  }

  async sendCustomerStatementEmail(customerId: string, userRole?: Role, companyId?: string): Promise<void> {
    // Get statement data
    const statement = await this.customersService.getStatement(customerId, userRole);
    
    if (!statement) {
      throw new Error('Customer not found');
    }

    // Get company branding
    const companyIdForBranding = companyId || (statement.customer as any).companyId;
    const branding = await this.brandingService.getBrandingForCompany(companyIdForBranding);

    // Generate PDF (will use branding)
    const pdfBuffer = await this.customersService.generateStatementPDF(customerId, userRole, companyIdForBranding);

    // Get customer email
    const emails = statement.customer.emails as any;
    const customerEmail = typeof emails === 'string'
      ? emails
      : emails?.work || emails?.personal;

    if (!customerEmail) {
      throw new Error('Customer email not found');
    }

    // Prepare email with branding
    const html = generateCustomerStatementEmailHTML(statement.customer.name, branding);

    // Send email
    await this.transporter.sendMail({
      from: `"${branding.emailFromName}" <${branding.emailFromAddress}>`,
      to: customerEmail,
      subject: `Statement - ${statement.customer.name}`,
      html,
      attachments: [
        {
          filename: `customer-statement-${customerId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }

  async sendProjectFinancialEmail(projectId: string, userRole?: Role, companyId?: string): Promise<void> {
    // Get financial data
    const financials = await this.projectsService.getFinancials(projectId, userRole);
    
    if (!financials) {
      throw new Error('Project not found');
    }

    // Get company branding
    const companyIdForBranding = companyId || (financials.customer as any).companyId;
    const branding = await this.brandingService.getBrandingForCompany(companyIdForBranding);

    // Generate PDF (will use branding)
    const pdfBuffer = await this.projectsService.generateFinancialsPDF(projectId, userRole, companyIdForBranding);

    // Get customer email from customer ID
    const customer = await this.customersService.findOne(financials.customer.id, userRole);
    
    if (!customer) {
      throw new Error('Customer not found');
    }

    const emails = customer.emails as any;
    const customerEmail = typeof emails === 'string'
      ? emails
      : emails?.work || emails?.personal;

    if (!customerEmail) {
      throw new Error('Customer email not found');
    }

    // Prepare email with branding
    const html = generateProjectFinancialEmailHTML(
      financials.project.name,
      financials.customer.name,
      branding,
    );

    // Send email
    await this.transporter.sendMail({
      from: `"${branding.emailFromName}" <${branding.emailFromAddress}>`,
      to: customerEmail,
      subject: `Project Financial Summary - ${financials.project.name}`,
      html,
      attachments: [
        {
          filename: `project-financials-${projectId}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    });
  }
}
