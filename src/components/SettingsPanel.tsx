import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  Globe, 
  ShieldCheck, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import type { AppSettings } from '../types';

interface SettingsPanelProps {
  settings: AppSettings;
  onSaveSettings: (updated: Partial<AppSettings>) => Promise<void>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSaveSettings,
}) => {
  const [formData, setFormData] = useState<AppSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSaveSettings(formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Site SEO & Publisher Configuration
            </h2>
            <p className="text-xs text-slate-500">
              Control global meta tags, publisher schema, and canonical URLs.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Site & Publisher Title
            </label>
            <input
              type="text"
              value={formData.siteTitle}
              onChange={(e) => setFormData({ ...formData, siteTitle: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Appears in OpenGraph sitename, Schema.org publisher, and header navigation.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Site Default Meta Description
            </label>
            <textarea
              rows={3}
              value={formData.siteDescription}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Custom Canonical Domain (Optional)
            </label>
            <input
              type="text"
              placeholder={`e.g. ${window.location.origin} or https://mycustomdocs.com`}
              value={formData.customDomain}
              onChange={(e) => setFormData({ ...formData, customDomain: e.target.value })}
              className="w-full px-3.5 py-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Leave blank to automatically use current host domain.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
              Google Search Console Verification Token / Tag
            </label>
            <input
              type="text"
              value={formData.googleSiteVerification}
              onChange={(e) => setFormData({ ...formData, googleSiteVerification: e.target.value })}
              className="w-full px-3.5 py-2.5 font-mono bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-blue-500/20"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
            {success && (
              <span className="ml-3 text-emerald-600 font-semibold inline-flex items-center gap-1">
                <Check className="w-4 h-4" />
                Settings updated successfully!
              </span>
            )}
          </div>

        </form>
      </div>

    </div>
  );
};
