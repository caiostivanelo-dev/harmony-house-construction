import { CompanyBranding } from '../../branding/branding.service';

export function generateProjectFinancialHTML(
  data: any,
  includeFinancials: boolean,
  branding?: CompanyBranding,
): string {
  const brandName = branding?.displayName || 'Harmony House';
  const primaryColor = branding?.primaryColor || '#111827';
  const logoUrl = branding?.logoUrl;
  const { project, customer, documents, financials, generatedAt } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Project Financial Summary - ${project.name}</title>
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
      color: ${primaryColor};
      margin-bottom: 5px;
    }
    .header p {
      color: #6B7280;
      font-size: 11px;
    }
    .project-info {
      margin-bottom: 30px;
      padding: 20px;
      background: #F9FAFB;
      border-radius: 8px;
    }
    .project-info h2 {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #111827;
    }
    .project-info p {
      font-size: 12px;
      color: #6B7280;
    }
    .summary-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
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
    .text-center {
      text-align: center;
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
    ${!logoUrl ? `<p>Project Financial Summary</p>` : '<p style="margin-top: 5px;">Project Financial Summary</p>'}
  </div>

  <div class="project-info">
    <h2>${project.name}</h2>
    <p>Customer: ${customer.name}</p>
    <p>Status: ${project.status}</p>
  </div>

  <div class="summary-cards">
    <div class="summary-card">
      <div class="summary-card-title">Estimated Value</div>
      <div class="summary-card-value">$${financials.totalEstimatedValue.toLocaleString()}</div>
    </div>
    <div class="summary-card">
      <div class="summary-card-title">Invoiced Value</div>
      <div class="summary-card-value">$${financials.totalInvoicedValue.toLocaleString()}</div>
    </div>
    ${includeFinancials && financials.totalPaid !== undefined ? `
    <div class="summary-card">
      <div class="summary-card-title">Total Paid</div>
      <div class="summary-card-value">$${financials.totalPaid.toLocaleString()}</div>
    </div>
    ` : '<div class="summary-card"></div>'}
    ${includeFinancials && financials.totalOutstanding !== undefined ? `
    <div class="summary-card">
      <div class="summary-card-title">Outstanding</div>
      <div class="summary-card-value">$${financials.totalOutstanding.toLocaleString()}</div>
    </div>
    ` : '<div class="summary-card"></div>'}
  </div>

  <div class="documents-section">
    <h3>Documents (${documents.length})</h3>
    <table>
      <thead>
        <tr>
          <th>Number</th>
          <th>Type</th>
          <th>Status</th>
          ${includeFinancials ? '<th>Total</th><th>Balance</th>' : ''}
          <th>Due Date</th>
        </tr>
      </thead>
      <tbody>
        ${documents.length === 0 ? `
        <tr>
          <td colspan="${includeFinancials ? 6 : 4}" class="text-center text-muted">No documents found</td>
        </tr>
        ` : documents.map((doc: any) => `
        <tr>
          <td>${doc.number}</td>
          <td>${doc.type}</td>
          <td><span class="status-badge status-${doc.status.toLowerCase()}">${doc.status}</span></td>
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
