import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

interface LawArticle {
  id: string;
  lawName: string;
  lawNameShort: string;
  category: string;
  categoryId: string;
  chapter: string;
  section: string;
  articleNumber: string;
  articleNumberInt: number;
  content: string;
}

interface LawMeta {
  id: string;
  name: string;
  nameShort: string;
  category: string;
  categoryId: string;
  totalArticles: number;
  effectiveDate: string;
  source: string;
}

const REPO_BASE = 'https://raw.githubusercontent.com/ImCa0/just-laws/refs/heads/master/docs';

const LAW_SOURCES: Array<{
  category: string;
  categoryId: string;
  laws: Array<{
    name: string;
    nameShort: string;
    path: string;
    files: string[];
    effectiveDate: string;
  }>;
}> = [
  {
    category: '宪法',
    categoryId: 'constitution',
    laws: [
      {
        name: '中华人民共和国宪法',
        nameShort: '宪法',
        path: 'constitution',
        files: ['preamble.md', '01-general-principles.md', '02-civil-rights-and-duties.md', '03-state-institutions.md', '04-flag-anthem-emblem-capital.md'],
        effectiveDate: '2018-03-11',
      },
    ],
  },
  {
    category: '民商法',
    categoryId: 'civil-and-commercial',
    laws: [
      {
        name: '中华人民共和国民法典',
        nameShort: '民法典',
        path: 'civil-and-commercial/civil-code',
        files: ['01-general-principles.md', '02-property-rights.md', '03-contracts.md', '04-personality-rights.md', '05-marriage-and-family.md', '06-inheritance.md', '07-tort-liability.md'],
        effectiveDate: '2021-01-01',
      },
      {
        name: '中华人民共和国公司法',
        nameShort: '公司法',
        path: 'civil-and-commercial/company-law',
        files: ['README.md'],
        effectiveDate: '2024-07-01',
      },
      {
        name: '中华人民共和国著作权法',
        nameShort: '著作权法',
        path: 'civil-and-commercial/copyright-law',
        files: ['README.md'],
        effectiveDate: '2021-06-01',
      },
      {
        name: '中华人民共和国专利法',
        nameShort: '专利法',
        path: 'civil-and-commercial/patent-law',
        files: ['README.md'],
        effectiveDate: '2021-06-01',
      },
      {
        name: '中华人民共和国消费者权益保护法',
        nameShort: '消费者权益保护法',
        path: 'civil-and-commercial/protection-of-the-rights-and-interests-of-consumers',
        files: ['README.md'],
        effectiveDate: '2014-03-15',
      },
    ],
  },
  {
    category: '刑法',
    categoryId: 'criminal-law',
    laws: [
      {
        name: '中华人民共和国刑法',
        nameShort: '刑法',
        path: 'criminal-law/criminal-law',
        files: ['01-general-provisions.md', '02-specific-provisions.md'],
        effectiveDate: '2021-03-01',
      },
      {
        name: '中华人民共和国反有组织犯罪法',
        nameShort: '反有组织犯罪法',
        path: 'criminal-law/anti-organized-crime-law',
        files: ['README.md'],
        effectiveDate: '2022-05-01',
      },
    ],
  },
  {
    category: '经济法',
    categoryId: 'economic',
    laws: [
      {
        name: '中华人民共和国个人所得税法',
        nameShort: '个人所得税法',
        path: 'economic/individual-income-tax-law',
        files: ['README.md'],
        effectiveDate: '2019-01-01',
      },
      {
        name: '中华人民共和国反垄断法',
        nameShort: '反垄断法',
        path: 'economic/anti-monopoly-law',
        files: ['README.md'],
        effectiveDate: '2022-08-01',
      },
      {
        name: '中华人民共和国网络安全法',
        nameShort: '网络安全法',
        path: 'economic/cybersecurity-law',
        files: ['README.md'],
        effectiveDate: '2017-06-01',
      },
      {
        name: '中华人民共和国数据安全法',
        nameShort: '数据安全法',
        path: 'economic/data-security-law',
        files: ['README.md'],
        effectiveDate: '2021-09-01',
      },
      {
        name: '中华人民共和国个人信息保护法',
        nameShort: '个人信息保护法',
        path: 'economic/personal-information-protection-law',
        files: ['README.md'],
        effectiveDate: '2021-11-01',
      },
      {
        name: '中华人民共和国企业所得税法',
        nameShort: '企业所得税法',
        path: 'economic/enterprise-income-tax-law',
        files: ['README.md'],
        effectiveDate: '2019-04-23',
      },
      {
        name: '中华人民共和国产品质量法',
        nameShort: '产品质量法',
        path: 'economic/product-quality-law',
        files: ['README.md'],
        effectiveDate: '2018-12-29',
      },
    ],
  },
  {
    category: '诉讼法',
    categoryId: 'procedural',
    laws: [
      {
        name: '中华人民共和国民事诉讼法',
        nameShort: '民事诉讼法',
        path: 'procedural/civil-procedure',
        files: ['01-general-provisions.md', '02-trial-procedure.md', '03-execution-procedure.md', '04-special-provisions-for-foreign-related-civil-procedure.md'],
        effectiveDate: '2022-01-01',
      },
      {
        name: '中华人民共和国刑事诉讼法',
        nameShort: '刑事诉讼法',
        path: 'procedural/criminal-procedure',
        files: ['01-general-provisions.md', '02-filing-investigation-prosecution.md', '03-trial.md', '04-enforcement.md', '05-special-procedures.md'],
        effectiveDate: '2018-10-26',
      },
      {
        name: '中华人民共和国行政诉讼法',
        nameShort: '行政诉讼法',
        path: 'procedural/administrative-procedure',
        files: ['README.md'],
        effectiveDate: '2017-06-27',
      },
    ],
  },
  {
    category: '社会法',
    categoryId: 'social',
    laws: [
      {
        name: '中华人民共和国劳动法',
        nameShort: '劳动法',
        path: 'social/labor-law',
        files: ['README.md'],
        effectiveDate: '2018-12-29',
      },
      {
        name: '中华人民共和国未成年人保护法',
        nameShort: '未成年人保护法',
        path: 'social/protection-of-minors',
        files: ['README.md'],
        effectiveDate: '2021-06-01',
      },
      {
        name: '中华人民共和国安全生产法',
        nameShort: '安全生产法',
        path: 'social/work-safety-law',
        files: ['README.md'],
        effectiveDate: '2021-09-01',
      },
    ],
  },
  {
    category: '行政法',
    categoryId: 'administrative',
    laws: [
      {
        name: '中华人民共和国行政处罚法',
        nameShort: '行政处罚法',
        path: 'administrative/administrative-penalty',
        files: ['README.md'],
        effectiveDate: '2021-07-15',
      },
      {
        name: '中华人民共和国环境保护法',
        nameShort: '环境保护法',
        path: 'administrative/environment-protection',
        files: ['README.md'],
        effectiveDate: '2015-01-01',
      },
      {
        name: '中华人民共和国治安管理处罚法',
        nameShort: '治安管理处罚法',
        path: 'administrative/penalties-for-administration-of-public-security',
        files: ['README.md'],
        effectiveDate: '2013-01-01',
      },
    ],
  },
];

