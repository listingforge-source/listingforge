"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

export default function BillingPage() {
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [plan, setPlan] = useState("free");
  const [usageCount, setUsageCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [trialDaysLeft, setTrialDaysLeft] = useState(0);

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
          setTrialDaysLeft(data.trialDaysLeft || 0);
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

  const handleUpgrade = async (interval?: "monthly" | "yearly") => {
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail, interval: interval || billingInterval }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleManageBilling = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch("/api/billing-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`,
        },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const freeLimit = 5;
  const isFreeOrTrial = plan === "free" || plan === "trial";
  const isPaid = plan === "growth";

  return (
    <div className="max-w-3xl mx-auto px-6 md:px-12 py-10">
      <h1 className="font-display text-3xl font-bold mb-1">Billing &amp; Plan</h1>
      <p className="text-sm text-ink-muted mb-8">Manage your subscription and view usage.</p>

      {/* TRIAL BANNER */}
      {plan === "trial" && (
        <div className="bg-terracotta/5 border border-terracotta/15 rounded-2xl p-5 mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-terracotta">{trialDaysLeft} day{trialDaysLeft !== 1 ? "s" : ""} left in your free trial</p>
            <p className="text-xs text-ink-muted mt-0.5">All Growth features are unlocked. Upgrade to keep them.</p>
          </div>
          <button
            onClick={() => handleUpgrade(billingInterval)}
            className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition"
          >
            Upgrade Now
          </button>
        </div>
      )}

      {/* CURRENT PLAN */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-2">Current Plan</div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="font-display text-2xl font-bold">
                {isFreeOrTrial ? "Starter" : "Growth"}
              </h2>
              {plan === "free" && (
                <span className="px-2.5 py-0.5 bg-cream-dark text-ink-faint text-[9px] font-bold uppercase tracking-wider rounded-full">Free</span>
              )}
              {plan === "trial" && (
                <span className="px-2.5 py-0.5 bg-terracotta/10 text-terracotta text-[9px] font-bold uppercase tracking-wider rounded-full">Trial</span>
              )}
              {isPaid && (
                <span className="px-2.5 py-0.5 bg-sage/15 text-sage text-[9px] font-bold uppercase tracking-wider rounded-full">Active</span>
              )}
            </div>
            <p className="text-sm text-ink-muted">
              {isFreeOrTrial
                ? "5 listings per month with basic features"
                : "$29/month — unlimited listings with all features"}
            </p>
          </div>
          <div className="font-display text-3xl font-bold text-terracotta">
            {isFreeOrTrial ? "$0" : "$29"}
            <span className="font-body text-sm font-normal text-ink-faint">/mo</span>
          </div>
        </div>
      </div>

      {/* USAGE */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">This Month&apos;s Usage</div>
        <div className="flex items-end gap-2 mb-3">
          <span className="font-display text-4xl font-bold">{usageCount}</span>
          {plan === "free" && (
            <span className="text-sm text-ink-faint mb-1.5">/ {freeLimit} listings</span>
          )}
          {(plan === "trial" || isPaid) && (
            <span className="text-sm text-ink-faint mb-1.5">listings generated</span>
          )}
        </div>
        {plan === "free" && (
          <div className="h-3 bg-cream-dark rounded-full overflow-hidden mb-2">
            <div
              className={`h-full rounded-full transition-all ${
                usageCount >= freeLimit ? "bg-red-500" : usageCount >= 3 ? "bg-terracotta" : "bg-sage"
              }`}
              style={{ width: `${Math.min((usageCount / freeLimit) * 100, 100)}%` }}
            />
          </div>
        )}
        <p className="text-xs text-ink-faint">
          {plan === "free"
            ? `${Math.max(freeLimit - usageCount, 0)} listings remaining this month. Resets on the 1st.`
            : "Unlimited listings on your current plan."}
        </p>
      </div>

      {/* PLAN COMPARISON */}
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {/* Starter */}
        <div className={`p-6 rounded-2xl border-2 flex flex-col ${plan === "free" ? "border-terracotta bg-white" : "border-border bg-white"}`}>
          {plan === "free" ? (
            <div className="text-[9px] font-bold uppercase tracking-widest text-terracotta mb-2">Your current plan</div>
          ) : (
            <div className="h-4 mb-2" />
          )}
          <h3 className="text-lg font-bold mb-3">Starter</h3>

          {isFreeOrTrial && (
            <div className="h-[42px] mb-4" />
          )}

          <div className="font-display text-3xl font-bold text-ink mb-1">
            $0<span className="font-body text-sm font-normal text-ink-faint">/mo</span>
          </div>
          <p className="text-xs text-ink-faint mb-4 h-5">Free forever</p>

          <ul className="space-y-2 mb-5 flex-1">
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>5 listings per month</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>All 5 platforms</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>SEO scoring</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>SEO Analyzer (10/month)</li>
            <li className="text-xs text-ink-muted opacity-0">&#10003; spacer</li>
          </ul>
          {plan === "free" ? (
            <div className="text-center text-xs text-ink-faint font-bold py-3">Current plan</div>
          ) : (
            <div className="py-3" />
          )}
        </div>

        {/* Growth */}
        <div className={`p-6 rounded-2xl border-2 flex flex-col ${isPaid ? "border-terracotta bg-white" : plan === "trial" ? "border-terracotta/50 bg-white" : "border-border bg-white"}`}>
          {isPaid ? (
            <div className="text-[9px] font-bold uppercase tracking-widest text-terracotta mb-2">Your current plan</div>
          ) : plan === "trial" ? (
            <div className="text-[9px] font-bold uppercase tracking-widest text-terracotta mb-2">Trial active — {trialDaysLeft} days left</div>
          ) : (
            <div className="h-4 mb-2" />
          )}
          <h3 className="text-lg font-bold mb-3">Growth</h3>

          {isFreeOrTrial && (
            <div className="flex justify-center mb-4">
              <div className="inline-flex bg-cream-dark rounded-xl p-1 gap-1 border border-border">
                <button
                  onClick={() => setBillingInterval("monthly")}
                  className={`py-2.5 px-5 text-xs font-bold rounded-lg transition ${
                    billingInterval === "monthly" ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval("yearly")}
                  className={`py-2.5 px-5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                    billingInterval === "yearly" ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                  }`}
                >
                  Yearly
                  <span className="px-1.5 py-0.5 bg-sage/15 text-sage text-[9px] font-extrabold rounded-md">SAVE 35%</span>
                </button>
              </div>
            </div>
          )}

          <div className="font-display text-3xl font-bold text-terracotta mb-1">
            {billingInterval === "yearly" ? "$18.85" : "$29"}
            <span className="font-body text-sm font-normal text-ink-faint">/mo</span>
          </div>
          {billingInterval === "yearly" && isFreeOrTrial ? (
            <p className="text-xs mb-4 h-5"><span className="text-sage font-bold">You save $121.80/year</span> <span className="text-ink-faint">· billed at $226.20</span></p>
          ) : (
            <p className="text-xs text-ink-faint mb-4 h-5">For active sellers</p>
          )}

          <ul className="space-y-2 mb-5 flex-1">
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited listings</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited product research</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited ad generations</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>All 5 ad platforms</li>
            <li className="text-xs text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Priority speed</li>
          </ul>
          {isFreeOrTrial ? (
            <button
              onClick={() => handleUpgrade(billingInterval)}
              disabled={loading}
              className="w-full py-3 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition disabled:opacity-50"
            >
              {loading ? "Loading..." : billingInterval === "yearly" ? "Upgrade — $226.20/year" : "Upgrade — $29/mo"}
            </button>
          ) : (
            <div className="text-center text-xs text-ink-faint font-bold py-3">Current plan</div>
          )}
        </div>
      </div>

      {/* MANAGE SUBSCRIPTION */}
      {isPaid && (
        <div className="bg-white border border-border rounded-2xl p-6 mb-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Manage Subscription</div>
          <p className="text-sm text-ink-muted mb-4">
            Update your payment method, view invoices, or cancel your subscription through the Stripe customer portal.
          </p>
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="px-6 py-3 border border-border text-sm font-bold text-ink-soft rounded-full hover:border-ink-faint hover:text-ink transition disabled:opacity-50"
          >
            {loading ? "Loading..." : "Manage Subscription"}
          </button>
        </div>
      )}

      {/* ACCOUNT INFO */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Account</div>
        <div className="flex justify-between items-center py-3 border-b border-cream-dark">
          <span className="text-sm text-ink-muted">Email</span>
          <span className="text-sm font-bold">{userEmail}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-cream-dark">
          <span className="text-sm text-ink-muted">Plan</span>
          <span className="text-sm font-bold capitalize">
            {plan === "free" ? "Starter (Free)" : plan === "trial" ? "Growth (Trial)" : "Growth ($29/mo)"}
          </span>
        </div>
        <div className="flex justify-between items-center py-3">
          <span className="text-sm text-ink-muted">Listings this month</span>
          <span className="text-sm font-bold">{usageCount}{plan === "free" ? ` / ${freeLimit}` : ""}</span>
        </div>
      </div>
    </div>
  );
}