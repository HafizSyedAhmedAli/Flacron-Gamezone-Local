// app/terms/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Terms of Service | Flacron Gamezone",
  description:
    "Read the Flacron Gamezone Terms of Service. Understand your rights, responsibilities, subscription terms, and community guidelines before using our platform.",
  keywords: [
    "terms of service",
    "terms and conditions",
    "user agreement",
    "Flacron Gamezone",
    "gaming platform terms",
  ],
  openGraph: {
    title: "Terms of Service | Flacron Gamezone",
    description:
      "Read the Flacron Gamezone Terms of Service. Understand your rights, responsibilities, and community guidelines.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Terms of Service | Flacron Gamezone",
    description:
      "Read the Flacron Gamezone Terms of Service. Understand your rights, responsibilities, and community guidelines.",
  },
};

// useEffect + useState inside — must be ssr: false
const TermsClient = dynamic(
  () => import("./TermsClient").then((m) => m.TermsClient),
  { ssr: false }
);

export default function TermsPage() {
  return <TermsClient />;
}