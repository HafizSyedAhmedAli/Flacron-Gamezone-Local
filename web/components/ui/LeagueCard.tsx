import Link from "next/link";
import Image from "next/image";

interface LeagueCardProps {
  id: string;
  name: string;
  country: string | null;
  logo: string;
  index?: number; // For staggered animation
}

export function LeagueCard({
  id,
  name,
  country,
  logo,
  index = 0,
}: LeagueCardProps) {
  return (
    <Link
      href={`/leagues/${id}`}
      style={{ animationDelay: `${index * 50}ms` }}
      className="animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="bg-card border border-slate-700/50 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-500/50 transition-all duration-300 cursor-pointer group h-full">
        <div className="w-16 h-16 rounded-lg mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
          <Image
            src={logo}
            alt={name}
            width={80}
            height={80}
            className="object-contain"
          />
        </div>
        <h3 className="font-semibold text-center line-clamp-2">{name}</h3>
        {country && (
          <p className="text-xs text-muted-foreground mt-1">{country}</p>
        )}
      </div>
    </Link>
  );
}
