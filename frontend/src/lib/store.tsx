'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Snippet, Collection, CreateSnippetInput, DashboardStats, SnippetFilters, SortOption } from '@/lib/types';
import { computeStats } from '@/lib/stats';
import { useDashboardUser } from '@/lib/dashboard-user';

interface SnippetStoreContextType {
  // Snippets
  snippets: Snippet[];
  explainCode: (code: string, language: string) => Promise<string>;
  addSnippet: (input: CreateSnippetInput) => Promise<Snippet>;
  updateSnippet: (id: string, data: Partial<CreateSnippetInput> & { is_favorite?: boolean }) => Promise<void>;
  deleteSnippet: (id: string) => Promise<void>;
  clearAllSnippets: () => void;
  toggleFavorite: (id: string) => Promise<void>;
  getSnippet: (id: string) => Snippet | undefined;

  // Collections
  collections: Collection[];
  addCollection: (name: string, description?: string, color?: string) => Promise<Collection>;
  updateCollection: (id: string, data: Partial<Omit<Collection, 'id' | 'user_id' | 'created_at'>>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;

  // Filtering & Search
  filters: SnippetFilters;
  setFilters: (filters: Partial<SnippetFilters>) => void;
  resetFilters: () => void;
  filteredSnippets: Snippet[];

  // Stats
  stats: DashboardStats;

  // Toast
  toast: ToastMessage | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  clearToast: () => void;
}

interface ToastMessage {
  message: string;
  type: 'success' | 'error' | 'info';
  id: number;
}

const defaultFilters: SnippetFilters = {
  search: '',
  language: '',
  tag: '',
  favoritesOnly: false,
  sort: 'newest',
};

const SnippetStoreContext = createContext<SnippetStoreContextType | undefined>(undefined);

let toastCounter = 0;

const legacyDemoSnippetIds = new Set(['1', '2', '3', '4', '5', '6', '7', '8']);
const legacyDemoCollectionIds = new Set(['col-1', 'col-2', 'col-3']);

function readStoredValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const savedValue = window.localStorage.getItem(key);
    if (!savedValue) return fallback;

    const parsedValue = JSON.parse(savedValue) as T;
    return parsedValue;
  } catch {
    return fallback;
  }
}

type ApiSnippet = Partial<Snippet> & { content?: string };

function normalizeSnippet(payload: ApiSnippet | null | undefined): Snippet | null {
  if (!payload || typeof payload !== 'object') return null;

  return {
    id: String(payload.id ?? 'snippet-local'),
    title: String(payload.title ?? 'Untitled snippet'),
    code: String(payload.code ?? payload.content ?? ''),
    language: String(payload.language ?? 'other'),
    description: payload.description ?? '',
    tags: Array.isArray(payload.tags) ? payload.tags.filter(Boolean) : [],
    created_at: payload.created_at ?? new Date().toISOString(),
    updated_at: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
    user_id: String(payload.user_id ?? 'local-user'),
    is_favorite: Boolean(payload.is_favorite),
    is_public: Boolean(payload.is_public),
    collection_id: payload.collection_id ?? undefined,
  };
}

function normalizeCollection(payload: Partial<Collection> | null | undefined): Collection | null {
  if (!payload || typeof payload !== 'object') return null;

  return {
    id: String(payload.id ?? 'col-local'),
    name: String(payload.name ?? 'Untitled Collection'),
    description: payload.description ?? undefined,
    color: String(payload.color ?? '#8B5CF6'),
    user_id: String(payload.user_id ?? 'local-user'),
    created_at: payload.created_at ?? new Date().toISOString(),
    updated_at: payload.updated_at ?? payload.created_at ?? new Date().toISOString(),
  };
}

function getApiUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!configuredUrl) {
    throw new Error('Backend URL is missing. Restart the frontend.');
  }
  return configuredUrl.replace(/\/$/, '');
}

async function apiRequest<T>(path: string, options: RequestInit = {}, requireAuth = true): Promise<T> {
  const apiUrl = getApiUrl();
  const headers = new Headers(options.headers || {});

  if (requireAuth) {
    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Please log in to continue.');
    }
    headers.set('Authorization', `Bearer ${token}`);
  }


  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers,
  });

  const data = await response.text();
  const parsed = data ? JSON.parse(data) : null;

  if (!response.ok) {
    throw new Error(parsed?.error || 'Request failed');
  }

  return parsed as T;
}

