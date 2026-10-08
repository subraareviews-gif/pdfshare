import React, { useState } from 'react';
import { 
  X, 
  Eye, 
  Code2, 
  Link2, 
  Globe, 
  Save, 
  ExternalLink, 
  Check, 
  Copy, 
  Sparkles,
  Info
} from 'lucide-react';
import type { PublishedPdfPage, ExtractedLink } from '../types';

interface PageEditorModalProps {
  page: PublishedPdfPage;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPage: PublishedPdfPage) => Promise<void>;
  initialTab?: 'preview' | 'html' | 'links' | 'seo';
}

export const PageEditorModal: React.FC<PageEditorModalProps> = ({
  page,
  isOpen,
  onClose,
  onSave,
  initialTab = 'preview',
}) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'links' | 'seo'>(initialTab);
  const [formData, setFormData] = useState<PublishedPdfPage>({ ...page });
  const [isSaving, setIsSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(formData);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const internalLinks = formData.links?.filter((l) => l.isInternal) || [];
  const externalLinks = formData.links?.filter((l) => !l.isInternal) || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white truncate max-w-lg">
              {formData.title}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400">
                /p/{formData.slug}
              </span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span className="text-[11px] text-slate-500">
                {formData.wordCount} words • {formData.links?.length || 0} links extracted
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20 active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save & Publish'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto bg-white dark:bg-slate-900 text-xs">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'preview'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Live Web Preview</span>
          </button>

          <button
            onClick={() => setActiveTab('html')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'html'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Rich HTML Source</span>
          </button>

          <button
            onClick={() => setActiveTab('links')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'links'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Link2 className="w-4 h-4" />
            <span>Links & Anchors Audit ({formData.links?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('seo')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'seo'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>SEO & Google SERP Preview</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 dark:bg-slate-950/20">
          
          {/* 1. Preview Tab */}
          {activeTab === 'preview' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-2xl flex items-center justify-between text-xs text-blue-700 dark:text-blue-300">
                <span className="flex items-center gap-1.5">
                  <Info className="w-4 h-4 shrink-0" />
                  This is the exact responsive web page rendered for users and Googlebot at <strong>/p/{formData.slug}</strong>.
                </span>
                <a
                  href={`/p/${formData.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold underline flex items-center gap-1 shrink-0 ml-2"
                >
                  Open Full Screen ↗
                </a>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
                  {formData.title}
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                  {formData.seoDescription}
                </p>

                <div 
                  className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formData.htmlContent }}
                />
              </div>
            </div>
          )}

          {/* 2. HTML Source Tab */}
          {activeTab === 'html' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Semantic Rich HTML body (headings, paragraphs, internal anchors, links):
                </span>
                <button
                  onClick={() => copyToClipboard(formData.htmlContent, 'html-code')}
                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-mono"
                >
                  {copiedLink === 'html-code' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>Copy Clean HTML</span>
                </button>
              </div>

              <textarea
                value={formData.htmlContent}
                onChange={(e) => setFormData({ ...formData, htmlContent: e.target.value })}
                rows={22}
                className="w-full font-mono text-xs p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed shadow-inner"
              />
            </div>
          )}

          {/* 3. Links Audit Tab */}
          {activeTab === 'links' && (
            <div className="space-y-6">
              
              {/* Internal Anchors Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                      <Link2 className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Internal Anchor Links ({internalLinks.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Jumps to sections inside the document
                  </span>
                </div>

                {internalLinks.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {internalLinks.map((link) => (
                      <div key={link.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {link.text}
                          </p>
                          <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[11px]">
                            {link.url}
                          </span>
                        </div>
                        <a
                          href={`/p/${formData.slug}${link.url}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg hover:bg-emerald-100 transition shrink-0"
                        >
                          Test Jump ↗
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">No internal bookmarks detected in this PDF.</p>
                )}
              </div>

              {/* External URLs Section */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Hyperlinked External URLs & Contacts ({externalLinks.length})
                    </h3>
                  </div>
                  <span className="text-xs text-slate-500">
                    Live hyperlinks pointing outbound
                  </span>
                </div>

                {externalLinks.length > 0 ? (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {externalLinks.map((link) => (
                      <div key={link.id} className="py-2.5 flex items-center justify-between gap-4">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                            {link.text}
                          </p>
                          <span className="font-mono text-indigo-600 dark:text-indigo-400 text-[11px] truncate block">
                            {link.url}
                          </span>
                        </div>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 rounded-lg hover:bg-indigo-100 transition shrink-0"
                        >
                          Visit URL ↗
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 py-3">No external URLs detected in this PDF.</p>
                )}
              </div>

            </div>
          )}

          {/* 4. SEO & SERP Preview Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              
              {/* Google SERP Snippet Preview */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Google Search Snippet Preview (Desktop & Mobile)
                </h4>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800/80">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white font-bold">P</div>
                    <span className="text-[12px] text-slate-700 dark:text-slate-300 font-sans">
                      {window.location.origin} › p › {formData.slug}
                    </span>
                  </div>
                  <h5 className="text-base font-medium text-blue-700 dark:text-blue-400 hover:underline cursor-pointer">
                    {formData.seoTitle || formData.title}
                  </h5>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {formData.seoDescription}
                  </p>
                </div>
              </div>

              {/* Form fields */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Document Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      SEO Title Tag (&lt;title&gt;)
                    </label>
                    <span className={`text-[10px] ${formData.seoTitle.length > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {formData.seoTitle.length}/60 chars
                    </span>
                  </div>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-slate-800 dark:text-slate-200">
                      SEO Meta Description (&lt;meta name="description"&gt;)
                    </label>
                    <span className={`text-[10px] ${formData.seoDescription.length > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {formData.seoDescription.length}/160 chars
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    URL Slug (/p/...)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    className="w-full px-3 py-2 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-blue-600 dark:text-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                    Keywords (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.keywords?.join(', ') || ''}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
