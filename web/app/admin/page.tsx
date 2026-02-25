// app/admin/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel for managing matches, teams, and leagues.",
  robots: {
    index: false,  // Don't let search engines index the admin panel
    follow: false,
  },
};

const AdminClient = dynamic(
  () => import("./AdminClient").then((m) => m.AdminClient),
  { ssr: false }
);

export default function AdminPage() {
  return <AdminClient />;
}