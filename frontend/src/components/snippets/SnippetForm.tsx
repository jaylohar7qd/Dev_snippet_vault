'use client';

import { SUPPORTED_LANGUAGES, LANGUAGE_COLORS, CreateSnippetInput } from '@/lib/types';
import {
  Save,
  Code2,
  Type,
  FileText,
  Tag,
  Globe,
  Lock,
  Loader2,
  X,
  Sparkles,
} from 'lucide-react';
import { useState, useCallback } from 'react';
import { useSnippetStore } from '@/lib/store';

interface SnippetFormProps {
  initialData?: Partial<CreateSnippetInput> & { id?: string };
  onSubmit: (data: CreateSnippetInput) => Promise<void>;
  mode?: 'create' | 'edit';
}

export function SnippetForm({ initialData, onSubmit, mode = 'create' }: SnippetFormProps) {
  const { explainCode, showToast } = useSnippetStore();
  const [title, setTitle] = useState(initialData?.title || '');
  const [code, setCode] = useState(initialData?.code || '');
  const [language, setLanguage] = useState(initialData?.language || 'javascript');
  const [description, setDescription] = useState(initialData?.description || '');
  const [tags, setTags] = useState<string[]>(initialData?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [isPublic, setIsPublic] = useState(initialData?.is_public ?? false);
  const [submitting, setSubmitting] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const handleGenerateDescription = async () => {
    if (!code.trim() || generatingDescription) return;

    setGeneratingDescription(true);
    try {
      const explanation = await explainCode(code, language);
      setDescription(explanation);
      showToast('AI description generated.');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not generate an AI description.', 'error');
    } finally {
      setGeneratingDescription(false);
    }
  };

  const handleAddTag = useCallback(() => {
    const tag = tagInput.trim().toLowerCase().replace(/^#/, '');
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !code.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({
        title: title.trim(),
        code,
        language,
        description: description.trim(),
        tags,
        is_public: isPublic,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <form onSubmit={handleSubmit} id="snippet-form" className="page-transition">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-5">
          {/* Title */}
          <div>
            <label
              htmlFor="snippet-title"
              className="flex items-center gap-2 mb-2 text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              <Type size={16} style={{ color: 'var(--accent)' }} />
              Title
            </label>
            <input
              id="snippet-title"
              type="text"
              className="input-field"
              placeholder="Enter a snippet title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              style={{ fontSize: '1rem', padding: '12px 16px' }}
            />
          </div>

          {/* Language */}
          <div>
            <label
              htmlFor="snippet-language"
              className="flex items-center gap-2 mb-2 text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              <Code2 size={16} style={{ color: 'var(--accent)' }} />
              Language
            </label>
            <div className="relative">
              <select
                id="snippet-language"
                className="input-field appearance-none cursor-pointer"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  paddingRight: 40,
                  paddingLeft: 36,
                }}
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </option>
                ))}
              </select>
              <span
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: LANGUAGE_COLORS[language] || LANGUAGE_COLORS.other,
                }}
              />
            </div>
          </div>

          {/* Code Editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="snippet-code"
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                <FileText size={16} style={{ color: 'var(--accent)' }} />
                Code
              </label>
              <div className="flex items-center gap-3">
                <span
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--foreground-muted)',
                  }}
                >
                  {lineCount} lines • {code.length} chars
                </span>
              </div>
            </div>
            <div
              className="relative"
              style={{
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                border: '1px solid var(--surface-border)',
              }}
            >
              {/* Editor Header Bar */}
              <div
                className="flex items-center justify-between px-4 py-2"
                style={{
                  background: 'var(--code-bg)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div className="flex items-center gap-1.5">
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                  <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                </div>
                <span style={{ fontSize: '0.7rem', color: 'var(--code-line-number)', textTransform: 'capitalize' }}>
                  {language}
                </span>
              </div>
              <div className="flex" style={{ background: 'var(--code-bg)' }}>
                {/* Line Numbers */}
                <div
                  className="select-none text-right pr-3 py-4"
                  style={{
                    minWidth: 44,
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    color: 'var(--code-line-number)',
                    fontFamily: 'var(--font-mono)',
                    borderRight: '1px solid rgba(255,255,255,0.04)',
                    paddingLeft: 12,
                  }}
                >
                  {Array.from({ length: Math.max(lineCount, 1) }, (_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Code Textarea */}
                <textarea
                  id="snippet-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Paste your code here..."
                  required
                  spellCheck={false}
                  className="flex-1 resize-none outline-none"
                  style={{
                    background: 'transparent',
                    color: 'var(--code-text)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.85rem',
                    lineHeight: '1.6',
                    padding: '16px',
                    minHeight: 300,
                    border: 'none',
                    tabSize: 2,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.currentTarget.selectionStart;
                      const end = e.currentTarget.selectionEnd;
                      const newVal = code.substring(0, start) + '  ' + code.substring(end);
                      setCode(newVal);
                      setTimeout(() => {
                        e.currentTarget.selectionStart = e.currentTarget.selectionEnd = start + 2;
                      }, 0);
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <label
                htmlFor="snippet-description"
                className="flex items-center gap-2 text-sm font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                <FileText size={16} style={{ color: 'var(--accent)' }} />
                Description
                <span style={{ color: 'var(--foreground-muted)', fontWeight: 400 }}>(optional)</span>
              </label>
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={!code.trim() || generatingDescription || submitting}
                className="btn-secondary flex items-center gap-2"
                style={{
                  padding: '7px 10px',
                  fontSize: '0.8rem',
                  opacity: !code.trim() || generatingDescription || submitting ? 0.6 : 1,
                }}
              >
                {generatingDescription ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Sparkles size={14} />
                )}
                {generatingDescription ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              id="snippet-description"
              className="input-field resize-none"
              placeholder="Briefly describe what this snippet does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              style={{ lineHeight: 1.6 }}
            />
          </div>
        </div>

        {/* Right Panel */}
        <div className="lg:w-80 flex flex-col gap-5">
          {/* Tags */}
          <div
            className="glass-card"
            style={{ padding: '20px' }}
          >
            <label
              className="flex items-center gap-2 mb-3 text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              <Tag size={16} style={{ color: 'var(--accent)' }} />
              Tags
              <span style={{ color: 'var(--foreground-muted)', fontWeight: 400, fontSize: '0.75rem' }}>
                ({tags.length}/10)
              </span>
            </label>
            <div className="flex gap-2 mb-3">
              <input
                id="snippet-tag-input"
                type="text"
                className="input-field flex-1"
                placeholder="Add tag..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                style={{ fontSize: '0.85rem', padding: '8px 12px' }}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="btn-secondary"
                style={{ padding: '8px 14px', fontSize: '0.85rem' }}
                disabled={!tagInput.trim()}
              >
                Add
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span key={tag} className="tag-badge flex items-center gap-1.5">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-red-500 transition-colors"
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'inherit',
                        padding: 0,
                        display: 'flex',
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Visibility */}
          <div className="glass-card" style={{ padding: '20px' }}>
            <label
              className="flex items-center gap-2 mb-3 text-sm font-medium"
              style={{ color: 'var(--foreground)' }}
            >
              {isPublic ? (
                <Globe size={16} style={{ color: 'var(--success)' }} />
              ) : (
                <Lock size={16} style={{ color: 'var(--foreground-muted)' }} />
              )}
              Visibility
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                id="visibility-private"
                onClick={() => setIsPublic(false)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 transition-all"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${!isPublic ? 'var(--accent)' : 'var(--surface-border)'}`,
                  background: !isPublic ? 'var(--accent-glow)' : 'transparent',
                  color: !isPublic ? 'var(--accent)' : 'var(--foreground-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: !isPublic ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <Lock size={14} />
                Private
              </button>
              <button
                type="button"
                id="visibility-public"
                onClick={() => setIsPublic(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 transition-all"
                style={{
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isPublic ? 'var(--success)' : 'var(--surface-border)'}`,
                  background: isPublic ? 'rgba(39, 174, 96, 0.1)' : 'transparent',
                  color: isPublic ? 'var(--success)' : 'var(--foreground-secondary)',
                  fontSize: '0.85rem',
                  fontWeight: isPublic ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <Globe size={14} />
                Public
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            id="snippet-submit-btn"
            className="btn-primary w-full"
            disabled={!title.trim() || !code.trim() || submitting}
            style={{
              padding: '14px 24px',
              fontSize: '0.95rem',
              opacity: !title.trim() || !code.trim() || submitting ? 0.6 : 1,
            }}
          >
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                {mode === 'create' ? 'Saving...' : 'Updating...'}
              </>
            ) : (
              <>
                <Save size={18} />
                {mode === 'create' ? 'Save Snippet' : 'Update Snippet'}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
