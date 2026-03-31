import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Terms of Service | Flacron Gamezone",
  description: "Read the Flacron Gamezone Terms of Service.",
  keywords: ["terms of service", "terms and conditions", "user agreement"],
  openGraph: {
    title: "Terms of Service | Flacron Gamezone",
    description: "Read the Flacron Gamezone Terms of Service.",
    type: "website",
  },
};

const TermsClient = dynamic(
  () => import("../../page-components/terms/ui/TermsClient").then((m) => m.TermsClient),
  { ssr: false },
);

export default function TermsPage() {
  return <TermsClient />;
}
