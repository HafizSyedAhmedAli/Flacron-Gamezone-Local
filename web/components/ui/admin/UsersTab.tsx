import { Calendar, CreditCard, Mail, Shield, User } from "lucide-react";
import Badge from "../badge";

interface UserWithSubscription {
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
  } | null;
}

interface UsersTabProps {
  users: UserWithSubscription[];
}

export function UsersTab({ users }: UsersTabProps) {
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

    return (
      <Badge variant={variants[status] || "default"}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    return (
      <Badge variant={role === "ADMIN" ? "destructive" : "default"}>
        {role}
      </Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const stats = {
    total: users.length,
    active: users.filter((u) => u.subscription?.status === "active").length,
    inactive: users.filter(
      (u) => !u.subscription || u.subscription.status === "inactive",
    ).length,
    canceled: users.filter((u) => u.subscription?.status === "canceled").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm">Total Users</span>
          </div>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Active Subs</span>
          </div>
          <p className="text-2xl font-bold">{stats.active}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm">Inactive</span>
          </div>
          <p className="text-2xl font-bold">{stats.inactive}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm">Canceled</span>
          </div>
          <p className="text-2xl font-bold">{stats.canceled}</p>
        </div>

        <div className="p-4 border rounded-lg bg-card">
          <div className="flex items-center gap-2 text-purple-600 mb-1">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Admins</span>
          </div>
          <p className="text-2xl font-bold">{stats.admins}</p>
        </div>
      </div>

      {/* Users Table */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  User
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Subscription
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Period End
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          {user.email}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{getRoleBadge(user.role)}</td>
                    <td className="px-4 py-3">
                      {user.subscription ? (
                        getStatusBadge(user.subscription.status)
                      ) : (
                        <Badge variant="default">None</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm">
                        {user.subscription?.plan || "-----"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {user.subscription?.currentPeriodEnd ? (
                          <>
                            <Calendar className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatDate(user.subscription.currentPeriodEnd)}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm">{"-----"}</span>
                        )}
                        {user.subscription?.cancelAtPeriodEnd && (
                          <Badge variant="warning" className="ml-2">
                            Canceling
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Info */}
      {users.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}
