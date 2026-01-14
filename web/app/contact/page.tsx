"use client";

import { Shell } from "../../components/layout";

export default function Contact() {
  return (
    <Shell>
      <h1 className="text-xl font-semibold mb-4">Support / Contact</h1>
      <div className="rounded-2xl border p-5 space-y-3 max-w-xl">
        <p className="text-sm text-slate-600">
          This MVP includes a contact page placeholder. In production, you can connect this to email or a ticketing system.
        </p>
        <form className="space-y-2" onSubmit={(e) => { e.preventDefault(); alert("Thanks! (Demo)"); }}>
          <input className="border rounded-xl px-3 py-2 w-full text-sm" placeholder="Your email" type="email" required />
          <textarea className="border rounded-xl px-3 py-2 w-full text-sm" placeholder="Message" rows={5} required />
          <button className="border rounded-xl px-4 py-2 text-sm">Send</button>
        </form>
        <div className="text-sm text-slate-600">Support email: support@flacron.example</div>
      </div>
    </Shell>
  );
}
