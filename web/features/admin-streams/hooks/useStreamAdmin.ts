'use client';

import { useCallback, useEffect, useState } from 'react';
import {
   getMatchesForStreams,
   upsertStream,
   triggerBulkYoutubeSearch,
} from '../api/streamsApi';
import { useAlert } from '@/shared/hooks';
import type { AdminMatch } from '@/shared/types';

export function useStreamAdmin() {
   const [liveMatches, setLiveMatches] = useState<AdminMatch[]>([]);
   const [allMatches, setAllMatches] = useState<AdminMatch[]>([]);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const { alert, show: showAlert } = useAlert();

   const loadLive = useCallback(async () => {
      setLoading(true);
      try {
         const { matches } = await getMatchesForStreams(1, 10_000);
         setLiveMatches(matches.filter((m) => m.status === 'LIVE'));
      } catch (e: any) {
         showAlert(e.message || 'Failed to load streams', 'error');
      } finally {
         setLoading(false);
      }
   }, []);

   const loadAll = useCallback(async () => {
      try {
         const { matches } = await getMatchesForStreams(1, 10_000);
         setAllMatches(matches.filter((m) => m.status !== 'FINISHED'));
      } catch {}
   }, []);

   useEffect(() => {
      loadLive();
      loadAll();
   }, [loadLive, loadAll]);

   const save = async (data: {
      matchId: string;
      type: 'EMBED' | 'NONE';
      provider: string;
      url: string;
      isActive: boolean;
   }) => {
      setSaving(true);
      try {
         await upsertStream({
            matchId: data.matchId,
            type: data.type,
            provider: data.provider || null,
            url: data.url || null,
            isActive: data.isActive,
         });
         showAlert('Stream saved');
         await Promise.all([loadLive(), loadAll()]);
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to save stream', 'error');
         return false;
      } finally {
         setSaving(false);
      }
   };

   const bulkSearch = async () => {
      try {
         const { searched } = await triggerBulkYoutubeSearch();
         showAlert(`Searched ${searched} live matches`);
         await loadLive();
      } catch (e: any) {
         showAlert(e.message || 'Bulk search failed', 'error');
      }
   };

   return {
      liveMatches,
      allMatches,
      loading,
      saving,
      alert,
      loadLive,
      save,
      bulkSearch,
   };
}
