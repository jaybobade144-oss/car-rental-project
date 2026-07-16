"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";
import { Heart, Users, Compass, Fuel, Star } from "lucide-react";
import { motion } from "framer-motion";

interface CarImage {
  url: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  type: string;
  pricePerDay: number;
  transmission: string;
  fuel: string;
  seats: number;
  slug: string;
  rating: number;
  images: CarImage[];
}

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const { user } = useAuth();
  const { convertPrice, t } = useAppContext();
  const router = useRouter();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const mainImage = car.images?.[0]?.url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=500&q=80";

  // Check wishlist status on load
  useEffect(() => {
    if (user) {
      fetch(`/api/wishlist?carId=${car.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.wishlisted) setIsWishlisted(true);
        })
        .catch(() => {});
    }
  }, [user, car.id]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push("/login");
      return;
    }

    setWishlistLoading(true);
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId: car.id }),
      });
      if (res.ok) {
        const data = await res.json();
        setIsWishlisted(data.wishlisted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/40 bg-card p-4 shadow-sm hover:shadow-md transition-all duration-300"
    >
      <div>
        {/* Card Header */}
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs uppercase font-semibold text-primary tracking-wider">{car.brand}</span>
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{car.name}</h3>
          </div>
          <button
            onClick={toggleWishlist}
            disabled={wishlistLoading}
            className={`rounded-full p-2 border border-border/40 transition-all ${
              isWishlisted
                ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                : "bg-secondary/40 text-muted-foreground hover:text-foreground"
            }`}
            aria-label="Add to wishlist"
          >
            <Heart className={`h-4 w-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
          </button>
        </div>

        {/* Rating */}
        <div className="mt-1 flex items-center gap-1 text-xs">
          <div className="flex items-center text-amber-500">
            <Star className="h-3 w-3 fill-amber-500" />
            <span className="ml-1 font-bold">{car.rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">({t("reviews")})</span>
        </div>

        {/* Image */}
        <Link href={`/cars/${car.slug}`} className="block my-6 overflow-hidden rounded-xl h-40">
          <img
            src={mainImage}
            alt={`${car.brand} ${car.name}`}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80";
            }}
          />
        </Link>

        {/* Specifications Grid */}
        <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-border/40 text-xs text-muted-foreground">
          <div className="flex flex-col items-center gap-1 py-1">
            <Users className="h-4 w-4 text-primary" />
            <span>{car.seats} {t("seats")}</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-1 border-l border-r border-border/40">
            <Compass className="h-4 w-4 text-primary" />
            <span className="truncate max-w-[70px]">{car.transmission}</span>
          </div>
          <div className="flex flex-col items-center gap-1 py-1">
            <Fuel className="h-4 w-4 text-primary" />
            <span className="truncate max-w-[70px]">{car.fuel}</span>
          </div>
        </div>
      </div>

      {/* Pricing and Action */}
      <div className="mt-4 flex items-center justify-between">
        <div>
          <span className="text-xl font-extrabold text-foreground">{convertPrice(car.pricePerDay)}</span>
          <span className="text-xs text-muted-foreground ml-1">/ {t("pricePerDay")}</span>
        </div>
        <Link
          href={`/cars/${car.slug}`}
          className="rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 transition-all shadow-sm shadow-primary/20"
        >
          {t("bookNow")}
        </Link>
      </div>
    </motion.div>
  );
}
