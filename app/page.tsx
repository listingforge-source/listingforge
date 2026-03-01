import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between bg-cream/85 backdrop-blur-xl border-b border-border">
        <div className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#how" className="hidden md:block text-xs font-semibold text-ink-muted hover:text-ink transition tracking-wide">
            How it works
          </a>
          <a href="#pricing" className="hidden md:block text-xs font-semibold text-ink-muted hover:text-ink transition tracking-wide">
            Pricing
          </a>
          <Link
            href="/app"
            className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg"
          >
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
            Beta &mdash; Free during launch
          </div>

          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.08] max-w-3xl mb-5 animate-fade-up [animation-delay:100ms]">
            Product listings that{" "}
            <em className="text-terracotta italic">actually sell</em>
          </h1>

          <p className="text-base md:text-lg text-ink-muted max-w-lg mx-auto mb-9 animate-fade-up [animation-delay:200ms]">
            Drop in your product details. Get platform-optimized titles,
            descriptions, bullet points, and SEO tags &mdash; in seconds, not hours.
          </p>

          <div className="flex gap-3 justify-center animate-fade-up [animation-delay:300ms]">
            <Link
              href="/app"
              className="px-8 py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Generate Your First Listing
            </Link>
            <a
              href="#how"
              className="px-8 py-3.5 border border-border text-ink-soft text-sm font-medium rounded-full hover:border-ink-faint hover:text-ink transition"
            >
              See how it works
            </a>
          </div>

          <div className="flex gap-12 justify-center mt-14 animate-fade-up [animation-delay:400ms]">
            <div className="text-center">
              <div className="font-display text-2xl font-bold">12,400+</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">
                Listings generated
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold">3.2x</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">
                Avg. click increase
              </div>
            </div>
            <div className="text-center">
              <div className="font-display text-2xl font-bold">47 sec</div>
              <div className="text-[10px] uppercase tracking-widest text-ink-faint font-semibold mt-0.5">
                Per listing
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="max-w-5xl mx-auto px-6 md:px-12 py-24">
        <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">
          How it works
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-14">
          Three steps. One minute. Done.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="relative p-8 border border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300">
            <div className="absolute top-5 right-6 font-display text-5xl font-bold text-cream-dark">01</div>
            <div className="w-11 h-11 rounded-xl bg-terracotta/8 flex items-center justify-center text-lg mb-5">📦</div>
            <h3 className="text-base font-bold mb-2">Describe your product</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Product name, a few details, and your target audience. That&apos;s it — no copywriting degree required.</p>
          </div>
          <div className="relative p-8 border border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300">
            <div className="absolute top-5 right-6 font-display text-5xl font-bold text-cream-dark">02</div>
            <div className="w-11 h-11 rounded-xl bg-sage/8 flex items-center justify-center text-lg mb-5">🎯</div>
            <h3 className="text-base font-bold mb-2">Choose your platform</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Shopify, Amazon, Etsy, eBay, or general. Each platform has different rules — we format for all of them.</p>
          </div>
          <div className="relative p-8 border border-border rounded-2xl bg-white hover:-translate-y-1 hover:shadow-xl hover:border-terracotta/20 transition-all duration-300">
            <div className="absolute top-5 right-6 font-display text-5xl font-bold text-cream-dark">03</div>
            <div className="w-11 h-11 rounded-xl bg-blue-500/8 flex items-center justify-center text-lg mb-5">✨</div>
            <h3 className="text-base font-bold mb-2">Get your listing</h3>
            <p className="text-sm text-ink-muted leading-relaxed">Optimized title, compelling description, bullet points, and SEO tags. Copy and paste. Start selling.</p>
          </div>
        </div>
      </section>

      {/* PLATFORMS */}
      <section className="py-20 text-center bg-white border-y border-border">
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-10">
          Optimized for every marketplace
        </h2>
        <div className="flex justify-center gap-10 md:gap-14 flex-wrap px-6">
          <div className="flex flex-col items-center gap-2.5 group">
            <div className="w-16 h-16 rounded-2xl bg-cream border border-border flex items-center justify-center text-2xl group-hover:border-terracotta group-hover:-translate-y-0.5 transition-all">🛍️</div>
            <span className="text-xs font-semibold text-ink-muted">Shopify</span>
          </div>
          <div className="flex flex-col items-center gap-2.5 group">
            <div className="w-16 h-16 rounded-2xl bg-cream border border-border flex items-center justify-center text-2xl group-hover:border-terracotta group-hover:-translate-y-0.5 transition-all">📦</div>
            <span className="text-xs font-semibold text-ink-muted">Amazon</span>
          </div>
          <div className="flex flex-col items-center gap-2.5 group">
            <div className="w-16 h-16 rounded-2xl bg-cream border border-border flex items-center justify-center text-2xl group-hover:border-terracotta group-hover:-translate-y-0.5 transition-all">🧶</div>
            <span className="text-xs font-semibold text-ink-muted">Etsy</span>
          </div>
          <div className="flex flex-col items-center gap-2.5 group">
            <div className="w-16 h-16 rounded-2xl bg-cream border border-border flex items-center justify-center text-2xl group-hover:border-terracotta group-hover:-translate-y-0.5 transition-all">🏷️</div>
            <span className="text-xs font-semibold text-ink-muted">eBay</span>
          </div>
          <div className="flex flex-col items-center gap-2.5 group">
            <div className="w-16 h-16 rounded-2xl bg-cream border border-border flex items-center justify-center text-2xl group-hover:border-terracotta group-hover:-translate-y-0.5 transition-all">🌐</div>
            <span className="text-xs font-semibold text-ink-muted">WooCommerce</span>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="max-w-3xl mx-auto px-6 md:px-12 py-24 text-center">
        <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">
          Pricing
        </div>
        <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-12">
          Start free. Upgrade when you&apos;re hooked.
        </h2>
        <div className="grid md:grid-cols-2 gap-6 text-left">
          {/* Free */}
          <div className="p-8 bg-white border border-border rounded-2xl">
            <h3 className="text-lg font-bold mb-1">Starter</h3>
            <div className="font-display text-4xl font-bold text-terracotta">
              $0<span className="font-body text-sm font-normal text-ink-faint">/mo</span>
            </div>
            <p className="text-sm text-ink-muted mb-5">Test the waters</p>
            <ul className="space-y-2 mb-7">
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>5 listings per month</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>All 5 platforms</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>SEO tags included</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>Copy to clipboard</li>
            </ul>
            <Link
              href="/app"
              className="block text-center px-6 py-3 border border-border rounded-full text-sm font-bold text-ink-soft hover:border-ink-faint hover:text-ink transition"
            >
              Start Free
            </Link>
          </div>

          {/* Pro */}
          <div className="p-8 bg-white border-2 border-terracotta rounded-2xl relative shadow-[0_0_40px_rgba(196,98,45,0.08)]">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-terracotta text-white text-[10px] font-extrabold uppercase tracking-widest rounded-full">
              Most Popular
            </div>
            <h3 className="text-lg font-bold mb-1">Growth</h3>
            <div className="font-display text-4xl font-bold text-terracotta">
              $29<span className="font-body text-sm font-normal text-ink-faint">/mo</span>
            </div>
            <p className="text-sm text-ink-muted mb-5">For active sellers</p>
            <ul className="space-y-2 mb-7">
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>Unlimited listings</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>Bulk generation (CSV upload)</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>Brand voice training</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>A/B title variants</li>
              <li className="text-sm text-ink-muted border-b border-cream-dark pb-2"><span className="text-sage font-bold mr-2">&#10003;</span>Priority speed</li>
            </ul>
            <Link
              href="/app"
              className="block text-center px-6 py-3 bg-terracotta text-white rounded-full text-sm font-bold hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              Start 7-Day Trial
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center border-t border-border">
        <p className="text-xs text-ink-faint">
          &copy; 2026 ListingForge. Built for sellers who&apos;d rather sell than write.
        </p>
      </footer>
    </>
  );
}
