"use server";

import { db } from "@/lib/db";
import { payments, projects, clients } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function getPayments() {
  try {
    const data = await db.select({
      id: payments.id,
      amount: payments.amount,
      method: payments.method,
      date: payments.date,
      notes: payments.notes,
      projectName: projects.name,
      clientName: clients.name
    })
    .from(payments)
    .leftJoin(projects, eq(payments.projectId, projects.id))
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .orderBy(desc(payments.date));

    return { success: true, data };
  } catch (error) {
    console.error("Failed to fetch payments", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}
