/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

export default function ResearchPage() {
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const [report, setReport] = useState<any>(null);

  const [formData, setFormData] = useState({
    productName: "",
    marketplace: "Amazon",
    niche: "",
    priceRange: "",
    sourcingMethod: "",
    targetAudience: "",
    competitorUrl: "",
    budget: "",
    experience: "",
    region: "",
  });

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
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleResearch = async () => {
    if (!formData.productName.trim()) return;
    setLoading(true);
    setReport(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/research", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.limitReached) {
        setShowUpgrade(true);
        setLoading(false);
        return;
      }
      if (data.error) throw new Error(data.error);
      setReport(data);
    } catch (err) {
      console.error(err);
      alert("Research failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, interval: "monthly" }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-sage" : score >= 60 ? "text-terracotta" : "text-red-500";

  const scoreBg = (score: number) =>
    score >= 80 ? "bg-sage" : score >= 60 ? "bg-terracotta" : "bg-red-500";

  const fitColor = (fit: string) =>
    fit === "high" ? "text-sage" : fit === "medium" ? "text-terracotta" : "text-red-500";

  const severityBg = (s: string) =>
    s === "low" ? "bg-green-50" : s === "medium" ? "bg-orange-50" : "bg-red-50";

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

 return (
    <>
      <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">

        {!report && !loading && (
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-bold mb-2">Product Research</h1>
              <p className="text-sm text-ink-muted">
                Analyze any product idea across all major marketplaces. Get demand trends, profitability estimates, competition analysis, and a clear go/no-go recommendation.
              </p>
            </div>

            {/* STEP 1 — REQUIRED */}
            <div className="bg-white border border-border rounded-2xl p-6 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-4">Step 1 — Product Idea</div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Product Name / Idea *</label>
                  <input
                    name="productName"
                    value={formData.productName}
                    onChange={handleChange}
                    placeholder="e.g. Bamboo sunglasses, LED dog collar, Reusable food wrap"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Primary Marketplace *</label>
                  <select
                    name="marketplace"
                    value={formData.marketplace}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  >
                    <option>Amazon</option>
                    <option>Etsy</option>
                    <option>eBay</option>
                    <option>Shopify / DTC</option>
                    <option>TikTok Shop</option>
                    <option>Walmart</option>
                    <option>General / Multi-platform</option>
                  </select>
                </div>
              </div>
            </div>

            {/* STEP 2 — ENHANCE */}
            <div className="bg-white border border-border rounded-2xl overflow-hidden mb-6">
              <button
                onClick={() => setShowEnhanced(!showEnhanced)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-cream/50 transition"
              >
                <div className="flex items-center gap-3">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-sage">Step 2 — Enhance Your Analysis</div>
                  <span className="text-[9px] text-ink-faint font-bold px-2 py-0.5 bg-cream-dark rounded-full">Optional</span>
                </div>
                <span className="text-ink-faint text-sm">{showEnhanced ? "−" : "+"}</span>
              </button>

              {showEnhanced && (
                <div className="px-6 pb-6 space-y-4 border-t border-border pt-4">
                  <p className="text-xs text-ink-faint">The more you fill in, the more accurate and personalized your report will be.</p>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1.5">Niche / Category</label>
                      <input
                        name="niche"
                        value={formData.niche}
                        onChange={handleChange}
                        placeholder="e.g. Eco-friendly accessories"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1.5">Target Price Range</label>
                      <select
                        name="priceRange"
                        value={formData.priceRange}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                      >
                        <option value="">Select range</option>
                        <option>Under $10</option>
                        <option>$10 - $25</option>
                        <option>$25 - $50</option>
                        <option>$50 - $100</option>
                        <option>$100+</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1.5">Sourcing Method</label>
                      <select
                        name="sourcingMethod"
                        value={formData.sourcingMethod}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                      >
                        <option value="">Select method</option>
                        <option>Dropshipping</option>
                        <option>Wholesale</option>
                        <option>Private Label</option>
                        <option>Handmade</option>
                        <option>Print on Demand</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1.5">Starting Budget</label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                      >
                        <option value="">Select budget</option>
                        <option>Under $500</option>
                        <option>$500 - $2,000</option>
                        <option>$2,000 - $5,000</option>
                        <option>$5,000+</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1.5">Target Audience</label>
                    <input
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      placeholder="e.g. College students, new moms, fitness enthusiasts"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1.5">Competitor URL or Brand</label>
                    <input
                      name="competitorUrl"
                      value={formData.competitorUrl}
                      onChange={handleChange}
                      placeholder="e.g. https://competitor.com or brand name"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1.5">Experience Level</label>
                      <select
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                      >
                        <option value="">Select level</option>
                        <option>Beginner</option>
                        <option>Intermediate</option>
                        <option>Experienced</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-ink-soft mb-1.5">Selling Region</label>
                      <select
                        name="region"
                        value={formData.region}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                      >
                        <option value="">Select region</option>
                        <option>United States</option>
                        <option>Canada</option>
                        <option>United Kingdom</option>
                        <option>Europe</option>
                        <option>Australia</option>
                        <option>Global</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleResearch}
              disabled={loading || !formData.productName.trim()}
              className="w-full py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Product
            </button>
          </div>
        )}

        {/* LOADING */}
        {loading && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-10 h-10 border-3 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold mb-2">Analyzing {formData.productName}...</h2>
            <p className="text-sm text-ink-muted">Researching market trends, competition, and profitability across all platforms. This may take 15-30 seconds.</p>
          </div>
        )}

        {/* REPORT */}
        {report && !loading && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="font-display text-2xl font-bold mb-1">Research Report: {formData.productName}</h1>
                <p className="text-sm text-ink-muted">Primary marketplace: {formData.marketplace}</p>
              </div>
              <button
                onClick={() => { setReport(null); }}
                className="px-5 py-2.5 border border-border text-xs font-bold rounded-full hover:border-ink-faint transition"
              >
                New Research
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-4 mb-6">
              {/* Overall Score */}
              <div className="bg-white border border-border rounded-2xl p-6 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-2">Overall Score</div>
                <div className={`font-display text-5xl font-bold ${scoreColor(report.overallScore)}`}>
                  {report.overallScore}
                </div>
                <div className="text-[10px] text-ink-faint mt-1">/100</div>
              </div>

              {/* Verdict */}
              <div className="lg:col-span-2 bg-white border border-border rounded-2xl p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-2">Verdict</div>
                <p className="text-sm text-ink-soft leading-relaxed">{report.verdict}</p>
              </div>
            </div>

            {/* Score Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
              {[
                { label: "Trend", score: report.trend?.score },
                { label: "Market", score: report.market?.score },
                { label: "Profit", score: report.profitability?.score },
                { label: "Seasonal", score: report.seasonal?.score },
                { label: "Audience", score: report.audience?.score },
                { label: "Risk", score: report.risks?.score },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-border rounded-xl p-4 text-center">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">{item.label}</div>
                  <div className={`font-display text-2xl font-bold ${scoreColor(item.score || 0)}`}>{item.score}</div>
                  <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden mt-2">
                    <div className={`h-full rounded-full ${scoreBg(item.score || 0)}`} style={{ width: `${item.score}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Trend Analysis */}
            <div className="bg-white border border-border rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Trend Analysis</div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold ${report.trend?.direction === "rising" ? "text-sage" : report.trend?.direction === "stable" ? "text-terracotta" : "text-red-500"}`}>
                    {report.trend?.direction === "rising" ? "↑ Rising" : report.trend?.direction === "stable" ? "→ Stable" : "↓ Declining"}
                  </span>
                  <span className="text-xs text-ink-faint">{report.trend?.yearOverYear}</span>
                </div>
              </div>
              <p className="text-sm text-ink-muted mb-4">{report.trend?.summary}</p>

              {/* Monthly Demand Bar Chart */}
              {report.seasonal?.monthlyDemand && (
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-3">Monthly Demand Pattern</div>
                  <div className="flex items-end gap-2" style={{ height: "180px" }}>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, i) => {
                      const value = report.seasonal.monthlyDemand[i] || 0;
                      const max = Math.max(...report.seasonal.monthlyDemand);
                      const heightPct = max > 0 ? (value / max) * 100 : 0;
                      const isPeak = report.trend?.peakMonths?.some((m: string) => m.toLowerCase().startsWith(month.toLowerCase())) || false;
                      return (
                        <div key={month} className="flex-1 flex flex-col items-center justify-end h-full">
                          <div className="text-[9px] font-bold text-ink-faint mb-1">{value}</div>
                          <div
                            className={`w-full rounded-t-md ${isPeak ? "bg-terracotta" : "bg-sage/30"}`}
                            style={{ height: `${Math.max(heightPct, 5)}%` }}
                          />
                          <div className={`text-[9px] mt-2 ${isPeak ? "font-bold text-terracotta" : "text-ink-faint"}`}>{month}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-terracotta" />
                      <span className="text-[9px] text-ink-faint">Peak months</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-sm bg-sage/30" />
                      <span className="text-[9px] text-ink-faint">Regular demand</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Platform Breakdown */}
            <div className="bg-white border border-border rounded-2xl p-6 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-1">Market &amp; Competition</div>
              <p className="text-sm text-ink-muted mb-4">{report.market?.summary}</p>
              <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Platform Breakdown</div>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                {report.market?.platformBreakdown?.map((p: any) => (
                  <div key={p.platform} className={`rounded-xl p-5 border-2 ${
                    p.fit === "high" ? "border-sage/30 bg-green-50/30" : p.fit === "medium" ? "border-terracotta/20 bg-orange-50/30" : "border-border bg-white"
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold">{p.platform}</span>
                      <span className={`text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full ${
                        p.fit === "high" ? "bg-sage/15 text-sage" : p.fit === "medium" ? "bg-terracotta/10 text-terracotta" : "bg-cream-dark text-ink-faint"
                      }`}>{p.fit}</span>
                    </div>
                    <p className="text-xs text-ink-muted leading-relaxed">{p.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Profitability */}
            <div className="bg-white border border-border rounded-2xl p-6 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">Profitability</div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Retail Price</div>
                  <div className="text-sm font-bold">{report.profitability?.estimatedRetailPrice}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Est. Cost</div>
                  <div className="text-sm font-bold">{report.profitability?.estimatedCost}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Margin</div>
                  <div className="text-sm font-bold text-sage">{report.profitability?.estimatedMargin}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Monthly Revenue</div>
                  <div className="text-sm font-bold">{report.profitability?.monthlyRevenueEstimate}</div>
                </div>
              </div>
              <p className="text-sm text-ink-muted">{report.profitability?.summary}</p>
            </div>

            {/* Audience */}
            <div className="bg-white border border-border rounded-2xl p-6 mb-4">
              <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">Target Audience</div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Primary</div>
                  <div className="text-xs font-bold">{report.audience?.primaryDemo}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Secondary</div>
                  <div className="text-xs font-bold">{report.audience?.secondaryDemo}</div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">Motivation</div>
                  <div className="text-xs font-bold">{report.audience?.buyingMotivation}</div>
                </div>
              </div>
              <p className="text-sm text-ink-muted">{report.audience?.summary}</p>
            </div>

            {/* Risks */}
            <div className="bg-white border border-border rounded-2xl p-6 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Risk Assessment</div>
                <span className={`text-xs font-bold uppercase ${report.risks?.level === "low" ? "text-sage" : report.risks?.level === "medium" ? "text-terracotta" : "text-red-500"}`}>
                  {report.risks?.level} risk
                </span>
              </div>
              <div className="space-y-2">
                {report.risks?.factors?.map((r: any, i: number) => (
                  <div key={i} className={`flex items-start gap-3 text-xs p-3 rounded-lg ${severityBg(r.severity)}`}>
                    <span className={`font-bold uppercase text-[9px] mt-0.5 ${r.severity === "low" ? "text-sage" : r.severity === "medium" ? "text-terracotta" : "text-red-500"}`}>
                      {r.severity}
                    </span>
                    <div>
                      <span className="font-bold text-ink-soft">{r.risk}</span>
                      <span className="text-ink-muted"> — {r.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps & Niche Variations */}
            <div className="grid lg:grid-cols-2 gap-4 mb-6">
              <div className="bg-white border border-border rounded-2xl p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">Recommended Next Steps</div>
                <div className="space-y-2">
                  {report.nextSteps?.map((step: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs">
                      <span className="w-5 h-5 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-ink-soft leading-relaxed">{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-border rounded-2xl p-6">
                <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">Niche Variations to Consider</div>
                <div className="space-y-2">
                  {report.nicheVariations?.map((v: string, i: number) => (
                    <div key={i} className="flex items-start gap-2.5 text-xs p-2.5 bg-cream rounded-lg">
                      <span className="text-sage mt-0.5">→</span>
                      <span className="text-ink-soft leading-relaxed">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="bg-terracotta/5 border border-terracotta/15 rounded-2xl p-6 text-center">
              <p className="text-sm text-ink-soft mb-3">Ready to sell this product? Generate an optimized listing now.</p>
              <Link
                href="/app/generate"
                className="inline-block px-8 py-3 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition"
              >
                Generate Listing for {formData.productName}
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-6 border border-border shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-4">🔬</div>
              <h2 className="font-display text-2xl font-bold mb-2">Unlock Unlimited Research</h2>
              <p className="text-sm text-ink-muted mb-6">
                Free plan includes 1 product research per month. Upgrade to Growth for unlimited research and all premium features.
              </p>
              <button
                onClick={handleUpgrade}
                className="w-full py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg mb-3"
              >
                Upgrade to Growth — $29/mo
              </button>
              <button
                onClick={() => setShowUpgrade(false)}
                className="w-full py-3 text-xs font-bold text-ink-faint hover:text-ink transition"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}