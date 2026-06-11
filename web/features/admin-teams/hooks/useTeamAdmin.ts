'use client';

import { useCallback, useEffect, useState } from 'react';
import { getTeams, createTeam, updateTeam, deleteTeam } from '../api/teamsApi';
import { useAlert } from '@/shared/hooks';
import type { Team } from '@/shared/types';

export function useTeamAdmin() {
   const [teams, setTeams] = useState<Team[]>([]);
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const { alert, show: showAlert } = useAlert();

   const load = useCallback(async () => {
      setLoading(true);
      try {
         setTeams(await getTeams());
      } catch (e: any) {
         showAlert(e.message || 'Failed to load teams', 'error');
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      load();
   }, [load]);

   const save = async (
      data: { name: string; leagueId: string; logo: string; apiTeamId: string },
      editingId?: string
   ) => {
      setSaving(true);
      try {
         const payload = {
            name: data.name,
            leagueId: data.leagueId || undefined,
            logo: data.logo || undefined,
            apiTeamId: data.apiTeamId ? Number(data.apiTeamId) : undefined,
         };
         if (editingId) await updateTeam(editingId, payload);
         else await createTeam(payload);
         showAlert(editingId ? 'Team updated' : 'Team created');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to save team', 'error');
         return false;
      } finally {
         setSaving(false);
      }
   };

   const remove = async (id: string, name: string) => {
      try {
         await deleteTeam(id);
         showAlert(`"${name}" deleted`);
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to delete team', 'error');
         return false;
      }
   };

   return { teams, loading, saving, alert, load, save, remove };
}
