'use client';

import { useSnippetStore } from '@/lib/store';
import { SnippetCard } from '@/components/snippets/SnippetCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { COLLECTION_COLORS, Collection } from '@/lib/types';
import {
  FolderOpen,
  Plus,
  Edit2,
  Trash2,
  Code2,
  X,
  Calendar,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export default function CollectionsPage() {
  const {
    collections,
    snippets,
    addCollection,
    updateCollection,
    deleteCollection,
    toggleFavorite,
    deleteSnippet,
    showToast,
  } = useSnippetStore();

  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteSnippetId, setDeleteSnippetId] = useState<string | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState(COLLECTION_COLORS[0]);

  // Snippet counts per collection
  const collectionSnippetCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    snippets.forEach((s) => {
      if (s.collection_id) {
        counts[s.collection_id] = (counts[s.collection_id] || 0) + 1;
      }
    });
    return counts;
  }, [snippets]);

  // Active collection snippets
  const activeSnippets = useMemo(() => {
    if (!selectedCollectionId) return [];
    return snippets.filter((s) => s.collection_id === selectedCollectionId);
  }, [snippets, selectedCollectionId]);

  const selectedCollection = collections.find((c) => c.id === selectedCollectionId);

  const openCreateModal = () => {
    setEditingCollection(null);
    setFormName('');
    setFormDescription('');
    setFormColor(COLLECTION_COLORS[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (col: Collection, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCollection(col);
    setFormName(col.name);
    setFormDescription(col.description || '');
    setFormColor(col.color);
    setIsModalOpen(true);
  };

  const handleSaveCollection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast('Collection name is required', 'error');
      return;
    }

    try {
      if (editingCollection) {
        await updateCollection(editingCollection.id, {
          name: formName.trim(),
          description: formDescription.trim(),
          color: formColor,
        });
      } else {
        const created = await addCollection(formName.trim(), formDescription.trim(), formColor);
        setSelectedCollectionId(created.id);
      }

      setIsModalOpen(false);
    } catch {
      // error is already surfaced to the user via toast
    }
  };

  const handleDeleteCollection = async () => {
    if (deleteTargetId) {
      if (selectedCollectionId === deleteTargetId) {
        setSelectedCollectionId(null);
      }
      try {
        await deleteCollection(deleteTargetId);
      } catch {
        // error is already surfaced to the user via toast
      }
      setDeleteTargetId(null);
    }
  };

  const handleDeleteSnippet = async () => {
    if (deleteSnippetId) {
      try {
        await deleteSnippet(deleteSnippetId);
      } catch {
        // error is already surfaced to the user via toast
      }
      setDeleteSnippetId(null);
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
              <FolderOpen size={18} color="var(--accent)" />
            </div>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Collections
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
              {collections.length}
            </span>
          </div>
          <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem' }}>
            Group related code snippets into custom technical workspaces and projects.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="btn-primary flex items-center gap-2"
          style={{ padding: '8px 16px', fontSize: '0.875rem' }}
        >
          <Plus size={16} />
          New Collection
        </button>
      </div>

      {/* Collections Grid */}
      {collections.length === 0 ? (
        <EmptyState
          icon="snippets"
          title="No collections yet"
          description="Create your first collection to organize snippets by project, architecture, or tech stack."
          actionLabel="Create Collection"
          onAction={openCreateModal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {collections.map((col) => {
            const count = collectionSnippetCounts[col.id] || 0;
            const isSelected = selectedCollectionId === col.id;

            return (
              <div
                key={col.id}
                onClick={() => setSelectedCollectionId(isSelected ? null : col.id)}
                className="glass-card flex flex-col justify-between transition-all duration-200 cursor-pointer"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-lg)',
                  border: isSelected
                    ? `2px solid ${col.color}`
                    : '1px solid var(--surface-border)',
                  background: isSelected ? 'var(--surface-hover)' : 'var(--surface)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Color accent bar */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: col.color,
                  }}
                />

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: col.color,
                        }}
                      />
                      <h3 className="font-semibold text-base truncate" style={{ color: 'var(--foreground)' }}>
                        {col.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => openEditModal(col, e)}
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--foreground-muted)' }}
                        title="Edit collection"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTargetId(col.id);
                        }}
                        className="btn-ghost"
                        style={{ padding: '6px', color: 'var(--error)' }}
                        title="Delete collection"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <p
                    className="text-xs line-clamp-2 mb-4"
                    style={{ color: 'var(--foreground-muted)', minHeight: 32 }}
                  >
                    {col.description || 'No description provided.'}
                  </p>
                </div>

                <div
                  className="flex items-center justify-between pt-3 text-xs"
                  style={{
                    borderTop: '1px solid var(--surface-border)',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  <span className="flex items-center gap-1.5 font-medium">
                    <Code2 size={13} style={{ color: col.color }} />
                    {count} {count === 1 ? 'snippet' : 'snippets'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {col.created_at.slice(0, 10)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Snippets in Selected Collection */}
      {selectedCollection && (
        <div className="mt-8 pt-6" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2">
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: selectedCollection.color,
                  }}
                />
                <h2 className="text-xl font-bold" style={{ color: 'var(--foreground)' }}>
                  {selectedCollection.name}
                </h2>
              </div>
              <p className="text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                {selectedCollection.description || 'Snippets in this collection'}
              </p>
            </div>

            <button
              onClick={() => setSelectedCollectionId(null)}
              className="btn-ghost flex items-center gap-1 text-xs"
              style={{ color: 'var(--foreground-muted)' }}
            >
              <X size={14} />
              Close View
            </button>
          </div>

          {activeSnippets.length === 0 ? (
            <EmptyState
              icon="snippets"
              title="No snippets in this collection"
              description="Add snippets to this collection by choosing this collection when creating or editing a snippet."
              actionLabel="Add Snippet"
              actionHref="/dashboard/new"
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {activeSnippets.map((snippet) => (
                <SnippetCard
                  key={snippet.id}
                  snippet={snippet}
                  onToggleFavorite={toggleFavorite}
                  onDelete={(id) => setDeleteSnippetId(id)}
                  onCopy={() => showToast('Code copied to clipboard!')}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Collection Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.65)', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="glass-card w-full max-w-md animate-scale-in"
            style={{ padding: '24px', borderRadius: 'var(--radius-lg)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>
                {editingCollection ? 'Edit Collection' : 'Create New Collection'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveCollection} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                  Collection Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Next.js Architecture, Cloud Ops"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="input-field w-full text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: 'var(--foreground-secondary)' }}>
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="What code or topics are stored here?"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="input-field w-full text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                  Accent Color
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {COLLECTION_COLORS.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFormColor(c)}
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: c,
                        border: formColor === c ? '3px solid white' : '2px solid transparent',
                        boxShadow: formColor === c ? '0 0 8px rgba(0,0,0,0.4)' : 'none',
                        cursor: 'pointer',
                        transform: formColor === c ? 'scale(1.15)' : 'scale(1)',
                        transition: 'transform 0.15s ease',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="btn-secondary text-sm"
                  style={{ padding: '8px 16px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm"
                  style={{ padding: '8px 20px' }}
                >
                  {editingCollection ? 'Save Changes' : 'Create Collection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Collection Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteTargetId}
        title="Delete Collection?"
        message="Are you sure you want to delete this collection? Snippets inside it will NOT be deleted, but their association will be cleared."
        onConfirm={handleDeleteCollection}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Delete Snippet Confirmation */}
      <ConfirmDeleteDialog
        open={!!deleteSnippetId}
        onConfirm={handleDeleteSnippet}
        onCancel={() => setDeleteSnippetId(null)}
      />
    </div>
  );
}
