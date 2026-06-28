import { generateProposalHTML } from "./proposal-template";

const PAGE_HEIGHT = 1123;

type SettingsData = {
  companyName?: unknown;
  companyPhone?: unknown;
  companyEmail?: unknown;
  companyAddress?: unknown;
  companyGstin?: unknown;
  companyLogoUrl?: unknown;
  accountName?: unknown;
  accountNumber?: unknown;
  ifscCode?: unknown;
  upiId?: unknown;
};

type ClientData = {
  name?: unknown;
  company?: unknown;
  billingAddress?: unknown;
  phone?: unknown;
  email?: unknown;
};

type LineItem = {
  description?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  taxRate?: unknown;
  amount?: unknown;
};

type DocumentData = {
  settings?: SettingsData;
  client?: ClientData;
  invoice?: DocumentData;
  items?: LineItem[];
  number?: unknown;
  date?: unknown;
  dueDate?: unknown;
  terms?: unknown;
  notes?: unknown;
  scope?: unknown;
  subTotal?: unknown;
  discountAmount?: unknown;
  taxTotal?: unknown;
  grandTotal?: unknown;
  amount?: unknown;
  paymentMethod?: unknown;
  paidAmount?: unknown;
  proposal?: import("@/lib/quotation/types").ProposalData;
  showTaxes?: boolean;
};

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function preserveLines(value: unknown) {
  return escapeHtml(value).replace(/\n/g, "<br />");
}

function money(value: unknown) {
  return `₹${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function dateValue(value: unknown) {
  if (!value) return "N/A";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function longDateValue(value: unknown) {
  if (!value) return "N/A";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

function company(data: DocumentData) {
  const settings = data?.settings || {};
  return {
    name: String(settings.companyName || "Street2Site LLP"),
    phone: String(settings.companyPhone || "+91 94822 11264"),
    email: String(settings.companyEmail || "street2sitee@gmail.com"),
    address: String(settings.companyAddress || "#492 Dodda Thoguru, Electronic City, Karnataka, 560-100"),
    gstin: String(settings.companyGstin || ""),
    logoUrl: String(settings.companyLogoUrl || ""),
    website: "www.street2site.com",
    accountName: String(settings.accountName || "MAHESH G"),
    accountNumber: String(settings.accountNumber || "3947108334"),
    ifscCode: String(settings.ifscCode || "KKBK0008057"),
    upiId: String(settings.upiId || "mahesh1272001@ybl"),
  };
}

function baseStyles() {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body {
      margin: 0;
      padding: 0;
      background: #ffffff;
      color: #111827;
      font-family: 'Inter', Arial, sans-serif;
    }
    .page {
      width: 794px;
      height: 1122px;
      margin: 0 auto;
      position: relative;
      overflow: hidden;
      background: white;
      padding: 60px 60px 160px;
      page-break-after: always;
    }
    .page:last-child { page-break-after: auto; }
    .brand { color: #f97316; }
    .muted { color: #64748b; }
    .tiny { font-size: 11px; line-height: 1.5; }
    .small { font-size: 13px; line-height: 1.6; }
    
    .footer-wrapper { position: absolute; left: 0; right: 0; bottom: 0; background: white; width: 100%; page-break-inside: avoid; }
    .footer-contact-grid { padding: 25px 60px; display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 20px; align-items: start; }
    .footer-contact-item { display: flex; align-items: center; gap: 12px; }
    .footer-icon-box { width: 34px; height: 34px; background: #f97316; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 4px; }
    .footer-icon-box svg { width: 18px; height: 18px; fill: white; }
    .footer-contact-text { font-size: 10.5px; line-height: 1.4; color: #111827; font-weight: 500; }
    .footer-orange-bar { height: 40px; background: #f97316; width: 100%; border: none; outline: none; }

    .top-line {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      height: 10px;
      background: #f97316;
    }
    .doc-title {
      font-size: 54px;
      line-height: .9;
      font-weight: 900;
      letter-spacing: -2px;
      color: #f97316;
      text-transform: uppercase;
    }
    .section-title {
      font-size: 26px;
      line-height: 1;
      font-weight: 900;
      letter-spacing: -.8px;
      color: #111827;
    }
    .label {
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: #f97316;
    }
    .black-head {
      background: #111827;
      color: #ffffff;
      font-size: 11px;
      letter-spacing: 1.2px;
      text-transform: uppercase;
    }
    table { width: 100%; border-collapse: collapse; }
    th, td { vertical-align: top; }
    .terms li { margin-bottom: 8px; }
  `;
}

