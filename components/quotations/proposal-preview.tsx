"use client";

import type { ProposalData, ProposalTemplateId } from "@/lib/quotation/types";
import { calculateProposalTotals, getPricingItemTotal } from "@/lib/quotation/calculations";
import { Badge } from "@/components/ui/badge";

function money(value: number, currency: string) {
  const prefix = currency === "INR" ? "₹" : `${currency} `;
  return `${prefix}${Number(value || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function templateClasses(template: ProposalTemplateId) {
  const classes = {
    "modern-orange": "border-orange-200 bg-gradient-to-br from-white to-orange-50 text-slate-950 [--accent:#f97316]",
    corporate: "border-blue-200 bg-gradient-to-br from-white to-blue-50 text-slate-950 [--accent:#2563eb]",
    minimal: "border-slate-200 bg-white text-slate-950 [--accent:#111827]",
    dark: "border-slate-700 bg-slate-950 text-slate-50 [--accent:#fb923c]",
  };
  return classes[template];
}

export function ProposalPreview({ proposal }: { proposal: ProposalData }) {
  const totals = calculateProposalTotals(proposal.pricingGroups, proposal.deploymentBlocks, proposal.totals);

  return (
    <div className={`rounded-3xl border shadow-2xl shadow-slate-950/10 overflow-hidden ${templateClasses(proposal.template)}`}>
      <div className="aspect-[210/297] overflow-y-auto p-8 text-sm">
        <div className="flex items-start justify-between gap-6">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element -- Proposal logos are user-uploaded data URLs/remote URLs inside generated document previews. */}
            {proposal.company.logoUrl ? <img src={proposal.company.logoUrl} alt="Company logo" className="mb-4 max-h-14 max-w-40 object-contain" /> : null}
            <p className="text-xl font-black">{proposal.company.name}</p>
            <p className="mt-2 max-w-xs text-xs leading-5 opacity-70">{proposal.company.address}</p>
          </div>
          <Badge className="bg-[var(--accent)]">{proposal.details.status}</Badge>
        </div>

        <div className="mt-14">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-[var(--accent)]">Quotation</p>
          <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight">{proposal.details.projectTitle}</h1>
          <p className="mt-4 text-base opacity-70">Prepared for <strong>{proposal.client.companyName.toUpperCase() || proposal.client.name.toUpperCase() || "Client"}</strong></p>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border bg-white/60 p-4 dark:bg-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Number</p>
            <p className="mt-2 font-black">{proposal.details.number}</p>
          </div>
          <div className="rounded-2xl border bg-white/60 p-4 dark:bg-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Issue</p>
            <p className="mt-2 font-black">{proposal.details.issueDate || "-"}</p>
          </div>
          <div className="rounded-2xl border bg-white/60 p-4 dark:bg-white/5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Expiry</p>
            <p className="mt-2 font-black">{proposal.details.expiryDate || "-"}</p>
          </div>
        </div>

        <section className="mt-10 rounded-3xl border bg-white/60 p-5 dark:bg-white/5">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[var(--accent)]">Overview</p>
          <div className="prose prose-sm mt-3 max-w-none leading-7 opacity-80" dangerouslySetInnerHTML={{ __html: proposal.requirementHtml }} />
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">Scope of Work</h2>
          <div className="mt-4 space-y-3">
            {proposal.scopeRows.map((row, index) => (
              <div key={`${row.id}-${index}`} className="grid grid-cols-[140px_1fr] gap-4 rounded-2xl border bg-white/60 p-4 dark:bg-white/5">
                <p className="font-black">{row.module}</p>
                <p className="leading-6 opacity-75">{row.scope}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-black">Pricing</h2>
          <div className="mt-4 space-y-5">
            {proposal.pricingGroups.map((group, index) => (
              <div key={`${group.id}-${index}`} className="rounded-2xl border bg-white/60 p-4 dark:bg-white/5">
                <p className="font-black">{group.title}</p>
                <p className="mt-1 text-xs opacity-60">{group.description}</p>
                <div className="mt-4 space-y-3">
                  {group.items.map((item, itemIndex) => (
                    <div key={`${item.id}-${itemIndex}`} className="flex justify-between gap-4 border-t pt-3">
                      <div>
                        <p className="font-semibold">{item.description} {item.optional ? <span className="text-[var(--accent)]">(Optional)</span> : null}</p>
                        {item.bullets.length ? <ul className="mt-1 list-disc pl-5 text-xs opacity-70">{item.bullets.map((bullet, bulletIndex) => <li key={`${bullet}-${bulletIndex}`}>{bullet}</li>)}</ul> : null}
                      </div>
                      <p className="whitespace-nowrap font-black">{money(getPricingItemTotal(item), proposal.details.currency)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-4">
          {proposal.deploymentBlocks.filter((block) => block.visible).map((block, index) => (
            <div key={`${block.id}-${index}`} className="rounded-2xl border bg-white/60 p-4 dark:bg-white/5">
              <p className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">{block.cycle}</p>
              <p className="mt-2 font-black">{block.title}</p>
              <p className="mt-1 text-xs leading-5 opacity-70">{block.description}</p>
              <p className="mt-3 font-black">{money(block.amount, proposal.details.currency)}</p>
            </div>
          ))}
        </section>


        <section className="mt-8 rounded-3xl border bg-white/70 p-5 dark:bg-white/5">
          <div className="flex justify-between"><span>Subtotal</span><strong>{money(totals.subtotal, proposal.details.currency)}</strong></div>
          <div className="mt-2 flex justify-between"><span>GST</span><strong>{money(totals.gstTotal, proposal.details.currency)}</strong></div>
          <div className="mt-2 flex justify-between"><span>TDS</span><strong>- {money(totals.tdsAmount, proposal.details.currency)}</strong></div>
          <div className="mt-3 flex justify-between border-t pt-3 text-xl"><span className="font-black">Grand Total</span><strong className="text-[var(--accent)]">{money(totals.grandTotal, proposal.details.currency)}</strong></div>
          <div className="mt-2 flex justify-between"><span>Advance</span><strong>{money(totals.advanceAmount, proposal.details.currency)}</strong></div>
          <div className="mt-2 flex justify-between"><span>Remaining</span><strong>{money(totals.remainingAmount, proposal.details.currency)}</strong></div>
        </section>

        {proposal.signaturesVisible ? (
          <section className="mt-8">
            <h2 className="text-2xl font-black">Approval</h2>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-white/60 p-5 dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">Authorized Signature</p>
                <div className="my-4 h-12 border-b border-dashed" />
                <p className="font-black">{proposal.signatures.authorizedName}</p>
                <p className="text-xs opacity-60">{proposal.signatures.authorizedTitle}</p>
              </div>
              <div className="rounded-2xl border bg-white/60 p-5 dark:bg-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--accent)]">{proposal.signatures.clientSignatureLabel}</p>
                <div className="my-4 h-12 border-b border-dashed" />
                <p className="text-xs opacity-60 text-center mt-12">Authorized Signatory</p>
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-12 border-t pt-8">
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-[var(--accent)] text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M6.62,10.79C8.06,13.62 10.38,15.94 13.21,17.38L15.41,15.18C15.69,14.9 16.08,14.82 16.43,14.93C17.55,15.3 18.75,15.5 20,15.5A1,1 0 0,1 21,16.5V20A1,1 0 0,1 20,21A17,17 0 0,1 3,4A1,1 0 0,1 4,3H7.5A1,1 0 0,1 8.5,4C8.5,5.25 8.7,6.45 9.07,7.57C9.18,7.92 9.1,8.31 8.82,8.59L6.62,10.79Z"/></svg>
              </div>
              <div className="text-[10px] font-medium leading-tight opacity-80">
                {proposal.company.phone}<br />+91 8088187900
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-[var(--accent)] text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H13.41C13.02,17.53 12.42,18.96 11.64,20.24C11.76,20.25 11.88,20.25 12,20.25C12.91,20.25 13.79,20.01 14.59,19.56M12.6,14H11.4V10H12.6M10.59,19.56C9.79,20.01 8.91,20.25 8,20.25C8.12,20.25 8.24,20.25 8.36,20.24C7.58,18.96 6.98,17.53 6.59,16H4.03C4.35,17.25 4.81,18.45 5.41,19.56M4.26,14H7.64C7.56,13.34 7.5,12.68 7.5,12C7.5,11.32 7.56,10.66 7.64,10H4.26C4.1,10.64 4,11.31 4,12C4,12.69 4.1,13.36 4.26,14M8,3.75C7.09,3.75 6.21,3.99 5.41,4.44C4.81,5.55 4.35,6.75 4.03,8H6.59C6.98,6.47 7.58,5.04 8.36,3.76C8.24,3.75 8.12,3.75 8,3.75M11.4,4.44C10.59,3.99 9.71,3.75 8.8,3.75C8.92,3.75 9.04,3.75 9.16,3.76C9.94,5.04 10.54,6.47 10.93,8H13.49C13.17,6.75 12.71,5.55 12.11,4.44M12.6,8V4H11.4V8H12.6Z"/></svg>
              </div>
              <div className="text-[10px] font-medium leading-tight opacity-80">
                {proposal.company.email}<br />{proposal.company.website}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded bg-[var(--accent)] text-white">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M12,2C8.13,2 5,5.13 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9C19,5.13 15.87,2 12,2M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5Z"/></svg>
              </div>
              <div className="text-[10px] font-medium leading-tight opacity-80">
                {proposal.company.address}
              </div>
            </div>
          </div>
          <div className="mt-6 h-10 w-full rounded-xl bg-[var(--accent)]" />
        </div>

      </div>
    </div>

  );
}
