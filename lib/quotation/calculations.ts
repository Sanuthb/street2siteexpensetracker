import type { DeploymentBlock, PricingGroup, PricingItem, ProposalData, ProposalTotals, ProposalTotalsInput } from "./types";

export const defaultTotalsInput: ProposalTotalsInput = {
  discountAmount: 0,
  cgstRate: 0,
  sgstRate: 0,
  igstRate: 0,
  tdsRate: 0,
  advanceAmount: 0,
};

function itemBase(item: PricingItem) {
  return Number(item.quantity || 0) * Number(item.unitPrice || 0);
}

function itemTax(item: PricingItem) {
  return itemBase(item) * (Number(item.taxRate || 0) / 100);
}

export function getPricingItemTotal(item: PricingItem) {
  return itemBase(item) + itemTax(item);
}

export function calculateProposalTotals(
  pricingGroups: PricingGroup[],
  deploymentBlocks: DeploymentBlock[],
  input: Partial<ProposalTotalsInput> = {}
): ProposalTotals {
  const totalsInput = { ...defaultTotalsInput, ...input };
  let subtotal = 0;
  let optionalSubtotal = 0;
  let monthlyTotal = 0;
  let yearlyTotal = 0;

  pricingGroups.forEach((group) => {
    group.items.forEach((item) => {
      const total = getPricingItemTotal(item);
      if (item.optional) {
        optionalSubtotal += total;
        return;
      }

      if (item.cycle === "monthly") monthlyTotal += total;
      else if (item.cycle === "yearly") yearlyTotal += total;
      else subtotal += total;
    });
  });

  deploymentBlocks.forEach((block) => {
    if (!block.visible) return;
    const amount = Number(block.amount || 0);
    if (block.cycle === "monthly") monthlyTotal += amount;
    else if (block.cycle === "yearly") yearlyTotal += amount;
    else subtotal += amount;
  });

  const taxable = Math.max(0, subtotal - Number(totalsInput.discountAmount || 0));
  const cgstTotal = taxable * (Number(totalsInput.cgstRate || 0) / 100);
  const sgstTotal = taxable * (Number(totalsInput.sgstRate || 0) / 100);
  const igstTotal = taxable * (Number(totalsInput.igstRate || 0) / 100);
  const gstTotal = cgstTotal + sgstTotal + igstTotal;
  const tdsAmount = taxable * (Number(totalsInput.tdsRate || 0) / 100);
  const grandTotal = taxable + gstTotal - tdsAmount;
  const remainingAmount = Math.max(0, grandTotal - Number(totalsInput.advanceAmount || 0));

  return {
    ...totalsInput,
    subtotal,
    optionalSubtotal,
    monthlyTotal,
    yearlyTotal,
    cgstTotal,
    sgstTotal,
    igstTotal,
    gstTotal,
    tdsAmount,
    grandTotal,
    remainingAmount,
  };
}

export function flattenProposalPricingItems(proposal: ProposalData) {
  return proposal.pricingGroups.flatMap((group) =>
    group.items
      .filter((item) => !item.optional)
      .map((item) => ({
        description: `${group.title}: ${item.description}`,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxRate: item.taxRate,
        amount: itemBase(item),
      }))
  );
}
