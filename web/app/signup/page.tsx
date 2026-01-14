"use client";

import { Shell } from "../../components/layout";
import { apiAuthPost, setToken } from "../../components/api";
import { useState } from "react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");

  async function submit(e: any) {
    e.preventDefault();
    setErr("");
    try {
      const data = await apiAuthPost<any>("/api/auth/signup", { email, password });
      setToken(data.token);
      location.href = "/dashboard";
    } catch (e: any) {
      setErr("Signup failed");
    }
  }

  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">Sign up</h1>
      <form onSubmit={submit} className="rounded-2xl border p-5 space-y-3 max-w-md">
        {err && <div className="text-sm text-red-700">{err}</div>}
        <input className="border rounded-xl px-3 py-2 w-full text-sm" placeholder="Email" type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
        <input className="border rounded-xl px-3 py-2 w-full text-sm" placeholder="Password (min 6)" type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
        <button className="border rounded-xl px-4 py-2 text-sm">Create account</button>
      </form>
    </Shell>
  );
}
