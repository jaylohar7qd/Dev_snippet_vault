'use client';

import { useParams, useRouter } from 'next/navigation';
import { SnippetForm } from '@/components/snippets/SnippetForm';
import { useSnippetStore } from '@/lib/store';
import { CreateSnippetInput } from '@/lib/types';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

function EditSnippetContent() {
  const params = useParams();
  const router = useRouter();
  const { getSnippet, updateSnippet } = useSnippetStore();

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

  const handleSubmit = async (data: CreateSnippetInput) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    await updateSnippet(snippetId, data);
    router.push(`/dashboard/snippet/${snippetId}`);
  };

  return (
    <div className="page-transition" style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <Link
        href={`/dashboard/snippet/${snippetId}`}
        className="inline-flex items-center gap-2 mb-6 transition-colors"
        style={{ color: 'var(--foreground-muted)', textDecoration: 'none', fontSize: '0.875rem' }}
      >
        <ArrowLeft size={16} />
        Back to Snippet
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Edit <span className="gradient-text">Snippet</span>
        </h1>
        <p style={{ color: 'var(--foreground-muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Update your snippet details and code.
        </p>
      </div>

      <SnippetForm
        initialData={{
          id: snippet.id,
          title: snippet.title,
          code: snippet.code,
          language: snippet.language,
          description: snippet.description,
          tags: snippet.tags,
          is_public: snippet.is_public,
          collection_id: snippet.collection_id,
        }}
        onSubmit={handleSubmit}
        mode="edit"
      />
    </div>
  );
}

export default function EditSnippetPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-16" style={{ color: 'var(--foreground-muted)' }}>
          Loading editor...
        </div>
      }
    >
      <EditSnippetContent />
    </Suspense>
  );
}
