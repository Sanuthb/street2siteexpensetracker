import { notFound } from "next/navigation";
import { getClients } from "@/lib/actions/clients";
import { getTaxes } from "@/lib/actions/taxes";
import { getQuotationById } from "@/lib/actions/quotations";
import { getUserSettings } from "@/app/actions/user-settings";
import { QuotationBuilder } from "@/components/forms/quotation-builder";

export default async function EditQuotationPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [quotationRes, clientsRes, taxesRes, settingsRes] = await Promise.all([
    getQuotationById(id),
    getClients(),
    getTaxes(),
    getUserSettings(),
  ]);

  if (!quotationRes.success || !quotationRes.data) {
    notFound();
  }

  const clients = (clientsRes.success ? clientsRes.data : []) || [];
  const taxes = (taxesRes.success ? taxesRes.data : []) || [];
  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Quotation</h2>
        <p className="text-muted-foreground">Update the premium proposal content, pricing, terms, and signatures.</p>
      </div>

      <QuotationBuilder clients={clients} taxes={taxes} settings={settings} initialData={quotationRes.data} />
    </div>
  );
}
