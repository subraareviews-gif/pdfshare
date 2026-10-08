import fs from 'fs';
import path from 'path';

export interface ExtractedLink {
  id: string;
  text: string;
  url: string;
  isInternal: boolean;
  type: 'external_url' | 'internal_anchor' | 'email';
}

export interface TableOfContentsItem {
  id: string;
  title: string;
  level: number;
}

export interface PublishedPdfPage {
  id: string;
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  keywords: string[];
  htmlContent: string;
  tableOfContents: TableOfContentsItem[];
  links: ExtractedLink[];
  originalPdfName: string;
  originalPdfSize: number;
  rawPdfBase64?: string;
  pageCount: number;
  wordCount: number;
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
  isIndexed: boolean;
  indexingStatus: 'pending' | 'submitted' | 'indexed' | 'error';
  lastSubmittedAt?: string;
  gscInspectionUrl?: string;
}

export interface AppSettings {
  googleSiteVerification: string;
  googleHtmlFileName: string;
  siteTitle: string;
  siteDescription: string;
  customDomain: string;
  autoPingGoogle: boolean;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

const DEFAULT_SETTINGS: AppSettings = {
  googleSiteVerification: '',
  googleHtmlFileName: '',
  siteTitle: 'PDFtoWeb SEO & Google Indexer',
  siteDescription: 'Transform uploaded PDFs into rich semantic HTML web pages with intact internal and external links, Google Search Console meta tag verification, and fast Google search indexing.',
  customDomain: '',
  autoPingGoogle: true,
};

const SEED_PAGES: PublishedPdfPage[] = [
  {
    id: 'seed-guide-gsc-pdf-seo',
    slug: 'complete-guide-to-pdf-seo-and-google-indexing',
    title: 'Complete Guide to PDF SEO, Semantic HTML, & Google Search Console Indexing',
    seoTitle: 'Complete Guide to PDF SEO & Google Search Console Indexing',
    seoDescription: 'Learn how converting PDF documents into rich semantic HTML web pages with verified internal links and GSC meta tags boosts organic search engine ranking and indexation.',
    keywords: ['PDF SEO', 'Google Search Console', 'HTML Conversion', 'Google Indexing', 'Internal Links', 'Semantic Web'],
    pageCount: 6,
    wordCount: 1420,
    readingTimeMinutes: 6,
    originalPdfName: 'Google_Search_Console_PDF_SEO_Guide_2026.pdf',
    originalPdfSize: 420800,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    isIndexed: true,
    indexingStatus: 'submitted',
    lastSubmittedAt: new Date(Date.now() - 86400000).toISOString(),
    tableOfContents: [
      { id: 'why-convert-pdfs-to-html', title: '1. Why Convert PDFs into Rich Semantic HTML?', level: 2 },
      { id: 'internal-links-architecture', title: '2. Preserving Internal Anchors & Navigation', level: 2 },
      { id: 'external-hyperlinks-best-practices', title: '3. Activating Hyperlinks to Target URLs', level: 2 },
      { id: 'google-search-console-verification', title: '4. Google Search Console Verification Meta Tag', level: 2 },
      { id: 'sitemap-and-indexing-api', title: '5. Sitemaps & Triggering Googlebot Indexing', level: 2 },
      { id: 'checklist-for-maximum-visibility', title: '6. Publishing & SEO Checklist', level: 2 },
    ],
    links: [
      {
        id: 'link-1',
        text: '1. Why Convert PDFs into Rich Semantic HTML?',
        url: '#why-convert-pdfs-to-html',
        isInternal: true,
        type: 'internal_anchor',
      },
      {
        id: 'link-2',
        text: '2. Preserving Internal Anchors & Navigation',
        url: '#internal-links-architecture',
        isInternal: true,
        type: 'internal_anchor',
      },
      {
        id: 'link-3',
        text: '3. Activating Hyperlinks to Target URLs',
        url: '#external-hyperlinks-best-practices',
        isInternal: true,
        type: 'internal_anchor',
      },
      {
        id: 'link-4',
        text: '4. Google Search Console Verification Meta Tag',
        url: '#google-search-console-verification',
        isInternal: true,
        type: 'internal_anchor',
      },
      {
        id: 'link-5',
        text: '5. Sitemaps & Triggering Googlebot Indexing',
        url: '#sitemap-and-indexing-api',
        isInternal: true,
        type: 'internal_anchor',
      },
      {
        id: 'link-6',
        text: 'Google Search Console Official Portal',
        url: 'https://search.google.com/search-console',
        isInternal: false,
        type: 'external_url',
      },
      {
        id: 'link-7',
        text: 'Google Search Essentials Guidelines',
        url: 'https://developers.google.com/search/docs/essentials',
        isInternal: false,
        type: 'external_url',
      },
      {
        id: 'link-8',
        text: 'Schema.org Article Documentation',
        url: 'https://schema.org/Article',
        isInternal: false,
        type: 'external_url',
      },
      {
        id: 'link-9',
        text: 'Contact Support: seo@esourceit.in',
        url: 'mailto:seo@esourceit.in',
        isInternal: false,
        type: 'email',
      },
    ],
    htmlContent: `
      <section class="document-intro mb-8 p-6 bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 rounded-xl">
        <p class="text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-medium">
          PDF documents contain valuable whitepapers, product specs, annual reports, and research papers. However, search engines struggle to index raw binary PDFs effectively, and mobile users face poor viewport scaling. Converting your PDFs into <strong>rich semantic HTML web pages</strong> with intact <em>internal cross-links</em> and <em>external URL hyperlinks</em> unlocks instant crawlability, faster indexing, and rich search snippets.
        </p>
      </section>

      <nav class="toc-box mb-10 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
        <h3 class="text-sm uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400 mb-3">Document Table of Contents (Internal Links)</h3>
        <ul class="space-y-2">
          <li><a href="#why-convert-pdfs-to-html" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><span class="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded font-mono">#01</span> 1. Why Convert PDFs into Rich Semantic HTML?</a></li>
          <li><a href="#internal-links-architecture" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><span class="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded font-mono">#02</span> 2. Preserving Internal Anchors & Navigation</a></li>
          <li><a href="#external-hyperlinks-best-practices" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><span class="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded font-mono">#03</span> 3. Activating Hyperlinks to Target URLs</a></li>
          <li><a href="#google-search-console-verification" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><span class="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded font-mono">#04</span> 4. Google Search Console Verification Meta Tag</a></li>
          <li><a href="#sitemap-and-indexing-api" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><span class="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded font-mono">#05</span> 5. Sitemaps & Triggering Googlebot Indexing</a></li>
          <li><a href="#checklist-for-maximum-visibility" class="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5"><span class="text-xs bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded font-mono">#06</span> 6. Publishing & SEO Checklist</a></li>
        </ul>
      </nav>

      <h2 id="why-convert-pdfs-to-html" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-4 scroll-mt-24 pb-2 border-b border-slate-200 dark:border-slate-800">
        1. Why Convert PDFs into Rich Semantic HTML?
      </h2>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        Raw PDF files present multiple challenges for both human visitors and search engine bots:
      </p>
      <ul class="list-disc pl-6 space-y-2 mb-6 text-slate-700 dark:text-slate-300">
        <li><strong>No responsive layout:</strong> Desktop PDFs require pinch-to-zoom on smartphones, causing severe bounce rates.</li>
        <li><strong>Suboptimal search indexing:</strong> Search engine crawlers can extract text from basic PDFs, but cannot parse headings (h1, h2, h3), breadcrumbs, or structured schema data effectively.</li>
        <li><strong>Tracking and Analytics Blind Spots:</strong> You cannot track scroll depth, anchor navigation, or user interactions inside a downloaded PDF viewer.</li>
      </ul>
      <p class="leading-relaxed mb-6 text-slate-700 dark:text-slate-300">
        By generating a dedicated HTML page for every uploaded PDF, each document receives its own canonical URL, customized meta tags, schema markup, and responsive typography. Learn more in the official <a href="https://developers.google.com/search/docs/essentials" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-medium">Google Search Essentials Guidelines</a>.
      </p>

      <h2 id="internal-links-architecture" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-4 scroll-mt-24 pb-2 border-b border-slate-200 dark:border-slate-800">
        2. Preserving Internal Anchors & Navigation
      </h2>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        When an author writes a PDF with a table of contents or cross-references ("see Section 3 on page 4"), those link annotations often break when plain text is extracted.
      </p>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        Our PDF-to-HTML parser preserves every internal link by converting them into standard HTML hash anchors (e.g. <code>&lt;a href="#internal-links-architecture"&gt;</code>) and assigning corresponding unique IDs to every target section heading. This enables smooth scrolling jumps and provides search engines with clear internal linking signals.
      </p>
      <blockquote class="p-4 my-6 border-l-4 border-blue-500 bg-slate-50 dark:bg-slate-900/60 rounded-r-lg italic text-slate-600 dark:text-slate-400">
        "Internal links allow Googlebot to understand page context and hierarchy, leading to sitelinks in search results."
      </blockquote>

      <h2 id="external-hyperlinks-best-practices" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-4 scroll-mt-24 pb-2 border-b border-slate-200 dark:border-slate-800">
        3. Activating Hyperlinks to Target URLs
      </h2>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        All web URLs present in the PDF (both underlying URI action annotations and visible plain URLs like <code>https://example.com</code>) are parsed and rendered as rich anchor elements:
      </p>
      <div class="overflow-x-auto my-6">
        <table class="w-full text-left border-collapse border border-slate-200 dark:border-slate-800 rounded-lg text-sm">
          <thead>
            <tr class="bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200">
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">PDF Element</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">Rendered Semantic HTML</th>
              <th class="p-3 border-b border-slate-200 dark:border-slate-700 font-semibold">SEO & User Benefit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800 text-slate-600 dark:text-slate-300">
            <tr>
              <td class="p-3 font-mono text-xs">PDF URI Annotation</td>
              <td class="p-3 font-mono text-xs text-blue-600 dark:text-blue-400">&lt;a href="https://..." target="_blank" rel="noopener"&gt;Anchor Text&lt;/a&gt;</td>
              <td class="p-3">Clickable outbound links with proper security attributes</td>
            </tr>
            <tr>
              <td class="p-3 font-mono text-xs">Internal Bookmark / GoTo</td>
              <td class="p-3 font-mono text-xs text-emerald-600 dark:text-emerald-400">&lt;a href="#heading-slug"&gt;Jump to Section&lt;/a&gt;</td>
              <td class="p-3">Smooth page navigation, anchor tags for Google snippet jumps</td>
            </tr>
            <tr>
              <td class="p-3 font-mono text-xs">Email / Contact Text</td>
              <td class="p-3 font-mono text-xs text-purple-600 dark:text-purple-400">&lt;a href="mailto:..."&gt;Send Mail&lt;/a&gt;</td>
              <td class="p-3">One-tap interaction on mobile devices</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="google-search-console-verification" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-4 scroll-mt-24 pb-2 border-b border-slate-200 dark:border-slate-800">
        4. Google Search Console Verification Meta Tag
      </h2>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        To prove ownership of your site to Google, navigate to the <a href="https://search.google.com/search-console" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-medium">Google Search Console Official Portal</a> and add a URL Prefix property. Select the <strong>HTML tag</strong> verification method.
      </p>
      <div class="p-4 bg-slate-900 text-slate-100 rounded-xl font-mono text-xs my-4 overflow-x-auto shadow-inner">
        &lt;meta name="google-site-verification" content="YOUR_GSC_VERIFICATION_STRING_HERE" /&gt;
      </div>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        Paste either the full <code>&lt;meta&gt;</code> tag or just the verification string into the GSC Settings tab in this app. Our server automatically injects this tag into the <code>&lt;head&gt;</code> of the homepage and every single published PDF page, allowing instantaneous verification!
      </p>

      <h2 id="sitemap-and-indexing-api" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-4 scroll-mt-24 pb-2 border-b border-slate-200 dark:border-slate-800">
        5. Sitemaps & Triggering Googlebot Indexing
      </h2>
      <p class="leading-relaxed mb-4 text-slate-700 dark:text-slate-300">
        Once your Google Search Console property is verified, you can index every published PDF page using two automated pathways:
      </p>
      <ol class="list-decimal pl-6 space-y-3 mb-6 text-slate-700 dark:text-slate-300">
        <li>
          <strong>Submit the dynamic XML Sitemap:</strong> Your site automatically serves an updated XML sitemap at <code>/sitemap.xml</code> with canonical URLs, last modified timestamps, and priorities. Submit <code>sitemap.xml</code> directly in the GSC Sitemaps panel.
        </li>
        <li>
          <strong>Live URL Inspection & Request Indexing:</strong> Use the one-click "Inspect in Google" tool to open Google Search Console's URL Inspection tool for individual pages and click <em>"Request Indexing"</em> for priority crawl queues.
        </li>
      </ol>

      <h2 id="checklist-for-maximum-visibility" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-12 mb-4 scroll-mt-24 pb-2 border-b border-slate-200 dark:border-slate-800">
        6. Publishing & SEO Checklist
      </h2>
      <ul class="space-y-2 mb-6 text-slate-700 dark:text-slate-300">
        <li class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✓</span>
          <span><strong>Rich Schema.org Structured Data:</strong> Embedded <code>Article</code> and <code>BreadcrumbList</code> schema metadata. Read more at <a href="https://schema.org/Article" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-medium">Schema.org Article Documentation</a>.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✓</span>
          <span><strong>OpenGraph & Twitter Card Tags:</strong> Beautiful previews when shared on LinkedIn, X, Facebook, and Slack.</span>
        </li>
        <li class="flex items-start gap-2">
          <span class="text-emerald-500 font-bold">✓</span>
          <span><strong>Fast Mobile Viewport:</strong> 100% responsive, dark-mode ready, reader-friendly typography.</span>
        </li>
      </ul>

      <div class="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-sm text-slate-500 flex flex-wrap justify-between items-center gap-4">
        <span>Need custom indexing assistance? Reach out: <a href="mailto:seo@esourceit.in" class="text-blue-600 dark:text-blue-400 underline">seo@esourceit.in</a></span>
        <a href="#why-convert-pdfs-to-html" class="text-slate-600 dark:text-slate-400 hover:text-blue-600 text-xs font-medium">↑ Back to top</a>
      </div>
    `,
  },
];

export function getSettings(): AppSettings {
  ensureDataDir();
  if (fs.existsSync(SETTINGS_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
      return { ...DEFAULT_SETTINGS, ...data };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_SETTINGS, null, 2), 'utf-8');
  return DEFAULT_SETTINGS;
}

export function saveSettings(settings: Partial<AppSettings>): AppSettings {
  ensureDataDir();
  const current = getSettings();
  const updated: AppSettings = { ...current, ...settings };
  fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updated, null, 2), 'utf-8');
  return updated;
}

