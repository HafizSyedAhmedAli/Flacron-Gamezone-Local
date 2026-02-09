"use client";

import React from "react";
import { UserCircle, Crown, Shield } from "lucide-react";

interface UsersTabProps {
  users: any[];
}

export function UsersTab({ users }: UsersTabProps) {
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

  const getSubscriptionBadge = (status: string) => {
    if (!status || status === "—") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
          No Subscription
        </span>
      );
    }
    if (status === "active") {
      return (
        <span className="px-3 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-lg shadow-green-500/30">
          Active
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-700/50 text-slate-400 border border-slate-600/30">
        {status}
      </span>
    );
  };

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <div
          key={user.id}
          className="bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl border border-slate-700/50 hover:border-blue-500/50 rounded-xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <UserCircle className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-slate-100 mb-1">
                  {user.email}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {getRoleBadge(user.role)}
                  {getSubscriptionBadge(user.subscription?.status || "—")}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}