function shell(title: string, body: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>${baseStyles()}</style>
</head>
<body>${body}</body>
</html>`;
}

function footer(c: ReturnType<typeof company>, color = "#f97316") {
  const icons = {
    phone: `<svg viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>`,
    web: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24"><path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/></svg>`,
  };

  return `
    <div class="footer-wrapper">
      <div class="footer-contact-grid">
        <div class="footer-contact-item">
          <div class="footer-icon-box" style="background: ${color};">${icons.phone}</div>
          <div class="footer-contact-text">${escapeHtml(c.phone)}<br />+91 8088187900</div>
        </div>
        <div class="footer-contact-item">
          <div class="footer-icon-box" style="background: ${color};">${icons.web}</div>
          <div class="footer-contact-text">${escapeHtml(c.email)}<br />${escapeHtml(c.website)}</div>
        </div>
        <div class="footer-contact-item">
          <div class="footer-icon-box" style="background: ${color};">${icons.pin}</div>
          <div class="footer-contact-text">${escapeHtml(c.address)}</div>
        </div>
      </div>
      <div class="footer-orange-bar" style="background: ${color};"></div>
    </div>
  `;
}



function invoiceTerms(data: DocumentData) {
  if (data?.terms) {
    const clean = String(data.terms).replace("<!--showTaxes:false-->", "").trim();
    return preserveLines(clean);
  }

  return `
    <ul class="terms" style="padding-left: 16px; margin: 0;">
      <li>A minimum advance payment is required to initiate the project.</li>
      <li>The remaining balance must be paid upon project completion and before final handover.</li>
      <li>The invoice amount covers design and development services only.</li>
      <li>Platform subscriptions, domain registration, and third-party services must be paid separately by the client.</li>
      <li>Upon full payment, the client will receive ownership of the final deliverables.</li>
      <li>Support and maintenance services, if required, will be charged separately.</li>
      <li>This invoice is valid for 15 days from the date of issue.</li>
    </ul>
  `;
}

function quotationTerms(data: DocumentData) {
  if (data?.terms) return preserveLines(data.terms);

  return `
    <ul class="terms" style="padding-left: 18px; margin: 0;">
      <li>The estimated project timeline will be confirmed after final scope approval.</li>
      <li>An advance payment is required upon project initiation.</li>
      <li>Upon full payment, the client will own the final approved source files and content.</li>
      <li>This quotation is valid for 30 days from the date of issue.</li>
    </ul>
  `;
}

function firstItem(data: DocumentData): LineItem {
  return data?.items?.[0] || {
    description: "Project Design & Development",
    quantity: 1,
    unitPrice: data?.grandTotal || 0,
    taxRate: 0,
    amount: data?.grandTotal || 0,
  };
}

export function generateInvoiceHTML(data: DocumentData, type: "invoice" | "quotation") {
  return type === "quotation" ? (data.proposal ? generateProposalHTML(data.proposal) : legacyGenerateQuotationHTML(data)) : generateInvoiceOnlyHTML(data);
}

