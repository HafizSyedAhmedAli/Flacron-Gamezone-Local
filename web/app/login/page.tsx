import { Metadata } from "next";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "Sign In | Flacron Gamezone",
  description: "Sign in to your Flacron Gamezone account.",
  robots: { index: false, follow: false },
};

const LoginClient = dynamic(
  () => import("@/pages/login/ui/LoginClient").then((m) => m.LoginClient),
  { ssr: false },
);

export default function LoginPage() {
  return <LoginClient />;
}
