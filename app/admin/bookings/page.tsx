import React from "react";
import { prisma } from "@/lib/prisma";
import AdminBookingsManager from "@/components/AdminBookingsManager";

export const revalidate = 0; // Fresh pages

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      car: {
        select: {
          name: true,
          brand: true,
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

  return <AdminBookingsManager bookings={bookings as any} />;
}
