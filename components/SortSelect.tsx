"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown } from "lucide-react";

interface SortSelectProps {
  initialValue: string;
}

export default function SortSelect({ initialValue }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1");
    
    if (value) {
      params.set("sortBy", value);
    } else {
      params.delete("sortBy");
    }
    
    router.push(`/cars?${params.toString()}`);
  };

  return (
    <div className="relative flex items-center gap-2">
      <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5 shrink-0">
        <ArrowUpDown className="h-4 w-4 text-primary" />
        Sort By
      </label>
      <select
        value={initialValue}
        onChange={handleSortChange}
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary appearance-none pr-8 cursor-pointer transition-colors"
      >
        <option value="">Featured</option>
        <option value="price_asc">Price: Low to High</option>
        <option value="price_desc">Price: High to Low</option>
        <option value="rating_desc">Top Rated</option>
      </select>
    </div>
  );
}
