import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    const isTrialActive = sub?.status === "trial" && sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
    const isPaid = sub?.status === "active" || isTrialActive;

    if (!isPaid) {
      return NextResponse.json({
        error: "A/B Testing is a Growth feature. Upgrade to unlock title variations.",
        limitReached: true,
      }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, platform, keywords, productName } = body;

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const prompt = `You are an expert e-commerce copywriter specializing in A/B testing. Given this current product listing title, generate 3 alternative title variations optimized for ${platform}. Each variation should take a different approach.

Current Title: ${title}
Product: ${productName || ""}
Platform: ${platform}
${keywords ? `Target Keywords: ${keywords}` : ""}
${description ? `Description context: ${description.substring(0, 200)}` : ""}

For each variation, provide:
1. The alternative title
2. The strategy behind it (keyword-first, benefit-first, curiosity-driven, etc.)
3. A click-through score estimate (0-100)
4. Why this variation might outperform the original

Also score the original title for comparison.

Respond ONLY in this exact JSON format with no other text:
{
  "originalScore": 75,
  "originalAnalysis": "Brief analysis of the original title's strengths and weaknesses",
  "variations": [
    {
      "title": "Alternative title 1",
      "strategy": "Strategy name (e.g. Keyword-First, Benefit-Led, Curiosity Hook)",
      "score": 82,
      "reason": "Why this might outperform the original",
      "charCount": 45
    },
    {
      "title": "Alternative title 2",
      "strategy": "Strategy name",
      "score": 78,
      "reason": "Why this might outperform the original",
      "charCount": 52
    },
    {
      "title": "Alternative title 3",
      "strategy": "Strategy name",
      "score": 85,
      "reason": "Why this might outperform the original",
      "charCount": 48
    }
  ],
  "recommendation": "Which variation to test first and why (1-2 sentences)",
  "testingTip": "A practical A/B testing tip for this specific product category"
}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", response.status, err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("AB test error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}