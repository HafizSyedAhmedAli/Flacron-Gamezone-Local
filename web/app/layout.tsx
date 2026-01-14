import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Flacron GameZone",
  description: "Football match discovery and live game platform."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
