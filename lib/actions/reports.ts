"use server";

import { db } from "@/lib/db";
import { projects, payments, expenses } from "@/lib/db/schema";

export async function getReportsData() {
  try {
    const allExpenses = await db.select().from(expenses);
    const allProjects = await db.select().from(projects);

    // Category calculation
    const categoryMap = new Map<string, number>();
    allExpenses.forEach(exp => {
      categoryMap.set(exp.category, (categoryMap.get(exp.category) || 0) + exp.amount);
    });
    
    const categoryData = Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a,b) => b.value - a.value);

    // Project Budget vs Spent calculation
    const projectData = allProjects.map(p => {
       const projectExpenses = allExpenses
           .filter(e => e.projectId === p.id)
           .reduce((acc, curr) => acc + curr.amount, 0);
           
       return {
          name: p.name,
          budget: p.budget,
          spent: projectExpenses
       };
    }).sort((a,b) => b.budget - a.budget).slice(0, 10); // top 10 projects

    return {
       success: true,
       data: {
          categoryData,
          projectData
       }
    };
  } catch (error) {
    console.error("Failed to fetch reports data", error);
    return { success: false, error: "Failed to fetch reports data" };
  }
}
