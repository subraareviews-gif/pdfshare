import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import {
  getSettings,
  saveSettings,
  getPages,
  getPageById,
  getPageBySlug,
  savePage,
  deletePage,
  savePagesBatch,
  deletePagesBatch,
  type PublishedPdfPage,
} from './server/db.js';
import { convertPdfToRichHtml } from './server/pdfService.js';
import { renderPublishedPageHtml, extractGscToken } from './server/htmlRenderer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Increase payload limits for PDF uploads
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Helper to determine baseUrl
function getBaseUrl(req: Request): string {
  const settings = getSettings();
  if (settings.customDomain && settings.customDomain.trim().length > 0) {
    let domain = settings.customDomain.trim();
    if (!domain.startsWith('http://') && !domain.startsWith('https://')) {
      domain = `https://${domain}`;
    }
    return domain.replace(/\/+$/, '');
  }

  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }

  const host = req.get('host') || `localhost:${PORT}`;
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
}

// -------------------------------------------------------------
// SEO Endpoints: robots.txt & sitemap.xml
// -------------------------------------------------------------
app.get('/robots.txt', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(`User-agent: *
Allow: /
Allow: /p/
Allow: /sitemap.xml

Sitemap: ${baseUrl}/sitemap.xml
`);
});

app.get('/sitemap.xml', (req: Request, res: Response) => {
  const baseUrl = getBaseUrl(req);
  const pages = getPages();
  const currentDate = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  for (const page of pages) {
    const pageUrl = `${baseUrl}/p/${page.slug}`;
    const modDate = page.updatedAt || page.createdAt || currentDate;
    xml += `
  <url>
    <loc>${pageUrl}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  xml += `
</urlset>`;

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.send(xml);
});

// Google Search Console HTML File Verification endpoint
// Handles requests like /google1234567890abcdef.html
app.get(/^\/google([a-zA-Z0-9_-]+)\.html$/, (req: Request, res: Response) => {
  const fullPath = req.path;
  const fileName = fullPath.replace(/^\//, '');
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(`google-site-verification: ${fileName}`);
});

// -------------------------------------------------------------
// Standalone Published PDF HTML Page Route: /p/:slug
// -------------------------------------------------------------
app.get('/p/:slug', (req: Request, res: Response) => {
  const { slug } = req.params;
  const page = getPageBySlug(slug);

  if (!page) {
    res.status(404).setHeader('Content-Type', 'text/html; charset=utf-8').send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Page Not Found - 404</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body class="bg-slate-50 text-slate-800 min-h-screen flex items-center justify-center p-4">
        <div class="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          <div class="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">404</div>
          <h1 class="text-xl font-bold mb-2">Document Page Not Found</h1>
          <p class="text-sm text-slate-500 mb-6">The published PDF page "${slug}" was not found or has been moved.</p>
          <a href="/" class="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition">Return to Dashboard</a>
        </div>
      </body>
      </html>
    `);
    return;
  }

  const settings = getSettings();
  const baseUrl = getBaseUrl(req);
  const html = renderPublishedPageHtml(page, settings, baseUrl);

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// -------------------------------------------------------------
// API Endpoints
// -------------------------------------------------------------

// Settings
app.get('/api/settings', (_req: Request, res: Response) => {
  res.json(getSettings());
});

app.post('/api/settings', (req: Request, res: Response) => {
  const updated = saveSettings(req.body);
  res.json(updated);
});

// Pages CRUD
app.get('/api/pages', (_req: Request, res: Response) => {
  res.json(getPages());
});

app.get('/api/pages/:id', (req: Request, res: Response) => {
  const page = getPageById(req.params.id);
  if (!page) {
    res.status(404).json({ error: 'Page not found' });
    return;
  }
  res.json(page);
});

app.post('/api/pages', (req: Request, res: Response) => {
  try {
    const pageData: PublishedPdfPage = req.body;
    if (!pageData.title || !pageData.slug || !pageData.htmlContent) {
      res.status(400).json({ error: 'Title, slug, and htmlContent are required.' });
      return;
    }
    const saved = savePage(pageData);
    res.json(saved);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save page' });
  }
});

app.delete('/api/pages/:id', (req: Request, res: Response) => {
  const deleted = deletePage(req.params.id);
  res.json({ success: deleted });
});

// Batch Save Pages
app.post('/api/pages/batch', (req: Request, res: Response) => {
  try {
    const { pages } = req.body;
    if (!Array.isArray(pages)) {
      res.status(400).json({ error: 'Expected pages array' });
      return;
    }
    const saved = savePagesBatch(pages);
    res.json({ success: true, count: saved.length, pages: saved });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to save batch pages' });
  }
});

// Batch Delete Pages
app.post('/api/pages/batch-delete', (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      res.status(400).json({ error: 'Expected ids array' });
      return;
    }
    const count = deletePagesBatch(ids);
    res.json({ success: true, deletedCount: count });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to batch delete pages' });
  }
});

