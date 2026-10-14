'use client';

import { useState } from 'react';
import { useSnippetStore } from '@/lib/store';
import { useTheme } from 'next-themes';
import {
  Settings as SettingsIcon,
  User,
  Code2,
  Download,
  Check,
  Sun,
  Moon,
  Laptop,
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/lib/types';
import { useDashboardUser } from '@/lib/dashboard-user';

export default function SettingsPage() {
  const { snippets, showToast, clearAllSnippets } = useSnippetStore();
  const { theme, setTheme } = useTheme();
  const user = useDashboardUser();

  // Editor settings
  const [defaultLang, setDefaultLang] = useState('typescript');
  const [tabSize, setTabSize] = useState('2');
  const [wordWrap, setWordWrap] = useState(true);

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Settings saved successfully!');
  };

  // Export data
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snippets, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `snippetvault-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast(`Exported ${snippets.length} snippets to JSON`);
  };

  return (
    <div className="page-transition max-w-4xl" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <div
          className="flex items-center justify-center"
          style={{
            width: 32,
            height: 32,
            borderRadius: 'var(--radius-md)',
            background: 'rgba(230, 126, 34, 0.15)',
          }}
        >
          <SettingsIcon size={18} color="var(--accent)" />
        </div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Vault Settings
        </h1>
      </div>
      <p className="mb-8" style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
        View your account details, manage editor preferences, and export your data.
      </p>

      <form onSubmit={handleSave} className="flex flex-col gap-8">
        {/* Profile Card */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-2 mb-4">
            <User size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Developer Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                Full Name
              </label>
              <p className="input-field w-full text-sm">{user?.name ?? ''}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                Email Address
              </label>
              <p className="input-field w-full text-sm">{user?.email ?? ''}</p>
            </div>
          </div>
        </div>

        {/* Editor & Appearance */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-2 mb-4">
            <Code2 size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Editor & Appearance
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                Default Language
              </label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className="input-field w-full text-sm"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                Indent Size
              </label>
              <select
                value={tabSize}
                onChange={(e) => setTabSize(e.target.value)}
                className="input-field w-full text-sm"
              >
                <option value="2">2 spaces</option>
                <option value="4">4 spaces</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                Theme Mode
              </label>
              <div
                className="flex"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--surface-border)',
                  overflow: 'hidden',
                }}
              >
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className="flex-1 flex items-center justify-center py-2"
                  style={{
                    background: theme === 'dark' ? 'var(--accent)' : 'var(--background-secondary)',
                    color: theme === 'dark' ? 'white' : 'var(--foreground-muted)',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  title="Dark theme"
                >
                  <Moon size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className="flex-1 flex items-center justify-center py-2"
                  style={{
                    background: theme === 'light' ? 'var(--accent)' : 'var(--background-secondary)',
                    color: theme === 'light' ? 'white' : 'var(--foreground-muted)',
                    border: 'none',
                    borderLeft: '1px solid var(--surface-border)',
                    cursor: 'pointer',
                  }}
                  title="Light theme"
                >
                  <Sun size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className="flex-1 flex items-center justify-center py-2"
                  style={{
                    background: theme === 'system' ? 'var(--accent)' : 'var(--background-secondary)',
                    color: theme === 'system' ? 'white' : 'var(--foreground-muted)',
                    border: 'none',
                    borderLeft: '1px solid var(--surface-border)',
                    cursor: 'pointer',
                  }}
                  title="System theme"
                >
                  <Laptop size={15} />
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={wordWrap}
              onChange={(e) => setWordWrap(e.target.checked)}
              className="w-4 h-4 rounded cursor-pointer accent-[#e67e22]"
            />
            <span className="text-xs" style={{ color: 'var(--foreground)' }}>
              Enable code line wrapping in snippet previews
            </span>
          </label>
        </div>

        {/* Export & Data Management */}
        <div className="glass-card" style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}>
          <div className="flex items-center gap-2 mb-2">
            <Download size={18} style={{ color: 'var(--accent)' }} />
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Data Export & Backup
            </h2>
          </div>
          <p className="text-xs mb-4" style={{ color: 'var(--foreground-muted)' }}>
            Export your entire snippet vault to standard JSON format for offline backup or migration to backend database.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleExportJSON}
              className="btn-secondary flex items-center gap-2 text-xs"
              style={{ padding: '8px 16px' }}
            >
              <Download size={14} />
              Export Vault ({snippets.length} snippets)
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to delete all snippets and start completely fresh?')) {
                  clearAllSnippets();
                }
              }}
              className="btn-ghost flex items-center gap-1.5 text-xs"
              style={{ padding: '8px 16px', color: 'var(--error)' }}
            >
              Clear Entire Vault
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <button
            type="submit"
            className="btn-primary flex items-center gap-2"
            style={{ padding: '10px 24px', fontSize: '0.9rem' }}
          >
            <Check size={16} />
            Save Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
