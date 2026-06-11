'use client';

import { useCallback, useEffect, useState } from 'react';
import {
   getAdminMatches,
   createMatch,
   updateMatch,
   deleteMatch,
   syncLiveMatches,
   generateMatchAI,
} from '../api/matchesApi';
import { useAlert } from '@/shared/hooks';
import type { AdminMatch } from '@/shared/types';

interface Filters {
   page: number;
   status: string;
   leagueId: string;
}

export function useMatchAdmin() {
   const [matches, setMatches] = useState<AdminMatch[]>([]);
   const [total, setTotal] = useState(0);
   const [filters, setFilters] = useState<Filters>({
      page: 0,
      status: '',
      leagueId: '',
   });
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [syncing, setSyncing] = useState(false);
   const { alert, show: showAlert } = useAlert();
   const LIMIT = 10;

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getAdminMatches(
            filters.page + 1,
            LIMIT,
            filters.status || undefined,
            filters.leagueId || undefined
         );
         setMatches(data.matches);
         setTotal(data.total);
      } catch (e: any) {
         showAlert(e.message || 'Failed to load matches', 'error');
      } finally {
         setLoading(false);
      }
   }, [filters]);

   useEffect(() => {
      load();
   }, [load]);

   const save = async (data: any, editingId?: string) => {
      setSaving(true);
      try {
         if (editingId) await updateMatch(editingId, data);
         else await createMatch(data);
         showAlert(editingId ? 'Match updated' : 'Match created');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to save match', 'error');
         return false;
      } finally {
         setSaving(false);
      }
   };

   const remove = async (id: string) => {
      try {
         await deleteMatch(id);
         showAlert('Match deleted');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to delete match', 'error');
         return false;
      }
   };

   const sync = async () => {
      setSyncing(true);
      try {
         await syncLiveMatches();
         showAlert('Live matches synced');
         await load();
      } catch (e: any) {
         showAlert(e.message || 'Sync failed', 'error');
      } finally {
         setSyncing(false);
      }
   };

   const generateAI = async (id: string) => {
      try {
         await generateMatchAI(id);
         showAlert('AI summary generated');
      } catch (e: any) {
         showAlert(e.message || 'AI generation failed', 'error');
      }
   };

   const setPage = (page: number) => setFilters((f) => ({ ...f, page }));
   const setStatus = (status: string) =>
      setFilters((f) => ({ ...f, status, page: 0 }));
   const setLeague = (leagueId: string) =>
      setFilters((f) => ({ ...f, leagueId, page: 0 }));

   return {
      matches,
      total,
      filters,
      loading,
      saving,
      syncing,
      alert,
      totalPages: Math.ceil(total / LIMIT),
      LIMIT,
      load,
      save,
      remove,
      sync,
      generateAI,
      setPage,
      setStatus,
      setLeague,
   };
}
