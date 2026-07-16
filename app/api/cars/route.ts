import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const generateSlug = (name: string, brand: string) => {
  return `${brand}-${name}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, brand, type, pricePerDay, transmission, fuel, seats, description, features, imageUrls } = body;

    if (!name || !brand || !type || !pricePerDay || !transmission || !fuel || !seats || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const slug = generateSlug(name, brand);

    const exists = await prisma.car.findUnique({ where: { slug } });
    if (exists) {
      return NextResponse.json({ error: "Car with this model name and brand already exists." }, { status: 400 });
    }

    const car = await prisma.car.create({
      data: {
        name,
        brand,
        type,
        pricePerDay: parseFloat(pricePerDay),
        transmission,
        fuel,
        seats: parseInt(seats),
        slug,
        description,
        features: JSON.stringify(features || []),
      },
    });

    if (imageUrls && imageUrls.length > 0) {
      for (const url of imageUrls) {
        if (url.trim()) {
          await prisma.carImage.create({
            data: { carId: car.id, url },
          });
        }
      }
    }

    return NextResponse.json({ success: true, car });
  } catch (error) {
    console.error("Car Create Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, brand, type, pricePerDay, transmission, fuel, seats, description, features, imageUrls } = body;

    if (!id || !name || !brand || !type || !pricePerDay || !transmission || !fuel || !seats || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const car = await prisma.car.update({
      where: { id },
      data: {
        name,
        brand,
        type,
        pricePerDay: parseFloat(pricePerDay),
        transmission,
        fuel,
        seats: parseInt(seats),
        description,
        features: JSON.stringify(features || []),
      },
    });

    if (imageUrls && imageUrls.length > 0) {
      await prisma.carImage.deleteMany({ where: { carId: id } });
      for (const url of imageUrls) {
        if (url.trim()) {
          await prisma.carImage.create({
            data: { carId: id, url },
          });
        }
      }
    }

    return NextResponse.json({ success: true, car });
  } catch (error) {
    console.error("Car Update Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing car ID" }, { status: 400 });
    }

    await prisma.car.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Car deleted successfully" });
  } catch (error) {
    console.error("Car Delete Error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
