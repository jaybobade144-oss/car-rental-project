"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import InvoiceDownloader from "@/components/InvoiceDownloader";
import {
  Calendar,
  Search,
  CheckCircle,
  XCircle,
  Loader,
  Receipt,
  RotateCcw
} from "lucide-react";

interface Car {
  name: string;
  brand: string;
  pricePerDay: number;
}

interface User {
  name: string;
  email: string;
}

interface Payment {
  transactionId: string;
  amount: number;
}

interface Booking {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string | Date;
  dropoffDate: string | Date;
  totalPrice: number;
  discount: number;
  status: string;
  couponCode: string | null;
  paymentStatus: string;
  createdAt: string | Date;
  car: Car;
  user: User;
  payments: Payment[];
}

interface AdminBookingsManagerProps {
  bookings: Booking[];
}

export default function AdminBookingsManager({ bookings }: AdminBookingsManagerProps) {
  const { convertPrice } = useAppContext();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleStatusChange = async (bookingId: string, status: string) => {
    setLoadingId(bookingId);
    try {
      const res = await fetch("/api/bookings/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId, status }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingId(null);
    }
  };

  // Filter listings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.user.name.toLowerCase().includes(search.toLowerCase()) ||
      b.user.email.toLowerCase().includes(search.toLowerCase()) ||
      b.car.name.toLowerCase().includes(search.toLowerCase()) ||
      b.car.brand.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = filterStatus === "ALL" || b.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Bookings Manager</h1>
          <p className="text-xs text-muted-foreground mt-1">Review active, completed, or cancelled customer reservations.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-border/40 p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by client or model..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-border bg-background py-2.5 pl-9 pr-4 text-xs focus:border-primary focus:outline-none"
          />
        </div>

        {/* Tab selector */}
        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto shrink-0 justify-start sm:justify-end">
          {["ALL", "PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`rounded-lg px-3.5 py-2 text-xs font-bold transition-colors cursor-pointer ${
                filterStatus === status
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary/40 text-muted-foreground hover:bg-secondary/70 hover:text-foreground"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-20 bg-card border border-border/40 rounded-3xl p-8">
          <span className="text-xs text-muted-foreground italic">No matching booking logs found.</span>
        </div>
      ) : (
        <div className="overflow-x-auto border border-border/40 rounded-3xl shadow-sm bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-secondary/50 border-b border-border/40 text-muted-foreground font-bold uppercase tracking-wider">
                <th className="p-4">Reference</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Vehicle Model</th>
                <th className="p-4">Dates & Duration</th>
                <th className="p-4">Rental Locations</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Paid Total</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredBookings.map((b) => {
                const startF = new Date(b.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                const endF = new Date(b.dropoffDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                
                const timeDiff = new Date(b.dropoffDate).getTime() - new Date(b.pickupDate).getTime();
                const daysCount = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
                
                const finalAmount = b.totalPrice - b.discount;
                const isCancelled = b.status === "CANCELLED";
                const isCompleted = b.status === "COMPLETED";

                return (
                  <tr key={b.id} className="hover:bg-secondary/10 text-foreground font-medium">
                    <td className="p-4 font-mono font-bold uppercase text-primary">{b.id.substring(0, 8)}</td>
                    <td className="p-4">
                      <div className="font-bold">{b.user.name}</div>
                      <div className="text-[10px] text-muted-foreground">{b.user.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold">{b.car.brand} {b.car.name}</div>
                      <div className="text-[10px] text-muted-foreground font-bold text-primary uppercase">{b.car.pricePerDay}/day</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-foreground">{startF} - {endF}</div>
                      <div className="text-[10px] text-muted-foreground">{daysCount} days duration</div>
                    </td>
                    <td className="p-4">
                      <div className="truncate max-w-[130px] font-bold">Pick: {b.pickupLocation}</div>
                      <div className="truncate max-w-[130px] text-muted-foreground">Drop: {b.dropoffLocation}</div>
                    </td>
                    <td className="p-4">
                      <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                        isCancelled
                          ? "bg-destructive/10 text-destructive border-destructive/20"
                          : b.status === "CONFIRMED"
                          ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                          : b.status === "COMPLETED"
                          ? "bg-secondary text-muted-foreground border-border"
                          : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                      }`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-foreground">
                      {convertPrice(finalAmount)}
                    </td>
                    <td className="p-4 text-right">
                      {loadingId === b.id ? (
                        <Loader className="h-4 w-4 animate-spin text-primary inline-block" />
                      ) : (
                        <div className="flex justify-end items-center gap-2">
                          <InvoiceDownloader booking={b as any} user={b.user} />
                          
                          {b.status === "PENDING" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "CONFIRMED")}
                              className="rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white p-1.5"
                              title="Confirm Booking"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                          
                          {b.status === "CONFIRMED" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "COMPLETED")}
                              className="rounded-lg bg-primary hover:bg-primary/95 text-white p-1.5"
                              title="Complete Rental"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}

                          {b.status !== "CANCELLED" && b.status !== "COMPLETED" && (
                            <button
                              onClick={() => handleStatusChange(b.id, "CANCELLED")}
                              className="rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive p-1.5 border border-border/40"
                              title="Cancel Booking"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
