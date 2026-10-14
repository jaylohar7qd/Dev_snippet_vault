'use client';

import { useSnippetStore } from '@/lib/store';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import {
  Code2,
  Hash,
  Star,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  ChevronDown,
} from 'lucide-react';
import { useState } from 'react';
import { SortOption, ViewMode, SUPPORTED_LANGUAGES } from '@/lib/types';
import { useDashboardUser } from '@/lib/dashboard-user';

export default function DashboardPage() {
  const user = useDashboardUser();
  const {
    filteredSnippets,
    stats,
    toggleFavorite,
    deleteSnippet,
    filters,
    setFilters,
    resetFilters,
    showToast,
  } = useSnippetStore();

  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const hasActiveFilters = filters.search || filters.language || filters.tag || filters.favoritesOnly;

  const handleCopy = () => {
    showToast('Code copied to clipboard!');
  };

  const handleDelete = () => {
    if (deleteId) {
      deleteSnippet(deleteId);
      setDeleteId(null);
    }
  };

  const statCards = [
    { label: 'Total Snippets', value: stats.total_snippets, icon: Code2, color: 'var(--accent)' },
    { label: 'Languages Used', value: stats.languages_used, icon: Hash, color: 'var(--info)' },
    { label: 'Favorites', value: stats.favorites, icon: Star, color: '#f59e0b' },
  ];

  return (
    <div className="page-transition" style={{ padding: '24px' }}>
      {/* Greeting */}
      <div className="mb-8">
        <h1
          className="text-2xl font-bold mb-1"
          style={{ color: 'var(--foreground)' }}
        >
          Welcome back,{' '}
          <span className="gradient-text">{user?.name || 'there'}</span>
        </h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
          Your knowledge, organized and ready to reuse.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="glass-card"
              style={{ padding: '20px' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--foreground-muted)',
                    fontWeight: 500,
                  }}
                >
                  {stat.label}
                </span>
                <div
                  className="flex items-center justify-center"
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    background: `${stat.color}15`,
                  }}
                >
                  <Icon size={18} style={{ color: stat.color }} />
                </div>
              </div>
              <div
                className="text-3xl font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                {stat.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            All Snippets
          </h2>
          <span
            style={{
              fontSize: '0.75rem',
              color: 'var(--foreground-muted)',
              background: 'var(--background-secondary)',
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              fontWeight: 600,
            }}
          >
            {filteredSnippets.length}
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-ghost flex items-center gap-1.5 ${hasActiveFilters ? '' : ''}`}
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              color: hasActiveFilters ? 'var(--accent)' : undefined,
              background: hasActiveFilters ? 'var(--accent-glow)' : undefined,
              border: hasActiveFilters ? '1px solid rgba(230, 126, 34, 0.2)' : undefined,
              borderRadius: 'var(--radius-md)',
            }}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasActiveFilters && (
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                }}
              />
            )}
          </button>

          {/* Sort */}
          <div className="relative">
            <select
              value={filters.sort}
              onChange={(e) => setFilters({ sort: e.target.value as SortOption })}
              className="input-field appearance-none cursor-pointer"
              style={{
                padding: '6px 30px 6px 10px',
                fontSize: '0.8rem',
                background: 'var(--background-secondary)',
                minWidth: 130,
              }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="title">By Title</option>
              <option value="language">By Language</option>
            </select>
            <ChevronDown
              size={14}
              style={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--foreground-muted)',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* View mode */}
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
                transition: 'all var(--transition-fast)',
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
                transition: 'all var(--transition-fast)',
              }}
              title="List view"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div
          className="flex flex-wrap items-center gap-3 mb-6 p-4 animate-slide-down"
          style={{
            background: 'var(--surface)',
            border: '1px solid var(--surface-border)',
            borderRadius: 'var(--radius-md)',
          }}
        >
          {/* Language filter */}
          <div className="relative">
            <select
              value={filters.language}
              onChange={(e) => setFilters({ language: e.target.value })}
              className="input-field appearance-none cursor-pointer"
              style={{
                padding: '6px 28px 6px 10px',
                fontSize: '0.8rem',
                minWidth: 140,
              }}
            >
              <option value="">All Languages</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', color: 'var(--foreground-muted)', pointerEvents: 'none' }}
            />
          </div>

          {/* Favorites only */}
          <button
            onClick={() => setFilters({ favoritesOnly: !filters.favoritesOnly })}
            className="flex items-center gap-1.5"
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${filters.favoritesOnly ? 'var(--accent)' : 'var(--surface-border)'}`,
              background: filters.favoritesOnly ? 'var(--accent-glow)' : 'transparent',
              color: filters.favoritesOnly ? 'var(--accent)' : 'var(--foreground-secondary)',
              cursor: 'pointer',
              fontWeight: filters.favoritesOnly ? 600 : 400,
            }}
          >
            <Star size={14} fill={filters.favoritesOnly ? 'var(--accent)' : 'none'} />
            Favorites
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="btn-ghost flex items-center gap-1"
              style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--error)' }}
            >
              <X size={14} />
              Clear Filters
            </button>
          )}
        </div>
      )}

      {/* Snippet Grid/List */}
      {filteredSnippets.length === 0 ? (
        <EmptyState
          icon={hasActiveFilters ? 'search' : 'snippets'}
          title={hasActiveFilters ? 'No matching snippets' : 'Create Your First Snippet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or search terms.'
              : 'Start building your code vault. Save, organize, and reuse your snippets anytime.'
          }
          actionLabel={hasActiveFilters ? undefined : 'Create Snippet'}
          actionHref={hasActiveFilters ? undefined : '/dashboard/new'}
          onAction={hasActiveFilters ? resetFilters : undefined}
        />
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4'
              : 'flex flex-col gap-3'
          }
        >
          {filteredSnippets.map((snippet) => (
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
