"use server";

import { db } from "@/lib/db";
import { expenses, projects, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getExpenses() {
  try {
    const data = await db.select({
      id: expenses.id,
      projectId: expenses.projectId,
      subject: expenses.subject,
      merchant: expenses.merchant,
      description: expenses.description,
      amount: expenses.amount,
      category: expenses.category,
      date: expenses.date,
      receiptUrl: expenses.receiptUrl,
      projectName: projects.name,
      clientName: clients.name
    })
    .from(expenses)
    .leftJoin(projects, eq(expenses.projectId, projects.id))
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .orderBy(desc(expenses.date));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch expenses", error);
    return { success: false, error: "Failed to fetch expenses" };
  }
}
