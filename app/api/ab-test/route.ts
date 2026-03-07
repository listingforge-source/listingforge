import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Fetch Amazon autocomplete suggestions
async function getAmazonSuggestions(keyword: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://completion.amazon.com/api/2017/suggestions?mid=ATVPDKIKX0DER&alias=aps&prefix=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data.suggestions?.map((s: any) => s.value) || [];
  } catch {
    return [];
  }
}

// Fetch Google autocomplete suggestions
async function getGoogleSuggestions(keyword: string): Promise<string[]> {
  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(keyword)}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return data[1] || [];
  } catch {
    return [];
  }
}

// Calculate readability score (Flesch-Kincaid simplified)
function readabilityScore(text: string): number {
  const words = text.split(/\s+/).length;
  const sentences = text.split(/[.!?]+/).filter(Boolean).length || 1;
  const syllables = text.split(/\s+/).reduce((count, word) => {
    return count + countSyllables(word);
  }, 0);
  const score = 206.835 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
  return Math.max(0, Math.min(100, Math.round(score)));
}

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, "");
  if (word.length <= 3) return 1;
  const vowels = word.match(/[aeiouy]+/g);
  let count = vowels ? vowels.length : 1;
  if (word.endsWith("e")) count--;
  return Math.max(1, count);
}

// Check how many search suggestions a title matches
function matchScore(title: string, suggestions: string[]): { matches: string[]; score: number } {
  const titleLower = title.toLowerCase();
  const matches = suggestions.filter((s) => {
    const sLower = s.toLowerCase();
    return titleLower.includes(sLower) || sLower.includes(titleLower.split(" ").slice(0, 3).join(" "));
  });
  const score = Math.min(100, matches.length * 20);
  return { matches, score };
}

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

    // Fetch real search data
    const searchTerm = productName || title.split(" ").slice(0, 4).join(" ");
    const [amazonSuggestions, googleSuggestions] = await Promise.all([
      getAmazonSuggestions(searchTerm),
      getGoogleSuggestions(searchTerm),
    ]);

    const searchDataContext = `
REAL SEARCH DATA (use this to inform your title variations):
Amazon Autocomplete Suggestions: ${amazonSuggestions.slice(0, 10).join(", ") || "none found"}
Google Autocomplete Suggestions: ${googleSuggestions.slice(0, 10).join(", ") || "none found"}

IMPORTANT: Incorporate words and phrases from these real search suggestions into your title variations. Titles that match actual search queries rank higher and get more clicks.`;

    const prompt = `You are an expert e-commerce copywriter specializing in A/B testing. Given this current product listing title, generate 3 alternative title variations optimized for ${platform}. Each variation should take a different approach.

Current Title: ${title}
Product: ${productName || ""}
Platform: ${platform}
${keywords ? `Target Keywords: ${keywords}` : ""}
${description ? `Description context: ${description.substring(0, 200)}` : ""}
${searchDataContext}

For each variation, provide:
1. The alternative title incorporating real search terms where possible
2. The strategy behind it
3. A click-through score estimate (0-100)
4. Why this variation might outperform the original
5. Which real search terms from the data above you incorporated

Also score the original title for comparison.

Respond ONLY in this exact JSON format with no other text:
{
  "originalScore": 75,
  "originalAnalysis": "Brief analysis of the original title's strengths and weaknesses",
  "variations": [
    {
      "title": "Alternative title 1",
      "strategy": "Strategy name (e.g. Keyword-First, Benefit-Led, Search-Matched)",
      "score": 82,
      "reason": "Why this might outperform the original",
      "charCount": 45,
      "searchTermsUsed": ["term1", "term2"]
    },
    {
      "title": "Alternative title 2",
      "strategy": "Strategy name",
      "score": 78,
      "reason": "Why this might outperform the original",
      "charCount": 52,
      "searchTermsUsed": ["term1"]
    },
    {
      "title": "Alternative title 3",
      "strategy": "Strategy name",
      "score": 85,
      "reason": "Why this might outperform the original",
      "charCount": 48,
      "searchTermsUsed": ["term1", "term2", "term3"]
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

    // Add real data analysis
    const originalReadability = readabilityScore(title);
    const originalAmazonMatch = matchScore(title, amazonSuggestions);
    const originalGoogleMatch = matchScore(title, googleSuggestions);

    result.dataInsights = {
      amazonSuggestions: amazonSuggestions.slice(0, 8),
      googleSuggestions: googleSuggestions.slice(0, 8),
      originalReadability,
      originalAmazonMatch: originalAmazonMatch.score,
      originalGoogleMatch: originalGoogleMatch.score,
      variations: result.variations.map((v: any) => ({
        readability: readabilityScore(v.title),
        amazonMatch: matchScore(v.title, amazonSuggestions).score,
        googleMatch: matchScore(v.title, googleSuggestions).score,
      })),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("AB test error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}