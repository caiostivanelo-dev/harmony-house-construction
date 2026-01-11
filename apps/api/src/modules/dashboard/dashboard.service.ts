import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DocumentType, DocumentStatus } from '../../common/enums/document.enum';
import { Role } from '../../common/enums/role.enum';

interface DocumentSummary {
  total: number;
  totalAmount: number;
  byStatus: {
    [key in DocumentStatus]?: {
      count: number;
      amount: number;
    };
  };
}

interface DashboardSummary {
  estimates: DocumentSummary;
  invoices: DocumentSummary;
  changeOrders: DocumentSummary;
  outstandingBalance: number;
  paidThisPeriod: number;
  revenueByStatus: {
    [key: string]: number;
  };
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getSummary(userRole?: Role): Promise<DashboardSummary> {
    const documents = await this.prisma.document.findMany();

    // Calculate outstanding balance (sum of all invoice balanceDue)
    const outstandingBalance = documents
      .filter((doc) => doc.type === DocumentType.INVOICE)
      .reduce((sum, doc) => sum + doc.balanceDue, 0);

    // Calculate paid this period (last 30 days, invoices with status PAID or balanceDue = 0)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const paidThisPeriod = documents
      .filter(
        (doc) =>
          doc.type === DocumentType.INVOICE &&
          (doc.status === 'PAID' || doc.balanceDue === 0) &&
          doc.updatedAt >= thirtyDaysAgo,
      )
      .reduce((sum, doc) => sum + doc.totalValue, 0);

    // Calculate revenue by status
    const revenueByStatus: { [key: string]: number } = {};
    documents
      .filter((doc) => doc.type === DocumentType.INVOICE)
      .forEach((doc) => {
        const status = doc.status;
        if (!revenueByStatus[status]) {
          revenueByStatus[status] = 0;
        }
        revenueByStatus[status] += doc.totalValue;
      });

    const summary = {
      estimates: this.calculateDocumentSummary(documents, DocumentType.ESTIMATE),
      invoices: this.calculateDocumentSummary(documents, DocumentType.INVOICE),
      changeOrders: this.calculateDocumentSummary(documents, DocumentType.CHANGE_ORDER),
      outstandingBalance,
      paidThisPeriod,
      revenueByStatus,
    };

    // Filter financial data for SALES role
    if (userRole === Role.SALES) {
      return {
        ...summary,
        invoices: {
          ...summary.invoices,
          // Remove paid/outstanding details for SALES
          byStatus: Object.fromEntries(
            Object.entries(summary.invoices.byStatus).map(([status, data]) => [
              status,
              status === 'PAID' || status === 'OVERDUE'
                ? { count: data.count, amount: 0 }
                : data,
            ]),
          ),
        },
        outstandingBalance: undefined,
        paidThisPeriod: undefined,
        revenueByStatus: Object.fromEntries(
          Object.entries(revenueByStatus).map(([status, amount]) => [
            status,
            status === 'PAID' || status === 'OVERDUE' ? 0 : amount,
          ]),
        ),
      };
    }

    return summary;
  }

  private calculateDocumentSummary(
    documents: any[],
    type: DocumentType,
  ): DocumentSummary {
    const filteredDocs = documents.filter((doc) => doc.type === type);
    
    const total = filteredDocs.length;
    const totalAmount = filteredDocs.reduce((sum, doc) => sum + doc.totalValue, 0);
    
    const byStatus: { [key in DocumentStatus]?: { count: number; amount: number } } = {};
    
    filteredDocs.forEach((doc) => {
      const status = doc.status as DocumentStatus;
      if (!byStatus[status]) {
        byStatus[status] = { count: 0, amount: 0 };
      }
      byStatus[status]!.count += 1;
      byStatus[status]!.amount += doc.totalValue;
    });

    return {
      total,
      totalAmount,
      byStatus,
    };
  }
}
