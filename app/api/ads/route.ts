import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_LIMIT = 2;

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

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status, trial_ends_at")
      .eq("user_id", user.id)
      .single();

    const isTrialActive = sub?.status === "trial" && sub?.trial_ends_at && new Date(sub.trial_ends_at) > new Date();
    const isPaid = sub?.status === "active" || isTrialActive;

    if (!isPaid) {
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count } = await supabase
        .from("usage")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("type", "ads")
        .gte("created_at", startOfMonth.toISOString());

      if ((count || 0) >= FREE_LIMIT) {
        return NextResponse.json({
          error: "Free plan allows 2 ad generations per month. Upgrade to Growth for unlimited.",
          limitReached: true,
        }, { status: 403 });
      }
    }

    const body = await req.json();
    const { productName, productDescription, platform, goal, offer, tone, audience, price, keywords } = body;

    if (!productName || !platform) {
      return NextResponse.json({ error: "Product name and platform are required" }, { status: 400 });
    }

    const freePlatforms = ["Facebook / Instagram"];
    if (!isPaid && !freePlatforms.includes(platform)) {
      return NextResponse.json({
        error: `${platform} is available on the Growth plan. Free users can generate Facebook / Instagram ads.`,
        limitReached: true,
      }, { status: 403 });
    }

    const variationCount = isPaid ? 4 : 2;
    const includeScoring = isPaid;

    const scoringInstruction = includeScoring
      ? `For each variation include hookScore (0-100), ctaScore (0-100), overallScore (0-100), and a specific tip to improve performance.`
      : `Do NOT include hookScore, ctaScore, overallScore, or tip fields.`;

    const platformRules: Record<string, string> = {
      "Facebook / Instagram": `Generate ads optimized for Meta platforms:
- Primary text: 125 chars ideal, 250 max (include emoji sparingly)
- Headline: 40 chars max, punchy and benefit-driven
- Description: 30 chars max
- Generate ${variationCount} variations with different angles`,

      "Google Ads": `Generate Google Search ads:
- Headline 1: 30 chars max (include primary keyword)
- Headline 2: 30 chars max (include benefit)
- Headline 3: 30 chars max (CTA)
- Description 1: 90 chars max (expand on benefits)
- Description 2: 90 chars max (include CTA and offer)
- Generate ${variationCount} variations targeting different search intents`,

      "TikTok Ads": `Generate TikTok ad scripts:
- Hook (first 3 seconds): attention-grabbing opening line
- Body: 15-30 second script, conversational and trendy
- CTA: clear call to action
- Use casual, authentic language. No corporate speak.
- Generate ${variationCount} variations with different styles`,

      "Pinterest Ads": `Generate Pinterest ad copy:
- Title: 100 chars max, aspirational and keyword-rich
- Description: 500 chars max, inspiring and actionable
- Use lifestyle-focused, aspirational language
- Generate ${variationCount} variations with different visual angles`,

      "Amazon PPC": `Generate Amazon Sponsored Product ad copy:
- Headline: 50 chars max, keyword-front-loaded
- Custom description: 150 chars max
- Focus on search terms buyers actually use
- Generate ${variationCount} variations targeting different keyword groups`,
    };

    const variationExample = includeScoring
      ? `{
      "angle": "Angle name",
      "headline": "Main headline",
      "headline2": "Secondary headline if applicable",
      "headline3": "Third headline if applicable",
      "primaryText": "Main ad body copy",
      "description": "Short description or CTA",
      "hookScore": 85,
      "ctaScore": 78,
      "overallScore": 82,
      "tip": "One specific tip to improve this ad"
    }`
      : `{
      "angle": "Angle name",
      "headline": "Main headline",
      "headline2": "Secondary headline if applicable",
      "headline3": "Third headline if applicable",
      "primaryText": "Main ad body copy",
      "description": "Short description or CTA"
    }`;

    const prompt = `You are an expert digital advertising copywriter specializing in e-commerce. Generate high-converting ad copy for the following product.

Product: ${productName}
${productDescription ? `Description: ${productDescription}` : ""}
${price ? `Price: ${price}` : ""}
${audience ? `Target Audience: ${audience}` : ""}
${keywords ? `Keywords: ${keywords}` : ""}
Ad Platform: ${platform}
${goal ? `Campaign Goal: ${goal}` : ""}
${offer ? `Offer/Promotion: ${offer}` : ""}
Tone: ${tone || "Professional"}

${platformRules[platform] || `Generate ${variationCount} ad variations with different angles.`}

${scoringInstruction}
IMPORTANT: Strictly respect all character limits. Generate exactly ${variationCount} variations.

Respond ONLY in this exact JSON format with no other text:
{
  "variations": [
    ${variationExample}
  ],
  "platformTips": [
    "Platform-specific tip 1",
    "Platform-specific tip 2",
    "Platform-specific tip 3"
  ]
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
        max_tokens: 2048,
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

    await supabase.from("usage").insert({ user_id: user.id, ip_address: ip, type: "ads" });

    const result = JSON.parse(jsonMatch[0]);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Ads error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}