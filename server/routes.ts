import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/search", (req, res) => {
    try {
      const q = (req.query.q as string) || "";
      const lawName = req.query.lawName as string | undefined;
      const category = req.query.category as string | undefined;
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.pageSize as string) || 20;

      if (!q.trim()) {
        return res.status(400).json({ error: "Search query is required" });
      }

      const result = storage.searchArticles(q, lawName, category, page, pageSize);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  app.get("/api/article/:lawName/:articleNumber", (req, res) => {
    try {
      const { lawName, articleNumber } = req.params;
      const num = parseInt(articleNumber);
      if (isNaN(num)) {
        return res.status(400).json({ error: "Invalid article number" });
      }

      const article = storage.getArticle(lawName, num);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const citation = storage.generateCitation(article);
      res.json({ article, citation });
    } catch (error) {
      res.status(500).json({ error: "Failed to get article" });
    }
  });

  app.get("/api/laws", (_req, res) => {
    try {
      const laws = storage.getLaws();
      res.json(laws);
    } catch (error) {
      res.status(500).json({ error: "Failed to get laws" });
    }
  });

  app.get("/api/laws/:nameShort", (req, res) => {
    try {
      const law = storage.getLaw(req.params.nameShort);
      if (!law) {
        return res.status(404).json({ error: "Law not found" });
      }
      res.json(law);
    } catch (error) {
      res.status(500).json({ error: "Failed to get law" });
    }
  });

  app.get("/api/laws/:nameShort/articles", (req, res) => {
    try {
      const law = storage.getLaw(req.params.nameShort);
      if (!law) {
        return res.status(404).json({ error: "Law not found" });
      }
      const articles = storage.getLawArticles(req.params.nameShort);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to get articles" });
    }
  });

  app.get("/api/stats", (_req, res) => {
    try {
      const stats = storage.getStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get stats" });
    }
  });

  app.get("/api/categories", (_req, res) => {
    try {
      const categories = storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ error: "Failed to get categories" });
    }
  });

  app.get("/api/citation/:lawName/:articleNumber", (req, res) => {
    try {
      const { lawName, articleNumber } = req.params;
      const num = parseInt(articleNumber);
      if (isNaN(num)) {
        return res.status(400).json({ error: "Invalid article number" });
      }

      const article = storage.getArticle(lawName, num);
      if (!article) {
        return res.status(404).json({ error: "Article not found" });
      }

      const citation = storage.generateCitation(article);
      res.json(citation);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate citation" });
    }
  });

  return httpServer;
}
