/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import googleTrends from "google-trends-api";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const FREE_LIMIT = 1;

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
        .eq("type", "research")
        .gte("created_at", startOfMonth.toISOString());

      if ((count || 0) >= FREE_LIMIT) {
        return NextResponse.json({
          error: "Free plan allows 1 product research per month. Upgrade to Growth for unlimited research.",
          limitReached: true,
        }, { status: 403 });
      }
    }

    const body = await req.json();
    const { productName, marketplace, niche, priceRange, sourcingMethod, targetAudience, competitorUrl, budget, experience, region } = body;

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    // Fetch Google Trends data
    let trendsData = null;
    try {
      const trendsResult = await googleTrends.interestOverTime({
        keyword: productName,
        startTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
        endTime: new Date(),
        geo: region === "United States" ? "US" : region === "Canada" ? "CA" : region === "United Kingdom" ? "GB" : region === "Australia" ? "AU" : "",
      });

      const parsed = JSON.parse(trendsResult);
      const timeline = parsed.default?.timelineData || [];

      const monthlyData: number[] = new Array(12).fill(0);
      const monthlyCounts: number[] = new Array(12).fill(0);

      timeline.forEach((point: any) => {
        const date = new Date(parseInt(point.time) * 1000);
        const month = date.getMonth();
        monthlyData[month] += point.value[0];
        monthlyCounts[month] += 1;
      });

      const monthlyAverages = monthlyData.map((total, i) =>
        monthlyCounts[i] > 0 ? Math.round(total / monthlyCounts[i]) : 0
      );

      const recentValues = timeline.slice(-13).map((p: any) => p.value[0]);
      const firstHalf = recentValues.slice(0, 6).reduce((a: number, b: number) => a + b, 0) / 6;
      const secondHalf = recentValues.slice(6).reduce((a: number, b: number) => a + b, 0) / Math.max(recentValues.length - 6, 1);
      const trendDirection = secondHalf > firstHalf * 1.1 ? "rising" : secondHalf < firstHalf * 0.9 ? "declining" : "stable";
      const trendChange = Math.round(((secondHalf - firstHalf) / firstHalf) * 100);

      trendsData = {
        monthlyAverages,
        trendDirection,
        trendChange,
        peakMonth: monthlyAverages.indexOf(Math.max(...monthlyAverages)),
        currentInterest: timeline[timeline.length - 1]?.value[0] || 0,
      };
    } catch (err) {
      console.error("Google Trends error:", err);
    }

    const trendsContext = trendsData
      ? `\n\nREAL GOOGLE TRENDS DATA (use this for your analysis):\n- Monthly search interest (Jan-Dec): ${trendsData.monthlyAverages.join(", ")}\n- Trend direction: ${trendsData.trendDirection} (${trendsData.trendChange > 0 ? "+" : ""}${trendsData.trendChange}% change)\n- Peak month index: ${trendsData.peakMonth} (0=Jan, 11=Dec)\n- Current interest level: ${trendsData.currentInterest}/100\n\nIMPORTANT: Use the REAL monthly search data above for the monthlyDemand array instead of estimating. Scale the values proportionally if needed.`
      : "";

    const prompt = `You are an expert e-commerce product research analyst. Analyze the following product idea and provide a comprehensive market research report.

Product: ${productName}
Primary Marketplace: ${marketplace}
${niche ? `Niche/Category: ${niche}` : ""}
${priceRange ? `Target Price Range: ${priceRange}` : ""}
${sourcingMethod ? `Sourcing Method: ${sourcingMethod}` : ""}
${targetAudience ? `Target Audience: ${targetAudience}` : ""}
${competitorUrl ? `Competitor/Reference: ${competitorUrl}` : ""}
${budget ? `Starting Budget: ${budget}` : ""}
${experience ? `Seller Experience: ${experience}` : ""}
${region ? `Selling Region: ${region}` : ""}${trendsContext}

Analyze this product across ALL major e-commerce platforms (Amazon, Etsy, eBay, Shopify/DTC, TikTok Shop, Walmart) even if one marketplace is selected as primary. Consider Google Trends patterns, seasonal demand cycles, and current market conditions.

Respond ONLY in this exact JSON format with no other text:
{
  "overallScore": 78,
  "verdict": "Short 1-2 sentence verdict on whether to pursue this product",
  "trend": {
    "direction": "rising",
    "score": 82,
    "summary": "2-3 sentence summary of search trend analysis",
    "peakMonths": ["November", "December"],
    "lowMonths": ["June", "July"],
    "yearOverYear": "+15% estimated growth"
  },
  "market": {
    "score": 70,
    "saturation": "moderate",
    "competitorCount": "estimated range like 500-2000",
    "bigBrandPresence": "low/medium/high",
    "summary": "2-3 sentences about competition landscape across platforms",
    "bestPlatform": "Which platform is best for this product and why (1 sentence)",
    "platformBreakdown": [
      {"platform": "Amazon", "fit": "high", "reason": "1 sentence"},
      {"platform": "Etsy", "fit": "medium", "reason": "1 sentence"},
      {"platform": "eBay", "fit": "low", "reason": "1 sentence"},
      {"platform": "Shopify/DTC", "fit": "medium", "reason": "1 sentence"},
      {"platform": "TikTok Shop", "fit": "high", "reason": "1 sentence"},
      {"platform": "Walmart", "fit": "low", "reason": "1 sentence"}
    ]
  },
  "profitability": {
    "score": 75,
    "estimatedRetailPrice": "$XX - $XX",
    "estimatedCost": "$XX - $XX",
    "estimatedMargin": "XX-XX%",
    "monthlyRevenueEstimate": "$X,XXX - $X,XXX at moderate volume",
    "summary": "2-3 sentences about profit potential"
  },
  "seasonal": {
    "score": 65,
    "type": "seasonal or evergreen",
    "summary": "2-3 sentences about seasonal patterns",
    "monthlyDemand": [30, 25, 35, 40, 45, 50, 45, 50, 60, 70, 90, 100]
  },
  "audience": {
    "score": 80,
    "primaryDemo": "Main demographic description",
    "secondaryDemo": "Secondary demographic",
    "buyingMotivation": "Why they buy this",
    "summary": "2-3 sentences about target audience"
  },
  "risks": {
    "score": 70,
    "level": "low/medium/high",
    "factors": [
      {"risk": "risk name", "severity": "low/medium/high", "detail": "1 sentence explanation"},
      {"risk": "risk name", "severity": "low/medium/high", "detail": "1 sentence explanation"},
      {"risk": "risk name", "severity": "low/medium/high", "detail": "1 sentence explanation"}
    ]
  },
  "nextSteps": [
    "Actionable step 1",
    "Actionable step 2",
    "Actionable step 3",
    "Actionable step 4"
  ],
  "nicheVariations": [
    "Niche variation idea 1 with brief explanation",
    "Niche variation idea 2 with brief explanation",
    "Niche variation idea 3 with brief explanation"
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
      return NextResponse.json({ error: "AI analysis failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    // Log usage
    await supabase.from("usage").insert({ user_id: user.id, ip_address: ip, type: "research" });

    const report = JSON.parse(jsonMatch[0]);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Research error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}