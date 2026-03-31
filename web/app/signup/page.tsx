import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Create Account | Flacron Gamezone",
  description: "Join Flacron Gamezone today. Create your free account.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "Create Account | Flacron Gamezone",
    description: "Join Flacron Gamezone today.",
    type: "website",
  },
};

const SignupClient = dynamic(
  () => import("../../page-components/signup/ui/SignupClient").then((m) => m.SignupClient),
  { ssr: false },
);

export default function SignupPage() {
  return <SignupClient />;
}
