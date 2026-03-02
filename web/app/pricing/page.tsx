// app/pricing/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Pricing | Flacron Gamezone",
  description:
    "Choose the perfect plan for your Flacron Gamezone experience. Start free or unlock premium features including live HD streaming, AI match analysis, advanced stats, and priority support.",
  keywords: [
    "Flacron Gamezone pricing",
    "football streaming plans",
    "premium subscription",
    "live match streaming",
    "free plan",
    "gaming subscription",
  ],
  openGraph: {
    title: "Pricing | Flacron Gamezone",
    description:
      "Start free or unlock premium features. Live HD streaming, AI match analysis, advanced stats and more.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pricing | Flacron Gamezone",
    description:
      "Start free or unlock premium features. Live HD streaming, AI match analysis, advanced stats and more.",
  },
};

// useRouter + useSearchParams inside — must be ssr: false
const PricingClient = dynamic(
  () => import("./PricingClient").then((m) => m.PricingClient),
  { ssr: false }
);

export default function PricingPage() {
  return <PricingClient />;
}