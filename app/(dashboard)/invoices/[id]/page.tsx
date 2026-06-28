import { getInvoiceById } from "@/lib/actions/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, FileText } from "lucide-react";
import { notFound } from "next/navigation";
import { RecordPaymentDialog } from "@/components/forms/record-payment-dialog";
import { DownloadPdfButton } from "@/components/actions/download-pdf-button";
import { getReceiptsByInvoiceId } from "@/lib/actions/receipts";
import { getUserSettings } from "@/app/actions/user-settings";
import { DocumentActions } from "@/components/actions/document-actions";

export default async function InvoicePreviewPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const [invoiceResponse, receiptsResponse, settingsResponse] = await Promise.all([
    getInvoiceById(id),
    getReceiptsByInvoiceId(id),
    getUserSettings()
  ]);
  
  if (!invoiceResponse.success || !invoiceResponse.data) {
    notFound();
  }

  const inv = invoiceResponse.data;
  const receipts = (receiptsResponse.success && receiptsResponse.data) ? receiptsResponse.data : [];
  const settings = settingsResponse.success ? settingsResponse.data : null;
  
  const client = inv.client;
  const items = inv.items;
  const balanceDue = Math.max(0, inv.grandTotal - inv.paidAmount);

  const showTaxes = !inv.terms || !inv.terms.includes("<!--showTaxes:false-->");
  const cleanTerms = inv.terms ? inv.terms.replace("<!--showTaxes:false-->", "").trim() : "";

  // Prepare data for PDF including settings
  const pdfData = { ...inv, showTaxes, settings };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold tracking-tight">Invoice {inv.number}</h2>
            <Badge variant={inv.status === 'Draft' ? 'secondary' : inv.status === 'Paid' ? 'default' : inv.status === 'Overdue' ? 'destructive' : 'outline'} className={inv.status === 'Paid' ? 'bg-green-500' : ''}>
              {inv.status}
            </Badge>
          </div>
          <p className="text-muted-foreground">Created on {new Date(inv.date).toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <DownloadPdfButton type="invoice" data={pdfData} />
          {balanceDue > 0 && (
             <RecordPaymentDialog invoiceId={inv.id} balanceDue={balanceDue} />
          )}
          <DocumentActions id={inv.id} type="invoice" status={inv.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="bg-card/50 shadow-sm border-border/50 col-span-2">
            {/* Top Accent Bar */}
            <div className="h-2 w-full bg-orange-500 rounded-t-xl"></div>
            <CardContent className="p-8 md:p-12">
               <div className="flex justify-between items-start mb-12">
                  <div>
                     <h1 className="text-4xl font-black text-foreground mb-2 tracking-tighter uppercase">INVOICE</h1>
                     <p className="text-muted-foreground font-medium">{inv.number}</p>
                  </div>
                  <div className="text-right">
                     <h3 className="text-lg font-bold">{settings?.companyName || 'Your Company Name'}</h3>
                     <p className="text-muted-foreground text-sm">{settings?.companyEmail || 'contact@yourcompany.com'}</p>
                     <p className="text-muted-foreground text-sm">{settings?.companyPhone || '+91 9876543210'}</p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-12 mb-12 border-t border-b border-border/50 py-8">
                  <div>
                     <p className="text-sm font-semibold text-muted-foreground mb-2 uppercase tracking-wider">Billed To</p>
                     <h3 className="text-lg font-bold text-foreground">{client?.name}</h3>
                     {client?.company && <p className="text-muted-foreground">{client.company}</p>}
                     {client?.billingAddress && <p className="text-muted-foreground text-sm mt-1 whitespace-pre-wrap">{client.billingAddress}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-right">
                     <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Date</p>
                        <p className="font-medium">{new Date(inv.date).toLocaleDateString()}</p>
                     </div>
                     <div>
                        <p className="text-sm font-semibold text-muted-foreground mb-1">Due Date</p>
                        <p className="font-medium">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}</p>
                     </div>
                  </div>
               </div>

                <div className="mb-8 overflow-x-auto">
                  <table className="w-full min-w-[500px]">
                    <thead>
                      <tr className="border-b-2 border-border text-left uppercase text-xs font-bold tracking-widest text-muted-foreground">
                        <th className="py-3">Description</th>
                        <th className="py-3 text-center">Qty</th>
                        <th className="py-3 text-right">Price</th>
                        {showTaxes && <th className="py-3 text-right">Tax</th>}
                        <th className="py-3 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any) => (
                        <tr key={item.id} className="border-b border-border/50 text-sm">
                          <td className="py-4 text-foreground font-medium">{item.description}</td>
                          <td className="py-4 text-center">{item.quantity}</td>
                          <td className="py-4 text-right">₹{item.unitPrice.toLocaleString()}</td>
                          {showTaxes && <td className="py-4 text-right">{item.taxRate}%</td>}
                          <td className="py-4 text-right font-bold text-foreground">₹{item.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mb-12">
                  <div className="w-full md:w-80 bg-muted/20 p-6 rounded-lg border border-border/50 space-y-3">
                     <div className="flex justify-between text-sm text-muted-foreground font-medium">
                        <span>Subtotal</span>
                        <span>₹{inv.subTotal.toLocaleString()}</span>
                     </div>
                     {inv.discountAmount !== null && inv.discountAmount > 0 && (
                       <div className="flex justify-between text-sm font-medium text-red-500">
                          <span>Discount</span>
                          <span>-₹{inv.discountAmount.toLocaleString()}</span>
                       </div>
                     )}
                     {showTaxes && (
                       <div className="flex justify-between text-sm text-muted-foreground font-medium">
                          <span>Total Tax</span>
                          <span>₹{inv.taxTotal.toLocaleString()}</span>
                       </div>
                     )}
                     <div className="flex justify-between items-center border-t border-border/50 pt-4">
                        <span className="font-bold">Grand Total</span>
                        <span className="font-bold text-lg">₹{inv.grandTotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-green-600">
                        <span className="font-semibold text-sm">Paid Amount</span>
                        <span className="font-semibold">₹{inv.paidAmount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center border-t-2 border-orange-500 pt-3">
                        <span className="font-bold text-lg">Balance Due</span>
                        <span className="font-black text-2xl text-orange-500">₹{balanceDue.toLocaleString()}</span>
                     </div>
                  </div>
                </div>

                {(inv.notes || cleanTerms) && (
                  <div className="grid grid-cols-2 gap-8 text-xs text-muted-foreground pt-8 border-t border-border/50">
                    {inv.notes && (
                      <div>
                        <h4 className="font-bold text-foreground mb-2 uppercase tracking-wider">Notes</h4>
                        <p className="whitespace-pre-wrap leading-relaxed">{inv.notes}</p>
                      </div>
                    )}
                    {cleanTerms && (
                      <div>
                        <h4 className="font-bold text-foreground mb-2 uppercase tracking-wider">Terms & Conditions</h4>
                        <p className="whitespace-pre-wrap leading-relaxed">{cleanTerms}</p>
                      </div>
                    )}
                  </div>
                )}
            </CardContent>
         </Card>

         <div className="col-span-1 space-y-6">
            <Card className="bg-card/50 shadow-sm border-border/50">
               <CardHeader>
                  <CardTitle className="text-lg">Payment Summary</CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     <div className="flex justify-between items-center pb-4 border-b border-border/50">
                        <span className="text-muted-foreground text-sm">Total Billed</span>
                        <span className="font-semibold text-foreground">₹{inv.grandTotal.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center pb-4 border-b border-border/50">
                        <span className="text-muted-foreground text-sm">Amount Paid</span>
                        <span className="font-semibold text-green-600">₹{inv.paidAmount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-muted-foreground text-sm font-bold">Balance Due</span>
                        <span className="font-bold text-orange-500 text-lg">₹{balanceDue.toLocaleString()}</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="bg-card/50 shadow-sm border-border/50">
               <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <FileText className="h-5 w-5 text-orange-500" />
                    Payment History
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="space-y-4">
                     {receipts.length > 0 ? (
                       receipts.map((receipt: any) => (
                         <div key={receipt.id} className="flex flex-col gap-2 p-3 rounded-lg border border-border/50 bg-background/50 group hover:border-orange-200 transition-colors">
                           <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-muted-foreground">{receipt.number}</span>
                              <span className="text-xs text-muted-foreground">{new Date(receipt.date).toLocaleDateString()}</span>
                           </div>
                           <div className="flex justify-between items-center">
                              <span className="font-bold">₹{receipt.amount.toLocaleString()}</span>
                              <DownloadPdfButton 
                                type="receipt" 
                                data={{ ...receipt, invoice: inv, settings }} 
                              />
                           </div>
                           <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                             Via {receipt.paymentMethod}
                           </div>
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-6 text-sm text-muted-foreground italic">
                         No payments recorded yet.
                       </div>
                     )}
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
