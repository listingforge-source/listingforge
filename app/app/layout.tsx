"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "../lib/supabase";

const NAV_ITEMS = [
  { href: "/app", label: "Dashboard", icon: "📊" },
  { href: "/app/generate", label: "Generator", icon: "✍️" },
  { href: "/app/analyzer", label: "SEO Analyzer", icon: "🔍" },
  { href: "/app/research", label: "Product Research", icon: "🔬" },
  { href: "/app/ads", label: "Ad Generator", icon: "📣" },
  { href: "/app/history", label: "History", icon: "📋" },
];

const BOTTOM_ITEMS = [
  { href: "/app/billing", label: "Billing", icon: "💳" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState("");
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserEmail(data.user.email || "");
      }
    });
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const isActive = (href: string) => {
    if (href === "/app") return pathname === "/app";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-ink/30 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* SIDEBAR — collapsed by default, expands on hover */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`fixed top-0 left-0 h-full bg-white border-r border-border z-50 flex flex-col transition-all duration-300 ${
          hovered ? "w-56 shadow-xl" : "w-14"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Logo */}
        <div className="px-3 py-4 border-b border-border flex items-center justify-center">
          {hovered ? (
            <Link href="/" className="font-display text-lg font-bold tracking-tight">
              Listing<span className="text-terracotta">Forge</span>
            </Link>
          ) : (
            <Link href="/" className="font-display text-lg font-bold text-terracotta">L</Link>
          )}
        </div>

        {/* Main Nav */}
        <nav className="flex-1 px-1.5 py-3 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-terracotta/8 text-terracotta font-bold"
                  : "text-ink-muted hover:bg-cream hover:text-ink"
              } ${!hovered ? "justify-center" : ""}`}
              title={!hovered ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {hovered && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Bottom Nav */}
        <div className="px-1.5 py-3 border-t border-border space-y-0.5">
          {BOTTOM_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                isActive(item.href)
                  ? "bg-terracotta/8 text-terracotta font-bold"
                  : "text-ink-muted hover:bg-cream hover:text-ink"
              } ${!hovered ? "justify-center" : ""}`}
              title={!hovered ? item.label : undefined}
            >
              <span className="text-base flex-shrink-0">{item.icon}</span>
              {hovered && <span className="whitespace-nowrap">{item.label}</span>}
            </Link>
          ))}

          {/* User */}
          <div className={`px-3 py-2 ${!hovered ? "text-center" : ""}`}>
            {hovered && (
              <div className="text-[10px] text-ink-faint font-mono truncate mb-2">{userEmail}</div>
            )}
            <button
              onClick={handleLogout}
              className={`flex items-center gap-3 text-sm font-medium text-ink-faint hover:text-ink transition ${!hovered ? "justify-center w-full" : ""}`}
              title={!hovered ? "Log out" : undefined}
            >
              <span className="text-base flex-shrink-0">🚪</span>
              {hovered && <span>Log out</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="lg:ml-14 transition-all duration-300">
        {/* Mobile top bar */}
        <div className="lg:hidden px-4 py-3 bg-white border-b border-border flex items-center justify-between">
          <button onClick={() => setMobileOpen(true)} className="text-xl">☰</button>
          <Link href="/" className="font-display text-lg font-bold tracking-tight">
            Listing<span className="text-terracotta">Forge</span>
          </Link>
          <div className="w-6" />
        </div>

        {children}
      </main>
    </div>
  );
}