import { Sidebar } from "@/components/sidebar/sidebar";
import { ThemeProvider } from "../../components/theme-provider";
import { getSession } from "@/lib/session";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { MobileSidebar } from "@/components/sidebar/mobile-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  let user = null;
  if (session?.userId) {
    const userResult = await db.select().from(users).where(eq(users.id, session.userId)).limit(1);
    user = userResult[0] || null;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="h-full relative dark:bg-background bg-slate-50">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80">
          <Sidebar user={user} />
        </div>
        <main className="md:pl-72 h-full">
            <div className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-4 md:px-8 shadow-sm">
                <div className="flex w-full items-center gap-x-4">
                   <MobileSidebar user={user} />
                   <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                   <div className="ml-auto">
                     {/* Top Header Actions (Notifications, etc) can go here */}
                   </div>
                </div>
            </div>
          <div className="p-4 md:p-8">
             {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
