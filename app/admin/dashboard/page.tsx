import React from "react";
import { prisma } from "@/lib/prisma";
import AdminDashboardView from "@/components/AdminDashboardView";

export const revalidate = 0; // Fetch fresh analytics on admin entry

export default async function AdminDashboardPage() {
  // 1. Fetch total counts
  const totalCars = await prisma.car.count();
  const totalBookings = await prisma.booking.count();
  const totalUsers = await prisma.user.count({
    where: { role: "USER" },
  });

  // 2. Fetch confirmed bookings for revenue
  const confirmedBookings = await prisma.booking.findMany({
    where: { status: "CONFIRMED" },
    select: {
      totalPrice: true,
      discount: true,
      createdAt: true,
    },
  });

  const totalRevenue = confirmedBookings.reduce(
    (sum, b) => sum + (b.totalPrice - b.discount),
    0
  );

  // 3. Fetch latest bookings
  const latestBookings = await prisma.booking.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        select: {
          id: true,
          name: true,
          brand: true,
          type: true,
          pricePerDay: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      payments: {
        select: {
          transactionId: true,
          amount: true,
        },
      },
    },
  });

  // 4. Compute monthly sales for area chart
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const salesByMonthMap: Record<string, number> = {};

  // Setup last 6 months labels
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
    salesByMonthMap[key] = 0;
  }

  confirmedBookings.forEach((b) => {
    const date = new Date(b.createdAt);
    const key = `${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
    if (salesByMonthMap[key] !== undefined) {
      salesByMonthMap[key] += b.totalPrice - b.discount;
    }
  });

  const salesByDate = Object.entries(salesByMonthMap).map(([date, amount]) => ({
    date,
    amount: parseFloat(amount.toFixed(2)),
  }));

  // 5. Compute vehicle category distribution for pie chart
  const cars = await prisma.car.findMany({
    select: { type: true },
  });

  const distributionMap: Record<string, number> = {};
  cars.forEach((c) => {
    distributionMap[c.type] = (distributionMap[c.type] || 0) + 1;
  });

  const categoryDistribution = Object.entries(distributionMap).map(([name, value]) => ({
    name,
    value,
  }));

  return (
    <AdminDashboardView
      totalCars={totalCars}
      totalBookings={totalBookings}
      totalUsers={totalUsers}
      totalRevenue={totalRevenue}
      latestBookings={latestBookings as any}
      salesByDate={salesByDate}
      categoryDistribution={categoryDistribution}
    />
  );
}
