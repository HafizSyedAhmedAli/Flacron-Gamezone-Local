'use client';

import { useCallback, useEffect, useState } from 'react';
import {
   getUsers,
   updateUser,
   deleteUser,
   cancelUserSubscription,
} from '../api/usersApi';
import { useAlert } from '@/shared/hooks';
import type { AdminUser } from '@/shared/types';

export function useUserAdmin() {
   const [users, setUsers] = useState<AdminUser[]>([]);
   const [total, setTotal] = useState(0);
   const [page, setPage] = useState(0);
   const [search, setSearch] = useState('');
   const [loading, setLoading] = useState(false);
   const [saving, setSaving] = useState(false);
   const { alert, show: showAlert } = useAlert();
   const LIMIT = 10;

   const load = useCallback(async () => {
      setLoading(true);
      try {
         const data = await getUsers(page + 1, LIMIT, search || undefined);
         setUsers(data.users);
         setTotal(data.total);
      } catch (e: any) {
         showAlert(e.message || 'Failed to load users', 'error');
      } finally {
         setLoading(false);
      }
   }, [page, search]);

   useEffect(() => {
      load();
   }, [load]);

   const saveRole = async (id: string, role: string) => {
      setSaving(true);
      try {
         await updateUser(id, { role });
         showAlert('User updated');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to update user', 'error');
         return false;
      } finally {
         setSaving(false);
      }
   };

   const remove = async (id: string) => {
      try {
         await deleteUser(id);
         showAlert('User deleted');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to delete user', 'error');
         return false;
      }
   };

   const cancelSub = async (id: string) => {
      try {
         await cancelUserSubscription(id);
         showAlert('Subscription cancelled');
         await load();
         return true;
      } catch (e: any) {
         showAlert(e.message || 'Failed to cancel subscription', 'error');
         return false;
      }
   };

   const onSearchChange = (v: string) => {
      setSearch(v);
      setPage(0);
   };

   return {
      users,
      total,
      page,
      search,
      loading,
      saving,
      alert,
      totalPages: Math.ceil(total / LIMIT),
      LIMIT,
      setPage,
      onSearchChange,
      saveRole,
      remove,
      cancelSub,
   };
}
