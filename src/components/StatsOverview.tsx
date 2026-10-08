import React from 'react';
import { 
  FileText, 
  Link2, 
  ExternalLink, 
  Search, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';
import type { PublishedPdfPage, AppSettings } from '../types';

interface StatsOverviewProps {
  pages: PublishedPdfPage[];
  settings: AppSettings;
  onNavigateToGsc: () => void;
  onNavigateToIndexing: () => void;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  pages,
  settings,
  onNavigateToGsc,
  onNavigateToIndexing,
}) => {
  const totalPages = pages.length;
  let totalInternalLinks = 0;
  let totalExternalLinks = 0;
  let totalWords = 0;

  for (const page of pages) {
    totalWords += page.wordCount || 0;
    if (Array.isArray(page.links)) {
      for (const link of page.links) {
        if (link.isInternal) {
          totalInternalLinks++;
        } else {
          totalExternalLinks++;
        }
      }
    }
  }

  const isGscVerified = Boolean(
    settings.googleSiteVerification && settings.googleSiteVerification.trim().length > 0
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      
      {/* Published Pages */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Published Pages
          </span>
          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <FileText className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalPages}
          </span>
          <span className="text-xs text-slate-500">
            {totalWords.toLocaleString()} words indexed
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
          <span>Dedicated HTML URLs</span>
          <span className="text-blue-600 dark:text-blue-400 font-mono text-[11px]">(/p/*)</span>
        </p>
      </div>

      {/* Internal Links Preserved */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Internal Anchor Links
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Link2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalInternalLinks}
          </span>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            Active hash jumps
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Table of Contents & section bookmarks
        </p>
      </div>

      {/* External Outbound URLs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:shadow transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Hyperlinked Web URLs
          </span>
          <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <ExternalLink className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {totalExternalLinks}
          </span>
          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
            Active web targets
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
          Web URLs & emails linked to anchor text
        </p>
      </div>

      {/* Google Search Console Status */}
      <div 
        onClick={onNavigateToGsc}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm hover:border-blue-500/50 cursor-pointer transition-all group"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            GSC Header Meta Tag
          </span>
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            isGscVerified
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
              : 'bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'
          }`}>
            <Search className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isGscVerified ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">Active in &lt;head&gt;</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <span className="text-lg font-bold text-amber-700 dark:text-amber-400">Action Required</span>
            </>
          )}
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {isGscVerified ? 'Verified & ready for indexation →' : 'Paste verification code →'}
        </p>
      </div>

    </div>
  );
};
