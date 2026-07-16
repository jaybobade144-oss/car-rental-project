"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import {
  LayoutDashboard,
  Car,
  Calendar,
  Users,
  Ticket,
  Star,
  Home,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
  Sparkles,
  MessageSquare
} from "lucide-react";

interface AdminSidebarProps {
  name: string;
  email: string;
  avatar?: string | null;
}

export default function AdminSidebar({ name, email, avatar }: AdminSidebarProps) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadContacts, setUnreadContacts] = useState(0);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUnreadContacts(data.filter((m: any) => !m.read).length);
        }
      })
      .catch(() => {});
  }, []);

  const adminLinks = [
    { name: "Overview Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Cars Inventory", path: "/admin/cars", icon: Car },
    { name: "Bookings Manager", path: "/admin/bookings", icon: Calendar },
    { name: "Customer Directory", path: "/admin/users", icon: Users },
    { name: "Contact Messages", path: "/admin/contacts", icon: MessageSquare, badge: unreadContacts },
  ];

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-full bg-primary p-3 text-white shadow-md shadow-primary/20"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col justify-between border-r border-border/40 bg-card p-5 transition-transform duration-300 md:translate-x-0 md:static shrink-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Title */}
          <div className="flex items-center gap-2 border-b border-border/40 pb-4">
            <Car className="h-6 w-6 text-primary stroke-[2.5]" />
            <div>
              <h2 className="text-base font-extrabold text-foreground leading-none">VroomGo</h2>
              <span className="text-[9px] font-bold text-primary uppercase tracking-widest mt-1 block">ADMIN MANAGER</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {adminLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  href={link.path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                    active
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <span className="flex-1">{link.name}</span>
                  {link.badge > 0 && (
                    <span className="rounded-full bg-rose-500 text-white text-[9px] px-1.5 py-0.5 font-bold leading-none">
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: Theme, Back to site & Logout */}
        <div className="space-y-4 pt-4 border-t border-border/40">
          {/* Theme switcher */}
          <button
            onClick={toggleTheme}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
          >
            {theme === "dark" ? (
              <>
                <Sun className="h-4.5 w-4.5 text-amber-500" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="h-4.5 w-4.5 text-indigo-500" />
                <span>Dark Mode</span>
              </>
            )}
          </button>

          {/* Back to site */}
          <Link
            href="/"
            className="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-muted-foreground hover:bg-secondary/50 hover:text-foreground transition-all"
          >
            <Home className="h-4.5 w-4.5" />
            Back to Website
          </Link>

          {/* Admin Profiler & Logout */}
          <div className="flex items-center justify-between border-t border-border/20 pt-4 px-2">
            <div className="flex items-center gap-2 max-w-[120px] truncate">
              {avatar ? (
                <img src={avatar} alt={name} className="h-7 w-7 rounded-full object-cover" />
              ) : (
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                  {name.charAt(0)}
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-bold text-foreground line-clamp-1">{name}</p>
                <p className="text-[9px] text-muted-foreground">Admin</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
              aria-label="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
