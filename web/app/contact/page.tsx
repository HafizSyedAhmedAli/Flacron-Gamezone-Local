import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Us | Flacrom Gamezone",
  description:
    "Need help with Flacrom Gamezone? Contact our support team for assistance with tournaments, accounts, pricing, or technical issues.",
  keywords: [
    "Flacrom Gamezone contact",
    "gaming support",
    "esports support",
    "contact gaming platform",
  ],
  // TODO: Replace placeholder URLs before shipping.
  openGraph: {
    title: "Contact Flacrom Gamezone",
    description:
      "Reach out to the Flacrom Gamezone support team. We're here to help.",
    url: "https://yourdomain.com/contact",
    siteName: "Flacrom Gamezone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Flacrom Gamezone",
    description:
      "Get in touch with Flacrom Gamezone support for help and inquiries.",
  },
  alternates: {
    canonical: "https://yourdomain.com/contact",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
