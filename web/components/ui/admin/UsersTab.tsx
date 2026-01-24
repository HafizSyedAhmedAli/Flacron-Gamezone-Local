"use client";

import React from "react";

interface UsersTabProps {
  users: any[];
}

export function UsersTab({ users }: UsersTabProps) {
  if (users?.length === 0) {
    return (
      <div className="text-slate-600 text-sm">
        If this is empty, you are not ADMIN or backend blocked the request.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="rounded-2xl border p-4">
          <div className="font-semibold">{user.email}</div>
          <div className="text-sm text-slate-600">
            Role: {user.role} • Sub: {user.subscription?.status || "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
