import { Shell } from "../components/layout";
import Link from "next/link";

export default function Home() {
  return (
    <Shell>
      <div className="space-y-6">
        <div className="rounded-2xl border p-6">
          <h1 className="text-2xl font-semibold">Football Match Discovery & Live Game Platform</h1>
          <p className="text-slate-600 mt-2">
            Browse leagues, teams, live matches, and match details. Premium plans unlock additional features.
          </p>
          <div className="flex gap-3 mt-4">
            <Link className="rounded-xl border px-4 py-2" href="/live">View live matches</Link>
            <Link className="rounded-xl border px-4 py-2" href="/matches">Browse all matches</Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card title="Live matches" href="/live" desc="Auto-refresh list every 30–60s on the Live page." />
          <Card title="Leagues & teams" href="/leagues" desc="Browse featured leagues and team profiles." />
          <Card title="AI previews & summaries" href="/matches" desc="Generate match previews/summaries on match pages." />
        </div>
      </div>
    </Shell>
  );
}

function Card({ title, desc, href }: { title: string; desc: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border p-5 hover:shadow-sm transition">
      <div className="font-semibold">{title}</div>
      <div className="text-sm text-slate-600 mt-1">{desc}</div>
    </Link>
  );
}
