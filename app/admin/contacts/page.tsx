"use client";

import React, { useEffect, useState } from "react";
import { Mail, Trash2, MailOpen, MailCheck, RefreshCw, MessageSquare, Clock } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/contacts");
      const data = await res.json();
      setMessages(data);
    } catch {
      console.error("Failed to fetch messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  const markRead = async (id: string, read: boolean) => {
    await fetch("/api/admin/contacts", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, read }),
    });
    setMessages((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read } : m))
    );
    if (selected?.id === id) setSelected((s) => s ? { ...s, read } : null);
  };

  const deleteMessage = async (id: string) => {
    await fetch("/api/admin/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const openMessage = async (msg: ContactMessage) => {
    setSelected(msg);
    if (!msg.read) await markRead(msg.id, true);
  };

  const filtered = messages.filter((m) => {
    if (filter === "unread") return !m.read;
    if (filter === "read") return m.read;
    return true;
  });

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Contact Messages</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {unreadCount > 0 ? (
              <span className="text-primary font-semibold">{unreadCount} unread</span>
            ) : (
              "All messages read"
            )}{" "}
            · {messages.length} total
          </p>
        </div>
        <button
          onClick={fetchMessages}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(["all", "unread", "read"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-xl px-4 py-1.5 text-xs font-semibold capitalize transition-colors border ${
              filter === f
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {f}
            {f === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 rounded-full bg-rose-500 text-white text-[9px] px-1.5 py-0.5 font-bold">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Loading messages...
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-card border border-border/40 rounded-3xl text-center">
          <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-semibold text-foreground">No messages found</p>
          <p className="text-xs text-muted-foreground mt-1">Contact form submissions will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Message List */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.map((msg) => (
              <button
                key={msg.id}
                onClick={() => openMessage(msg)}
                className={`w-full text-left rounded-2xl border p-4 transition-all hover:border-primary/40 ${
                  selected?.id === msg.id
                    ? "border-primary bg-primary/5"
                    : msg.read
                    ? "border-border/40 bg-card"
                    : "border-primary/20 bg-primary/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    {!msg.read && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className={`text-sm font-bold truncate ${msg.read ? "text-foreground" : "text-primary"}`}>
                        {msg.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{msg.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0 mt-0.5">
                    {new Date(msg.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short"
                    })}
                  </span>
                </div>
                <p className="text-xs font-semibold text-foreground mt-2 truncate">{msg.subject}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{msg.message}</p>
              </button>
            ))}
          </div>

          {/* Message Detail */}
          <div className="lg:col-span-3">
            {selected ? (
              <div className="bg-card border border-border/40 rounded-3xl p-6 shadow-sm space-y-5">
                {/* Detail header */}
                <div className="flex items-start justify-between gap-4 border-b border-border/40 pb-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-foreground">{selected.subject}</h2>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{selected.name}</span>
                      <span>·</span>
                      <a href={`mailto:${selected.email}`} className="text-primary hover:underline">
                        {selected.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(selected.createdAt).toLocaleString("en-IN", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => markRead(selected.id, !selected.read)}
                      title={selected.read ? "Mark as unread" : "Mark as read"}
                      className="rounded-xl border border-border bg-secondary/40 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {selected.read ? <MailOpen className="h-4 w-4" /> : <MailCheck className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteMessage(selected.id)}
                      title="Delete message"
                      className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-2 text-rose-500 hover:bg-rose-500/20 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Message body */}
                <div className="bg-secondary/30 rounded-2xl p-5">
                  <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>

                {/* Reply shortcut */}
                <a
                  href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground hover:opacity-95 shadow-sm shadow-primary/20 transition-all"
                >
                  <Mail className="h-4 w-4" />
                  Reply via Email
                </a>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-72 bg-card border border-border/40 rounded-3xl text-center">
                <MailOpen className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-foreground">Select a message</p>
                <p className="text-xs text-muted-foreground mt-1">Click any message on the left to read it.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
