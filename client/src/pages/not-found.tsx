import { Link } from "wouter";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center bg-background">
      <div className="text-center px-4">
        <Scale className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-404-title">404</h1>
        <p className="text-muted-foreground mb-6" data-testid="text-404-message">页面未找到</p>
        <Link href="/">
          <Button data-testid="button-go-home">返回首页</Button>
        </Link>
      </div>
    </div>
  );
}
