import { CompanyBranding } from '../../branding/branding.service';

export function generateCustomerStatementEmailHTML(
  customerName: string,
  branding?: CompanyBranding,
): string {
  const brandName = branding?.displayName || 'Harmony House';
  const accentColor = branding?.accentColor || '#0EA5E9';
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Customer Statement</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="border-bottom: 2px solid ${accentColor}; padding-bottom: 20px; margin-bottom: 30px;">
    <h1 style="color: ${accentColor}; margin: 0; font-size: 24px;">${brandName}</h1>
  </div>

  <div style="margin-bottom: 30px;">
    <p>Dear ${customerName},</p>
    <p>Please find attached your current statement, which includes all invoices, estimates, and change orders for your account.</p>
    <p>The statement is also available for download in your customer portal.</p>
  </div>

  <div style="background: #F9FAFB; padding: 15px; border-radius: 8px; margin-bottom: 30px;">
    <p style="margin: 0; font-size: 14px; color: #6B7280;">
      <strong>What's included:</strong>
    </p>
    <ul style="margin: 10px 0 0 20px; color: #6B7280; font-size: 14px;">
      <li>All invoices and payment history</li>
      <li>Active estimates</li>
      <li>Change orders</li>
      <li>Outstanding balances</li>
    </ul>
  </div>

  <div style="margin-bottom: 30px;">
    <p>If you have any questions about your statement, please don't hesitate to contact us.</p>
    <p>Best regards,<br>The ${brandName} Team</p>
  </div>

  <div style="border-top: 1px solid #E5E7EB; padding-top: 20px; margin-top: 40px; text-align: center; font-size: 12px; color: #6B7280;">
    <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
    <p style="margin: 5px 0 0 0;">${brandName} - Construction Management System</p>
  </div>
</body>
</html>
  `.trim();
}
