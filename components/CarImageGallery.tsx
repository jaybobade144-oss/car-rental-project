"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CarImage {
  url: string;
}

interface CarImageGalleryProps {
  images: CarImage[];
  carName: string;
}

export default function CarImageGallery({ images, carName }: CarImageGalleryProps) {
  const [activeIdx, setActiveIdx] = useState(0);

  const displayImages = images.length > 0 ? images : [
    { url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80" }
  ];

  return (
    <div className="flex flex-col space-y-4">
      {/* Active Image Viewer */}
      <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-slate-900 border border-border/40 shadow-md">
        <AnimatePresence mode="wait">
          <motion.img
            key={activeIdx}
            src={displayImages[activeIdx].url}
            alt={`${carName} view`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="h-full w-full object-cover"
          />
        </AnimatePresence>
      </div>

      {/* Thumbnails Row */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {displayImages.map((img, idx) => {
            const isActive = idx === activeIdx;
            return (
              <button
                key={idx}
                onClick={() => setActiveIdx(idx)}
                className={`relative aspect-video w-24 overflow-hidden rounded-xl border transition-all duration-300 shrink-0 ${
                  isActive ? "border-primary ring-2 ring-primary/20 scale-[0.98]" : "border-border/40 hover:border-muted-foreground"
                }`}
              >
                <img
                  src={img.url}
                  alt={`${carName} thumbnail ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
