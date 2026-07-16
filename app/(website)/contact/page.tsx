"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Clock, Send, AlertCircle, CheckCircle } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, subject, message }),
      });

      if (!res.ok) throw new Error("Failed to send");

      setSuccess(true);
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
      setTimeout(() => setSuccess(false), 6000);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl w-full px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Header */}
      <section className="text-center max-w-2xl mx-auto space-y-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary border border-primary/20">
          Get In Touch
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
          We Are Here to Help
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Have questions about insurance limits, custom deposits, or pickup terminals? Send us a message and our Maharashtra support team will respond within 2 hours.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
        {/* Left 1 Column: Contact details cards */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-card border border-border/40 rounded-3xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2">Support Channels</h3>
            
            <div className="flex gap-3 text-xs">
              <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0 h-9 w-9 flex items-center justify-center">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Phone Helpline</h4>
                <p className="text-muted-foreground mt-0.5">+1 (555) VROOM-GO</p>
                <span className="text-[10px] text-muted-foreground">Toll-free across North America</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs pt-2">
              <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0 h-9 w-9 flex items-center justify-center">
                <Mail className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Email Support</h4>
                <p className="text-muted-foreground mt-0.5">support@vroomgo.com</p>
                <span className="text-[10px] text-muted-foreground">2 hour response guarantee</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs pt-2">
              <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0 h-9 w-9 flex items-center justify-center">
                <MapPin className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Maharashtra Office</h4>
                <p className="text-muted-foreground mt-0.5">FC Road, Shivajinagar, Pune, Maharashtra 411005</p>
                <span className="text-[10px] text-muted-foreground">Pune city center hub</span>
              </div>
            </div>

            <div className="flex gap-3 text-xs pt-2">
              <div className="rounded-xl bg-primary/10 p-2 text-primary shrink-0 h-9 w-9 flex items-center justify-center">
                <Clock className="h-4.5 w-4.5" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">Working Hours</h4>
                <p className="text-muted-foreground mt-0.5">Mon - Sun: 7:00 AM - 11:00 PM</p>
                <span className="text-[10px] text-muted-foreground">PST Standard Time zone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Messaging Form */}
        <div className="lg:col-span-2 bg-card border border-border/40 rounded-3xl p-6 sm:p-8 shadow-sm">
          <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Send Us a Direct Message</h3>

          {success && (
            <div className="flex gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 dark:text-emerald-400 font-semibold mb-6">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>Message sent successfully! Our team will contact you shortly.</span>
            </div>
          )}

          {error && (
            <div className="flex gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-xs text-red-600 dark:text-red-400 font-semibold mb-6">
              <AlertCircle className="h-4.5 w-4.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Name */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jane@example.com"
                  className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            {/* Subject */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Subject Topic</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Booking extension query, corporate plans..."
                className="rounded-xl border border-border bg-background px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* Message Body */}
            <div className="flex flex-col space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Message</label>
              <textarea
                required
                rows={5}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your query details here..."
                className="rounded-xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center justify-center gap-2 rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground hover:opacity-95 shadow-md shadow-primary/20 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin border-2 border-primary-foreground border-t-transparent rounded-full" />
                  <span>Sending Message...</span>
                </>
              ) : (
                <>
                  <Send className="h-4.5 w-4.5" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
