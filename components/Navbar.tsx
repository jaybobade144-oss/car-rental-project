"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Sun,
  Moon,
  Globe,
  User,
  Heart,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Car,
  ChevronDown
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { language, currency, setLanguage, setCurrency, t } = useAppContext();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { name: t("home"), path: "/" },
    { name: t("cars"), path: "/cars" },
    { name: t("aboutUs"), path: "/about" },
    { name: t("contactUs"), path: "/contact" },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
  };

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
              <Car className="h-6 w-6 stroke-[2.5]" />
              <span>Vroom<span className="text-foreground">Go</span></span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${isActive(link.path) ? "text-primary" : "text-muted-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Right Section: Toggles & Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>



            {/* Currency Toggle */}
            <div className="relative group">
              <button className="flex items-center gap-1 rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-sm">
                <span className="font-semibold">{currency}</span>
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="absolute right-0 mt-2 hidden w-24 origin-top-right rounded-md border border-border bg-card shadow-lg group-hover:block z-50">
                <div className="py-1">
                  {(["USD", "EUR", "GBP", "INR"] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setCurrency(curr)}
                      className={`block w-full px-4 py-2 text-left text-xs hover:bg-secondary ${currency === curr ? "text-primary font-bold" : ""}`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Auth Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  onBlur={() => setTimeout(() => setUserDropdownOpen(false), 200)}
                  className="flex items-center gap-2 rounded-full border border-border p-1 pr-3 hover:bg-secondary/50 transition-colors"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-xs font-medium text-foreground max-w-[80px] truncate">{user.name}</span>
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-xl border border-border bg-card p-1 shadow-lg z-50">
                    {user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                      >
                        <Settings className="h-4 w-4 text-muted-foreground" />
                        {t("adminDashboard")}
                      </Link>
                    )}
                    <Link
                      href="/profile"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      {t("profile")}
                    </Link>
                    <Link
                      href="/profile?tab=bookings"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                    >
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {t("myBookings")}
                    </Link>
                    <Link
                      href="/profile?tab=wishlist"
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-foreground hover:bg-secondary"
                    >
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      {t("wishlist")}
                    </Link>
                    <hr className="my-1 border-border" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-destructive hover:bg-destructive/10"
                    >
                      <LogOut className="h-4 w-4" />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="rounded-full px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                >
                  {t("login")}
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-95 transition-opacity"
                >
                  {t("register")}
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden space-x-2">
            <button
              onClick={toggleTheme}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-full p-2 text-muted-foreground hover:bg-secondary"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card p-4 space-y-4">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2 text-sm font-medium hover:bg-secondary ${isActive(link.path) ? "text-primary bg-primary/10" : "text-muted-foreground"
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-muted-foreground">Language / Idioma</span>
            <div className="flex gap-2">
              <button
                onClick={() => setLanguage("en")}
                className={`rounded px-2.5 py-1 text-xs border ${language === "en" ? "bg-primary text-white border-primary" : "border-border"}`}
              >
                EN
              </button>
              <button
                onClick={() => setLanguage("es")}
                className={`rounded px-2.5 py-1 text-xs border ${language === "es" ? "bg-primary text-white border-primary" : "border-border"}`}
              >
                ES
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between px-3">
            <span className="text-xs text-muted-foreground">Currency</span>
            <div className="flex gap-2">
              {(["USD", "EUR", "GBP", "INR"] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setCurrency(curr)}
                  className={`rounded px-2.5 py-1 text-xs border ${currency === curr ? "bg-primary text-white border-primary" : "border-border"}`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
          <hr className="border-border" />
          {user ? (
            <div className="space-y-2">
              <div className="flex items-center gap-3 px-3 py-1">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
                    {user.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h4 className="text-sm font-bold">{user.name}</h4>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <div className="flex flex-col space-y-1">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                  >
                    <Settings className="h-4 w-4" />
                    {t("adminDashboard")}
                  </Link>
                )}
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  <User className="h-4 w-4" />
                  {t("profile")}
                </Link>
                <Link
                  href="/profile?tab=bookings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-secondary"
                >
                  <Calendar className="h-4 w-4" />
                  {t("myBookings")}
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2 px-3">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg border border-border py-2 text-sm font-medium hover:bg-secondary"
              >
                {t("login")}
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground hover:opacity-95"
              >
                {t("register")}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
