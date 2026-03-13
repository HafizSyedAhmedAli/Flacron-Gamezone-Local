import type { Metadata } from "next";
import DashboardPage from "@/pages/dashboard/ui/DashboardPage";

export const metadata: Metadata = {
  title: "Dashboard | Flacrom Gamezone",
  description: "Manage your subscription, billing and account settings.",
  robots: { index: false, follow: false },
};

export default function DashboardRoute() {
  return <DashboardPage />;
}
