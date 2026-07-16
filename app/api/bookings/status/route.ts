import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId, status } = body;

    if (!bookingId || !status) {
      return NextResponse.json({ error: "Booking ID and status are required" }, { status: 400 });
    }

    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 });
    }

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { car: true },
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Update booking status
    const updated = await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    });

    // Notify user
    await prisma.notification.create({
      data: {
        userId: booking.userId,
        title: `Reservation ${status.toLowerCase()}`,
        message: `The status of your reservation for ${booking.car.brand} ${booking.car.name} has been updated to ${status}.`,
      },
    });

    return NextResponse.json({ success: true, booking: updated });
  } catch (error) {
    console.error("Booking Status Update Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