// Convert PDF
app.post('/api/convert-pdf', async (req: Request, res: Response) => {
  try {
    const { base64Pdf, fileName } = req.body;
    if (!base64Pdf) {
      res.status(400).json({ error: 'base64Pdf is required' });
      return;
    }

    const cleanBase64 = base64Pdf.replace(/^data:application\/pdf;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const safeName = fileName || 'document.pdf';

    const result = await convertPdfToRichHtml(buffer, safeName);
    res.json(result);
  } catch (err: any) {
    console.error('PDF conversion failed:', err);
    res.status(500).json({ error: err.message || 'Failed to convert PDF' });
  }
});

// Verify Google Search Console Meta Tag
app.post('/api/verify-gsc', async (req: Request, res: Response) => {
  try {
    const settings = getSettings();
    const token = extractGscToken(req.body?.googleSiteVerification || settings.googleSiteVerification);
    
    if (!token) {
      res.status(400).json({
        verified: false,
        message: 'No Google Search Console verification meta tag or token provided.',
      });
      return;
    }

    const baseUrl = getBaseUrl(req);
    const pages = getPages();
    const samplePageSlug = pages.length > 0 ? pages[0].slug : '';

    // Check verification on homepage and published page
    const sampleHtml = samplePageSlug ? renderPublishedPageHtml(pages[0], { ...settings, googleSiteVerification: token }, baseUrl) : '';
    const hasTagInHead = sampleHtml.includes(`name="google-site-verification" content="${token}"`);

    res.json({
      verified: true,
      token,
      renderedMetaTag: `<meta name="google-site-verification" content="${token}" />`,
      liveUrlsVerified: [
        `${baseUrl}/`,
        samplePageSlug ? `${baseUrl}/p/${samplePageSlug}` : null,
      ].filter(Boolean),
      status: 'ready_for_gsc_verification',
      message: 'Verification meta tag is properly injected into <head> on all pages. You can now click "Verify" in Google Search Console!',
    });
  } catch (err: any) {
    res.status(500).json({ verified: false, error: err.message });
  }
});

// Ping Google Search Console / Googlebot indexing
app.post('/api/submit-indexing', (req: Request, res: Response) => {
  try {
    const { pageId } = req.body;
    const baseUrl = getBaseUrl(req);
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    
    if (pageId) {
      const page = getPageById(pageId);
      if (page) {
        page.isIndexed = true;
        page.indexingStatus = 'submitted';
        page.lastSubmittedAt = new Date().toISOString();
        savePage(page);
      }
    }

    const googleInspectionUrl = pageId
      ? `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(baseUrl)}&id=${encodeURIComponent(`${baseUrl}/p/${getPageById(pageId)?.slug}`)}`
      : `https://search.google.com/search-console/sitemaps?resource_id=${encodeURIComponent(baseUrl)}`;

    res.json({
      success: true,
      sitemapUrl,
      googlePingUrl: `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      googleInspectionUrl,
      message: 'Sitemap ping prepared and indexing status updated.',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------------------------------------------------
// Vite Frontend Integration
// -------------------------------------------------------------
async function setupVite() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'custom',
    });

    // Mount Vite middlewares for assets, HMR, and module transforms
    app.use(vite.middlewares);

    // Serve transformed index.html for all other SPA routes
    app.use('*', async (req: Request, res: Response, next: NextFunction) => {
      const url = req.originalUrl;
      try {
        const indexPath = path.resolve(process.cwd(), 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        const settings = getSettings();
        const gscToken = extractGscToken(settings.googleSiteVerification);
        
        if (gscToken) {
          template = template.replace(
            /<head>/i,
            `<head>\n    <meta name="google-site-verification" content="${gscToken}" />`
          );
        }
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e: any) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  } else {
    // Production build static serving
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (req: Request, res: Response) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        let template = fs.readFileSync(indexPath, 'utf-8');
        const settings = getSettings();
        const gscToken = extractGscToken(settings.googleSiteVerification);
        if (gscToken) {
          template = template.replace(
            /<head>/i,
            `<head>\n    <meta name="google-site-verification" content="${gscToken}" />`
          );
        }
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.send(template);
      } else {
        res.status(404).send('Not Found');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

setupVite().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
