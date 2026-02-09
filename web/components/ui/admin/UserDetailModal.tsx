import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  CreditCard,
  Mail,
  Shield,
  User as UserIcon,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { apiGet } from "@/components/api";

interface UserDetailResponse {
  success: boolean;
  user: {
    id: string;
    email: string;
    role: string;
    createdAt: string;
    subscription: {
      id: string;
      status: string;
      plan: string | null;
      stripeCustomerId: string | null;
      stripeSubscriptionId: string | null;
      currentPeriodStart: string | null;
      currentPeriodEnd: string | null;
      cancelAtPeriodEnd: boolean;
      createdAt: string;
      updatedAt: string;
    } | null;
  };
  error?: string;
}

interface UserDetailModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function UserDetailModal({
  userId,
  isOpen,
  onClose,
}: UserDetailModalProps) {
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<UserDetailResponse["user"] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && userId) {
      fetchUserDetails();
    } else {
      setUser(null);
      setError(null);
    }
  }, [isOpen, userId]);

  async function fetchUserDetails() {
    if (!userId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiGet<UserDetailResponse>(
        `/api/admin/users/${userId}`,
      );
      if (response.success) {
        setUser(response.user);
      } else {
        setError(response.error || "Failed to load user details");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setError("Failed to load user details");
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<
      string,
      "default" | "success" | "destructive" | "warning"
    > = {
      active: "success",
      inactive: "default",
      canceled: "destructive",
      past_due: "warning",
    };

    const icons: Record<string, React.ReactNode> = {
      active: <CheckCircle className="w-3 h-3" />,
      inactive: <XCircle className="w-3 h-3" />,
      canceled: <XCircle className="w-3 h-3" />,
      past_due: <AlertCircle className="w-3 h-3" />,
    };

    return (
      <Badge
        variant={variants[status] || "default"}
        className="flex items-center gap-1 w-fit"
      >
        {icons[status]}
        {status.charAt(0).toUpperCase() + status.slice(1).replace("_", " ")}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge
        variant={role === "ADMIN" ? "destructive" : "default"}
        className="flex items-center gap-1 w-fit"
      >
        <Shield className="w-3 h-3" />
        {role}
      </Badge>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserIcon className="w-5 h-5" />
            User Details
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-4 rounded-md">
            <p className="font-medium">Error</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* User Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                User Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                  <p className="font-medium">{user.email}</p>
                </div>

                {/* Role */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Shield className="w-4 h-4" />
                    <span>Role</span>
                  </div>
                  <div>{getRoleBadge(user.role)}</div>
                </div>

                {/* User ID */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <UserIcon className="w-4 h-4" />
                    <span>User ID</span>
                  </div>
                  <p className="font-mono text-sm">{user.id}</p>
                </div>

                {/* Created At */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>Joined</span>
                  </div>
                  <p className="text-sm">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Subscription Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">
                Subscription Details
              </h3>

              {user.subscription ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Status */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>Status</span>
                      </div>
                      <div>{getStatusBadge(user.subscription.status)}</div>
                    </div>

                    {/* Plan */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CreditCard className="w-4 h-4" />
                        <span>Plan</span>
                      </div>
                      <p className="font-medium capitalize">
                        {user.subscription.plan || "N/A"}
                      </p>
                    </div>

                    {/* Current Period Start */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Period Start</span>
                      </div>
                      <p className="text-sm">
                        {formatDate(user.subscription.currentPeriodStart)}
                      </p>
                    </div>

                    {/* Current Period End */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Period End</span>
                      </div>
                      <p className="text-sm">
                        {formatDate(user.subscription.currentPeriodEnd)}
                      </p>
                    </div>

                    {/* Cancel at Period End */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        <span>Cancel at Period End</span>
                      </div>
                      <Badge
                        variant={
                          user.subscription.cancelAtPeriodEnd
                            ? "warning"
                            : "default"
                        }
                      >
                        {user.subscription.cancelAtPeriodEnd ? "Yes" : "No"}
                      </Badge>
                    </div>

                    {/* Subscription Created */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>Subscription Created</span>
                      </div>
                      <p className="text-sm">
                        {formatDate(user.subscription.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Stripe Information */}
                  <div className="bg-muted/30 p-4 rounded-lg space-y-3">
                    <h4 className="font-medium text-sm">Stripe Information</h4>

                    <div className="space-y-2">
                      {/* Subscription ID */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Subscription ID
                        </p>
                        <p className="font-mono text-xs break-all">
                          {user.subscription.stripeSubscriptionId || "N/A"}
                        </p>
                      </div>

                      {/* Customer ID */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Customer ID
                        </p>
                        <p className="font-mono text-xs break-all">
                          {user.subscription.stripeCustomerId || "N/A"}
                        </p>
                      </div>

                      {/* Subscription Database ID */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Internal ID
                        </p>
                        <p className="font-mono text-xs break-all">
                          {user.subscription.id}
                        </p>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    {user.subscription.stripeCustomerId && (
                      <div className="pt-2 border-t">
                        <a
                          href={`https://dashboard.stripe.com/customers/${user.subscription.stripeCustomerId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          View in Stripe Dashboard →
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-muted/30 p-4 rounded-lg text-center">
                  <p className="text-muted-foreground">
                    No active subscription
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
