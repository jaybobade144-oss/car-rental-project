"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type Language = "en" | "es";
type Currency = "USD" | "EUR" | "GBP" | "INR";

interface AppContextType {
  language: Language;
  currency: Currency;
  currencySymbol: string;
  setLanguage: (lang: Language) => void;
  setCurrency: (curr: Currency) => void;
  convertPrice: (priceInUSD: number) => string;
  t: (key: string) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const currencySymbols: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  INR: "₹",
};

const currencyRates: Record<Currency, number> = {
  USD: 1.0,
  EUR: 0.92,
  GBP: 0.77,
  INR: 83.5,
};

const translations: Record<Language, Record<string, string>> = {
  en: {
    heroTitle: "Find Your Perfect Wheels",
    heroSubtitle: "Experience seamless car rentals with zero hidden fees, flexible pickup options, and premium local customer support. Discover our luxury, SUV, and electric fleet.",
    searchPickup: "Pickup Location",
    searchDropoff: "Drop-off Location",
    searchPickupDate: "Pickup Date",
    searchReturnDate: "Return Date",
    searchBtn: "Search Available Cars",
    featuredCars: "Featured Fleet",
    featuredSubtitle: "Explore our handpicked selection of premium cars ready for your next adventure.",
    all: "All",
    luxury: "Luxury",
    suv: "SUV",
    electric: "Electric",
    sedan: "Sedan",
    whyChooseUs: "Why Choose Us",
    howItWorks: "How It Works",
    customerReviews: "Customer Reviews",
    footerText: "Premium local car rentals with instant, zero-config built-in SQL database operations.",
    bookNow: "Book Now",
    viewDetails: "View Details",
    pricePerDay: "per day",
    login: "Log In",
    register: "Register",
    logout: "Log Out",
    dashboard: "Dashboard",
    myBookings: "My Bookings",
    wishlist: "Wishlist",
    profile: "Profile",
    adminDashboard: "Admin Panel",
    contactUs: "Contact Us",
    aboutUs: "About Us",
    home: "Home",
    cars: "Cars",
    seats: "Seats",
    reviews: "Reviews",
  },
  es: {
    heroTitle: "Encuentra tus Ruedas Perfectas",
    heroSubtitle: "Experimenta alquileres de autos sin complicaciones, sin tarifas ocultas, con opciones de recogida flexibles y soporte local premium. Descubre nuestra flota de lujo, SUV y eléctricos.",
    searchPickup: "Lugar de Recogida",
    searchDropoff: "Lugar de Entrega",
    searchPickupDate: "Fecha de Recogida",
    searchReturnDate: "Fecha de Devolución",
    searchBtn: "Buscar Autos Disponibles",
    featuredCars: "Flota Destacada",
    featuredSubtitle: "Explora nuestra selección cuidadosamente elegida de autos listos para tu próxima aventura.",
    all: "Todos",
    luxury: "Lujo",
    suv: "SUV",
    electric: "Eléctrico",
    sedan: "Sedán",
    whyChooseUs: "Por qué elegirnos",
    howItWorks: "Cómo funciona",
    customerReviews: "Opiniones de clientes",
    footerText: "Alquiler de autos local premium con operaciones de base de datos SQL locales integradas.",
    bookNow: "Reservar",
    viewDetails: "Ver Detalles",
    pricePerDay: "por día",
    login: "Iniciar Sesión",
    register: "Registrarse",
    logout: "Cerrar Sesión",
    dashboard: "Panel de Control",
    myBookings: "Mis Reservas",
    wishlist: "Lista de Deseos",
    profile: "Mi Perfil",
    adminDashboard: "Panel Admin",
    contactUs: "Contacto",
    aboutUs: "Nosotros",
    home: "Inicio",
    cars: "Autos",
    seats: "Asientos",
    reviews: "Reseñas",
  },
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");
  const [currency, setCurrencyState] = useState<Currency>("USD");

  useEffect(() => {
    const savedLang = localStorage.getItem("lang") as Language;
    const savedCurr = localStorage.getItem("curr") as Currency;
    if (savedLang) setLanguageState(savedLang);
    if (savedCurr) setCurrencyState(savedCurr);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("lang", lang);
  };

  const setCurrency = (curr: Currency) => {
    setCurrencyState(curr);
    localStorage.setItem("curr", curr);
  };

  const convertPrice = (priceInUSD: number) => {
    const rate = currencyRates[currency];
    const converted = priceInUSD * rate;
    const symbol = currencySymbols[currency];
    return `${symbol}${converted.toFixed(0)}`;
  };

  const t = (key: string) => {
    return translations[language][key] || translations["en"][key] || key;
  };

  const currencySymbol = currencySymbols[currency];

  return (
    <AppContext.Provider value={{ language, currency, currencySymbol, setLanguage, setCurrency, convertPrice, t }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
