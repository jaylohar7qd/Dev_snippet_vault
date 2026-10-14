// ===== Core Types =====

export interface Snippet {
  id: string;
  title: string;
  code: string;
  language: string;
  description?: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  is_favorite: boolean;
  is_public: boolean;
  collection_id?: string;
}

export interface CreateSnippetInput {
  title: string;
  code: string;
  language: string;
  description?: string;
  tags?: string[];
  is_public?: boolean;
  collection_id?: string;
}

export interface UpdateSnippetInput extends Partial<CreateSnippetInput> {
  id: string;
  is_favorite?: boolean;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  image?: string;
  created_at: string;
}

export interface DashboardStats {
  total_snippets: number;
  total_tags: number;
  languages_used: number;
  favorites: number;
}

export type SortOption = 'newest' | 'oldest' | 'title' | 'language';
export type ViewMode = 'grid' | 'list';

export interface SnippetFilters {
  search: string;
  language: string;
  tag: string;
  favoritesOnly: boolean;
  sort: SortOption;
}

export const SUPPORTED_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'c',
  'cpp',
  'csharp',
  'go',
  'rust',
  'ruby',
  'php',
  'swift',
  'kotlin',
  'html',
  'css',
  'sql',
  'bash',
  'powershell',
  'json',
  'yaml',
  'markdown',
  'dockerfile',
  'graphql',
  'r',
  'dart',
  'lua',
  'scala',
  'perl',
  'haskell',
  'other',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  python: '#3776ab',
  java: '#ed8b00',
  c: '#555555',
  cpp: '#f34b7d',
  csharp: '#239120',
  go: '#00add8',
  rust: '#dea584',
  ruby: '#cc342d',
  php: '#777bb4',
  swift: '#ffac45',
  kotlin: '#a97bff',
  html: '#e34f26',
  css: '#1572b6',
  sql: '#e38c00',
  bash: '#4eaa25',
  powershell: '#012456',
  json: '#292929',
  yaml: '#cb171e',
  markdown: '#083fa1',
  dockerfile: '#0db7ed',
  graphql: '#e10098',
  r: '#276dc3',
  dart: '#0175c2',
  lua: '#000080',
  scala: '#dc322f',
  perl: '#39457e',
  haskell: '#5e5086',
  other: '#808080',
};

export const COLLECTION_COLORS = [
  '#8B5CF6',
  '#22D3EE',
  '#F59E0B',
  '#EF4444',
  '#10B981',
  '#EC4899',
  '#6366F1',
  '#14B8A6',
];
