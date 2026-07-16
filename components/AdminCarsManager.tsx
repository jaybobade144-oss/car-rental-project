"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppContext";
import { Plus, Edit2, Trash2, ArrowLeft, Loader, CheckCircle, AlertTriangle } from "lucide-react";

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
  description: string;
  features: string;
  images: CarImage[];
}

interface AdminCarsManagerProps {
  cars: Car[];
}

export default function AdminCarsManager({ cars }: AdminCarsManagerProps) {
  const { convertPrice } = useAppContext();
  const router = useRouter();

  // Active form view: 'list', 'add', 'edit'
  const [view, setView] = useState<"list" | "add" | "edit">("list");
  const [editingCar, setEditingCar] = useState<Car | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [type, setType] = useState("Luxury");
  const [pricePerDay, setPricePerDay] = useState("");
  const [transmission, setTransmission] = useState("Automatic");
  const [fuel, setFuel] = useState("Petrol");
  const [seats, setSeats] = useState("5");
  const [description, setDescription] = useState("");
  const [featuresInput, setFeaturesInput] = useState(""); // Comma-separated or lines
  const [imageUrlsInput, setImageUrlsInput] = useState(""); // Comma-separated or lines

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleEditClick = (car: Car) => {
    setEditingCar(car);
    setName(car.name);
    setBrand(car.brand);
    setType(car.type);
    setPricePerDay(car.pricePerDay.toString());
    setTransmission(car.transmission);
    setFuel(car.fuel);
    setSeats(car.seats.toString());
    setDescription(car.description);
    
    const parsedFeatures: string[] = JSON.parse(car.features || "[]");
    setFeaturesInput(parsedFeatures.join(", "));
    
    const imageUrls = car.images.map((img) => img.url);
    setImageUrlsInput(imageUrls.join(", "));
    
    setView("edit");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleAddClick = () => {
    setEditingCar(null);
    setName("");
    setBrand("");
    setType("Luxury");
    setPricePerDay("");
    setTransmission("Automatic");
    setFuel("Petrol");
    setSeats("5");
    setDescription("");
    setFeaturesInput("GPS, AC, Leather Seats, Bluetooth");
    setImageUrlsInput("https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80");
    setView("add");
    setErrorMsg("");
    setSuccessMsg("");
  };

  const handleDeleteClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle from the database?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cars?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete car.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    const features = featuresInput.split(",").map((f) => f.trim()).filter(Boolean);
    const imageUrls = imageUrlsInput.split(",").map((url) => url.trim()).filter(Boolean);

    const payload = {
      id: editingCar?.id,
      name,
      brand,
      type,
      pricePerDay,
      transmission,
      fuel,
      seats,
      description,
      features,
      imageUrls,
    };

    try {
      const method = view === "add" ? "POST" : "PUT";
      const res = await fetch("/api/cars", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`Car successfully ${view === "add" ? "added" : "updated"}!`);
        setTimeout(() => {
          setView("list");
          router.refresh();
        }, 1500);
      } else {
        setErrorMsg(data.error || "An error occurred while saving.");
      }
    } catch (err) {
      setErrorMsg("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View: LIST OF CARS */}
      {view === "list" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">Car Inventory</h1>
              <p className="text-xs text-muted-foreground mt-1">Add, update, or remove fleet inventory listings directly.</p>
            </div>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              Add New Car
            </button>
          </div>

          {cars.length === 0 ? (
            <div className="text-center py-20 bg-card border border-border/40 rounded-3xl p-8">
              <span className="text-xs text-muted-foreground italic">No vehicles in database. Click "Add New Car" to start.</span>
            </div>
          ) : (
            <div className="overflow-x-auto border border-border/40 rounded-3xl shadow-sm bg-card">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-secondary/50 border-b border-border/40 text-muted-foreground font-bold uppercase tracking-wider">
                    <th className="p-4">Model & Brand</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Transmission</th>
                    <th className="p-4">Fuel Spec</th>
                    <th className="p-4">Seats</th>
                    <th className="p-4">Daily Rate</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-secondary/10 text-foreground font-medium">
                      <td className="p-4">
                        <div className="font-bold text-sm">{car.brand} {car.name}</div>
                        <div className="text-[10px] text-muted-foreground font-mono">{car.slug}</div>
                      </td>
                      <td className="p-4">
                        <span className="rounded-full bg-primary/10 border border-primary/20 text-primary px-2.5 py-0.5 text-[9px] font-bold uppercase">
                          {car.type}
                        </span>
                      </td>
                      <td className="p-4">{car.transmission}</td>
                      <td className="p-4">{car.fuel}</td>
                      <td className="p-4">{car.seats} Seats</td>
                      <td className="p-4 font-bold text-foreground">{convertPrice(car.pricePerDay)}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => handleEditClick(car)}
                            className="rounded-lg p-1.5 hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(car.id)}
                            className="rounded-lg p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* View: ADD or EDIT FORM */}
      {(view === "add" || view === "edit") && (
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setView("list")}
              className="rounded-xl border border-border p-2 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="h-4.5 w-4.5" />
            </button>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {view === "add" ? "Create New Fleet Listing" : `Edit Specifications - ${editingCar?.brand} ${editingCar?.name}`}
              </h2>
              <p className="text-xs text-muted-foreground">Fill in the fields below to sync details with the SQLite catalog database.</p>
            </div>
          </div>

          {errorMsg && (
            <div className="flex gap-2 rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive font-semibold max-w-2xl">
              <AlertTriangle className="h-4.5 w-4.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 font-semibold max-w-2xl">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-card border border-border/40 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Brand */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Manufacturer / Brand</label>
                <input
                  type="text"
                  required
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Porsche"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Model Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Model Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. 911 Carrera S"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Type Category */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Category Class</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="Luxury">Luxury</option>
                  <option value="SUV">SUV</option>
                  <option value="Electric">Electric</option>
                  <option value="Sedan">Sedan</option>
                </select>
              </div>

              {/* Price Per Day */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Price per Day (USD)</label>
                <input
                  type="number"
                  required
                  value={pricePerDay}
                  onChange={(e) => setPricePerDay(e.target.value)}
                  placeholder="e.g. 150"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>

              {/* Seats */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Passengers Capacity</label>
                <input
                  type="number"
                  required
                  value={seats}
                  onChange={(e) => setSeats(e.target.value)}
                  placeholder="e.g. 5"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Transmission */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Transmission</label>
                <select
                  value={transmission}
                  onChange={(e) => setTransmission(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="Automatic">Automatic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Fuel Specification</label>
                <select
                  value={fuel}
                  onChange={(e) => setFuel(e.target.value)}
                  className="rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:outline-none"
                >
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Vehicle Overview Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write a brief overview of features, agility, and luggage capacities..."
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Features Checklist */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Inclusions / Features (Comma separated)</label>
              <input
                type="text"
                value={featuresInput}
                onChange={(e) => setFeaturesInput(e.target.value)}
                placeholder="GPS, AC, Bluetooth, Heated Seats, Leather Cabin"
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            {/* Image URLs */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Car Image URLs (Comma separated)</label>
              <input
                type="text"
                value={imageUrlsInput}
                onChange={(e) => setImageUrlsInput(e.target.value)}
                placeholder="https://images.unsplash.com/photo-1..., https://images.unsplash.com/photo-2..."
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              />
              <span className="text-[10px] text-muted-foreground">Provide direct, high-quality image URLs to render in sliders.</span>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setView("list")}
                className="rounded-xl border border-border hover:bg-secondary px-5 py-2.5 text-xs font-bold text-foreground transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-primary px-6 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : "Save Fleet Listing"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