function generateInvoiceOnlyHTML(data: DocumentData) {
  const c = company(data);
  const client = data?.client || {};
  const items = data?.items?.length ? data.items : [firstItem(data)];

  const isPaid = Number(data.paidAmount || 0) >= Number(data.grandTotal || 0);
  const accent = isPaid ? "#f97316" : "#f97316";

  const showTaxes = data.showTaxes !== false && (!data?.terms || !String(data.terms).includes("<!--showTaxes:false-->"));

  const rows = items.map((item: LineItem) => {
    const lineAmount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
    const taxAmount = lineAmount * (Number(item.taxRate || 0) / 100);
    return `<tr>
      <td style="padding: 18px 8px; border-bottom: 1px solid #e5e7eb; ${showTaxes ? "width: 36%;" : "width: 50%;"} font-weight: 700;">${preserveLines(item.description)}</td>
      <td style="padding: 18px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${money(item.unitPrice)}</td>
      <td style="padding: 18px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">${escapeHtml(item.quantity || 0)}</td>
      <td style="padding: 18px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${money(lineAmount)}</td>
      ${showTaxes ? `<td style="padding: 18px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">${money(taxAmount)}</td>` : ""}
      <td style="padding: 18px 8px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 800;">${money(Number(item.amount || lineAmount) + (showTaxes ? taxAmount : 0))}</td>
    </tr>`;
  }).join("");

  return shell(`Invoice - ${data?.number || "document"}`, `
    <div class="page" style="padding-top: 60px;">
      <div class="top-line" style="background: ${accent};"></div>
      <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 56px;">
        <div>
          ${c.logoUrl ? `<img src="${escapeHtml(c.logoUrl)}" style="max-height:64px;max-width:180px;margin-bottom:18px;" />` : `<div style="font-size: 24px; font-weight: 900; margin-bottom: 12px;">${escapeHtml(c.name)}</div>`}
          <div class="tiny muted" style="max-width: 260px;">${preserveLines(c.address)}</div>
          <div class="tiny muted" style="margin-top: 8px;">${escapeHtml(c.phone)}<br />${escapeHtml(c.email)}</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-title" style="color: ${accent};">INVOICE</div>
          <div class="label" style="margin-top: 32px; color: #111827;">INVOICE NO</div>
          <div style="font-size: 26px; font-weight: 900; margin-top: 6px;">${escapeHtml(data?.number || "-")}</div>
        </div>
      </header>

      <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 46px; margin-bottom: 42px;">
        <div>
          <div class="label" style="color: ${accent};">Bill To</div>
          <div style="font-size: 20px; font-weight: 900; margin-top: 12px;">${escapeHtml(client.name || "Client Name")}</div>
          ${client.company ? `<div class="small muted">${escapeHtml(client.company)}</div>` : ""}
          ${client.billingAddress ? `<div class="small muted" style="margin-top: 8px;">${preserveLines(client.billingAddress)}</div>` : ""}
          ${client.email ? `<div class="small muted" style="margin-top: 8px;">${escapeHtml(client.email)}</div>` : ""}
        </div>
        <div style="text-align: right;">
          <div class="label" style="color: #111827;">Date</div>
          <div style="font-size: 18px; font-weight: 800; margin-top: 8px;">${dateValue(data?.date)}</div>
          <div class="label" style="color: #111827; margin-top: 24px;">Due Date</div>
          <div style="font-size: 18px; font-weight: 800; margin-top: 8px;">${dateValue(data?.dueDate)}</div>
        </div>
      </section>

      <table style="margin-bottom: 36px;">
        <thead>
          <tr class="black-head">
            <th style="padding: 13px 8px; text-align: left;">Product</th>
            <th style="padding: 13px 8px; text-align: right;">Price</th>
            <th style="padding: 13px 8px; text-align: center;">Qty</th>
            <th style="padding: 13px 8px; text-align: right;">Subtotal</th>
            ${showTaxes ? `<th style="padding: 13px 8px; text-align: right;">Tax</th>` : ""}
            <th style="padding: 13px 8px; text-align: right;">Total</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <section style="display: grid; grid-template-columns: 1.1fr .9fr; gap: 52px; align-items: start; margin-bottom: 36px;">
        <div>
          <div class="label" style="color: #111827; margin-bottom: 10px;">Payment Data:</div>
          <div class="tiny" style="line-height: 1.8;">
            <div><strong>ACCOUNT#:</strong> ${escapeHtml(c.accountNumber)}</div>
            <div><strong>NAME:</strong> ${escapeHtml(c.accountName)}</div>
            <div><strong>IFSC:</strong> ${escapeHtml(c.ifscCode)}</div>
            <div><strong>UPI ID:</strong> ${escapeHtml(c.upiId)}</div>
          </div>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; padding: 18px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span class="label" style="color:#111827;">Subtotal</span><strong>${money(data?.subTotal)}</strong></div>
          ${data?.discountAmount ? `<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span class="label" style="color:#111827;">Discount</span><strong style="color: #ef4444;">-${money(data.discountAmount)}</strong></div>` : ""}
          ${showTaxes ? `<div style="display: flex; justify-content: space-between; margin-bottom: 12px;"><span class="label" style="color:#111827;">Tax</span><strong>${money(data?.taxTotal)}</strong></div>` : ""}
          <div style="display: flex; justify-content: space-between; border-top: 3px solid #111827; padding-top: 14px; font-size: 22px; font-weight: 900;"><span>TOTAL</span><span style="color: ${accent};">${money(data?.grandTotal)}</span></div>
        </div>
      </section>

      <section style="margin-top: 16px;">
        <div class="section-title" style="font-size: 18px; margin-bottom: 14px;">TERMS AND CONDITIONS</div>
        <div class="tiny muted" style="line-height: 1.55;">${invoiceTerms(data)}</div>
      </section>

      ${footer(c, accent)}
    </div>
  `);
}

