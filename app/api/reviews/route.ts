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
    const { carId, rating, comment } = body;

    if (!carId || !rating || !comment) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const ratingInt = parseInt(rating);
    if (ratingInt < 1 || ratingInt > 5) {
      return NextResponse.json({ error: "Rating must be between 1 and 5" }, { status: 400 });
    }

    // Create review
    const review = await prisma.review.create({
      data: {
        userId: session.id,
        carId,
        rating: ratingInt,
        comment,
      },
    });

    // Re-calculate car rating
    const allCarReviews = await prisma.review.findMany({
      where: { carId },
      select: { rating: true },
    });

    const averageRating = allCarReviews.reduce((sum, r) => sum + r.rating, 0) / allCarReviews.length;

    await prisma.car.update({
      where: { id: carId },
      data: { rating: parseFloat(averageRating.toFixed(2)) },
    });

    // Notify user
    const car = await prisma.car.findUnique({ where: { id: carId } });
    await prisma.notification.create({
      data: {
        userId: session.id,
        title: "Review Submitted",
        message: `Thank you for sharing your feedback on the ${car?.brand} ${car?.name}.`,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("Create Review Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
