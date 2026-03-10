import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getReportsData } from "@/lib/actions/reports";
import { CategoryPieChart } from "@/components/charts/category-pie-chart";
import { ProjectBudgetChart } from "@/components/charts/project-budget-chart";

export default async function ReportsPage() {
  const result = await getReportsData();
  const data = result.success ? result.data : null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Reports & Analytics</h2>
        <p className="text-muted-foreground">Visualize your spending patterns and project margins.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/50 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>Breakdown of all logged expenses across categories.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryPieChart data={data?.categoryData || []} />
          </CardContent>
        </Card>

        <Card className="bg-card/50 shadow-sm border-border/50">
          <CardHeader>
            <CardTitle>Project Budgets vs. Spent</CardTitle>
            <CardDescription>Compare allocated budgets with actual tracked expenditures.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectBudgetChart data={data?.projectData || []} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
