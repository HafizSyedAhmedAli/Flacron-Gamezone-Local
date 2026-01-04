"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, getToken } from "./api";

export function Shell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    setAuthed(!!getToken());
  }, []);

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <Link href="/" className="font-semibold">Flacron GameZone</Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/live">Live</Link>
            <Link href="/matches">Matches</Link>
            <Link href="/leagues">Leagues</Link>
            <Link href="/teams">Teams</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/contact">Support</Link>
            {authed ? (
              <>
                <Link href="/dashboard">Dashboard</Link>
                <button className="underline" onClick={() => { clearToken(); location.href = "/"; }}>Logout</button>
              </>
            ) : (
              <>
                <Link href="/login">Login</Link>
                <Link href="/signup">Sign up</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      <footer className="border-t mt-10">
        <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-slate-600 flex gap-4">
          <Link href="/terms">Terms</Link>
          <Link href="/privacy">Privacy</Link>
          <span>© {new Date().getFullYear()} Flacron GameZone</span>
        </div>
      </footer>
    </div>
  );
}
