import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  FileText, 
  UploadCloud, 
  Sparkles, 
  ExternalLink,
  CheckSquare,
  Square,
  Send,
  Trash2,
  Copy,
  Check,
  CheckCircle2
} from 'lucide-react';
import { DocumentCard } from './DocumentCard';
import type { PublishedPdfPage } from '../types';

interface DocumentsListProps {
  pages: PublishedPdfPage[];
  onUploadClick: () => void;
  onEdit: (page: PublishedPdfPage) => void;
  onDelete: (id: string) => void;
  onBatchDelete?: (ids: string[]) => void;
  onSubmitIndexing: (pageId: string) => void;
  onBatchSubmitIndexing?: (pageIds: string[]) => void;
  onOpenLinkAudit: (page: PublishedPdfPage) => void;
}

export const DocumentsList: React.FC<DocumentsListProps> = ({
  pages,
  onUploadClick,
  onEdit,
  onDelete,
  onBatchDelete,
  onSubmitIndexing,
  onBatchSubmitIndexing,
  onOpenLinkAudit,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'indexed' | 'submitted' | 'pending'>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [copiedBatchUrls, setCopiedBatchUrls] = useState(false);
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  const filteredPages = pages.filter((page) => {
    const matchesSearch =
      page.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.slug.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.seoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      page.originalPdfName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : page.indexingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredPages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPages.map((p) => p.id)));
    }
  };

  const handleCopyBatchUrls = () => {
    const origin = window.location.origin;
    const selectedPages = pages.filter((p) => selectedIds.has(p.id));
    const urls = selectedPages.map((p) => `${origin}/p/${p.slug}`).join('\n');
    navigator.clipboard.writeText(urls);
    setCopiedBatchUrls(true);
    setTimeout(() => setCopiedBatchUrls(false), 2500);
  };

  const handleBulkSubmit = async () => {
    setIsBulkSubmitting(true);
    const ids = Array.from(selectedIds);
    if (onBatchSubmitIndexing) {
      onBatchSubmitIndexing(ids);
    } else {
      for (const id of ids) {
        await onSubmitIndexing(id);
      }
    }
    setIsBulkSubmitting(false);
  };

  const handleBulkDelete = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (onBatchDelete) {
      onBatchDelete(ids);
    } else {
      for (const id of ids) {
        onDelete(id);
      }
    }
    setSelectedIds(new Set());
  };

  const isAllSelected = filteredPages.length > 0 && selectedIds.size === filteredPages.length;

  return (
    <div className="space-y-6">
      
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by title, slug, or keywords..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-slate-900 dark:text-white placeholder-slate-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({pages.length})
            </button>
            <button
              onClick={() => setStatusFilter('indexed')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'indexed'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Indexed
            </button>
            <button
              onClick={() => setStatusFilter('submitted')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                statusFilter === 'submitted'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Submitted
            </button>
          </div>

          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20 shrink-0"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Bulk Upload PDFs</span>
          </button>
        </div>

      </div>

      {/* Select All & Selection Actions Toolbar */}
      {filteredPages.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 px-2 py-1 text-xs">
          <button
            onClick={handleSelectAll}
            className="inline-flex items-center gap-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium cursor-pointer"
          >
            {isAllSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-slate-400" />
            )}
            <span>
              {isAllSelected
                ? `Deselect All (${filteredPages.length})`
                : `Select All (${filteredPages.length})`}
            </span>
          </button>

          {selectedIds.size > 0 && (
            <div className="flex flex-wrap items-center gap-2 animate-in fade-in duration-150">
              <span className="font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-900">
                {selectedIds.size} Selected
              </span>

              <button
                onClick={handleBulkSubmit}
                disabled={isBulkSubmitting}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition"
              >
                <Send className="w-3 h-3" />
                <span>{isBulkSubmitting ? 'Pinging...' : `Index Selected (${selectedIds.size})`}</span>
              </button>

              <button
                onClick={handleCopyBatchUrls}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg font-semibold transition"
              >
                {copiedBatchUrls ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>{copiedBatchUrls ? 'URLs Copied!' : 'Copy URLs for GSC'}</span>
              </button>

              <button
                onClick={handleBulkDelete}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/60 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 rounded-lg font-semibold transition"
              >
                <Trash2 className="w-3 h-3" />
                <span>Delete ({selectedIds.size})</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Pages Grid */}
      {filteredPages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPages.map((page) => (
            <DocumentCard
              key={page.id}
              page={page}
              isSelected={selectedIds.has(page.id)}
              onToggleSelect={toggleSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onSubmitIndexing={onSubmitIndexing}
              onOpenLinkAudit={onOpenLinkAudit}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center max-w-lg mx-auto">
          <div className="w-14 h-14 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1">
            No published PDF pages found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
            {searchQuery
              ? `No documents matched the search "${searchQuery}". Try clearing the query.`
              : 'Upload your PDFs in bulk to generate SEO-optimized HTML web pages with active internal links.'}
          </p>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition shadow-sm shadow-blue-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Bulk Upload PDFs</span>
          </button>
        </div>
      )}

    </div>
  );
};
