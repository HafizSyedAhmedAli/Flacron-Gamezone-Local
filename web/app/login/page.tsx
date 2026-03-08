// app/login/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Sign In | Flacron Gamezone",
  description:
    "Sign in to your Flacron Gamezone account to access live football matches, real-time scores, AI match previews, and premium streaming.",
  keywords: [
    "login",
    "sign in",
    "Flacron Gamezone",
    "football streaming",
    "live matches",
  ],
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
  openGraph: {
    title: "Sign In | Flacron Gamezone",
    description:
      "Sign in to your Flacron Gamezone account to access live football matches and premium streaming.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Sign In | Flacron Gamezone",
    description:
      "Sign in to your Flacron Gamezone account to access live football matches and premium streaming.",
  },
};

// useRouter is used inside LoginClient — must be ssr: false
const LoginClient = dynamic(
  () => import("./LoginClient").then((m) => m.LoginClient),
  { ssr: false }
);

export default function LoginPage() {
  return <LoginClient />;
}