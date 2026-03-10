import type { LawArticle, LawMeta, SearchResult, LawStats, CitationFormat } from "@shared/schema";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

export interface IStorage {
  searchArticles(query: string, lawName?: string, category?: string, page?: number, pageSize?: number): SearchResult;
  getArticle(lawNameShort: string, articleNumber: number): LawArticle | undefined;
  getLaws(): LawMeta[];
  getLaw(nameShort: string): LawMeta | undefined;
  getLawArticles(nameShort: string): LawArticle[];
  getStats(): LawStats;
  getCategories(): Array<{ name: string; id: string; lawCount: number; articleCount: number }>;
  generateCitation(article: LawArticle): CitationFormat;
}

export class LawStorage implements IStorage {
  private articles: LawArticle[] = [];
  private laws: LawMeta[] = [];
  private articleIndex: Map<string, LawArticle[]> = new Map();
  private lawByShortName: Map<string, LawMeta> = new Map();

  constructor() {
    this.loadData();
  }

  private loadData() {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const articlesPath = path.join(dir, "data", "articles.json");
    const lawsPath = path.join(dir, "data", "laws.json");

    if (fs.existsSync(articlesPath)) {
      this.articles = JSON.parse(fs.readFileSync(articlesPath, "utf8"));
    }
    if (fs.existsSync(lawsPath)) {
      this.laws = JSON.parse(fs.readFileSync(lawsPath, "utf8"));
    }

    for (const article of this.articles) {
      const key = article.lawNameShort;
      if (!this.articleIndex.has(key)) {
        this.articleIndex.set(key, []);
      }
      this.articleIndex.get(key)!.push(article);
    }

    for (const law of this.laws) {
      this.lawByShortName.set(law.nameShort, law);
    }

    console.log(`Loaded ${this.articles.length} articles from ${this.laws.length} laws`);
  }

  searchArticles(query: string, lawName?: string, category?: string, page = 1, pageSize = 20): SearchResult {
    const normalizedQuery = query.trim().toLowerCase();
    const terms = normalizedQuery.split(/\s+/).filter(t => t.length > 0);

    const articleNumMatch = normalizedQuery.match(/第?(\d+)条/);
    const chineseNumMatch = normalizedQuery.match(/第([一二三四五六七八九十百千零〇]+)条/);

    let candidates = this.articles;

    if (lawName) {
      candidates = candidates.filter(a =>
        a.lawNameShort === lawName || a.lawName === lawName || a.lawName.includes(lawName) || a.lawNameShort.includes(lawName)
      );
    }

    if (category) {
      candidates = candidates.filter(a => a.categoryId === category || a.category === category);
    }

    const scored: Array<{ article: LawArticle; score: number }> = [];

    for (const article of candidates) {
      let score = 0;
      const searchText = `${article.lawName} ${article.lawNameShort} ${article.articleNumber} ${article.content} ${article.chapter} ${article.section}`.toLowerCase();

      if (articleNumMatch) {
        const num = parseInt(articleNumMatch[1]);
        if (article.articleNumberInt === num) {
          score += 100;
        }
      }

      if (chineseNumMatch) {
        if (article.articleNumber.includes(chineseNumMatch[0])) {
          score += 100;
        }
      }

      for (const term of terms) {
        if (term.match(/第?\d+条/) || term.match(/第[一二三四五六七八九十百千零〇]+条/)) continue;

        if (article.lawNameShort.includes(term) || article.lawName.includes(term)) {
          score += 50;
        }
        if (article.content.toLowerCase().includes(term)) {
          score += 10;
          const count = (article.content.toLowerCase().match(new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
          score += Math.min(count * 2, 20);
        }
        if (article.chapter.includes(term)) score += 5;
        if (article.section.includes(term)) score += 5;
      }

      if (score > 0) {
        scored.push({ article, score });
      }
    }

    scored.sort((a, b) => b.score - a.score);

    const total = scored.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      articles: scored.slice(start, end).map(s => s.article),
      total,
      page,
      pageSize,
      totalPages,
      query,
    };
  }

  getArticle(lawNameShort: string, articleNumber: number): LawArticle | undefined {
    const articles = this.articleIndex.get(lawNameShort);
    if (!articles) return undefined;
    return articles.find(a => a.articleNumberInt === articleNumber);
  }

  getLaws(): LawMeta[] {
    return this.laws;
  }

  getLaw(nameShort: string): LawMeta | undefined {
    return this.lawByShortName.get(nameShort);
  }

  getLawArticles(nameShort: string): LawArticle[] {
    return this.articleIndex.get(nameShort) || [];
  }

  getStats(): LawStats {
    const categories = this.getCategories();
    return {
      totalLaws: this.laws.length,
      totalArticles: this.articles.length,
      categories,
    };
  }

  getCategories(): Array<{ name: string; id: string; lawCount: number; articleCount: number }> {
    const catMap = new Map<string, { name: string; id: string; lawCount: number; articleCount: number }>();
    for (const law of this.laws) {
      if (!catMap.has(law.categoryId)) {
        catMap.set(law.categoryId, { name: law.category, id: law.categoryId, lawCount: 0, articleCount: 0 });
      }
      const cat = catMap.get(law.categoryId)!;
      cat.lawCount++;
      cat.articleCount += law.totalArticles;
    }
    return Array.from(catMap.values());
  }

  generateCitation(article: LawArticle): CitationFormat {
    return {
      formal: `《${article.lawName}》${article.articleNumber}`,
      academic: `${article.lawName}，${article.articleNumber}。`,
      brief: `${article.lawNameShort} ${article.articleNumber}`,
    };
  }
}

export const storage = new LawStorage();
