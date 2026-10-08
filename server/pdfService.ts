import { PDFParse } from 'pdf-parse';
import type { ExtractedLink, TableOfContentsItem } from './db.js';

export interface PdfConversionResult {
  title: string;
  seoTitle: string;
  seoDescription: string;
  slug: string;
  keywords: string[];
  htmlContent: string;
  tableOfContents: TableOfContentsItem[];
  links: ExtractedLink[];
  pageCount: number;
  wordCount: number;
  readingTimeMinutes: number;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .substring(0, 60);
}

// Fallback regex-based link extraction and semantic HTML builder
function buildSemanticHtmlFromRawText(rawText: string, fileName: string): PdfConversionResult {
  const lines = rawText.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  
  // Find external URLs
  const urlRegex = /(https?:\/\/[^\s<>"'{}|\\^`]+)/gi;
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
  
  const extractedLinks: ExtractedLink[] = [];
  const linkUrlSet = new Set<string>();

  // Extract URLs
  let match;
  while ((match = urlRegex.exec(rawText)) !== null) {
    const rawUrl = match[0].replace(/[.,;:)]+$/, '');
    if (!linkUrlSet.has(rawUrl)) {
      linkUrlSet.add(rawUrl);
      extractedLinks.push({
        id: `link-ext-${extractedLinks.length + 1}`,
        text: rawUrl,
        url: rawUrl,
        isInternal: false,
        type: 'external_url',
      });
    }
  }

  // Extract Emails
  let emailMatch;
  while ((emailMatch = emailRegex.exec(rawText)) !== null) {
    const email = emailMatch[0];
    if (!linkUrlSet.has(`mailto:${email}`)) {
      linkUrlSet.add(`mailto:${email}`);
      extractedLinks.push({
        id: `link-mail-${extractedLinks.length + 1}`,
        text: email,
        url: `mailto:${email}`,
        isInternal: false,
        type: 'email',
      });
    }
  }

  // Identify Headings and build TOC
  const toc: TableOfContentsItem[] = [];
  const htmlSections: string[] = [];

  let currentHeading = fileName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
  let title = currentHeading;
  if (lines.length > 0 && lines[0].length < 80) {
    title = lines[0];
  }

  let paragraphBuffer: string[] = [];

  function flushParagraph() {
    if (paragraphBuffer.length === 0) return;
    let text = paragraphBuffer.join(' ');
    // Linkify external URLs in paragraph
    text = text.replace(urlRegex, (url) => {
      const cleanUrl = url.replace(/[.,;:)]+$/, '');
      const trailing = url.substring(cleanUrl.length);
      return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline font-medium hover:text-blue-800 transition-colors">${cleanUrl}</a>${trailing}`;
    });
    // Linkify emails
    text = text.replace(emailRegex, (email) => {
      return `<a href="mailto:${email}" class="text-purple-600 dark:text-purple-400 underline hover:text-purple-800">${email}</a>`;
    });

    htmlSections.push(`<p class="leading-relaxed mb-5 text-slate-700 dark:text-slate-300">${text}</p>`);
    paragraphBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check if line looks like a heading
    const isNumberedHeading = /^(\d+(\.\d+)*|\b[IVXLCDM]+\b|Chapter|Section)\s+[\w\s]{3,60}/i.test(line);
    const isShortTitleCase = line.length > 3 && line.length < 65 && !line.endsWith('.') && !line.includes('http');
    
    if (i > 0 && (isNumberedHeading || (isShortTitleCase && lines[i - 1].length > 60))) {
      flushParagraph();
      const headingSlug = slugify(line) || `section-${toc.length + 1}`;
      const level = isNumberedHeading && line.includes('.') ? 3 : 2;
      
      toc.push({
        id: headingSlug,
        title: line,
        level,
      });

      // Also record as internal link
      extractedLinks.push({
        id: `link-int-${extractedLinks.length + 1}`,
        text: line,
        url: `#${headingSlug}`,
        isInternal: true,
        type: 'internal_anchor',
      });

      if (level === 2) {
        htmlSections.push(`<h2 id="${headingSlug}" class="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mt-10 mb-4 pb-2 border-b border-slate-200 dark:border-slate-800 scroll-mt-24">${line}</h2>`);
      } else {
        htmlSections.push(`<h3 id="${headingSlug}" class="text-xl font-semibold tracking-tight text-slate-800 dark:text-slate-100 mt-8 mb-3 scroll-mt-24">${line}</h3>`);
      }
    } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
      flushParagraph();
      const bulletText = line.replace(/^[•\-*]\s*/, '');
      htmlSections.push(`<li class="text-slate-700 dark:text-slate-300 mb-2">${bulletText}</li>`);
    } else {
      paragraphBuffer.push(line);
    }
  }
  flushParagraph();

  // Wrap list items if any
  let html = htmlSections.join('\n');
  html = html.replace(/(<li[\s\S]*?<\/li>\s*)+/g, (match) => {
    return `<ul class="list-disc pl-6 space-y-2 mb-6">${match}</ul>`;
  });

  const wordCount = rawText.split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));
  const seoTitle = `${title.slice(0, 50)} | Published PDF Report`;
  const seoDescription = rawText.slice(0, 155).replace(/\s+/g, ' ').trim() + '...';
  const slug = slugify(title) || 'pdf-document';

  return {
    title,
    seoTitle,
    seoDescription,
    slug,
    keywords: [title.split(' ')[0], 'PDF Document', 'HTML Report', 'SEO Indexing'],
    htmlContent: html,
    tableOfContents: toc,
    links: extractedLinks,
    pageCount: Math.max(1, Math.ceil(wordCount / 350)),
    wordCount,
    readingTimeMinutes: readingTime,
  };
}

export async function convertPdfToRichHtml(
  pdfBuffer: Buffer,
  fileName: string
): Promise<PdfConversionResult> {
  let rawText = '';
  let parsedPageCount = 1;

  try {
    const parser = new PDFParse(new Uint8Array(pdfBuffer));
    const textResult = await parser.getText();
    rawText = typeof textResult === 'string' ? textResult : (textResult as any)?.text || '';
    const info = await parser.getInfo();
    parsedPageCount = (info as any)?.total || (info as any)?.pageCount || 1;
  } catch (err) {
    console.warn('PDFParse failed, attempting alternative extraction:', err);
    rawText = pdfBuffer.toString('latin1').replace(/[^\x20-\x7E\r\n\t]/g, ' ');
  }

  const result = buildSemanticHtmlFromRawText(rawText || fileName, fileName);
  result.pageCount = parsedPageCount;
  return result;
}
