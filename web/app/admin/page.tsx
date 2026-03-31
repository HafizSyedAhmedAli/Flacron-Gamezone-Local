import dynamic from "next/dynamic";
import LoadingSpinner from "@/shared/ui/LoadingSpinner";

const AdminPanel = dynamic(
  () => import("../../page-components/admin/ui/AdminPanel").then((m) => m.AdminPanel),
  {
    ssr: false,
    loading: () => (
      <LoadingSpinner fullScreen size="lg" message="Loading admin panel…" />
    ),
  },
);

export default function AdminPage() {
  return <AdminPanel />;
}
