import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    if (booking.userId !== session.id && session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Cancel booking
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
      include: { car: true },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: "Booking Cancelled",
        message: `Your booking for ${updated.car.brand} ${updated.car.name} has been successfully cancelled.`,
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Booking Cancel Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
