import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | Football Live Streaming Platform",
  description:
    "Learn how we collect, use, and protect your personal information.",
  keywords: ["privacy policy", "data protection", "GDPR"],
  openGraph: {
    title: "Privacy Policy | Football Live Streaming Platform",
    description: "Learn how we protect your personal information.",
    type: "website",
  },
};

const PrivacyClient = dynamic(
  () => import("@/pages/privacy/ui/PrivacyClient").then((m) => m.PrivacyClient),
  { ssr: false },
);

export default function PrivacyPage() {
  return <PrivacyClient />;
}
