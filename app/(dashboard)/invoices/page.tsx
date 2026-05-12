import { getInvoices } from "@/lib/actions/invoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, Calendar } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DocumentActions } from "@/components/actions/document-actions";

export default async function InvoicesPage() {
  const response = await getInvoices();
  const invoices = response.success ? response.data : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Invoices</h2>
          <p className="text-muted-foreground">Manage your billing and track payments.</p>
        </div>
        <Link href="/invoices/create">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      </div>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Number</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date / Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Paid</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices?.length ? (
                invoices.map((inv: any) => (
                  <TableRow key={inv.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-orange-500" />
                      {inv.number}
                    </TableCell>
                    <TableCell>{inv.clientName || '-'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span className="flex items-center gap-2"><Calendar className="h-3 w-3" /> {new Date(inv.date).toLocaleDateString()}</span>
                        {inv.dueDate && <span className="text-xs">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">₹{inv.grandTotal.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium text-green-600">₹{inv.paidAmount.toLocaleString()}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={inv.status === 'Draft' ? 'secondary' : inv.status === 'Paid' ? 'default' : inv.status === 'Overdue' ? 'destructive' : 'outline'} className={inv.status === 'Paid' ? 'bg-green-500' : ''}>
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <DocumentActions id={inv.id} type="invoice" status={inv.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No invoices found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
