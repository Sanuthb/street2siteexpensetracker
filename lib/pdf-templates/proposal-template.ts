import { calculateProposalTotals, getPricingItemTotal } from "@/lib/quotation/calculations";
import type { ProposalData, ProposalTemplateId } from "@/lib/quotation/types";

function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeHtml(value: unknown) {
  return String(value || "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[^"]*"/gi, "")
    .replace(/javascript:/gi, "");
}

function money(value: unknown, currency = "INR") {
  const prefix = currency === "INR" ? "₹" : `${currency} `;
  return `${prefix}${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function dateValue(value: unknown) {
  if (!value) return "N/A";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function theme(template: ProposalTemplateId) {
  const themes = {
    "modern-orange": { accent: "#f97316", dark: "#111827", soft: "#fff7ed", text: "#111827", page: "#ffffff" },
    corporate: { accent: "#2563eb", dark: "#0f172a", soft: "#eff6ff", text: "#0f172a", page: "#ffffff" },
    minimal: { accent: "#111827", dark: "#111827", soft: "#f3f4f6", text: "#111827", page: "#ffffff" },
    dark: { accent: "#fb923c", dark: "#020617", soft: "#111827", text: "#f8fafc", page: "#0f172a" },
  };
  return themes[template] || themes["modern-orange"];
}

function styles(proposal: ProposalData) {
  const t = theme(proposal.template);
  return `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
    @page { size: A4; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { margin: 0; padding: 0; background: #ffffff; color: ${t.text}; font-family: 'Inter', Arial, sans-serif; }
    .proposal-page { width: 794px; height: 1122px; margin: 0 auto; padding: 60px 60px 160px; background: ${t.page}; position: relative; overflow: hidden; page-break-after: always; }
    .proposal-page:last-child { page-break-after: auto; }
    .cover { background: linear-gradient(135deg, ${t.page} 0%, ${t.soft} 100%); }
    .accent { color: ${t.accent}; }
    .muted { color: ${proposal.template === "dark" ? "#cbd5e1" : "#64748b"}; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 1.8px; font-weight: 800; color: ${t.accent}; }
    .title { font-size: 56px; line-height: .95; font-weight: 900; letter-spacing: -2px; }
    .section-title { font-size: 28px; font-weight: 900; letter-spacing: -.7px; margin: 0 0 18px; }
    .card { border: 1px solid ${proposal.template === "dark" ? "#334155" : "#e2e8f0"}; border-radius: 22px; padding: 24px; background: ${proposal.template === "dark" ? "#1e293b" : "rgba(255,255,255,.78)"}; }
    
    .footer-wrapper { position: absolute; left: 0; right: 0; bottom: 0; background: ${t.page}; width: 100%; page-break-inside: avoid; }
    .footer-contact-grid { padding: 25px 60px; display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 20px; align-items: start; }
    .footer-contact-item { display: flex; align-items: center; gap: 12px; }
    .footer-icon-box { width: 34px; height: 34px; background: ${t.accent}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; border-radius: 4px; }
    .footer-icon-box svg { width: 18px; height: 18px; fill: white; }
    .footer-contact-text { font-size: 10.5px; line-height: 1.4; color: ${t.text}; font-weight: 500; }
    .footer-orange-bar { height: 40px; background: ${t.accent}; width: 100%; border: none; outline: none; }

    .watermark { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: 90px; font-weight: 900; color: ${t.accent}; opacity: .045; transform: rotate(-28deg); pointer-events: none; }
    table { width: 100%; border-collapse: collapse; }
    th { text-align: left; font-size: 11px; text-transform: uppercase; letter-spacing: 1.3px; color: ${t.accent}; padding: 12px 10px; border-bottom: 2px solid ${t.dark}; }
    td { padding: 15px 10px; border-bottom: 1px solid ${proposal.template === "dark" ? "#334155" : "#e2e8f0"}; vertical-align: top; }
    .pill { display: inline-flex; padding: 7px 12px; border-radius: 999px; background: ${t.soft}; color: ${t.accent}; font-weight: 800; font-size: 12px; }
    .html-content { font-size: 15px; line-height: 1.75; }
    .html-content ul { padding-left: 22px; }
    .html-content li { margin-bottom: 7px; }
  `;
}

function footer(proposal: ProposalData) {
  const f = proposal.footer;
  const t = theme(proposal.template);
  
  const icons = {
    phone: `<svg viewBox="0 0 24 24"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>`,
    web: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-globe" viewBox="0 0 16 16">
  <path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8m7.5-6.923c-.67.204-1.335.82-1.887 1.855A8 8 0 0 0 5.145 4H7.5zM4.09 4a9.3 9.3 0 0 1 .64-1.539 7 7 0 0 1 .597-.933A7.03 7.03 0 0 0 2.255 4zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a7 7 0 0 0-.656 2.5zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5zM8.5 5v2.5h2.99a12.5 12.5 0 0 0-.337-2.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5zM5.145 12q.208.58.468 1.068c.552 1.035 1.218 1.65 1.887 1.855V12zm.182 2.472a7 7 0 0 1-.597-.933A9.3 9.3 0 0 1 4.09 12H2.255a7 7 0 0 0 3.072 2.472M3.82 11a13.7 13.7 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5zm6.853 3.472A7 7 0 0 0 13.745 12H11.91a9.3 9.3 0 0 1-.64 1.539 7 7 0 0 1-.597.933M8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855q.26-.487.468-1.068zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.7 13.7 0 0 1-.312 2.5m2.802-3.5a7 7 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7 7 0 0 0-3.072-2.472c.218.284.418.598.597.933M10.855 4a8 8 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4z"/>
</svg>`,
    pin: `<svg viewBox="0 0 24 24"><path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/></svg>`,
  };

  return `
    <div class="footer-wrapper">
      <div class="footer-contact-grid">
        <div class="footer-contact-item">
          <div class="footer-icon-box">${icons.phone}</div>
          <div class="footer-contact-text">${escapeHtml(f.phone)}<br />+91 8088187900</div>
        </div>
        <div class="footer-contact-item">
          <div class="footer-icon-box">${icons.web}</div>
          <div class="footer-contact-text">${escapeHtml(f.email)}<br />${escapeHtml(f.website)}</div>
        </div>
        <div class="footer-contact-item">
          <div class="footer-icon-box">${icons.pin}</div>
          <div class="footer-contact-text">${escapeHtml(f.address)}</div>
        </div>
      </div>
      <div class="footer-orange-bar"></div>
    </div>
  `;
}


function page(proposal: ProposalData, content: string, className = "") {
  const watermark = proposal.watermarkText ? `<div class="watermark">${escapeHtml(proposal.watermarkText)}</div>` : "";
  return `<section class="proposal-page ${className}">${watermark}${content}${footer(proposal)}</section>`;
}

function coverPage(proposal: ProposalData) {
  const t = theme(proposal.template);
  return page(proposal, `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:110px;">
      <div>
        ${proposal.company.logoUrl ? `<img src="${escapeHtml(proposal.company.logoUrl)}" style="max-height:64px;max-width:180px;margin-bottom:18px;" />` : ""}
        <div style="font-size:26px;font-weight:900;">${escapeHtml(proposal.company.name)}</div>
        <div class="muted" style="font-size:14px;line-height:1.6;max-width:300px;margin-top:10px;">${escapeHtml(proposal.company.address)}</div>
      </div>
      <div class="pill">${escapeHtml(proposal.details.status)}</div>
    </div>
    <div style="max-width:620px;">
      <div class="label">Quotation</div>
      <h1 class="title" style="margin:18px 0;color:${t.dark};">${escapeHtml(proposal.details.projectTitle)}</h1>
      <p class="muted" style="font-size:20px;line-height:1.55;margin:0;">Prepared for <strong>${escapeHtml(proposal.client.companyName.toUpperCase() || proposal.client.name.toUpperCase())}</strong></p>
    </div>
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:120px;">
      <div class="card"><div class="label">Quotation No</div><div style="font-size:20px;font-weight:900;margin-top:8px;">${escapeHtml(proposal.details.number)}</div></div>
      <div class="card"><div class="label">Issue Date</div><div style="font-size:20px;font-weight:900;margin-top:8px;">${dateValue(proposal.details.issueDate)}</div></div>
      <div class="card"><div class="label">Valid Until</div><div style="font-size:20px;font-weight:900;margin-top:8px;">${dateValue(proposal.details.expiryDate)}</div></div>
    </div>
    <div style="position:absolute;right:58px;bottom:225px;text-align:right;">
      <div class="label">Prepared By</div>
      <div style="font-size:18px;font-weight:900;margin-top:8px;">${escapeHtml(proposal.details.preparedBy)}</div>
    </div>
  `, "cover");
}

function infoOverviewPage(proposal: ProposalData) {
  return page(proposal, `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:22px;margin-bottom:34px;">
      <div class="card">
        <div class="label">Company Information</div>
        <h2 style="margin:12px 0 10px;font-size:24px;">${escapeHtml(proposal.company.name)}</h2>
        <div class="muted" style="line-height:1.7;font-size:14px;">${escapeHtml(proposal.company.address)}<br />${escapeHtml(proposal.company.email)}<br />${escapeHtml(proposal.company.phone)}<br />${escapeHtml(proposal.company.website)}${proposal.company.gstNumber ? `<br />GST: ${escapeHtml(proposal.company.gstNumber)}` : ""}</div>
      </div>
      <div class="card">
        <div class="label">Client Information</div>
        <h2 style="margin:12px 0 10px;font-size:24px;">${escapeHtml(proposal.client.companyName || proposal.client.name)}</h2>
        <div class="muted" style="line-height:1.7;font-size:14px;">${escapeHtml(proposal.client.name)}<br />${escapeHtml(proposal.client.billingAddress)}<br />${escapeHtml(proposal.client.email)}<br />${escapeHtml(proposal.client.phone)}${proposal.client.gstin ? `<br />GSTIN: ${escapeHtml(proposal.client.gstin)}` : ""}</div>
      </div>
    </div>
    <div class="card" style="min-height:620px;">
      <div class="label">Requirement / Project Overview</div>
      <h2 class="section-title" style="margin-top:12px;">Project Understanding</h2>
      <div class="html-content">${safeHtml(proposal.requirementHtml)}</div>
    </div>
  `);
}

function scopePage(proposal: ProposalData) {
  const rows = proposal.scopeRows.map((row) => `<tr><td style="width:28%;font-weight:900;">${escapeHtml(row.module)}</td><td class="muted" style="line-height:1.65;">${escapeHtml(row.scope)}</td></tr>`).join("");
  return page(proposal, `
    <div class="label">Scope of Work</div>
    <h2 class="section-title">Modules & Deliverables</h2>
    <table><thead><tr><th>Module</th><th>Scope</th></tr></thead><tbody>${rows}</tbody></table>
  `);
}

function pricingPage(proposal: ProposalData) {
  const groups = proposal.pricingGroups.map((group) => {
    const rows = group.items.map((item) => `<tr>
      <td><strong>${escapeHtml(item.description)}</strong>${item.optional ? ` <span class="pill">Optional</span>` : ""}${item.bullets.length ? `<ul class="muted" style="margin:8px 0 0;padding-left:18px;line-height:1.5;">${item.bullets.map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join("")}</ul>` : ""}</td>
      <td style="text-align:center;">${escapeHtml(item.quantity)}</td>
      <td style="text-align:right;">${money(item.unitPrice, proposal.details.currency)}</td>
      <td style="text-align:right;">${escapeHtml(item.taxRate)}%</td>
      <td style="text-align:right;">${escapeHtml(item.cycle)}</td>
      <td style="text-align:right;font-weight:900;">${money(getPricingItemTotal(item), proposal.details.currency)}</td>
    </tr>`).join("");
    return `<div style="margin-bottom:34px;"><h3 style="font-size:21px;margin:0 0 6px;">${escapeHtml(group.title)}</h3><p class="muted" style="margin:0 0 14px;">${escapeHtml(group.description)}</p><table><thead><tr><th>Item</th><th>Qty</th><th>Unit</th><th>Tax</th><th>Cycle</th><th style="text-align:right;">Total</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }).join("");
  return page(proposal, `<div class="label">Pricing</div><h2 class="section-title">Investment Breakdown</h2>${groups}`);
}

function deploymentTotalsPage(proposal: ProposalData) {
  const totals = calculateProposalTotals(proposal.pricingGroups, proposal.deploymentBlocks, proposal.totals);
  const blocks = proposal.deploymentBlocks.filter((block) => block.visible).map((block) => `<div class="card"><div class="label">${escapeHtml(block.cycle)}</div><h3 style="margin:9px 0;font-size:20px;">${escapeHtml(block.title)}</h3><p class="muted" style="font-size:13px;line-height:1.55;">${escapeHtml(block.description)}</p><strong>${money(block.amount, proposal.details.currency)}</strong></div>`).join("");
  return page(proposal, `
    <div class="label">Deployment & Maintenance</div>
    <h2 class="section-title">Running Costs & Support</h2>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-bottom:42px;">${blocks}</div>
    <div style="display:grid;grid-template-columns:1fr 360px;gap:34px;align-items:start;">
      <div class="card">
        <div class="label">Notes</div>
        ${proposal.notesVisible ? `<div class="html-content">${safeHtml(proposal.notesHtml)}</div>` : `<p class="muted">No additional notes.</p>`}
      </div>
      <div class="card" style="border-top:6px solid ${theme(proposal.template).accent};">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>Subtotal</span><strong>${money(totals.subtotal, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>Discount</span><strong>- ${money(totals.discountAmount, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>CGST</span><strong>${money(totals.cgstTotal, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>SGST</span><strong>${money(totals.sgstTotal, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>IGST</span><strong>${money(totals.igstTotal, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;"><span>TDS</span><strong>- ${money(totals.tdsAmount, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;border-top:2px solid #111827;padding-top:14px;font-size:22px;"><span>Grand Total</span><strong class="accent">${money(totals.grandTotal, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:12px;"><span>Advance</span><strong>${money(totals.advanceAmount, proposal.details.currency)}</strong></div>
        <div style="display:flex;justify-content:space-between;margin-top:8px;"><span>Remaining</span><strong>${money(totals.remainingAmount, proposal.details.currency)}</strong></div>
        ${totals.monthlyTotal ? `<div style="margin-top:18px;" class="pill">Monthly: ${money(totals.monthlyTotal, proposal.details.currency)}</div>` : ""}
        ${totals.yearlyTotal ? `<div style="margin-top:8px;" class="pill">Yearly: ${money(totals.yearlyTotal, proposal.details.currency)}</div>` : ""}
      </div>
    </div>
  `);
}

function termsSignaturePage(proposal: ProposalData) {
  return page(proposal, `
    <div class="label">Terms & Approval</div>
    <h2 class="section-title">Terms & Conditions</h2>
    <div class="card" style="margin-bottom:46px;"><ol style="margin:0;padding-left:20px;line-height:1.8;">${proposal.termsList.map((term) => `<li>${escapeHtml(term)}</li>`).join("")}</ol></div>
    ${proposal.signaturesVisible ? `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;">
      <div class="card" style="min-height:190px;">
        <div class="label">Authorized Signature</div>
        ${proposal.signatures.authorizedSignatureUrl ? `<img src="${escapeHtml(proposal.signatures.authorizedSignatureUrl)}" style="max-height:72px;margin:22px 0;" />` : `<div style="height:72px;margin:22px 0;border-bottom:1px solid #94a3b8;"></div>`}
        <strong>${escapeHtml(proposal.signatures.authorizedName)}</strong><br /><span class="muted">${escapeHtml(proposal.signatures.authorizedTitle)}</span>
      </div>
      <div class="card" style="min-height:190px;">
        <div class="label">Client Signature</div>
        <div style="height:94px;margin:22px 0;border-bottom:1px solid #94a3b8;"></div>
        <strong>${escapeHtml(proposal.signatures.clientSignatureLabel)}</strong>
      </div>
    </div>
    ` : ""}
  `);
}


export function generateProposalHTML(proposal: ProposalData) {
  const normalized = { ...proposal, totals: calculateProposalTotals(proposal.pricingGroups, proposal.deploymentBlocks, proposal.totals) };
  const body = [coverPage(normalized), infoOverviewPage(normalized), scopePage(normalized), pricingPage(normalized), deploymentTotalsPage(normalized), termsSignaturePage(normalized)].join("");
  return `<!DOCTYPE html><html><head><meta charset="utf-8" /><title>${escapeHtml(normalized.details.number)}</title><style>${styles(normalized)}</style></head><body>${body}</body></html>`;
}
