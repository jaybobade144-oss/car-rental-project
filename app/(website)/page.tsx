import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchBox from "@/components/SearchBox";
import CarCard from "@/components/CarCard";
import { Star, Shield, Zap, Clock, ChevronRight, HelpCircle, PhoneCall } from "lucide-react";

export const revalidate = 0; // Fetch fresh data on load

export default async function HomePage() {
  // Server-side fetching from SQLite
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  const featuredCars = await prisma.car.findMany({
    take: 6,
    include: {
      images: {
        take: 1,
      },
    },
  });

  const reviews = await prisma.review.findMany({
    take: 3,
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
      car: {
        select: {
          name: true,
          brand: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="w-full pb-20">
      {/* 1. Hero Banner */}
      <section className="relative overflow-hidden bg-slate-900 py-32 sm:py-40 text-white">
        {/* Decorative background gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(99,102,241,0.2),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(168,85,247,0.15),transparent_60%)]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20 backdrop-blur-sm">
              <Zap className="h-3 w-3 fill-primary" />
              Easy Local SQLite SQL Operations
            </span>
            <h1 className="mt-6 text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent leading-none">
              Drive the Future of <span className="bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">Car Rental</span>
            </h1>
            <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
              Experience seamless car rentals with zero hidden fees, flexible pickup options, and premium local customer support. Discover our luxury, SUV, and electric fleet.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* 2. Interactive Search Box */}
        <SearchBox locations={locations} />

        {/* 3. Featured Fleet */}
        <section className="mt-24 sm:mt-32">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Premium Fleet</span>
              <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">Featured Vehicles</h2>
              <p className="text-sm text-muted-foreground mt-2">Explore our handpicked selection of top-tier cars available for your next trip.</p>
            </div>
            <Link href="/cars" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all">
              <span>View All Fleet</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        </section>

        {/* 4. Why Choose Us */}
        <section className="mt-32 border-t border-border/40 pt-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Features</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">Why Choose VroomGo</h2>
            <p className="text-sm text-muted-foreground mt-2">We combine local touch with premium self-contained SQL database performance to give you a zero-config experience.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary mb-4">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Secure & Reliable</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Full comprehensive insurance covers and secure local JWT authentication. Rest easy on every mile.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary mb-4">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Instant SQLite Booking</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                No external networks or latency. All operations write directly to our built-in SQL database.
              </p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-card border border-border/40 shadow-sm">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground">Flexible Schedules</h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Need to extend your rental? Change dates instantly from your customizable user dashboard.
              </p>
            </div>
          </div>
        </section>

        {/* 5. Customer Reviews */}
        <section className="mt-32 border-t border-border/40 pt-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Testimonials</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">What Our Customers Say</h2>
            <p className="text-sm text-muted-foreground mt-2">Real testimonials from verified drivers who rented cars at LAX and Santa Monica.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {reviews.map((rev) => (
              <div key={rev.id} className="flex flex-col justify-between rounded-2xl bg-card border border-border/40 p-6 shadow-sm">
                <div>
                  <div className="flex gap-1 text-amber-500 mb-4">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-500" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="mt-6 flex items-center gap-3 pt-4 border-t border-border/40">
                  {rev.user.avatar ? (
                    <img src={rev.user.avatar} alt={rev.user.name} className="h-9 w-9 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                      {rev.user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm font-bold text-foreground">{rev.user.name}</h4>
                    <span className="text-xs text-primary font-medium">{rev.car.brand} {rev.car.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ Block */}
        <section className="mt-32 border-t border-border/40 pt-24">
          <div className="text-center max-w-2xl mx-auto">
            <span className="text-xs font-bold text-primary uppercase tracking-widest">Answers</span>
            <h2 className="text-3xl font-extrabold tracking-tight text-foreground mt-1">Frequently Asked Questions</h2>
            <p className="text-sm text-muted-foreground mt-2">Clear answers to help you navigate bookings, drivers, insurance, and payments.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                What do I need to pick up my rental?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                You will need a valid driver's license matching your registration name, a credit card for the deposit, and the confirmation email (or booking ID) from your dashboard.
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                Are there mileage limits on rentals?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Most of our local listings feature unlimited mileage in Maharashtra. Please review the car specifications drawer or your generated booking invoice.
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                Can I cancel my rental booking?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                Yes! You can cancel any booking up to 24 hours prior to the pickup date from your User Dashboard under the "Active Bookings" tab.
              </p>
            </div>
            <div className="rounded-2xl border border-border/40 bg-card p-6">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                How do coupon codes work?
              </h3>
              <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                You can apply any valid coupon (e.g. WELCOME10) during Checkout. The system calculates and applies the percentage discount instantly before charging your card.
              </p>
            </div>
          </div>
        </section>

        {/* 7. Call To Action section */}
        <section className="mt-32 rounded-3xl bg-slate-900 text-white p-8 sm:p-12 relative overflow-hidden border border-border/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(99,102,241,0.15),transparent_50%)]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl text-center md:text-left">
              <h2 className="text-3xl font-extrabold tracking-tight">Ready to hit the open road?</h2>
              <p className="text-sm text-slate-400 mt-2">
                Create an account today to build your customized dashboard, manage bookings, write reviews, and receive 10% off your first rental booking with the code WELCOME10.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 shrink-0 w-full sm:w-auto">
              <Link href="/register" className="flex items-center justify-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-all text-center">
                Sign Up Now
              </Link>
              <Link href="/contact" className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 hover:bg-slate-800 px-6 py-3 text-sm font-semibold text-white transition-all text-center">
                <PhoneCall className="h-4 w-4" />
                Contact Support
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
