/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

const AD_PLATFORMS = ["Facebook / Instagram", "Google Ads", "TikTok Ads", "Pinterest Ads", "Amazon PPC"];
const GOALS = ["Awareness", "Traffic", "Conversions", "Retargeting"];
const TONES = ["Professional", "Casual", "Urgent", "Aspirational", "Playful", "Bold"];

export default function AdsPage() {
  const [userEmail, setUserEmail] = useState("");
  const [authChecked, setAuthChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState("");

  const [formData, setFormData] = useState({
    productName: "",
    productDescription: "",
    platform: "Facebook / Instagram",
    goal: "Conversions",
    offer: "",
    tone: "Professional",
    audience: "",
    price: "",
    keywords: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    if (!formData.productName.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch("/api/ads", {
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
      setResult(data);
    } catch (err) {
      console.error(err);
      alert("Generation failed. Please try again.");
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyVariation = (v: any, index: number) => {
    const text = [v.headline, v.headline2, v.headline3, v.primaryText, v.description]
      .filter(Boolean)
      .join("\n");
    copyToClipboard(text, `v${index}`);
  };

  const copyAll = () => {
    if (!result?.variations) return;
    const text = result.variations
      .map((v: any, i: number) => `--- Variation ${i + 1}: ${v.angle} ---\n${[v.headline, v.headline2, v.headline3, v.primaryText, v.description].filter(Boolean).join("\n")}`)
      .join("\n\n");
    copyToClipboard(text, "all");
  };

  const scoreColor = (score: number) =>
    score >= 80 ? "text-sage" : score >= 60 ? "text-terracotta" : "text-red-500";

  const scoreBg = (score: number) =>
    score >= 80 ? "bg-sage" : score >= 60 ? "bg-terracotta" : "bg-red-500";

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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* LEFT — FORM */}
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Ad Generator</h1>
            <p className="text-sm text-ink-muted mb-6">Create high-converting ad copy for any platform. Get scored variations optimized for each platform.</p>

            {/* Platform Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {AD_PLATFORMS.map((p) => {
                const isLocked = !["Facebook / Instagram"].includes(p);
                return (
                  <button
                    key={p}
                    onClick={() => setFormData({ ...formData, platform: p })}
                    className={`px-4 py-2 text-xs font-bold rounded-full border transition ${
                      formData.platform === p
                        ? "bg-terracotta text-white border-terracotta"
                        : isLocked
                        ? "bg-cream-dark text-ink-faint border-border cursor-pointer"
                        : "bg-white text-ink-muted border-border hover:border-ink-faint"
                    }`}
                  >
                    {p}{isLocked ? " 🔒" : ""}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Product Name *</label>
                <input name="productName" value={formData.productName} onChange={handleChange} placeholder="e.g. Bamboo Wireless Charging Pad" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Product Description</label>
                <textarea name="productDescription" value={formData.productDescription} onChange={handleChange} rows={3} placeholder="Key features, benefits, what makes it special..." className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Campaign Goal</label>
                  <select name="goal" value={formData.goal} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition">
                    {GOALS.map((g) => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Tone</label>
                  <select name="tone" value={formData.tone} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition">
                    {TONES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Price</label>
                  <input name="price" value={formData.price} onChange={handleChange} placeholder="$29.99" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Offer / Promotion</label>
                  <input name="offer" value={formData.offer} onChange={handleChange} placeholder="e.g. 20% off, free shipping" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Target Audience</label>
                <input name="audience" value={formData.audience} onChange={handleChange} placeholder="e.g. Tech-savvy millennials, eco-conscious moms" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Keywords</label>
                <input name="keywords" value={formData.keywords} onChange={handleChange} placeholder="Keywords to include in the ads" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={loading || !formData.productName.trim()} className="mt-6 w-full py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? "Generating Ads..." : "Generate Ad Copy"}
            </button>
          </div>

          {/* RIGHT — RESULTS */}
          <div>
            {!result && !loading && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-border rounded-2xl p-12">
                <div className="text-center">
                  <div className="text-4xl mb-3">📣</div>
                  <p className="text-sm text-ink-muted">Your ad variations will appear here</p>
                  <p className="text-xs text-ink-faint mt-2">Scored and optimized for your chosen platform</p>
                </div>
              </div>
            )}

            {loading && (
              <div className="h-full flex items-center justify-center border-2 border-dashed border-terracotta/30 rounded-2xl p-12">
                <div className="text-center">
                  <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-ink-muted">Crafting your ad variations...</p>
                </div>
              </div>
            )}

            {result && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="font-display text-xl font-bold">Ad Variations</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-faint">{formData.platform}</span>
                    <button onClick={copyAll} className="px-4 py-2 text-xs font-bold bg-terracotta text-white rounded-full hover:bg-terracotta-deep transition">
                      {copied === "all" ? "Copied!" : "Copy All"}
                    </button>
                  </div>
                </div>

                {result.variations?.map((v: any, i: number) => (
                  <div key={i} className="bg-white border border-border rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-terracotta/10 text-terracotta text-[10px] font-bold flex items-center justify-center">{i + 1}</span>
                        <span className="text-xs font-bold text-ink-soft">{v.angle}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {v.overallScore ? (
                          <div className={`text-sm font-display font-bold ${scoreColor(v.overallScore)}`}>{v.overallScore}/100</div>
                        ) : (
                          <span className="text-[9px] text-ink-faint">🔒 Score</span>
                        )}
                        <button onClick={() => copyVariation(v, i)} className="text-[10px] font-bold text-ink-faint hover:text-ink transition">
                          {copied === `v${i}` ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </div>

                    {v.headline && (
                      <div className="mb-2">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-0.5">Headline</div>
                        <p className="text-sm font-semibold">{v.headline}</p>
                        <span className="text-[9px] text-ink-faint">{v.headline.length} chars</span>
                      </div>
                    )}
                    {v.headline2 && (
                      <div className="mb-2">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-0.5">Headline 2</div>
                        <p className="text-sm font-semibold">{v.headline2}</p>
                        <span className="text-[9px] text-ink-faint">{v.headline2.length} chars</span>
                      </div>
                    )}
                    {v.headline3 && (
                      <div className="mb-2">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-0.5">Headline 3</div>
                        <p className="text-sm font-semibold">{v.headline3}</p>
                        <span className="text-[9px] text-ink-faint">{v.headline3.length} chars</span>
                      </div>
                    )}
                    {v.primaryText && (
                      <div className="mb-2">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-0.5">Primary Text</div>
                        <p className="text-xs text-ink-soft leading-relaxed">{v.primaryText}</p>
                        <span className="text-[9px] text-ink-faint">{v.primaryText.length} chars</span>
                      </div>
                    )}
                    {v.description && (
                      <div className="mb-3">
                        <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-0.5">Description / CTA</div>
                        <p className="text-xs text-ink-soft">{v.description}</p>
                        <span className="text-[9px] text-ink-faint">{v.description.length} chars</span>
                      </div>
                    )}

                    {v.overallScore && (
                      <>
                        <div className="flex gap-4 mb-3 pt-3 border-t border-cream-dark">
                          <div className="flex-1">
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="font-bold text-ink-faint">Hook</span>
                              <span className={`font-bold ${scoreColor(v.hookScore)}`}>{v.hookScore}%</span>
                            </div>
                            <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${scoreBg(v.hookScore)}`} style={{ width: `${v.hookScore}%` }} />
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between text-[9px] mb-1">
                              <span className="font-bold text-ink-faint">CTA</span>
                              <span className={`font-bold ${scoreColor(v.ctaScore)}`}>{v.ctaScore}%</span>
                            </div>
                            <div className="h-1.5 bg-cream-dark rounded-full overflow-hidden">
                              <div className={`h-full rounded-full ${scoreBg(v.ctaScore)}`} style={{ width: `${v.ctaScore}%` }} />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {v.tip && (
                      <div className="bg-cream rounded-lg p-2.5">
                        <span className="text-[9px] font-bold text-terracotta">TIP: </span>
                        <span className="text-[11px] text-ink-muted">{v.tip}</span>
                      </div>
                    )}

                    {!v.overallScore && (
                      <div className="pt-3 border-t border-cream-dark">
                        <div className="bg-cream-dark rounded-lg p-3 text-center">
                          <span className="text-[10px] text-ink-faint">🔒 Ad scoring &amp; optimization tips available on Growth plan</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {result.platformTips && (
                  <div className="bg-white border border-border rounded-xl p-5">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-terracotta mb-3">{formData.platform} Tips</div>
                    {result.platformTips.map((tip: string, i: number) => (
                      <div key={i} className="flex items-start gap-2 text-xs mb-2">
                        <span className="text-terracotta mt-0.5">→</span>
                        <span className="text-ink-muted leading-relaxed">{tip}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button onClick={handleGenerate} className="w-full py-3 border border-border rounded-full text-sm font-bold text-ink-soft hover:border-ink-faint hover:text-ink transition">
                  Regenerate
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* UPGRADE MODAL */}
      {showUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-6 border border-border shadow-2xl">
            <div className="text-center">
              <div className="text-4xl mb-4">📣</div>
              <h2 className="font-display text-2xl font-bold mb-2">Unlock Full Ad Generator</h2>
              <p className="text-sm text-ink-muted mb-6">
                Upgrade to Growth for all 5 ad platforms, 4 scored variations per generation, optimization tips, and unlimited generations.
              </p>
              <div className="bg-cream rounded-xl p-4 mb-6 text-left">
                <div className="space-y-1.5">
                  <div className="text-xs text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Google Ads, TikTok, Pinterest, Amazon PPC</div>
                  <div className="text-xs text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>4 scored variations (vs 2 basic)</div>
                  <div className="text-xs text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Hook &amp; CTA scoring</div>
                  <div className="text-xs text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Optimization tips per variation</div>
                  <div className="text-xs text-ink-soft"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited generations</div>
                </div>
              </div>
              <button onClick={handleUpgrade} className="w-full py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg mb-3">
                Upgrade to Growth — $29/mo
              </button>
              <button onClick={() => setShowUpgrade(false)} className="w-full py-3 text-xs font-bold text-ink-faint hover:text-ink transition">Maybe later</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}