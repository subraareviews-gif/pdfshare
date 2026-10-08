import React, { useState } from 'react';
import { 
  Search, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  Copy, 
  Check, 
  Sparkles, 
  HelpCircle,
  ShieldCheck,
  Globe,
  Loader2
} from 'lucide-react';
import type { AppSettings } from '../types';

interface GscVerificationPanelProps {
  settings: AppSettings;
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
}

export const GscVerificationPanel: React.FC<GscVerificationPanelProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [inputTag, setInputTag] = useState(settings.googleSiteVerification || '');
  const [htmlFileName, setHtmlFileName] = useState(settings.googleHtmlFileName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    verified: boolean;
    token?: string;
    renderedMetaTag?: string;
    liveUrlsVerified?: string[];
    message?: string;
  } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const cleanToken = (input: string) => {
    const trimmed = input.trim();
    const metaMatch = trimmed.match(/content=["']([^"']+)["']/i);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1].trim();
    }
    return trimmed;
  };

  const handleSaveAndTest = async () => {
    setIsSaving(true);
    setIsVerifying(true);
    setVerificationResult(null);

    const token = cleanToken(inputTag);

    try {
      // 1. Save settings
      await onSaveSettings({
        googleSiteVerification: token,
        googleHtmlFileName: htmlFileName.trim(),
      });

      // 2. Run live verification check against the backend
      const res = await fetch('/api/verify-gsc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleSiteVerification: token }),
      });

      const data = await res.json();
      setVerificationResult(data);
    } catch (err: any) {
      setVerificationResult({
        verified: false,
        message: err.message || 'Verification check failed',
      });
    } finally {
      setIsSaving(false);
      setIsVerifying(false);
    }
  };

  const currentToken = cleanToken(inputTag || settings.googleSiteVerification);
  const generatedMetaTag = currentToken
    ? `<meta name="google-site-verification" content="${currentToken}" />`
    : '';

  const siteOrigin = window.location.origin;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-800/80 text-blue-200 text-xs font-semibold mb-3 border border-blue-700">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Google Search Console Ownership Verification</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Verify Site & Pages in Google Search Console
          </h2>
          <p className="text-sm text-blue-100/90 mt-2 leading-relaxed">
            Google Search Console requires adding a verification meta tag to your header or uploading an HTML file. This app automatically embeds your verification code into the <code className="bg-blue-950/60 px-1.5 py-0.5 rounded text-amber-300 font-mono text-xs">&lt;head&gt;</code> of the homepage and every single published PDF page.
          </p>
        </div>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Option 1: HTML Tag Verification (Recommended)</span>
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Paste either the full Google meta tag or just the verification string provided by Google Search Console.
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
              Google Site Verification Code or Full Meta Tag:
            </label>
            <div className="relative">
              <input
                type="text"
                value={inputTag}
                onChange={(e) => setInputTag(e.target.value)}
                placeholder='e.g. <meta name="google-site-verification" content="dBZ4_k9..." /> or just dBZ4_k9...'
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Extracted verification token: <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{currentToken || '(None yet)'}</span>
            </p>
          </div>

          {/* Rendered tag preview */}
          {generatedMetaTag && (
            <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl font-mono text-xs flex items-center justify-between gap-4 shadow-inner">
              <code className="text-emerald-400 truncate">{generatedMetaTag}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(generatedMetaTag);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] shrink-0 transition"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Tag</span>
              </button>
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleSaveAndTest}
              disabled={isSaving || isVerifying || !inputTag.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20"
            >
              {isVerifying ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying live &lt;head&gt; tag...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save & Test Live Verification</span>
                </>
              )}
            </button>

            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold transition"
            >
              <span>Open Google Search Console</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Verification Result Feedback */}
          {verificationResult && (
            <div className={`mt-4 p-5 rounded-2xl border text-xs leading-relaxed ${
              verificationResult.verified
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 text-red-900 dark:text-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {verificationResult.verified ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-2">
                  <p className="font-bold text-sm">
                    {verificationResult.verified ? 'Verification Tag Active in Header!' : 'Verification Check Failed'}
                  </p>
                  <p>{verificationResult.message}</p>
                  {verificationResult.liveUrlsVerified && (
                    <div className="mt-2 text-[11px] space-y-1">
                      <span className="font-semibold block">Live Verified Endpoints:</span>
                      {verificationResult.liveUrlsVerified.map((u, i) => (
                        <div key={i} className="font-mono text-blue-600 dark:text-blue-400">
                          ✓ {u}
                        </div>
                      ))}
                    </div>
                  )}
                  {verificationResult.verified && (
                    <div className="mt-3 p-3 bg-white/70 dark:bg-slate-900/70 rounded-xl border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium">
                      👉 Next Step: Switch to Google Search Console and click <strong>"Verify"</strong>. Googlebot will read this tag immediately!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Option 2: HTML File Verification */}
        <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
            Option 2: Google HTML File Verification (Alternative)
          </h4>
          <p className="text-xs text-slate-500 mb-3">
            If Google requests downloading a file named like <code className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">google1234567890abcdef.html</code>, paste the filename below:
          </p>
          <div className="flex items-center gap-3 max-w-md">
            <input
              type="text"
              value={htmlFileName}
              onChange={(e) => setHtmlFileName(e.target.value)}
              placeholder="e.g. google1234567890abcdef.html"
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {htmlFileName && (
              <a
                href={`/${htmlFileName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-xl transition shrink-0"
              >
                Test /{htmlFileName} ↗
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Step by Step Walkthrough */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <span>Step-by-Step Google Search Console Setup Guide</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">1</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Open GSC Portal</h5>
            <p className="text-slate-500 leading-relaxed">
              Visit Google Search Console and click <strong>"Add Property"</strong>.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">2</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Choose URL Prefix</h5>
            <p className="text-slate-500 leading-relaxed">
              Enter your site URL: <span className="font-mono text-blue-600 dark:text-blue-400 break-all">{siteOrigin}</span>
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">3</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Copy HTML Tag</h5>
            <p className="text-slate-500 leading-relaxed">
              Under <em>"Other verification methods"</em>, choose <strong>HTML tag</strong> and copy the code.
            </p>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">4</div>
            <h5 className="font-bold text-slate-800 dark:text-slate-200">Save & Click Verify</h5>
            <p className="text-slate-500 leading-relaxed">
              Paste the tag in the box above, click <strong>"Save & Test"</strong>, then press <strong>Verify</strong> in GSC.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
};
