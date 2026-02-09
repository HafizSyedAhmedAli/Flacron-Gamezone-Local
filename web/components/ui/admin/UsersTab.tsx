"use client";

import React, { useState } from "react";
import { Calendar, CreditCard, Mail, Shield, User, UserCircle, Crown } from "lucide-react";
import { UserDetailModal } from "./UserDetailModal";

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
  stats?: {
    totalUsers: number;
    activeSubscriptions: number;
    canceledSubscriptions: number;
    inactiveUsers: number;
  };
}

export function UsersTab({ users, stats: backendStats }: UsersTabProps) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUserId(null);
  };

  const getRoleBadge = (role: string) => {
    if (role === "ADMIN") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-500 to-pink-500 text-white inline-flex items-center gap-1.5 shadow-lg shadow-purple-500/30">
          <Crown className="w-3 h-3" />
          ADMIN
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white inline-flex items-center gap-1.5 shadow-lg shadow-blue-500/30">
        <Shield className="w-3 h-3" />
        {role}
        </span>
    );
  };

  const getSubscriptionBadge = (status: string | undefined) => {
    if (!status) {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
          No Subscription
        </span>
      );
    }
    
    const badges: Record<string, JSX.Element> = {
      active: (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30">
          Active
        </span>
      ),
      inactive: (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
          Inactive
        </span>
      ),
      canceled: (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/30">
          Canceled
        </span>
      ),
      past_due: (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30">
          Past Due
        </span>
      ),
    };

    return badges[status] || (
      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
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

  // Use backend stats if provided, otherwise calculate as fallback
  const stats = backendStats
    ? {
        total: backendStats.totalUsers,
        active: backendStats.activeSubscriptions,
        inactive: backendStats.inactiveUsers,
        canceled: backendStats.canceledSubscriptions,
        admins: users.filter((u) => u.role === "ADMIN").length,
      }
    : {
        total: users.length,
        active: users.filter((u) => u.subscription?.status === "active").length,
        inactive: users.filter(
          (u) => !u.subscription || u.subscription.status === "inactive",
        ).length,
        canceled: users.filter((u) => u.subscription?.status === "canceled")
          .length,
        admins: users.filter((u) => u.role === "ADMIN").length,
      };

  if (users?.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-20 h-20 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
          <UserCircle className="w-10 h-10 text-slate-400" />
        </div>
        <p className="text-slate-500 text-sm">
          If this is empty, you are not ADMIN or backend blocked the request.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Total Users</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            {stats.total}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:border-green-500/50 hover:shadow-lg hover:shadow-green-500/10">
          <div className="flex items-center gap-2 text-green-400 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Active Subs</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            {stats.active}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:border-slate-500/50 hover:shadow-lg hover:shadow-slate-500/10">
          <div className="flex items-center gap-2 text-slate-400 mb-2">
            <User className="w-4 h-4" />
            <span className="text-sm font-medium">Inactive</span>
          </div>
          <p className="text-3xl font-bold text-slate-300">
            {stats.inactive}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/10">
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <CreditCard className="w-4 h-4" />
            <span className="text-sm font-medium">Canceled</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
            {stats.canceled}
          </p>
        </div>

        <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-xl p-4 transition-all duration-300 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Crown className="w-4 h-4" />
            <span className="text-sm font-medium">Admins</span>
          </div>
          <p className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {stats.admins}
          </p>
        </div>
      </div>

      {/* Additional Info */}
      {users.length > 0 && (
        <div className="text-sm text-slate-400">
          Showing {users.length} user{users.length !== 1 ? "s" : ""}
          <span className="ml-2 text-xs text-slate-500">
            (Click on a user to view details)
          </span>
        </div>
      )}

      {/* Users Cards */}
      <div className="grid gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 cursor-pointer"
            onClick={() => handleUserClick(user.id)}
          >
            <div className="flex items-start justify-between gap-4 flex-wrap">
              {/* User Info */}
              <div className="flex items-center gap-4 flex-1 min-w-[250px]">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <UserCircle className="w-7 h-7 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span className="font-bold text-lg text-slate-100">
                      {user.email}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {getRoleBadge(user.role)}
                    {getSubscriptionBadge(user.subscription?.status)}
                  </div>
                </div>
              </div>

              {/* Subscription Details */}
              <div className="flex items-center gap-6 flex-wrap text-sm">
                {user.subscription?.plan && (
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Plan</div>
                    <div className="text-slate-200 font-medium">
                      {user.subscription.plan}
                    </div>
                  </div>
                )}
                
                {user.subscription?.currentPeriodEnd && (
                  <div>
                    <div className="text-slate-500 text-xs mb-1">Period End</div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-200">
                        {formatDate(user.subscription.currentPeriodEnd)}
                      </span>
                      {user.subscription.cancelAtPeriodEnd && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/30 ml-1">
                          Canceling
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-slate-500 text-xs mb-1">Joined</div>
                  <div className="text-slate-200">
                    {formatDate(user.createdAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* User Detail Modal */}
      <UserDetailModal
        userId={selectedUserId}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}