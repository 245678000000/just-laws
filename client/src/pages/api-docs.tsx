import { useLocation } from "wouter";
import { ChevronLeft, Code, Copy, Check, Terminal, Zap, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  params?: string;
  example: string;
  response: string;
}

const API_ENDPOINTS: ApiEndpoint[] = [
  {
    method: "GET",
    path: "/api/search",
    description: "全文检索法条。支持按法律名称、分类筛选，支持分页。",
    params: "q (必填), lawName, category, page, pageSize",
    example: '/api/search?q=民法典 第577条',
    response: `{
  "articles": [{
    "lawName": "中华人民共和国民法典",
    "lawNameShort": "民法典",
    "articleNumber": "第五百七十七条",
    "content": "当事人一方不履行合同义务...",
    "chapter": "第三编　合同",
    "category": "民商法"
  }],
  "total": 1,
  "page": 1,
  "totalPages": 1
}`,
  },
  {
    method: "GET",
    path: "/api/article/:lawName/:articleNumber",
    description: "精确定位单条法条，同时返回引用格式。",
    params: "lawName (法律简称), articleNumber (条号数字)",
    example: '/api/article/民法典/577',
    response: `{
  "article": {
    "lawName": "中华人民共和国民法典",
    "articleNumber": "第五百七十七条",
    "content": "当事人一方不履行合同义务..."
  },
  "citation": {
    "formal": "《中华人民共和国民法典》第五百七十七条",
    "academic": "中华人民共和国民法典，第五百七十七条。",
    "brief": "民法典 第五百七十七条"
  }
}`,
  },
  {
    method: "GET",
    path: "/api/laws",
    description: "获取所有收录法律的元信息列表。",
    example: '/api/laws',
    response: `[{
  "name": "中华人民共和国民法典",
  "nameShort": "民法典",
  "category": "民商法",
  "totalArticles": 1258,
  "effectiveDate": "2021-01-01"
}]`,
  },
  {
    method: "GET",
    path: "/api/laws/:nameShort/articles",
    description: "获取指定法律的全部法条。",
    example: '/api/laws/民法典/articles',
    response: `[{
  "articleNumber": "第一条",
  "content": "为了保护民事主体的合法权益...",
  "chapter": "第一编　总则",
  "section": ""
}]`,
  },
  {
    method: "GET",
    path: "/api/stats",
    description: "获取法律数据库统计信息。",
    example: '/api/stats',
    response: `{
  "totalLaws": 24,
  "totalArticles": 4129,
  "categories": [...]
}`,
  },
  {
    method: "GET",
    path: "/api/citation/:lawName/:articleNumber",
    description: "生成指定法条的规范化引用格式。",
    example: '/api/citation/民法典/577',
    response: `{
  "formal": "《中华人民共和国民法典》第五百七十七条",
  "academic": "中华人民共和国民法典，第五百七十七条。",
  "brief": "民法典 第五百七十七条"
}`,
  },
];

export default function ApiDocs() {
  const [, navigate] = useLocation();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card/50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              data-testid="button-back-home"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground" data-testid="text-api-title">API 文档</h1>
          </div>
          <p className="text-muted-foreground ml-12">所有接口均为 RESTful GET 请求，返回 JSON 格式数据。可直接供 AI Agent / MCP / Skill 调用。</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Zap className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">零配置调用</h3>
            </div>
            <p className="text-sm text-muted-foreground">无需 API Key，直接 HTTP GET 即可使用</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-primary/10">
                <Code className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">结构化输出</h3>
            </div>
            <p className="text-sm text-muted-foreground">JSON 格式返回，便于 AI 推理和二次处理</p>
          </Card>
          <Card className="p-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-md bg-primary/10">
                <BookOpen className="w-4 h-4 text-primary" />
              </div>
              <h3 className="font-medium text-foreground">引用生成</h3>
            </div>
            <p className="text-sm text-muted-foreground">自动输出正式、学术、简略三种引用格式</p>
          </Card>
        </div>

        <div className="space-y-6">
          {API_ENDPOINTS.map((endpoint, index) => (
            <Card key={index} className="overflow-visible" data-testid={`card-api-endpoint-${index}`}>
              <div className="p-5 border-b">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <Badge variant="default" className="text-xs font-mono">{endpoint.method}</Badge>
                  <code className="text-sm font-mono text-foreground">{endpoint.path}</code>
                </div>
                <p className="text-sm text-muted-foreground">{endpoint.description}</p>
                {endpoint.params && (
                  <p className="text-xs text-muted-foreground mt-1">
                    <span className="font-medium">参数: </span>{endpoint.params}
                  </p>
                )}
              </div>

              <Tabs defaultValue="example" className="p-5 pt-3">
                <TabsList className="mb-3">
                  <TabsTrigger value="example" className="text-xs">请求示例</TabsTrigger>
                  <TabsTrigger value="response" className="text-xs">返回示例</TabsTrigger>
                  <TabsTrigger value="curl" className="text-xs">cURL</TabsTrigger>
                </TabsList>
                <TabsContent value="example">
                  <div className="relative">
                    <pre className="bg-muted/50 rounded-md p-4 text-sm font-mono overflow-x-auto">
                      <code>{endpoint.example}</code>
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="response">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => copyToClipboard(endpoint.response, index)}
                      data-testid={`button-copy-response-${index}`}
                    >
                      {copiedIndex === index ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <pre className="bg-muted/50 rounded-md p-4 text-sm font-mono overflow-x-auto max-h-64">
                      <code>{endpoint.response}</code>
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="curl">
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-2 right-2 h-7 w-7"
                      onClick={() => copyToClipboard(`curl "${window.location.origin}${endpoint.example}"`, index + 100)}
                      data-testid={`button-copy-curl-${index}`}
                    >
                      {copiedIndex === index + 100 ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </Button>
                    <pre className="bg-muted/50 rounded-md p-4 text-sm font-mono overflow-x-auto">
                      <code>{`curl "${window.location.origin}${endpoint.example}"`}</code>
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6">
          <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
            <Terminal className="w-4 h-4" />
            AI Agent 调用示例
          </h3>
          <pre className="bg-muted/50 rounded-md p-4 text-sm font-mono overflow-x-auto">
            <code>{`// OpenAI Function Calling Style
{
  "name": "search_chinese_law",
  "description": "Search Chinese law articles by keyword or article number",
  "parameters": {
    "type": "object",
    "properties": {
      "query": {
        "type": "string",
        "description": "Search query, e.g. '民法典 第577条' or '个人信息保护'"
      },
      "lawName": {
        "type": "string",
        "description": "Optional: filter by law short name"
      }
    },
    "required": ["query"]
  }
}`}</code>
          </pre>
        </Card>
      </div>
    </div>
  );
}
