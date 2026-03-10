# JustLaws - 中国法律智能检索

## Overview
A Chinese law search infrastructure application that provides full-text law article search, precise article lookup, and structured citation output. Built as an AI-callable legal search service with both a web UI and RESTful API.

## Architecture
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Backend**: Express.js serving both API and static files
- **Data**: Pre-fetched Chinese law text from the just-laws open-source project, stored as JSON files
- **Storage**: In-memory search with JSON data files (no database needed - read-only data)

## Data Source
Law data is fetched from https://github.com/ImCa0/just-laws and parsed into structured JSON:
- `server/data/articles.json` - 4,129 law articles from 24 Chinese laws
- `server/data/laws.json` - Metadata for all 24 laws
- `server/data/fetch-laws.ts` - Script to re-fetch and parse law data from GitHub

## Key Files
- `shared/schema.ts` - TypeScript types and Zod schemas for law data
- `server/storage.ts` - LawStorage class with search, lookup, and citation generation
- `server/routes.ts` - RESTful API endpoints
- `client/src/pages/home.tsx` - Landing page with stats and quick search
- `client/src/pages/search.tsx` - Full search results page with filters
- `client/src/pages/law-detail.tsx` - Individual law browsing with article list
- `client/src/pages/api-docs.tsx` - API documentation page
- `client/src/components/article-card.tsx` - Reusable article display component with citations

## API Endpoints
- `GET /api/search?q=...` - Full-text search with optional lawName, category, page, pageSize filters
- `GET /api/article/:lawName/:articleNumber` - Precise article lookup with citation
- `GET /api/laws` - List all laws
- `GET /api/laws/:nameShort` - Get law metadata
- `GET /api/laws/:nameShort/articles` - Get all articles for a law
- `GET /api/stats` - Database statistics
- `GET /api/categories` - List categories
- `GET /api/citation/:lawName/:articleNumber` - Generate citation formats

## Law Categories
- 宪法 (Constitution)
- 民商法 (Civil & Commercial)
- 刑法 (Criminal)
- 经济法 (Economic)
- 诉讼法 (Procedural)
- 社会法 (Social)
- 行政法 (Administrative)