function quotationItemRows(items: LineItem[]) {
  return items.map((item: LineItem) => `<tr>
    <td style="padding: 18px 0; border-bottom: 1px solid #e5e7eb; font-size: 20px; font-weight: 800;">${preserveLines(item.description)}</td>
    <td style="padding: 18px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 20px;">${money(item.unitPrice).replace("₹", "")}</td>
    <td style="padding: 18px 0; border-bottom: 1px solid #e5e7eb; text-align: center; font-size: 20px;">${escapeHtml(item.quantity || 0)}</td>
    <td style="padding: 18px 0; border-bottom: 1px solid #e5e7eb; text-align: right; font-size: 20px; font-weight: 800;">${money(item.amount).replace("₹", "")}</td>
  </tr>`).join("");
}

function legacyGenerateQuotationHTML(data: DocumentData) {
  const c = company(data);
  const client = data?.client || {};
  const items = data?.items?.length ? data.items : [firstItem(data)];
  const primary = firstItem(data);
  const requirement = data?.notes || `${client.company || client.name || "The client"} requires a modern, user-friendly, and fully responsive digital solution that reflects the brand, presents services clearly, and supports business growth.`;
  const scope = data?.scope || "Design, development, content integration, responsive layout setup, basic SEO-friendly structure, testing, deployment support, and handover.";

  return shell(`Quotation - ${data?.number || "document"}`, `
    <div class="page" style="padding-top: 60px;">
      <div class="top-line"></div>
      <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 70px;">
        <div>
          ${c.logoUrl ? `<img src="${escapeHtml(c.logoUrl)}" style="max-height:64px;max-width:180px;margin-bottom:18px;" />` : `<div style="font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase;">${escapeHtml(c.name)}</div>`}
          <div class="small muted" style="margin-top: 8px; max-width: 300px;">${preserveLines(c.address)}</div>
          <div class="small muted" style="margin-top: 12px;">${escapeHtml(c.phone)}<br />${escapeHtml(c.email)}</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-title" style="font-size: 46px;">QUOTATION</div>
          <div class="label" style="margin-top: 60px; color: #111827;">Date</div>
          <div style="font-size: 18px; font-weight: 800; margin-top: 6px;">${dateValue(data?.date)}</div>
        </div>
      </header>

      <section style="display: grid; grid-template-columns: 1fr 1.35fr; gap: 42px; margin-bottom: 46px;">
        <div>
          <div class="section-title" style="font-size: 28px; margin-bottom: 16px;">BILL TO:</div>
          <div style="font-size: 18px; font-weight: 900; margin-bottom: 8px;">${escapeHtml(client.company || client.name || "Client Name")}</div>
          ${client.billingAddress ? `<div class="small muted">${preserveLines(client.billingAddress)}</div>` : ""}
          ${client.phone ? `<div class="small muted" style="margin-top: 8px;">${escapeHtml(client.phone)}</div>` : ""}
          ${client.email ? `<div class="small muted">${escapeHtml(client.email)}</div>` : ""}
        </div>
        <div>
          <div class="section-title" style="font-size: 28px; margin-bottom: 18px;">Requirement</div>
          <div class="small" style="line-height: 1.7; text-align: justify;">${preserveLines(requirement)}</div>
        </div>
      </section>

      <section style="margin-top: 44px;">
        <div class="section-title" style="margin-bottom: 22px;">Scope of Work</div>
        <div style="display: grid; grid-template-columns: 1fr 1.65fr; border-top: 2px solid #111827; border-bottom: 2px solid #111827;">
          <div class="label" style="color:#111827; padding: 16px 18px; border-right: 1px solid #d1d5db;">Module</div>
          <div class="label" style="color:#111827; padding: 16px 18px;">Scope</div>
          <div style="padding: 18px; border-top: 1px solid #d1d5db; border-right: 1px solid #d1d5db; font-weight: 800;">${preserveLines(primary.description)}</div>
          <div class="small" style="padding: 18px; border-top: 1px solid #d1d5db; line-height: 1.65;">${preserveLines(scope)}</div>
        </div>
      </section>

      ${footer(c)}
    </div>

    <div class="page">
      <section style="margin-top: 130px;">
        <table>
          <thead>
            <tr>
              <th style="text-align: left; font-size: 28px; font-weight: 900; padding-bottom: 24px;">DETAIL BREAKDOWN</th>
              <th class="label" style="color:#111827; text-align: right; padding-bottom: 24px;">Price</th>
              <th class="label" style="color:#111827; text-align: center; padding-bottom: 24px;">Qty</th>
              <th class="label" style="color:#111827; text-align: right; padding-bottom: 24px;">Total</th>
            </tr>
          </thead>
          <tbody>${quotationItemRows(items)}</tbody>
        </table>

        <div style="margin-top: 56px; display: grid; gap: 34px;">
          <div>
            <div class="section-title" style="font-size: 24px; margin-bottom: 18px;">Additional charges, if applicable</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 22px;">
              <div style="border-top: 3px solid #f97316; padding-top: 14px;">
                <div style="font-weight: 900; margin-bottom: 8px;">Platform charges</div>
                <div class="small muted">Hosting, ecommerce, database, or SaaS plans are billed separately by provider.</div>
              </div>
              <div style="border-top: 3px solid #f97316; padding-top: 14px;">
                <div style="font-weight: 900; margin-bottom: 8px;">Domain charges</div>
                <div class="small muted">Final price depends on selected domain name and extension.</div>
              </div>
              <div style="border-top: 3px solid #f97316; padding-top: 14px;">
                <div style="font-weight: 900; margin-bottom: 8px;">Support service</div>
                <div class="small muted">Maintenance, SEO, and management plans can be added if needed.</div>
              </div>
            </div>
          </div>
        </div>
      </section>
      ${footer(c)}
    </div>

    <div class="page">
      <section style="margin-top: 190px;">
        <table>
          <thead>
            <tr>
              <th style="text-align: left; font-size: 27px; font-weight: 900; padding-bottom: 24px;">FINAL ITEM DESCRIPTION</th>
              <th class="label" style="color:#111827; text-align: right; padding-bottom: 24px;">Price</th>
              <th class="label" style="color:#111827; text-align: center; padding-bottom: 24px;">Qty</th>
              <th class="label" style="color:#111827; text-align: right; padding-bottom: 24px;">Total</th>
            </tr>
          </thead>
          <tbody>${quotationItemRows([primary])}</tbody>
        </table>

        <div style="display: flex; justify-content: flex-end; margin: 54px 0 46px;">
          <div style="width: 290px; border-top: 4px solid #111827; padding-top: 16px; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 26px; font-weight: 900;">Total</span>
            <span style="font-size: 26px; font-weight: 900;" class="brand">Rs ${Number(data?.grandTotal || 0).toLocaleString("en-IN")}</span>
          </div>
        </div>

        <div class="small" style="max-width: 610px; line-height: 1.7; margin-bottom: 34px;">
          <strong>Note :</strong> The final pricing mentioned covers development services only. Client must provide content, images, videos, access credentials, and approvals in a timely manner.
        </div>

        <div class="section-title" style="font-size: 24px; margin-bottom: 18px;">Terms & Conditions</div>
        <div class="small muted" style="line-height: 1.7; max-width: 650px;">${quotationTerms(data)}</div>
      </section>
      ${footer(c)}
    </div>
  `);
}

