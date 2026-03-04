"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";
import { calculateSeoScore, PLATFORM_RULES, type SeoScore } from "../../lib/seo-score";

const PLATFORMS = ["Shopify", "Amazon", "Etsy", "eBay", "WooCommerce"];

export default function AnalyzerPage() {
  const [platform, setPlatform] = useState("Shopify");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bullets, setBullets] = useState("");
  const [tags, setTags] = useState("");
  const [keywords, setKeywords] = useState("");
  const [seoScore, setSeoScore] = useState<SeoScore | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);

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

  const handleAnalyze = () => {
    const bulletList = bullets
      .split("\n")
      .map((b) => b.replace(/^[•\-\*]\s*/, "").trim())
      .filter(Boolean);
    const tagList = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const score = calculateSeoScore(
      platform,
      title,
      description,
      bulletList,
      tagList,
      keywords
    );
    setSeoScore(score);
  };

  const rules = PLATFORM_RULES[platform];

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

          {/* LEFT — INPUT */}
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold">SEO Analyzer</h1>
              <span className="px-2.5 py-0.5 bg-sage/15 text-sage text-[10px] font-bold uppercase tracking-wider rounded-full">Free</span>
            </div>
            <p className="text-sm text-ink-muted mb-6">
              Paste any product listing and get an instant SEO score with platform-specific recommendations.
            </p>

            {/* Platform Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  onClick={() => { setPlatform(p); setSeoScore(null); }}
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

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-ink-soft">Product Title</label>
                  <span className={`text-[10px] font-mono ${
                    title.length > rules.titleMax ? "text-red-500 font-bold" : "text-ink-faint"
                  }`}>
                    {title.length}/{rules.titleMax}
                  </span>
                </div>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Paste your product title here"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-ink-soft">Description</label>
                  <span className={`text-[10px] font-mono ${
                    description.length > rules.descMax ? "text-red-500 font-bold" : "text-ink-faint"
                  }`}>
                    {description.split(/\s+/).filter(Boolean).length} words
                  </span>
                </div>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  placeholder="Paste your product description"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Bullet Points (one per line)</label>
                <textarea
                  value={bullets}
                  onChange={(e) => setBullets(e.target.value)}
                  rows={4}
                  placeholder={"• First bullet point\n• Second bullet point\n• Third bullet point"}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition resize-none font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Tags (comma separated)</label>
                <input
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="tag1, tag2, tag3, tag4"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Target Keywords (comma separated)</label>
                <input
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="Keywords you want to rank for"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!title.trim()}
              className="mt-6 w-full py-3.5 bg-ink text-white text-sm font-bold rounded-full hover:bg-ink-soft transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Analyze Listing
            </button>
          </div>

          {/* RIGHT — RESULTS */}
          <div>
            {!seoScore && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl p-12">
                <div className="text-center">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-sm text-ink-muted">Your SEO analysis will appear here</p>
                  <p className="text-xs text-ink-faint mt-2">Works with any listing — even ones you didn&apos;t create here</p>
                </div>
              </div>
            )}

            {seoScore && (
              <div className="space-y-5">
                {/* Overall Score */}
                <div className="bg-white border border-border rounded-xl p-6 text-center">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-ink-faint mb-3">Overall SEO Score</div>
                  <div className={`font-display text-6xl font-bold ${
                    seoScore.overall >= 80 ? "text-sage" : seoScore.overall >= 60 ? "text-terracotta" : "text-red-500"
                  }`}>
                    {seoScore.overall}
                  </div>
                  <div className="text-sm text-ink-muted mt-1">
                    {seoScore.overall >= 90 ? "Excellent! This listing is highly optimized." :
                     seoScore.overall >= 80 ? "Great listing — minor improvements possible." :
                     seoScore.overall >= 70 ? "Good foundation — fix the issues below to improve." :
                     seoScore.overall >= 60 ? "Needs work — several areas to optimize." :
                     "Significant optimization needed. Review all issues below."}
                  </div>
                </div>

                {/* Score Breakdown */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-4">Score Breakdown</div>
                  <div className="space-y-3">
                    {[
                      { label: "Title", score: seoScore.titleScore, weight: "35%" },
                      { label: "Description", score: seoScore.descScore, weight: "30%" },
                      { label: "Bullet Points", score: seoScore.bulletScore, weight: "20%" },
                      { label: "Tags", score: seoScore.tagScore, weight: "15%" },
                    ].map((s) => (
                      <div key={s.label}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs font-bold text-ink-soft">{s.label}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] text-ink-faint">weight: {s.weight}</span>
                            <span className={`text-xs font-bold ${
                              s.score >= 80 ? "text-sage" : s.score >= 60 ? "text-terracotta" : "text-red-500"
                            }`}>{s.score}%</span>
                          </div>
                        </div>
                        <div className="h-2.5 bg-cream-dark rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-700 ${
                              s.score >= 80 ? "bg-sage" : s.score >= 60 ? "bg-terracotta" : "bg-red-500"
                            }`}
                            style={{ width: `${s.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Issues */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">Analysis</div>
                  <div className="space-y-2">
                    {seoScore.issues
                      .sort((a, b) => {
                        const order = { error: 0, warning: 1, success: 2 };
                        return order[a.type] - order[b.type];
                      })
                      .map((issue, i) => (
                      <div key={i} className={`flex items-start gap-2.5 text-xs p-2.5 rounded-lg ${
                        issue.type === "error" ? "bg-red-50" : issue.type === "warning" ? "bg-orange-50" : "bg-green-50"
                      }`}>
                        <span className={`mt-0.5 text-sm ${
                          issue.type === "success" ? "text-sage" : issue.type === "warning" ? "text-terracotta" : "text-red-500"
                        }`}>
                          {issue.type === "success" ? "✓" : issue.type === "warning" ? "⚠" : "✗"}
                        </span>
                        <span className="text-ink-soft leading-relaxed">{issue.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Platform Tips */}
                <div className="bg-white border border-border rounded-xl p-5">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">{platform} Optimization Tips</div>
                  <div className="space-y-2">
                    {PLATFORM_RULES[platform]?.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs p-2.5 bg-cream rounded-lg">
                        <span className="text-terracotta mt-0.5">→</span>
                        <span className="text-ink-soft leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA to generator */}
                <div className="bg-terracotta/5 border border-terracotta/15 rounded-xl p-5 text-center">
                  <p className="text-sm text-ink-soft mb-3">Want a better listing? Let AI generate an optimized one for you.</p>
                  <Link
                    href="/app/generate"
                    className="inline-block px-6 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition"
                  >
                    Generate Optimized Listing
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
  );
}
