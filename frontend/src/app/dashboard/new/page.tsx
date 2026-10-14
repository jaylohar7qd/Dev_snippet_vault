'use client';

import { useRouter } from 'next/navigation';
import { SnippetForm } from '@/components/snippets/SnippetForm';
import { useSnippetStore } from '@/lib/store';
import { CreateSnippetInput } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewSnippetPage() {
  const router = useRouter();
  const { addSnippet } = useSnippetStore();

  const handleSubmit = async (data: CreateSnippetInput) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await addSnippet(data);
    router.push('/dashboard');
  };

  return (
    <div className="page-transition" style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Back link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 mb-6 transition-colors"
        style={{
          color: 'var(--foreground-muted)',
          textDecoration: 'none',
          fontSize: '0.875rem',
        }}
      >
        <ArrowLeft size={16} />
        Back to Dashboard
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Create New <span className="gradient-text">Snippet</span>
        </h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Save your code and organize it with your own tags and collections.
        </p>
      </div>

      <SnippetForm onSubmit={handleSubmit} mode="create" />
    </div>
  );
}
