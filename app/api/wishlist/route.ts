import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ wishlisted: false });
    }
    
    const url = new URL(request.url);
    const carId = url.searchParams.get("carId");
    
    if (!carId) {
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });
    }
    
    const item = await prisma.wishlist.findUnique({
      where: {
        userId_carId: {
          userId: session.id,
          carId,
        },
      },
    });
    
    return NextResponse.json({ wishlisted: !!item });
  } catch (error) {
    console.error("Wishlist GET Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const body = await request.json();
    const { carId } = body;
    
    if (!carId) {
      return NextResponse.json({ error: "Missing carId" }, { status: 400 });
    }
    
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_carId: {
          userId: session.id,
          carId,
        },
      },
    });
    
    if (existing) {
      await prisma.wishlist.delete({
        where: {
          userId_carId: {
            userId: session.id,
            carId,
          },
        },
      });
      return NextResponse.json({ wishlisted: false });
    } else {
      await prisma.wishlist.create({
        data: {
          userId: session.id,
          carId,
        },
      });
      return NextResponse.json({ wishlisted: true });
    }
  } catch (error) {
    console.error("Wishlist POST Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
