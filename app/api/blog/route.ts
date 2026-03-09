import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function isAdmin(authHeader: string): Promise<{ isAdmin: boolean; userId: string | null }> {
  const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
  if (error || !user) return { isAdmin: false, userId: null };

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  return { isAdmin: !!admin, userId: user.id };
}

// GET — fetch all posts (public gets published only, admin gets all)
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    let isAdminUser = false;

    if (authHeader) {
      const result = await isAdmin(authHeader);
      isAdminUser = result.isAdmin;
    }

    const query = supabase
      .from("blog_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (!isAdminUser) {
      query.eq("published", true);
    }

    const { data: posts, error } = await query;

    if (error) {
      return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
    }

    return NextResponse.json({ posts: posts || [], isAdmin: isAdminUser });
  } catch (error) {
    console.error("Blog error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// POST — create or update a post (admin only)
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { isAdmin: isAdminUser } = await isAdmin(authHeader);
    if (!isAdminUser) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();
    const { id, title, slug, description, content, category, cover_image, published, read_time } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    const autoSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    if (id) {
      // Update existing post
      const { data, error } = await supabase
        .from("blog_posts")
        .update({
          title,
          slug: autoSlug,
          description,
          content,
          category: category || "Guide",
          cover_image,
          published: published ?? false,
          read_time: read_time || "5 min read",
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
      }
      return NextResponse.json(data);
    } else {
      // Create new post
      const { data, error } = await supabase
        .from("blog_posts")
        .insert({
          title,
          slug: autoSlug,
          description,
          content,
          category: category || "Guide",
          cover_image,
          published: published ?? false,
          read_time: read_time || "5 min read",
        })
        .select()
        .single();

      if (error) {
        console.error("Insert error:", error);
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
      }
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error("Blog error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

// DELETE — delete a post (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { isAdmin: isAdminUser } = await isAdmin(authHeader);
    if (!isAdminUser) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const { id } = await req.json();

    const { error } = await supabase
      .from("blog_posts")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}