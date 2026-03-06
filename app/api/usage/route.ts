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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count } = await supabase
      .from("usage")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", startOfMonth.toISOString());

    // Check for existing subscription
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    let plan = "free";
    let trialEndsAt = null;
    let trialDaysLeft = 0;

    if (!sub || (!sub.trial_ends_at && sub.status !== "active")) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

      // Check if this IP already used a trial
      const { count: ipTrialCount } = await supabase
        .from("subscriptions")
        .select("*", { count: "exact", head: true })
        .eq("ip_address", ip);

      if ((ipTrialCount || 0) >= 10) {
        // IP has too many trial accounts — give free plan instead
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            status: "free",
            ip_address: ip,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        plan = "free";
      } else {
        // Grant trial
        const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
        await supabase
          .from("subscriptions")
          .upsert({
            user_id: user.id,
            status: "trial",
            trial_ends_at: trialEnd.toISOString(),
            ip_address: ip,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" });
        plan = "trial";
        trialEndsAt = trialEnd.toISOString();
        trialDaysLeft = 3;
      }
    } else if (sub.status === "active") {
      plan = "growth";
    } else if (sub.status === "trial" && sub.trial_ends_at) {
      const trialEnd = new Date(sub.trial_ends_at);
      if (trialEnd > new Date()) {
        plan = "trial";
        trialEndsAt = sub.trial_ends_at;
        trialDaysLeft = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      } else {
        // Trial expired
        await supabase
          .from("subscriptions")
          .update({ status: "free", updated_at: new Date().toISOString() })
          .eq("user_id", user.id);
        plan = "free";
      }
    }

    return NextResponse.json({
      count: count || 0,
      plan,
      trialEndsAt,
      trialDaysLeft,
    });
  } catch (error) {
    console.error("Usage error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}