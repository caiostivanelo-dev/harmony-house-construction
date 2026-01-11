import { Controller, Get, Param, Post, Body, Query, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { ProjectsService } from './projects.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateProjectDto } from './dto/create-project.dto';

@Controller('projects')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  findAll(@Query('customerId') customerId?: string, @CurrentUser() user?: any) {
    return this.projectsService.findAll(customerId, user?.role);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@Body() createDto: CreateProjectDto, @CurrentUser() user: any) {
    return this.projectsService.create(createDto, user.companyId);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.projectsService.findOne(id, user?.role);
  }

  @Get(':id/financials')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  getFinancials(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.projectsService.getFinancials(id, user?.role);
  }

  @Get(':id/financials/pdf')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  async getFinancialsPDF(
    @Res() res: Response,
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    const pdfBuffer = await this.projectsService.generateFinancialsPDF(id, user?.role, user?.companyId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="project-financials-${id}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post(':id/financials/email')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  async sendFinancialsEmail(
    @Param('id') id: string,
    @CurrentUser() user?: any,
  ) {
    await this.emailService.sendProjectFinancialEmail(id, user?.role, user?.companyId);
    return { message: 'Financial summary email sent successfully' };
  }
}
