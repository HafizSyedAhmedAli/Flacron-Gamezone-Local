"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getUser,
  logout as authLogout,
  isAdmin,
  isAuthenticated as checkAuth,
} from "@/lib/auth";

interface ShellProps {
  children: React.ReactNode;
}

export function Shell({ children }: ShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setIsAuthenticated(checkAuth());
    setUserIsAdmin(isAdmin());
  }, []);

  const handleLogout = () => {
    authLogout(); // This will clear token, user data, and redirect to home
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              FG
            </div>
            <span className="font-display font-bold text-lg hidden sm:inline">
              Flacron <span className="text-blue-400">GameZone</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink href="/" active={pathname === "/"}>
              Home
            </NavLink>
            <NavLink href="/live" active={pathname === "/live"}>
              Live
            </NavLink>
            <NavLink href="/matches" active={pathname === "/matches"}>
              Matches
            </NavLink>
            <NavLink href="/leagues" active={pathname === "/leagues"}>
              Leagues
            </NavLink>
            <NavLink href="/teams" active={pathname === "/teams"}>
              Teams
            </NavLink>
            <NavLink href="/pricing" active={pathname === "/pricing"}>
              Pricing
            </NavLink>
            <NavLink href="/contact" active={pathname === "/contact"}>
              Support
            </NavLink>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                {userIsAdmin && (
                  <>
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hidden sm:inline-flex"
                      >
                        Dashboard
                      </Button>
                    </Link>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hidden sm:inline-flex gap-2"
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
                    className="hidden sm:inline-flex"
                  >
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="hidden sm:inline-flex">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
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
          <div className="md:hidden border-t border-border/50 bg-card">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              <MobileNavLink href="/" onClick={() => setMobileMenuOpen(false)}>
                Home
              </MobileNavLink>
              <MobileNavLink
                href="/live"
                onClick={() => setMobileMenuOpen(false)}
              >
                Live
              </MobileNavLink>
              <MobileNavLink
                href="/matches"
                onClick={() => setMobileMenuOpen(false)}
              >
                Matches
              </MobileNavLink>
              <MobileNavLink
                href="/leagues"
                onClick={() => setMobileMenuOpen(false)}
              >
                Leagues
              </MobileNavLink>
              <MobileNavLink
                href="/teams"
                onClick={() => setMobileMenuOpen(false)}
              >
                Teams
              </MobileNavLink>
              <MobileNavLink
                href="/pricing"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </MobileNavLink>
              <MobileNavLink
                href="/contact"
                onClick={() => setMobileMenuOpen(false)}
              >
                Support
              </MobileNavLink>

              {isAuthenticated ? (
                <>
                  {userIsAdmin && (
                    <>
                      <MobileNavLink
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </MobileNavLink>
                    </>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
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
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      {/* Footer */}
      <footer className="bg-card border-t border-border/50 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                  FG
                </div>
                <span className="font-display font-bold">
                  Flacron <span className="text-blue-400">GameZone</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Football match discovery and live game platform.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/live"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Live Matches
                  </Link>
                </li>
                <li>
                  <Link
                    href="/matches"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    All Matches
                  </Link>
                </li>
                <li>
                  <Link
                    href="/leagues"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Leagues
                  </Link>
                </li>
                <li>
                  <Link
                    href="/teams"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Teams
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Account</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/pricing"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Login
                  </Link>
                </li>
                <li>
                  <Link
                    href="/signup"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/privacy"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
            <p>
              &copy; {new Date().getFullYear()} Flacron GameZone. All rights
              reserved.
            </p>
            <p>Football Match Discovery & Live Game Platform</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* Helper link components (same as your Layout) */
function NavLink({
  href,
  children,
  active,
}: {
  href: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-sm font-medium transition-colors rounded-lg hover:bg-secondary/50",
        active
          ? "text-blue-400 bg-secondary/30"
          : "text-foreground hover:text-blue-400",
      )}
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-sm font-medium text-foreground hover:text-blue-400 transition-colors rounded-lg hover:bg-secondary/50"
    >
      {children}
    </Link>
  );
}
