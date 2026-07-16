import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json({ error: "Coupon code is required" }, { status: 400 });
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon || !coupon.active) {
      return NextResponse.json({ error: "Invalid or inactive coupon code" }, { status: 404 });
    }

    if (new Date(coupon.expiryDate) < new Date()) {
      return NextResponse.json({ error: "Coupon code has expired" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      discountPercent: coupon.discountPercent,
    });
  } catch (error) {
    console.error("Coupon Validate Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
