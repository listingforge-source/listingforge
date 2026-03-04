// Platform-specific rules and limits
export const PLATFORM_RULES: Record<string, {
  titleMax: number;
  titleMin: number;
  descMax: number;
  bulletCount: number;
  bulletMax: number;
  tagMax: number;
  tips: string[];
}> = {
  Shopify: {
    titleMax: 70,
    titleMin: 20,
    descMax: 5000,
    bulletCount: 5,
    bulletMax: 200,
    tagMax: 13,
    tips: [
      "Keep titles concise — Shopify truncates after ~70 chars in search",
      "Lead with lifestyle benefits, not just features",
      "Use storytelling in your description to build brand connection",
    ],
  },
  Amazon: {
    titleMax: 200,
    titleMin: 80,
    descMax: 2000,
    bulletCount: 5,
    bulletMax: 500,
    tagMax: 7,
    tips: [
      "Front-load your most important keywords in the title",
      "Each bullet should start with a CAPITALIZED benefit",
      "Amazon A9 algorithm weights title keywords most heavily",
      "Avoid promotional language like 'best seller' or 'guaranteed'",
    ],
  },
  Etsy: {
    titleMax: 140,
    titleMin: 40,
    descMax: 10000,
    bulletCount: 5,
    bulletMax: 300,
    tagMax: 13,
    tips: [
      "First 40 characters of your title matter most for Etsy search",
      "Use long-tail keywords that buyers actually search",
      "Tell the story behind your product — Etsy buyers value craft",
      "All 13 tags should be unique phrases, not single words",
    ],
  },
  eBay: {
    titleMax: 80,
    titleMin: 30,
    descMax: 4000,
    bulletCount: 5,
    bulletMax: 200,
    tagMax: 30,
    tips: [
      "Include brand, model, size, color, and condition in title",
      "eBay titles should be search-optimized, not creative",
      "Specificity beats cleverness — buyers search exact terms",
    ],
  },
  WooCommerce: {
    titleMax: 70,
    titleMin: 20,
    descMax: 5000,
    bulletCount: 5,
    bulletMax: 200,
    tagMax: 15,
    tips: [
      "Optimize title for Google SEO — it becomes the page title",
      "Use the focus keyword in the first 50 words of description",
      "Structure descriptions with clear sections for scannability",
    ],
  },
};

export interface SeoScore {
  overall: number;
  titleScore: number;
  descScore: number;
  bulletScore: number;
  tagScore: number;
  issues: { type: "error" | "warning" | "success"; message: string }[];
}

