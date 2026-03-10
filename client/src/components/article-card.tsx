import { useState } from "react";
import { Copy, Check, Quote, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LawArticle } from "@shared/schema";

interface ArticleCardProps {
  article: LawArticle;
  query?: string;
  compact?: boolean;
}

function highlightText(text: string, query?: string): JSX.Element {
  if (!query || !query.trim()) return <>{text}</>;
  const terms = query
    .split(/\s+/)
    .filter((t) => t.length > 0 && !t.match(/第?\d+条/) && !t.match(/第[一二三四五六七八九十百千零〇]+条/));

  if (terms.length === 0) return <>{text}</>;

  const pattern = terms
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");

  try {
    const splitRegex = new RegExp(`(${pattern})`, "gi");
    const testRegex = new RegExp(`^(?:${pattern})$`, "i");
    const parts = text.split(splitRegex);
    return (
      <>
        {parts.map((part, i) =>
          testRegex.test(part) ? (
            <mark key={i} className="bg-primary/15 text-foreground px-0.5 rounded-sm">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </>
    );
  } catch {
    return <>{text}</>;
  }
}

export default function ArticleCard({ article, query, compact }: ArticleCardProps) {
  const [expanded, setExpanded] = useState(!compact);
  const [showCitation, setShowCitation] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const { toast } = useToast();

  const contentLines = article.content.split("\n");
  const isLong = contentLines.length > 3 || article.content.length > 200;
  const displayContent = compact && !expanded && isLong
    ? article.content.slice(0, 200) + "..."
    : article.content;

  const citations = {
    formal: `《${article.lawName}》${article.articleNumber}`,
    academic: `${article.lawName}，${article.articleNumber}。`,
    brief: `${article.lawNameShort} ${article.articleNumber}`,
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast({ description: "已复制到剪贴板" });
    setTimeout(() => setCopied(null), 2000);
  };

  const copyArticle = () => {
    const fullText = `${citations.formal}\n\n${article.content}`;
    copyText(fullText, "article");
  };

  return (
    <Card className="overflow-visible" data-testid={`card-article-${article.lawNameShort}-${article.articleNumberInt}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default" className="text-xs">{article.lawNameShort}</Badge>
            <span className="font-semibold text-foreground text-sm" data-testid="text-article-number">
              {article.articleNumber}
            </span>
            {article.chapter && (
              <span className="text-xs text-muted-foreground">{article.chapter}</span>
            )}
            {article.section && (
              <span className="text-xs text-muted-foreground">/ {article.section}</span>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setShowCitation(!showCitation)}
              data-testid="button-toggle-citation"
            >
              <Quote className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={copyArticle}
              data-testid="button-copy-article"
            >
              {copied === "article" ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        <div className="text-sm leading-relaxed text-foreground whitespace-pre-line" data-testid="text-article-content">
          {highlightText(displayContent, query)}
        </div>

        {compact && isLong && (
          <button
            className="flex items-center gap-1 text-xs text-primary mt-2"
            onClick={() => setExpanded(!expanded)}
            data-testid="button-expand-article"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-3 h-3" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="w-3 h-3" />
                展开全文
              </>
            )}
          </button>
        )}

        {showCitation && (
          <div className="mt-4 pt-3 border-t space-y-2">
            <p className="text-xs font-medium text-muted-foreground mb-2">引用格式</p>
            {Object.entries(citations).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between gap-2 bg-muted/30 rounded-md px-3 py-2">
                <div className="min-w-0">
                  <span className="text-xs text-muted-foreground capitalize mr-2">
                    {key === 'formal' ? '正式' : key === 'academic' ? '学术' : '简略'}:
                  </span>
                  <span className="text-sm font-mono text-foreground" data-testid={`text-citation-${key}`}>{value}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={() => copyText(value, key)}
                  data-testid={`button-copy-citation-${key}`}
                >
                  {copied === key ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
