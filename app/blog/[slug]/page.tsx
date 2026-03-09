import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const revalidate = 60;

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const { data: post } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between bg-cream/85 backdrop-blur-xl border-b border-border">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/blog" className="text-xs font-semibold text-ink-muted hover:text-ink transition">Blog</Link>
          <Link href="/auth?mode=signup" className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition hover:-translate-y-0.5 hover:shadow-lg">
            Start Free &rarr;
          </Link>
        </div>
      </nav>

      <article className="max-w-3xl mx-auto px-6 md:px-12 pt-28 pb-20">
        <div className="mb-10">
          <Link href="/blog" className="text-xs font-bold text-terracotta hover:text-terracotta-deep transition mb-4 inline-block">&larr; Back to Blog</Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2.5 py-0.5 bg-terracotta/10 text-terracotta text-[9px] font-extrabold uppercase tracking-wider rounded-full">{post.category}</span>
            <span className="text-[10px] text-ink-faint">{new Date(post.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</span>
            <span className="text-[10px] text-ink-faint">·</span>
            <span className="text-[10px] text-ink-faint">{post.read_time}</span>
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight leading-tight mb-4">{post.title}</h1>
          {post.description && (
            <p className="text-base text-ink-muted leading-relaxed">{post.description}</p>
          )}
        </div>

        {post.cover_image && (
          <img src={post.cover_image} alt={post.title} className="w-full rounded-2xl mb-10 border border-border" />
        )}

        <div
          className="blog-content"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="bg-ink rounded-2xl p-8 text-center text-white mt-12">
          <h2 className="font-display text-2xl font-bold mb-3">Ready to start selling smarter?</h2>
          <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">Create your free account and generate your first optimized listing in under a minute.</p>
          <Link href="/auth?mode=signup" className="inline-block px-8 py-3.5 bg-terracotta text-white text-sm font-bold rounded-full hover:-translate-y-0.5 hover:shadow-lg transition">
            Start Your 3-Day Free Trial &rarr;
          </Link>
        </div>
      </article>

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