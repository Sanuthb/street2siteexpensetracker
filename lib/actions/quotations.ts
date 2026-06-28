"use server";

import { db } from "@/lib/db";
import { quotations, quotationItems, clients, projects, invoices, invoiceItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { calculateProposalTotals, flattenProposalPricingItems } from "@/lib/quotation/calculations";
import { createDefaultProposal, parseProposal, serializeProposal } from "@/lib/quotation/defaults";
import type { PricingItem, ProposalData, ProposalStatus } from "@/lib/quotation/types";

type BasicQuotationItem = {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  amount: number;
};

type QuotationRow = typeof quotations.$inferSelect;

type ClientRow = typeof clients.$inferSelect;

function safeDate(value: unknown) {
  if (!value) return new Date();
  const date = new Date(value as string | number | Date);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function toDateInput(value: unknown) {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

function textToHtml(value: unknown) {
  const escaped = String(value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return escaped.split("\n").filter(Boolean).map((line) => `<p>${line}</p>`).join("");
}

function itemToPricingItem(item: BasicQuotationItem, index: number): PricingItem {
  return {
    id: `legacy-item-${index}`,
    description: item.description,
    bullets: [],
    quantity: Number(item.quantity || 1),
    unitPrice: Number(item.unitPrice || 0),
    taxRate: Number(item.taxRate || 0),
    optional: false,
    cycle: "one-time",
  };
}

function buildLegacyProposal(quotation: QuotationRow, items: BasicQuotationItem[], client?: ClientRow): ProposalData {
  const proposal = createDefaultProposal(undefined, client as unknown as Record<string, unknown> | undefined);
  const pricingGroups = [
    {
      id: "legacy-group",
      title: "Quoted Services",
      description: "Services included in this quotation.",
      items: items.map(itemToPricingItem),
    },
  ];

  const totals = calculateProposalTotals(pricingGroups, [], {
    discountAmount: 0,
    cgstRate: 0,
    sgstRate: 0,
    igstRate: 0,
    tdsRate: 0,
    advanceAmount: 0,
  });

  return {
    ...proposal,
    details: {
      ...proposal.details,
      number: quotation.number,
      issueDate: toDateInput(quotation.date),
      expiryDate: toDateInput(quotation.validUntil),
      projectTitle: quotation.notes?.split("\n")[0] || proposal.details.projectTitle,
      status: quotation.status as ProposalStatus,
    },
    requirementHtml: textToHtml(quotation.notes) || proposal.requirementHtml,
    pricingGroups,
    deploymentBlocks: [],
    totals: {
      ...totals,
      subtotal: Number(quotation.subTotal || totals.subtotal),
      gstTotal: Number(quotation.taxTotal || totals.gstTotal),
      grandTotal: Number(quotation.grandTotal || totals.grandTotal),
      remainingAmount: Number(quotation.grandTotal || totals.grandTotal),
    },
    termsList: quotation.terms ? quotation.terms.split("\n").filter(Boolean) : proposal.termsList,
  };
}

function normalizeProposal(proposal: ProposalData) {
  const totals = calculateProposalTotals(proposal.pricingGroups, proposal.deploymentBlocks, proposal.totals);
  return { ...proposal, totals };
}

function proposalToDbFields(proposal: ProposalData) {
  const normalized = normalizeProposal(proposal);
  const visibleNotes = normalized.notesVisible ? normalized.notesHtml : "";

  return {
    number: normalized.details.number,
    date: safeDate(normalized.details.issueDate),
    validUntil: normalized.details.expiryDate ? safeDate(normalized.details.expiryDate) : null,
    subTotal: normalized.totals.subtotal,
    taxTotal: normalized.totals.gstTotal,
    grandTotal: normalized.totals.grandTotal,
    notes: serializeProposal(normalized),
    terms: normalized.termsList.join("\n"),
    status: normalized.details.status,
    legacyNotes: visibleNotes,
    proposal: normalized,
  };
}

async function replaceQuotationItems(quotationId: string, items: BasicQuotationItem[]) {
  await db.delete(quotationItems).where(eq(quotationItems.quotationId, quotationId));

  for (const item of items) {
    await db.insert(quotationItems).values({
      id: crypto.randomUUID(),
      quotationId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxRate: item.taxRate,
      amount: item.amount,
    });
  }
}

export async function getQuotations() {
  try {
    const data = await db.select({
      id: quotations.id,
      number: quotations.number,
      date: quotations.date,
      validUntil: quotations.validUntil,
      grandTotal: quotations.grandTotal,
      status: quotations.status,
      clientName: clients.name,
      projectName: projects.name,
      notes: quotations.notes,
    })
    .from(quotations)
    .leftJoin(clients, eq(quotations.clientId, clients.id))
    .leftJoin(projects, eq(quotations.projectId, projects.id))
    .orderBy(desc(quotations.date));

    const enhanced = data.map((row) => {
      const proposal = parseProposal(row.notes, createDefaultProposal());
      return {
        ...row,
        projectTitle: proposal.details.projectTitle,
        template: proposal.template,
      };
    });

    return { success: true, data: enhanced };
  } catch (error) {
    console.error("Failed to fetch quotations", error);
    return { success: false, error: "Failed to fetch quotations" };
  }
}

export async function getQuotationById(id: string) {
  try {
    const quotationArray = await db.select().from(quotations).where(eq(quotations.id, id));
    if (quotationArray.length === 0) return { success: false, error: "Quotation not found" };

    const quotation = quotationArray[0];
    const items = await db.select().from(quotationItems).where(eq(quotationItems.quotationId, id));
    const clientArray = await db.select().from(clients).where(eq(clients.id, quotation.clientId));
    const client = clientArray[0];
    const proposal = parseProposal(quotation.notes, buildLegacyProposal(quotation, items, client));

    return { success: true, data: { ...quotation, items, client, proposal } };
  } catch (error) {
    console.error("Failed to fetch quotation", error);
    return { success: false, error: "Failed to fetch quotation" };
  }
}

export async function createQuotation(data: ProposalData & { clientId?: string; projectId?: string } | Record<string, unknown>) {
  try {
    const hasPremiumPayload = "details" in data && "pricingGroups" in data;

    if (!hasPremiumPayload) {
      const legacy = data as Record<string, unknown> & { items?: BasicQuotationItem[] };
      const id = crypto.randomUUID();
      await db.insert(quotations).values({
        id,
        clientId: String(legacy.clientId),
        projectId: legacy.projectId ? String(legacy.projectId) : null,
        number: String(legacy.number),
        date: safeDate(legacy.date),
        validUntil: legacy.validUntil ? safeDate(legacy.validUntil) : null,
        subTotal: Number(legacy.subTotal || 0),
        taxTotal: Number(legacy.taxTotal || 0),
        grandTotal: Number(legacy.grandTotal || 0),
        notes: String(legacy.notes || ""),
        terms: String(legacy.terms || ""),
        status: "Draft"
      });

      await replaceQuotationItems(id, legacy.items || []);
      revalidatePath("/quotations");
      return { success: true, id };
    }

    const proposal = normalizeProposal(data as ProposalData);
    const dbFields = proposalToDbFields(proposal);
    const id = crypto.randomUUID();
    const clientId = String((data as { clientId?: string }).clientId || "");

    if (!clientId) return { success: false, error: "Please select a client." };

    await db.insert(quotations).values({
      id,
      clientId,
      projectId: (data as { projectId?: string }).projectId || null,
      number: dbFields.number,
      date: dbFields.date,
      validUntil: dbFields.validUntil,
      subTotal: dbFields.subTotal,
      taxTotal: dbFields.taxTotal,
      grandTotal: dbFields.grandTotal,
      notes: dbFields.notes,
      terms: dbFields.terms,
      status: dbFields.status,
    });

    await replaceQuotationItems(id, flattenProposalPricingItems(proposal));
    revalidatePath("/quotations");
    return { success: true, id };
  } catch (error) {
    console.error("Failed to create quotation", error);
    return { success: false, error: "Failed to create quotation" };
  }
}

export async function updateQuotation(id: string, data: ProposalData & { clientId?: string; projectId?: string } | Record<string, unknown>) {
  try {
    const hasPremiumPayload = "details" in data && "pricingGroups" in data;

    if (!hasPremiumPayload) {
      const legacy = data as Record<string, unknown> & { items?: BasicQuotationItem[] };
      await db.update(quotations).set({
        clientId: String(legacy.clientId),
        projectId: legacy.projectId ? String(legacy.projectId) : null,
        number: String(legacy.number),
        date: safeDate(legacy.date),
        validUntil: legacy.validUntil ? safeDate(legacy.validUntil) : null,
        subTotal: Number(legacy.subTotal || 0),
        taxTotal: Number(legacy.taxTotal || 0),
        grandTotal: Number(legacy.grandTotal || 0),
        notes: String(legacy.notes || ""),
        terms: String(legacy.terms || ""),
      }).where(eq(quotations.id, id));

      await replaceQuotationItems(id, legacy.items || []);
      revalidatePath("/quotations");
      revalidatePath(`/quotations/${id}`);
      revalidatePath(`/quotations/${id}/edit`);
      return { success: true, id };
    }

    const proposal = normalizeProposal(data as ProposalData);
    const dbFields = proposalToDbFields(proposal);
    const clientId = String((data as { clientId?: string }).clientId || "");

    if (!clientId) return { success: false, error: "Please select a client." };

    await db.update(quotations).set({
      clientId,
      projectId: (data as { projectId?: string }).projectId || null,
      number: dbFields.number,
      date: dbFields.date,
      validUntil: dbFields.validUntil,
      subTotal: dbFields.subTotal,
      taxTotal: dbFields.taxTotal,
      grandTotal: dbFields.grandTotal,
      notes: dbFields.notes,
      terms: dbFields.terms,
      status: dbFields.status,
    }).where(eq(quotations.id, id));

    await replaceQuotationItems(id, flattenProposalPricingItems(proposal));
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    revalidatePath(`/quotations/${id}/edit`);
    return { success: true, id };
  } catch (error) {
    console.error("Failed to update quotation", error);
    return { success: false, error: "Failed to update quotation" };
  }
}

export async function duplicateQuotation(id: string) {
  try {
    const res = await getQuotationById(id);
    if (!res.success || !res.data) return { success: false, error: "Quotation not found" };

    const original = res.data;
    const proposal = normalizeProposal({
      ...original.proposal,
      details: {
        ...original.proposal.details,
        number: `${original.proposal.details.number}-COPY-${Date.now().toString().slice(-4)}`,
        status: "Draft",
      },
    });

    return createQuotation({ ...proposal, clientId: original.clientId, projectId: original.projectId || undefined });
  } catch (error) {
    console.error("Failed to duplicate quotation", error);
    return { success: false, error: "Failed to duplicate quotation" };
  }
}

export async function deleteQuotation(id: string) {
  try {
    await db.update(invoices).set({ quotationId: null }).where(eq(invoices.quotationId, id));
    await db.delete(quotationItems).where(eq(quotationItems.quotationId, id));
    await db.delete(quotations).where(eq(quotations.id, id));
    revalidatePath("/quotations");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete quotation", error);
    return { success: false, error: "Failed to delete quotation" };
  }
}

export async function updateQuotationStatus(id: string, status: string) {
  try {
    await db.update(quotations).set({ status }).where(eq(quotations.id, id));
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to update status", error);
    return { success: false, error: "Failed to update status" };
  }
}

export async function convertToInvoice(id: string) {
  try {
    const res = await getQuotationById(id);
    if (!res.success || !res.data) return { success: false, error: "Quotation not found" };

    const quo = res.data;
    const invoiceId = crypto.randomUUID();
    const invoiceNumber = `INV-${quo.number.split("-")[1] || Date.now().toString().slice(-6)}`;
    const proposalItems = flattenProposalPricingItems(quo.proposal);
    const invoiceItemsSource = proposalItems.length ? proposalItems : quo.items;

    const isTaxesVisible = quo.proposal.taxesVisible !== false;
    const finalTerms = isTaxesVisible ? quo.terms : `${quo.terms || ""}\n<!--showTaxes:false-->`.trim();

    const discountAmount = Number(quo.proposal?.totals?.discountAmount || 0);

    let calculatedSubTotal = 0;
    for (const item of invoiceItemsSource) {
      const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      calculatedSubTotal += amount;
    }

    const ratio = calculatedSubTotal > 0 ? Math.max(0, calculatedSubTotal - discountAmount) / calculatedSubTotal : 1;
    let calculatedTaxTotal = 0;
    for (const item of invoiceItemsSource) {
      const amount = Number(item.quantity || 0) * Number(item.unitPrice || 0);
      calculatedTaxTotal += amount * ratio * (Number(item.taxRate || 0) / 100);
    }
    const calculatedGrandTotal = Math.max(0, calculatedSubTotal - discountAmount) + (isTaxesVisible ? calculatedTaxTotal : 0);

    await db.insert(invoices).values({
      id: invoiceId,
      clientId: quo.clientId,
      projectId: quo.projectId,
      quotationId: quo.id,
      number: invoiceNumber,
      date: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      subTotal: calculatedSubTotal,
      discountAmount: discountAmount,
      taxTotal: isTaxesVisible ? calculatedTaxTotal : 0,
      grandTotal: calculatedGrandTotal,
      paidAmount: 0,
      notes: quo.proposal.requirementHtml,
      terms: finalTerms,
      status: "Draft"
    });

    for (const item of invoiceItemsSource) {
      await db.insert(invoiceItems).values({
        id: crypto.randomUUID(),
        invoiceId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        amount: item.amount,
      });
    }

    await db.update(quotations).set({ status: "Converted" }).where(eq(quotations.id, id));

    revalidatePath("/invoices");
    revalidatePath("/quotations");
    revalidatePath(`/quotations/${id}`);

    return { success: true, invoiceId };
  } catch (error) {
    console.error("Failed to convert quotation", error);
    return { success: false, error: "Failed to convert quotation" };
  }
}
