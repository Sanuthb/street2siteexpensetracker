"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";

export function ProjectBudgetChart({ data }: { data: { name: string, budget: number, spent: number }[] }) {
  if (!data || data.length === 0) return <div className="h-[350px] flex items-center justify-center text-muted-foreground">No data available</div>;

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={data}>
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
        <Tooltip cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', color: 'hsl(var(--foreground))' }} itemStyle={{ color: 'hsl(var(--foreground))' }} />
        <Legend wrapperStyle={{ paddingTop: '20px' }} />
        <Bar dataKey="budget" fill="hsl(var(--muted-foreground)/0.3)" radius={[4, 4, 0, 0]} name="Allocated Budget" />
        <Bar dataKey="spent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} name="Actual Spent" />
      </BarChart>
    </ResponsiveContainer>
  );
}
