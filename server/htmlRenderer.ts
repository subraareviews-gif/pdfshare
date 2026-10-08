import type { PublishedPdfPage, AppSettings } from './db.js';

export function extractGscToken(rawInput: string): string {
  if (!rawInput) return '';
  const trimmed = rawInput.trim();
  // Check if user pasted full <meta ...> tag
  const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) {
    return metaMatch[1].trim();
  }
  return trimmed;
}

export function renderPublishedPageHtml(
  page: PublishedPdfPage,
  settings: AppSettings,
  baseUrl: string
): string {
  const pageUrl = `${baseUrl}/p/${page.slug}`;
  const gscToken = extractGscToken(settings.googleSiteVerification);
  const formattedDate = new Date(page.updatedAt || page.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const schemaJsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        '@id': `${pageUrl}#article`,
        isPartOf: {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          name: settings.siteTitle || 'PDFtoWeb SEO',
          url: baseUrl,
        },
        headline: page.title,
        description: page.seoDescription,
        mainEntityOfPage: pageUrl,
        datePublished: page.createdAt,
        dateModified: page.updatedAt,
        wordCount: page.wordCount,
        inLanguage: 'en-US',
        author: {
          '@type': 'Organization',
          name: settings.siteTitle || 'PDFtoWeb Publisher',
          url: baseUrl,
        },
        publisher: {
          '@type': 'Organization',
          name: settings.siteTitle || 'PDFtoWeb Publisher',
          url: baseUrl,
        },
        keywords: page.keywords?.join(', ') || 'PDF, Document',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: baseUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Documents',
            item: `${baseUrl}/#documents`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: page.title,
            item: pageUrl,
          },
        ],
      },
    ],
  };

  const internalLinksCount = page.links.filter((l) => l.isInternal).length;
  const externalLinksCount = page.links.filter((l) => !l.isInternal).length;

  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(page.seoTitle || page.title)}</title>
  <meta name="description" content="${escapeHtml(page.seoDescription)}">
  <meta name="keywords" content="${escapeHtml(page.keywords?.join(', ') || '')}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${pageUrl}">

  ${gscToken ? `<!-- Google Search Console Verification Meta Tag -->\n  <meta name="google-site-verification" content="${escapeHtml(gscToken)}">` : ''}

  <!-- OpenGraph Metadata -->
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(page.title)}">
  <meta property="og:description" content="${escapeHtml(page.seoDescription)}">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:site_name" content="${escapeHtml(settings.siteTitle)}">
  <meta property="article:published_time" content="${page.createdAt}">
  <meta property="article:modified_time" content="${page.updatedAt}">

  <!-- Twitter Card Metadata -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(page.title)}">
  <meta name="twitter:description" content="${escapeHtml(page.seoDescription)}">

  <!-- Schema.org JSON-LD Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(schemaJsonLd, null, 2)}
  </script>

  <!-- Tailwind CSS CDN for pristine standalone rendering -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 50: '#eff6ff', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8' }
          }
        }
      }
    }
  </script>
  <style>
    /* Typography and anchor highlight enhancements */
    article a {
      transition: color 0.15s ease, text-decoration-color 0.15s ease;
    }
    article a:hover {
      text-decoration: underline;
    }
    article table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }
    article th, article td {
      border: 1px solid #e2e8f0;
      padding: 0.75rem 1rem;
    }
    .dark article th, .dark article td {
      border-color: #334155;
    }
    article blockquote {
      border-left: 4px solid #3b82f6;
      padding-left: 1rem;
      font-style: italic;
      margin: 1.5rem 0;
    }
    article code {
      background-color: #f1f5f9;
      padding: 0.2rem 0.4rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
    }
    .dark article code {
      background-color: #1e293b;
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-100 min-h-screen flex flex-col font-sans transition-colors duration-200">

  <!-- Top Sticky Navigation Bar -->
  <header class="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <a href="/" class="flex items-center gap-2 group">
          <div class="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
            P
          </div>
          <div class="leading-none">
            <span class="font-bold text-slate-900 dark:text-white text-sm block">${escapeHtml(settings.siteTitle)}</span>
            <span class="text-[10px] text-slate-400 font-mono">SEO Published Document</span>
          </div>
        </a>
      </div>

      <!-- Action Buttons -->
      <div class="flex items-center gap-2">
        <button id="themeToggle" class="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors" title="Toggle Theme">
          <span id="themeIcon">🌙</span>
        </button>

        <button id="copyBtn" onclick="navigator.clipboard.writeText(window.location.href); const s = this.querySelector('span'); if(s){ s.innerText='Copied!'; setTimeout(()=>s.innerText='Copy Link', 2000); }" class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
          <span>Copy Link</span>
        </button>

        <button onclick="window.print()" class="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          Print / PDF
        </button>

        <a href="/" class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all hover:shadow">
          ← Dashboard
        </a>
      </div>
    </div>
    <!-- Reading Progress Bar -->
    <div id="progressBar" class="h-0.5 bg-blue-600 w-0 transition-all duration-75"></div>
  </header>

  <!-- Main Container -->
  <main class="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 md:py-12">
    
    <!-- Breadcrumbs -->
    <nav class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6 font-medium">
      <a href="/" class="hover:text-blue-600 transition-colors">Home</a>
      <span>/</span>
      <a href="/#documents" class="hover:text-blue-600 transition-colors">Published PDFs</a>
      <span>/</span>
      <span class="text-slate-800 dark:text-slate-200 truncate max-w-[200px] sm:max-w-md">${escapeHtml(page.title)}</span>
    </nav>

    <!-- Header Card -->
    <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
      <div class="flex flex-wrap items-center gap-2 mb-3">
        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
          Semantic HTML Document
        </span>
        ${gscToken ? `
        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
          <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          Google Search Console Verified
        </span>` : `
        <span class="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
          Ready for GSC Verification
        </span>`}
        <span class="text-xs text-slate-400 font-mono ml-auto">
          Canonical: /p/${page.slug}
        </span>
      </div>

      <h1 class="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight mb-4">
        ${escapeHtml(page.title)}
      </h1>

      <p class="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed mb-6 font-normal">
        ${escapeHtml(page.seoDescription)}
      </p>

      <!-- Document Metadata Pills -->
      <div class="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
          Published: ${formattedDate}
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          ${page.readingTimeMinutes} min read (${page.wordCount.toLocaleString()} words)
        </span>
        <span class="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
          ${internalLinksCount} internal anchor links • ${externalLinksCount} outbound hyperlinks
        </span>
        <span class="flex items-center gap-1.5">
          <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
          Source: ${escapeHtml(page.originalPdfName)}
        </span>
      </div>
    </div>

    <!-- Content Layout Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <!-- Left Sidebar: Table of Contents -->
      ${page.tableOfContents && page.tableOfContents.length > 0 ? `
      <aside class="lg:col-span-4 lg:sticky lg:top-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
        <div class="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
          <h2 class="text-xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500">
            Table of Contents (Internal Links)
          </h2>
          <span class="text-[10px] font-mono bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
            ${page.tableOfContents.length} Sections
          </span>
        </div>
        <nav class="space-y-1 text-sm max-h-[70vh] overflow-y-auto pr-1">
          ${page.tableOfContents
            .map(
              (item) => `
            <a href="#${item.id}" class="group flex items-start gap-2 py-1.5 px-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${item.level === 3 ? 'pl-5 text-xs' : 'font-medium'}">
              <span class="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 font-mono text-xs">#</span>
              <span class="leading-snug">${escapeHtml(item.title)}</span>
            </a>`
            )
            .join('')}
        </nav>
      </aside>` : ''}

      <!-- Main Article Content Body -->
      <section class="${page.tableOfContents && page.tableOfContents.length > 0 ? 'lg:col-span-8' : 'lg:col-span-12'}">
        <article class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm text-slate-800 dark:text-slate-200 text-base leading-relaxed">
          ${page.htmlContent}
        </article>

        <!-- Extracted Links & References Directory -->
        <div class="mt-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-bold text-slate-900 dark:text-white">Extracted Links & References Directory</h3>
              <p class="text-xs text-slate-500 dark:text-slate-400">All internal jumps and external URLs parsed from this document</p>
            </div>
            <span class="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">
              ${page.links.length} Total Links
            </span>
          </div>

          <div class="divide-y divide-slate-100 dark:divide-slate-800 max-h-80 overflow-y-auto text-xs">
            ${page.links.map((link) => `
              <div class="py-2.5 flex items-center justify-between gap-4">
                <div class="flex items-center gap-2 min-w-0">
                  <span class="px-1.5 py-0.5 rounded font-mono text-[10px] uppercase font-semibold ${
                    link.isInternal
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                  }">
                    ${link.type === 'internal_anchor' ? 'Internal #' : link.type === 'email' ? 'Email' : 'External'}
                  </span>
                  <span class="truncate font-medium text-slate-700 dark:text-slate-200">${escapeHtml(link.text)}</span>
                </div>
                <a href="${link.url}" ${link.isInternal ? '' : 'target="_blank" rel="noopener noreferrer"'} class="text-blue-600 dark:text-blue-400 hover:underline font-mono truncate max-w-[220px] sm:max-w-xs shrink-0">
                  ${escapeHtml(link.url)} ↗
                </a>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Google Indexing Info Box -->
        <div class="mt-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-900/80 border border-blue-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>🔍</span> Google Indexing Status: <span class="capitalize text-blue-600 dark:text-blue-400 font-semibold">${page.indexingStatus}</span>
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 mt-1">
              This page is registered in <a href="/sitemap.xml" target="_blank" class="underline text-blue-600 dark:text-blue-400">/sitemap.xml</a> with canonical URL and JSON-LD schema.
            </p>
          </div>
          <a href="https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(baseUrl)}&id=${encodeURIComponent(pageUrl)}" target="_blank" rel="noopener noreferrer" class="px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-sm shrink-0 flex items-center gap-1">
            Inspect in Google Console ↗
          </a>
        </div>

      </section>
    </div>

  </main>

  <!-- Footer -->
  <footer class="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-8 text-xs text-slate-500 text-center transition-colors">
    <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        © ${new Date().getFullYear()} ${escapeHtml(settings.siteTitle)}. Rich HTML Document Publisher.
      </div>
      <div class="flex items-center gap-4">
        <a href="/sitemap.xml" target="_blank" class="hover:text-blue-600 transition-colors">Sitemap.xml</a>
        <a href="/robots.txt" target="_blank" class="hover:text-blue-600 transition-colors">Robots.txt</a>
        <a href="/" class="hover:text-blue-600 transition-colors">Admin Dashboard</a>
      </div>
    </div>
  </footer>

  <script>
    // Theme toggle
    const themeBtn = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');
    const isDark = localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      themeIcon.textContent = '☀️';
    } else {
      document.documentElement.classList.remove('dark');
      themeIcon.textContent = '🌙';
    }
    themeBtn?.addEventListener('click', () => {
      const isCurrentlyDark = document.documentElement.classList.toggle('dark');
      localStorage.setItem('theme', isCurrentlyDark ? 'dark' : 'light');
      themeIcon.textContent = isCurrentlyDark ? '☀️' : '🌙';
    });

    // Reading progress bar
    window.addEventListener('scroll', () => {
      const winScroll = document.documentElement.scrollTop || document.body.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = height > 0 ? (winScroll / height) * 100 : 0;
      const bar = document.getElementById('progressBar');
      if (bar) bar.style.width = scrolled + '%';
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
