import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import InvoiceDownloader from "@/components/InvoiceDownloader";
import Link from "next/link";
import { Check, Calendar, MapPin, Receipt, ArrowRight, User } from "lucide-react";
import BookingPrice from "@/components/BookingPrice";

export const revalidate = 0; // Fresh pages

interface SearchParams {
  id?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BookingSuccessPage({ searchParams }: PageProps) {
  const session = await getSession();
  const params = await searchParams;
  const bookingId = params.id;

  // 1. Auth Guard
  if (!session) {
    redirect("/login");
  }

  if (!bookingId) {
    redirect("/cars");
  }

  // 2. Fetch Booking from DB
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      car: {
        select: {
          name: true,
          brand: true,
          pricePerDay: true,
        },
      },
      payments: {
        take: 1,
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  if (!booking) {
    redirect("/cars");
  }

  // 3. Authorization Check: Must be the user who booked OR an admin
  if (booking.userId !== session.id && session.role !== "ADMIN") {
    redirect("/cars");
  }

  const pickupDateF = new Date(booking.pickupDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const dropoffDateF = new Date(booking.dropoffDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
  const txId = booking.payments?.[0]?.transactionId || "N/A";
  const finalPaid = booking.totalPrice - booking.discount;

  return (
    <div className="mx-auto max-w-3xl w-full px-4 py-16 flex flex-col items-center justify-center">
      {/* Success Badge */}
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 mb-6">
        <Check className="h-8 w-8 stroke-[3]" />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-foreground text-center sm:text-4xl">Booking Confirmed!</h1>
      <p className="text-sm text-muted-foreground text-center mt-2 max-w-md">
        Thank you for choosing VroomGo. Your payment has been successfully processed, and your vehicle is reserved.
      </p>

      {/* Confirmation Panel */}
      <div className="w-full bg-card border border-border/40 rounded-3xl p-6 sm:p-8 mt-10 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-border/40 pb-4">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Booking Reference</span>
            <h4 className="text-sm font-bold text-foreground uppercase mt-0.5">{booking.id.substring(0, 8)}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Transaction ID</span>
            <p className="text-sm font-bold text-primary mt-0.5">{txId}</p>
          </div>
        </div>

        {/* Vehicle description */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs text-primary font-bold uppercase tracking-wider">{booking.car.brand}</span>
            <h3 className="text-lg font-extrabold text-foreground mt-0.5">{booking.car.name}</h3>
          </div>
          <div className="text-right">
            <BookingPrice totalPaidUSD={finalPaid} />
            <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Total Paid</p>
          </div>
        </div>

        {/* Location & Dates Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-b border-border/40 py-6">
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Pickup details</span>
            <p className="text-sm font-semibold text-foreground">{booking.pickupLocation}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {pickupDateF}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Return details</span>
            <p className="text-sm font-semibold text-foreground">{booking.dropoffLocation}</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              {dropoffDateF}
            </p>
          </div>
        </div>

        {/* PDF Downloader & Invoice Toggles */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-2">
          <InvoiceDownloader booking={booking} user={booking.user} />
          
          <Link
            href="/profile?tab=bookings"
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2 transition-all cursor-pointer"
          >
            <span>Go to My Bookings</span>
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
