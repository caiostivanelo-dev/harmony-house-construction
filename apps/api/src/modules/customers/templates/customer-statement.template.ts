import { CompanyBranding } from '../../branding/branding.service';

export function generateCustomerStatementHTML(
  data: any,
  includeFinancials: boolean,
  branding?: CompanyBranding,
): string {
  const brandName = branding?.displayName || 'Harmony House';
  const primaryColor = branding?.primaryColor || '#111827';
  const logoUrl = branding?.logoUrl;
  const { customer, documents, totals, generatedAt } = data;

  const customerEmail = typeof customer.emails === 'string'
    ? customer.emails
    : customer.emails?.work || 'N/A';

  const customerPhone = typeof customer.phones === 'string'
    ? customer.phones
    : customer.phones?.work || 'N/A';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Customer Statement - ${customer.name}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 12px;
      line-height: 1.5;
      color: #111827;
      background: white;
      padding: 40px;
    }
    .header {
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 24px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 5px;
    }
    .header p {
      color: #6B7280;
      font-size: 11px;
    }
    .customer-info {
      margin-bottom: 30px;
      padding: 20px;
      background: #F9FAFB;
      border-radius: 8px;
    }
    .customer-info h2 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #111827;
    }
    .customer-info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    .customer-info-item {
      font-size: 12px;
    }
    .customer-info-item strong {
      display: block;
      margin-bottom: 4px;
      color: #111827;
      font-weight: 600;
    }
    .customer-info-item p {
      color: #6B7280;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 30px;
    }
    .summary-card {
      padding: 15px;
      background: #F9FAFB;
      border-radius: 8px;
      border: 1px solid #E5E7EB;
    }
    .summary-card-title {
      font-size: 11px;
      color: #6B7280;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .summary-card-value {
      font-size: 20px;
      font-weight: bold;
      color: #111827;
    }
    .documents-section {
      margin-bottom: 30px;
    }
    .documents-section h3 {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border: 1px solid #E5E7EB;
      border-radius: 8px;
      overflow: hidden;
    }
    thead {
      background: #F9FAFB;
    }
    th {
      padding: 12px 15px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #E5E7EB;
    }
    td {
      padding: 12px 15px;
      font-size: 12px;
      color: #111827;
      border-bottom: 1px solid #E5E7EB;
    }
    tbody tr:last-child td {
      border-bottom: none;
    }
    tbody tr:hover {
      background: #F9FAFB;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
    }
    .status-pending { background: #FEF3C7; color: #92400E; }
    .status-accepted { background: #D1FAE5; color: #065F46; }
    .status-paid { background: #D1FAE5; color: #065F46; }
    .status-overdue { background: #FEE2E2; color: #991B1B; }
    .status-draft { background: #F3F4F6; color: #374151; }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      text-align: center;
      font-size: 10px;
      color: #6B7280;
    }
    .text-right {
      text-align: right;
    }
    .text-muted {
      color: #6B7280;
    }
  </style>
</head>
<body>
  <div class="header">
    ${logoUrl ? `<img src="${logoUrl}" alt="${brandName}" style="max-height: 60px; margin-bottom: 10px;" />` : ''}
    <h1>${brandName}</h1>
    ${!logoUrl ? `<p>Customer Statement</p>` : '<p style="margin-top: 5px;">Customer Statement</p>'}
  </div>

  <div class="customer-info">
    <h2>${customer.name}</h2>
    <div class="customer-info-grid">
      <div class="customer-info-item">
        <strong>Email</strong>
        <p>${customerEmail}</p>
      </div>
      <div class="customer-info-item">
        <strong>Phone</strong>
        <p>${customerPhone}</p>
      </div>
    </div>
  </div>

  ${includeFinancials && totals ? `
  <div class="summary-cards">
    ${totals.totalInvoiced !== undefined ? `
    <div class="summary-card">
      <div class="summary-card-title">Total Invoiced</div>
      <div class="summary-card-value">$${totals.totalInvoiced.toLocaleString()}</div>
    </div>
    ` : ''}
    ${totals.totalPaid !== undefined ? `
    <div class="summary-card">
      <div class="summary-card-title">Total Paid</div>
      <div class="summary-card-value">$${totals.totalPaid.toLocaleString()}</div>
    </div>
    ` : ''}
    ${totals.totalOutstanding !== undefined ? `
    <div class="summary-card">
      <div class="summary-card-title">Total Outstanding</div>
      <div class="summary-card-value">$${totals.totalOutstanding.toLocaleString()}</div>
    </div>
    ` : ''}
  </div>
  ` : ''}

  <div class="documents-section">
    <h3>Documents (${documents.length})</h3>
    <table>
      <thead>
        <tr>
          <th>Number</th>
          <th>Type</th>
          <th>Status</th>
          <th>Project</th>
          ${includeFinancials ? '<th>Total</th><th>Balance</th>' : ''}
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${documents.length === 0 ? `
        <tr>
          <td colspan="${includeFinancials ? 7 : 5}" class="text-center text-muted">No documents found</td>
        </tr>
        ` : documents.map((doc: any) => `
        <tr>
          <td>${doc.number}</td>
          <td>${doc.type}</td>
          <td><span class="status-badge status-${doc.status.toLowerCase()}">${doc.status}</span></td>
          <td>${doc.project?.name || 'N/A'}</td>
          ${includeFinancials ? `
          <td class="text-right">${doc.totalValue !== undefined ? `$${doc.totalValue.toLocaleString()}` : 'N/A'}</td>
          <td class="text-right">${doc.balanceDue !== undefined ? `$${doc.balanceDue.toLocaleString()}` : 'N/A'}</td>
          ` : ''}
          <td>${doc.dueDate ? new Date(doc.dueDate).toLocaleDateString() : 'N/A'}</td>
        </tr>
        `).join('')}
      </tbody>
    </table>
  </div>

  <div class="footer">
    <p>Generated on ${new Date(generatedAt).toLocaleString()}</p>
    <p>${brandName} - Construction Management System</p>
  </div>
</body>
</html>
  `.trim();
}
