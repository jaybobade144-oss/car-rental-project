"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useAppContext } from "@/context/AppContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Car, Mail, Lock, AlertCircle, Loader } from "lucide-react";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(1, { message: "Password is required" }),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

function LoginForm() {
  const { login, user, loading } = useAuth();
  const { t } = useAppContext();
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
    setValue,
    formState: { errors },
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginSchemaType) => {
    setIsSubmitting(true);
    setErrorMsg("");
    try {
      const result = await login(values.email, values.password);
      if (result.success) {
        router.push(redirectUrl);
      } else {
        setErrorMsg(result.error || "Invalid credentials. Please try again.");
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
        className="w-full max-w-md bg-card border border-border/40 p-8 rounded-3xl shadow-xl relative z-10"
      >
        {/* Brand */}
        <div className="flex flex-col items-center justify-center space-y-2 mb-8">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold tracking-tight text-primary">
            <Car className="h-7 w-7 stroke-[2.5]" />
            <span>Vroom<span className="text-foreground">Go</span></span>
          </Link>
          <p className="text-xs text-muted-foreground">Premium local car rental database platform</p>
        </div>

        <h2 className="text-xl font-bold tracking-tight text-foreground text-center mb-6">Log In to Your Account</h2>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="flex items-center gap-2 rounded-xl bg-destructive/10 p-4 text-xs font-semibold text-destructive border border-destructive/20 mb-6">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email input */}
          <div className="flex flex-col space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              Email Address
            </label>
            <input
              type="email"
              placeholder="user@rentcar.com"
              {...register("email")}
              className={`w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 ${
                errors.email ? "border-destructive focus:ring-destructive" : "border-border focus:border-primary focus:ring-primary"
              }`}
            />
            {errors.email && (
              <span className="text-xs font-medium text-destructive">{errors.email.message}</span>
            )}
          </div>

          {/* Password input */}
          <div className="flex flex-col space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-muted-foreground flex items-center gap-1.5">
                <Lock className="h-4 w-4" />
                Password
              </label>
            </div>
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
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 text-center text-xs text-muted-foreground border-t border-border/40 pt-6">
          <span>Don't have an account? </span>
          <Link href={`/register${searchParams.toString() ? `?${searchParams.toString()}` : ""}`} className="text-primary font-bold hover:underline">
            Register Here
          </Link>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 text-[10px] text-muted-foreground border-t border-border/20 pt-4">
            <button
              type="button"
              onClick={() => {
                setValue("email", "user@rentcar.com");
                setValue("password", "user123");
                setTimeout(() => handleSubmit(onSubmit)(), 50);
              }}
              className="flex flex-col items-center justify-center bg-secondary/30 hover:bg-primary/10 border border-border/30 hover:border-primary/20 rounded-xl p-2.5 cursor-pointer transition-all w-full text-center"
            >
              <span className="font-semibold text-foreground text-xs">Test User (Autologin)</span>
              <span>user@rentcar.com / user123</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setValue("email", "admin@rentcar.com");
                setValue("password", "admin123");
                setTimeout(() => handleSubmit(onSubmit)(), 50);
              }}
              className="flex flex-col items-center justify-center bg-secondary/30 hover:bg-primary/10 border border-border/30 hover:border-primary/20 rounded-xl p-2.5 cursor-pointer transition-all w-full text-center"
            >
              <span className="font-semibold text-foreground text-xs">Test Admin (Autologin)</span>
              <span>admin@rentcar.com / admin123</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
        <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
