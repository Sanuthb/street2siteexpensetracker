import { getProjectById } from "@/lib/actions/projects";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Receipt, CreditCard, CalendarDays, DollarSign, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ProjectInvoiceUpload } from "@/components/forms/project-invoice-upload";

export default async function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const result = await getProjectById(resolvedParams.id);
  
  if (!result.success || !result.data) {
    notFound();
  }

  const project = result.data;
  const totalSpent = project.expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const totalPaid = project.payments.reduce((sum, pay) => sum + pay.amount, 0);
  const budgetRemaining = project.budget - totalSpent;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{project.name}</h2>
          <p className="text-muted-foreground">Client: {project.clientName || 'Unassigned'}</p>
        </div>
        <div className="flex items-center gap-4">
           <ProjectInvoiceUpload projectId={project.id} invoiceUrl={project.invoiceUrl} />
           <Badge variant={project.status === 'active' ? 'default' : 'secondary'} className="capitalize text-sm px-3 py-1">
              {project.status}
           </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Budget</CardTitle>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${project.budget.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Spent</CardTitle>
            <div className="h-8 w-8 bg-destructive/10 rounded-full flex items-center justify-center">
                <Receipt className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${totalSpent.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground mt-1">${budgetRemaining.toLocaleString()} remaining</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Paid</CardTitle>
            <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">${totalPaid.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 shadow-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Timeline</CardTitle>
            <div className="h-8 w-8 bg-blue-500/10 rounded-full flex items-center justify-center">
                <CalendarDays className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium mt-2">
                {project.startDate ? format(new Date(project.startDate), 'MMM dd, yyyy') : 'TBD'} - {project.endDate ? format(new Date(project.endDate), 'MMM dd, yyyy') : 'TBD'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="expenses" className="w-full">
        <TabsList className="mb-4 bg-muted/50 w-full justify-start p-1 h-auto">
          <TabsTrigger value="expenses" className="px-6 py-2">Expenses</TabsTrigger>
          <TabsTrigger value="payments" className="px-6 py-2">Payments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="expenses" className="mt-0">
          <Card className="bg-card/50 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Project Expenses</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Date</TableHead>
                     <TableHead>Description</TableHead>
                     <TableHead>Category</TableHead>
                     <TableHead className="text-right">Amount</TableHead>
                     <TableHead className="text-center">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {project.expenses.length > 0 ? project.expenses.map(expense => (
                      <TableRow key={expense.id}>
                         <TableCell className="text-muted-foreground">{format(new Date(expense.date), 'MMM dd, yyyy')}</TableCell>
                         <TableCell className="font-medium">{expense.description}</TableCell>
                         <TableCell><Badge variant="outline">{expense.category}</Badge></TableCell>
                         <TableCell className="text-right font-medium">${expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                         <TableCell className="text-center">
                             {expense.receiptUrl ? (
                                 <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10 hover:text-primary" asChild>
                                     <a href={expense.receiptUrl} target="_blank" rel="noopener noreferrer">
                                        <FileText className="h-4 w-4" />
                                     </a>
                                 </Button>
                             ) : (
                                 <span className="text-muted-foreground text-xs">-</span>
                             )}
                         </TableCell>
                      </TableRow>
                   )) : (
                     <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">No expenses logged for this project.</TableCell>
                     </TableRow>
                   )}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payments" className="mt-0">
           <Card className="bg-card/50 shadow-sm border-border/50">
            <CardHeader>
              <CardTitle>Client Payments</CardTitle>
            </CardHeader>
            <CardContent>
               <Table>
                <TableHeader>
                  <TableRow>
                     <TableHead>Date</TableHead>
                     <TableHead>Method</TableHead>
                     <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {project.payments.length > 0 ? project.payments.map(payment => (
                      <TableRow key={payment.id}>
                         <TableCell className="text-muted-foreground">{format(new Date(payment.date), 'MMM dd, yyyy')}</TableCell>
                         <TableCell><Badge variant="secondary" className="bg-secondary/50">{payment.method}</Badge></TableCell>
                         <TableCell className="text-right font-medium">${payment.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                      </TableRow>
                   )) : (
                     <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">No payments recorded for this project.</TableCell>
                     </TableRow>
                   )}
                </TableBody>
               </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
