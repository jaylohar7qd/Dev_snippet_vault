'use client';

import { useSnippetStore } from '@/lib/store';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { Star, LayoutGrid, List, Search } from 'lucide-react';
import { useState, useMemo } from 'react';
import { ViewMode } from '@/lib/types';

export default function FavoritesPage() {
  const { snippets, toggleFavorite, deleteSnippet, showToast } = useSnippetStore();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const favoriteSnippets = useMemo(() => {
    return snippets
      .filter((s) => s.is_favorite)
      .filter((s) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
          s.title.toLowerCase().includes(q) ||
          s.code.toLowerCase().includes(q) ||
          s.language.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q))
        );
      });
  }, [snippets, searchQuery]);

  const handleCopy = () => {
    showToast('Code copied to clipboard!');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteSnippet(deleteId);
      setDeleteId(null);
    }
  };

  return (
    <div className="page-transition" style={{ padding: '24px' }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="flex items-center justify-center"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'rgba(245, 158, 11, 0.15)',
              }}
            >
              <Star size={18} color="#f59e0b" fill="#f59e0b" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Starred Snippets
            </h1>
            <span
              style={{
                fontSize: '0.8rem',
                color: 'var(--foreground-muted)',
                background: 'var(--background-secondary)',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 600,
              }}
            >
              {favoriteSnippets.length}
            </span>
          </div>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
            Quick access to your most frequently used and starred code snippets.
          </p>
        </div>

        {/* View Mode & Search */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--foreground-muted)',
              }}
            />
            <input
              type="text"
              placeholder="Search favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field w-full"
              style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
            />
          </div>

          <div
            className="flex"
            style={{
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--surface-border)',
              overflow: 'hidden',
            }}
          >
            <button
              onClick={() => setViewMode('grid')}
              className="flex items-center justify-center"
              style={{
                width: 34,
                height: 34,
                background: viewMode === 'grid' ? 'var(--accent-glow)' : 'var(--background-secondary)',
                color: viewMode === 'grid' ? 'var(--accent)' : 'var(--foreground-muted)',
                border: 'none',
                cursor: 'pointer',
              }}
              title="Grid view"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className="flex items-center justify-center"
              style={{
                width: 34,
                height: 34,
                background: viewMode === 'list' ? 'var(--accent-glow)' : 'var(--background-secondary)',
                color: viewMode === 'list' ? 'var(--accent)' : 'var(--foreground-muted)',
                border: 'none',
                borderLeft: '1px solid var(--surface-border)',
                cursor: 'pointer',
              }}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Snippet Grid */}
      {favoriteSnippets.length === 0 ? (
        <EmptyState
          icon="favorites"
          title={searchQuery ? 'No matching favorites' : 'No favorite snippets yet'}
          description={
            searchQuery
              ? 'Try adjusting your search terms.'
              : 'Click the star icon on any snippet in your vault to save it here for fast access.'
          }
          actionLabel={searchQuery ? 'Clear Search' : 'Browse All Snippets'}
          actionHref={searchQuery ? undefined : '/dashboard'}
          onAction={searchQuery ? () => setSearchQuery('') : undefined}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {favoriteSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              onToggleFavorite={toggleFavorite}
              onDelete={(id) => setDeleteId(id)}
              onCopy={handleCopy}
            />
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
