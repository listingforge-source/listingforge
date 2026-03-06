import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: { user }, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (error || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    const isTrialActive = sub?.status === "trial" && sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
    const isPaid = sub?.status === "active" || isTrialActive;

    const limit = isPaid ? 100 : 3;

    const { data: listings, error: listError } = await supabase
      .from("listings")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (listError) {
      console.error("Listings error:", listError);
      return NextResponse.json({ error: "Failed to fetch listings" }, { status: 500 });
    }

    return NextResponse.json({
      listings: listings || [],
      isPaid,
      limit,
    });
  } catch (error) {
    console.error("History error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}