import { CompanyBranding } from '../../branding/branding.service';

export interface EstimateItem {
  category: string;
  description: string;
  labor?: number;
  materials?: number;
  cost: number;
}

export interface EstimateData {
  number: string;
  projectName?: string;
  estimateDate?: Date | string;
  projectDates?: string;
  preparedBy?: string;
  clientName: string;
  clientAddress?: string;
  items: EstimateItem[];
  totalCost: number;
  validityDays?: number;
  notes?: string;
  branding?: CompanyBranding;
}

export function generateEstimateHTML(data: EstimateData): string {
  const brandName = data.branding?.displayName || 'Harmony House Construction';
  const primaryColor = data.branding?.primaryColor || '#1ECAD3';
  const logoUrl = data.branding?.logoUrl;
  
  const estimateDate = data.estimateDate 
    ? new Date(data.estimateDate).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  
  const validityDays = data.validityDays || 30;
  const validityDate = new Date();
  validityDate.setDate(validityDate.getDate() + validityDays);
  const validityText = `This estimate is valid for ${validityDays} days from the date of issue.`;

  // Check if estimate uses detailed format (has labor or materials)
  const hasDetailedFields = data.items.some(item => item.labor !== undefined || item.materials !== undefined);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Construction Estimate - ${data.number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      font-size: 11px;
      line-height: 1.4;
      color: #111827;
      background: white;
      padding: 30px;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid ${primaryColor};
      padding-bottom: 20px;
    }
    .header-logo {
      margin-bottom: 10px;
    }
    .header-logo img {
      max-height: 60px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: bold;
      color: #111827;
      margin-bottom: 5px;
      letter-spacing: 1px;
    }
    .header h2 {
      font-size: 20px;
      font-weight: 600;
      color: #111827;
      margin-top: 10px;
    }
    .estimate-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .info-section {
      background: #F9FAFB;
      padding: 15px;
      border-radius: 6px;
    }
    .info-section h3 {
      font-size: 10px;
      font-weight: 600;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
      border-bottom: 1px solid #E5E7EB;
      padding-bottom: 5px;
    }
    .info-section p {
      font-size: 12px;
      color: #111827;
      margin: 5px 0;
    }
    .info-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      margin-bottom: 15px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-size: 9px;
      color: #6B7280;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }
    .info-value {
      font-size: 12px;
      color: #111827;
      font-weight: 500;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border: 1px solid #E5E7EB;
    }
    .items-table thead {
      background: #F9FAFB;
    }
    .items-table th {
      padding: 10px 12px;
      text-align: left;
      font-size: 10px;
      font-weight: 600;
      color: #111827;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid ${primaryColor};
    }
    .items-table th:first-child {
      width: 30%;
    }
    .items-table th:nth-child(2) {
      width: 30%;
    }
    .items-table th:last-child {
      width: 10%;
      text-align: right;
    }
    .items-table.simple-format th:nth-child(2) {
      width: 50%;
    }
    .items-table.simple-format th:last-child {
      width: 20%;
    }
    .items-table td {
      padding: 12px;
      font-size: 11px;
      color: #111827;
      border-bottom: 1px solid #E5E7EB;
      vertical-align: top;
    }
    .items-table td:last-child {
      text-align: right;
      font-weight: 600;
    }
    .items-table tbody tr:last-child td {
      border-bottom: none;
    }
    .category-cell {
      font-weight: 600;
      color: #111827;
    }
    .description-cell {
      color: #6B7280;
      line-height: 1.5;
    }
    .cost-cell {
      color: #111827;
      font-size: 12px;
    }
    .total-row {
      background: #F9FAFB;
      font-weight: bold;
    }
    .total-row td {
      padding: 15px 12px;
      font-size: 14px;
      border-top: 2px solid ${primaryColor};
      border-bottom: 2px solid ${primaryColor};
    }
    .total-label {
      text-align: right;
      padding-right: 12px;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
      font-size: 10px;
      color: #6B7280;
      line-height: 1.6;
    }
    .footer p {
      margin-bottom: 8px;
    }
    .footer-notes {
      margin-top: 15px;
      padding: 15px;
      background: #F9FAFB;
      border-radius: 6px;
      border-left: 3px solid ${primaryColor};
    }
    .footer-notes strong {
      color: #111827;
      display: block;
      margin-bottom: 5px;
    }
    .signature-section {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #E5E7EB;
    }
    .signature-line {
      margin-top: 50px;
      border-top: 1px solid #111827;
      width: 300px;
      padding-top: 5px;
      font-size: 10px;
      color: #6B7280;
    }
    .user-note {
      font-size: 9px;
      color: #9CA3AF;
      font-style: italic;
      margin-top: 5px;
    }
  </style>
</head>
<body>
  <div class="header">
    ${logoUrl ? `<div class="header-logo"><img src="${logoUrl}" alt="${brandName}" /></div>` : ''}
    <h1>CONSTRUCTION</h1>
    <h2>${brandName.toUpperCase()}</h2>
    <p class="user-note">User to complete non-shaded fields only.</p>
  </div>

  <div style="text-align: center; margin-bottom: 25px;">
    <h1 style="font-size: 24px; font-weight: bold; color: #111827; margin-bottom: 10px;">CONSTRUCTION ESTIMATE</h1>
    <h2 style="font-size: 18px; font-weight: 600; color: #111827;">${brandName.toUpperCase()}</h2>
  </div>

  <div class="estimate-info">
    <div class="info-section">
      <div class="info-row">
        <div class="info-item">
          <div class="info-label">ESTIMATE NUMBER</div>
          <div class="info-value">${data.number}</div>
        </div>
        <div class="info-item">
          <div class="info-label">DATE OF ESTIMATE</div>
          <div class="info-value">${estimateDate}</div>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <div class="info-label">PROJECT NAME</div>
          <div class="info-value">${data.projectName || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">DATES OF PROJECT</div>
          <div class="info-value">${data.projectDates || 'TBT'}</div>
        </div>
      </div>
      <div class="info-row">
        <div class="info-item">
          <div class="info-label">ESTIMATE PREPARED BY</div>
          <div class="info-value">${data.preparedBy || ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">CLIENT NAME</div>
          <div class="info-value">${data.clientName}</div>
        </div>
      </div>
      ${data.clientAddress ? `
      <div class="info-item" style="margin-top: 10px;">
        <div class="info-value" style="font-size: 11px; color: #6B7280;">${data.clientAddress}</div>
      </div>
      ` : ''}
    </div>
  </div>

  ${hasDetailedFields ? `
    <!-- Detailed format with Labor and Materials -->
    <table class="items-table">
      <thead>
        <tr>
          <th>SITEWORK</th>
          <th>NOTES</th>
          <th>LABOR</th>
          <th>MATERIALS</th>
          <th>TOTAL COST</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => {
          const labor = item.labor || 0;
          const materials = item.materials || 0;
          const itemCost = labor + materials || item.cost;
          return `
          <tr>
            <td class="category-cell">${item.category}</td>
            <td class="description-cell">${item.description || ''}</td>
            <td class="cost-cell">$${labor.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="cost-cell">$${materials.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
            <td class="cost-cell">$${itemCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `}).join('')}
        <tr class="total-row">
          <td colspan="4" class="total-label">TOTAL SITE COSTS</td>
          <td class="cost-cell">$${data.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  ` : `
    <!-- Simple format -->
    <table class="items-table">
      <thead>
        <tr>
          <th>SCOOP OF WORK PER PLAN</th>
          <th>NOTES</th>
          <th>TOTAL COST</th>
        </tr>
      </thead>
      <tbody>
        ${data.items.map(item => `
          <tr>
            <td class="category-cell">${item.category}</td>
            <td class="description-cell">${item.description}</td>
            <td class="cost-cell">$${item.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="2" class="total-label">TOTAL SITE COSTS</td>
          <td class="cost-cell">$${data.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
        </tr>
      </tbody>
    </table>
  `}

  <div class="footer">
    <p><strong>Validity:</strong> ${validityText}</p>
    <p>All work will be performed in accordance with Florida building codes. The permit and city fees are a client responsibility. If necessary to require sub-permits for plumbing and electrical works the price will be increased in 15%.</p>
    ${data.notes ? `
    <div class="footer-notes">
      <strong>Additional Notes:</strong>
      <div>${data.notes}</div>
    </div>
    ` : ''}
    <p style="margin-top: 20px;">
      <strong>For questions concerning this estimate, please contact</strong><br>
      ${brandName}<br>
      ${data.branding?.emailFromAddress || 'info@shhconstructions.com'}<br>
      ${data.branding?.emailFromName || 'www.shhconstructions.com'}
    </p>
  </div>

  <div class="signature-section">
    <div class="signature-line">
      AUTHORIZED SIGNATURE
    </div>
  </div>
</body>
</html>
  `;
}
