import React from "react";
import { prisma } from "@/lib/prisma";
import CarCard from "@/components/CarCard";
import FilterSidebar from "@/components/FilterSidebar";
import SearchInput from "@/components/SearchInput"; // We will create this small component
import SortSelect from "@/components/SortSelect";   // We will create this small component
import Link from "next/link";
import { ArrowLeft, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";

export const revalidate = 0; // Fetch fresh cars on search/filter

interface SearchParams {
  search?: string;
  type?: string;
  transmission?: string;
  fuel?: string;
  minPrice?: string;
  maxPrice?: string;
  brand?: string;
  sortBy?: string;
  page?: string;
}

export default async function CarsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const search = params.search || "";
  const type = params.type || "";
  const transmission = params.transmission || "";
  const fuel = params.fuel || "";
  const minPrice = params.minPrice ? parseFloat(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? parseFloat(params.maxPrice) : undefined;
  const brand = params.brand || "";
  const sortBy = params.sortBy || "";
  const page = params.page ? parseInt(params.page) : 1;
  const pageSize = 6;

  // Build Prisma where clause
  const where: any = {};
  
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { brand: { contains: search } },
    ];
  }
  
  if (type) {
    where.type = { in: type.split(",") };
  }
  
  if (transmission) {
    where.transmission = { in: transmission.split(",") };
  }
  
  if (fuel) {
    where.fuel = { in: fuel.split(",") };
  }
  
  if (brand) {
    where.brand = { in: brand.split(",") };
  }
  
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.pricePerDay = {};
    if (minPrice !== undefined) where.pricePerDay.gte = minPrice;
    if (maxPrice !== undefined) where.pricePerDay.lte = maxPrice;
  }

  // Sorting
  let orderBy: any = { rating: "desc" };
  if (sortBy === "price_asc") {
    orderBy = { pricePerDay: "asc" };
  } else if (sortBy === "price_desc") {
    orderBy = { pricePerDay: "desc" };
  } else if (sortBy === "rating_desc") {
    orderBy = { rating: "desc" };
  }

  // Query database concurrently
  const [totalCars, cars, allBrandsResult, allTypesResult] = await Promise.all([
    prisma.car.count({ where }),
    prisma.car.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        images: {
          take: 1,
        },
      },
    }),
    prisma.car.groupBy({
      by: ["brand"],
    }),
    prisma.car.groupBy({
      by: ["type"],
    }),
  ]);

  const totalPages = Math.ceil(totalCars / pageSize);
  const brandsList = allBrandsResult.map((b) => b.brand).sort();
  const typesList = allTypesResult.map((t) => t.type).sort();

  // Helper for rendering page buttons
  const getPageUrl = (pageNumber: number) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val && key !== "page") {
        queryParams.set(key, val);
      }
    });
    queryParams.set("page", pageNumber.toString());
    return `/cars?${queryParams.toString()}`;
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-10">
      {/* Title */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary mb-3 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Home
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Available Rental Fleet</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Showing {cars.length} of {totalCars} premium vehicles available across Maharashtra.
        </p>
      </div>

      {/* Toolbar Search / Sort */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4 bg-card border border-border/40 p-4 rounded-2xl shadow-sm">
        <div className="w-full sm:max-w-md">
          <SearchInput initialValue={search} />
        </div>
        <div className="flex gap-4 w-full sm:w-auto shrink-0 justify-end">
          <SortSelect initialValue={sortBy} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar brands={brandsList} types={typesList} />
        </div>

        {/* Cars Grid */}
        <div className="lg:col-span-3">
          {cars.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-card border border-border/40 rounded-3xl p-8">
              <SlidersHorizontal className="h-10 w-10 text-muted-foreground stroke-[1.5] mb-4" />
              <h3 className="text-lg font-bold text-foreground">No Cars Match Your Filters</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Try widening your search terms, adjusting the price sliders, or selecting another category class.
              </p>
              <Link
                href="/cars"
                className="mt-6 rounded-xl bg-primary px-5 py-2.5 text-xs font-bold text-white hover:opacity-95 shadow-md shadow-primary/20"
              >
                Clear All Filters
              </Link>
            </div>
          ) : (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {cars.map((car) => (
                  <CarCard key={car.id} car={car} />
                ))}
              </div>

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-12 flex justify-center items-center gap-2">
                  {page > 1 ? (
                    <Link
                      href={getPageUrl(page - 1)}
                      className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Previous Page"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Link>
                  ) : (
                    <span className="rounded-xl border border-border bg-card/50 p-2 text-muted-foreground/45 cursor-not-allowed">
                      <ChevronLeft className="h-5 w-5" />
                    </span>
                  )}

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isCurrent = pageNum === page;
                    return (
                      <Link
                        key={pageNum}
                        href={getPageUrl(pageNum)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                          isCurrent
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {pageNum}
                      </Link>
                    );
                  })}

                  {page < totalPages ? (
                    <Link
                      href={getPageUrl(page + 1)}
                      className="rounded-xl border border-border bg-card p-2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label="Next Page"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </Link>
                  ) : (
                    <span className="rounded-xl border border-border bg-card/50 p-2 text-muted-foreground/45 cursor-not-allowed">
                      <ChevronRight className="h-5 w-5" />
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
