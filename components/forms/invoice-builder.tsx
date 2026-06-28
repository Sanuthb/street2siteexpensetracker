"use client";

import { useEffect, useId, useState } from "react";
import { useRouter } from "next/navigation";
import { useBuilderStore } from "@/lib/store/builder-store";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Save } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createInvoice, updateInvoice } from "@/lib/actions/invoices";
import { toast } from "sonner";

type ClientOption = {
  id: string;
  name: string;
  company?: string | null;
};

type TaxOption = {
  id: string;
  name: string;
  rate: number;
};

type InvoiceLineItem = {
  id?: string;
  description?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  taxRate?: number | null;
  amount?: number | null;
};

type InvoiceInitialData = {
  id: string;
  clientId: string;
  number: string;
  date?: string | number | Date | null;
  dueDate?: string | number | Date | null;
  notes?: string | null;
  terms?: string | null;
  items?: InvoiceLineItem[];
  discountAmount?: number | null;
};

type InvoiceBuilderProps = {
  clients: ClientOption[];
  taxes: TaxOption[];
  settings?: { invoicePrefix?: string | null } | null;
  initialData?: InvoiceInitialData;
};

function toDateInput(value: unknown) {
  if (!value) return "";
  const date = new Date(value as string | number | Date);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

export function InvoiceBuilder({ clients, taxes, settings, initialData }: InvoiceBuilderProps) {
  const router = useRouter();
  const generatedId = useId().replace(/[^a-zA-Z0-9]/g, "").slice(-6);
  const { items, addItem, updateItem, removeItem, subTotal, taxTotal, grandTotal, discountAmount, setDiscountAmount, reset, setItems } = useBuilderStore();
  const isEditing = Boolean(initialData?.id);

  const [clientId, setClientId] = useState(initialData?.clientId || "");
  const [number, setNumber] = useState(initialData?.number || `${settings?.invoicePrefix || "INV-"}${generatedId}`);
  const [date, setDate] = useState(toDateInput(initialData?.date) || new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(toDateInput(initialData?.dueDate));
  const [notes, setNotes] = useState(initialData?.notes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showTaxes, setShowTaxes] = useState(() => {
    if (!initialData?.terms) return true;
    return !initialData.terms.includes("<!--showTaxes:false-->");
  });
  const [terms, setTerms] = useState(() => {
    if (!initialData?.terms) return "";
    return initialData.terms.replace("<!--showTaxes:false-->", "").trim();
  });

  useEffect(() => {
    reset();
    if (initialData?.discountAmount) {
      setDiscountAmount(Number(initialData.discountAmount));
    }
    if (initialData?.items?.length) {
      setItems(initialData.items.map((item: InvoiceLineItem) => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || "",
        quantity: Number(item.quantity || 1),
        unitPrice: Number(item.unitPrice || 0),
        taxRate: Number(item.taxRate || 0),
        amount: Number(item.amount || 0),
      })));
    } else {
      addItem();
    }
  }, [addItem, initialData?.items, initialData?.discountAmount, reset, setItems, setDiscountAmount]);

  const handleSave = async () => {
    if (!clientId || items.length === 0) {
      toast.error("Please select a client and add at least one item.");
      return;
    }

    const finalTerms = showTaxes ? terms : `${terms}\n<!--showTaxes:false-->`.trim();
    const finalTaxTotal = showTaxes ? taxTotal : 0;
    const finalGrandTotal = showTaxes ? grandTotal : Math.max(0, subTotal - discountAmount);

    setIsSubmitting(true);
    const data = {
      clientId,
      number,
      date,
      dueDate,
      notes,
      terms: finalTerms,
      subTotal,
      discountAmount,
      taxTotal: finalTaxTotal,
      grandTotal: finalGrandTotal,
      items
    };

    const res = initialData ? await updateInvoice(initialData.id, data) : await createInvoice(data);
    if (res.success) {
      toast.success(isEditing ? "Invoice updated successfully!" : "Invoice created successfully!");
      router.push(initialData ? `/invoices/${initialData.id}` : "/invoices");
    } else {
      toast.error(res.error || "Something went wrong.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-6">
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <h2 className="text-2xl font-bold tracking-tight">{isEditing ? "Edit Invoice" : "Invoice Details"}</h2>
        </CardHeader>
        <CardContent className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Client</Label>
            <Select onValueChange={setClientId} value={clientId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client" />
              </SelectTrigger>
              <SelectContent>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.name} {c.company ? `(${c.company})` : ""}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Invoice Number</Label>
            <Input value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Invoice Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Line Items</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="invoice-taxes-toggle"
                checked={showTaxes} 
                onCheckedChange={setShowTaxes} 
              />
              <Label htmlFor="invoice-taxes-toggle" className="cursor-pointer text-sm font-semibold">Show Taxes</Label>
            </div>
            <Button onClick={addItem} variant="outline" size="sm" className="text-orange-500 border-orange-200 hover:bg-orange-500 hover:text-white">
              <Plus className="h-4 w-4 mr-2" /> Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-12 gap-4 mb-4 font-semibold text-muted-foreground text-sm">
              <div className={showTaxes ? "col-span-4" : "col-span-6"}>Description</div>
              <div className="col-span-2">Quantity</div>
              <div className="col-span-2">Price (₹)</div>
              {showTaxes && <div className="col-span-2">Tax</div>}
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-4 items-center mb-4">
                <div className={showTaxes ? "col-span-4" : "col-span-6"}>
                  <Input placeholder="Item description" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" min="1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', e.target.value)} />
                </div>
                <div className="col-span-2">
                  <Input type="number" min="0" value={item.unitPrice} onChange={(e) => updateItem(item.id, 'unitPrice', e.target.value)} />
                </div>
                {showTaxes && (
                  <div className="col-span-2">
                    <Select value={item.taxRate.toString()} onValueChange={(val) => updateItem(item.id, 'taxRate', val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Tax" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">No Tax</SelectItem>
                        {taxes.map(t => (
                          <SelectItem key={t.id} value={t.rate.toString()}>{t.name} ({t.rate}%)</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="col-span-1 font-medium text-right pt-2">
                  ₹{item.amount.toLocaleString()}
                </div>
                <div className="col-span-1 text-right">
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-destructive hover:bg-destructive/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-8 border-t border-border/50 pt-6">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal:</span>
                <span>₹{subTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-muted-foreground">
                <Label htmlFor="invoice-discount-input" className="text-sm font-semibold">Discount (₹):</Label>
                <Input 
                  id="invoice-discount-input"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={discountAmount || ""}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="h-8 w-28 text-right font-medium"
                />
              </div>
              {showTaxes && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax:</span>
                  <span>₹{taxTotal.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold border-t border-border/50 pt-3">
                <span>Total:</span>
                <span className="text-orange-500">₹{(showTaxes ? grandTotal : Math.max(0, subTotal - discountAmount)).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/50 border-border/50">
         <CardContent className="pt-6 grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea placeholder="Notes for client" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Terms & Conditions</Label>
            <Textarea placeholder="Payment terms" value={terms} onChange={(e) => setTerms(e.target.value)} />
          </div>
         </CardContent>
         <CardFooter className="flex justify-end">
          <Button onClick={handleSave} disabled={isSubmitting} className="bg-orange-500 hover:bg-orange-600 text-white w-40">
            {isSubmitting ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> {isEditing ? "Update Invoice" : "Save Invoice"}</>}
          </Button>
         </CardFooter>
      </Card>
    </div>
  );
}
