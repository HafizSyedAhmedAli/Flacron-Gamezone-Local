import type { Metadata } from "next";
import ContactPage from "../../page-components/contact/ui/ContactPage";

export const metadata: Metadata = {
  title: "Contact Us | Flacrom Gamezone",
  description:
    "Need help with Flacrom Gamezone? Contact our support team for assistance.",
  keywords: ["Flacrom Gamezone contact", "gaming support", "esports support"],
  openGraph: {
    title: "Contact Flacrom Gamezone",
    description: "Reach out to the Flacrom Gamezone support team.",
    url: "https://yourdomain.com/contact",
    siteName: "Flacrom Gamezone",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contact Flacrom Gamezone",
    description: "Get in touch with Flacrom Gamezone support.",
  },
  alternates: { canonical: "https://yourdomain.com/contact" },
};

export default function ContactRoute() {
  return <ContactPage />;
}
