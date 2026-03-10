import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import { Search, Filter, ChevronLeft, ChevronRight, Copy, Check, BookOpen, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { SearchResult, LawMeta, LawArticle, CitationFormat } from "@shared/schema";
import ArticleCard from "@/components/article-card";

export default function SearchPage() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const initialQuery = params.get("q") || "";
  const initialCategory = params.get("category") || "";

  const [searchInput, setSearchInput] = useState(initialQuery);
  const [activeQuery, setActiveQuery] = useState(initialQuery);
  const [activeLaw, setActiveLaw] = useState("");
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [page, setPage] = useState(1);
  const [, navigate] = useLocation();

  const categoryDisplayNames: Record<string, string> = {
    'constitution': '宪法',
    'civil-and-commercial': '民商法',
    'criminal-law': '刑法',
    'economic': '经济法',
    'procedural': '诉讼法',
    'social': '社会法',
    'administrative': '行政法',
  };

  const searchUrl = activeQuery
    ? `/api/search?q=${encodeURIComponent(activeQuery)}&page=${page}&pageSize=20${activeLaw ? `&lawName=${encodeURIComponent(activeLaw)}` : ""}${activeCategory ? `&category=${encodeURIComponent(activeCategory)}` : ""}`
    : activeCategory
    ? `/api/search?q=${encodeURIComponent(categoryDisplayNames[activeCategory] || activeCategory)}&category=${encodeURIComponent(activeCategory)}&page=${page}&pageSize=20`
    : null;

  const { data: results, isLoading } = useQuery<SearchResult>({
    queryKey: [searchUrl],
    enabled: !!searchUrl,
  });

  const { data: laws } = useQuery<LawMeta[]>({
    queryKey: ["/api/laws"],
  });

  useEffect(() => {
    setActiveQuery(initialQuery);
    setSearchInput(initialQuery);
    setActiveCategory(initialCategory);
    setPage(1);
  }, [initialQuery, initialCategory]);

  const handleSearch = useCallback(() => {
    if (searchInput.trim()) {
      setActiveQuery(searchInput.trim());
      setPage(1);
      navigate(`/search?q=${encodeURIComponent(searchInput.trim())}${activeCategory ? `&category=${activeCategory}` : ""}`);
    }
  }, [searchInput, activeCategory, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const clearFilters = () => {
    setActiveLaw("");
    setActiveCategory("");
    setPage(1);
  };

  const categoryNames = categoryDisplayNames;

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
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-search-title">法条检索</h1>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <Input
                data-testid="input-search-page"
                type="search"
                placeholder="输入关键词、法律名称或条号..."
                className="pl-10"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
            <Button data-testid="button-search-page" onClick={handleSearch}>搜索</Button>
          </div>

          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Filter className="w-3.5 h-3.5" />
              <span>筛选：</span>
            </div>
            <Select value={activeLaw} onValueChange={(v) => { setActiveLaw(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[180px] h-8 text-sm" data-testid="select-law-filter">
                <SelectValue placeholder="选择法律" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部法律</SelectItem>
                {laws?.map((law) => (
                  <SelectItem key={law.nameShort} value={law.nameShort}>
                    {law.nameShort}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activeCategory} onValueChange={(v) => { setActiveCategory(v === "all" ? "" : v); setPage(1); }}>
              <SelectTrigger className="w-[140px] h-8 text-sm" data-testid="select-category-filter">
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部分类</SelectItem>
                {Object.entries(categoryNames).map(([id, name]) => (
                  <SelectItem key={id} value={id}>{name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {(activeLaw || activeCategory) && (
              <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-sm" data-testid="button-clear-filters">
                <X className="w-3.5 h-3.5 mr-1" />
                清除
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-24" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </Card>
            ))}
          </div>
        ) : !searchUrl ? (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg" data-testid="text-search-placeholder">请输入关键词开始检索</p>
          </div>
        ) : results && results.total > 0 ? (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground" data-testid="text-result-count">
                找到 <span className="font-medium text-foreground">{results.total.toLocaleString()}</span> 条相关法条
                {results.totalPages > 1 && (
                  <span> · 第 {results.page}/{results.totalPages} 页</span>
                )}
              </p>
            </div>

            <div className="space-y-3">
              {results.articles.map((article, i) => (
                <ArticleCard key={`${article.id}-${i}`} article={article} query={activeQuery} />
              ))}
            </div>

            {results.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  data-testid="button-prev-page"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  上一页
                </Button>
                <span className="text-sm text-muted-foreground px-3" data-testid="text-page-info">
                  {page} / {results.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= results.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  data-testid="button-next-page"
                >
                  下一页
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        ) : results && results.total === 0 ? (
          <div className="text-center py-20">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg text-foreground mb-2" data-testid="text-no-results">未找到相关法条</p>
            <p className="text-muted-foreground">请尝试其他关键词或调整筛选条件</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
