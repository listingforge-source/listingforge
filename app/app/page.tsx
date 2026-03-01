"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

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

  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = "/auth";
      } else {
        setUserEmail(data.user.email || "");
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

  const handleGenerate = async () => {
    if (!formData.productName.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, platform }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
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

  return (
    <div className="min-h-screen bg-cream">
      {/* NAV */}
      <nav className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-border bg-white">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-xs text-ink-faint font-mono">{userEmail}</span>
          <button
            onClick={handleLogout}
            className="text-xs font-bold text-ink-muted hover:text-ink transition"
          >
            Log out
          </button>
        </div>
      </nav>

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
      </div>
    </div>
  );
}