import dynamic from 'next/dynamic';
import { LoadingState } from '@/shared/ui/LoadingErrorStates';

const AdminPanel = dynamic(
   () =>
      import('../../page-components/admin/ui/AdminPanel').then(
         (m) => m.AdminPanel
      ),
   {
      ssr: false,
      loading: () => <LoadingState message="Loading admin panel…" />,
   }
);

export default function AdminPage() {
   return <AdminPanel />;
}
