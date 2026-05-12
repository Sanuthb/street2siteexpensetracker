import { notFound } from "next/navigation";
import { getClients } from "@/lib/actions/clients";
import { getTaxes } from "@/lib/actions/taxes";
import { getInvoiceById } from "@/lib/actions/invoices";
import { getUserSettings } from "@/app/actions/user-settings";
import { InvoiceBuilder } from "@/components/forms/invoice-builder";

export default async function EditInvoicePage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [invoiceRes, clientsRes, taxesRes, settingsRes] = await Promise.all([
    getInvoiceById(id),
    getClients(),
    getTaxes(),
    getUserSettings(),
  ]);

  if (!invoiceRes.success || !invoiceRes.data) {
    notFound();
  }

  const clients = (clientsRes.success ? clientsRes.data : []) || [];
  const taxes = (taxesRes.success ? taxesRes.data : []) || [];
  const settings = settingsRes.success ? settingsRes.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Edit Invoice</h2>
        <p className="text-muted-foreground">Update invoice details, line items, notes, and terms.</p>
      </div>

      <InvoiceBuilder clients={clients} taxes={taxes} settings={settings} initialData={invoiceRes.data} />
    </div>
  );
}
