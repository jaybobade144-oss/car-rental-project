"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAppContext } from "@/context/AppContext";
import { Car, Mail, Phone, MapPin, Send } from "lucide-react";

export default function Footer() {
  const { t } = useAppContext();
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  return (
    <footer className="w-full border-t border-border/40 bg-card py-12 text-card-foreground transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Logo & About */}
          <div className="flex flex-col space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary">
              <Car className="h-6 w-6 stroke-[2.5]" />
              <span>Vroom<span className="text-card-foreground">Go</span></span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("footerText")}
            </p>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} VroomGo Inc. All rights reserved.
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Navigation</h4>
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("home")}</Link>
            <Link href="/cars" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("cars")}</Link>
            <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("aboutUs")}</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("contactUs")}</Link>
          </div>

          {/* Categories */}
          <div className="flex flex-col space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Our Fleet</h4>
            <Link href="/cars?type=Luxury" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("luxury")}</Link>
            <Link href="/cars?type=SUV" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("suv")}</Link>
            <Link href="/cars?type=Electric" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("electric")}</Link>
            <Link href="/cars?type=Sedan" className="text-sm text-muted-foreground hover:text-primary transition-colors">{t("sedan")}</Link>
          </div>

          {/* Newsletter / Contacts */}
          <div className="flex flex-col space-y-4">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-foreground">Newsletter</h4>
            <p className="text-xs text-muted-foreground">
              Subscribe to receive weekly discounts, roadtrip tips, and fleet updates.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Email Address"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-secondary/50 px-3 py-2 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                className="flex items-center justify-center rounded-lg bg-primary p-2 text-primary-foreground hover:opacity-90 transition-opacity"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {subscribed && (
              <span className="text-xs text-emerald-500 font-medium">Successfully subscribed! Thank you.</span>
            )}
            
            <div className="pt-2 flex flex-col space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3 w-3 text-primary" />
                <span>+1 (555) VROOM-GO</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-3 w-3 text-primary" />
                <span>Pune, Maharashtra, India</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
