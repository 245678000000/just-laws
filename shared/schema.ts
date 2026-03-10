import { z } from "zod";

export const lawArticleSchema = z.object({
  id: z.string(),
  lawName: z.string(),
  lawNameShort: z.string(),
  category: z.string(),
  categoryId: z.string(),
  chapter: z.string(),
  section: z.string(),
  articleNumber: z.string(),
  articleNumberInt: z.number(),
  content: z.string(),
});

export const lawMetaSchema = z.object({
  id: z.string(),
  name: z.string(),
  nameShort: z.string(),
  category: z.string(),
  categoryId: z.string(),
  totalArticles: z.number(),
  effectiveDate: z.string(),
  source: z.string(),
});

export type LawArticle = z.infer<typeof lawArticleSchema>;
export type LawMeta = z.infer<typeof lawMetaSchema>;

export const searchQuerySchema = z.object({
  q: z.string().min(1),
  lawName: z.string().optional(),
  category: z.string().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;

export const articleLookupSchema = z.object({
  lawName: z.string(),
  articleNumber: z.number(),
});

export type ArticleLookup = z.infer<typeof articleLookupSchema>;

export interface SearchResult {
  articles: LawArticle[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
}

export interface LawStats {
  totalLaws: number;
  totalArticles: number;
  categories: Array<{ name: string; id: string; lawCount: number; articleCount: number }>;
}

export interface CitationFormat {
  formal: string;
  academic: string;
  brief: string;
}
