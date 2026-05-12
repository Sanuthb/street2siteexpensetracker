import { getQuotations } from "@/lib/actions/quotations";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Calendar, CheckCircle2, Clock, XCircle, Send } from "lucide-react";
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

type QuotationListItem = {
  id: string;
  number: string;
  date: Date;
  validUntil: Date | null;
  grandTotal: number;
  status: string;
  clientName: string | null;
  projectName: string | null;
  projectTitle?: string;
  template?: string;
};

function countStatus(quotations: QuotationListItem[], status: string) {
  return quotations.filter((quotation) => quotation.status === status).length;
}

export default async function QuotationsPage() {
  const response = await getQuotations();
  const quotations = (response.success ? response.data : []) as QuotationListItem[];
  const stats = [
    { label: "Draft", value: countStatus(quotations, "Draft"), icon: Clock, className: "text-slate-500" },
    { label: "Sent", value: countStatus(quotations, "Sent"), icon: Send, className: "text-blue-500" },
    { label: "Approved", value: countStatus(quotations, "Approved"), icon: CheckCircle2, className: "text-green-500" },
    { label: "Rejected", value: countStatus(quotations, "Rejected"), icon: XCircle, className: "text-red-500" },
    { label: "Expired", value: countStatus(quotations, "Expired"), icon: Calendar, className: "text-orange-500" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proposal Quotations</h2>
          <p className="text-muted-foreground">Build premium multi-page agency proposals and track approvals.</p>
        </div>
        <Link href="/quotations/create">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-all hover:shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Create Proposal
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="border-border/60 bg-card/70">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-black">{stat.value}</p>
                </div>
                <Icon className={`h-6 w-6 ${stat.className}`} />
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>Recent Proposals</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Proposal</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Template</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quotations.length ? (
                quotations.map((quo) => (
                  <TableRow key={quo.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium text-foreground">
                      <div className="flex items-start gap-2">
                        <FileText className="mt-1 h-4 w-4 text-orange-500" />
                        <div>
                          <Link href={`/quotations/${quo.id}`} className="font-bold hover:text-orange-600">{quo.number}</Link>
                          <p className="text-xs text-muted-foreground">{quo.projectTitle || quo.projectName || "Proposal quotation"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{quo.clientName || "-"}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(quo.date).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{quo.template?.replace("-", " ") || "Modern Orange"}</TableCell>
                    <TableCell className="text-right font-medium">₹{quo.grandTotal.toLocaleString("en-IN")}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={quo.status === "Draft" ? "secondary" : quo.status === "Converted" ? "default" : "outline"} className={quo.status === "Converted" ? "bg-green-500" : ""}>
                        {quo.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DocumentActions id={quo.id} type="quotation" status={quo.status} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                    No quotations found.
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
