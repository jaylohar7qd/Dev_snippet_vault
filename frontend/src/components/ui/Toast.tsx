'use client';

import { useSnippetStore } from '@/lib/store';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

export function Toast() {
  const { toast, clearToast } = useSnippetStore();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle size={18} />,
    error: <XCircle size={18} />,
    info: <Info size={18} />,
  };

  const colors = {
    success: 'var(--success)',
    error: 'var(--error)',
    info: 'var(--info)',
  };

  return (
    <div
      className="fixed bottom-6 right-6 z-[9999] animate-slide-up"
      style={{
        maxWidth: 380,
      }}
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: 'var(--surface)',
          border: `1px solid ${colors[toast.type]}33`,
          borderRadius: 'var(--radius-md)',
          boxShadow: `var(--shadow-lg), 0 0 20px ${colors[toast.type]}22`,
          color: 'var(--foreground)',
        }}
      >
        <span style={{ color: colors[toast.type], flexShrink: 0 }}>{icons[toast.type]}</span>
        <p style={{ fontSize: '0.875rem', margin: 0, flex: 1 }}>{toast.message}</p>
        <button
          onClick={clearToast}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--foreground-muted)',
            padding: 4,
            flexShrink: 0,
          }}
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
