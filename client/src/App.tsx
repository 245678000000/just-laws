import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Code, Scale } from "lucide-react";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SearchPage from "@/pages/search";
import LawDetail from "@/pages/law-detail";
import ApiDocs from "@/pages/api-docs";

function Header() {
  const [location] = useLocation();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" data-testid="link-logo">
          <div className="flex items-center gap-2 cursor-pointer">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground text-sm">JustLaws</span>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          <Link href="/api-docs">
            <div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors ${
                location === "/api-docs" ? "bg-primary/10 text-primary" : "text-muted-foreground"
              }`}
              data-testid="link-api-docs"
            >
              <Code className="w-3.5 h-3.5" />
              API
            </div>
          </Link>
        </nav>
      </div>
    </header>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/search" component={SearchPage} />
      <Route path="/law/:nameShort" component={LawDetail} />
      <Route path="/api-docs" component={ApiDocs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Header />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
