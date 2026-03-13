"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Menu,
  X,
  Home,
  Trophy,
  Users,
  Play,
  LogOut,
  Settings,
  Crown,
  User,
  Zap,
  ChevronDown,
} from "lucide-react";
import { SearchOverlay } from "@/features/search/ui/SearchOverlay";
import { getToken, clearToken } from "@/shared/api/base";
import { getUser, clearUser } from "@/features/auth/model/auth";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/leagues", label: "Leagues", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Users },
  { href: "/streams", label: "Live Streams", icon: Play },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getUser>>(null);

  useEffect(() => {
    setUser(getUser());
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    const onOpenSearch = () => setSearchOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("fgz:open-search", onOpenSearch);

    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("fgz:open-search", onOpenSearch);
    };
  }, []);

  const isActive = (item: NavItem) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  const handleLogout = () => {
    clearToken();
    clearUser();
    window.location.href = "/";
  };

  const token = typeof window !== "undefined" ? getToken() : null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled ? "bg-slate-950/95 backdrop-blur-xl border-b border-slate-700/60 shadow-2xl shadow-black/20" : "bg-slate-950/80 backdrop-blur-md border-b border-slate-800/50"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/"
              className="flex items-center gap-2.5 group flex-shrink-0"
            >
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-xl blur-md opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
              </div>
              <span className="text-lg font-black tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent group-hover:from-blue-200 group-hover:to-cyan-200 transition-all duration-300">
                FootballZone
              </span>
            </Link>
            <nav
              className="hidden md:flex items-center gap-1 flex-1"
              aria-label="Main navigation"
            >
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${active ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2.5 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600/80 rounded-xl text-slate-400 hover:text-slate-200 text-sm transition-all duration-200 group"
              >
                <Search className="w-4 h-4 group-hover:text-blue-400 transition-colors" />
                <span className="hidden sm:inline text-xs">Search</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-900/80 border border-slate-700/50 rounded text-[10px] font-mono text-slate-500">
                  ⌘K
                </kbd>
              </button>
              {token && user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 rounded-xl text-sm font-medium text-slate-300 hover:text-white transition-all duration-200"
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-xs font-bold text-white">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-xs truncate max-w-24">
                      {user.email.split("@")[0]}
                    </span>
                    <ChevronDown
                      className={`w-3.5 h-3.5 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {userMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-slate-700/50 rounded-2xl shadow-2xl z-50 overflow-hidden py-1">
                        <div className="px-4 py-3 border-b border-slate-700/50">
                          <p className="text-xs text-slate-500 mb-0.5">
                            Signed in as
                          </p>
                          <p className="text-sm font-semibold text-slate-200 truncate">
                            {user.email}
                          </p>
                          {user.role === "ADMIN" && (
                            <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                              <Crown className="w-2.5 h-2.5" />
                              Admin
                            </span>
                          )}
                        </div>
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                          >
                            <User className="w-4 h-4 text-slate-500" />
                            Profile
                          </Link>
                          {user.role === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                            >
                              <Settings className="w-4 h-4 text-slate-500" />
                              Admin Panel
                            </Link>
                          )}
                        </div>
                        <div className="border-t border-slate-700/50 py-1">
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign out
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link
                    href="/login"
                    className="px-3.5 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/20 transition-all duration-200 hover:scale-105"
                  >
                    Sign up
                  </Link>
                </div>
              )}
              <button
                onClick={() => setMobileOpen((v) => !v)}
                className="md:hidden p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 rounded-xl transition-all"
                aria-label="Toggle menu"
              >
                {mobileOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
        {mobileOpen && (
          <div className="md:hidden border-t border-slate-700/50 bg-slate-950/95 backdrop-blur-xl">
            <div className="px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${active ? "bg-blue-500/15 text-blue-300 border border-blue-500/25" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"}`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
              {!token && (
                <div className="flex gap-2 pt-2 border-t border-slate-700/50">
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-2.5 text-center text-sm font-medium text-slate-400 hover:text-white bg-slate-800/50 rounded-xl transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex-1 px-4 py-2.5 text-center text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-slate-800/50 bg-slate-950/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                FootballZone
              </span>
            </Link>
            <div className="flex items-center gap-6 text-xs text-slate-500">
              {["/leagues", "/teams", "/streams"].map((href) => (
                <Link
                  key={href}
                  href={href}
                  className="hover:text-slate-300 transition-colors capitalize"
                >
                  {href.slice(1)}
                </Link>
              ))}
            </div>
            <p className="text-xs text-slate-600">
              © {new Date().getFullYear()} FootballZone
            </p>
          </div>
        </div>
      </footer>
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
