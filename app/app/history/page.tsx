"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../../lib/supabase";

export default function HistoryPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [isPaid, setIsPaid] = useState(false);
  const [limit, setLimit] = useState(3);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth";
        return;
      }
      setAuthChecked(true);

      try {
        const { data: session } = await supabase.auth.getSession();
        const res = await fetch("/api/history", {
          headers: { Authorization: `Bearer ${session.session?.access_token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setListings(data.listings || []);
          setIsPaid(data.isPaid);
          setLimit(data.limit);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const copyListing = (listing: any) => {
    const text = `TITLE:\n${listing.title}\n\nDESCRIPTION:\n${listing.description}\n\nBULLET POINTS:\n${listing.bullets?.map((b: string) => `• ${b}`).join("\n")}\n\nSEO TAGS:\n${listing.tags?.join(", ")}`;
    copyToClipboard(text, listing.id);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const platformEmoji: Record<string, string> = {
    Shopify: "🛍️",
    Amazon: "📦",
    Etsy: "🧶",
    eBay: "🏷️",
    WooCommerce: "🌐",
  };

  if (!authChecked || loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">Listing History</h1>
          <p className="text-sm text-ink-muted">
            {isPaid ? "All your generated listings" : `Your last ${limit} listings. Upgrade for full history.`}
          </p>
        </div>
        <Link
          href="/app/generate"
          className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition"
        >
          New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl">
          <div className="text-4xl mb-3">📝</div>
          <p className="text-sm text-ink-muted mb-2">No listings yet</p>
          <p className="text-xs text-ink-faint mb-4">Generated listings will appear here automatically</p>
          <Link href="/app/generate" className="inline-block px-6 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition">
            Generate Your First Listing
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white border border-border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === listing.id ? null : listing.id)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-cream/50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{platformEmoji[listing.platform] || "🌐"}</span>
                  <div>
                    <div className="text-sm font-bold">{listing.product_name || listing.title}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-ink-faint font-mono">{listing.platform}</span>
                      <span className="text-[10px] text-ink-faint">·</span>
                      <span className="text-[10px] text-ink-faint">{formatDate(listing.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => { e.stopPropagation(); copyListing(listing); }}
                    className="px-3 py-1.5 text-[10px] font-bold text-ink-faint hover:text-ink border border-border rounded-full transition"
                  >
                    {copied === listing.id ? "Copied!" : "Copy All"}
                  </button>
                  <span className="text-ink-faint text-sm">{expanded === listing.id ? "−" : "+"}</span>
                </div>
              </button>

              {expanded === listing.id && (
                <div className="px-5 pb-5 border-t border-border pt-4 space-y-4">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">Title</div>
                    <p className="text-sm font-semibold">{listing.title}</p>
                  </div>

                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">Description</div>
                    <p className="text-xs text-ink-soft leading-relaxed whitespace-pre-line">{listing.description}</p>
                  </div>

                  {listing.bullets && (
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">Bullet Points</div>
                      <ul className="space-y-1">
                        {listing.bullets.map((b: string, i: number) => (
                          <li key={i} className="text-xs text-ink-soft">• {b}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {listing.tags && (
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-terracotta mb-1">SEO Tags</div>
                      <div className="flex flex-wrap gap-1.5">
                        {listing.tags.map((tag: string, i: number) => (
                          <span key={i} className="px-2.5 py-0.5 bg-cream border border-border rounded-full text-[10px] text-ink-muted">{tag}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Link
                      href={`/app/generate?product=${encodeURIComponent(listing.product_name || "")}&platform=${encodeURIComponent(listing.platform || "")}`}
                      className="px-4 py-2 text-xs font-bold border border-border rounded-full hover:border-ink-faint transition"
                    >
                      Regenerate
                    </Link>
                    <button
                      onClick={() => copyListing(listing)}
                      className="px-4 py-2 text-xs font-bold bg-terracotta text-white rounded-full hover:bg-terracotta-deep transition"
                    >
                      {copied === listing.id ? "Copied!" : "Copy All"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {!isPaid && listings.length >= limit && (
            <div className="bg-cream-dark rounded-xl p-6 text-center">
              <p className="text-sm text-ink-muted mb-3">Free plan shows your last {limit} listings. Upgrade to see your full history.</p>
              <Link href="/app/billing" className="inline-block px-6 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition">
                Upgrade to Growth
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}