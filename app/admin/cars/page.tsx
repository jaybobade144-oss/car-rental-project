import React from "react";
import { prisma } from "@/lib/prisma";
import AdminCarsManager from "@/components/AdminCarsManager";

export const revalidate = 0; // Fetch fresh cars on load

export default async function AdminCarsPage() {
  const cars = await prisma.car.findMany({
    orderBy: { brand: "asc" },
    include: {
      images: true,
    },
  });

  return <AdminCarsManager cars={cars as any} />;
}
