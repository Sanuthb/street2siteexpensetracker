import { ThemeProvider } from "@/components/theme-provider";
import Image from "next/image";

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
            <div className="relative h-10 w-10">
              <Image src="/logo.png" alt="Expensiq Logo" fill className="object-contain" />
            </div>
            <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
              Expensiq
            </h1>
            <span className="text-[10px] font-medium text-muted-foreground -mt-1 uppercase tracking-widest">
              Street2site
            </span>
          </div>
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
