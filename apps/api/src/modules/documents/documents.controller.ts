import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards, ForbiddenException, Res } from '@nestjs/common';
import { Response } from 'express';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/user.decorator';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { Role } from '../../common/enums/role.enum';
import { DocumentType } from '../../common/enums/document.enum';

@Controller('documents')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  findAll(
    @Query('customerId') customerId?: string,
    @Query('projectId') projectId?: string,
    @Query('type') type?: string,
    @CurrentUser() user?: any,
  ) {
    return this.documentsService.findAll(customerId, projectId, type, user?.role);
  }

  @Get(':id')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.documentsService.findOne(id, user?.role);
  }

  @Post()
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  create(@Body() createDto: CreateDocumentDto, @CurrentUser() user: any) {
    // SALES can only create ESTIMATES
    if (user.role === Role.SALES && createDto.type !== DocumentType.ESTIMATE) {
      throw new ForbiddenException('SALES role can only create estimates');
    }
    return this.documentsService.create(createDto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  update(@Param('id') id: string, @Body() updateDto: UpdateDocumentDto) {
    return this.documentsService.update(id, updateDto);
  }

  @Get(':id/pdf')
  @Roles(Role.ADMIN, Role.MANAGER, Role.SALES)
  async getEstimatePDF(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Res() res: Response,
  ) {
    const pdfBuffer = await this.documentsService.generateEstimatePDF(id, user.companyId);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="estimate-${id}.pdf"`);
    res.send(pdfBuffer);
  }

  @Get(':id/financials')
  @Roles(Role.ADMIN, Role.MANAGER)
  async getEstimateFinancials(@Param('id') id: string) {
    return this.documentsService.calculateEstimateFinancials(id);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.MANAGER)
  async remove(@Param('id') id: string) {
    return this.documentsService.remove(id);
  }
}
