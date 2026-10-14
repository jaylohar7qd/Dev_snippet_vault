'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  message?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title = 'Delete Snippet',
  description,
  message,
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  const displayDescription = description || message || 'Are you sure you want to delete this snippet? This action cannot be undone.';
  const [deleting, setDeleting] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setDeleting(true);
    onConfirm();
    setDeleting(false);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in"
      style={{ background: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}
      onClick={onCancel}
    >
      <div
        className="animate-scale-in"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--surface-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '24px',
          maxWidth: 420,
          width: '90%',
          boxShadow: 'var(--shadow-lg)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4 mb-4">
          <div
            className="flex items-center justify-center flex-shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-md)',
              background: 'rgba(231, 76, 60, 0.1)',
            }}
          >
            <AlertTriangle size={22} style={{ color: 'var(--error)' }} />
          </div>
          <div className="flex-1">
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: 'var(--foreground)' }}
            >
              {title}
            </h3>
            <p style={{ color: 'var(--foreground-muted)', fontSize: '0.875rem', lineHeight: 1.6 }}>
              {displayDescription}
            </p>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--foreground-muted)',
              padding: 4,
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onCancel} className="btn-secondary" style={{ padding: '8px 20px' }}>
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={deleting}
            className="btn-danger"
            style={{ padding: '8px 20px', opacity: deleting ? 0.7 : 1 }}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
