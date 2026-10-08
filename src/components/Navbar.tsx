import React from 'react';
import { 
  FileText, 
  UploadCloud, 
  Search, 
  Globe, 
  Settings, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import type { AppSettings } from '../types';

interface NavbarProps {
  activeTab: 'documents' | 'upload' | 'gsc' | 'indexing' | 'settings';
  setActiveTab: (tab: 'documents' | 'upload' | 'gsc' | 'indexing' | 'settings') => void;
  settings: AppSettings;
  pageCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  settings,
  pageCount,
}) => {
  const isGscVerified = Boolean(settings.googleSiteVerification && settings.googleSiteVerification.trim().length > 0);

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo and App Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('documents')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 dark:text-white text-base tracking-tight">
                  PDFtoWeb <span className="text-blue-600 dark:text-blue-400 font-extrabold">SEO</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                  Google Indexer
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Turn PDFs into rich semantic HTML pages with intact links
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('documents')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'documents'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Published Pages</span>
              <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full font-mono">
                {pageCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload PDF</span>
            </button>

            <button
              onClick={() => setActiveTab('gsc')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'gsc'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>GSC Verification</span>
              {isGscVerified ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-500" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('indexing')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'indexing'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Google Indexing</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </nav>

          {/* Action Links */}
          <div className="flex items-center gap-2">
            <a
              href="/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              title="Open dynamic XML Sitemap"
            >
              <span>sitemap.xml</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => setActiveTab('upload')}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Publish PDF</span>
            </button>
          </div>

        </div>

        {/* Mobile Navigation bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('documents')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'documents' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <FileText className="w-4 h-4" />
            <span>Pages</span>
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'upload' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload</span>
          </button>
          <button
            onClick={() => setActiveTab('gsc')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'gsc' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <Search className="w-4 h-4" />
            <span>GSC</span>
          </button>
          <button
            onClick={() => setActiveTab('indexing')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'indexing' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <Globe className="w-4 h-4" />
            <span>Indexing</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-2 ${activeTab === 'settings' ? 'text-blue-600 font-bold' : 'text-slate-500'}`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

      </div>
    </header>
  );
};
