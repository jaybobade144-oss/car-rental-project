import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/CheckoutForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 0; // Fresh pages on checkouts

interface SearchParams {
  carId?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  pickupDate?: string;
  dropoffDate?: string;
  days?: string;
  totalPrice?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function CheckoutPage({ searchParams }: PageProps) {
  const session = await getSession();
  const params = await searchParams;

  const {
    carId,
    pickupLocation,
    dropoffLocation,
    pickupDate,
    dropoffDate,
    days,
    totalPrice,
  } = params;

  // 1. Auth Guard: Redirect to login if not authenticated
  if (!session) {
    const redirectParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val) redirectParams.set(key, val);
    });
    
    redirect(`/login?redirect=/checkout?${redirectParams.toString()}`);
  }

  // 2. Validate params are present
  if (!carId || !pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate || !days || !totalPrice) {
    redirect("/cars");
  }

  // 3. Fetch Car from DB
  const car = await prisma.car.findUnique({
    where: { id: carId },
    include: {
      images: { take: 1 },
    },
  });

  if (!car) {
    redirect("/cars");
  }

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-8">
        <Link
          href={`/cars/${car.slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-3 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Car Details
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Complete Booking Checkout</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review your pickup details, apply coupons, and confirm your reservation below.
        </p>
      </div>

      {/* Checkout Form */}
      <CheckoutForm
        car={car}
        pickupLocation={pickupLocation}
        dropoffLocation={dropoffLocation}
        pickupDate={pickupDate}
        dropoffDate={dropoffDate}
        days={parseInt(days)}
        initialTotal={parseFloat(totalPrice)}
      />
    </div>
  );
}
