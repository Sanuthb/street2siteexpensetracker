import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FolderKanban, Users, CreditCard, DollarSign, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/lib/actions/dashboard";
import { MonthlySpendingChart } from "@/components/charts/monthly-spending-chart";
import { ExpenseDialog } from "@/components/forms/expense-dialog";
import { PaymentDialog } from "@/components/forms/payment-dialog";
import { ProjectDialog } from "@/components/forms/project-dialog";
import { ClientDialog } from "@/components/forms/client-dialog";
import { getProjects } from "@/lib/actions/projects";
import { getClients } from "@/lib/actions/clients";

export default async function DashboardPage() {
  const statsResponse = await getDashboardStats();
  const stats = statsResponse.success ? statsResponse.data : null;

  const projectsResp = await getProjects();
  const projects = (projectsResp.success ? projectsResp.data : []) || [];
  
  const clientsResp = await getClients();
  const clients = (clientsResp.success ? clientsResp.data : []) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Projects</CardTitle>
            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <FolderKanban className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats?.totalProjects || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Total Active</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Client Payments</CardTitle>
             <div className="h-8 w-8 bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">₹{stats?.totalPayments?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center">Total received</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
             <div className="h-8 w-8 bg-destructive/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-destructive" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">₹{stats?.totalExpenses?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">Total tracked</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-card to-card/50 border-border/50 shadow-sm hover:shadow-md transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Remaining Balance</CardTitle>
             <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-primary">₹{stats?.remainingBalance?.toLocaleString(undefined, {minimumFractionDigits: 2}) || "0.00"}</div>
            <p className="text-xs text-muted-foreground mt-1">Available buffer</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
         <h3 className="text-lg font-semibold mb-4 text-foreground">Quick Actions</h3>
         <div className="flex gap-4 flex-wrap">
            <ExpenseDialog projects={projects} triggerVariant="outline" />
            <PaymentDialog projects={projects} triggerVariant="outline" />
            <ProjectDialog clients={clients} triggerVariant="outline" />
            <ClientDialog />
         </div>
      </div>

      {/* Main Content Area: Charts & Tables */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 bg-card/50 border-border/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <MonthlySpendingChart data={stats?.monthlyData || []} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3 bg-card/50 border-border/50 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {stats?.recentExpenses?.length ? (
                 stats.recentExpenses.map((expense) => (
                   <div key={expense.id} className="flex items-center justify-between border-b pb-2 last:border-0">
                     <div className="space-y-1">
                       <p className="text-sm font-medium leading-none">{expense.description}</p>
                       <p className="text-xs text-muted-foreground">
                         {expense.projectName ?? 'General'} • {expense.category}
                       </p>
                     </div>
                     <div className="font-medium text-sm">
                       ₹{expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                     </div>
                   </div>
                 ))
               ) : (
                 <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                   No recent expenses found
                 </div>
               )}
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
