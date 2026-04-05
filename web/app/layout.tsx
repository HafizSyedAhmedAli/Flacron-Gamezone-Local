import type { Metadata } from "next";
import "./globals.css";
import { Shell } from "@/widgets/shell/ui/Shell";
// Import from the 'geist' package instead
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";

export const metadata: Metadata = {
  title: "FootballZone",
  description: "Live scores, streams, AI summaries",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
