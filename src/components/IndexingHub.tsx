import React, { useState } from 'react';
import { 
  Globe, 
  Send, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Search, 
  Check, 
  Copy, 
  RefreshCw,
  FileText
} from 'lucide-react';
import type { PublishedPdfPage, AppSettings } from '../types';

interface IndexingHubProps {
  pages: PublishedPdfPage[];
  settings: AppSettings;
  onSubmitIndexing: (pageId: string) => Promise<void>;
}

export const IndexingHub: React.FC<IndexingHubProps> = ({
  pages,
  settings,
  onSubmitIndexing,
}) => {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  const origin = window.location.origin;
  const sitemapUrl = `${origin}/sitemap.xml`;
  const robotsUrl = `${origin}/robots.txt`;

  const handlePingAll = async () => {
    setPingStatus('Pinging Google sitemap webhook...');
    try {
      const res = await fetch('/api/submit-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      setPingStatus(`Googlebot ping triggered for ${sitemapUrl}! Sitemaps are indexed by Google crawlers.`);
      setTimeout(() => setPingStatus(null), 5000);
    } catch {
      setPingStatus('Failed to send ping');
    }
  };

  const handleIndexPage = async (pageId: string) => {
    setSubmittingId(pageId);
    await onSubmitIndexing(pageId);
    setSubmittingId(null);
  };

  const copyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(id);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold mb-3 border border-emerald-700">
            <Globe className="w-3.5 h-3.5" />
            <span>Google Search Indexing Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Index Published PDF Web Pages in Google
          </h2>
          <p className="text-sm text-emerald-100/90 mt-2 leading-relaxed">
            Ensure your converted PDF documents are discovered, crawled, and indexed by Googlebot. Submit your live XML sitemap and request instant priority URL inspections directly in Google Search Console.
          </p>
        </div>
      </div>

      {/* Sitemaps & Fast Ping Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-600" />
              <span>Step 1: Submit Live XML Sitemap to Google</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Googlebot automatically crawls all your published PDF pages through this sitemap.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePingAll}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-emerald-500/20 active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ping Googlebot Crawler</span>
            </button>
          </div>
        </div>

        {pingStatus && (
          <div className="mt-4 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{pingStatus}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">XML Sitemap Endpoint:</span>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
              <span className="text-blue-600 dark:text-blue-400 truncate">{sitemapUrl}</span>
              <button
                onClick={() => copyUrl(sitemapUrl, 'sitemap')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {copiedUrl === 'sitemap' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a
              href="https://search.google.com/search-console/sitemaps"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline pt-1"
            >
              <span>Submit in GSC Sitemaps Panel</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500 block">Robots.txt Configuration:</span>
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs">
              <span className="text-blue-600 dark:text-blue-400 truncate">{robotsUrl}</span>
              <button
                onClick={() => copyUrl(robotsUrl, 'robots')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                {copiedUrl === 'robots' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <a
              href={robotsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline pt-1"
            >
              <span>View live robots.txt</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

        </div>
      </div>

      {/* Priority URL Inspection Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Step 2: Fast Indexing via URL Inspection</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Trigger instant priority crawl queues for individual published PDF pages in Google Search Console.
            </p>
          </div>
          <span className="text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-lg">
            {pages.length} Pages Ready
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-medium">
                <th className="py-3 px-2">Published Page Title</th>
                <th className="py-3 px-2">Canonical URL</th>
                <th className="py-3 px-2">Indexing Status</th>
                <th className="py-3 px-2 text-right">Google Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pages.map((page) => {
                const pageUrl = `${origin}/p/${page.slug}`;
                const inspectUrl = `https://search.google.com/search-console/inspect?resource_id=${encodeURIComponent(origin)}&id=${encodeURIComponent(pageUrl)}`;

                return (
                  <tr key={page.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-2">
                      <div className="font-bold text-slate-900 dark:text-white truncate max-w-xs">
                        {page.title}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {page.wordCount} words • {page.links?.length || 0} links
                      </span>
                    </td>
                    <td className="py-3 px-2 font-mono text-blue-600 dark:text-blue-400 truncate max-w-[200px]">
                      /p/{page.slug}
                    </td>
                    <td className="py-3 px-2">
                      <span className={`px-2 py-0.5 rounded-full capitalize text-[10px] font-semibold ${
                        page.indexingStatus === 'indexed'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : page.indexingStatus === 'submitted'
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {page.indexingStatus}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <div className="inline-flex items-center gap-2">
                        <a
                          href={inspectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/60 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 rounded-lg font-semibold flex items-center gap-1 transition"
                          title="Open URL Inspection in Google Search Console"
                        >
                          <span>Inspect in GSC</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>

                        <button
                          onClick={() => handleIndexPage(page.id)}
                          disabled={submittingId === page.id}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold flex items-center gap-1 transition"
                        >
                          <Send className="w-3 h-3 text-emerald-500" />
                          <span>{submittingId === page.id ? 'Updating...' : 'Mark Submitted'}</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};
