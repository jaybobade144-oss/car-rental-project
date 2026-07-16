"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { MapPin, Calendar, Search } from "lucide-react";

interface Location {
  id: string;
  name: string;
}

interface SearchBoxProps {
  locations: Location[];
}

export default function SearchBox({ locations }: SearchBoxProps) {
  const router = useRouter();
  const { t } = useAppContext();
  const [pickupLoc, setPickupLoc] = useState("");
  const [dropoffLoc, setDropoffLoc] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (pickupLoc) params.set("pickupLocation", pickupLoc);
    if (dropoffLoc) params.set("dropoffLocation", dropoffLoc);
    if (pickupDate) params.set("pickupDate", pickupDate);
    if (dropoffDate) params.set("dropoffDate", dropoffDate);
    
    router.push(`/cars?${params.toString()}`);
  };

  // Get tomorrow's date format for min pickup date
  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinReturnDateString = () => {
    if (!pickupDate) return getTodayDateString();
    return pickupDate;
  };

  return (
    <form
      onSubmit={handleSearch}
      className="w-full bg-card rounded-3xl p-6 md:p-8 shadow-2xl relative -mt-16 sm:-mt-24 z-10 border border-border/40"
    >
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4 items-end">
        {/* Pickup Location */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-primary" />
            {t("searchPickup")}
          </label>
          <select
            value={pickupLoc}
            onChange={(e) => setPickupLoc(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors"
          >
            <option value="">Select location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Dropoff Location */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4.5 w-4.5 text-primary" />
            {t("searchDropoff")}
          </label>
          <select
            value={dropoffLoc}
            onChange={(e) => setDropoffLoc(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none cursor-pointer transition-colors"
          >
            <option value="">Select location...</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.name}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Pickup Date */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-primary" />
            {t("searchPickupDate")}
          </label>
          <input
            type="date"
            value={pickupDate}
            min={getTodayDateString()}
            onChange={(e) => setPickupDate(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
          />
        </div>

        {/* Return Date */}
        <div className="flex flex-col space-y-2">
          <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4.5 w-4.5 text-primary" />
            {t("searchReturnDate")}
          </label>
          <input
            type="date"
            value={dropoffDate}
            min={getMinReturnDateString()}
            onChange={(e) => setDropoffDate(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer transition-colors"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-all shadow-md shadow-primary/30"
        >
          <Search className="h-4.5 w-4.5 stroke-[2.5]" />
          <span>{t("searchBtn")}</span>
        </button>
      </div>
    </form>
  );
}
