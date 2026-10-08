import React, { useState } from 'react';
import { 
  FileText, 
  ExternalLink, 
  Link2, 
  Globe, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Send,
  Eye,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';
import type { PublishedPdfPage } from '../types';

interface DocumentCardProps {
  page: PublishedPdfPage;
  isSelected?: boolean;
  onToggleSelect?: (id: string) => void;
  onEdit: (page: PublishedPdfPage) => void;
  onDelete: (id: string) => void;
  onSubmitIndexing: (pageId: string) => void;
  onOpenLinkAudit: (page: PublishedPdfPage) => void;
}

export const DocumentCard: React.FC<DocumentCardProps> = ({
  page,
  isSelected = false,
  onToggleSelect,
  onEdit,
  onDelete,
  onSubmitIndexing,
  onOpenLinkAudit,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fullUrl = `${window.location.origin}/p/${page.slug}`;
  const internalCount = page.links?.filter((l) => l.isInternal).length || 0;
  const externalCount = page.links?.filter((l) => !l.isInternal).length || 0;

  const handleCopyUrl = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitGoogle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSubmitting(true);
    await onSubmitIndexing(page.id);
    setIsSubmitting(false);
  };

  const formattedDate = new Date(page.updatedAt || page.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className={`bg-white dark:bg-slate-900 border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative ${
      isSelected
        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/10'
        : 'border-slate-200 dark:border-slate-800'
    }`}>
      <div>
        {/* Top bar with Selection Checkbox, Slug, and Indexing status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 min-w-0">
            {onToggleSelect && (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelect(page.id)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer shrink-0"
              />
            )}
            <span className="font-mono text-[11px] text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-md border border-blue-100 dark:border-blue-900 truncate max-w-[160px] sm:max-w-[190px]">
              /p/{page.slug}
            </span>
          </div>

          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex items-center gap-1 shrink-0 ${
            page.indexingStatus === 'indexed'
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
              : page.indexingStatus === 'submitted'
              ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              page.indexingStatus === 'indexed'
                ? 'bg-emerald-500'
                : page.indexingStatus === 'submitted'
                ? 'bg-blue-500 animate-pulse'
                : 'bg-slate-400'
            }`}></span>
            {page.indexingStatus}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
          {page.title}
        </h3>

        {/* SEO Meta Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
          {page.seoDescription}
        </p>

        {/* Link preservation badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4 text-[11px]">
          <button
            onClick={() => onOpenLinkAudit(page)}
            className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors font-medium"
            title="Inspect internal anchors"
          >
            <Link2 className="w-3 h-3" />
            <span>{internalCount} Internal Anchors</span>
          </button>

          <button
            onClick={() => onOpenLinkAudit(page)}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-medium"
            title="Inspect outbound links"
          >
            <ExternalLink className="w-3 h-3" />
            <span>{externalCount} External URLs</span>
          </button>
        </div>

        {/* Meta details */}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {page.readingTimeMinutes}m read ({page.wordCount.toLocaleString()} words)
          </span>
        </div>
      </div>

      {/* Action buttons footer */}
      <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <a
            href={`/p/${page.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-blue-500/20 transition-all hover:shadow"
            title="Open published HTML page in new tab"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Open Page</span>
          </a>

          <button
            onClick={handleCopyUrl}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs"
            title="Copy Public URL"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onEdit(page)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-xs"
            title="Edit HTML & SEO tags"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleSubmitGoogle}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Submit / Ping Googlebot"
          >
            <Send className="w-3 h-3 text-blue-500" />
            <span>{isSubmitting ? 'Pinging...' : 'Index'}</span>
          </button>

          <button
            onClick={() => onDelete(page.id)}
            className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
            title="Delete published document"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
