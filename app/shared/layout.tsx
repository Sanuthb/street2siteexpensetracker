import { ThemeProvider } from "@/components/theme-provider";

export default function SharedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <div className="min-h-screen bg-background">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-md flex items-center px-4 md:px-8 shadow-sm justify-between">
          <div className="flex items-center gap-x-3">
            <div className="relative h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <span className="text-primary font-bold text-xl leading-none">E</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight">Expensio</h1>
          </div>
          <div className="text-sm text-muted-foreground font-medium">
            Client Portal
          </div>
        </header>
        <main className="p-4 md:p-8 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </ThemeProvider>
  );
}
