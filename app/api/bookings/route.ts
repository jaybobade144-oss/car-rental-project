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
    const {
      carId,
      pickupLocation,
      dropoffLocation,
      pickupDate,
      dropoffDate,
      totalPrice,
      couponCode,
      discount,
    } = body;

    // Validate fields
    if (!carId || !pickupLocation || !dropoffLocation || !pickupDate || !dropoffDate || !totalPrice) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const start = new Date(pickupDate);
    const end = new Date(dropoffDate);

    // Overlap validation
    const overlap = await prisma.booking.findFirst({
      where: {
        carId,
        status: { in: ["PENDING", "CONFIRMED"] },
        OR: [
          {
            pickupDate: { lte: end },
            dropoffDate: { gte: start },
          },
        ],
      },
    });

    if (overlap) {
      return NextResponse.json(
        { error: "This car is already booked on those dates." },
        { status: 400 }
      );
    }

    // Create booking and payment inside a transaction
    const booking = await prisma.booking.create({
      data: {
        userId: session.id,
        carId,
        pickupLocation,
        dropoffLocation,
        pickupDate: start,
        dropoffDate: end,
        totalPrice: parseFloat(totalPrice),
        status: "CONFIRMED",
        couponCode: couponCode || null,
        discount: parseFloat(discount || 0.0),
        paymentStatus: "PAID",
      },
    });

    const txId = "TX_" + Math.random().toString(36).substring(2, 11).toUpperCase();
    await prisma.payment.create({
      data: {
        bookingId: booking.id,
        amount: booking.totalPrice - booking.discount,
        provider: "CARD",
        status: "SUCCESS",
        transactionId: txId,
      },
    });

    // Send notifications
    const car = await prisma.car.findUnique({ where: { id: carId } });
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: "Booking Confirmed",
        message: `Your booking for ${car?.brand} ${car?.name} has been successfully completed. Transaction ID: ${txId}`,
      },
    });

    return NextResponse.json({ success: true, bookingId: booking.id });
  } catch (error: any) {
    console.error("Booking Create Error:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
