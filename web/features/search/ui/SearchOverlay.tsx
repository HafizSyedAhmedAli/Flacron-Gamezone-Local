"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  X,
  Trophy,
  Users,
  Play,
  TrendingUp,
  Clock,
  Globe,
  ChevronRight,
} from "lucide-react";
import { apiGet } from "@/shared/api/base";
import { cn } from "@/shared/lib/utils";

// --- Interfaces ---
interface League {
  id: string;
  name: string;
  country: string | null;
  logo: string;
}
interface Team {
  id: string;
  name: string;
  logo: string | null;
}
interface Match {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  league: League | null;
  kickoffTime: string;
  status: "UPCOMING" | "LIVE" | "FINISHED";
  score: string | null;
}
interface SearchResults {
  leagues: League[];
  teams: Team[];
  matches: Match[];
}
interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_KEY = "fgz_recent_searches";

// --- Helper Functions ---
function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function addRecentSearch(query: string) {
  const recent = getRecentSearches()
    .filter((s) => s !== query)
    .slice(0, 4);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
}

// --- Main Component ---
export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // FIXED: Added backticks for template literal
        const data = await apiGet<SearchResults>(
          `/api/search?q=${encodeURIComponent(query)}`,
        );
        setResults(data);
      } catch {
        setResults(null);
      }
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleResultClick = () => {
    if (query.trim()) addRecentSearch(query.trim());
    setQuery("");
    onClose();
  };

  const handleClose = () => {
    setQuery("");
    onClose();
  };

  if (!isOpen) return null;

  const hasResults =
    results &&
    (results.leagues.length > 0 ||
      results.teams.length > 0 ||
      results.matches.length > 0);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh]"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        onClick={handleClose}
      />

      <div className="relative w-full max-w-2xl mx-4 bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-700/60 rounded-3xl shadow-2xl overflow-hidden">
        {/* Search Input Area */}
        <div className="p-5 border-b border-slate-700/40 flex items-center gap-4">
          <Search
            className={cn(
              "w-5 h-5 flex-shrink-0 transition-colors",
              loading
                ? "text-blue-400 animate-pulse"
                : query
                  ? "text-blue-400"
                  : "text-slate-500",
            )}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leagues, teams, matches…"
            className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-base"
          />
          {query ? (
            <button
              onClick={() => setQuery("")}
              className="p-1.5 hover:bg-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:flex items-center gap-1 text-slate-500 text-xs bg-slate-800/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40 font-mono">
              ESC
            </kbd>
          )}
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-700/60 rounded-xl text-slate-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4 border-b border-slate-700/30">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5" />
                Recent
              </p>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="px-3 py-1.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 hover:border-blue-500/40 rounded-xl text-sm text-slate-300 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Links */}
          {!query && (
            <div className="p-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" />
                Quick Links
              </p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { href: "/leagues", icon: Trophy, label: "Leagues" },
                  { href: "/teams", label: "Teams", icon: Users },
                  { href: "/streams", label: "Streams", icon: Play },
                ].map(({ href, icon: Icon, label }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={handleClose}
                    className="flex flex-col items-center gap-2.5 p-4 bg-slate-800/40 hover:bg-slate-700/60 rounded-2xl border border-slate-700/40 hover:border-slate-600/60 transition-all group"
                  >
                    <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Icon className="w-5 h-5 text-blue-400" />
                    </div>
                    <span className="text-xs font-semibold text-slate-400 group-hover:text-slate-200 transition-colors">
                      {label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Loading State */}
          {query && loading && (
            <div className="p-8 text-center text-slate-400">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm font-medium">Searching…</p>
            </div>
          )}

          {/* No Results */}
          {query && !loading && !hasResults && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-slate-300 font-semibold mb-1">
                No results found
              </p>
              <p className="text-slate-500 text-sm">Try different keywords</p>
            </div>
          )}

          {/* Render Results */}
          {hasResults && (
            <div className="p-3 space-y-1">
              {results?.leagues && results.leagues.length > 0 && (
                <Section icon={Trophy} label="Leagues" color="blue">
                  {results.leagues.map((league) => (
                    <ResultItem
                      key={league.id}
                      href={`/leagues/${league.id}`}
                      onClick={handleResultClick}
                    >
                      <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center overflow-hidden">
                        <img
                          src={league.logo}
                          alt={league.name}
                          className="w-7 h-7 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {league.name}
                        </p>
                        {league.country && (
                          <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3" />
                            {league.country}
                          </p>
                        )}
                      </div>
                    </ResultItem>
                  ))}
                </Section>
              )}

              {results?.teams && results.teams.length > 0 && (
                <Section icon={Users} label="Teams" color="purple">
                  {results.teams.map((team) => (
                    <ResultItem
                      key={team.id}
                      href={`/teams/${team.id}`}
                      onClick={handleResultClick}
                    >
                      <div className="w-9 h-9 bg-purple-500/10 rounded-xl flex items-center justify-center overflow-hidden">
                        {team.logo ? (
                          <img
                            src={team.logo}
                            alt={team.name}
                            className="w-7 h-7 object-contain"
                          />
                        ) : (
                          <span className="text-sm font-bold text-purple-400">
                            {team.name.slice(0, 2)}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {team.name}
                        </p>
                      </div>
                    </ResultItem>
                  ))}
                </Section>
              )}

              {results?.matches && results.matches.length > 0 && (
                <Section icon={Play} label="Matches" color="green">
                  {results.matches.map((match) => (
                    <ResultItem
                      key={match.id}
                      href={`/match/${match.id}`}
                      onClick={handleResultClick}
                    >
                      <div className="w-9 h-9 bg-green-500/10 rounded-xl flex items-center justify-center">
                        <Play className="w-4 h-4 text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate">
                          {match.homeTeam.name} vs {match.awayTeam.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {match.status === "LIVE" && (
                            <span className="inline-flex w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          )}
                          <p className="text-xs text-slate-500">
                            {match.league?.name ?? "Match"}
                          </p>
                          {match.score && (
                            <p className="text-xs font-bold text-green-400">
                              {match.score}
                            </p>
                          )}
                        </div>
                      </div>
                    </ResultItem>
                  ))}
                </Section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-700/40 flex items-center justify-between text-xs text-slate-600">
          <span>Results from all leagues & teams</span>
          <Link
            href={query ? `/search?q=${encodeURIComponent(query)}` : "/search"}
            onClick={handleResultClick}
            className="flex items-center gap-1 text-blue-500 hover:text-blue-400 transition-colors font-semibold"
          >
            View all results <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

// --- Sub-components ---
function Section({
  icon: Icon,
  label,
  color,
  children,
}: {
  icon: React.ElementType;
  label: string;
  color: string;
  children: React.ReactNode;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10",
    purple: "text-purple-400 bg-purple-500/10",
    green: "text-green-400 bg-green-500/10",
  };
  return (
    <div className="mb-4 last:mb-0">
      <div className="px-3 py-2 flex items-center gap-2.5">
        <div
          className={cn(
            "w-6 h-6 rounded-lg flex items-center justify-center",
            colors[color],
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </div>
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>
      {children}
    </div>
  );
}

function ResultItem({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-800/60 rounded-xl transition-all group"
    >
      {children}
      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
    </Link>
  );
}
