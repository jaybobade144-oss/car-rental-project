"use client";

import React, { useState } from "react";
import { jsPDF } from "jspdf";
import { Download, Loader, FileCheck } from "lucide-react";
import { useAppContext } from "@/context/AppContext";

interface User {
  name: string;
  email: string;
}

interface Car {
  name: string;
  brand: string;
  pricePerDay: number;
}

interface Payment {
  amount: number;
  transactionId: string;
  createdAt: Date | string;
}

interface Booking {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: Date | string;
  dropoffDate: Date | string;
  totalPrice: number;
  couponCode: string | null;
  discount: number;
  paymentStatus: string;
  car: Car;
  payments: Payment[];
}

interface InvoiceDownloaderProps {
  booking: Booking;
  user: User;
}

export default function InvoiceDownloader({ booking, user }: InvoiceDownloaderProps) {
  const [downloading, setDownloading] = useState(false);
  const { convertPrice, currencySymbol } = useAppContext();

  const handleDownload = () => {
    setDownloading(true);
    try {
      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const primaryColor = "#4f46e5"; // Indigo theme
      const darkColor = "#1e293b";
      const lightColor = "#64748b";

      // 1. Header logo & Title
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, 210, 15, "F"); // top colored bar

      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);
      doc.setTextColor(primaryColor);
      doc.text("VroomGo", 20, 32);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(lightColor);
      doc.text("Premium Car Rental Platform", 20, 38);

      // 2. Invoice Label
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(darkColor);
      doc.text("INVOICE RECEIPT", 130, 32);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(lightColor);
      doc.text(`Invoice ID: ${booking.id.substring(0, 8).toUpperCase()}`, 130, 38);
      doc.text(`Date Issued: ${new Date().toLocaleDateString()}`, 130, 43);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 50, 190, 50);

      // 3. Bill To & Rental Info
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      doc.text("CUSTOMER DETAILS", 20, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(lightColor);
      doc.text(`Name: ${user.name}`, 20, 65);
      doc.text(`Email: ${user.email}`, 20, 70);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      doc.text("RENTAL PERIOD", 120, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(lightColor);
      doc.text(`Pickup: ${new Date(booking.pickupDate).toLocaleDateString()}`, 120, 65);
      doc.text(`Return: ${new Date(booking.dropoffDate).toLocaleDateString()}`, 120, 70);

      // 4. Vehicle Details Table
      doc.setFillColor(248, 250, 252);
      doc.rect(20, 80, 170, 8, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      doc.setTextColor(darkColor);
      doc.text("Description", 25, 85);
      doc.text("Pickup & Dropoff Locations", 85, 85);
      doc.text("Daily Rate", 160, 85);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(20, 88, 190, 88);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(lightColor);
      doc.text(`${booking.car.brand} ${booking.car.name}`, 25, 95);
      doc.text(`From: ${booking.pickupLocation}`, 85, 95);
      doc.text(`To: ${booking.dropoffLocation}`, 85, 100);
      doc.text(convertPrice(booking.car.pricePerDay), 160, 95);

      // Divider line
      doc.line(20, 107, 190, 107);

      // 5. Billing Summary
      const startY = 115;
      const sub = booking.totalPrice - (booking.totalPrice * 0.1 / 1.1); // reverse calculate roughly
      const tax = booking.totalPrice - sub;
      const paid = booking.totalPrice - booking.discount;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(lightColor);
      
      doc.text("Subtotal:", 130, startY);
      doc.text(convertPrice(sub), 165, startY);

      doc.text("Tax & Fees (10%):", 130, startY + 5);
      doc.text(convertPrice(tax), 165, startY + 5);

      if (booking.discount > 0) {
        doc.setTextColor(79, 70, 229);
        doc.text(`Coupon Applied (${booking.couponCode}):`, 130, startY + 10);
        doc.text(`-${convertPrice(booking.discount)}`, 165, startY + 10);
        doc.setTextColor(lightColor);
      }

      doc.setDrawColor(226, 232, 240);
      doc.line(130, startY + 14, 190, startY + 14);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(primaryColor);
      doc.text("Total Paid:", 130, startY + 20);
      doc.text(convertPrice(paid), 165, startY + 20);

      // 6. Payment method and security
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(darkColor);
      doc.text("PAYMENT LOGS", 20, startY + 5);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(8.5);
      doc.setTextColor(lightColor);
      doc.text(`Gateway: Mock Payment Portal`, 20, startY + 10);
      doc.text(`Transaction ID: ${booking.payments?.[0]?.transactionId || "N/A"}`, 20, startY + 15);
      doc.text(`Status: VERIFIED & CLEAR`, 20, startY + 20);

      // Paid Stamp Box
      doc.setDrawColor(16, 185, 129); // emerald
      doc.setFillColor(240, 253, 250);
      doc.rect(20, startY + 28, 50, 10, "DF");
      
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(16, 185, 129);
      doc.text("PAID & CONFIRMED", 25, startY + 345 - 310);

      // 7. Footer thank you note
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8.5);
      doc.setTextColor(lightColor);
      doc.text("Thank you for choosing VroomGo! Drive safely and enjoy your journey.", 55, 185);

      // Save PDF
      doc.save(`invoice_${booking.id.substring(0, 8).toUpperCase()}.pdf`);
    } catch (error) {
      console.error("PDF generate error", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer w-full sm:w-auto"
    >
      {downloading ? (
        <>
          <Loader className="h-4.5 w-4.5 animate-spin" />
          <span>Generating PDF...</span>
        </>
      ) : (
        <>
          <Download className="h-4.5 w-4.5" />
          <span>Download Invoice PDF</span>
        </>
      )}
    </button>
  );
}