export function SnippetStoreProvider({ children }: { children: ReactNode }) {
  const user = useDashboardUser();
  const [snippets, setSnippets] = useState<Snippet[]>(() => {
    const savedSnippets = readStoredValue<Snippet[]>('snippetvault_snippets', []);
    return savedSnippets.filter((snippet) => !legacyDemoSnippetIds.has(snippet.id)).map((snippet) =>
      snippet.collection_id && legacyDemoCollectionIds.has(snippet.collection_id)
        ? { ...snippet, collection_id: undefined }
        : snippet
    );
  });
  const [collections, setCollections] = useState<Collection[]>(() => {
    const savedCollections = readStoredValue<Collection[]>('snippetvault_collections', []);
    return savedCollections.filter((collection) => !legacyDemoCollectionIds.has(collection.id));
  });
  const [filters, setFiltersState] = useState<SnippetFilters>(defaultFilters);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    if (!user) return;

    let isMounted = true;

    const loadRemoteData = async () => {
      try {
        const [snippetsResponse, collectionsResponse] = await Promise.all([
          apiRequest<{ snippets?: Array<Partial<Snippet>> }>('/api/snippets').catch(() => ({ snippets: [] })),
          apiRequest<{ collections?: Array<Partial<Collection>> }>('/api/collections').catch(() => ({ collections: [] })),
        ]);

        if (!isMounted) return;

        const nextSnippets = (snippetsResponse.snippets || [])
          .map((snippet) => normalizeSnippet(snippet))
          .filter((snippet): snippet is Snippet => snippet !== null)
          .filter((snippet) => !legacyDemoSnippetIds.has(snippet.id));

        const nextCollections = (collectionsResponse.collections || [])
          .map((collection) => normalizeCollection(collection))
          .filter((collection): collection is Collection => collection !== null)
          .filter((collection) => !legacyDemoCollectionIds.has(collection.id));

        setSnippets(nextSnippets);
        setCollections(nextCollections);
        localStorage.setItem('snippetvault_snippets', JSON.stringify(nextSnippets));
        localStorage.setItem('snippetvault_collections', JSON.stringify(nextCollections));
      } catch {
        if (!isMounted) return;
        setSnippets([]);
        setCollections([]);
      }
    };

    void loadRemoteData();

    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    try {
      window.localStorage.setItem('snippetvault_snippets', JSON.stringify(snippets));
    } catch {
      // Ignore storage errors
    }
  }, [snippets]);

  useEffect(() => {
    try {
      window.localStorage.setItem('snippetvault_collections', JSON.stringify(collections));
    } catch {
      // Ignore storage errors
    }
  }, [collections]);

  // Toast
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = ++toastCounter;
    setToast({ message, type, id });
    setTimeout(() => {
      setToast((prev) => (prev?.id === id ? null : prev));
    }, 3000);
  }, []);

  const clearToast = useCallback(() => setToast(null), []);

  // Snippets
  const explainCode = useCallback(async (code: string, language: string): Promise<string> => {
    const response = await apiRequest<{ action: string; text: string }>('/api/ai/assist', {
      method: 'POST',
      body: JSON.stringify({ action: 'explain', code, language }),
    });

    if (typeof response?.text !== 'string' || !response.text.trim()) {
      throw new Error('The AI did not return an explanation.');
    }

    return response.text.trim();
  }, []);

  const addSnippet = useCallback(async (input: CreateSnippetInput): Promise<Snippet> => {
    if (!user) throw new Error('Cannot create a snippet without an authenticated user.');

    try {
      const response = await apiRequest<{ snippet?: Partial<Snippet> }>('/api/snippets', {
        method: 'POST',
        body: JSON.stringify({
          title: input.title,
          code: input.code,
          language: input.language,
          description: input.description ?? null,
          tags: input.tags ?? [],
          is_public: Boolean(input.is_public),
          collection_id: input.collection_id ?? null,
        }),
      });

      const newSnippet = normalizeSnippet(response?.snippet ?? null);
      if (!newSnippet) {
        throw new Error('Snippet was not returned by the API.');
      }

      setSnippets((prev) => [newSnippet, ...prev.filter((snippet) => snippet.id !== newSnippet.id)]);
      showToast('Snippet created successfully!');
      return newSnippet;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not create snippet', 'error');
      throw error;
    }
  }, [showToast, user]);

  const updateSnippet = useCallback(async (id: string, data: Partial<CreateSnippetInput> & { is_favorite?: boolean }): Promise<void> => {
    try {
      const payload: Record<string, unknown> = {};

      if (data.title !== undefined) payload.title = data.title;
      if (data.code !== undefined) payload.code = data.code;
      if (data.language !== undefined) payload.language = data.language;
      if (data.description !== undefined) payload.description = data.description ?? null;
      if (data.tags !== undefined) payload.tags = data.tags ?? [];
      if (data.is_public !== undefined) payload.is_public = Boolean(data.is_public);
      if (data.collection_id !== undefined) payload.collection_id = data.collection_id ?? null;
      if (data.is_favorite !== undefined) payload.is_favorite = Boolean(data.is_favorite);

      const response = await apiRequest<{ snippet?: Partial<Snippet> }>(`/api/snippets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(payload),
      });

      const updatedSnippet = normalizeSnippet(response?.snippet ?? null);
      if (updatedSnippet) {
        setSnippets((prev) => prev.map((snippet) => (snippet.id === id ? updatedSnippet : snippet)));
      }

      showToast('Snippet updated successfully!');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update snippet', 'error');
      throw error;
    }
  }, [showToast]);

  const deleteSnippet = useCallback(async (id: string): Promise<void> => {
    try {
      await apiRequest(`/api/snippets/${id}`, { method: 'DELETE' });
      setSnippets((prev) => prev.filter((snippet) => snippet.id !== id));
      showToast('Snippet deleted.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not delete snippet', 'error');
      throw error;
    }
  }, [showToast]);

  const clearAllSnippets = useCallback(() => {
    setSnippets([]);
    setCollections([]);
    try {
      localStorage.removeItem('snippetvault_snippets');
      localStorage.removeItem('snippetvault_collections');
    } catch {}
    showToast('Vault cleared.', 'info');
  }, [showToast]);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    const currentSnippet = snippets.find((snippet) => snippet.id === id);
    if (!currentSnippet) return;

    const nextValue = !currentSnippet.is_favorite;

    try {
      const response = await apiRequest<{ snippet?: Partial<Snippet> }>(`/api/snippets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_favorite: nextValue }),
      });

      const updatedSnippet = normalizeSnippet(response?.snippet ?? null);
      if (updatedSnippet) {
        setSnippets((prev) => prev.map((snippet) => (snippet.id === id ? updatedSnippet : snippet)));
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update favorite state', 'error');
      throw error;
    }
  }, [showToast, snippets]);

  const getSnippet = useCallback((id: string) => {
    return snippets.find((s) => s.id === id);
  }, [snippets]);

  // Collections
  const addCollection = useCallback(async (name: string, description?: string, color?: string): Promise<Collection> => {
    if (!user) throw new Error('Cannot create a collection without an authenticated user.');

    try {
      const response = await apiRequest<{ collection?: Partial<Collection> }>('/api/collections', {
        method: 'POST',
        body: JSON.stringify({
          name,
          description: description ?? null,
          color: color ?? '#8B5CF6',
        }),
      });

      const newCollection = normalizeCollection(response?.collection ?? null);
      if (!newCollection) {
        throw new Error('Collection was not returned by the API.');
      }

      setCollections((prev) => [...prev, newCollection]);
      showToast('Collection created!');
      return newCollection;
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not create collection', 'error');
      throw error;
    }
  }, [showToast, user]);

  const updateCollection = useCallback(async (id: string, data: Partial<Omit<Collection, 'id' | 'user_id' | 'created_at'>>): Promise<void> => {
    try {
      const response = await apiRequest<{ collection?: Partial<Collection> }>(`/api/collections/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });

      const updatedCollection = normalizeCollection(response?.collection ?? null);
      if (updatedCollection) {
        setCollections((prev) => prev.map((collection) => (collection.id === id ? updatedCollection : collection)));
      }
      showToast('Collection updated!');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not update collection', 'error');
      throw error;
    }
  }, [showToast]);

  const deleteCollection = useCallback(async (id: string): Promise<void> => {
    try {
      await apiRequest(`/api/collections/${id}`, { method: 'DELETE' });
      setCollections((prev) => prev.filter((collection) => collection.id !== id));
      setSnippets((prev) => prev.map((snippet) => (snippet.collection_id === id ? { ...snippet, collection_id: undefined } : snippet)));
      showToast('Collection deleted.', 'info');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Could not delete collection', 'error');
      throw error;
    }
  }, [showToast]);

  // Filters
  const setFilters = useCallback((partial: Partial<SnippetFilters>) => {
    setFiltersState((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFiltersState(defaultFilters);
  }, []);

  // Filtered & Sorted snippets
  const filteredSnippets = filterAndSortSnippets(snippets, filters);

  // Stats
  const stats = computeStats(snippets);

  return (
    <SnippetStoreContext.Provider
      value={{
        snippets,
        explainCode,
        addSnippet,
        updateSnippet,
        deleteSnippet,
        clearAllSnippets,
        toggleFavorite,
        getSnippet,
        collections,
        addCollection,
        updateCollection,
        deleteCollection,
        filters,
        setFilters,
        resetFilters,
        filteredSnippets,
        stats,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </SnippetStoreContext.Provider>
  );
}

export function useSnippetStore() {
  const ctx = useContext(SnippetStoreContext);
  if (!ctx) throw new Error('useSnippetStore must be used inside SnippetStoreProvider');
  return ctx;
}

// ===== Filtering Logic =====

function filterAndSortSnippets(snippets: Snippet[], filters: SnippetFilters): Snippet[] {
  let result = [...snippets];

  // Search
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (s) =>
      s.title.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.description?.toLowerCase().includes(q) ||
      s.tags.some((t) => t.toLowerCase().includes(q)) ||
      s.language.toLowerCase().includes(q)
    );
  }

  // Language filter
  if (filters.language) {
    result = result.filter((s) => s.language === filters.language);
  }

  // Tag filter
  if (filters.tag) {
    result = result.filter(
      (s) => s.tags.includes(filters.tag)
    );
  }

  // Favorites only
  if (filters.favoritesOnly) {
    result = result.filter((s) => s.is_favorite);
  }

  // Sort
  result = sortSnippets(result, filters.sort);

  return result;
}

function sortSnippets(snippets: Snippet[], sort: SortOption): Snippet[] {
  switch (sort) {
    case 'newest':
      return snippets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    case 'oldest':
      return snippets.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    case 'title':
      return snippets.sort((a, b) => a.title.localeCompare(b.title));
    case 'language':
      return snippets.sort((a, b) => a.language.localeCompare(b.language));
    default:
      return snippets;
  }
}
