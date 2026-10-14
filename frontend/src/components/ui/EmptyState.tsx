'use client';

import { Plus, Search, FolderOpen, Code2, Star } from 'lucide-react';
import Link from 'next/link';

interface EmptyStateProps {
  icon?: 'snippets' | 'search' | 'collections' | 'favorites' | 'default';
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
}

const iconMap = {
  snippets: Code2,
  search: Search,
  collections: FolderOpen,
  favorites: Star,
  default: Plus,
};

export function EmptyState({
  icon = 'default',
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  const Icon = iconMap[icon];

  return (
    <div
      className="flex flex-col items-center justify-center text-center py-16 px-6 animate-fade-in"
    >
      <div
        className="flex items-center justify-center mb-5"
        style={{
          width: 64,
          height: 64,
          borderRadius: 'var(--radius-lg)',
          background: 'var(--accent-glow)',
          border: '1px solid rgba(230, 126, 34, 0.2)',
        }}
      >
        <Icon size={28} style={{ color: 'var(--accent)' }} />
      </div>
      <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
        {title}
      </h3>
      <p
        className="max-w-sm mb-6"
        style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}
      >
        {description}
      </p>
      {actionLabel && (actionHref ? (
        <Link href={actionHref} className="btn-primary">
          <Plus size={18} />
          {actionLabel}
        </Link>
      ) : onAction ? (
        <button onClick={onAction} className="btn-primary">
          <Plus size={18} />
          {actionLabel}
        </button>
      ) : null)}
    </div>
  );
}
