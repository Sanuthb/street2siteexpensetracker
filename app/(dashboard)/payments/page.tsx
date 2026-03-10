import { getPayments } from "@/lib/actions/payments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { PaymentDialog } from "@/components/forms/payment-dialog";
import { getProjects } from "@/lib/actions/projects";

export default async function PaymentsPage() {
  const response = await getPayments();
  const payments = response.success ? response.data : [];

  const projectsResp = await getProjects();
  const projects = (projectsResp.success ? projectsResp.data : []) || [];

  const getMethodColor = (method: string) => {
      switch(method.toLowerCase()) {
          case 'stripe': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
          case 'bank transfer': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
          case 'upi': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
          default: return 'bg-muted text-muted-foreground border-border';
      }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payments</h2>
          <p className="text-muted-foreground">Track incoming client payments.</p>
        </div>
        <PaymentDialog projects={projects} />
      </div>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments?.length ? (
                payments.map((payment) => (
                  <TableRow key={payment.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="text-muted-foreground">
                        {format(new Date(payment.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <CreditCard className="h-4 w-4 text-muted-foreground" />
                           {payment.clientName}
                        </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{payment.projectName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getMethodColor(payment.method)}>
                        {payment.method}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-bold text-emerald-500">
                        +${payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No payments recorded yet.
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
