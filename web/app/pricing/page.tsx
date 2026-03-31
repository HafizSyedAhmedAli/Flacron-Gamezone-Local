import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Pricing | Flacron Gamezone",
  description: "Choose the perfect plan for your Flacron Gamezone experience.",
  keywords: [
    "Flacron Gamezone pricing",
    "football streaming plans",
    "premium subscription",
  ],
  openGraph: {
    title: "Pricing | Flacron Gamezone",
    description: "Start free or unlock premium features.",
    type: "website",
  },
};

const PricingClient = dynamic(
  () => import("../../page-components/pricing/ui/PricingClient").then((m) => m.PricingClient),
  { ssr: false },
);

export default function PricingPage() {
  return <PricingClient />;
}
