import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import UserDashboard from "@/components/UserDashboard";

export const revalidate = 0; // Fetch fresh data on load

interface SearchParams {
  tab?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const session = await getSession();
  const params = await searchParams;
  const activeTab = params.tab || "summary";

  // 1. Auth Guard: Redirect to login if not authenticated
  if (!session) {
    redirect("/login?redirect=/profile");
  }

  // Fetch User Profile data concurrently
  const [bookings, wishlist, payments, notifications] = await Promise.all([
    prisma.booking.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
      include: {
        car: {
          include: {
            images: { take: 1 },
          },
        },
        payments: true,
      },
    }),
    prisma.wishlist.findMany({
      where: { userId: session.id },
      include: {
        car: {
          include: {
            images: { take: 1 },
          },
        },
      },
    }),
    prisma.payment.findMany({
      where: {
        booking: {
          userId: session.id,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">User Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your rental activities, update credentials, download invoices, and manage saved cars.
        </p>
      </div>

      <UserDashboard
        initialTab={activeTab}
        bookings={bookings}
        wishlist={wishlist}
        payments={payments}
        notifications={notifications}
      />
    </div>
  );
}
