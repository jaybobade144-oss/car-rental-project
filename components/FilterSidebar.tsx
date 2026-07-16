"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { SlidersHorizontal, RotateCcw } from "lucide-react";

interface FilterSidebarProps {
  brands: string[];
  types: string[];
}

export default function FilterSidebar({ brands, types }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useAppContext();

  // Load initial filters from URL params
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedTrans, setSelectedTrans] = useState<string[]>([]);
  const [selectedFuel, setSelectedFuel] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    const brandParam = searchParams.get("brand");
    const typeParam = searchParams.get("type");
    const transParam = searchParams.get("transmission");
    const fuelParam = searchParams.get("fuel");
    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    setSelectedBrands(brandParam ? brandParam.split(",") : []);
    setSelectedTypes(typeParam ? typeParam.split(",") : []);
    setSelectedTrans(transParam ? transParam.split(",") : []);
    setSelectedFuel(fuelParam ? fuelParam.split(",") : []);
    setMinPrice(minPriceParam || "");
    setMaxPrice(maxPriceParam || "");
  }, [searchParams]);

  const updateFilters = (
    updatedBrands: string[],
    updatedTypes: string[],
    updatedTrans: string[],
    updatedFuel: string[],
    updatedMin: string,
    updatedMax: string
  ) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Reset to page 1 on filter change
    params.set("page", "1");

    if (updatedBrands.length > 0) params.set("brand", updatedBrands.join(","));
    else params.delete("brand");

    if (updatedTypes.length > 0) params.set("type", updatedTypes.join(","));
    else params.delete("type");

    if (updatedTrans.length > 0) params.set("transmission", updatedTrans.join(","));
    else params.delete("transmission");

    if (updatedFuel.length > 0) params.set("fuel", updatedFuel.join(","));
    else params.delete("fuel");

    if (updatedMin) params.set("minPrice", updatedMin);
    else params.delete("minPrice");

    if (updatedMax) params.set("maxPrice", updatedMax);
    else params.delete("maxPrice");

    router.push(`/cars?${params.toString()}`);
  };

  const handleCheckboxChange = (
    value: string,
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    type: "brand" | "type" | "trans" | "fuel"
  ) => {
    const isChecked = list.includes(value);
    const updated = isChecked
      ? list.filter((item) => item !== value)
      : [...list, value];
    
    setList(updated);

    if (type === "brand") updateFilters(updated, selectedTypes, selectedTrans, selectedFuel, minPrice, maxPrice);
    if (type === "type") updateFilters(selectedBrands, updated, selectedTrans, selectedFuel, minPrice, maxPrice);
    if (type === "trans") updateFilters(selectedBrands, selectedTypes, updated, selectedFuel, minPrice, maxPrice);
    if (type === "fuel") updateFilters(selectedBrands, selectedTypes, selectedTrans, updated, minPrice, maxPrice);
  };

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(selectedBrands, selectedTypes, selectedTrans, selectedFuel, minPrice, maxPrice);
  };

  const handleReset = () => {
    setSelectedBrands([]);
    setSelectedTypes([]);
    setSelectedTrans([]);
    setSelectedFuel([]);
    setMinPrice("");
    setMaxPrice("");
    router.push("/cars");
  };

  return (
    <div className="w-full bg-card border border-border/40 rounded-3xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-border/40">
        <h3 className="text-base font-bold text-foreground flex items-center gap-2">
          <SlidersHorizontal className="h-4.5 w-4.5 text-primary" />
          Filter Options
        </h3>
        <button
          onClick={handleReset}
          className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset All
        </button>
      </div>

      {/* Brand Filters */}
      <div className="mb-6">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Brands</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
          {brands.map((b) => (
            <label key={b} className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedBrands.includes(b)}
                onChange={() => handleCheckboxChange(b, selectedBrands, setSelectedBrands, "brand")}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="group-hover:text-primary transition-colors">{b}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Type/Category Filters */}
      <div className="mb-6 border-t border-border/40 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Categories</h4>
        <div className="space-y-2">
          {types.map((tCode) => (
            <label key={tCode} className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTypes.includes(tCode)}
                onChange={() => handleCheckboxChange(tCode, selectedTypes, setSelectedTypes, "type")}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="group-hover:text-primary transition-colors">{tCode}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filters */}
      <div className="mb-6 border-t border-border/40 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Price Per Day (USD)</h4>
        <form onSubmit={handlePriceApply} className="flex gap-2 items-center">
          <input
            type="number"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
          />
          <span className="text-muted-foreground text-xs">-</span>
          <input
            type="number"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs focus:border-primary focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-secondary px-3 py-2 text-xs font-bold text-foreground hover:bg-primary hover:text-white transition-colors"
          >
            Go
          </button>
        </form>
      </div>

      {/* Transmission Filters */}
      <div className="mb-6 border-t border-border/40 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Transmission</h4>
        <div className="space-y-2">
          {["Automatic", "Manual"].map((trans) => (
            <label key={trans} className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedTrans.includes(trans)}
                onChange={() => handleCheckboxChange(trans, selectedTrans, setSelectedTrans, "trans")}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="group-hover:text-primary transition-colors">{trans}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Fuel Filters */}
      <div className="border-t border-border/40 pt-5">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Fuel Type</h4>
        <div className="space-y-2">
          {["Petrol", "Diesel", "Electric", "Hybrid"].map((f) => (
            <label key={f} className="flex items-center gap-2 text-sm text-foreground cursor-pointer group">
              <input
                type="checkbox"
                checked={selectedFuel.includes(f)}
                onChange={() => handleCheckboxChange(f, selectedFuel, setSelectedFuel, "fuel")}
                className="rounded border-border text-primary focus:ring-primary h-4 w-4"
              />
              <span className="group-hover:text-primary transition-colors">{f}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
