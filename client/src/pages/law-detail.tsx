import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "wouter";
import { ChevronLeft, Search, BookOpen, Calendar, ExternalLink } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { LawMeta, LawArticle } from "@shared/schema";
import ArticleCard from "@/components/article-card";

export default function LawDetail() {
  const params = useParams<{ nameShort: string }>();
  const nameShort = decodeURIComponent(params.nameShort || "");
  const [, navigate] = useLocation();
  const [filter, setFilter] = useState("");

  const { data: law, isLoading: lawLoading } = useQuery<LawMeta>({
    queryKey: ["/api/laws", nameShort],
  });

  const { data: articles, isLoading: articlesLoading } = useQuery<LawArticle[]>({
    queryKey: ["/api/laws", nameShort, "articles"],
  });

  const filteredArticles = articles?.filter((a) => {
    if (!filter.trim()) return true;
    const q = filter.trim().toLowerCase();
    return (
      a.content.toLowerCase().includes(q) ||
      a.articleNumber.includes(q) ||
      a.chapter.includes(q) ||
      a.section.includes(q)
    );
  });

  const chapters = articles
    ? Array.from(new Set(articles.map((a) => a.chapter).filter(Boolean)))
    : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              data-testid="button-back-home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="min-w-0">
              {lawLoading ? (
                <Skeleton className="h-6 w-48" />
              ) : (
                <h1 className="text-lg font-semibold text-foreground truncate" data-testid="text-law-title">
                  {law?.name || nameShort}
                </h1>
              )}
            </div>
          </div>

          {law && (
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <Badge variant="secondary" data-testid="badge-category">{law.category}</Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <BookOpen className="w-3.5 h-3.5" />
                <span data-testid="text-article-count">{law.totalArticles} 条</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="w-3.5 h-3.5" />
                <span data-testid="text-effective-date">生效日期: {law.effectiveDate}</span>
              </div>
              <a
                href={law.source}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-sm text-primary"
                data-testid="link-source"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                数据来源
              </a>
            </div>
          )}

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="input-law-filter"
              type="search"
              placeholder="在本法中搜索..."
              className="pl-9"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {articlesLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-5 w-24 mb-3" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        ) : filteredArticles && filteredArticles.length > 0 ? (
          <>
            <p className="text-sm text-muted-foreground mb-4" data-testid="text-filter-count">
              显示 {filteredArticles.length} 条法条
              {filter && ` (筛选: "${filter}")`}
            </p>
            <div className="space-y-3">
              {filteredArticles.map((article, i) => (
                <ArticleCard key={`${article.id}-${i}`} article={article} query={filter} compact />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-foreground mb-2" data-testid="text-no-articles">未找到匹配的法条</p>
            <p className="text-muted-foreground">请尝试其他关键词</p>
          </div>
        )}
      </div>
    </div>
  );
}
