import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import CarImageGallery from "@/components/CarImageGallery";
import CarDetailBooking from "@/components/CarDetailBooking";
import CarCard from "@/components/CarCard";
import { ArrowLeft, Star, Users, Compass, Fuel, CheckCircle, Calendar, MessageSquare, AlertCircle } from "lucide-react";

export const revalidate = 0; // Fetch fresh availability and reviews on details load

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function CarDetailsPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  // 1. Fetch Car details
  const car = await prisma.car.findUnique({
    where: { slug },
    include: {
      images: true,
    },
  });

  if (!car) {
    notFound();
  }

  // 2. Fetch occupied booking dates (not cancelled)
  const bookings = await prisma.booking.findMany({
    where: {
      carId: car.id,
      status: { in: ["PENDING", "CONFIRMED"] },
      dropoffDate: { gte: new Date() },
    },
    select: {
      pickupDate: true,
      dropoffDate: true,
    },
  });

  const occupiedRanges = bookings.map((b) => ({
    start: b.pickupDate.toISOString().split("T")[0],
    end: b.dropoffDate.toISOString().split("T")[0],
  }));

  // 3. Fetch Locations
  const locations = await prisma.location.findMany({
    select: { id: true, name: true },
  });

  // 4. Fetch Reviews
  const reviews = await prisma.review.findMany({
    where: { carId: car.id },
    include: {
      user: {
        select: {
          name: true,
          avatar: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 5. Intelligent local recommendation: Related Cars
  // Find cars of same type OR brand, excluding current car, sorting by rating desc
  const relatedCars = await prisma.car.findMany({
    where: {
      id: { not: car.id },
      OR: [
        { type: car.type },
        { brand: car.brand },
      ],
    },
    take: 3,
    orderBy: {
      rating: "desc",
    },
    include: {
      images: { take: 1 },
    },
  });

  // Fallback if no related type/brand found
  const finalRelated = relatedCars.length > 0 ? relatedCars : await prisma.car.findMany({
    where: { id: { not: car.id } },
    take: 3,
    orderBy: { rating: "desc" },
    include: { images: { take: 1 } },
  });

  const featuresList: string[] = JSON.parse(car.features || "[]");

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Back Button */}
      <Link href="/cars" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-6 transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left 2 Columns: Image Gallery, Specs, Description, Reviews */}
        <div className="lg:col-span-2 space-y-8">
          {/* Gallery Component */}
          <CarImageGallery images={car.images} carName={`${car.brand} ${car.name}`} />

          {/* Core Specs Grid */}
          <div className="grid grid-cols-3 gap-4 bg-card border border-border/40 p-5 rounded-2xl shadow-sm text-center">
            <div className="flex flex-col items-center justify-center p-2">
              <Users className="h-5 w-5 text-primary mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Seats</span>
              <span className="text-sm font-bold text-foreground mt-1">{car.seats} Passengers</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2 border-l border-r border-border/40">
              <Compass className="h-5 w-5 text-primary mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Transmission</span>
              <span className="text-sm font-bold text-foreground mt-1">{car.transmission}</span>
            </div>
            <div className="flex flex-col items-center justify-center p-2">
              <Fuel className="h-5 w-5 text-primary mb-2" />
              <span className="text-xs font-medium text-muted-foreground">Fuel Spec</span>
              <span className="text-sm font-bold text-foreground mt-1">{car.fuel}</span>
            </div>
          </div>

          {/* Description & Brand Information */}
          <div className="space-y-4">
            <div className="flex items-baseline justify-between border-b border-border/40 pb-2">
              <h2 className="text-xl font-extrabold text-foreground">About This Vehicle</h2>
              <span className="text-xs font-bold bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full uppercase">
                {car.type} Class
              </span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {car.description}
            </p>
          </div>

          {/* Features Checklist */}
          {featuresList.length > 0 && (
            <div className="space-y-4 border-t border-border/40 pt-6">
              <h3 className="text-base font-extrabold text-foreground">Premium Inclusions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {featuresList.map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle className="h-4.5 w-4.5 text-primary fill-primary/10 shrink-0" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          <div className="space-y-6 border-t border-border/40 pt-8">
            <div className="flex items-center justify-between border-b border-border/40 pb-3">
              <h3 className="text-lg font-extrabold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Customer Experiences
              </h3>
              <div className="flex items-center text-sm font-semibold">
                <Star className="h-4.5 w-4.5 text-amber-500 fill-amber-500 mr-1" />
                <span>{car.rating.toFixed(1)} / 5.0</span>
                <span className="text-xs text-muted-foreground ml-1">({reviews.length} reviews)</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl bg-secondary/30 p-5 text-sm text-muted-foreground">
                <AlertCircle className="h-5 w-5 text-primary" />
                <span>No reviews have been written for this car yet. Be the first after renting!</span>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev.id} className="bg-card border border-border/40 rounded-2xl p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {rev.user.avatar ? (
                          <img src={rev.user.avatar} alt={rev.user.name} className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white text-xs font-bold">
                            {rev.user.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h4 className="text-sm font-bold text-foreground">{rev.user.name}</h4>
                          <span className="text-[10px] text-muted-foreground">
                            {new Date(rev.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                          </span>
                        </div>
                      </div>
                      <div className="flex text-amber-500">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3.5 w-3.5 fill-amber-500" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Column: Date Selection Card */}
        <div className="lg:col-span-1">
          <CarDetailBooking
            carId={car.id}
            pricePerDay={car.pricePerDay}
            locations={locations}
            occupiedRanges={occupiedRanges}
          />
        </div>
      </div>

      {/* Related / Recommended Fleet Section */}
      <section className="mt-20 border-t border-border/40 pt-16">
        <h3 className="text-xl font-extrabold text-foreground mb-1">AI-Powered Recommendations</h3>
        <p className="text-xs text-muted-foreground mb-6">Based on category, pricing structure, and user preferences, you might also like these models.</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {finalRelated.map((relatedCar) => (
            <CarCard key={relatedCar.id} car={relatedCar} />
          ))}
        </div>
      </section>

      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Car",
            "name": car.name,
            "brand": {
              "@type": "Brand",
              "name": car.brand,
            },
            "image": car.images?.[0]?.url || "",
            "description": car.description,
            "offers": {
              "@type": "Offer",
              "price": car.pricePerDay,
              "priceCurrency": "USD",
            },
          }),
        }}
      />
    </div>
  );
}
