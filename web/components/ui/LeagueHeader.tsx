import Image from "next/image";

interface LeagueHeaderProps {
  name: string;
  country: string | null;
  logo: string | null;
}

export function LeagueHeader({ name, country, logo }: LeagueHeaderProps) {
  return (
    <div className="bg-card border border-slate-700/50 rounded-xl p-6">
      <div className="flex items-center gap-4">
        {logo && (
          <Image
            src={logo}
            alt={name}
            width={80}
            height={80}
            className="rounded-lg"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">{name}</h1>
          {country && <p className="text-muted-foreground mt-1">{country}</p>}
        </div>
      </div>
    </div>
  );
}
