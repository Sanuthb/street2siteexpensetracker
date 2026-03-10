import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { SettingsForms } from "@/components/forms/settings-forms";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.userId) {
    redirect("/login");
  }

  const userResult = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
  const user = userResult[0];

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <SettingsForms initialData={{ name: user.name, email: user.email }} />
    </div>
  );
}
