import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { PdfUploadZone } from './components/PdfUploadZone';
import { DocumentsList } from './components/DocumentsList';
import { PageEditorModal } from './components/PageEditorModal';
import { GscVerificationPanel } from './components/GscVerificationPanel';
import { IndexingHub } from './components/IndexingHub';
import { SettingsPanel } from './components/SettingsPanel';
import type { PublishedPdfPage, AppSettings, PdfConversionResult } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'documents' | 'upload' | 'gsc' | 'indexing' | 'settings'>('documents');
  const [pages, setPages] = useState<PublishedPdfPage[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    googleSiteVerification: '',
    googleHtmlFileName: '',
    siteTitle: 'PDFtoWeb SEO & Google Indexer',
    siteDescription: 'Publish PDFs as rich semantic HTML web pages with intact links and Google Search Console indexing.',
    customDomain: '',
    autoPingGoogle: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [editingPage, setEditingPage] = useState<PublishedPdfPage | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialTab, setModalInitialTab] = useState<'preview' | 'html' | 'links' | 'seo'>('preview');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial data
  const loadData = async () => {
    try {
      const [pagesRes, settingsRes] = await Promise.all([
        fetch('/api/pages'),
        fetch('/api/settings'),
      ]);
      if (pagesRes.ok) {
        const pagesData = await pagesRes.json();
        setPages(pagesData);
      }
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setSettings(settingsData);
      }
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handle PDF conversion result
  const handleConvertedPdf = (
    result: PdfConversionResult,
    originalName: string,
    fileSize: number,
    base64: string
  ) => {
    const newPage: PublishedPdfPage = {
      id: `pdf-${Date.now()}`,
      slug: result.slug,
      title: result.title,
      seoTitle: result.seoTitle,
      seoDescription: result.seoDescription,
      keywords: result.keywords,
      htmlContent: result.htmlContent,
      tableOfContents: result.tableOfContents,
      links: result.links,
      originalPdfName: originalName,
      originalPdfSize: fileSize,
      rawPdfBase64: base64,
      pageCount: result.pageCount,
      wordCount: result.wordCount,
      readingTimeMinutes: result.readingTimeMinutes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isIndexed: false,
      indexingStatus: 'pending',
    };

    setEditingPage(newPage);
    setModalInitialTab('preview');
    setIsModalOpen(true);
    showToast(`PDF parsed! ${result.links.length} links and ${result.tableOfContents.length} sections found.`);
  };

  // Handle batch publication from Bulk Upload
  const handleBatchPublished = (newPages: PublishedPdfPage[]) => {
    setPages((prev) => {
      const existingIds = new Set(prev.map((p) => p.id));
      const filteredNew = newPages.filter((p) => !existingIds.has(p.id));
      return [...filteredNew, ...prev];
    });
    showToast(`Batch of ${newPages.length} PDFs published live!`);
  };

  // Save / Update page
  const handleSavePage = async (pageToSave: PublishedPdfPage) => {
    const res = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pageToSave),
    });

    if (!res.ok) {
      throw new Error('Failed to save page');
    }

    const saved = await res.json();
    setPages((prev) => {
      const index = prev.findIndex((p) => p.id === saved.id || p.slug === saved.slug);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = saved;
        return updated;
      }
      return [saved, ...prev];
    });

    showToast(`Page published live at /p/${saved.slug}!`);
    setActiveTab('documents');
  };

  // Delete page
  const handleDeletePage = async (id: string) => {
    try {
      const res = await fetch(`/api/pages/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setPages((prev) => prev.filter((p) => p.id !== id));
        showToast('Document page deleted.');
      }
    } catch {
      showToast('Failed to delete page.');
    }
  };

  // Batch Delete pages
  const handleBatchDelete = async (ids: string[]) => {
    try {
      const res = await fetch('/api/pages/batch-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (res.ok) {
        const idSet = new Set(ids);
        setPages((prev) => prev.filter((p) => !idSet.has(p.id)));
        showToast(`${ids.length} documents deleted.`);
      }
    } catch {
      showToast('Failed to batch delete pages.');
    }
  };

  // Submit to Google Indexing
  const handleSubmitIndexing = async (pageId: string) => {
    try {
      const res = await fetch('/api/submit-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId }),
      });
      if (res.ok) {
        setPages((prev) =>
          prev.map((p) =>
            p.id === pageId
              ? { ...p, indexingStatus: 'submitted', isIndexed: true, lastSubmittedAt: new Date().toISOString() }
              : p
          )
        );
        showToast('Submitted for Googlebot indexation! Sitemap updated.');
      }
    } catch {
      showToast('Indexing request failed.');
    }
  };

  // Batch Submit to Google Indexing
  const handleBatchSubmitIndexing = async (pageIds: string[]) => {
    try {
      const idSet = new Set(pageIds);
      // Trigger sitemap ping
      await fetch('/api/submit-indexing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      setPages((prev) =>
        prev.map((p) =>
          idSet.has(p.id)
            ? { ...p, indexingStatus: 'submitted', isIndexed: true, lastSubmittedAt: new Date().toISOString() }
            : p
        )
      );
      showToast(`Submitted ${pageIds.length} pages to Googlebot crawler queue!`);
    } catch {
      showToast('Batch indexing request failed.');
    }
  };

  // Save Settings
  const handleSaveSettings = async (updated: Partial<AppSettings>) => {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings(data);
      showToast('Settings saved.');
    }
  };

  // Open modal in specific tab
  const handleOpenEdit = (page: PublishedPdfPage) => {
    setEditingPage(page);
    setModalInitialTab('preview');
    setIsModalOpen(true);
  };

  const handleOpenLinkAudit = (page: PublishedPdfPage) => {
    setEditingPage(page);
    setModalInitialTab('links');
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors selection:bg-blue-500 selection:text-white">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        settings={settings}
        pageCount={pages.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Metric Cards Banner */}
        <StatsOverview
          pages={pages}
          settings={settings}
          onNavigateToGsc={() => setActiveTab('gsc')}
          onNavigateToIndexing={() => setActiveTab('indexing')}
        />

        {/* Tab 1: Documents List */}
        {activeTab === 'documents' && (
          <DocumentsList
            pages={pages}
            onUploadClick={() => setActiveTab('upload')}
            onEdit={handleOpenEdit}
            onDelete={handleDeletePage}
            onBatchDelete={handleBatchDelete}
            onSubmitIndexing={handleSubmitIndexing}
            onBatchSubmitIndexing={handleBatchSubmitIndexing}
            onOpenLinkAudit={handleOpenLinkAudit}
          />
        )}

        {/* Tab 2: Upload Zone */}
        {activeTab === 'upload' && (
          <PdfUploadZone
            onConverted={handleConvertedPdf}
            onBatchPublished={handleBatchPublished}
            onNavigateToDocuments={() => setActiveTab('documents')}
          />
        )}

        {/* Tab 3: Google Search Console Verification */}
        {activeTab === 'gsc' && (
          <GscVerificationPanel
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}

        {/* Tab 4: Google Indexing Hub */}
        {activeTab === 'indexing' && (
          <IndexingHub
            pages={pages}
            settings={settings}
            onSubmitIndexing={handleSubmitIndexing}
          />
        )}

        {/* Tab 5: Settings */}
        {activeTab === 'settings' && (
          <SettingsPanel
            settings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}

      </main>

      {/* Editor & Preview Modal */}
      {editingPage && (
        <PageEditorModal
          page={editingPage}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setEditingPage(null);
          }}
          onSave={handleSavePage}
          initialTab={modalInitialTab}
        />
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-xs text-slate-500 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            © {new Date().getFullYear()} {settings.siteTitle}. Convert PDFs to Rich Semantic HTML with intact links & Google Search Console indexing.
          </div>
          <div className="flex items-center gap-4">
            <a href="/sitemap.xml" target="_blank" className="hover:text-blue-600 transition">sitemap.xml</a>
            <a href="/robots.txt" target="_blank" className="hover:text-blue-600 transition">robots.txt</a>
            <button onClick={() => setActiveTab('gsc')} className="hover:text-blue-600 transition">GSC Verification</button>
            <button onClick={() => setActiveTab('indexing')} className="hover:text-blue-600 transition">Google Indexing</button>
          </div>
        </div>
      </footer>

    </div>
  );
}
