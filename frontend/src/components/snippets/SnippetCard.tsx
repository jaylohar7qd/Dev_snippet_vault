'use client';

import Link from 'next/link';
import { Snippet, LANGUAGE_COLORS } from '@/lib/types';
import {
  Copy,
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Star,
  Clock,
  Globe,
  Lock,
} from 'lucide-react';
import { useState } from 'react';

interface SnippetCardProps {
  snippet: Snippet;
  onToggleFavorite?: (id: string) => void;
  onDelete?: (id: string) => void;
  onCopy?: (code: string) => void;
}

export function SnippetCard({ snippet, onToggleFavorite, onDelete, onCopy }: SnippetCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const langColor = LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS.other;
  const timeAgo = getTimeAgo(snippet.created_at);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    onCopy?.(snippet.code);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="glass-card group relative"
      style={{ padding: 0, overflow: 'hidden' }}
    >
      {/* Language Bar */}
      <div
        style={{
          height: 3,
          background: `linear-gradient(90deg, ${langColor}, ${langColor}88)`,
        }}
      />

      <div style={{ padding: '16px 20px' }}>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <Link
              href={`/dashboard/snippet/${snippet.id}`}
              className="text-base font-semibold hover:underline block truncate"
              style={{
                color: 'var(--foreground)',
                textDecoration: 'none',
                lineHeight: 1.4,
              }}
            >
              {snippet.title}
            </Link>
            <div className="flex items-center gap-2 mt-1.5">
              <span
                className="flex items-center gap-1.5"
                style={{
                  fontSize: '0.75rem',
                  color: langColor,
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: langColor,
                    display: 'inline-block',
                  }}
                />
                {snippet.language}
              </span>
              <span style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>•</span>
              <span
                className="flex items-center gap-1"
                style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}
              >
                <Clock size={12} />
                {timeAgo || 'recently'}
              </span>
              <span style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>•</span>
              {snippet.is_public ? (
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'var(--success)', fontSize: '0.7rem', fontWeight: 500 }}
                >
                  <Globe size={11} />
                  Public
                </span>
              ) : (
                <span
                  className="flex items-center gap-1"
                  style={{ color: 'var(--foreground-muted)', fontSize: '0.7rem', fontWeight: 500 }}
                >
                  <Lock size={11} />
                  Private
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onToggleFavorite?.(snippet.id)}
              className="btn-ghost"
              style={{ padding: 6 }}
              title="Toggle favorite"
            >
              <Star
                size={16}
                fill={snippet.is_favorite ? 'var(--accent)' : 'none'}
                color={snippet.is_favorite ? 'var(--accent)' : 'var(--foreground-muted)'}
              />
            </button>
            <button
              onClick={handleCopy}
              className="btn-ghost"
              style={{ padding: 6 }}
              title={copied ? 'Copied!' : 'Copy code'}
            >
              {copied ? (
                <span style={{ fontSize: '0.7rem', color: 'var(--success)', fontWeight: 600 }}>✓</span>
              ) : (
                <Copy size={16} />
              )}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="btn-ghost"
                style={{ padding: 6 }}
                title="More options"
              >
                <MoreHorizontal size={16} />
              </button>
              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 animate-scale-in"
                  style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--surface-border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    minWidth: 160,
                    zIndex: 50,
                    overflow: 'hidden',
                  }}
                >
                  <Link
                    href={`/dashboard/edit/${snippet.id}`}
                    className="flex items-center gap-2 px-3 py-2.5 transition-colors"
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--foreground)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Edit size={14} />
                    Edit
                  </Link>
                  <Link
                    href={`/dashboard/snippet/${snippet.id}`}
                    className="flex items-center gap-2 px-3 py-2.5 transition-colors"
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--foreground)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface-hover)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ExternalLink size={14} />
                    View Details
                  </Link>
                  <div style={{ borderTop: '1px solid var(--surface-border)' }} />
                  <button
                    onClick={() => {
                      onDelete?.(snippet.id);
                      setShowMenu(false);
                    }}
                    className="flex items-center gap-2 px-3 py-2.5 w-full transition-colors"
                    style={{
                      fontSize: '0.85rem',
                      color: 'var(--error)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(231, 76, 60, 0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Code Preview */}
        <div
          className="code-block mb-3"
          style={{
            maxHeight: 120,
            overflow: 'hidden',
            position: 'relative',
            fontSize: '0.8rem',
            padding: '12px',
          }}
        >
          <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            <code>{snippet.code.slice(0, 300)}{snippet.code.length > 300 ? '...' : ''}</code>
          </pre>
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: 40,
              background: 'linear-gradient(transparent, var(--code-bg))',
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {snippet.tags.slice(0, 5).map((tag) => (
            <span key={tag} className="tag-badge">
              #{tag}
            </span>
          ))}
          {snippet.tags.length > 5 && (
            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--foreground-muted)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              +{snippet.tags.length - 5} more
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 31536000) return `${Math.floor(seconds / 2592000)}mo ago`;
  return `${Math.floor(seconds / 31536000)}y ago`;
}