function chineseToNum(str: string): number {
  const map: Record<string, number> = {
    '零': 0, '〇': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '百': 100, '千': 1000,
  };
  let result = 0;
  let current = 0;
  for (const ch of str) {
    const val = map[ch];
    if (val === undefined) continue;
    if (val >= 10) {
      if (current === 0) current = 1;
      result += current * val;
      current = 0;
    } else {
      current = val;
    }
  }
  return result + current;
}

function parseArticles(markdown: string, lawName: string, lawNameShort: string, category: string, categoryId: string): LawArticle[] {
  const articles: LawArticle[] = [];
  const lines = markdown.split('\n');
  let currentChapter = '';
  let currentSection = '';

  const articleRegex = /^\*\*第([一二三四五六七八九十百千零〇]+)条(之[一二三四五六七八九十]+)?\*\*[　\s]*(.*)/;
  const chapterRegex = /^#{1,3}\s+(第[一二三四五六七八九十百千零〇]+编[　\s]*.*|第[一二三四五六七八九十百千零〇]+章[　\s]*.*|第[一二三四五六七八九十百千零〇]+分编[　\s]*.*)/;
  const sectionRegex = /^#{1,4}\s+(第[一二三四五六七八九十百千零〇]+节[　\s]*.*)/;

  let currentArticleContent = '';
  let currentArticleNum = '';
  let currentArticleNumInt = 0;

  const flushArticle = () => {
    if (currentArticleNum && currentArticleContent.trim()) {
      articles.push({
        id: `${categoryId}/${lawNameShort}/art-${currentArticleNumInt}`,
        lawName,
        lawNameShort,
        category,
        categoryId,
        chapter: currentChapter,
        section: currentSection,
        articleNumber: `第${currentArticleNum}条`,
        articleNumberInt: currentArticleNumInt,
        content: currentArticleContent.trim(),
      });
    }
  };

  for (const line of lines) {
    const chapterMatch = line.match(chapterRegex);
    if (chapterMatch) {
      currentChapter = chapterMatch[1].trim();
      currentSection = '';
      continue;
    }

    const sectionMatch = line.match(sectionRegex);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const articleMatch = line.match(articleRegex);
    if (articleMatch) {
      flushArticle();
      const numStr = articleMatch[1];
      const suffix = articleMatch[2] || '';
      currentArticleNum = numStr + suffix;
      currentArticleNumInt = chineseToNum(numStr);
      currentArticleContent = articleMatch[3] || '';
    } else if (currentArticleNum) {
      if (line.trim()) {
        currentArticleContent += '\n' + line.trim();
      }
    }
  }
  flushArticle();

  return articles;
}

