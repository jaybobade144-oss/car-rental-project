"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { CreditCard, Calendar, ShieldCheck, Ticket, AlertCircle, Loader } from "lucide-react";

interface CarImage {
  url: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  type: string;
  pricePerDay: number;
  images: CarImage[];
}

interface CheckoutFormProps {
  car: Car;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  dropoffDate: string;
  days: number;
  initialTotal: number;
}

export default function CheckoutForm({
  car,
  pickupLocation,
  dropoffLocation,
  pickupDate,
  dropoffDate,
  days,
  initialTotal,
}: CheckoutFormProps) {
  const router = useRouter();
  const { convertPrice } = useAppContext();

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  // Billing state
  const tax = initialTotal * 0.1;
  const subtotal = initialTotal - tax;
  const discountAmount = subtotal * (discountPercent / 100);
  const finalTotal = initialTotal - discountAmount;

  // Payment form states
  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError("");
    setCouponSuccess("");
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDiscountPercent(data.discountPercent);
        setAppliedCoupon(couponCode.toUpperCase());
        setCouponSuccess(`Coupon applied! Saved ${data.discountPercent}%`);
        setCouponCode("");
      } else {
        setCouponError(data.error || "Invalid coupon code.");
      }
    } catch (err) {
      setCouponError("Could not validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setDiscountPercent(0);
    setAppliedCoupon("");
    setCouponSuccess("");
    setCouponError("");
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setPaymentError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: car.id,
          pickupLocation,
          dropoffLocation,
          pickupDate,
          dropoffDate,
          totalPrice: finalTotal.toFixed(2),
          couponCode: appliedCoupon || null,
          discount: discountAmount.toFixed(2),
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        router.push(`/booking?id=${data.bookingId}`);
      } else {
        setPaymentError(data.error || "Payment failed. Please verify dates and try again.");
      }
    } catch (err) {
      setPaymentError("A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Basic card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.substring(0, 2)}/${value.substring(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").substring(0, 3);
    setCardCvv(value);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      {/* Left 2 Columns: Payment & Coupon */}
      <div className="lg:col-span-2 space-y-6">
        {/* Coupon Code Panel */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <Ticket className="h-4.5 w-4.5 text-primary" />
            Promo Coupon Codes
          </h3>

          {!appliedCoupon ? (
            <form onSubmit={handleApplyCoupon} className="flex gap-3">
              <input
                type="text"
                placeholder="e.g. WELCOME10, SUMMER25"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm uppercase focus:border-primary focus:outline-none"
              />
              <button
                type="submit"
                disabled={couponLoading}
                className="rounded-xl bg-secondary px-5 py-2.5 text-sm font-bold hover:bg-primary hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                {couponLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Apply"}
              </button>
            </form>
          ) : (
            <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 text-xs text-emerald-600 font-semibold dark:text-emerald-400">
              <span>Applied Coupon: {appliedCoupon} ({discountPercent}% Discount)</span>
              <button
                onClick={handleRemoveCoupon}
                className="text-destructive font-bold hover:underline"
              >
                Remove
              </button>
            </div>
          )}

          {couponError && (
            <span className="text-xs text-destructive font-medium block mt-2 flex items-center gap-1">
              <AlertCircle className="h-3.5 w-3.5" />
              {couponError}
            </span>
          )}

          {couponSuccess && (
            <span className="text-xs text-emerald-500 font-medium block mt-2">
              {couponSuccess}
            </span>
          )}
        </div>

        {/* Payment Form */}
        <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <CreditCard className="h-4.5 w-4.5 text-primary" />
            Secure Card Payment
          </h3>

          {paymentError && (
            <div className="flex gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive font-semibold mb-6">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{paymentError}</span>
            </div>
          )}

          <form onSubmit={handlePaymentSubmit} className="space-y-4" autoComplete="off">
            {/* Cardholder Name */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Cardholder N{"\u200C"}ame</label>
              <input
                type="text"
                name="hname"
                id="hname"
                placeholder="Jane Doe"
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                required
                autoComplete="nope"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* Card Number */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Card N{"\u200C"}umber</label>
              <input
                type="text"
                name="cnum"
                id="cnum"
                placeholder="4000 1234 5678 9010"
                value={cardNumber}
                onChange={handleCardNumberChange}
                required
                autoComplete="nope"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* Expiry & CVV */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Expiration D{"\u200C"}ate</label>
                <input
                  type="text"
                  name="cexp"
                  id="cexp"
                  placeholder="MM/YY"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  required
                  autoComplete="nope"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none text-center"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">C{"\u200C"}VV / C{"\u200C"}VN</label>
                <input
                  type="password"
                  name="ccvv"
                  id="ccvv"
                  placeholder="•••"
                  value={cardCvv}
                  onChange={handleCvvChange}
                  required
                  autoComplete="new-password"
                  className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none text-center"
                />
              </div>
            </div>

            {/* Mock security info */}
            <div className="flex gap-2 items-center text-[10px] text-muted-foreground border-t border-border/40 pt-4 mt-6">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>Simulated Payment Gateway: Card validation is checked locally. Funds are not moved.</span>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-all disabled:opacity-50 mt-6 shadow-md shadow-primary/20 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>Processing Payment...</span>
                </>
              ) : (
                <span>Pay & Confirm Reservation {convertPrice(finalTotal)}</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Booking Summary */}
      <div className="lg:col-span-1 bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-6">
        <div>
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Summary</h3>
          
          <div className="flex items-center gap-4">
            <img
              src={car.images?.[0]?.url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80"}
              alt={car.name}
              className="h-16 w-24 object-cover rounded-xl border border-border/40 shrink-0"
            />
            <div>
              <span className="text-[10px] uppercase font-bold text-primary">{car.brand}</span>
              <h4 className="text-sm font-bold text-foreground line-clamp-1">{car.name}</h4>
              <span className="text-xs text-muted-foreground">{car.type} class</span>
            </div>
          </div>
        </div>

        {/* Booking Details */}
        <div className="space-y-3 text-xs border-t border-b border-border/40 py-4">
          <div className="flex flex-col space-y-1">
            <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Pickup Location</span>
            <span className="font-semibold text-foreground">{pickupLocation}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-primary" />
              {new Date(pickupDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="flex flex-col space-y-1 pt-2">
            <span className="text-muted-foreground uppercase font-bold text-[9px] tracking-wider">Drop-off Location</span>
            <span className="font-semibold text-foreground">{dropoffLocation}</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 text-primary" />
              {new Date(dropoffDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>

          <div className="flex justify-between pt-2 border-t border-dashed border-border/40">
            <span className="text-muted-foreground">Rental Duration</span>
            <span className="font-bold text-foreground">{days} {days === 1 ? "day" : "days"}</span>
          </div>
        </div>

        {/* Pricing break down */}
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal ({days} days)</span>
            <span className="font-bold text-foreground">{convertPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Insurance & Taxes (10%)</span>
            <span className="font-bold text-foreground">{convertPrice(tax)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-emerald-500 font-medium">
              <span>Coupon Discount ({discountPercent}%)</span>
              <span>-{convertPrice(discountAmount)}</span>
            </div>
          )}
          <hr className="border-border/40 my-2" />
          <div className="flex justify-between text-base font-extrabold">
            <span>Total Price</span>
            <span className="text-primary">{convertPrice(finalTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
