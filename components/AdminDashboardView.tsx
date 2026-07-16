"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  DollarSign,
  Car,
  Calendar,
  Users,
  Star,
  Clock,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  ChevronRight
} from "lucide-react";
import Link from "next/link";

interface CarImage {
  url: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  type: string;
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
  createdAt: string | Date;
  car: Car;
  user: User;
  payments: Payment[];
}

interface AdminDashboardViewProps {
  totalCars: number;
  totalBookings: number;
  totalUsers: number;
  totalRevenue: number;
  latestBookings: Booking[];
  salesByDate: { date: string; amount: number }[];
  categoryDistribution: { name: string; value: number }[];
}

const COLORS = ["#4f46e5", "#6366f1", "#a855f7", "#ec4899", "#3b82f6"];

export default function AdminDashboardView({
  totalCars,
  totalBookings,
  totalUsers,
  totalRevenue,
  latestBookings,
  salesByDate,
  categoryDistribution,
}: AdminDashboardViewProps) {
  const { convertPrice } = useAppContext();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const metrics = [
    { name: "Total Revenue", value: convertPrice(totalRevenue), icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { name: "Active Fleet Size", value: totalCars.toString(), icon: Car, color: "text-primary", bg: "bg-primary/10" },
    { name: "Total Reservations", value: totalBookings.toString(), icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-500/10" },
    { name: "Customer Base", value: totalUsers.toString(), icon: Users, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  if (!mounted) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <LoaderSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Dashboard Overview</h1>
        <p className="text-xs text-muted-foreground mt-1">Real-time local SQL analytics for earnings, bookings, and cars.</p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.name} className="bg-card border border-border/40 p-6 rounded-3xl shadow-sm flex items-center justify-between transition-transform hover:-translate-y-0.5 duration-300">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground">{m.name}</span>
                <h3 className="text-2xl font-extrabold text-foreground mt-1">{m.value}</h3>
              </div>
              <div className={`rounded-2xl ${m.bg} ${m.color} p-3`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Area Chart */}
        <div className="lg:col-span-2 bg-card border border-border/40 p-6 rounded-3xl shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Revenue Analytics</h3>
              <p className="text-[10px] text-muted-foreground">Monthly sales volume graph</p>
            </div>
            <TrendingUp className="h-4.5 w-4.5 text-primary" />
          </div>

          <div className="h-72 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesByDate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" />
                <YAxis stroke="var(--muted-foreground)" />
                <Tooltip
                  contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "12px" }}
                  labelStyle={{ fontWeight: "bold", color: "var(--foreground)" }}
                />
                <Area type="monotone" dataKey="amount" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fleet Distribution Pie Chart */}
        <div className="lg:col-span-1 bg-card border border-border/40 p-6 rounded-3xl shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Fleet Categories</h3>
            <p className="text-[10px] text-muted-foreground">Inventory count classification</p>
          </div>

          <div className="h-72 w-full flex items-center justify-center text-xs">
            {categoryDistribution.length === 0 ? (
              <span className="text-muted-foreground">No car inventory.</span>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryDistribution}
                    cx="50%"
                    cy="40%"
                    innerRadius={50}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "var(--card)", borderColor: "var(--border)", borderRadius: "12px" }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconSize={10} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Latest Bookings Table */}
      <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">Latest Reservations</h3>
            <p className="text-[10px] text-muted-foreground">Recent transactions details and status summaries</p>
          </div>
          <Link href="/admin/bookings" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
            <span>Manage All Bookings</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {latestBookings.length === 0 ? (
          <div className="text-xs text-muted-foreground italic py-6 text-center">No bookings logs found in database.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-secondary/50 border-b border-border/40 text-muted-foreground font-bold uppercase tracking-wider">
                  <th className="p-4">Reference</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Car Model</th>
                  <th className="p-4">Dates</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Total Paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {latestBookings.map((b) => {
                  const start = new Date(b.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const end = new Date(b.dropoffDate).toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  const finalAmount = b.totalPrice - b.discount;
                  const isCancelled = b.status === "CANCELLED";
                  return (
                    <tr key={b.id} className="hover:bg-secondary/10 text-foreground font-medium">
                      <td className="p-4 font-mono font-bold uppercase text-primary">{b.id.substring(0, 8)}</td>
                      <td className="p-4">
                        <div className="font-bold">{b.user.name}</div>
                        <div className="text-[10px] text-muted-foreground">{b.user.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold">{b.car.brand} {b.car.name}</div>
                        <div className="text-[10px] text-muted-foreground uppercase">{b.car.type}</div>
                      </td>
                      <td className="p-4 text-muted-foreground">
                        {start} - {end}
                      </td>
                      <td className="p-4">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[9px] font-bold uppercase ${
                          isCancelled
                            ? "bg-destructive/10 text-destructive border-destructive/20"
                            : b.status === "CONFIRMED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        }`}>
                          {b.status}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-foreground">
                        {convertPrice(finalAmount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function LoaderSpinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      <span className="text-xs text-muted-foreground">Assembling analytics dashboards...</span>
    </div>
  );
}
