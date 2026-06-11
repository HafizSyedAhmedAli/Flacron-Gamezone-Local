import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
   title: 'Dashboard | Flacron Gamezone',
   description: 'Manage your subscription and account settings.',
   robots: { index: false, follow: false },
};

const DashboardPage = dynamic(
   () => import('../../page-components/dashboard/ui/DashboardPage'),
   { ssr: false }
);

export default function DashboardRoute() {
   return <DashboardPage />;
}
