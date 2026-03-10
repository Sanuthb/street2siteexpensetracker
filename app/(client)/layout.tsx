import { ThemeProvider } from "../../components/theme-provider";
import Link from "next/link";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="h-full relative dark:bg-background bg-slate-50 min-h-screen">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-8 shadow-sm">
            <div className="flex w-full justify-between items-center max-w-6xl mx-auto">
                <Link href="/client-dashboard" className="flex items-center">
                    <div className="relative h-8 w-8 mr-3 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-primary font-bold text-xl leading-none">E</span>
                    </div>
                    <h1 className="text-xl font-bold tracking-tight">Expensio Client Portal</h1>
                </Link>
                <div className="flex items-center gap-4">
                    <div className="flex flex-col text-right">
                        <p className="text-sm font-medium">Acme Corp</p>
                        <p className="text-xs text-muted-foreground">Client Mode</p>
                    </div>
                    <div className="h-10 w-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-semibold">
                        AC
                    </div>
                </div>
            </div>
        </header>
        <main className="max-w-6xl mx-auto p-8">
            {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
