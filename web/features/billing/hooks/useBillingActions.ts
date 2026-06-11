'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
   createCheckoutSession,
   cancelSubscription,
   reactivateSubscription,
   createPortalSession,
} from '@/shared/api/billing';
import { getToken } from '@/shared/api/client';

export function useBillingActions() {
   const router = useRouter();
   const [loading, setLoading] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [success, setSuccess] = useState<string | null>(null);

   const clearMessages = () => {
      setError(null);
      setSuccess(null);
   };

   const checkout = async (plan: 'monthly' | 'yearly') => {
      if (!getToken()) {
         router.push('/login?redirect=/pricing');
         return;
      }
      try {
         setLoading('checkout');
         clearMessages();
         const { url } = await createCheckoutSession(plan);
         if (!url) throw new Error('Invalid checkout URL');
         window.location.href = url;
      } catch (err: any) {
         setError(err.message || 'Failed to start checkout. Please try again.');
         setLoading(null);
      }
   };

   const cancel = async (onSuccess?: () => void) => {
      try {
         setLoading('cancel');
         clearMessages();
         await cancelSubscription();
         setSuccess('Subscription canceled successfully.');
         onSuccess?.();
      } catch (err: any) {
         setError(err.message || 'Failed to cancel subscription.');
      } finally {
         setLoading(null);
      }
   };

   const reactivate = async (onSuccess?: () => void) => {
      try {
         setLoading('reactivate');
         clearMessages();
         await reactivateSubscription();
         setSuccess('Subscription reactivated successfully.');
         onSuccess?.();
      } catch (err: any) {
         setError(err.message || 'Failed to reactivate subscription.');
      } finally {
         setLoading(null);
      }
   };

   const portal = async () => {
      try {
         setLoading('portal');
         clearMessages();
         const { url } = await createPortalSession();
         if (!url) throw new Error('Invalid portal URL');
         window.location.href = url;
      } catch (err: any) {
         setError(err.message || 'Failed to open billing portal.');
         setLoading(null);
      }
   };

   return {
      loading,
      error,
      success,
      setError,
      setSuccess,
      clearMessages,
      checkout,
      cancel,
      reactivate,
      portal,
   };
}
