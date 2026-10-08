import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  Link2,
  ExternalLink,
  Code2,
  Trash2,
  Eye,
  Check,
  Copy,
  Layers,
  ArrowRight,
  Globe
} from 'lucide-react';
import type { PdfConversionResult, PublishedPdfPage } from '../types';

export interface BulkQueueItem {
  id: string;
  file?: File;
  fileName: string;
  fileSize: number;
  status: 'queued' | 'reading' | 'converting' | 'completed' | 'error';
  stepMessage: string;
  result?: PdfConversionResult;
  publishedPage?: PublishedPdfPage;
  error?: string;
}

interface PdfUploadZoneProps {
  onConverted: (result: PdfConversionResult, originalName: string, fileSize: number, base64: string) => void;
  onBatchPublished: (pages: PublishedPdfPage[]) => void;
  onNavigateToDocuments: () => void;
}

export const PdfUploadZone: React.FC<PdfUploadZoneProps> = ({ 
  onConverted, 
  onBatchPublished,
  onNavigateToDocuments 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [queue, setQueue] = useState<BulkQueueItem[]>([]);
  const [isProcessingQueue, setIsProcessingQueue] = useState(false);
  const [autoPublish, setAutoPublish] = useState(true);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter((f) =>
      f.name.toLowerCase().endsWith('.pdf')
    );
    if (droppedFiles.length > 0) {
      addFilesToQueue(droppedFiles);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = Array.from(e.target.files).filter((f) =>
        f.name.toLowerCase().endsWith('.pdf')
      );
      addFilesToQueue(selected);
      // Reset input value so same files can be re-selected if desired
      e.target.value = '';
    }
  };

  const addFilesToQueue = (files: File[]) => {
    const newItems: BulkQueueItem[] = files.map((file) => ({
      id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      status: 'queued',
      stepMessage: 'Waiting in conversion queue...',
    }));

    setQueue((prev) => [...prev, ...newItems]);
    // Start processing automatically
    startProcessingQueue([...queue, ...newItems]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  };

  const startProcessingQueue = async (currentQueue: BulkQueueItem[]) => {
    if (isProcessingQueue) return;
    setIsProcessingQueue(true);

    const updatedQueue = [...currentQueue];
    const newlyPublishedPages: PublishedPdfPage[] = [];

    for (let i = 0; i < updatedQueue.length; i++) {
      const item = updatedQueue[i];
      if (item.status === 'completed' || item.status === 'error') {
        continue;
      }

      // Update item to reading
      item.status = 'reading';
      item.stepMessage = 'Reading PDF binary payload...';
      setQueue([...updatedQueue]);

      try {
        let base64 = '';
        if (item.file) {
          base64 = await fileToBase64(item.file);
        } else {
          throw new Error('File data unavailable');
        }

        // Update item to converting
        item.status = 'converting';
        item.stepMessage = 'Preserving internal anchors, hyperlinked URLs & generating rich HTML...';
        setQueue([...updatedQueue]);

        const response = await fetch('/api/convert-pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            base64Pdf: base64,
            fileName: item.fileName,
          }),
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to convert PDF');
        }

        const result: PdfConversionResult = await response.json();
        item.result = result;

        const newPage: PublishedPdfPage = {
          id: `pdf-${Date.now()}-${i}`,
          slug: result.slug,
          title: result.title,
          seoTitle: result.seoTitle,
          seoDescription: result.seoDescription,
          keywords: result.keywords,
          htmlContent: result.htmlContent,
          tableOfContents: result.tableOfContents,
          links: result.links,
          originalPdfName: item.fileName,
          originalPdfSize: item.fileSize,
          rawPdfBase64: base64,
          pageCount: result.pageCount,
          wordCount: result.wordCount,
          readingTimeMinutes: result.readingTimeMinutes,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isIndexed: false,
          indexingStatus: 'pending',
        };

        if (autoPublish) {
          // Immediately save to server database
          const saveRes = await fetch('/api/pages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newPage),
          });
          if (saveRes.ok) {
            const savedData = await saveRes.json();
            item.publishedPage = savedData;
            newlyPublishedPages.push(savedData);
            item.status = 'completed';
            item.stepMessage = `Published live at /p/${savedData.slug}! (${result.links.length} links preserved)`;
          } else {
            throw new Error('Failed to publish page to database');
          }
        } else {
          item.publishedPage = newPage;
          item.status = 'completed';
          item.stepMessage = `Converted! (${result.links.length} links preserved, ready to review)`;
        }

        setQueue([...updatedQueue]);
      } catch (err: any) {
        console.error(`Error processing ${item.fileName}:`, err);
        item.status = 'error';
        item.error = err.message || 'Error occurred';
        item.stepMessage = `Failed: ${err.message || 'Conversion error'}`;
        setQueue([...updatedQueue]);
      }
    }

    if (newlyPublishedPages.length > 0) {
      onBatchPublished(newlyPublishedPages);
    }

    setIsProcessingQueue(false);
  };

  const removeQueueItem = (id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCompleted = () => {
    setQueue((prev) => prev.filter((item) => item.status !== 'completed'));
  };

  // Demo generator: Generates 3 distinct sample PDFs for instant bulk test
  const generateBulkDemoPdfs = async () => {
    const demoSpecs = [
      {
        fileName: '01_Cloud_Security_Architecture_2026.pdf',
        title: 'Zero Trust Cloud Security Architecture 2026',
        toc: 'Jump to #threat-modeling or #iam-policies',
        url1: 'https://csrc.nist.gov/publications/detail/sp/800-207/final',
        url2: 'https://cloud.google.com/security/zero-trust',
        email: 'security-team@esourceit.in',
      },
      {
        fileName: '02_AI_Engine_SEO_Indexing_Strategy.pdf',
        title: 'Search Engine Optimization for AI Knowledge Engines',
        toc: 'Jump to #semantic-schema or #crawl-budget',
        url1: 'https://developers.google.com/search/docs/crawling-indexing',
        url2: 'https://schema.org/TechArticle',
        email: 'seo-team@esourceit.in',
      },
      {
        fileName: '03_Enterprise_API_Performance_Report.pdf',
        title: 'Enterprise REST & gRPC High Throughput Benchmarks',
        toc: 'Jump to #latency-metrics or #cdn-edge-caching',
        url1: 'https://grpc.io/docs/guides/performance/',
        url2: 'https://www.w3.org/Protocols/rfc2616/rfc2616.html',
        email: 'api-perf@esourceit.in',
      },
    ];

    const generatedFiles: File[] = [];

    for (const spec of demoSpecs) {
      const pdfText = `%PDF-1.4
1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj
2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj
3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj
4 0 obj << /Length 400 >> stream
BT
/F1 18 Tf
50 720 Td
(${spec.title}) Tj
/F1 12 Tf
0 -35 Td
(Table of Contents: ${spec.toc}) Tj
0 -25 Td
(Reference 1: ${spec.url1}) Tj
0 -25 Td
(Reference 2: ${spec.url2}) Tj
0 -25 Td
(Direct Inquiries: ${spec.email}) Tj
ET
endstream
endobj
5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000224 00000 n 
0000000676 00000 n 
trailer << /Size 6 /Root 1 0 R >>
startxref
745
%%EOF`;

      const blob = new Blob([pdfText], { type: 'application/pdf' });
      generatedFiles.push(new File([blob], spec.fileName, { type: 'application/pdf' }));
    }

    addFilesToQueue(generatedFiles);
  };

  const copyPageUrl = (slug: string) => {
    const fullUrl = `${window.location.origin}/p/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2000);
  };

  // Queue Statistics
  const totalCount = queue.length;
  const completedCount = queue.filter((i) => i.status === 'completed').length;
  const errorCount = queue.filter((i) => i.status === 'error').length;
  const inProgressCount = queue.filter((i) => i.status === 'reading' || i.status === 'converting').length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-sm mb-10 transition-colors">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 text-xs font-semibold mb-3 border border-blue-200 dark:border-blue-900">
            <Layers className="w-3.5 h-3.5" />
            <span>Multi-PDF Batch Converter & SEO Publisher</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bulk Upload & Convert Multiple PDFs
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-2xl mx-auto">
            Select or drag dozens of PDFs at once. Each PDF automatically receives its own live semantic HTML web page (<span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">/p/slug</span>) with intact internal anchor bookmarks, external hyperlinked URLs, and Google Search Console meta tags.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isProcessingQueue && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-700 hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,application/pdf"
            onChange={handleFileInputChange}
            className="hidden"
            disabled={isProcessingQueue}
          />

          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <UploadCloud className="w-8 h-8" />
            </div>

            <div>
              <p className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100">
                Choose Multiple PDF Files or Drag & Drop in Bulk
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Upload 1, 10, or 50+ PDFs at once • Each up to 40MB
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Link2 className="w-3.5 h-3.5 text-emerald-500" />
                Preserves Internal #Anchor Links
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <ExternalLink className="w-3.5 h-3.5 text-indigo-500" />
                Activates Outbound URLs
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                <Globe className="w-3.5 h-3.5 text-blue-500" />
                Auto-Sitemap Registration
              </span>
            </div>
          </div>
        </div>

        {/* Options & Quick Test Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          
          <label className="flex items-center gap-2.5 cursor-pointer font-medium text-slate-800 dark:text-slate-200">
            <input
              type="checkbox"
              checked={autoPublish}
              onChange={(e) => setAutoPublish(e.target.checked)}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>Auto-publish all converted PDFs to live URLs immediately</span>
          </label>

          <button
            type="button"
            onClick={generateBulkDemoPdfs}
            disabled={isProcessingQueue}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 font-semibold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 hover:bg-blue-200 dark:hover:bg-blue-900 rounded-xl transition shrink-0 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate 3 Demo PDFs (Bulk Test)</span>
          </button>
        </div>

        {/* Batch Queue Section */}
        {queue.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            
            {/* Queue Header & Global Progress */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Batch Conversion Queue ({totalCount} PDFs)</span>
                </h3>
                <p className="text-xs text-slate-500">
                  {completedCount} of {totalCount} completed ({percentComplete}%)
                  {errorCount > 0 && <span className="text-red-500 ml-2">({errorCount} errors)</span>}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {completedCount === totalCount && (
                  <button
                    onClick={onNavigateToDocuments}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
                  >
                    <span>View All in Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  onClick={clearCompleted}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                >
                  Clear Finished
                </button>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>

            {/* Queue List Cards */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs bg-slate-50/50 dark:bg-slate-950/40">
              {queue.map((item) => (
                <div key={item.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white dark:hover:bg-slate-900/60 transition-colors">
                  
                  {/* Left: Icon, Filename, Status Step */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      item.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400'
                        : item.status === 'error'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/80 dark:text-red-400'
                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/80 dark:text-blue-400'
                    }`}>
                      {item.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : item.status === 'error' ? (
                        <AlertCircle className="w-4 h-4" />
                      ) : item.status === 'queued' ? (
                        <FileText className="w-4 h-4" />
                      ) : (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 dark:text-slate-100 truncate max-w-sm sm:max-w-md">
                          {item.fileName}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          ({formatFileSize(item.fileSize)})
                        </span>
                      </div>

                      <p className={`text-[11px] mt-0.5 truncate ${
                        item.status === 'completed'
                          ? 'text-emerald-600 dark:text-emerald-400 font-medium'
                          : item.status === 'error'
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-blue-600 dark:text-blue-400'
                      }`}>
                        {item.stepMessage}
                      </p>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {item.publishedPage && (
                      <>
                        <a
                          href={`/p/${item.publishedPage.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/80 hover:bg-blue-100 rounded-lg transition flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Open /p/{item.publishedPage.slug}</span>
                        </a>

                        <button
                          onClick={() => copyPageUrl(item.publishedPage!.slug)}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                          title="Copy page URL"
                        >
                          {copiedSlug === item.publishedPage.slug ? (
                            <Check className="w-3.5 h-3.5 text-emerald-500" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </>
                    )}

                    {!isProcessingQueue && (
                      <button
                        onClick={() => removeQueueItem(item.id)}
                        className="p-1 text-slate-400 hover:text-red-600 transition"
                        title="Remove from queue"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
