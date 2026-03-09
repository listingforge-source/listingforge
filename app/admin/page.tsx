"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "../lib/supabase";

export default function AdminPage() {
  const [authChecked, setAuthChecked] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    content: "",
    category: "Guide",
    cover_image: "",
    published: false,
    read_time: "5 min read",
  });

  const supabase = createClient();

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch("/api/blog", {
        headers: { Authorization: `Bearer ${session.session?.access_token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setIsAdmin(data.isAdmin);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        window.location.href = "/auth";
        return;
      }
      setAuthChecked(true);
      fetchPosts();
    };
    checkAuth();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({
          ...form,
          id: editing?.id || undefined,
        }),
      });
      if (res.ok) {
        setEditing(null);
        setForm({
          title: "",
          slug: "",
          description: "",
          content: "",
          category: "Guide",
          cover_image: "",
          published: false,
          read_time: "5 min read",
        });
        fetchPosts();
      } else {
        const data = await res.json();
        alert(data.error || "Failed to save");
      }
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleEdit = (post: any) => {
    setEditing(post);
    setForm({
      title: post.title,
      slug: post.slug,
      description: post.description || "",
      content: post.content,
      category: post.category || "Guide",
      cover_image: post.cover_image || "",
      published: post.published,
      read_time: post.read_time || "5 min read",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    try {
      const { data: session } = await supabase.auth.getSession();
      await fetch("/api/blog", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.session?.access_token}`,
        },
        body: JSON.stringify({ id }),
      });
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({
      title: "",
      slug: "",
      description: "",
      content: "",
      category: "Guide",
      cover_image: "",
      published: false,
      read_time: "5 min read",
    });
  };

  if (!authChecked || loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-terracotta border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="font-display text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-sm text-ink-muted mb-4">You don&apos;t have admin access.</p>
          <Link href="/app" className="text-xs font-bold text-terracotta hover:underline">Go to Dashboard</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <nav className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-border bg-white">
        <Link href="/" className="font-display text-xl font-bold tracking-tight">
          Listing<span className="text-terracotta">Forge</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/app" className="text-xs font-bold text-ink-muted hover:text-ink transition">Dashboard</Link>
          <Link href="/blog" className="text-xs font-bold text-ink-muted hover:text-ink transition">View Blog</Link>
          <span className="px-2.5 py-0.5 bg-terracotta/10 text-terracotta text-[9px] font-extrabold uppercase rounded-full">Admin</span>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold mb-1">Blog Admin</h1>
            <p className="text-sm text-ink-muted">Create, edit, and manage blog posts.</p>
          </div>
          {!editing && (
            <button
              onClick={() => setEditing({})}
              className="px-5 py-2.5 bg-terracotta text-white text-xs font-bold rounded-full hover:bg-terracotta-deep transition"
            >
              + New Post
            </button>
          )}
        </div>

        {/* EDITOR */}
        {editing !== null && (
          <div className="bg-white border border-border rounded-2xl p-6 mb-8">
            <h2 className="font-display text-xl font-bold mb-4">{editing?.id ? "Edit Post" : "New Post"}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") })}
                  placeholder="Post title"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Slug</label>
                  <input
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="auto-generated-from-title"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  >
                    <option>Guide</option>
                    <option>Tutorial</option>
                    <option>Tips</option>
                    <option>Case Study</option>
                    <option>Product Update</option>
                    <option>Industry News</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Description (SEO)</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Brief description for search results and social sharing"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Cover Image URL</label>
                  <input
                    value={form.cover_image}
                    onChange={(e) => setForm({ ...form, cover_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink-soft mb-1.5">Read Time</label>
                  <input
                    value={form.read_time}
                    onChange={(e) => setForm({ ...form, read_time: e.target.value })}
                    placeholder="5 min read"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft mb-1.5">Content * (HTML supported)</label>
                <textarea
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  rows={20}
                  placeholder="Write your blog post content here. HTML tags are supported for formatting."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:border-terracotta transition resize-y font-mono text-xs leading-relaxed"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 rounded border-border text-terracotta focus:ring-terracotta"
                  />
                  <span className="text-sm font-bold text-ink-soft">Publish immediately</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving || !form.title || !form.content}
                  className="px-6 py-3 bg-terracotta text-white text-sm font-bold rounded-full hover:bg-terracotta-deep transition disabled:opacity-50"
                >
                  {saving ? "Saving..." : editing?.id ? "Update Post" : "Create Post"}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-6 py-3 border border-border text-sm font-bold text-ink-soft rounded-full hover:border-ink-faint transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* POSTS LIST */}
        <div className="space-y-3">
          {posts.length === 0 && !editing && (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
              <div className="text-4xl mb-3">📝</div>
              <p className="text-sm text-ink-muted mb-2">No blog posts yet</p>
              <button onClick={() => setEditing({})} className="text-xs font-bold text-terracotta hover:underline">
                Create your first post
              </button>
            </div>
          )}

          {posts.map((post) => (
            <div key={post.id} className="bg-white border border-border rounded-xl p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-bold">{post.title}</h3>
                  {post.published ? (
                    <span className="px-2 py-0.5 bg-sage/15 text-sage text-[8px] font-extrabold uppercase rounded-full">Published</span>
                  ) : (
                    <span className="px-2 py-0.5 bg-cream-dark text-ink-faint text-[8px] font-extrabold uppercase rounded-full">Draft</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink-faint">{post.category}</span>
                  <span className="text-[10px] text-ink-faint">·</span>
                  <span className="text-[10px] text-ink-faint">{new Date(post.created_at).toLocaleDateString()}</span>
                  <span className="text-[10px] text-ink-faint">·</span>
                  <span className="text-[10px] text-ink-faint font-mono">/blog/{post.slug}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/blog/${post.slug}`} className="px-3 py-1.5 text-[10px] font-bold text-ink-faint hover:text-ink border border-border rounded-full transition">
                  View
                </Link>
                <button onClick={() => handleEdit(post)} className="px-3 py-1.5 text-[10px] font-bold text-terracotta hover:text-terracotta-deep border border-terracotta/20 rounded-full transition">
                  Edit
                </button>
                <button onClick={() => handleDelete(post.id)} className="px-3 py-1.5 text-[10px] font-bold text-red-500 hover:text-red-700 border border-red-200 rounded-full transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}