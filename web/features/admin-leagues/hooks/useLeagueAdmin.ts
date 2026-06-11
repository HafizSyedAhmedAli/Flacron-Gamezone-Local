'use client';

import { useCallback, useEffect, useState } from 'react';
import {
   getLeagues,
   createLeague,
   updateLeague,
   deleteLeague,
   syncLeague,
   bulkSyncLeagues,
} from '../api/leaguesApi';
import { useAlert } from '@/shared/hooks';
import type { League } from '@/shared/types';

export function useLeagueAdmin() {
   const [leagues, setLeagues] = useState<League[]>([]);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const [syncing, setSyncing] = useState<string | null>(null);
   const [bulkSyncing, setBulkSyncing] = useState(false);
   const { alert, show: showAlert } = useAlert();

   const load = useCallback(async () => {
      setLoading(true);
      try {
         setLeagues(await getLeagues());
      } catch (e: any) {
         showAlert(e.message || 'Failed to load leagues', 'error');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      load();
   }, [load]);

   const save = async (
      data: {
         name: string;
         country: string;
         logo: string;
         apiLeagueId: string;
      },
      editingId?: string
   ) => {
      setSaving(true);
      try {
         const payload = {
            name: data.name,
            country: data.country || undefined,
            logo: data.logo || undefined,
            apiLeagueId: data.apiLeagueId
               ? Number(data.apiLeagueId)
               : undefined,
         };
         if (editingId) await updateLeague(editingId, payload);
         else await createLeague(payload);
         showAlert(editingId ? 'League updated' : 'League created');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to save league', 'error');
         return false;
      } finally {
         setSaving(false);
      }
   };

   const remove = async (id: string, name: string) => {
      try {
         await deleteLeague(id);
         showAlert(`"${name}" deleted`);
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to delete league', 'error');
         return false;
      }
   };

   const sync = async (id: string) => {
      setSyncing(id);
      try {
         showAlert('League synced');
         await load();
      } catch (e: any) {
         showAlert(e.message || 'Sync failed', 'error');
      } finally {
         setSyncing(null);
      }
   };

   const bulkSync = async () => {
      setBulkSyncing(true);
      try {
         await bulkSyncLeagues();
         showAlert('Bulk sync complete');
         await load();
      } catch (e: any) {
         showAlert(e.message || 'Bulk sync failed', 'error');
      } finally {
         setBulkSyncing(false);
      }
   };

   return {
      leagues,
      loading,
      saving,
      syncing,
      bulkSyncing,
      alert,
      load,
      save,
      remove,
      sync,
      bulkSync,
   };
}
