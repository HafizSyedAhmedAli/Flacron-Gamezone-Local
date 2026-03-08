// app/signup/page.tsx
import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Create Account | Flacron Gamezone",
  description:
    "Join Flacron Gamezone today. Create your free account to access live football match streaming, AI-powered match analysis, real-time scores, and premium gaming features.",
  keywords: [
    "sign up",
    "create account",
    "register",
    "Flacron Gamezone",
    "football streaming",
    "join",
  ],
  robots: {
    index: false, // Auth pages should not be indexed
    follow: false,
  },
  openGraph: {
    title: "Create Account | Flacron Gamezone",
    description:
      "Join Flacron Gamezone today. Access live football streaming, AI match analysis, and premium gaming features.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Create Account | Flacron Gamezone",
    description:
      "Join Flacron Gamezone today. Access live football streaming, AI match analysis, and premium gaming features.",
  },
};

// useRouter inside — must be ssr: false
const SignupClient = dynamic(
  () => import("./SignupClient").then((m) => m.SignupClient),
  { ssr: false }
);

export default function SignupPage() {
  return <SignupClient />;
}