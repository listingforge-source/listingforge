import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 60;

export default async function BlogPage() {
  const { data: posts } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between bg-cream/85 backdrop-blur-xl border-b border-border">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/" className="text-xs font-semibold text-ink-muted hover:text-ink transition">Home</Link>
          <Link href="/blog" className="text-xs font-bold text-terracotta">Blog</Link>
          <Link href="/auth?mode=signup" className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
            Start Free &rarr;
          </Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 pt-28 pb-20">
        <div className="text-center mb-16">
          <div className="text-[11px] uppercase tracking-[3px] text-terracotta font-extrabold mb-3">Blog</div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-4">Insights for E-Commerce Sellers</h1>
          <p className="text-base text-ink-muted max-w-lg mx-auto">Tips, guides, and strategies to help you sell more with better listings, smarter research, and data-driven decisions.</p>
        </div>

        {(!posts || posts.length === 0) ? (
          <div className="text-center py-16">
            <p className="text-sm text-ink-muted">No posts yet. Check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block bg-white border border-border rounded-2xl overflow-hidden hover:border-terracotta/20 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
              >
                {post.cover_image && (
                  <img src={post.cover_image} alt={post.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="px-2.5 py-0.5 bg-terracotta/10 text-terracotta text-[9px] font-extrabold uppercase tracking-wider rounded-full">{post.category}</span>
                    <span className="text-[10px] text-ink-faint">{new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
                    <span className="text-[10px] text-ink-faint">·</span>
                    <span className="text-[10px] text-ink-faint">{post.read_time}</span>
                  </div>
                  <h2 className="font-display text-xl font-bold mb-2">{post.title}</h2>
                  <p className="text-sm text-ink-muted leading-relaxed">{post.description}</p>
                  <div className="mt-4 text-xs font-bold text-terracotta">Read more &rarr;</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      <footer className="py-10 text-center border-t border-border">
        <div className="font-display text-lg font-bold tracking-tight mb-3">
          Listing<span className="text-terracotta">Forge</span>
        </div>
        <div className="flex justify-center gap-6 mb-4">
          <Link href="/blog" className="text-xs text-ink-faint hover:text-ink transition">Blog</Link>
          <Link href="/terms" className="text-xs text-ink-faint hover:text-ink transition">Terms</Link>
          <Link href="/privacy" className="text-xs text-ink-faint hover:text-ink transition">Privacy</Link>
        </div>
        <p className="text-xs text-ink-faint">&copy; 2026 ListingForge.</p>
      </footer>
    </div>
  );
}