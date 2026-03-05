import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_LIMIT = 10;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("type", "analyzer")
      .gte("created_at", startOfMonth.toISOString());

    if ((count || 0) >= FREE_LIMIT) {
      return NextResponse.json({
        error: "Free plan allows 10 SEO analyses per month. Upgrade for unlimited.",
        limitReached: true,
        count: count || 0,
      }, { status: 403 });
    }

    // Log usage
    await supabase.from("usage").insert({ user_id: user.id, ip_address: ip, type: "analyzer" });

    return NextResponse.json({ count: (count || 0) + 1 });
  } catch (error) {
    console.error("Analyzer usage error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}