import { Metadata } from "next";
import { AdminClientLoader } from "./AdminClientLoader";

export const metadata: Metadata = {
  title: "Admin Panel",
  description: "Admin panel for managing matches, teams, and leagues.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminClientLoader />;
}