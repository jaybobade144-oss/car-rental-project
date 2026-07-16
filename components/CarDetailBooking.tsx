"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";
import { Calendar, MapPin, Info, AlertTriangle, ArrowRight } from "lucide-react";

interface Location {
  id: string;
  name: string;
}

interface CarDetailBookingProps {
  carId: string;
  pricePerDay: number;
  locations: Location[];
  occupiedRanges: { start: string; end: string }[];
}

export default function CarDetailBooking({
  carId,
  pricePerDay,
  locations,
  occupiedRanges,
}: CarDetailBookingProps) {
  const { user } = useAuth();
  const { convertPrice, t } = useAppContext();
  const router = useRouter();

  const [pickupLoc, setPickupLoc] = useState("");
  const [dropoffLoc, setDropoffLoc] = useState("");
  const [pickupDate, setPickupDate] = useState("");
  const [dropoffDate, setDropoffDate] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const [days, setDays] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [tax, setTax] = useState(0);
  const [total, setTotal] = useState(0);

  // Recalculate billing summary when dates change
  useEffect(() => {
    if (pickupDate && dropoffDate) {
      const start = new Date(pickupDate);
      const end = new Date(dropoffDate);
      
      if (end < start) {
        setDays(0);
        setErrorMsg("Return date cannot be earlier than pickup date.");
        return;
      }

      setErrorMsg("");

      // Calculate date overlap
      const overlap = occupiedRanges.some((range) => {
        const rangeStart = new Date(range.start);
        const rangeEnd = new Date(range.end);
        // Clean times for accurate day overlaps
        rangeStart.setHours(0, 0, 0, 0);
        rangeEnd.setHours(23, 59, 59, 999);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        
        return start <= rangeEnd && end >= rangeStart;
      });

      if (overlap) {
        setDays(0);
        setErrorMsg("This vehicle is already booked during your selected dates.");
        return;
      }

      // Difference in time
      const timeDiff = end.getTime() - start.getTime();
      const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Min 1 day

      setDays(diffDays);
      const sub = diffDays * pricePerDay;
      const tFee = sub * 0.1; // 10% tax/service
      setSubtotal(sub);
      setTax(tFee);
      setTotal(sub + tFee);
    } else {
      setDays(0);
    }
  }, [pickupDate, dropoffDate, pricePerDay, occupiedRanges]);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?redirect=/cars/${carId}`);
      return;
    }

    if (errorMsg || days === 0) return;

    const params = new URLSearchParams({
      carId,
      pickupLocation: pickupLoc,
      dropoffLocation: dropoffLoc,
      pickupDate,
      dropoffDate,
      days: days.toString(),
      totalPrice: total.toFixed(2),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const getTodayDateString = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getMinReturnDateString = () => {
    if (!pickupDate) return getTodayDateString();
    return pickupDate;
  };

  return (
    <div className="w-full bg-card border border-border/40 rounded-3xl p-6 shadow-md sticky top-24">
      <div className="flex items-baseline justify-between border-b border-border/40 pb-4 mb-6">
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Rental Price</h3>
        <div>
          <span className="text-2xl font-extrabold text-foreground">{convertPrice(pricePerDay)}</span>
          <span className="text-xs text-muted-foreground ml-1">/ day</span>
        </div>
      </div>

      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
        {/* Pickup Location */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            Pickup Location
          </label>
          <select
            value={pickupLoc}
            onChange={(e) => setPickupLoc(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
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
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            Drop-off Location
          </label>
          <select
            value={dropoffLoc}
            onChange={(e) => setDropoffLoc(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
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
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Pickup Date
          </label>
          <input
            type="date"
            value={pickupDate}
            min={getTodayDateString()}
            onChange={(e) => setPickupDate(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
          />
        </div>

        {/* Return Date */}
        <div className="flex flex-col space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            Return Date
          </label>
          <input
            type="date"
            value={dropoffDate}
            min={getMinReturnDateString()}
            onChange={(e) => setDropoffDate(e.target.value)}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none cursor-pointer"
          />
        </div>

        {/* Conflict Warning banner */}
        {errorMsg && (
          <div className="flex gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-semibold">
            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Billing breakdown */}
        {days > 0 && !errorMsg && (
          <div className="border-t border-border/40 pt-4 mt-6 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rental Duration</span>
              <span className="font-bold text-foreground">{days} {days === 1 ? "day" : "days"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal ({days} days)</span>
              <span className="font-bold text-foreground">{convertPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Taxes & Insurance (10%)</span>
              <span className="font-bold text-foreground">{convertPrice(tax)}</span>
            </div>
            <hr className="border-border/40 my-1" />
            <div className="flex justify-between text-sm font-extrabold">
              <span>Total Price</span>
              <span className="text-primary">{convertPrice(total)}</span>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          type="submit"
          disabled={!!errorMsg}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-95 disabled:opacity-50 mt-6 shadow-md shadow-primary/20 transition-all cursor-pointer"
        >
          <span>{user ? "Rent Now" : "Log In to Book"}</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {occupiedRanges.length > 0 && (
        <div className="mt-6 border-t border-border/40 pt-4">
          <h4 className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground mb-2 flex items-center gap-1">
            <Info className="h-3 w-3 text-primary" />
            Reserved Calendar Dates
          </h4>
          <div className="space-y-1">
            {occupiedRanges.map((range, idx) => {
              const startF = new Date(range.start).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              const endF = new Date(range.end).toLocaleDateString("en-US", { month: "short", day: "numeric" });
              return (
                <div key={idx} className="flex justify-between items-center text-[10px] text-muted-foreground px-2 py-1 rounded bg-secondary/30">
                  <span className="font-medium text-foreground">Unavailable Range</span>
                  <span>{startF} - {endF}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
