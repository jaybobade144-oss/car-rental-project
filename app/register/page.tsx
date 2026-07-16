"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Car, Mail, Lock, User, Phone, AlertCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters long" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
  phone: z.string().min(6, { message: "Please enter a valid phone number" }).optional().or(z.literal("")),
});

type RegisterSchemaType = z.infer<typeof registerSchema>;

function RegisterForm() {
  const { register: registerApi, user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectUrl = searchParams.get("redirect") || "/";

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectUrl]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchemaType>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (values: RegisterSchemaType) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const result = await registerApi(values.email, values.password, values.name, values.phone || undefined);
      if (result.success) {
        router.push(redirectUrl);
      } else {
        setErrorMsg(result.error || "Registration failed. Please check your fields.");
      }
    } catch (err) {
      setErrorMsg("An unexpected network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Loader className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background radial blurs */}
      <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] dark:bg-primary/5" />
      <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-indigo-500/10 blur-[120px] dark:bg-indigo-500/5" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-card border border-border/40 p-8 rounded-3xl shadow-xl relative z-10 animate-fade-in"
      >
        {/* Brand */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-6">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary">
            <Car className="h-7 w-7 stroke-[2.5]" />
            <span>Vroom<span className="text-foreground">Go</span></span>
          </Link>
          <p className="text-xs text-muted-foreground">Join us today to manage your bookings instantly</p>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground text-center mb-6">Create New Account</h2>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20 mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <User className="h-4 w-4" />
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              {...register("name")}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                errors.name ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.name && (
              <span className="text-xs font-medium text-destructive">{errors.name.message}</span>
            )}
          </div>

          {/* Email input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                errors.email ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.email && (
              <span className="text-xs font-medium text-destructive">{errors.email.message}</span>
            )}
          </div>

          {/* Phone input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-4 w-4" />
              Phone Number
            </label>
            <input
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                errors.phone ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.phone && (
              <span className="text-xs font-medium text-destructive">{errors.phone.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Lock className="h-4 w-4" />
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              {...register("password")}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                errors.password ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.password && (
              <span className="text-xs font-medium text-destructive">{errors.password.message}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 transition-opacity disabled:opacity-50 mt-6 shadow-md shadow-primary/20 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                <span>Creating account...</span>
              </>
            ) : (
              <span>Register</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-6 text-center text-xs text-muted-foreground border-t border-border/40 pt-4">
          <span>Already have an account? </span>
          <Link href={`/login${searchParams.toString() ? `?${searchParams.toString()}` : ""}`} className="text-primary font-bold hover:underline">
            Log In Here
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
