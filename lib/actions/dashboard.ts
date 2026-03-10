"use server";

import { db } from "@/lib/db";
import { projects, payments, expenses, clients } from "@/lib/db/schema";
import { count, sum, desc, inArray } from "drizzle-orm";
import { eq } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    const totalProjectsResult = await db.select({ value: count() }).from(projects);
    const totalProjects = totalProjectsResult[0].value;

    const totalPaymentsResult = await db.select({ value: sum(payments.amount) }).from(payments);
    const totalPayments = Number(totalPaymentsResult[0]?.value) || 0;

    const totalExpensesResult = await db.select({ value: sum(expenses.amount) }).from(expenses);
    const totalExpenses = Number(totalExpensesResult[0]?.value) || 0;

    const remainingBalance = totalPayments - totalExpenses;

    const recentExpenses = await db.select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      category: expenses.category,
      projectName: projects.name
    })
    .from(expenses)
    .leftJoin(projects, eq(expenses.projectId, projects.id))
    .orderBy(desc(expenses.date))
    .limit(5);

    const recentPayments = await db.select({
      id: payments.id,
      amount: payments.amount,
      date: payments.date,
      method: payments.method,
      projectName: projects.name,
      clientName: clients.name
    })
    .from(payments)
    .leftJoin(projects, eq(payments.projectId, projects.id))
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .orderBy(desc(payments.date))
    .limit(5);

    // Aggregate monthly data
    const currentYear = new Date().getFullYear();
    const allExpenses = await db.select({ amount: expenses.amount, date: expenses.date }).from(expenses);
    
    const monthlyDataMap = new Map();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    monthNames.forEach(name => monthlyDataMap.set(name, 0));

    allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      if (d.getFullYear() === currentYear) {
         const m = monthNames[d.getMonth()];
         monthlyDataMap.set(m, monthlyDataMap.get(m) + exp.amount);
      }
    });
    const monthlyData = monthNames.map(name => ({ name, total: monthlyDataMap.get(name) }));

    return {
      success: true,
      data: {
        totalProjects,
        totalPayments,
        totalExpenses,
        remainingBalance,
        recentExpenses,
        recentPayments,
        monthlyData
      }
    };
  } catch (error) {
    console.error("Failed to fetch dashboard stats", error);
    return { success: false, error: "Failed to fetch dashboard statistics" };
  }
}

export async function getClientDashboardStats(clientId?: string) {
  try {
    let clientRecord = null;
    if (clientId) {
        const clientsResult = await db.select().from(clients).where(eq(clients.id, clientId)).limit(1);
        clientRecord = clientsResult[0];
    } else {
        // Fallback for simulation: get the first client
        const allClients = await db.select().from(clients).limit(1);
        clientRecord = allClients[0] || null;
    }

    if (!clientRecord) {
        return { success: false, error: "No client found." };
    }

    const clientProjects = await db.select().from(projects).where(eq(projects.clientId, clientRecord.id));
    const projectIds = clientProjects.map(p => p.id);

    let clientPayments: (typeof payments.$inferSelect)[] = [];
    let totalPayments = 0;
    let clientExpenses: (typeof expenses.$inferSelect)[] = [];
    let totalExpenses = 0;

    if (projectIds.length > 0) {
        clientPayments = await db.select()
          .from(payments)
          .where(inArray(payments.projectId, projectIds))
          .orderBy(desc(payments.date));
          
        totalPayments = clientPayments.reduce((acc, curr) => acc + curr.amount, 0);

        clientExpenses = await db.select()
          .from(expenses)
          .where(inArray(expenses.projectId, projectIds))
          .orderBy(desc(expenses.date));

        totalExpenses = clientExpenses.reduce((acc, curr) => acc + curr.amount, 0);
    }

    const activeProjects = clientProjects.filter(p => p.status === 'active').length;
    const remainingBudget = clientProjects.reduce((acc, curr) => acc + curr.budget, 0) - totalExpenses;

    return {
       success: true,
       data: {
           client: clientRecord,
           projects: clientProjects,
           payments: clientPayments,
           expenses: clientExpenses,
           stats: {
               activeProjects,
               totalPayments,
               totalExpenses,
               remainingBudget
           }
       }
    };

  } catch (error) {
    console.error("Failed to fetch client dashboard stats", error);
    return { success: false, error: "Failed to fetch client dashboard metrics" };
  }
}
