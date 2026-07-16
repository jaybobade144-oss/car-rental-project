import React from "react";
import { Shield, Sparkles, Trophy, Users, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* 1. Header Banner */}
      <section className="text-center max-w-3xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
          <Sparkles className="h-3.5 w-3.5" />
          Our Story
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          Redefining Car Rental in Maharashtra
        </h1>
        <p className="text-base text-muted-foreground leading-relaxed">
          Founded in 2020, VroomGo was built with a clear purpose: to remove the friction, hidden fees, and confusion from the car rental experience. We provide a self-contained local rental fleet powered by premium customer service.
        </p>
      </section>

      {/* 2. Brand Values */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm text-center space-y-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary inline-block">
            <Shield className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Zero Hidden Fees</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The price you see on our search results is exactly what you pay. We do not charge surprise administration fees or pushy counter upgrades.
          </p>
        </div>

        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm text-center space-y-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary inline-block">
            <Heart className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Client Obsession</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            From easy keyless pickups at LAX to extending reservation dates instantly in your user dashboard, we prioritize your journey's peace of mind.
          </p>
        </div>

        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm text-center space-y-3">
          <div className="rounded-2xl bg-primary/10 p-3 text-primary inline-block">
            <Trophy className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-bold text-foreground">Premium Quality Fleet</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            All our sports cars, SUV cross-overs, and electric vehicles are thoroughly inspected, detailed, and prepped to ensure pristine performance.
          </p>
        </div>
      </section>

      {/* 3. Company Stats Grid */}
      <section className="glass-premium rounded-3xl p-8 sm:p-12 border border-border/40 text-center grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="space-y-1">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary">5,000+</h3>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Happy Journeys</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary">50+</h3>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Premium Vehicles</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary">4</h3>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Hub Terminals</p>
        </div>
        <div className="space-y-1">
          <h3 className="text-3xl sm:text-4xl font-extrabold text-primary">4.9★</h3>
          <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Average Rating</p>
        </div>
      </section>

      {/* 4. Team Section */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl font-extrabold text-foreground">Our Executive Team</h2>
          <p className="text-xs text-muted-foreground">The visionaries steering VroomGo towards a premium car rental future.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80"
              alt="CEO"
              className="h-24 w-24 rounded-full object-cover border mx-auto"
            />
            <div>
              <h4 className="text-sm font-bold text-foreground">Marcus Sterling</h4>
              <p className="text-xs text-primary font-semibold">Founder & CEO</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Former automotive designer with over 15 years of operations experience at luxury transport systems.
            </p>
          </div>

          <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80"
              alt="COO"
              className="h-24 w-24 rounded-full object-cover border mx-auto"
            />
            <div>
              <h4 className="text-sm font-bold text-foreground">Sophia Vance</h4>
              <p className="text-xs text-primary font-semibold">Chief Operating Officer</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Logistics specialist driving our pickup terminals expansion and customer service parameters.
            </p>
          </div>

          <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm text-center space-y-4">
            <img
              src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&h=150&q=80"
              alt="CTO"
              className="h-24 w-24 rounded-full object-cover border mx-auto"
            />
            <div>
              <h4 className="text-sm font-bold text-foreground">Devon Ramirez</h4>
              <p className="text-xs text-primary font-semibold">Chief Technology Officer</p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              System architect behind VroomGo's lightweight, built-in SQLite database operations and checkout interfaces.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
