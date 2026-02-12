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
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface ShellProps {
  children: React.ReactNode;
  className?: string;
}

export function Shell({ children, className }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Auth state refresh
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
      if (!e.key || e.key === "fgz_user" || e.key === "fgz_token") {
        refreshAuth();
      }
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

  // Scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    authLogout();
  };

  return (
    <div
      className={cn(
        "min-h-screen flex flex-col bg-background text-foreground",
        className,
      )}
    >
      {/* Header */}
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
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl blur-md opacity-50 group-hover:opacity-75 transition-opacity"></div>
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

            {/* Desktop Navigation */}
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
              <NavLink href="/pricing" active={pathname === "/pricing"}>
                Pricing
              </NavLink>
            </nav>

            {/* Right Side Actions */}
            <div className="flex items-center gap-2">
              <Link
                href="/contact"
                aria-label="Contact us"
                className="hidden sm:inline-flex"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-slate-800/50 p-2 rounded-md"
                  title="Contact us"
                >
                  <Mail className="w-4 h-4" />
                </Button>
              </Link>
              {isAuthenticated ? (
                <>
                  <Link href={userIsAdmin ? "/admin" : "/dashboard"}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="hidden sm:inline-flex hover:bg-blue-500/10 hover:text-blue-400 transition-colors"
                    >
                      {userIsAdmin ? "Admin" : "Dashboard"}
                    </Button>
                  </Link>
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
              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 hover:bg-slate-800/50 rounded-lg transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
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
                  active={pathname === "/pricing"}
                >
                  Pricing
                </MobileNavLink>
                <MobileNavLink
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  icon={<Mail className="w-4 h-4" />}
                >
                  Contact
                </MobileNavLink>

                <div className="h-px bg-slate-700/50 my-2"></div>

                {isAuthenticated ? (
                  <>
                    <MobileNavLink
                      href={userIsAdmin ? "/admin" : "/dashboard"}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {userIsAdmin ? "Admin Panel" : "Dashboard"}
                    </MobileNavLink>
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

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="relative overflow-hidden bg-slate-900/50 border-t border-slate-800/50 mt-12">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-transparent to-purple-900/10 pointer-events-none"></div>

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
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <Twitter className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <Facebook className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </a>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 bg-slate-800/50 hover:bg-blue-500/20 border border-slate-700/50 hover:border-blue-500/50 rounded-lg flex items-center justify-center transition-all group"
                >
                  <Github className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                </a>
              </div>
            </div>

            {/* Platform */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-blue-400" />
                Platform
              </h3>
              <ul className="space-y-2 text-sm">
                <FooterLink href="/live">Live Matches</FooterLink>
                <FooterLink href="/matches">All Matches</FooterLink>
                <FooterLink href="/leagues">Leagues</FooterLink>
                <FooterLink href="/teams">Teams</FooterLink>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-cyan-400" />
                Account
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

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4 text-sm text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-purple-400" />
                Legal & Support
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
                    <Mail className="w-3 h-3" />
                    Support
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
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

/* Navigation Components */
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
