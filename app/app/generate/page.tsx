"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { calculateSeoScore, PLATFORM_RULES, type SeoScore } from "../../lib/seo-score";

const PLATFORMS = ["Shopify", "Amazon", "Etsy", "eBay", "WooCommerce"];


export default function AppPage() {
  const [platform, setPlatform] = useState("Shopify");
  const [formData, setFormData] = useState({
    productName: "",
    category: "",
    details: "",
    price: "",
    audience: "",
    keywords: "",
    tone: "Professional",
    length: "Medium",
  });
  const [result, setResult] = useState<null | {
    title: string;
    description: string;
    bullets: string[];
    tags: string[];
  }>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [seoScore, setSeoScore] = useState<SeoScore | null>(null);
  const [scoredPlatform, setScoredPlatform] = useState("");


  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth";
      } else {
        setUserEmail(data.user.email || "");
        setAuthChecked(true);
      }
    });
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth";
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleUpgrade = async () => {
    const res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: userEmail, interval: "monthly" }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    }
  };

  
  const handleGenerate = async () => {
    if (!formData.productName.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ ...formData, platform }),
      });
      const data = await res.json();
      if (data.limitReached) {
        setShowUpgrade(true);
        return;
      }
      if (data.error) throw new Error(data.error);
      setResult(data);
      const score = calculateSeoScore(
        platform,
        data.title,
        data.description,
        data.bullets,
        data.tags,
        formData.keywords
      );
      setSeoScore(score);
      setScoredPlatform(platform);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyAll = () => {
    if (!result) return;
    const full = `TITLE:\n${result.title}\n\nDESCRIPTION:\n${result.description}\n\nBULLET POINTS:\n${result.bullets.map((b) => `• ${b}`).join("\n")}\n\nSEO TAGS:\n${result.tags.join(", ")}`;
    copyToClipboard(full, "all");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  

  return (
    <div className="max-w-6xl mx-auto px-6 md:px-12 py-10">
      <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT — FORM */}
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Generate a listing</h1>
            <p className="text-sm text-ink-muted mb-6">Fill in your product details and we&apos;ll do the rest.</p>

            {/* Platform Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => setPlatform(p)}
                  className={`px-4 py-2 text-xs font-bold rounded-full border transition ${
                    platform === p
                      ? "bg-terracotta text-white border-terracotta"
                      : "bg-white text-ink-muted border-border hover:border-ink-faint"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Product Name *</label>
                <input
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  placeholder="e.g. Bamboo Wireless Charging Pad"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Category</label>
                <input
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="e.g. Electronics, Home & Garden"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Product Details</label>
                <textarea
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Key features, materials, dimensions, what makes it special..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Price</label>
                  <input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="$29.99"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Target Audience</label>
                  <input
                    name="audience"
                    value={formData.audience}
                    onChange={handleChange}
                    placeholder="e.g. Tech-savvy millennials"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">SEO Keywords</label>
                <input
                  name="keywords"
                  value={formData.keywords}
                  onChange={handleChange}
                  placeholder="wireless charger, bamboo, eco-friendly, fast charging"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Tone</label>
                  <select
                    name="tone"
                    value={formData.tone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  >
                    <option>Professional</option>
                    <option>Casual</option>
                    <option>Luxury</option>
                    <option>Playful</option>
                    <option>Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Length</label>
                  <select
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  >
                    <option>Short</option>
                    <option>Medium</option>
                    <option>Long</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !formData.productName.trim()}
              className="mt-6 w-full py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Generating..." : "Generate Listing"}
            </button>
          </div>

          {/* RIGHT — RESULT */}
          <div>
            {!result && !loading && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl p-12">
                <div className="text-center">
                  <div className="text-4xl mb-3">✍️</div>
                  <p className="text-sm text-ink-muted">Your generated listing will appear here</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-terracotta/30 rounded-2xl p-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-ink-muted">Crafting your listing...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-xl font-bold">Your Listing</h2>
                  <button
                    onClick={copyAll}
                    className="px-4 py-2 text-xs font-bold bg-terracotta text-white rounded-full hover:bg-terracotta-deep transition"
                  >
                    {copied === "all" ? "Copied!" : "Copy All"}
                  </button>
                </div>

                {/* Title */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Title</span>
                    <button onClick={() => copyToClipboard(result.title, "title")} className="text-[10px] font-bold text-ink-faint hover:text-ink transition">
                      {copied === "title" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm font-semibold leading-relaxed">{result.title}</p>
                </div>

                {/* Description */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Description</span>
                    <button onClick={() => copyToClipboard(result.description, "desc")} className="text-[10px] font-bold text-ink-faint hover:text-ink transition">
                      {copied === "desc" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-line">{result.description}</p>
                </div>

                {/* Bullets */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">Bullet Points</span>
                    <button onClick={() => copyToClipboard(result.bullets.map((b) => `• ${b}`).join("\n"), "bullets")} className="text-[10px] font-bold text-ink-faint hover:text-ink transition">
                      {copied === "bullets" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <ul className="space-y-1.5">
                    {result.bullets.map((b, i) => (
                      <li key={i} className="text-sm text-ink-soft leading-relaxed">• {b}</li>
                    ))}
                  </ul>
                </div>

                {/* Tags */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">SEO Tags</span>
                    <button onClick={() => copyToClipboard(result.tags.join(", "), "tags")} className="text-[10px] font-bold text-ink-faint hover:text-ink transition">
                      {copied === "tags" ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-cream border border-border rounded-full text-xs text-ink-muted">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* SEO SCORE */}
                {seoScore && (
                  <div className="bg-white border border-border rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-terracotta">
                        SEO Score — {scoredPlatform}
                      </span>
                      <div className={`text-2xl font-display font-bold ${
                        seoScore.overall >= 80 ? "text-sage" : seoScore.overall >= 60 ? "text-terracotta" : "text-red-500"
                      }`}>
                        {seoScore.overall}/100
                      </div>
                    </div>

                    {/* Score bars */}
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[
                        { label: "Title", score: seoScore.titleScore },
                        { label: "Description", score: seoScore.descScore },
                        { label: "Bullets", score: seoScore.bulletScore },
                        { label: "Tags", score: seoScore.tagScore },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-1">{s.label}</div>
                          <div className="h-2 bg-cream-dark rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                s.score >= 80 ? "bg-sage" : s.score >= 60 ? "bg-terracotta" : "bg-red-500"
                              }`}
                              style={{ width: `${s.score}%` }}
                            />
                          </div>
                          <div className="text-[9px] font-bold text-ink-muted mt-0.5">{s.score}%</div>
                        </div>
                      ))}
                    </div>

                    {/* Issues list */}
                    <div className="space-y-1.5">
                      {seoScore.issues.map((issue, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className={`mt-0.5 ${
                            issue.type === "success" ? "text-sage" : issue.type === "warning" ? "text-terracotta" : "text-red-500"
                          }`}>
                            {issue.type === "success" ? "✓" : issue.type === "warning" ? "⚠" : "✗"}
                          </span>
                          <span className="text-ink-muted">{issue.message}</span>
                        </div>
                      ))}
                    </div>

                    {/* Platform tips */}
                    <div className="mt-4 pt-3 border-t border-cream-dark">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-2">{scoredPlatform} Tips</div>
                      {PLATFORM_RULES[scoredPlatform]?.tips.map((tip, i) => (
                        <p key={i} className="text-xs text-ink-muted mb-1">→ {tip}</p>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={handleGenerate}
                  className="w-full py-3 border border-border rounded-full text-sm font-bold text-ink-soft hover:border-ink-faint hover:text-ink transition"
                >
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-6 border border-border shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-4">🚀</div>
              <h2 className="font-display text-2xl font-bold mb-2">You&apos;re on fire!</h2>
              <p className="text-sm text-ink-muted mb-6">
                You&apos;ve used all 5 free listings this month. Upgrade to Growth for unlimited listings and unlock premium features.
              </p>

              <div className="bg-cream rounded-xl p-5 mb-6 text-left">
                <div className="font-display text-3xl font-bold text-terracotta mb-1">
                  $29<span className="font-body text-sm font-normal text-ink-faint">/mo</span>
                </div>
                <ul className="space-y-2 mt-3">
                  <li className="text-sm text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited listings</li>
                  <li className="text-sm text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Bulk generation (CSV)</li>
                  <li className="text-sm text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Brand voice training</li>
                  <li className="text-sm text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>A/B title variants</li>
                  <li className="text-sm text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Priority speed</li>
                </ul>
              </div>

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
    </div>
  );
}
