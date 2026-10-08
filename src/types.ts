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
