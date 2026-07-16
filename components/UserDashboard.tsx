"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";
import InvoiceDownloader from "@/components/InvoiceDownloader";
import {
  User,
  Calendar,
  Heart,
  CreditCard,
  Bell,
  Settings,
  Star,
  MapPin,
  Clock,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Loader
} from "lucide-react";

interface CarImage {
  url: string;
}

interface Car {
  id: string;
  name: string;
  brand: string;
  type: string;
  pricePerDay: number;
  slug: string;
  images: CarImage[];
}

interface Payment {
  id: string;
  amount: number;
  provider: string;
  status: string;
  transactionId: string;
  createdAt: string | Date;
}

interface Booking {
  id: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string | Date;
  dropoffDate: string | Date;
  totalPrice: number;
  status: string;
  couponCode: string | null;
  discount: number;
  paymentStatus: string;
  createdAt: string | Date;
  car: Car;
  payments: Payment[];
}

interface Wishlist {
  id: string;
  car: Car;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string | Date;
}

interface UserDashboardProps {
  initialTab?: string;
  bookings: Booking[];
  wishlist: Wishlist[];
  payments: Payment[];
  notifications: Notification[];
}

export default function UserDashboard({
  initialTab = "summary",
  bookings,
  wishlist,
  payments,
  notifications,
}: UserDashboardProps) {
  const { user, refreshUser } = useAuth();
  const { convertPrice } = useAppContext();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(initialTab);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);

  // Review states
  const [reviewCarId, setReviewCarId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState("5");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Settings states
  const [settingsName, setSettingsName] = useState(user?.name || "");
  const [settingsEmail, setSettingsEmail] = useState(user?.email || "");
  const [settingsPhone, setSettingsPhone] = useState(user?.phone || "");
  const [settingsAvatar, setSettingsAvatar] = useState(user?.avatar || "");
  const [settingsPassword, setSettingsPassword] = useState("");
  const [settingsError, setSettingsError] = useState("");
  const [settingsSuccess, setSettingsSuccess] = useState("");
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Classify bookings
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeBookings = bookings.filter(
    (b) => b.status !== "CANCELLED" && new Date(b.dropoffDate) >= today
  );
  
  const pastBookings = bookings.filter(
    (b) => b.status === "CANCELLED" || new Date(b.dropoffDate) < today
  );

  const handleCancelBooking = async (bookingId: string) => {
    setCancelLoading(true);
    try {
      const res = await fetch("/api/bookings/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId }),
      });
      if (res.ok) {
        router.refresh();
        setCancellingId(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewCarId) return;

    setReviewLoading(true);
    setReviewSuccess("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          carId: reviewCarId,
          rating: reviewRating,
          comment: reviewComment,
        }),
      });
      if (res.ok) {
        setReviewSuccess("Review submitted! Thank you for your feedback.");
        setReviewComment("");
        setReviewCarId(null);
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsLoading(true);
    setSettingsError("");
    setSettingsSuccess("");

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: settingsName,
          email: settingsEmail,
          phone: settingsPhone,
          avatar: settingsAvatar,
          password: settingsPassword || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSettingsSuccess("Profile updated successfully!");
        setSettingsPassword("");
        await refreshUser();
        router.refresh();
      } else {
        setSettingsError(data.error || "Failed to update profile.");
      }
    } catch (err) {
      setSettingsError("A network error occurred.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleRemoveWishlist = async (carId: string) => {
    try {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ carId }),
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 items-start">
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 bg-card border border-border/40 rounded-3xl p-4 shadow-sm shrink-0">
        <div className="flex items-center gap-3 px-3 py-4 border-b border-border/40 mb-4">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-10 w-10 rounded-full object-cover border" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white text-sm font-bold">
              {user?.name?.charAt(0)}
            </div>
          )}
          <div className="truncate">
            <h4 className="text-sm font-bold text-foreground">{user?.name}</h4>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{user?.role} ACCOUNT</span>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <button
            onClick={() => setActiveTab("summary")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === "summary" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <User className="h-4.5 w-4.5" />
            Dashboard Summary
          </button>

          <button
            onClick={() => setActiveTab("bookings")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === "bookings" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Calendar className="h-4.5 w-4.5" />
            My Rentals ({bookings.length})
          </button>

          <button
            onClick={() => setActiveTab("wishlist")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === "wishlist" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Heart className="h-4.5 w-4.5" />
            Saved Wishlist ({wishlist.length})
          </button>

          <button
            onClick={() => setActiveTab("payments")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === "payments" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <CreditCard className="h-4.5 w-4.5" />
            Payment History
          </button>

          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === "notifications" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <span className="flex items-center gap-3">
              <Bell className="h-4.5 w-4.5" />
              Notifications
            </span>
            {notifications.length > 0 && (
              <span className={`h-2 w-2 rounded-full ${activeTab === "notifications" ? "bg-white" : "bg-primary"}`} />
            )}
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition-all ${
              activeTab === "settings" ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20" : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
            }`}
          >
            <Settings className="h-4.5 w-4.5" />
            Profile Settings
          </button>
        </div>
      </div>

      {/* Main Panel Content */}
      <div className="flex-grow w-full bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm">
        {/* SUMMARY TAB */}
        {activeTab === "summary" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Welcome Back, {user?.name}!</h2>
              <p className="text-xs text-muted-foreground mt-1">Manage your active rentals, saved cars, and payment records.</p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-secondary/30 border border-border/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Active Rentals</span>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">{activeBookings.length}</h3>
                </div>
                <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-secondary/30 border border-border/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Saved Vehicles</span>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">{wishlist.length}</h3>
                </div>
                <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500">
                  <Heart className="h-5 w-5" />
                </div>
              </div>
              <div className="bg-secondary/30 border border-border/20 rounded-2xl p-5 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground">Unread Alerts</span>
                  <h3 className="text-2xl font-extrabold text-foreground mt-1">{notifications.length}</h3>
                </div>
                <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-500">
                  <Bell className="h-5 w-5" />
                </div>
              </div>
            </div>

            {/* Recent Notification Alerts */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Activity Logs</h3>
              {notifications.length === 0 ? (
                <div className="text-xs text-muted-foreground">No recent activity logged.</div>
              ) : (
                <div className="space-y-2">
                  {notifications.slice(0, 3).map((notif) => (
                    <div key={notif.id} className="flex gap-3 text-xs border border-border/40 p-4 rounded-xl bg-secondary/10">
                      <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-foreground">{notif.title}</h4>
                        <p className="text-muted-foreground mt-0.5">{notif.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {activeTab === "bookings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">My Rental Records</h2>
              <p className="text-xs text-muted-foreground mt-1">Review active trips and write reviews for completed rentals.</p>
            </div>

            {/* Active Bookings */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-primary">Active & Upcoming Rentals</h3>
              {activeBookings.length === 0 ? (
                <div className="border border-border/40 rounded-2xl p-6 text-center text-xs text-muted-foreground">
                  No active or upcoming reservations found.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeBookings.map((b) => {
                    const startF = new Date(b.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const endF = new Date(b.dropoffDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const mainImage = b.car.images?.[0]?.url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80";
                    return (
                      <div key={b.id} className="flex flex-col sm:flex-row gap-5 border border-border/40 rounded-2xl p-5 bg-card hover:shadow-sm transition-all duration-300">
                        <img src={mainImage} alt={b.car.name} className="w-full sm:w-40 h-28 object-cover rounded-xl border border-border/40 shrink-0" />
                        
                        <div className="flex-grow flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] uppercase font-bold text-primary">{b.car.brand}</span>
                                <h4 className="text-sm font-bold text-foreground">{b.car.name}</h4>
                              </div>
                              <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase">
                                {b.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-xs mt-3 text-muted-foreground">
                              <div>
                                <span className="block font-bold text-[9px] text-muted-foreground uppercase">Pickup location</span>
                                <span className="font-semibold text-foreground truncate max-w-[150px] block">{b.pickupLocation}</span>
                                <span className="text-[10px]">{startF}</span>
                              </div>
                              <div>
                                <span className="block font-bold text-[9px] text-muted-foreground uppercase">Return location</span>
                                <span className="font-semibold text-foreground truncate max-w-[150px] block">{b.dropoffLocation}</span>
                                <span className="text-[10px]">{endF}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-border/40 pt-4 mt-4 gap-4">
                            <div>
                              <span className="text-sm font-extrabold text-foreground">{convertPrice(b.totalPrice - b.discount)}</span>
                              <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider block">PAID VIA CARD</span>
                            </div>
                            
                            <div className="flex gap-3">
                              {/* PDF Invoice Downloader */}
                              <InvoiceDownloader booking={b} user={user || { name: "", email: "" }} />
                              
                              {cancellingId === b.id ? (
                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => handleCancelBooking(b.id)}
                                    disabled={cancelLoading}
                                    className="bg-destructive hover:bg-destructive/90 text-white rounded-xl px-3 py-2 text-xs font-semibold"
                                  >
                                    {cancelLoading ? "Cancelling..." : "Confirm Cancel"}
                                  </button>
                                  <button
                                    onClick={() => setCancellingId(null)}
                                    className="bg-secondary text-foreground hover:bg-secondary/85 rounded-xl px-3 py-2 text-xs font-semibold"
                                  >
                                    Close
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setCancellingId(b.id)}
                                  className="rounded-xl border border-border/40 hover:bg-destructive/10 hover:text-destructive text-muted-foreground px-4 py-2 text-xs font-semibold transition-colors"
                                >
                                  Cancel Booking
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Bookings */}
            <div className="space-y-4 border-t border-border/40 pt-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Previous Rental History</h3>
              {pastBookings.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">No completed or cancelled rental logs.</div>
              ) : (
                <div className="space-y-4">
                  {pastBookings.map((b) => {
                    const startF = new Date(b.pickupDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const endF = new Date(b.dropoffDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                    const mainImage = b.car.images?.[0]?.url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80";
                    const isCancelled = b.status === "CANCELLED";
                    return (
                      <div key={b.id} className="flex flex-col sm:flex-row gap-5 border border-border/40 rounded-2xl p-5 bg-card/60 opacity-80">
                        <img src={mainImage} alt={b.car.name} className="w-full sm:w-36 h-24 object-cover rounded-xl border shrink-0 opacity-70" />
                        <div className="flex-grow">
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[9px] uppercase font-bold text-muted-foreground">{b.car.brand}</span>
                              <h4 className="text-sm font-bold text-foreground">{b.car.name}</h4>
                            </div>
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[9px] font-bold border uppercase ${
                              isCancelled 
                                ? "bg-destructive/10 text-destructive border-destructive/20" 
                                : "bg-secondary/40 text-muted-foreground border-border"
                            }`}>
                              {isCancelled ? "CANCELLED" : "COMPLETED"}
                            </span>
                          </div>

                          <p className="text-xs text-muted-foreground mt-2">
                            Rented from {startF} to {endF} (Amount: {convertPrice(b.totalPrice - b.discount)})
                          </p>

                          {/* Review triggering */}
                          {!isCancelled && (
                            <div className="mt-3 border-t border-border/40 pt-3">
                              {reviewSuccess && reviewCarId === b.car.id ? (
                                <span className="text-xs text-emerald-500 font-bold block">{reviewSuccess}</span>
                              ) : reviewCarId === b.car.id ? (
                                <form onSubmit={handleReviewSubmit} className="space-y-3 bg-secondary/20 rounded-xl p-4 border border-border/40 mt-2">
                                  <div className="flex justify-between items-center">
                                    <h4 className="text-xs font-bold text-foreground">Write Your Review</h4>
                                    <button
                                      type="button"
                                      onClick={() => setReviewCarId(null)}
                                      className="text-[10px] text-muted-foreground hover:underline"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Rating Score</label>
                                    <select
                                      value={reviewRating}
                                      onChange={(e) => setReviewRating(e.target.value)}
                                      className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs text-foreground focus:outline-none"
                                    >
                                      <option value="5">5 Stars - Outstanding</option>
                                      <option value="4">4 Stars - Good</option>
                                      <option value="3">3 Stars - Average</option>
                                      <option value="2">2 Stars - Poor</option>
                                      <option value="1">1 Star - Horrible</option>
                                    </select>
                                  </div>
                                  <div className="flex flex-col space-y-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase">Comment</label>
                                    <textarea
                                      required
                                      rows={2}
                                      value={reviewComment}
                                      onChange={(e) => setReviewComment(e.target.value)}
                                      placeholder="How was the vehicle? Pickup location experience..."
                                      className="w-full rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground placeholder-muted-foreground focus:outline-none"
                                    />
                                  </div>
                                  <button
                                    type="submit"
                                    disabled={reviewLoading}
                                    className="rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:opacity-90 disabled:opacity-50"
                                  >
                                    {reviewLoading ? "Submitting..." : "Submit Review"}
                                  </button>
                                </form>
                              ) : (
                                <button
                                  onClick={() => setReviewCarId(b.car.id)}
                                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                                >
                                  <Star className="h-3.5 w-3.5 fill-primary" />
                                  Share Rental Feedback
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* WISHLIST TAB */}
        {activeTab === "wishlist" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Saved Fleet Wishlist</h2>
              <p className="text-xs text-muted-foreground mt-1">Quick checkout or remove vehicles from your wishlist panel.</p>
            </div>

            {wishlist.length === 0 ? (
              <div className="border border-border/40 rounded-2xl p-10 text-center text-xs text-muted-foreground flex flex-col items-center justify-center">
                <Heart className="h-8 w-8 text-muted-foreground stroke-[1.5] mb-3" />
                <span>Your wishlist is currently empty. Browse cars to save listings!</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {wishlist.map((item) => {
                  const mainImage = item.car.images?.[0]?.url || "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=300&q=80";
                  return (
                    <div key={item.id} className="group relative bg-card border border-border/40 p-4 rounded-2xl shadow-sm flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-primary">{item.car.brand}</span>
                            <h4 className="text-sm font-bold text-foreground line-clamp-1">{item.car.name}</h4>
                          </div>
                          <button
                            onClick={() => handleRemoveWishlist(item.car.id)}
                            className="rounded-full p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <img src={mainImage} alt={item.car.name} className="h-32 w-full object-cover rounded-xl border border-border/40 my-4" />
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/40 mt-2">
                        <span className="text-sm font-extrabold text-foreground">{convertPrice(item.car.pricePerDay)}/day</span>
                        <button
                          onClick={() => router.push(`/cars/${item.car.slug}`)}
                          className="rounded-xl bg-primary text-primary-foreground px-3 py-1.5 text-xs font-semibold hover:opacity-90"
                        >
                          Book Now
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PAYMENTS TAB */}
        {activeTab === "payments" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Transaction Logs</h2>
              <p className="text-xs text-muted-foreground mt-1">Review receipts and security transaction IDs processed locally.</p>
            </div>

            {payments.length === 0 ? (
              <div className="text-xs text-muted-foreground italic">No transaction records found.</div>
            ) : (
              <div className="overflow-x-auto border border-border/40 rounded-2xl shadow-sm">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-secondary/50 border-b border-border/40 text-muted-foreground font-bold uppercase tracking-wider">
                      <th className="p-4">Transaction ID</th>
                      <th className="p-4">Paid Date</th>
                      <th className="p-4">Method</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {payments.map((p) => (
                      <tr key={p.id} className="hover:bg-secondary/10 text-foreground font-medium">
                        <td className="p-4 font-mono text-primary font-bold">{p.transactionId}</td>
                        <td className="p-4 text-muted-foreground">{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td className="p-4 uppercase">{p.provider}</td>
                        <td className="p-4">
                          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 font-bold uppercase text-[9px]">
                            {p.status}
                          </span>
                        </td>
                        <td className="p-4 text-right font-bold">{convertPrice(p.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* NOTIFICATIONS TAB */}
        {activeTab === "notifications" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Notifications & Alerts</h2>
              <p className="text-xs text-muted-foreground mt-1">Log updates related to accounts, cancellations, and reservation receipts.</p>
            </div>

            {notifications.length === 0 ? (
              <div className="border border-border/40 rounded-2xl p-10 text-center text-xs text-muted-foreground">
                You have no notifications in your history log.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div key={n.id} className="flex gap-3 text-xs border border-border/40 p-4 rounded-xl bg-secondary/10">
                    <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />
                    <div>
                      <h4 className="font-bold text-foreground">{n.title}</h4>
                      <p className="text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                      <span className="text-[10px] text-muted-foreground/60 block mt-2">
                        {new Date(n.createdAt).toLocaleDateString()} at {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === "settings" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-foreground">Profile Settings</h2>
              <p className="text-xs text-muted-foreground mt-1">Update your account information, phone contacts, and passwords.</p>
            </div>

            {settingsError && (
              <div className="flex gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive font-semibold">
                <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
                <span>{settingsError}</span>
              </div>
            )}

            {settingsSuccess && (
              <div className="flex gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                <span>{settingsSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSettingsSubmit} className="space-y-4 max-w-lg">
              {/* Full Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <input
                  type="text"
                  required
                  value={settingsName}
                  onChange={(e) => setSettingsName(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Email Address */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Phone Contacts */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Phone Number</label>
                <input
                  type="tel"
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Avatar Image URL */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Avatar Image URL</label>
                <input
                  type="text"
                  value={settingsAvatar}
                  onChange={(e) => setSettingsAvatar(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Change Password */}
              <div className="flex flex-col space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-muted-foreground">Change Password (Leave blank to keep current)</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={settingsPassword}
                  onChange={(e) => setSettingsPassword(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={settingsLoading}
                className="flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {settingsLoading ? <Loader className="h-4 w-4 animate-spin" /> : "Save Profile Details"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
