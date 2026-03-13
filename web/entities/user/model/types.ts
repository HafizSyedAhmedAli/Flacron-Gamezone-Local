export type UserRole = "USER" | "ADMIN";

export interface User {
  id: string | number;
  email: string;
  role: UserRole;
  subscription?: UserSubscription | null;
}

export interface UserSubscription {
  id: string;
  status: string;
  plan: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt?: string;
  updatedAt?: string;
}
