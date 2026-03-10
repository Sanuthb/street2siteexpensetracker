"use server";

import { db } from "@/lib/db";
import { clients, projects } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";

export async function getClients() {
  try {
    const data = await db.select({
      id: clients.id,
      name: clients.name,
      email: clients.email,
      phone: clients.phone,
      company: clients.company,
    }).from(clients);

    // Get project counts per client
    const enhancedData = await Promise.all(
        data.map(async (client) => {
            const projectsResult = await db.select({ value: count() }).from(projects).where(eq(projects.clientId, client.id));
            return {
                ...client,
                activeProjects: projectsResult[0]?.value || 0
            }
        })
    )

    return { success: true, data: enhancedData };
  } catch (error) {
    console.error("Failed to fetch clients", error);
    return { success: false, error: "Failed to fetch clients" };
  }
}
