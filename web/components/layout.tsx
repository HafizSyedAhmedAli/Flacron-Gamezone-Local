"use client";

import { Button } from "@/components/ui/button";
import {
  logout as authLogout,
  isAuthenticated as checkAuth,
  isAdmin,
} from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  LogOut,
  Menu,
  X,
  Trophy,
  Zap,
  Play,
  Users,
  Shield,
  Globe,
  Mail,
  Heart,
  Github,
  Twitter,
  Facebook,
  Search,
  Clock,
  TrendingUp,
  ChevronRight,
  Tag,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { apiGet } from "@/components/api";

// ─── Types ─────────────────────────────────────────────────────────────────────
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
  venue: string | null;
}
interface SearchResults {
  leagues: League[];
  teams: Team[];
  matches: Match[];
}

// ─── Search Overlay ─────────────────────────────────────────────────────────────
function SearchOverlay({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<
    "all" | "leagues" | "teams" | "matches"
  >("all");
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches
  useEffect(() => {
    try {
      const stored = localStorage.getItem("fgz_recent_searches");
      if (stored) setRecentSearches(JSON.parse(stored));
    } catch {}
  }, []);

  // Focus + lock scroll
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults(null);
      setActiveFilter("all");
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ESC to close
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      return;
    }
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await apiGet<SearchResults>(
          `/api/search?q=${encodeURIComponent(query)}`,
          { signal: controller.signal },
        );
        setResults(res);
      } catch (e) {
        if ((e as Error).name !== "AbortError") console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [query]);

  const saveSearch = (term: string) => {
    if (!term.trim()) return;
    const updated = [term, ...recentSearches.filter((s) => s !== term)].slice(
      0,
      5,
    );
    setRecentSearches(updated);
    try {
      localStorage.setItem("fgz_recent_searches", JSON.stringify(updated));
    } catch {}
  };

  const handleResultClick = (name: string) => {
    saveSearch(name);
    onClose();
  };

  const totalResults = results
    ? results.leagues.length + results.teams.length + results.matches.length
    : 0;

  const showLeagues = activeFilter === "all" || activeFilter === "leagues";
  const showTeams = activeFilter === "all" || activeFilter === "teams";
  const showMatches = activeFilter === "all" || activeFilter === "matches";

  const FILTERS = [
    {
      key: "all" as const,
      label: "All",
      icon: <TrendingUp className="w-3.5 h-3.5" />,
    },
    {
      key: "leagues" as const,
      label: "Leagues",
      icon: <Trophy className="w-3.5 h-3.5" />,
    },
    {
      key: "teams" as const,
      label: "Teams",
      icon: <Users className="w-3.5 h-3.5" />,
    },
    {
      key: "matches" as const,
      label: "Matches",
      icon: <Play className="w-3.5 h-3.5" />,
    },
  ];

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative z-10 w-full max-w-3xl mx-auto mt-16 md:mt-24 px-4 flex flex-col"
        style={{ maxHeight: "80vh" }}
      >
        {/* Input */}
        <div className="relative flex items-center bg-slate-800/90 border-2 border-blue-500/40 rounded-2xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          <Search className="absolute left-5 w-5 h-5 text-blue-400 pointer-events-none flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leagues, teams, matches..."
            className="w-full bg-transparent pl-14 pr-24 py-5 text-white text-lg placeholder:text-slate-500 focus:outline-none"
          />
          <div className="absolute right-3 flex items-center gap-2">
            {isSearching && (
              <div className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin" />
            )}
            {query && !isSearching && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults(null);
                  inputRef.current?.focus();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters */}
        {results && totalResults > 0 && (
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",
                  activeFilter === f.key
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/20"
                    : "bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-700/60 border border-slate-700/50",
                )}
              >
                {f.icon}
                {f.label}
                {f.key !== "all" && (
                  <span
                    className={cn(
                      "text-xs rounded-full px-1.5",
                      activeFilter === f.key ? "bg-white/20" : "bg-slate-700",
                    )}
                  >
                    {f.key === "leagues"
                      ? results.leagues.length
                      : f.key === "teams"
                        ? results.teams.length
                        : results.matches.length}
                  </span>
                )}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500">
              {totalResults} result{totalResults !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* Results panel */}
        <div className="mt-3 bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-y-auto flex-1 shadow-2xl">
          {/* No query — recent + quick browse */}
          {!query && (
            <div className="p-6">
              {recentSearches.length > 0 && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" /> Recent Searches
                    </p>
                    <button
                      onClick={() => {
                        setRecentSearches([]);
                        try {
                          localStorage.removeItem("fgz_recent_searches");
                        } catch {}
                      }}
                      className="text-xs text-slate-600 hover:text-slate-400 transition-colors"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {recentSearches.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(s)}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/40 hover:border-blue-500/30 rounded-xl text-sm text-slate-300 hover:text-white transition-all"
                      >
                        <Clock className="w-3 h-3 text-slate-500" />
                        {s}
                      </button>
                    ))}
                  </div>
                </>
              )}

              {recentSearches.length === 0 && (
                <div className="text-center py-6 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-blue-400" />
                  </div>
                  <p className="text-slate-400 font-medium">
                    Search for leagues, teams or matches
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Type anything to get started
                  </p>
                </div>
              )}

              <div className="border-t border-slate-800/60 pt-5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <TrendingUp className="w-3.5 h-3.5" /> Quick Browse
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "🏆 La Liga", href: "/leagues" },
                    { label: "⚽ Premier League", href: "/leagues" },
                    { label: "🔴 Live Matches", href: "/live" },
                    { label: "📅 Upcoming Games", href: "/matches" },
                  ].map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={onClose}
                      className="flex items-center justify-between px-4 py-3 bg-slate-800/40 hover:bg-slate-700/50 border border-slate-700/30 hover:border-blue-500/30 rounded-xl text-sm text-slate-300 hover:text-white transition-all group"
                    >
                      {item.label}
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Searching */}
          {query && isSearching && !results && (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-slate-500 text-sm">Searching...</p>
            </div>
          )}

          {/* Results */}
          {query && results && (
            <div className="divide-y divide-slate-800/60">
              {/* Leagues */}
              {showLeagues && results.leagues.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Trophy className="w-3.5 h-3.5 text-yellow-500" /> Leagues
                  </p>
                  <div className="space-y-1">
                    {results.leagues.map((league) => (
                      <Link
                        key={league.id}
                        href={`/leagues/${league.id}`}
                        onClick={() => handleResultClick(league.name)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/60 transition-all group"
                      >
                        <div className="w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center p-1.5 flex-shrink-0">
                          <img
                            src={league.logo}
                            alt={league.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-white group-hover:text-blue-400 transition-colors truncate">
                            {league.name}
                          </p>
                          {league.country && (
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              <Globe className="w-3 h-3" />
                              {league.country}
                            </p>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-blue-400 flex-shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Teams */}
              {showTeams && results.teams.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-cyan-400" /> Teams
                  </p>
                  <div className="space-y-1">
                    {results.teams.map((team) => (
                      <Link
                        key={team.id}
                        href={`/teams/${team.id}`}
                        onClick={() => handleResultClick(team.name)}
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/60 transition-all group"
                      >
                        <div className="w-10 h-10 bg-slate-800/60 rounded-xl flex items-center justify-center flex-shrink-0">
                          {team.logo ? (
                            <img
                              src={team.logo}
                              alt={team.name}
                              className="w-8 h-8 object-contain"
                            />
                          ) : (
                            <span className="text-xs font-black text-slate-400">
                              {team.name.substring(0, 2).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors flex-1 truncate">
                          {team.name}
                        </p>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Matches */}
              {showMatches && results.matches.length > 0 && (
                <div className="p-4">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <Play className="w-3.5 h-3.5 text-green-400" /> Matches
                  </p>
                  <div className="space-y-1">
                    {results.matches.map((match) => (
                      <Link
                        key={match.id}
                        href={`/match/${match.id}`}
                        onClick={() =>
                          handleResultClick(
                            `${match.homeTeam.name} vs ${match.awayTeam.name}`,
                          )
                        }
                        className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/60 transition-all group"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-sm font-semibold text-white truncate">
                            {match.homeTeam.name}
                          </span>
                          <span className="text-slate-600 text-xs flex-shrink-0">
                            vs
                          </span>
                          <span className="text-sm font-semibold text-white truncate">
                            {match.awayTeam.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {match.status === "LIVE" && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              LIVE
                            </span>
                          )}
                          {match.status === "UPCOMING" && (
                            <span className="text-xs text-slate-500">
                              {new Date(match.kickoffTime).toLocaleDateString(
                                "en-US",
                                { month: "short", day: "numeric" },
                              )}
                            </span>
                          )}
                          {match.score && (
                            <span className="text-sm font-bold text-white bg-slate-700/60 px-2 py-0.5 rounded-lg">
                              {match.score}
                            </span>
                          )}
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-green-400 flex-shrink-0 transition-colors" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* No results */}
              {totalResults === 0 && (
                <div className="p-12 text-center">
                  <div className="w-14 h-14 bg-slate-800/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Search className="w-6 h-6 text-slate-600" />
                  </div>
                  <p className="text-slate-400 font-medium">
                    No results for "{query}"
                  </p>
                  <p className="text-slate-600 text-sm mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Hint */}
        <p className="text-center text-slate-700 text-xs mt-3 pb-2">
          Press{" "}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-500 font-mono">
            ESC
          </kbd>{" "}
          to close
        </p>
      </div>
    </div>
  );
}

// ─── Shell ──────────────────────────────────────────────────────────────────────
interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const refreshAuth = () => {
      setIsAuthenticated(checkAuth());
      setUserIsAdmin(isAdmin());
    };
    refreshAuth();
    const onFocus = () => refreshAuth();
    const onVisibility = () => {
      if (document.visibilityState === "visible") refreshAuth();
    };
    const onStorage = (e: StorageEvent) => {
      if (!e.key || e.key === "fgz_user" || e.key === "fgz_token")
        refreshAuth();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Allow other pages (e.g. Dashboard) to open the search overlay
  useEffect(() => {
    const fn = () => setSearchOpen(true);
    window.addEventListener("fgz:open-search", fn as EventListener);
    return () =>
      window.removeEventListener("fgz:open-search", fn as EventListener);
  }, []);

  const handleLogout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUserIsAdmin(false);
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-background text-foreground",
        className,
      )}
    >
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* ── Header ── */}
      <header
        className={cn(
          "sticky top-0 z-50 transition-all duration-300",
          scrolled
            ? "bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-lg shadow-black/10"
            : "bg-slate-900/80 backdrop-blur-md border-b border-slate-800/50",
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
              </div>
              <div className="hidden sm:block">
                <div className="font-display font-black text-xl leading-none">
                  <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                    Flacron
                  </span>
                  <br />
                  <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    GameZone
                  </span>
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                href="/"
                active={pathname === "/"}
                icon={<Zap className="w-4 h-4" />}
              >
                Home
              </NavLink>
              <NavLink
                href="/live"
                active={pathname === "/live"}
                icon={<Play className="w-4 h-4" />}
              >
                Live
              </NavLink>
              <NavLink
                href="/matches"
                active={pathname === "/matches"}
                icon={<Trophy className="w-4 h-4" />}
              >
                Matches
              </NavLink>
              <NavLink
                href="/leagues"
                active={pathname === "/leagues"}
                icon={<Shield className="w-4 h-4" />}
              >
                Leagues
              </NavLink>
              <NavLink
                href="/teams"
                active={pathname === "/teams"}
                icon={<Users className="w-4 h-4" />}
              >
                Teams
              </NavLink>
              <NavLink
                href="/pricing"
                active={pathname === "/pricing"}
                icon={<Tag className="w-4 h-4" />}
              >
                Pricing
              </NavLink>
              {isAuthenticated && (
                <NavLink
                  href={userIsAdmin ? "/admin" : "/dashboard"}
                  active={pathname === "/dashboard" || pathname === "/admin"}
                  icon={<LayoutDashboard className="w-4 h-4" />}
                >
                  {userIsAdmin ? "Admin" : "Dashboard"}
                </NavLink>
              )}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              {/* Search button — desktop, sits right before auth */}
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-blue-500 hover:to-cyan-400 hover:scale-105 transition-all duration-200 mr-1"
              >
                <Search className="w-4 h-4" />
                Search
              </button>

              {/* Mobile search icon */}
              <button
                onClick={() => setSearchOpen(true)}
                className="md:hidden p-2 hover:bg-blue-500/10 rounded-lg transition-colors text-blue-400"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              <Link
                href="/contact"
                aria-label="Contact us"
                className="hidden sm:inline-flex"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-800/50 p-2 rounded-md"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </Link>

              {isAuthenticated ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="hidden sm:inline-flex gap-2 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button
                      size="sm"
                      className="hidden sm:inline-flex bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-500/20"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </>
              )}

              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Nav */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-slate-700/50 pt-4 animate-in slide-in-from-top-4 duration-300">
              <div className="flex flex-col gap-2">
                <MobileNavLink
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Zap className="w-4 h-4" />}
                  active={pathname === "/"}
                >
                  Home
                </MobileNavLink>
                <MobileNavLink
                  href="/live"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Play className="w-4 h-4" />}
                  active={pathname === "/live"}
                >
                  Live
                </MobileNavLink>
                <MobileNavLink
                  href="/matches"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Trophy className="w-4 h-4" />}
                  active={pathname === "/matches"}
                >
                  Matches
                </MobileNavLink>
                <MobileNavLink
                  href="/leagues"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Shield className="w-4 h-4" />}
                  active={pathname === "/leagues"}
                >
                  Leagues
                </MobileNavLink>
                <MobileNavLink
                  href="/teams"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Users className="w-4 h-4" />}
                  active={pathname === "/teams"}
                >
                  Teams
                </MobileNavLink>
                <MobileNavLink
                  href="/pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Tag className="w-4 h-4" />}
                  active={pathname === "/pricing"}
                >
                  Pricing
                </MobileNavLink>
                {isAuthenticated && (
                  <MobileNavLink
                    href={userIsAdmin ? "/admin" : "/dashboard"}
                    onClick={() => setMobileMenuOpen(false)}
                    icon={<LayoutDashboard className="w-4 h-4" />}
                    active={pathname === "/dashboard" || pathname === "/admin"}
                  >
                    {userIsAdmin ? "Admin" : "Dashboard"}
                  </MobileNavLink>
                )}
                <MobileNavLink
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Mail className="w-4 h-4" />}
                  active={pathname === "/contact"}
                >
                  Contact
                </MobileNavLink>
                <div className="h-px bg-slate-700/50 my-2" />
                {isAuthenticated ? (
                  <>
                    <button
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <MobileNavLink
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Login
                    </MobileNavLink>
                    <MobileNavLink
                      href="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign Up
                    </MobileNavLink>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* ── Footer ── */}
      <footer className="relative overflow-hidden bg-slate-900/50 border-t border-slate-800/50 mt-12">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none" />
        <div className="relative container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div className="font-display font-black leading-none">
                  <span className="text-white">Flacron</span>
                  <br />
                  <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    GameZone
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                Your ultimate destination for live football matches and
                comprehensive league coverage.
              </p>
              <div className="flex gap-2">
                {[
                  { href: "https://twitter.com", Icon: Twitter },
                  { href: "https://facebook.com", Icon: Facebook },
                  { href: "https://github.com", Icon: Github },
                ].map(({ href, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/50 rounded-lg flex items-center justify-center transition-all group"
                  >
                    <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-400" /> Platform
              </h3>
              <ul className="space-y-2 text-sm">
                <FooterLink href="/live">Live Matches</FooterLink>
                <FooterLink href="/matches">All Matches</FooterLink>
                <FooterLink href="/leagues">Leagues</FooterLink>
                <FooterLink href="/teams">Teams</FooterLink>
                <li>
                  <button
                    onClick={() => setSearchOpen(true)}
                    className="text-slate-400 hover:text-blue-400 transition-colors inline-flex items-center gap-1.5"
                  >
                    <Search className="w-3 h-3" /> Search
                  </button>
                </li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" /> Account
              </h3>
              <ul className="space-y-2 text-sm">
                <FooterLink href="/pricing">Pricing</FooterLink>
                <FooterLink href="/login">Login</FooterLink>
                <FooterLink href="/signup">Sign Up</FooterLink>
                {isAuthenticated && (
                  <FooterLink href={userIsAdmin ? "/admin" : "/dashboard"}>
                    Dashboard
                  </FooterLink>
                )}
              </ul>
            </div>

            {/* Legal & Support */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" /> Legal & Support
              </h3>
              <ul className="space-y-2 text-sm">
                <FooterLink href="/privacy">Privacy Policy</FooterLink>
                <FooterLink href="/terms">Terms of Service</FooterLink>
                <FooterLink href="/refund-policy">Refund Policy</FooterLink>
                <FooterLink href="/help">Help Center</FooterLink>
                <FooterLink href="/billing-support">Billing Support</FooterLink>
                <FooterLink href="/about">About</FooterLink>
                <FooterLink href="/contact">Contact Us</FooterLink>
                <li>
                  <a
                    href="mailto:support@flacrongamezone.com"
                    className="text-slate-400 hover:text-blue-400 transition-colors flex items-center gap-2"
                  >
                    <Mail className="w-3 h-3" /> Support Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800/50 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; {new Date().getFullYear()} Flacron GameZone. All rights
              reserved.
            </p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" />
              <span>for football fans worldwide</span>
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── Nav helpers ───────────────────────────────────────────────────────────────
function NavLink({
  href,
  children,
  active,
  icon,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-xl",
        active
          ? "text-blue-400 bg-blue-500/10 shadow-lg shadow-blue-500/10"
          : "text-slate-300 hover:text-white hover:bg-slate-800/50",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
  icon,
  active,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all rounded-xl",
        active
          ? "text-blue-400 bg-blue-500/10"
          : "text-slate-300 hover:text-white hover:bg-slate-800/50",
      )}
    >
      {icon}
      {children}
    </Link>
  );
}

function FooterLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="text-slate-400 hover:text-blue-400 transition-colors inline-block"
      >
        {children}
      </Link>
    </li>
  );
}
