"use client";

import { ProposalBuilder } from "@/components/quotations/proposal-builder";
import type { ProposalData } from "@/lib/quotation/types";

type QuotationBuilderProps = {
  clients: Record<string, unknown>[];
  taxes: { id: string; name: string; rate: number; isActive: boolean }[];
  settings?: Record<string, unknown> | null;
  initialData?: {
    id: string;
    clientId: string;
    projectId?: string | null;
    proposal: ProposalData;
  };
};

export function QuotationBuilder({ clients, taxes, settings, initialData }: QuotationBuilderProps) {
  return <ProposalBuilder clients={clients} taxes={taxes} settings={settings} initialData={initialData} />;
}
