'use client';

import { useEffect, useState } from 'react';
import { apiGet } from '@/shared/api/client';
import { useDebounce } from '@/shared/hooks';
import type { SearchResults } from '@/shared/types';

const RECENT_KEY = 'fgz_recent_searches';

function getRecent(): string[] {
   if (typeof window === 'undefined') return [];
   try {
      return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]');
   } catch {
      return [];
   }
}

function addRecent(q: string) {
   const list = getRecent()
      .filter((s) => s !== q)
      .slice(0, 4);
   list.unshift(q);
   localStorage.setItem(RECENT_KEY, JSON.stringify(list));
}

export function useSearch() {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState<SearchResults | null>(null);
   const [loading, setLoading] = useState(false);
   const [recentSearches, setRecentSearches] = useState<string[]>([]);
   const debouncedQuery = useDebounce(query, 300);

   useEffect(() => {
      setRecentSearches(getRecent());
   }, []);

   useEffect(() => {
      if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
         setResults(null);
         return;
      }
      setLoading(true);
      apiGet<SearchResults>(
         `/api/search?q=${encodeURIComponent(debouncedQuery)}`
      )
         .then(setResults)
         .catch(() => setResults(null))
         .finally(() => setLoading(false));
   }, [debouncedQuery]);

   const handleSelect = () => {
      if (query.trim()) {
         addRecent(query.trim());
         setRecentSearches(getRecent());
      }
      setQuery('');
   };

   const hasResults =
      !!results &&
      (results.leagues.length > 0 ||
         results.teams.length > 0 ||
         results.matches.length > 0);

   return {
      query,
      setQuery,
      results,
      loading,
      recentSearches,
      hasResults,
      handleSelect,
   };
}
