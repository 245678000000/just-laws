import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Search, BookOpen, Scale, FileText, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { LawStats, LawMeta } from "@shared/schema";

const CATEGORY_ICONS: Record<string, string> = {
  '宪法': '🏛',
  '民商法': '📋',
  '刑法': '⚖',
  '经济法': '📊',
  '诉讼法': '🔍',
  '社会法': '👥',
  '行政法': '🏢',
};

const QUICK_SEARCHES = [
  { label: '民法典 第577条', query: '民法典 第577条' },
  { label: '劳动合同解除', query: '劳动合同解除' },
  { label: '个人信息保护', query: '个人信息保护' },
  { label: '公司法 股东权利', query: '公司法 股东权利' },
  { label: '正当防卫', query: '正当防卫' },
  { label: '知识产权侵权', query: '知识产权侵权' },
];

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery<LawStats>({
    queryKey: ["/api/stats"],
  });

  const { data: laws, isLoading: lawsLoading } = useQuery<LawMeta[]>({
    queryKey: ["/api/laws"],
  });

  const handleSearch = (query?: string) => {
    const q = query || searchInput;
    if (q.trim()) {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/3" />
        <div className="relative max-w-5xl mx-auto px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span data-testid="text-subtitle">AI-Ready Chinese Law Search Infrastructure</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground" data-testid="text-title">
              中国法律智能检索
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-description">
              覆盖宪法、民商法、刑法等主要法律领域，支持法条精确定位、关键词全文检索、结构化引用输出
            </p>

            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    data-testid="input-search"
                    type="search"
                    placeholder="输入法律名称、条号或关键词，如：民法典 第577条"
                    className="pl-11 h-12 text-base rounded-md border-border"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <Button
                  data-testid="button-search"
                  size="lg"
                  className="h-12 px-6"
                  onClick={() => handleSearch()}
                >
                  搜索
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {QUICK_SEARCHES.map((item) => (
                <Badge
                  key={item.query}
                  variant="secondary"
                  className="cursor-pointer text-sm px-3 py-1"
                  data-testid={`badge-quick-search-${item.label}`}
                  onClick={() => handleSearch(item.query)}
                >
                  {item.label}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-12">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-5">
                <Skeleton className="h-8 w-16 mb-2" />
                <Skeleton className="h-4 w-20" />
              </Card>
            ))
          ) : stats ? (
            <>
              <Card className="p-5 hover-elevate" data-testid="stat-laws">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-md bg-primary/10">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.totalLaws}</div>
                    <div className="text-sm text-muted-foreground">部法律</div>
                  </div>
                </div>
              </Card>
              <Card className="p-5 hover-elevate" data-testid="stat-articles">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-md bg-primary/10">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.totalArticles.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">条法条</div>
                  </div>
                </div>
              </Card>
              <Card className="p-5 hover-elevate" data-testid="stat-categories">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-md bg-primary/10">
                    <Scale className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.categories.length}</div>
                    <div className="text-sm text-muted-foreground">个分类</div>
                  </div>
                </div>
              </Card>
              <Card className="p-5 hover-elevate" data-testid="stat-api">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-md bg-primary/10">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-foreground">API</div>
                    <div className="text-sm text-muted-foreground">可调用</div>
                  </div>
                </div>
              </Card>
            </>
          ) : null}
        </div>

        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-categories-title">法律分类</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statsLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="p-5">
                  <Skeleton className="h-5 w-24 mb-3" />
                  <Skeleton className="h-4 w-32" />
                </Card>
              ))
            ) : stats?.categories.map((cat) => (
              <Card
                key={cat.id}
                className="p-5 cursor-pointer hover-elevate"
                data-testid={`card-category-${cat.id}`}
                onClick={() => navigate(`/search?category=${cat.id}`)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{CATEGORY_ICONS[cat.name] || '📄'}</span>
                      <h3 className="font-semibold text-foreground">{cat.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {cat.lawCount} 部法律 · {cat.articleCount.toLocaleString()} 条
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground mt-1 shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-foreground mb-6" data-testid="text-laws-title">收录法律</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lawsLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <Card key={i} className="p-4">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </Card>
              ))
            ) : laws?.map((law) => (
              <Card
                key={law.id}
                className="p-4 cursor-pointer hover-elevate"
                data-testid={`card-law-${law.nameShort}`}
                onClick={() => navigate(`/law/${encodeURIComponent(law.nameShort)}`)}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium text-foreground truncate">{law.name}</h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">{law.category}</Badge>
                      <span className="text-xs text-muted-foreground">{law.totalArticles} 条</span>
                      <span className="text-xs text-muted-foreground">生效: {law.effectiveDate}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
