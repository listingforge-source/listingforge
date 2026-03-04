"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function Dashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [usageCount, setUsageCount] = useState(0);
  const [plan, setPlan] = useState("free");

 const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth";
        return;
      }
      setUserEmail(data.user.email || "");
      setAuthChecked(true);

      // Fetch usage
      try {
        const { data: session } = await supabase.auth.getSession();
        const res = await fetch("/api/usage", {
          headers: {
            Authorization: `Bearer ${session.session?.access_token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setUsageCount(data.count || 0);
          setPlan(data.plan || "free");
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const freeLimit = 5;
  const usagePercent = plan === "free" ? Math.min((usageCount / freeLimit) * 100, 100) : 0;

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">


        {/* GREETING */}
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-1">
            Welcome back{userEmail ? `, ${userEmail.split("@")[0]}` : ""}
          </h1>
          <p className="text-sm text-ink-muted">Here&apos;s your ListingForge overview.</p>
        </div>

        {/* STATS ROW */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          {/* Usage Card */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Monthly Usage</div>
            {plan === "free" ? (
              <>
                <div className="flex items-end gap-1 mb-2">
                  <span className="font-display text-3xl font-bold">{usageCount}</span>
                  <span className="text-sm text-ink-faint mb-1">/ {freeLimit}</span>
                </div>
                <div className="h-2 bg-cream-dark rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full rounded-full transition-all ${
                      usagePercent >= 80 ? "bg-red-500" : usagePercent >= 60 ? "bg-terracotta" : "bg-sage"
                    }`}
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <p className="text-xs text-ink-faint">{freeLimit - usageCount} listings remaining</p>
              </>
            ) : (
              <>
                <div className="font-display text-3xl font-bold text-sage mb-1">{usageCount}</div>
                <p className="text-xs text-ink-faint">Unlimited on Growth plan</p>
              </>
            )}
          </div>

          {/* Plan Card */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Current Plan</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-display text-3xl font-bold capitalize">{plan === "free" ? "Starter" : "Growth"}</span>
              {plan === "free" && (
                <span className="px-2 py-0.5 bg-cream-dark text-ink-faint text-[9px] font-bold uppercase tracking-wider rounded-full">Free</span>
              )}
              {plan !== "free" && (
                <span className="px-2 py-0.5 bg-sage/15 text-sage text-[9px] font-bold uppercase tracking-wider rounded-full">Active</span>
              )}
            </div>
            {plan === "free" ? (
              <button
                onClick={handleUpgrade}
                className="mt-2 px-4 py-2 text-xs font-bold bg-terracotta text-white rounded-full hover:bg-terracotta-deep transition"
              >
                Upgrade to Growth — $29/mo
              </button>
            ) : (
              <p className="text-xs text-ink-faint">$29/mo &middot; Unlimited listings</p>
            )}
          </div>

          {/* Platforms Card */}
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Supported Platforms</div>
            <div className="flex gap-3 mb-2">
              <span className="text-2xl" title="Shopify">🛍️</span>
              <span className="text-2xl" title="Amazon">📦</span>
              <span className="text-2xl" title="Etsy">🧶</span>
              <span className="text-2xl" title="eBay">🏷️</span>
              <span className="text-2xl" title="WooCommerce">🌐</span>
            </div>
            <p className="text-xs text-ink-faint">Optimized for all 5 marketplaces</p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-8">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-4">Quick Actions</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link
              href="/app/generate"
              className="group bg-white border border-border rounded-2xl p-6 hover:border-terracotta/30 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-terracotta/8 flex items-center justify-center text-xl">✍️</div>
                <div>
                  <h3 className="text-base font-bold mb-1 group-hover:text-terracotta transition">Generate a Listing</h3>
                  <p className="text-sm text-ink-muted">Enter your product details and get an optimized listing with title, description, bullets, and SEO tags.</p>
                </div>
              </div>
            </Link>

            <Link
              href="/app/analyzer"
              className="group bg-white border border-border rounded-2xl p-6 hover:border-sage/30 hover:-translate-y-0.5 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage/8 flex items-center justify-center text-xl">🔍</div>
                <div>
                  <h3 className="text-base font-bold mb-1 group-hover:text-sage transition">Analyze Existing Listing</h3>
                  <p className="text-sm text-ink-muted">Paste any listing and get an instant SEO score with platform-specific recommendations.</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* TIPS SECTION */}
        <div>
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-4">Optimization Tips</h2>
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="text-lg mb-2">🎯</div>
                <h3 className="text-sm font-bold mb-1">Keywords Matter</h3>
                <p className="text-xs text-ink-muted leading-relaxed">Include your top 3-5 target keywords in the title and first sentence of your description for maximum search visibility.</p>
              </div>
              <div>
                <div className="text-lg mb-2">📐</div>
                <h3 className="text-sm font-bold mb-1">Platform Limits</h3>
                <p className="text-xs text-ink-muted leading-relaxed">Amazon allows 200 char titles while Shopify works best under 70. Our generator and analyzer handle this automatically.</p>
              </div>
              <div>
                <div className="text-lg mb-2">🔄</div>
                <h3 className="text-sm font-bold mb-1">Test &amp; Iterate</h3>
                <p className="text-xs text-ink-muted leading-relaxed">Generate multiple versions, compare SEO scores, and pick the winner. Small tweaks can mean big differences in click-through rates.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