export function getPages(): PublishedPdfPage[] {
  ensureDataDir();
  if (fs.existsSync(PAGES_FILE)) {
    try {
      const data = JSON.parse(fs.readFileSync(PAGES_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    } catch {
      // fallback
    }
  }
  // Initialize with seed data
  fs.writeFileSync(PAGES_FILE, JSON.stringify(SEED_PAGES, null, 2), 'utf-8');
  return SEED_PAGES;
}

export function getPageById(id: string): PublishedPdfPage | undefined {
  const pages = getPages();
  return pages.find((p) => p.id === id);
}

export function getPageBySlug(slug: string): PublishedPdfPage | undefined {
  const pages = getPages();
  return pages.find((p) => p.slug.toLowerCase() === slug.toLowerCase());
}

export function savePage(page: PublishedPdfPage): PublishedPdfPage {
  ensureDataDir();
  const pages = getPages();
  const index = pages.findIndex((p) => p.id === page.id || p.slug === page.slug);
  if (index >= 0) {
    pages[index] = { ...pages[index], ...page, updatedAt: new Date().toISOString() };
  } else {
    pages.unshift({ ...page, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  }
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf-8');
  return page;
}

export function deletePage(id: string): boolean {
  ensureDataDir();
  const pages = getPages();
  const filtered = pages.filter((p) => p.id !== id);
  if (filtered.length !== pages.length) {
    fs.writeFileSync(PAGES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
    return true;
  }
  return false;
}

export function savePagesBatch(newPages: PublishedPdfPage[]): PublishedPdfPage[] {
  ensureDataDir();
  const pages = getPages();
  const savedPages: PublishedPdfPage[] = [];

  for (const page of newPages) {
    const index = pages.findIndex((p) => p.id === page.id || p.slug === page.slug);
    if (index >= 0) {
      pages[index] = { ...pages[index], ...page, updatedAt: new Date().toISOString() };
      savedPages.push(pages[index]);
    } else {
      const created = {
        ...page,
        createdAt: page.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      pages.unshift(created);
      savedPages.push(created);
    }
  }

  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf-8');
  return savedPages;
}

export function deletePagesBatch(ids: string[]): number {
  ensureDataDir();
  const pages = getPages();
  const idSet = new Set(ids);
  const filtered = pages.filter((p) => !idSet.has(p.id));
  const count = pages.length - filtered.length;
  if (count > 0) {
    fs.writeFileSync(PAGES_FILE, JSON.stringify(filtered, null, 2), 'utf-8');
  }
  return count;
}
