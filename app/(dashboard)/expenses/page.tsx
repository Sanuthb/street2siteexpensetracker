import { getExpenses } from "@/lib/actions/expenses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Receipt, FileText } from "lucide-react";
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
import { ExpenseDialog } from "@/components/forms/expense-dialog";
import { getProjects } from "@/lib/actions/projects";
import { DeleteExpenseButton } from "@/components/forms/delete-expense-button";

export default async function ExpensesPage() {
  const response = await getExpenses();
  const expenses = response.success ? response.data : [];

  const projectsResp = await getProjects();
  const projects = (projectsResp.success ? projectsResp.data : []) || [];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Expenses</h2>
          <p className="text-muted-foreground">Track and manage business expenses.</p>
        </div>
        <ExpenseDialog projects={projects} />
      </div>

      <Card className="bg-card/50 shadow-sm border-border/50">
        <CardHeader>
          <CardTitle>All Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Project</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="text-center">Receipt</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {expenses?.length ? (
                expenses.map((expense) => (
                  <TableRow key={expense.id} className="border-border/50 hover:bg-muted/50 transition-colors">
                    <TableCell className="text-muted-foreground">
                        {format(new Date(expense.date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                           <Receipt className="h-4 w-4 text-muted-foreground" />
                           {expense.description}
                        </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-secondary/50">
                        {expense.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{expense.projectName || 'General'}</TableCell>
                    <TableCell className="text-right font-medium">
                        ${expense.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                    </TableCell>
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
                    <TableCell className="text-right">
                        <DeleteExpenseButton id={expense.id} />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    No expenses logged yet.
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
