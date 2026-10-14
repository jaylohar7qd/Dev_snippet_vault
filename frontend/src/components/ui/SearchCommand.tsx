'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Star, Hash, ArrowRight, Command } from 'lucide-react';
import { useSnippetStore } from '@/lib/store';
import { LANGUAGE_COLORS } from '@/lib/types';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { snippets } = useSnippetStore();

  // Ctrl/Cmd + K to open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => {
          const next = !prev;
          if (next) {
            setQuery('');
            setSelectedIndex(0);
            setTimeout(() => inputRef.current?.focus(), 50);
          }
          return next;
        });
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const results = query.trim()
    ? snippets.filter(
        (s) =>
          s.title.toLowerCase().includes(query.toLowerCase()) ||
          s.language.toLowerCase().includes(query.toLowerCase()) ||
          s.tags.some((t) => t.toLowerCase().includes(query.toLowerCase())) ||
          s.description?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 8)
    : snippets.slice(0, 5);

  const handleSelect = useCallback(
    (id: string) => {
      setOpen(false);
      router.push(`/dashboard/snippet/${id}`);
    },
    [router]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex].id);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh] animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="animate-scale-in w-full"
        style={{
          maxWidth: 560,
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lg)',
          overflow: 'hidden',
          margin: '0 16px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          className="flex items-center gap-3 px-4"
          style={{ borderBottom: '1px solid var(--surface-border)' }}
        >
          <Search size={18} style={{ color: 'var(--foreground-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search snippets, code, tags..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--foreground)',
              fontSize: '0.95rem',
              padding: '14px 0',
            }}
          />
          <kbd
            style={{
              fontSize: '0.7rem',
              padding: '2px 6px',
              borderRadius: 4,
              background: 'var(--background-secondary)',
              border: '1px solid var(--surface-border)',
              color: 'var(--foreground-muted)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px' }}>
          {results.length === 0 ? (
            <div className="py-8 text-center" style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem' }}>
              No snippets found for &quot;{query}&quot;
            </div>
          ) : (
            <>
              <div
                className="px-3 py-1.5 mb-1"
                style={{ fontSize: '0.7rem', color: 'var(--foreground-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}
              >
                {query ? `Results (${results.length})` : 'Recent Snippets'}
              </div>
              {results.map((snippet, index) => (
                <button
                  key={snippet.id}
                  onClick={() => handleSelect(snippet.id)}
                  className="flex items-center gap-3 w-full text-left transition-colors"
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    background: index === selectedIndex ? 'var(--accent-glow)' : 'transparent',
                    border: index === selectedIndex ? '1px solid rgba(230, 126, 34, 0.2)' : '1px solid transparent',
                    color: 'var(--foreground)',
                    cursor: 'pointer',
                    fontSize: '0.875rem',
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: LANGUAGE_COLORS[snippet.language] || LANGUAGE_COLORS.other,
                      flexShrink: 0,
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{snippet.title}</div>
                    <div className="flex items-center gap-2 mt-0.5" style={{ color: 'var(--foreground-muted)', fontSize: '0.75rem' }}>
                      <span style={{ textTransform: 'capitalize' }}>{snippet.language}</span>
                      {snippet.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="flex items-center gap-0.5">
                          <Hash size={10} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  {snippet.is_favorite && (
                    <Star size={14} fill="var(--accent)" color="var(--accent)" style={{ flexShrink: 0 }} />
                  )}
                  <ArrowRight size={14} style={{ color: 'var(--foreground-muted)', flexShrink: 0 }} />
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2.5"
          style={{
            borderTop: '1px solid var(--surface-border)',
            fontSize: '0.7rem',
            color: 'var(--foreground-muted)',
          }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--background-secondary)', border: '1px solid var(--surface-border)' }}>↑↓</kbd> Navigate</span>
            <span className="flex items-center gap-1"><kbd style={{ padding: '1px 4px', borderRadius: 3, background: 'var(--background-secondary)', border: '1px solid var(--surface-border)' }}>↵</kbd> Open</span>
          </div>
          <span className="flex items-center gap-1">
            <Command size={10} /> K to toggle
          </span>
        </div>
      </div>
    </div>
  );
}
