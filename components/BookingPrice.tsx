"use client";

import React from "react";
import { useAppContext } from "@/context/AppContext";

interface BookingPriceProps {
  totalPaidUSD: number; // final amount already in USD (totalPrice - discount)
}

export default function BookingPrice({ totalPaidUSD }: BookingPriceProps) {
  const { convertPrice } = useAppContext();
  return (
    <span className="text-2xl font-extrabold text-foreground">
      {convertPrice(totalPaidUSD)}
    </span>
  );
}
