'use client';

import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useSnippetStore } from '@/lib/store';
import { ConfirmDeleteDialog } from '@/components/ui/ConfirmDeleteDialog';
import { LANGUAGE_COLORS } from '@/lib/types';
import {
  ArrowLeft,
  Copy,
  Edit,
  Trash2,
  Star,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';
import { useState, Suspense } from 'react';

function SnippetDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { getSnippet, toggleFavorite, deleteSnippet, snippets, showToast } = useSnippetStore();
  const [copied, setCopied] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const snippetId = params.id as string;
  const snippet = getSnippet(snippetId);

  if (!snippet) {
    return (
      <div className="page-transition flex flex-col items-center justify-center" style={{ padding: '60px 24px' }}>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
          Snippet not found
        </h2>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginBottom: 16 }}>
          The snippet you&apos;re looking for doesn&apos;t exist or has been deleted.
        </p>
        <Link href="/dashboard" className="btn-primary">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    showToast('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = () => {
    deleteSnippet(snippetId);
    router.push('/dashboard');
  };

  const langColor = LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS.other;

  // Find related snippets by language or tags
  const relatedSnippets = snippets
    .filter(
      (s) =>
        s.id !== snippet.id &&
        (s.language === snippet.language ||
          s.tags.some((t) => snippet.tags.includes(t)))
    )
    .slice(0, 3);

  const codeLines = snippet.code.split('\n');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="page-transition" style={{ padding: '24px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Back */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-6 transition-colors"
        style={{ color: 'var(--foreground-muted)', textDecoration: 'none', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>
            {snippet.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="flex items-center gap-1.5 text-sm font-semibold"
              style={{ color: langColor, textTransform: 'capitalize' }}
            >
              <span
                style={{ width: 10, height: 10, borderRadius: '50%', background: langColor }}
              />
              {snippet.language}
            </span>
            <span style={{ color: 'var(--foreground-muted)' }}>•</span>
            {snippet.is_public ? (
              <span className="flex items-center gap-1" style={{ color: 'var(--success)', fontSize: '0.85rem' }}>
                <Globe size={14} />
                Public
              </span>
            ) : (
              <span className="flex items-center gap-1" style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
                <Lock size={14} />
                Private
              </span>
            )}
            <span style={{ color: 'var(--foreground-muted)' }}>•</span>
            <span className="flex items-center gap-1" style={{ color: 'var(--foreground-muted)', fontSize: '0.85rem' }}>
              <Clock size={14} />
              {formatDate(snippet.created_at)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleFavorite(snippet.id)}
            className="btn-ghost"
            style={{ padding: 8 }}
            title={snippet.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star
              size={20}
              fill={snippet.is_favorite ? 'var(--accent)' : 'none'}
              color={snippet.is_favorite ? 'var(--accent)' : 'var(--foreground-muted)'}
            />
          </button>
          <Link
            href={`/dashboard/edit/${snippet.id}`}
            className="btn-secondary flex items-center gap-2"
            style={{ padding: '8px 16px', fontSize: '0.85rem', textDecoration: 'none' }}
          >
            <Edit size={16} />
            Edit
          </Link>
          <button
            onClick={() => setShowDelete(true)}
            className="btn-ghost"
            style={{ padding: '8px 12px', fontSize: '0.85rem', color: 'var(--error)' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Description */}
      {snippet.description && (
        <div className="mb-6">
          <p style={{ color: 'var(--foreground-secondary)', lineHeight: 1.7, fontSize: '0.95rem' }}>
            {snippet.description}
          </p>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {snippet.tags.map((tag) => (
          <span key={tag} className="tag-badge">
            #{tag}
          </span>
        ))}
      </div>

      {/* Code Block */}
      <div className="mb-8">
        <div
          style={{
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden',
            border: '1px solid var(--surface-border)',
          }}
        >
          {/* Header bar */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{
              background: 'var(--code-bg)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div className="flex items-center gap-1.5">
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
              <span
                className="ml-3"
                style={{ fontSize: '0.75rem', color: 'var(--code-line-number)', textTransform: 'capitalize' }}
              >
                {snippet.language} • {codeLines.length} lines
              </span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 transition-colors"
              style={{
                padding: '4px 12px',
                borderRadius: 'var(--radius-sm)',
                background: copied ? 'rgba(39, 174, 96, 0.15)' : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: 'pointer',
                color: copied ? 'var(--success)' : 'var(--code-text)',
                fontSize: '0.75rem',
                fontWeight: 500,
              }}
            >
              {copied ? '✓ Copied!' : <><Copy size={13} /> Copy Code</>}
            </button>
          </div>

          {/* Code content */}
          <div
            className="flex"
            style={{
              background: 'var(--code-bg)',
              overflowX: 'auto',
            }}
          >
            {/* Line numbers */}
            <div
              className="select-none text-right py-4 px-3"
              style={{
                minWidth: 50,
                fontSize: '0.85rem',
                lineHeight: '1.6',
                color: 'var(--code-line-number)',
                fontFamily: 'var(--font-mono)',
                borderRight: '1px solid rgba(255,255,255,0.04)',
                flexShrink: 0,
              }}
            >
              {codeLines.map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>
            {/* Code */}
            <pre
              className="flex-1 py-4 px-4"
              style={{
                margin: 0,
                fontSize: '0.85rem',
                lineHeight: '1.6',
                color: 'var(--code-text)',
                fontFamily: 'var(--font-mono)',
                overflowX: 'auto',
              }}
            >
              <code>{snippet.code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* Metadata */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
      >
        <div
          className="glass-card"
          style={{ padding: '16px 20px' }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: 4, fontWeight: 500 }}>
            Created
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
            {formatDate(snippet.created_at)}
          </div>
        </div>
        <div
          className="glass-card"
          style={{ padding: '16px 20px' }}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--foreground-muted)', marginBottom: 4, fontWeight: 500 }}>
            Last Updated
          </div>
          <div style={{ fontSize: '0.9rem', color: 'var(--foreground)' }}>
            {formatDate(snippet.updated_at)}
          </div>
        </div>
      </div>

      {/* Related Snippets */}
      {relatedSnippets.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Related Snippets
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {relatedSnippets.map((related) => (
              <Link
                key={related.id}
                href={`/dashboard/snippet/${related.id}`}
                className="glass-card block"
                style={{ padding: '16px', textDecoration: 'none' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: LANGUAGE_COLORS[related.language] || LANGUAGE_COLORS.other,
                    }}
                  />
                  <span
                    className="text-xs font-medium"
                    style={{ color: LANGUAGE_COLORS[related.language] || LANGUAGE_COLORS.other, textTransform: 'capitalize' }}
                  >
                    {related.language}
                  </span>
                </div>
                <h3 className="font-medium truncate mb-1" style={{ color: 'var(--foreground)', fontSize: '0.9rem' }}>
                  {related.title}
                </h3>
                <p className="truncate" style={{ color: 'var(--foreground-muted)', fontSize: '0.8rem' }}>
                  {related.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <ConfirmDeleteDialog
        open={showDelete}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  );
}

export default function SnippetDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-16" style={{ color: 'var(--foreground-muted)' }}>
          Loading snippet details...
        </div>
      }
    >
      <SnippetDetailContent />
    </Suspense>
  );
}
