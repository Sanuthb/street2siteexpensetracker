import { getQuotationById } from "@/lib/actions/quotations";
import { Badge } from "@/components/ui/badge";
import { notFound } from "next/navigation";
import { DownloadPdfButton } from "@/components/actions/download-pdf-button";
import { ConvertQuotationButton } from "@/components/actions/convert-quotation-button";
import { DocumentActions } from "@/components/actions/document-actions";
import { DuplicateQuotationButton } from "@/components/actions/duplicate-quotation-button";
import { ProposalPreview } from "@/components/quotations/proposal-preview";
import { calculateProposalTotals } from "@/lib/quotation/calculations";

export default async function QuotationPreviewPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const response = await getQuotationById(id);

  if (!response.success || !response.data) {
    notFound();
  }

  const quo = response.data;
  const proposal = {
    ...quo.proposal,
    totals: calculateProposalTotals(quo.proposal.pricingGroups, quo.proposal.deploymentBlocks, quo.proposal.totals),
  };
  const pdfData = { ...quo, proposal };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">{proposal.details.projectTitle}</h2>
            <Badge variant={quo.status === "Draft" ? "secondary" : quo.status === "Converted" ? "default" : "outline"} className={quo.status === "Converted" ? "bg-green-500" : ""}>
              {quo.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Quotation {quo.number} · Created on {new Date(quo.date).toLocaleDateString()}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <DownloadPdfButton type="quotation" data={pdfData} />
          <DuplicateQuotationButton id={quo.id} />
          {quo.status !== "Converted" && <ConvertQuotationButton quotationId={quo.id} />}
          <DocumentActions id={quo.id} type="quotation" status={quo.status} />
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <ProposalPreview proposal={proposal} />
        <div className="space-y-4">
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Client</p>
            <h3 className="mt-2 text-xl font-black">{proposal.client.companyName || proposal.client.name}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{proposal.client.email}</p>
            <p className="text-sm text-muted-foreground">{proposal.client.phone}</p>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Totals</p>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span>Subtotal {proposal.totals.isMonthlyBase ? "(Monthly)" : proposal.totals.isYearlyBase ? "(Yearly)" : ""}</span>
                <strong>₹{proposal.totals.subtotal.toLocaleString("en-IN")}</strong>
              </div>
              {proposal.taxesVisible !== false && (
                <div className="flex justify-between"><span>GST</span><strong>₹{proposal.totals.gstTotal.toLocaleString("en-IN")}</strong></div>
              )}
              <div className="flex justify-between border-t pt-3 text-lg">
                <span>Grand Total {proposal.totals.isMonthlyBase ? "(Monthly)" : proposal.totals.isYearlyBase ? "(Yearly)" : ""}</span>
                <strong className="text-orange-600">₹{proposal.totals.grandTotal.toLocaleString("en-IN")}</strong>
              </div>
              <div className="flex justify-between"><span>Remaining</span><strong>₹{proposal.totals.remainingAmount.toLocaleString("en-IN")}</strong></div>
              {proposal.totals.monthlyTotal > 0 && !proposal.totals.isMonthlyBase && (
                <div className="flex justify-between text-purple-600 font-semibold border-t pt-2 mt-2">
                  <span>Monthly Recurring</span>
                  <strong>₹{proposal.totals.monthlyTotal.toLocaleString("en-IN")}</strong>
                </div>
              )}
              {proposal.totals.yearlyTotal > 0 && !proposal.totals.isYearlyBase && (
                <div className="flex justify-between text-indigo-600 font-semibold">
                  <span>Yearly Recurring</span>
                  <strong>₹{proposal.totals.yearlyTotal.toLocaleString("en-IN")}</strong>
                </div>
              )}
            </div>
          </div>
          <div className="rounded-3xl border bg-card p-6 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">Template</p>
            <p className="mt-2 font-semibold capitalize">{proposal.template.replace("-", " ")}</p>
            <p className="mt-4 text-sm text-muted-foreground">Use Download PDF to export the complete multi-page proposal with cover, overview, scope, pricing, totals, terms, and signatures.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
