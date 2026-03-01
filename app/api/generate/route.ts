import { NextRequest, NextResponse } from "next/server";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productName, category, details, price, audience, keywords, tone, length, platform } = body;

    if (!productName) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const lengthGuide = length === "Short" ? "Keep descriptions under 80 words." : length === "Long" ? "Write detailed descriptions of 200+ words." : "Write descriptions of about 120-150 words.";

    const prompt = `You are an expert e-commerce copywriter. Generate a product listing optimized for ${platform}.

Product Name: ${productName}
${category ? `Category: ${category}` : ""}
${details ? `Details: ${details}` : ""}
${price ? `Price: ${price}` : ""}
${audience ? `Target Audience: ${audience}` : ""}
${keywords ? `SEO Keywords to include: ${keywords}` : ""}
Tone: ${tone}
${lengthGuide}

Platform-specific rules:
- Shopify: Focus on brand storytelling, lifestyle benefits, clean formatting
- Amazon: Front-load keywords in title (max 200 chars), feature-benefit bullet points, keyword-rich description
- Etsy: Warm, personal, handmade/artisan feel, story-driven, long-tail keywords
- eBay: Specific, detailed, condition-focused, search-optimized title
- WooCommerce: SEO-focused, clean HTML-friendly structure, conversion-optimized

Respond in this exact JSON format with no other text:
{
  "title": "optimized product title",
  "description": "compelling product description",
  "bullets": ["benefit point 1", "benefit point 2", "benefit point 3", "benefit point 4", "benefit point 5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7", "tag8"]
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
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI generation failed" }, { status: 500 });
    }

    const data = await response.json();
    const text = data.content[0].text;

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Failed to parse response" }, { status: 500 });
    }

    const listing = JSON.parse(jsonMatch[0]);
    return NextResponse.json(listing);
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

