import React from "react";
import { prisma } from "@/lib/prisma";
import { TrendingUp, Percent, ShieldAlert, Award, Landmark } from "lucide-react";

export const revalidate = 0;

export default async function AdminReportsPage() {
  // 1. Calculations
  const bookingsCount = await prisma.booking.count();
  
  const confirmed = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    select: { totalPrice: true, discount: true },
  });

  const cancelledCount = await prisma.booking.count({
    where: { status: "CANCELLED" },
  });

  const totalSales = confirmed.reduce((sum, b) => sum + (b.totalPrice - b.discount), 0);
  const totalDiscounts = confirmed.reduce((sum, b) => sum + b.discount, 0);

  const avgOrderValue = confirmed.length > 0 ? totalSales / confirmed.length : 0;

  // 2. Aggregate most popular category
  const typeAgg = await prisma.car.groupBy({
    by: ["type"],
    _count: {
      id: true,
    },
  });
  
  let topType = "N/A";
  let topCount = 0;
  typeAgg.forEach((item) => {
    if (item._count.id > topCount) {
      topCount = item._count.id;
      topType = item.type;
    }
  });

  // 3. Aggregate most popular brand
  const brandAgg = await prisma.car.groupBy({
    by: ["brand"],
    _count: {
      id: true,
    },
  });

  let topBrand = "N/A";
  let topBrandCount = 0;
  brandAgg.forEach((item) => {
    if (item._count.id > topBrandCount) {
      topBrandCount = item._count.id;
      topBrand = item.brand;
    }
  });

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Reports & Analytics</h1>
        <p className="text-xs text-muted-foreground mt-1">Aggregated platform statistics and performance metrics.</p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Average Order</span>
            <h3 className="text-xl font-extrabold text-foreground mt-1">${avgOrderValue.toFixed(2)}</h3>
          </div>
          <div className="rounded-2xl bg-primary/10 text-primary p-3">
            <Landmark className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Promo Discounts</span>
            <h3 className="text-xl font-extrabold text-foreground mt-1">${totalDiscounts.toFixed(2)}</h3>
          </div>
          <div className="rounded-2xl bg-indigo-500/10 text-indigo-500 p-3">
            <Percent className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Cancellations</span>
            <h3 className="text-xl font-extrabold text-foreground mt-1">{cancelledCount} Bookings</h3>
          </div>
          <div className="rounded-2xl bg-rose-500/10 text-rose-500 p-3">
            <ShieldAlert className="h-5 w-5" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-muted-foreground">Popular Class</span>
            <h3 className="text-xl font-extrabold text-foreground mt-1">{topType}</h3>
          </div>
          <div className="rounded-2xl bg-amber-500/10 text-amber-500 p-3">
            <Award className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Summary section */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4 max-w-2xl">
        <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Performance Summary</h3>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between py-2 border-b border-border/20">
            <span className="text-muted-foreground">Total Reservations Count</span>
            <span className="font-bold text-foreground">{bookingsCount} Bookings</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/20">
            <span className="text-muted-foreground">Confirmed Transactions Count</span>
            <span className="font-bold text-foreground">{confirmed.length} Transactions</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/20">
            <span className="text-muted-foreground">Gross Rental Revenue</span>
            <span className="font-bold text-foreground">${(totalSales + totalDiscounts).toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/20">
            <span className="text-muted-foreground">Total Discount Deductions</span>
            <span className="font-bold text-emerald-500">-${totalDiscounts.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border/20">
            <span className="text-muted-foreground">Most Popular Manufacturer</span>
            <span className="font-bold text-foreground">{topBrand} ({topBrandCount} models)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Net Rental Earnings</span>
            <span className="font-extrabold text-primary text-sm">${totalSales.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
