"use server";

import { db } from "@/lib/db";
import { projects, payments, expenses, clients, invoices } from "@/lib/db/schema";
import { count, sum, desc, inArray, eq, sql } from "drizzle-orm";

export async function getDashboardStats() {
  try {
    const totalProjectsResult = await db.select({ value: count() }).from(projects);
    const totalProjects = totalProjectsResult[0].value;

    const totalPaymentsResult = await db.select({ value: sum(payments.amount) }).from(payments);
    const totalPayments = Number(totalPaymentsResult[0]?.value) || 0;

    const totalExpensesResult = await db.select({ value: sum(expenses.amount) }).from(expenses);
    const totalExpenses = Number(totalExpensesResult[0]?.value) || 0;

    const remainingBalance = totalPayments - totalExpenses;

    const totalInvoicesResult = await db.select({ value: sum(invoices.grandTotal) }).from(invoices);
    const totalBilled = Number(totalInvoicesResult[0]?.value) || 0;

    const overdueInvoicesResult = await db.select({ value: count() }).from(invoices).where(eq(invoices.status, 'Overdue'));
    const overdueInvoices = overdueInvoicesResult[0]?.value || 0;

    const recentExpenses = await db.select({
      id: expenses.id,
      description: expenses.description,
      amount: expenses.amount,
      date: expenses.date,
      category: expenses.category,
      projectId: expenses.projectId,
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
      clientName: clients.name,
      invoiceNumber: invoices.number
    })
    .from(payments)
    .leftJoin(projects, eq(payments.projectId, projects.id))
    .leftJoin(invoices, eq(payments.invoiceId, invoices.id))
    .leftJoin(clients, sql`COALESCE(${projects.clientId}, ${invoices.clientId}) = ${clients.id}`)
    .orderBy(desc(payments.date))
    .limit(5);

    // Aggregate monthly data
    const currentYear = new Date().getFullYear();
    const allExpenses = await db.select({ amount: expenses.amount, date: expenses.date }).from(expenses);
    const allPayments = await db.select({ amount: payments.amount, date: payments.date }).from(payments);
    
    const monthlyExpensesMap = new Map();
    const monthlyIncomeMap = new Map();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    monthNames.forEach(name => {
      monthlyExpensesMap.set(name, 0);
      monthlyIncomeMap.set(name, 0);
    });

    allExpenses.forEach(exp => {
      const d = new Date(exp.date);
      if (d.getFullYear() === currentYear) {
         const m = monthNames[d.getMonth()];
         monthlyExpensesMap.set(m, monthlyExpensesMap.get(m) + exp.amount);
      }
    });

    allPayments.forEach(pay => {
      const d = new Date(pay.date);
      if (d.getFullYear() === currentYear) {
         const m = monthNames[d.getMonth()];
         monthlyIncomeMap.set(m, monthlyIncomeMap.get(m) + pay.amount);
      }
    });

    const monthlyData = monthNames.map(name => ({ 
      name, 
      total: monthlyExpensesMap.get(name),
      income: monthlyIncomeMap.get(name)
    }));

    return {
      success: true,
      data: {
        totalProjects,
        totalPayments,
        totalExpenses,
        remainingBalance,
        totalBilled,
        overdueInvoices,
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
        const allClients = await db.select().from(clients).limit(1);
        clientRecord = allClients[0] || null;
    }

    if (!clientRecord) {
        return { success: false, error: "No client found." };
    }

    const clientProjects = await db.select().from(projects).where(eq(projects.clientId, clientRecord.id));
    const projectIds = clientProjects.map(p => p.id);

    const clientInvoices = await db.select().from(invoices).where(eq(invoices.clientId, clientRecord.id));
    const invoiceIds = clientInvoices.map(i => i.id);

    let clientPayments: any[] = [];
    let totalPayments = 0;
    let clientExpenses: any[] = [];
    let totalExpenses = 0;

    // Fetch payments linked to projects OR invoices for this client
    clientPayments = await db.select()
      .from(payments)
      .where(sql`${payments.projectId} IN ${projectIds.length > 0 ? projectIds : ['none']} OR ${payments.invoiceId} IN ${invoiceIds.length > 0 ? invoiceIds : ['none']}`)
      .orderBy(desc(payments.date));
      
    totalPayments = clientPayments.reduce((acc, curr) => acc + curr.amount, 0);

    if (projectIds.length > 0) {
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