export function generateReceiptHTML(data: DocumentData) {
  const c = company(data);
  const invoice = data?.invoice || {};
  const client = invoice?.client || {};
  const amount = Number(data?.amount || 0);
  const totalCost = Number(invoice?.grandTotal || amount);
  const paidAmount = Number(invoice?.paidAmount || amount);
  const remainingBalance = Math.max(0, totalCost - paidAmount);
  const isPaid = remainingBalance <= 0;

  return shell(`Payment Receipt - ${data?.number || "document"}`, `
    <div class="page" style="padding-top: 60px;">
      <div class="top-line" style="background:${isPaid ? "#f97316" : "#f97316"};"></div>
      <header style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 58px;">
        <div>
          ${c.logoUrl ? `<img src="${escapeHtml(c.logoUrl)}" style="max-height:64px;max-width:180px;margin-bottom:18px;" />` : `<div style="font-size: 28px; font-weight: 900; text-transform: uppercase;">${escapeHtml(c.name)}</div>`}
          <div class="small muted" style="margin-top: 8px; max-width: 300px;">${preserveLines(c.address)}</div>
          <div class="small muted" style="margin-top: 10px;">${escapeHtml(c.email)} | ${escapeHtml(c.phone)}</div>
        </div>
        <div style="text-align: right;">
          <div class="doc-title" style="font-size: 42px; color:${isPaid ? "#f97316" : "#f97316"};">Payment</div>
          <div class="doc-title" style="font-size: 42px; color:${isPaid ? "#f97316" : "#f97316"};">Receipt</div>
          <div style="margin-top: 18px; display: inline-block; padding: 8px 16px; border: 2px solid ${isPaid ? "#f97316" : "#f97316"}; color:${isPaid ? "#f97316" : "#c2410c"}; font-weight: 900; letter-spacing: 1.5px; text-transform: uppercase;">${isPaid ? "Paid" : "Payment Pending"}</div>
        </div>
      </header>

      <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 48px; margin-bottom: 44px;">
        <div>
          <div class="label">Issued To:</div>
          <div style="font-size: 22px; font-weight: 900; margin-top: 12px;">${escapeHtml(client.name || "Client Name")}</div>
          ${client.company ? `<div class="small muted">${escapeHtml(client.company)}</div>` : ""}
          ${client.billingAddress ? `<div class="small muted" style="margin-top: 8px;">${preserveLines(client.billingAddress)}</div>` : ""}
        </div>
        <div style="text-align: right;">
          <div class="label" style="color:#111827;">Receipt No.</div>
          <div style="font-size: 22px; font-weight: 900; margin-top: 8px;">${escapeHtml(data?.number || "-")}</div>
          <div class="small muted" style="margin-top: 12px;">Invoice No: ${escapeHtml(invoice?.number || "N/A")}</div>
          <div class="small muted">Date: ${dateValue(data?.date)}</div>
        </div>
      </section>

      <section style="border: 2px solid #111827; padding: 28px; margin-bottom: 42px;">
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 26px; text-align: center;">
          <div>
            <div class="label" style="color:#111827;">Total Project Cost</div>
            <div style="font-size: 26px; font-weight: 900; margin-top: 10px;">${money(totalCost)}</div>
          </div>
          <div>
            <div class="label" style="color:#111827;">Amount Paid</div>
            <div style="font-size: 26px; font-weight: 900; margin-top: 10px; color:#f97316;">${money(amount)}</div>
          </div>
          <div>
            <div class="label" style="color:#111827;">Remaining Balance</div>
            <div style="font-size: 26px; font-weight: 900; margin-top: 10px; color:${isPaid ? "#f97316" : "#f97316"};">${money(remainingBalance)}</div>
          </div>
        </div>
      </section>

      <section style="display: grid; grid-template-columns: 1fr 1fr; gap: 42px; margin-bottom: 40px;">
        <div>
          <div class="section-title" style="font-size: 22px; margin-bottom: 14px;">Payment Information</div>
          <div class="small" style="line-height: 1.9;">
            <div><strong>Payment Status:</strong> ${isPaid ? "Paid" : "Partial Payment"}</div>
            <div><strong>Payment Date:</strong> ${dateValue(data?.date)}</div>
            <div><strong>Payment Method:</strong> ${escapeHtml(data?.paymentMethod || "N/A")}</div>
            <div><strong>Transaction / Notes:</strong> ${escapeHtml(data?.notes || "N/A")}</div>
          </div>
        </div>
        <div style="background:#f9fafb; padding: 22px; border-left: 5px solid ${isPaid ? "#f97316" : "#f97316"};">
          <div class="section-title" style="font-size: 22px; margin-bottom: 12px;">Thank You</div>
          <div class="small muted" style="line-height: 1.7;">This receipt confirms that Street2Site has received the payment recorded above. Please keep this document for your records.</div>
        </div>
      </section>

      <div style="position: absolute; left: 48px; right: 48px; bottom: 156px; text-align:center; font-size: 13px; color:#9ca3af; font-style: italic;">This is a system-generated receipt confirming payment.</div>
      ${footer(c, isPaid ? "#f97316" : "#f97316")}
    </div>
  `);
}
