'use client';

import { useSnippetStore } from '@/lib/store';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { Tag as TagIcon, Search, X, Hash } from 'lucide-react';
import { useState, useMemo } from 'react';

export default function TagsPage() {
  const { snippets, toggleFavorite, deleteSnippet, showToast } = useSnippetStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagSearch, setTagSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Compute tag statistics
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};

    snippets.forEach((snippet) => {
      snippet.tags.forEach((t) => {
        counts[t] = (counts[t] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([name, data]) => ({
        name,
        count: data,
      }))
      .sort((a, b) => b.count - a.count);
  }, [snippets]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return tagStats;
    const q = tagSearch.toLowerCase();
    return tagStats.filter((t) => t.name.toLowerCase().includes(q));
  }, [tagStats, tagSearch]);

  const activeSnippets = useMemo(() => {
    if (!selectedTag) return [];
    return snippets.filter((snippet) => snippet.tags.includes(selectedTag));
  }, [snippets, selectedTag]);

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
                background: 'rgba(230, 126, 34, 0.15)',
              }}
            >
              <TagIcon size={18} color="var(--accent)" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Tags Explorer
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
              {tagStats.length} Tags
            </span>
          </div>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
            Browse and filter code snippets by your custom tags.
          </p>
        </div>

        {/* Tag search */}
        <div className="relative w-full sm:w-64">
          <Search
            size={15}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50)',
              color: 'var(--foreground-muted)',
            }}
          />
          <input
            type="text"
            placeholder="Search tags..."
            value={tagSearch}
            onChange={(e) => setTagSearch(e.target.value)}
            className="input-field w-full"
            style={{ paddingLeft: '32px', fontSize: '0.85rem' }}
          />
        </div>
      </div>

      {/* Tag Badges Cloud */}
      <div
        className="glass-card mb-8"
        style={{ padding: '20px', borderRadius: 'var(--radius-lg)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2" style={{ color: 'var(--foreground-secondary)' }}>
            <Hash size={16} />
            Available Tags
          </h2>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="btn-ghost flex items-center gap-1"
              style={{ fontSize: '0.75rem', padding: '3px 8px', color: 'var(--accent)' }}
            >
              <X size={12} />
              Reset Selection
            </button>
          )}
        </div>

        {filteredTags.length === 0 ? (
          <p className="text-sm text-center py-4" style={{ color: 'var(--foreground-muted)' }}>
            No tags found matching &ldquo;{tagSearch}&rdquo;.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => {
              const isSelected = selectedTag === tag.name;
              return (
                <button
                  key={tag.name}
                  onClick={() => setSelectedTag(isSelected ? null : tag.name)}
                  className="flex items-center gap-1.5 transition-all duration-200"
                  style={{
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '0.82rem',
                    fontWeight: isSelected ? 600 : 500,
                    background: isSelected
                      ? 'var(--accent)'
                      : 'var(--background-secondary)',
                    color: isSelected ? 'white' : 'var(--foreground-secondary)',
                    border: isSelected
                      ? '1px solid var(--accent)'
                      : '1px solid var(--surface-border)',
                    cursor: 'pointer',
                  }}
                >
                  <span>#{tag.name}</span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      padding: '1px 6px',
                      borderRadius: 'var(--radius-full)',
                      background: isSelected
                        ? 'rgba(255, 255, 255, 0.25)'
                        : 'var(--surface-hover)',
                      color: isSelected ? 'white' : 'var(--foreground-muted)',
                      fontWeight: 600,
                      marginLeft: 2,
                    }}
                  >
                    {tag.count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Snippets for Selected Tag */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
            {selectedTag ? (
              <>
                Snippets tagged with <span className="gradient-text">#{selectedTag}</span>
              </>
            ) : (
              'Select a tag above to view snippets'
            )}
          </h2>
          {selectedTag && (
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
              {activeSnippets.length} {activeSnippets.length === 1 ? 'snippet' : 'snippets'}
            </span>
          )}
        </div>

        {selectedTag ? (
          activeSnippets.length === 0 ? (
            <EmptyState
              icon="snippets"
              title="No snippets for this tag"
              description="No active snippets currently use this tag."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onToggleFavorite={toggleFavorite}
                  onDelete={(id) => setDeleteId(id)}
                  onCopy={handleCopy}
                />
              ))}
            </div>
          )
        ) : (
          <div
            className="flex flex-col items-center justify-center p-12 text-center"
            style={{
              borderRadius: 'var(--radius-lg)',
              border: '1px dashed var(--surface-border)',
              background: 'var(--surface)',
            }}
          >
            <TagIcon size={32} style={{ color: 'var(--foreground-muted)', marginBottom: 12 }} />
            <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
              No tag selected
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)', maxWidth: 360 }}>
              Click on any tag badge above to explore all related code snippets, algorithms, and technical notes.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
