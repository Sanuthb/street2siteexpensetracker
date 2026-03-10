import { Sidebar } from "@/components/sidebar/sidebar";
import { ThemeProvider } from "../../components/theme-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="h-full relative dark:bg-background bg-slate-50">
        <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-80">
          <Sidebar />
        </div>
        <main className="md:pl-72 h-full">
            <div className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-8 shadow-sm">
                <div className="flex w-full justify-between items-center">
                   <h2 className="text-lg font-semibold text-foreground">Overview</h2>
                   {/* Top Header Actions (Notifications, etc) can go here */}
                </div>
            </div>
          <div className="p-8">
             {children}
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
