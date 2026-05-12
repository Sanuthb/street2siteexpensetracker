import { getClients } from "@/lib/actions/clients";
import { InvoiceBuilder } from "@/components/forms/invoice-builder";
import { getTaxes } from "@/lib/actions/taxes";
import { getUserSettings } from "@/app/actions/user-settings";

export default async function CreateInvoicePage() {
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
          <h2 className="text-2xl font-bold tracking-tight">Create Invoice</h2>
          <p className="text-muted-foreground">Bill your clients and get paid.</p>
        </div>
      </div>

      <InvoiceBuilder clients={clients} taxes={taxes} settings={settings} />
    </div>
  );
}
