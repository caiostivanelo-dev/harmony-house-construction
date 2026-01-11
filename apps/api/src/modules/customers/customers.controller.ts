import { Controller, Get, Param, Post, Patch, Body, UseGuards, Res } from '@nestjs/common';
import { Response } from 'express';
import { CustomersService } from './customers.service';
import { EmailService } from '../email/email.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { Role } from '../../common/enums/role.enum';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CustomersController {
  constructor(
    private readonly customersService: CustomersService,
    private readonly emailService: EmailService,
  ) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  findAll(@CurrentUser() user: any) {
    return this.customersService.findAll(user.role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.findOne(id, user.role);
  }

  @Get(':id/statement')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  getStatement(@Param('id') id: string, @CurrentUser() user: any) {
    return this.customersService.getStatement(id, user.role);
  }

  @Get(':id/statement/pdf')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  async getStatementPDF(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.customersService.generateStatementPDF(id, user.role, user.companyId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="customer-statement-${id}.pdf"`);
    res.send(pdfBuffer);
  }

  @Post(':id/statement/email')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  async sendStatementEmail(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    await this.emailService.sendCustomerStatementEmail(id, user.role, user.companyId);
    return { message: 'Statement email sent successfully' };
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@Body() createDto: CreateCustomerDto, @CurrentUser() user: any) {
    return this.customersService.create(createDto, user.companyId);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  update(@Param('id') id: string, @Body() updateDto: UpdateCustomerDto, @CurrentUser() user: any) {
    return this.customersService.update(id, updateDto);
  }
}
