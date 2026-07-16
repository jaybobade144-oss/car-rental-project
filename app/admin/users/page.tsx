import React from "react";
import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, Calendar } from "lucide-react";

export const revalidate = 0;

export default async function AdminUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Customer Directory</h1>
        <p className="text-xs text-muted-foreground mt-1">Review register records and roles for users on the platform.</p>
      </div>

      {/* Users table */}
      <div className="overflow-x-auto border border-border/40 rounded-3xl shadow-sm bg-card">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-secondary/50 border-b border-border/40 text-muted-foreground font-bold uppercase tracking-wider">
              <th className="p-4">Customer Details</th>
              <th className="p-4">Contacts</th>
              <th className="p-4">Account Role</th>
              <th className="p-4">Registration Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {users.map((user) => {
              const registerDateF = new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
              const firstLetter = user.name.charAt(0);
              const isAdmin = user.role === "ADMIN";

              return (
                <tr key={user.id} className="hover:bg-secondary/10 text-foreground font-medium">
                  {/* Info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-9 w-9 rounded-full object-cover border shrink-0" />
                      ) : (
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-xs font-bold shrink-0">
                          {firstLetter}
                        </div>
                      )}
                      <div>
                        <h4 className="font-bold text-sm text-foreground leading-snug">{user.name}</h4>
                        <span className="text-[10px] text-muted-foreground font-mono">{user.id}</span>
                      </div>
                    </div>
                  </td>
                  {/* Contact */}
                  <td className="p-4 space-y-1">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span>{user.email}</span>
                    </div>
                    {user.phone && (
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <span>{user.phone}</span>
                      </div>
                    )}
                  </td>
                  {/* Role */}
                  <td className="p-4">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                      isAdmin
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/20"
                        : "bg-secondary text-muted-foreground border-border"
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  {/* Created */}
                  <td className="p-4 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>{registerDateF}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