export function calculateSeoScore(
  platform: string,
  title: string,
  description: string,
  bullets: string[],
  tags: string[],
  keywords: string
): SeoScore {
  const rules = PLATFORM_RULES[platform] || PLATFORM_RULES["Shopify"];
  const issues: SeoScore["issues"] = [];
  let titleScore = 100;
  let descScore = 100;
  let bulletScore = 100;
  let tagScore = 100;

  const targetKeywords = keywords
    .split(",")
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);

  // === TITLE CHECKS ===
  const titleLen = title.length;

  if (titleLen > rules.titleMax) {
    titleScore -= 25;
    issues.push({
      type: "error",
      message: `Title is ${titleLen} chars — exceeds ${platform} limit of ${rules.titleMax}`,
    });
  } else if (titleLen > rules.titleMax * 0.9) {
    titleScore -= 10;
    issues.push({
      type: "warning",
      message: `Title is ${titleLen}/${rules.titleMax} chars — near the limit`,
    });
  } else {
    issues.push({
      type: "success",
      message: `Title length (${titleLen}/${rules.titleMax}) is optimal`,
    });
  }

  if (titleLen < rules.titleMin) {
    titleScore -= 20;
    issues.push({
      type: "warning",
      message: `Title is short (${titleLen} chars) — aim for at least ${rules.titleMin}`,
    });
  }

  // Check keywords in title
  if (targetKeywords.length > 0) {
    const titleLower = title.toLowerCase();
    const found = targetKeywords.filter((k) => titleLower.includes(k));
    const missing = targetKeywords.filter((k) => !titleLower.includes(k));
    const pct = found.length / targetKeywords.length;

    if (pct === 1) {
      issues.push({
        type: "success",
        message: `All ${found.length} target keywords found in title`,
      });
    } else if (pct >= 0.5) {
      titleScore -= 10;
      issues.push({
        type: "warning",
        message: `${found.length}/${targetKeywords.length} keywords in title — missing: ${missing.join(", ")}`,
      });
    } else {
      titleScore -= 25;
      issues.push({
        type: "error",
        message: `Only ${found.length}/${targetKeywords.length} keywords in title — missing: ${missing.join(", ")}`,
      });
    }
  }

  // === DESCRIPTION CHECKS ===
  const descLen = description.length;
  const wordCount = description.split(/\s+/).length;

  if (descLen > rules.descMax) {
    descScore -= 20;
    issues.push({
      type: "error",
      message: `Description exceeds ${platform} limit (${descLen}/${rules.descMax} chars)`,
    });
  }

  if (wordCount < 50) {
    descScore -= 20;
    issues.push({
      type: "warning",
      message: `Description is thin (${wordCount} words) — aim for 80+ words`,
    });
  } else if (wordCount >= 80) {
    issues.push({
      type: "success",
      message: `Description length (${wordCount} words) is solid`,
    });
  }

  // Check keywords in description
  if (targetKeywords.length > 0) {
    const descLower = description.toLowerCase();
    const found = targetKeywords.filter((k) => descLower.includes(k));
    const pct = found.length / targetKeywords.length;

    if (pct >= 0.75) {
      issues.push({
        type: "success",
        message: `${found.length}/${targetKeywords.length} keywords used in description`,
      });
    } else {
      descScore -= 15;
      const missing = targetKeywords.filter((k) => !descLower.includes(k));
      issues.push({
        type: "warning",
        message: `Description missing keywords: ${missing.join(", ")}`,
      });
    }
  }

  // === BULLET CHECKS ===
  if (bullets.length < rules.bulletCount) {
    bulletScore -= 20;
    issues.push({
      type: "warning",
      message: `Only ${bullets.length} bullets — ${platform} recommends ${rules.bulletCount}`,
    });
  } else {
    issues.push({
      type: "success",
      message: `${bullets.length} bullet points — good`,
    });
  }

  const longBullets = bullets.filter((b) => b.length > rules.bulletMax);
  if (longBullets.length > 0) {
    bulletScore -= 10;
    issues.push({
      type: "warning",
      message: `${longBullets.length} bullet(s) exceed ${rules.bulletMax} char limit`,
    });
  }

  // === TAG CHECKS ===
  if (tags.length < 5) {
    tagScore -= 25;
    issues.push({
      type: "error",
      message: `Only ${tags.length} tags — add more for better discoverability`,
    });
  } else if (tags.length >= rules.tagMax) {
    issues.push({
      type: "success",
      message: `Using ${tags.length}/${rules.tagMax} tag slots — maxed out`,
    });
  } else {
    issues.push({
      type: "success",
      message: `${tags.length} tags — consider adding up to ${rules.tagMax}`,
    });
  }

  // Duplicate tags check
  const uniqueTags = new Set(tags.map((t) => t.toLowerCase()));
  if (uniqueTags.size < tags.length) {
    tagScore -= 15;
    issues.push({
      type: "warning",
      message: `Found duplicate tags — each should be unique`,
    });
  }

  // Clamp scores
  titleScore = Math.max(0, Math.min(100, titleScore));
  descScore = Math.max(0, Math.min(100, descScore));
  bulletScore = Math.max(0, Math.min(100, bulletScore));
  tagScore = Math.max(0, Math.min(100, tagScore));

  const overall = Math.round(
    titleScore * 0.35 + descScore * 0.3 + bulletScore * 0.2 + tagScore * 0.15
  );

  return { overall, titleScore, descScore, bulletScore, tagScore, issues };
}