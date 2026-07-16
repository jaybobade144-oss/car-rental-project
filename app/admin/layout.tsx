import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  Ticket,
  Star,
  Home,
  LogOut
} from "lucide-react";
import AdminSidebar from "@/components/AdminSidebar";

export const revalidate = 0;

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  // Auth & Admin Guard: Only let admins pass
  if (!session) {
    redirect("/login?redirect=/admin");
  }

  if (session.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sidebar component */}
      <AdminSidebar name={session.name} email={session.email} avatar={session.avatar} />
      
      {/* Main content grid */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
}
