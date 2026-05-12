import { getClients } from "@/lib/actions/clients";
import { QuotationBuilder } from "@/components/forms/quotation-builder";
import { getTaxes } from "@/lib/actions/taxes";
import { getUserSettings } from "@/app/actions/user-settings";

export default async function CreateQuotationPage() {
  const clientsRes = await getClients();
  const taxesRes = await getTaxes();
  const settingsRes = await getUserSettings();
  
  const clients = (clientsRes.success ? clientsRes.data : []) || [];
  const taxes = (taxesRes.success ? taxesRes.data : []) || [];
  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Create Quotation</h2>
          <p className="text-muted-foreground">Build a professional proposal for your clients.</p>
        </div>
      </div>

      <QuotationBuilder clients={clients} taxes={taxes} settings={settings} />
    </div>
  );
}
