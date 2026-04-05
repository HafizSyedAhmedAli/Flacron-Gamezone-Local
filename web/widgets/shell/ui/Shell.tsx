"use client";

import { cn } from "@/shared/lib/utils";
import { getToken } from "@/shared/api/base";
import { isAdmin, logout as authLogout } from "@/features/auth/model/auth";
import { SearchOverlay } from "@/features/search/ui/SearchOverlay";
import { Button } from "@/shared/ui/button";
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
  Tag,
  LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Image from "next/image";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

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

export function Shell({ children, className }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const refreshAuth = () => {
      const token = getToken();
      setIsAuthenticated(!!token);
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
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

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
            <Link href="/" className="flex items-center gap-3  group">
              <Image
                src="/logo.png"
                width={64}
                height={64}
                alt="flacron-logo"
                className="object-contain h-full w-auto"
              />
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
              <button
                onClick={() => setSearchOpen(true)}
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:from-blue-500 hover:to-cyan-400 hover:scale-105 transition-all duration-200 mr-1"
              >
                <Search className="w-4 h-4" />
                Search
              </button>
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex gap-2 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
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
              <Link href="/" className="flex items-center gap-3 mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-50" />
                  <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                </div>
                <div className="font-black leading-none">
                  <span className="text-white">Flacron</span>
                  <br />
                  <span className="text-sm bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                    GameZone
                  </span>
                </div>
              </Link>
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
