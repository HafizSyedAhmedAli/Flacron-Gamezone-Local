import type { Request } from "express";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface JwtPayload {
  userId: string;
  role: "USER" | "ADMIN";
}

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  subscription?: SubscriptionRecord | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// ─── Subscription ─────────────────────────────────────────────────────────────

export interface SubscriptionRecord {
  id: string;
  status: string;
  plan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

// ─── AI ───────────────────────────────────────────────────────────────────────

export interface MatchContext {
  homeTeam: { name: string; logo: string | null };
  awayTeam: { name: string; logo: string | null };
  league: { name: string; country: string | null } | null;
  kickoffTime: Date;
  venue: string | null;
  status: string;
  score: string | null;
}

export type AILanguage = "en" | "fr";
export type AIKind = "preview" | "summary";

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}
