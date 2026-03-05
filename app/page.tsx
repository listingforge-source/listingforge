"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Home() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between bg-cream/85 backdrop-blur-xl border-b border-border">
        <div className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#features" className="hidden md:block text-xs font-semibold text-ink-muted hover:text-ink transition tracking-wide">Features</a>
          <a href="#how" className="hidden md:block text-xs font-semibold text-ink-muted hover:text-ink transition tracking-wide">How it works</a>
          <a href="#pricing" className="hidden md:block text-xs font-semibold text-ink-muted hover:text-ink transition tracking-wide">Pricing</a>
          <Link href="/auth?mode=login" className="hidden md:block text-xs font-bold text-ink-muted hover:text-ink transition">Log in</Link>
          <Link href="/auth?mode=signup" className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
            Start Free &rarr;
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-28 pb-20 relative overflow-hidden">
        <div className="absolute -top-24 -right-48 w-[600px] h-[600px] bg-terracotta/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-36 -left-36 w-[500px] h-[500px] bg-sage/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-terracotta/10 border border-terracotta/15 rounded-full text-[11px] font-bold text-terracotta uppercase tracking-widest mb-7 animate-fade-up">
            <span className="w-1.5 h-1.5 bg-terracotta rounded-full animate-pulse" />
            3-day free trial &mdash; All features unlocked
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-4xl mb-5 animate-fade-up [animation-delay:100ms]">
            Research, list, and{" "}
            <em className="text-terracotta italic">sell smarter</em>
          </h1>

          <p className="text-base md:text-lg text-ink-muted max-w-xl mx-auto mb-9 animate-fade-up [animation-delay:200ms]">
            The all-in-one platform for e-commerce sellers. Research products with real trend data, generate optimized listings, analyze SEO, and create high-converting ads &mdash; all in one place.
          </p>

          <div className="flex gap-3 justify-center flex-wrap animate-fade-up [animation-delay:300ms]">
            <Link href="/auth?mode=signup" className="px-8 py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
              Start 3-Day Free Trial
            </Link>
            <a href="#features" className="px-8 py-3.5 border border-border text-ink-soft text-sm font-medium rounded-full hover:border-ink-faint hover:text-ink transition">
              See all features
            </a>
          </div>

          <div className="flex gap-8 md:gap-12 justify-center mt-14 animate-fade-up [animation-delay:400ms]">
            <div className="text-center">
              <div className="font-display text-2xl font-bold">5 tools</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">In one platform</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold">5 platforms</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">Optimized for each</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold">47 sec</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">Per listing</div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold">Real data</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">Google Trends powered</div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="max-w-6xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-20 reveal">
          <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">Everything you need</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Five powerful tools. One subscription.</h2>
          <p className="text-sm text-ink-muted max-w-lg mx-auto">Stop juggling ChatGPT, Jungle Scout, and ad tools. ListingForge combines everything an e-commerce seller needs into one platform.</p>
        </div>

        <div className="space-y-8">
          {/* Feature 1 — Listing Generator */}
          <div className="grid md:grid-cols-2 gap-6 items-center bg-white border border-border rounded-2xl p-8 hover:shadow-lg transition reveal">
            <div>
              <div className="w-12 h-12 rounded-xl bg-terracotta/8 flex items-center justify-center text-2xl mb-4">✍️</div>
              <h3 className="font-display text-xl font-bold mb-2">AI Listing Generator</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">Generate platform-optimized titles, descriptions, bullet points, and SEO tags in seconds. Each listing follows the specific rules and character limits of your chosen marketplace.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Shopify</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Amazon</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Etsy</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">eBay</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">WooCommerce</span>
              </div>
            </div>
            <div className="bg-cream rounded-xl p-6 border border-border">
              <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-2">Sample output</div>
              <div className="text-xs font-bold mb-1">Title (Shopify optimized)</div>
              <p className="text-[11px] text-ink-muted mb-3">&quot;Bamboo Wireless Charger — Eco-Friendly Fast Charging Pad&quot;</p>
              <div className="text-xs font-bold mb-1">SEO Score</div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 bg-cream-dark rounded-full overflow-hidden"><div className="h-full bg-sage rounded-full" style={{width: "87%"}} /></div>
                <span className="text-xs font-bold text-sage">87/100</span>
              </div>
            </div>
          </div>

          {/* Feature 2 — SEO Analyzer */}
          <div className="grid md:grid-cols-2 gap-6 items-center bg-white border border-border rounded-2xl p-8 hover:shadow-lg transition reveal">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-sage/8 flex items-center justify-center text-2xl">🔍</div>
                <span className="px-2.5 py-0.5 bg-sage/15 text-sage text-[9px] font-extrabold uppercase tracking-wider rounded-full">10 Free / Month</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">SEO Analyzer</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">Paste any product listing — yours or a competitor&apos;s — and get an instant SEO score with platform-specific recommendations. Works with listings from any source, not just ListingForge.</p>
            </div>
            <div className="bg-cream rounded-xl p-6 border border-border">
              <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-3">Score breakdown</div>
              <div className="space-y-2">
                {[{label: "Title", score: 92}, {label: "Description", score: 78}, {label: "Bullets", score: 100}, {label: "Tags", score: 85}].map((s) => (
                  <div key={s.label} className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-ink-muted w-20">{s.label}</span>
                    <div className="h-2 flex-1 bg-cream-dark rounded-full overflow-hidden"><div className={`h-full rounded-full ${s.score >= 80 ? "bg-sage" : "bg-terracotta"}`} style={{width: `${s.score}%`}} /></div>
                    <span className={`text-[10px] font-bold ${s.score >= 80 ? "text-sage" : "text-terracotta"}`}>{s.score}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 3 — Product Research */}
          <div className="grid md:grid-cols-2 gap-6 items-center bg-white border border-border rounded-2xl p-8 hover:shadow-lg transition reveal">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/8 flex items-center justify-center text-2xl">🔬</div>
                <span className="px-2.5 py-0.5 bg-terracotta/10 text-terracotta text-[9px] font-extrabold uppercase tracking-wider rounded-full">Google Trends</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Product Research</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">Analyze any product idea before you invest. Get real Google Trends data, profitability estimates, competition analysis across all major platforms, seasonal demand patterns, and a clear go/no-go recommendation.</p>
              <p className="text-xs text-ink-muted">Unlike other tools that guess — our data comes from real search trends.</p>
            </div>
            <div className="bg-cream rounded-xl p-6 border border-border">
              <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-3">Sample report</div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold">&quot;Bamboo Sunglasses&quot;</span>
                <span className="text-lg font-display font-bold text-sage">78/100</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-white rounded-lg p-2"><div className="text-[8px] text-ink-faint font-bold">TREND</div><div className="text-xs font-bold text-sage">↑ Rising</div></div>
                <div className="bg-white rounded-lg p-2"><div className="text-[8px] text-ink-faint font-bold">MARGIN</div><div className="text-xs font-bold">65-75%</div></div>
                <div className="bg-white rounded-lg p-2"><div className="text-[8px] text-ink-faint font-bold">RISK</div><div className="text-xs font-bold text-sage">Low</div></div>
              </div>
            </div>
          </div>

          {/* Feature 4 — Ad Generator */}
          <div className="grid md:grid-cols-2 gap-6 items-center bg-white border border-border rounded-2xl p-8 hover:shadow-lg transition reveal">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/8 flex items-center justify-center text-2xl mb-4">📣</div>
              <h3 className="font-display text-xl font-bold mb-2">Ad Copy Generator</h3>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">Create high-converting ad copy for Facebook, Google, TikTok, Pinterest, and Amazon PPC. Get multiple variations scored for hook strength and CTA effectiveness, with platform-specific character limits enforced.</p>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Facebook</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Google</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">TikTok</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Pinterest</span>
                <span className="px-3 py-1 bg-cream border border-border rounded-full text-[10px] font-bold text-ink-muted">Amazon PPC</span>
              </div>
            </div>
            <div className="bg-cream rounded-xl p-6 border border-border">
              <div className="text-[9px] font-bold uppercase tracking-wider text-ink-faint mb-3">4 scored variations</div>
              <div className="space-y-2">
                {[{angle: "Benefit-Focused", score: 88}, {angle: "Problem-Solution", score: 82}, {angle: "Social Proof", score: 79}, {angle: "Urgency/FOMO", score: 85}].map((v) => (
                  <div key={v.angle} className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                    <span className="text-[10px] font-bold text-ink-muted">{v.angle}</span>
                    <span className={`text-[10px] font-bold ${v.score >= 80 ? "text-sage" : "text-terracotta"}`}>{v.score}/100</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 5 — Platform Intelligence */}
          <div className="bg-white border border-border rounded-2xl p-8 hover:shadow-lg transition text-center reveal">
            <div className="w-12 h-12 rounded-xl bg-purple-500/8 flex items-center justify-center text-2xl mb-4 mx-auto">📐</div>
            <h3 className="font-display text-xl font-bold mb-2">Platform Intelligence Built In</h3>
            <p className="text-sm text-ink-muted leading-relaxed max-w-lg mx-auto mb-6">Every tool in ListingForge understands the specific rules of each marketplace. Amazon&apos;s 200-character title limits, Etsy&apos;s long-tail keyword strategy, Shopify&apos;s SEO requirements — it&apos;s all handled automatically.</p>
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-cream border border-border flex items-center justify-center text-xl mx-auto mb-1">🛍️</div>
                <span className="text-[10px] font-bold text-ink-faint">Shopify</span>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-cream border border-border flex items-center justify-center text-xl mx-auto mb-1">📦</div>
                <span className="text-[10px] font-bold text-ink-faint">Amazon</span>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-cream border border-border flex items-center justify-center text-xl mx-auto mb-1">🧶</div>
                <span className="text-[10px] font-bold text-ink-faint">Etsy</span>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-cream border border-border flex items-center justify-center text-xl mx-auto mb-1">🏷️</div>
                <span className="text-[10px] font-bold text-ink-faint">eBay</span>
              </div>
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-cream border border-border flex items-center justify-center text-xl mx-auto mb-1">🌐</div>
                <span className="text-[10px] font-bold text-ink-faint">WooCommerce</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="bg-white border-y border-border">
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-24">
          <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">How it works</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-14">The complete seller workflow</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="relative p-6 border-2 border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300 reveal" style={{transitionDelay: "0ms"}}>
              <div className="w-8 h-8 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center mb-4">1</div>
              <div className="text-2xl mb-3">🔬</div>
              <h3 className="text-base font-bold mb-2">Research</h3>
              <p className="text-sm text-ink-muted leading-relaxed">Validate your product idea with real Google Trends data and market analysis.</p>
            </div>
            <div className="relative p-6 border-2 border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300 reveal" style={{transitionDelay: "100ms"}}>
              <div className="w-8 h-8 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center mb-4">2</div>
              <div className="text-2xl mb-3">✍️</div>
              <h3 className="text-base font-bold mb-2">Generate</h3>
              <p className="text-sm text-ink-muted leading-relaxed">Create optimized listings with AI-powered copy tailored to your marketplace.</p>
            </div>
            <div className="relative p-6 border-2 border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300 reveal" style={{transitionDelay: "200ms"}}>
              <div className="w-8 h-8 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center mb-4">3</div>
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="text-base font-bold mb-2">Optimize</h3>
              <p className="text-sm text-ink-muted leading-relaxed">Score and refine your listings with platform-specific SEO analysis.</p>
            </div>
            <div className="relative p-6 border-2 border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300 reveal" style={{transitionDelay: "300ms"}}>
              <div className="w-8 h-8 rounded-full bg-terracotta text-white text-xs font-bold flex items-center justify-center mb-4">4</div>
              <div className="text-2xl mb-3">📣</div>
              <h3 className="text-base font-bold mb-2">Promote</h3>
              <p className="text-sm text-ink-muted leading-relaxed">Generate scored ad copy for Facebook, Google, TikTok, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* FREE TOOL CTA */}
      <section className="max-w-4xl mx-auto px-10 md:px-12 py-24 text-center">
        <div className="bg-sage/8 rounded-2xl p-10 reveal-scale">
          <div className="text-3xl mb-4">🔍</div>
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">Try our SEO Analyzer — completely free</h2>
          <p className="text-sm text-ink-muted max-w-md mx-auto mb-6">Paste any product listing and get an instant SEO score with actionable recommendations. No sign up required to see the value.</p>
          <Link href="/auth?mode=signup" className="inline-block px-8 py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
            Analyze Your Listing Free &rarr;
          </Link>
        </div>
      </section>

      {/* TRIAL BANNER */}
      <section className="max-w-4xl mx-auto px-6 md:px-12 -mb-12 relative z-10">
        <div className="bg-ink rounded-2xl p-10 text-center text-white shadow-xl reveal-scale">
          <h3 className="font-display text-3xl font-bold mb-3">Try everything free for 3 days</h3>
          <p className="text-sm text-white/60 mb-6 max-w-md mx-auto leading-relaxed">Sign up and instantly unlock all Growth features — unlimited listings, product research, ad generator, full scoring, and all platforms. No credit card required.</p>
          <Link href="/auth?mode=signup" className="inline-block px-8 py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:-translate-y-0.5 hover:shadow-lg transition">
            Start Your Free Trial &rarr;
          </Link>
        </div>
      </section>
      

      {/* PRICING */}
      <section id="pricing" className="bg-white border-y border-border">
        <div className="max-w-4xl mx-auto px-6 md:px-12 py-24 text-center">
          <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">Pricing</div>
          <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">Start free. Upgrade when you&apos;re hooked.</h2>
          <p className="text-sm text-ink-muted mb-12">No credit card required. Start selling smarter today.</p>

          <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            {/* Free */}
            <div className="p-8 bg-cream border border-border rounded-2xl reveal" style={{transitionDelay: "0ms"}}>
              <h3 className="text-lg font-bold mb-1">Starter</h3>
              <div className="font-display text-4xl font-bold text-ink mb-1">$0<span className="font-body text-sm font-normal text-ink-faint">/mo</span></div>
              <p className="text-sm text-ink-muted mb-5">Get started for free</p>
              <ul className="space-y-2.5 mb-7">
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>5 listings per month</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>SEO Analyzer (10/month)</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>1 product research per month</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>2 ad generations per month</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Facebook/Instagram ads only</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>All 5 e-commerce platforms</li>
              </ul>
              <Link href="/auth?mode=signup" className="block text-center px-6 py-3 border border-border rounded-full text-sm font-bold text-ink-soft hover:border-ink-faint hover:text-ink transition">
                Start Free
              </Link>
            </div>

            {/* Growth */}
            <div className="p-8 bg-white border-2 border-terracotta rounded-2xl relative shadow-[0_0_40px_rgba(196,98,45,0.08)] reveal" style={{transitionDelay: "150ms"}}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-terracotta text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full">Most Popular</div>
              <h3 className="text-lg font-bold mb-1">Growth</h3>
              <div className="font-display text-4xl font-bold text-terracotta mb-1">$29<span className="font-body text-sm font-normal text-ink-faint">/mo</span></div>
              <p className="text-xs text-ink-muted mb-1">For serious sellers</p>
              <p className="text-xs text-sage font-bold mb-5">or $18.85/mo billed yearly (save 35%)</p>
              <ul className="space-y-2.5 mb-7">
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited listings</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited product research</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited ad generations</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>All 5 ad platforms unlocked</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>4 scored ad variations</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Hook &amp; CTA scoring</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Google Trends data</li>
                <li className="text-sm text-ink-muted"><span className="text-sage font-bold mr-2">&#10003;</span>Priority generation speed</li>
              </ul>
              <Link href="/auth?mode=signup" className="block text-center px-6 py-3 bg-terracotta text-white rounded-full text-sm font-bold hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
                Start Free Trial &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl font-bold tracking-tight">Frequently asked questions</h2>
        </div>
        <div className="space-y-4 reveal">
          {[
            {q: "How is this better than just using ChatGPT?", a: "ChatGPT doesn't know Amazon's 200-character title limit, Etsy's long-tail keyword strategy, or Shopify's SEO rules. ListingForge enforces platform-specific constraints, scores your listings, and provides real Google Trends data for product research — things a general AI chat simply can't do."},
            {q: "What platforms do you support?", a: "For listings: Shopify, Amazon, Etsy, eBay, and WooCommerce. For ads: Facebook/Instagram, Google Ads, TikTok Ads, Pinterest Ads, and Amazon PPC. Each platform gets optimized copy following its specific rules."},
            {q: "Is the product research data real?", a: "Yes. Our product research tool pulls real Google Trends data to show actual search interest, seasonal patterns, and trend direction. This is combined with AI analysis for profitability estimates and competition assessment."},
            {q: "Can I use it for free?", a: "Absolutely. The Starter plan gives you 5 listings per month, 10 SEO analyses, 1 product research, and 2 ad generations — all free, no credit card required. Plus a 3-day trial of all Growth features when you sign up."},            {q: "What if I already have listings written?", a: "Perfect — use our SEO Analyzer. Paste any existing listing and get an instant score with specific recommendations for improvement. It works with listings from any source."},
            {q: "Can I cancel anytime?", a: "Yes. Cancel your Growth subscription anytime from the billing page. You'll keep access until the end of your billing period, then revert to the free Starter plan."},
          ].map((item, i) => (
            <div key={i} className="border border-border rounded-xl p-5 bg-white">
              <h3 className="text-sm font-bold mb-2">{item.q}</h3>
              <p className="text-xs text-ink-muted leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-ink text-white py-20 reveal">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Ready to sell smarter?</h2>
          <p className="text-sm text-white/60 mb-8 max-w-md mx-auto">Join thousands of sellers using ListingForge to research products, write better listings, and create ads that convert.</p>
          <Link href="/auth?mode=signup" className="inline-block px-10 py-4 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
            Start 3-Day Free Trial &rarr;
          </Link>
        </div>
      </section>

      {/* CONTACT */}
      <section className="max-w-2xl mx-auto px-6 md:px-12 py-24">
        <div className="text-center mb-10">
          <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">Get in touch</div>
          <h2 className="font-display text-3xl font-bold tracking-tight mb-3">Have a question?</h2>
          <p className="text-sm text-ink-muted">We&apos;d love to hear from you. Send us a message and we&apos;ll get back within 24 hours.</p>
        </div>
        <form action="https://formspree.io/f/mgonwdpe" method="POST" className="bg-white border border-border rounded-2xl p-8 space-y-4 reveal">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Name</label>
              <input type="text" name="name" required placeholder="Your name" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-ink-soft mb-1.5">Email</label>
              <input type="email" name="email" required placeholder="you@example.com" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1.5">Subject</label>
            <select name="subject" className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition">
              <option>General Question</option>
              <option>Feature Request</option>
              <option>Bug Report</option>
              <option>Billing / Account</option>
              <option>Partnership Inquiry</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-ink-soft mb-1.5">Message</label>
            <textarea name="message" required rows={4} placeholder="Tell us what's on your mind..." className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition resize-none" />
          </div>
          <button type="submit" className="w-full py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
            Send Message
          </button>
          <p className="text-[10px] text-ink-faint text-center">We typically respond within 24 hours.</p>
        </form>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center border-t border-border">
        <div className="font-display text-lg font-bold tracking-tight mb-2">
          Listing<span className="text-terracotta">Forge</span>
        </div>
        <p className="text-xs text-ink-faint">
          &copy; 2026 ListingForge. Built for sellers who&apos;d rather sell than write.
        </p>
      </footer>
    </>
  );
}