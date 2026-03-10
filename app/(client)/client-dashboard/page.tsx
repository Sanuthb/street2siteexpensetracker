import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, DollarSign, Receipt, ArrowUpRight } from "lucide-react";
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
import { getClientDashboardStats } from "@/lib/actions/dashboard";

export default async function ClientDashboardPage() {
  const result = await getClientDashboardStats();
  const data = result.success ? result.data : null;

  if (!data) return <div className="p-8 text-center">No client data available</div>;

  const { client, projects, expenses, stats } = data;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {client.name}</h2>
        <p className="text-muted-foreground">Here's your project and billing overview.</p>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Projects</CardTitle>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.activeProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Payments Made</CardTitle>
             <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">₹{stats.totalPayments.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tracked Expenses</CardTitle>
             <div className="h-8 w-8 bg-destructive/10 rounded-full flex items-center justify-center">
                <Receipt className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">₹{stats.totalExpenses.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-primary/10 to-transparent border-primary/20 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-primary">Est. Remaining Balance</CardTitle>
             <div className="h-8 w-8 bg-primary/20 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-primary">₹{stats.remainingBudget.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Your Projects</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Budget</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                   {projects.length > 0 ? projects.map(project => (
                   <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell><Badge className="bg-primary/10 text-primary hover:bg-primary/20" variant="secondary">{project.status}</Badge></TableCell>
                      <TableCell className="text-right">₹{project.budget.toLocaleString(undefined, {minimumFractionDigits: 2})}</TableCell>
                   </TableRow>
                   )) : (
                     <TableRow>
                       <TableCell colSpan={3} className="text-center text-muted-foreground py-4">No projects found</TableCell>
                     </TableRow>
                   )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle>Recent Receipts & Expenses</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                   {expenses.length > 0 ? expenses.slice(0, 5).map(expense => (
                     <div key={expense.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                       <div className="space-y-1">
                         <p className="text-sm font-medium leading-none">{expense.description}</p>
                         <p className="text-xs text-muted-foreground">{projects.find(p => p.id === expense.projectId)?.name || 'General'}</p>
                       </div>
                       <div className="font-medium text-sm">₹{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}</div>
                     </div>
                   )) : (
                     <div className="text-center text-muted-foreground py-4">No recent expenses</div>
                   )}
                </div>
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
