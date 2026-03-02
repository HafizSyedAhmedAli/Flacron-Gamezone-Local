// app/privacy/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Privacy Policy | Football Live Streaming Platform",
  description:
    "Learn how we collect, use, and protect your personal information. We are committed to transparency and your data privacy.",
  keywords: [
    "privacy policy",
    "data protection",
    "GDPR",
    "personal data",
    "cookies",
  ],
  openGraph: {
    title: "Privacy Policy | Football Live Streaming Platform",
    description:
      "Learn how we collect, use, and protect your personal information.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Privacy Policy | Football Live Streaming Platform",
    description:
      "Learn how we collect, use, and protect your personal information.",
  },
};

const PrivacyClient = dynamic(
  () => import("./PrivacyClient").then((m) => m.PrivacyClient),
  { ssr: false }
);

export default function PrivacyPage() {
  return <PrivacyClient />;
}