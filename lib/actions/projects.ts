"use server";

import { db } from "@/lib/db";
import { projects, clients, payments, expenses } from "@/lib/db/schema";
import { eq, sum } from "drizzle-orm";

export async function getProjects() {
  try {
    const data = await db.select({
      id: projects.id,
      name: projects.name,
      clientId: projects.clientId,
      status: projects.status,
      budget: projects.budget,
      startDate: projects.startDate,
      endDate: projects.endDate,
      clientName: clients.name,
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id));

    // Calculate aggregated values per project
    const enhancedData = await Promise.all(
       data.map(async (project) => {
          const projectPayments = await db.select({ value: sum(payments.amount) }).from(payments).where(eq(payments.projectId, project.id));
          const projectExpenses = await db.select({ value: sum(expenses.amount) }).from(expenses).where(eq(expenses.projectId, project.id));

          const totalPayments = Number(projectPayments[0]?.value) || 0;
          const totalExpenses = Number(projectExpenses[0]?.value) || 0;
          const remaining = totalPayments - totalExpenses;

          return {
             ...project,
             totalPayments,
             totalExpenses,
             remaining
          }
       })
    )

    return { success: true, data: enhancedData };
  } catch (error) {
    console.error("Failed to fetch projects:", error);
    return { success: false, error: "Failed to load projects" };
  }
}

export async function getProjectById(projectId: string) {
  try {
    const projectResults = await db.select({
      id: projects.id,
      name: projects.name,
      clientId: projects.clientId,
      budget: projects.budget,
      status: projects.status,
      startDate: projects.startDate,
      endDate: projects.endDate,
      invoiceUrl: projects.invoiceUrl,
      isPublic: projects.isPublic,
      shareToken: projects.shareToken,
      clientName: clients.name
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.id, projectId))
    .limit(1);

    const project = projectResults[0];

    if (!project) {
        return { success: false, error: "Project not found" };
    }

    const projectPayments = await db.select().from(payments).where(eq(payments.projectId, projectId));
    const projectExpenses = await db.select().from(expenses).where(eq(expenses.projectId, projectId));

    return {
      success: true,
      data: {
         ...project,
         payments: projectPayments,
         expenses: projectExpenses
      }
    };
  } catch (error) {
    console.error(`Failed to fetch project ${projectId}:`, error);
    return { success: false, error: "Failed to load project details" };
  }
}

export async function toggleProjectSharing(projectId: string, enabled: boolean) {
  try {
    if (enabled) {
      const shareToken = crypto.randomUUID();
      await db.update(projects)
        .set({ isPublic: true, shareToken })
        .where(eq(projects.id, projectId));
    } else {
      await db.update(projects)
        .set({ isPublic: false, shareToken: null })
        .where(eq(projects.id, projectId));
    }
    return { success: true };
  } catch (error) {
    console.error(`Failed to toggle sharing for project ${projectId}:`, error);
    return { success: false, error: "Failed to update sharing settings" };
  }
}

export async function getProjectByShareToken(token: string) {
  try {
    const projectResults = await db.select({
      id: projects.id,
      name: projects.name,
      clientId: projects.clientId,
      budget: projects.budget,
      status: projects.status,
      startDate: projects.startDate,
      endDate: projects.endDate,
      invoiceUrl: projects.invoiceUrl,
      clientName: clients.name
    })
    .from(projects)
    .leftJoin(clients, eq(projects.clientId, clients.id))
    .where(eq(projects.shareToken, token))
    .limit(1);

    const project = projectResults[0];

    if (!project) {
        return { success: false, error: "Project not found or link expired" };
    }

    const projectPayments = await db.select().from(payments).where(eq(payments.projectId, project.id));
    const projectExpenses = await db.select().from(expenses).where(eq(expenses.projectId, project.id));

    return {
      success: true,
      data: {
         ...project,
         payments: projectPayments,
         expenses: projectExpenses
      }
    };
  } catch (error) {
    console.error(`Failed to fetch project by token ${token}:`, error);
    return { success: false, error: "Failed to load project details" };
  }
}
