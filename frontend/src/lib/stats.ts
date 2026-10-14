import { Snippet, DashboardStats } from './types';

export function computeStats(snippets: Snippet[]): DashboardStats {
  const languages = new Set(snippets.map((snippet) => snippet.language));
  const favorites = snippets.filter((snippet) => snippet.is_favorite).length;
  const allTags = new Set(snippets.flatMap((snippet) => snippet.tags));

  return {
    total_snippets: snippets.length,
    total_tags: allTags.size,
    languages_used: languages.size,
    favorites,
  };
}