async function fetchContent(lawPath: string, files: string[]): Promise<string> {
  let content = '';
  for (const file of files) {
    const url = `${REPO_BASE}/${lawPath}/${file}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        content += '\n' + await response.text();
      } else {
        console.warn(`  Warning: Could not fetch ${url} (${response.status})`);
      }
    } catch (e) {
      console.error(`  Error fetching ${url}:`, e);
    }
  }
  return content;
}

async function main() {
  const allArticles: LawArticle[] = [];
  const allLaws: LawMeta[] = [];

  for (const cat of LAW_SOURCES) {
    for (const law of cat.laws) {
      console.log(`Fetching: ${law.name}...`);
      const content = await fetchContent(law.path, law.files);
      const articles = parseArticles(content, law.name, law.nameShort, cat.category, cat.categoryId);
      console.log(`  -> Found ${articles.length} articles`);
      allArticles.push(...articles);
      allLaws.push({
        id: `${cat.categoryId}/${law.nameShort}`,
        name: law.name,
        nameShort: law.nameShort,
        category: cat.category,
        categoryId: cat.categoryId,
        totalArticles: articles.length,
        effectiveDate: law.effectiveDate,
        source: 'https://github.com/ImCa0/just-laws',
      });
    }
  }

  const outputDir = path.dirname(fileURLToPath(import.meta.url));
  fs.writeFileSync(path.join(outputDir, 'articles.json'), JSON.stringify(allArticles, null, 2), 'utf8');
  fs.writeFileSync(path.join(outputDir, 'laws.json'), JSON.stringify(allLaws, null, 2), 'utf8');

  console.log(`\nTotal: ${allLaws.length} laws, ${allArticles.length} articles`);
}

main().catch(console.error);
