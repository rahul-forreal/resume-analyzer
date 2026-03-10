const crypto = require("crypto");

const keywordCategories = {
  technical: [
    "JavaScript",
    "TypeScript",
    "Python",
    "Java",
    "Go",
    "Rust",
    "React",
    "Next.js",
    "Node.js",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Kafka",
    "Docker",
    "Kubernetes",
    "AWS",
    "GCP",
    "Azure",
    "GraphQL",
    "CI/CD",
  ],
  product: [
    "Roadmap",
    "A/B testing",
    "User research",
    "Experimentation",
    "Stakeholder management",
    "Product strategy",
    "KPIs",
    "Growth",
  ],
  data: [
    "Machine Learning",
    "LLM",
    "Embeddings",
    "RAG",
    "Data pipelines",
    "Analytics",
    "Statistics",
    "Tableau",
    "Power BI",
  ],
};

const sectionSynonyms = {
  summary: ["summary", "profile", "about"],
  experience: ["experience", "work experience", "professional experience", "employment"],
  projects: ["projects", "selected projects"],
  skills: ["skills", "technical skills", "core competencies"],
  education: ["education", "academic background"],
  certifications: ["certifications", "licenses"],
  achievements: ["achievements", "accomplishments", "awards"],
};

const scoreWeights = {
  semanticMatch: 0.24,
  sectionIntelligence: 0.16,
  impactEvidence: 0.16,
  roleFit: 0.2,
  writingQuality: 0.12,
  contactCompleteness: 0.06,
  formatReadiness: 0.06,
};

async function analyzeResume(text, filename, jobDescription = "") {
  const cleanText = normalizeText(text);
  const sections = extractSections(cleanText);

  const semanticMatch = analyzeSemanticMatch(cleanText, jobDescription, sections);
  const sectionIntelligence = analyzeSectionIntelligence(sections);
  const impactEvidence = analyzeImpactEvidence(cleanText);
  const roleFit = analyzeRoleFit(cleanText, jobDescription);
  const writingQuality = analyzeWritingQuality(cleanText);
  const contactCompleteness = analyzeContactInfo(cleanText);
  const formatReadiness = analyzeFormat(filename, cleanText);

  const breakdown = {
    semanticMatch,
    sectionIntelligence,
    impactEvidence,
    roleFit,
    writingQuality,
    contactCompleteness,
    formatReadiness,
  };

  const overallScore = calculateOverallScore(breakdown);
  const recommendations = generateRecommendations(breakdown, sections, jobDescription);
  const strengths = identifyStrengths(breakdown);
  const extractedInfo = extractKeyInfo(cleanText, sections);
  const llmFeedback = await generateLLMFeedback({ overallScore, breakdown, recommendations, extractedInfo, jobDescription });

  return {
    overallScore,
    breakdown,
    recommendations,
    strengths,
    extractedInfo,
    llmFeedback,
  };
}

async function rankResumes(candidates, jobDescription = "") {
  const analyzed = await Promise.all(
    candidates.map(async (candidate) => {
      const analysis = await analyzeResume(candidate.text, candidate.filename, jobDescription);
      return {
        filename: candidate.filename,
        fileSize: candidate.fileSize,
        analysis,
      };
    })
  );

  const ranking = analyzed
    .map((item) => ({
      ...item,
      candidateScore: item.analysis.overallScore,
    }))
    .sort((a, b) => b.candidateScore - a.candidateScore)
    .map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

  return {
    ranking,
    topCandidate: ranking[0] || null,
    insights: {
      avgScore: ranking.length
        ? Math.round(ranking.reduce((sum, c) => sum + c.candidateScore, 0) / ranking.length)
        : 0,
      scoreSpread: ranking.length
        ? ranking[0].candidateScore - ranking[ranking.length - 1].candidateScore
        : 0,
    },
  };
}

function analyzeSemanticMatch(text, jobDescription, sections) {
  if (!jobDescription || jobDescription.trim().length < 30) {
    return {
      score: 55,
      details: "No job description provided; semantic score uses baseline resume signal.",
      similarity: 0.55,
      matchedConcepts: extractTopSkills(text).slice(0, 8),
    };
  }

  const resumeVector = embedText(text);
  const jdVector = embedText(jobDescription);
  const globalSimilarity = cosineSimilarity(resumeVector, jdVector);

  const skillsVector = embedText((sections.skills || "") + " " + (sections.projects || ""));
  const requirementsVector = embedText(jobDescription);
  const skillsSimilarity = cosineSimilarity(skillsVector, requirementsVector);

  const conceptOverlap = extractConceptOverlap(text, jobDescription);
  const weightedSimilarity = globalSimilarity * 0.6 + skillsSimilarity * 0.25 + conceptOverlap.coverage * 0.15;

  return {
    score: clampScore(Math.round(weightedSimilarity * 100)),
    details: "Hybrid semantic matching using lightweight embeddings + concept overlap.",
    similarity: Number(weightedSimilarity.toFixed(2)),
    matchedConcepts: conceptOverlap.matched,
    missingConcepts: conceptOverlap.missing.slice(0, 8),
  };
}

function embedText(input, dimensions = 256) {
  const tokens = tokenize(input);
  const vector = new Array(dimensions).fill(0);
  if (!tokens.length) return vector;

  for (const token of tokens) {
    const hash = crypto.createHash("sha256").update(token).digest();
    for (let i = 0; i < 4; i++) {
      const idx = hash.readUInt16BE(i * 2) % dimensions;
      const sign = hash[i + 8] % 2 === 0 ? 1 : -1;
      vector[idx] += sign * 1;
    }
  }

  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

function cosineSimilarity(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return Math.max(0, Math.min(1, dot));
}

function extractSections(text) {
  const lines = text
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  let currentSection = "summary";
  const sections = { summary: "" };

  for (const line of lines) {
    const lower = line.toLowerCase();
    const section = Object.entries(sectionSynonyms).find(([, synonyms]) =>
      synonyms.some((syn) => lower === syn || lower.startsWith(`${syn}:`))
    );

    if (section) {
      currentSection = section[0];
      if (!sections[currentSection]) sections[currentSection] = "";
      continue;
    }

    sections[currentSection] = `${sections[currentSection] || ""} ${line}`.trim();
  }

  return sections;
}

function analyzeSectionIntelligence(sections) {
  const requiredSections = ["summary", "experience", "skills", "education"];
  const bonusSections = ["projects", "certifications", "achievements"];
  const presentRequired = requiredSections.filter((key) => (sections[key] || "").length > 40);
  const presentBonus = bonusSections.filter((key) => (sections[key] || "").length > 20);

  const densityScore = Math.min(35, presentRequired.length * 8 + presentBonus.length * 3);
  const qualityScore = Math.min(
    65,
    requiredSections.reduce((sum, key) => sum + Math.min(16, Math.round(((sections[key] || "").split(/\s+/).length || 0) / 12)), 0)
  );

  return {
    score: clampScore(densityScore + qualityScore),
    details: "Section-level intelligence on completeness and depth.",
    foundSections: Object.keys(sections),
    missingCriticalSections: requiredSections.filter((key) => !presentRequired.includes(key)),
  };
}

function analyzeImpactEvidence(text) {
  const quantifications = [
    ...(text.match(/\b\d+%\b/g) || []),
    ...(text.match(/\$\s?\d+[\d,]*/g) || []),
    ...(text.match(/\b\d+\s?(users|customers|requests|transactions|ms|s|hrs|hours|days|weeks|months|years)\b/gi) || []),
  ];
  const actionVerbs = ["led", "built", "launched", "optimized", "improved", "designed", "shipped", "scaled", "automated", "reduced"];
  const actionCount = actionVerbs.filter((verb) => new RegExp(`\\b${verb}\\b`, "i").test(text)).length;

  return {
    score: clampScore(Math.min(100, quantifications.length * 9 + actionCount * 4 + 20)),
    details: "Measures quantified outcomes and ownership language.",
    quantifications: quantifications.length,
    actionVerbs: actionCount,
  };
}

function analyzeRoleFit(text, jobDescription) {
  const keywordMatches = analyzeKeywordCategories(text);
  if (!jobDescription || jobDescription.trim().length < 30) {
    return {
      score: clampScore(45 + Math.round((keywordMatches.totalMatched / 15) * 20)),
      details: "Role fit inferred from market-relevant skills due to missing JD.",
      matchedKeywords: keywordMatches.matchedKeywords,
    };
  }

  const jdConcepts = tokenize(jobDescription).filter((token) => token.length > 3);
  const resumeTokens = new Set(tokenize(text));
  const matched = [...new Set(jdConcepts.filter((token) => resumeTokens.has(token)))];

  const score = clampScore(Math.round((matched.length / Math.max(25, jdConcepts.length)) * 100) + 20);
  return {
    score,
    details: "Maps resume evidence to role requirements and priorities.",
    matchedKeywords: keywordMatches.matchedKeywords.slice(0, 15),
    requirementCoverage: Number((matched.length / Math.max(1, jdConcepts.length)).toFixed(2)),
  };
}

function analyzeWritingQuality(text) {
  const words = text.split(/\s+/).filter(Boolean);
  const avgSentenceLength = words.length / Math.max(1, text.split(/[.!?]+/).filter(Boolean).length);
  const hasBullets = /(^|\n)\s*[-•*]/m.test(text);

  let score = 45;
  if (words.length >= 250 && words.length <= 1100) score += 25;
  if (avgSentenceLength >= 9 && avgSentenceLength <= 24) score += 18;
  if (hasBullets) score += 12;

  return {
    score: clampScore(score),
    details: "Assesses readability, concise writing, and scannability.",
    wordCount: words.length,
    avgSentenceLength: Number(avgSentenceLength.toFixed(1)),
  };
}

function analyzeFormat(filename, text) {
  const isPdf = filename.toLowerCase().endsWith(".pdf");
  const isDocx = filename.toLowerCase().endsWith(".docx");
  const hasUnicodeNoise = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(text);

  let score = 60;
  if (isPdf) score += 20;
  if (isDocx) score += 16;
  if (!hasUnicodeNoise) score += 20;

  return {
    score: clampScore(score),
    fileType: filename.split(".").pop(),
    details: "ATS parsing readiness for modern recruiting pipelines.",
  };
}

function analyzeContactInfo(text) {
  const checks = {
    email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/i.test(text),
    phone: /\+?\d[\d\s().-]{8,}\d/.test(text),
    linkedin: /linkedin\.com\//i.test(text),
    githubOrPortfolio: /(github\.com\/|portfolio|behance\.net|dribbble\.com)/i.test(text),
    location: /\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(text),
  };

  const score = clampScore(Object.values(checks).filter(Boolean).length * 20);

  return {
    score,
    details: "Contact signal completeness for recruiter follow-up.",
    contactInfo: checks,
  };
}

function calculateOverallScore(breakdown) {
  const weighted = Object.entries(scoreWeights).reduce(
    (sum, [key, weight]) => sum + (breakdown[key]?.score || 0) * weight,
    0
  );
  return clampScore(Math.round(weighted));
}

function analyzeKeywordCategories(text) {
  const textLower = text.toLowerCase();
  const matchedKeywords = [];

  Object.entries(keywordCategories).forEach(([category, keywords]) => {
    keywords.forEach((keyword) => {
      if (textLower.includes(keyword.toLowerCase())) {
        matchedKeywords.push({ keyword, category });
      }
    });
  });

  return {
    totalMatched: matchedKeywords.length,
    matchedKeywords,
  };
}

function extractConceptOverlap(text, jobDescription) {
  const resumeTokens = new Set(tokenize(text));
  const jdTokens = [...new Set(tokenize(jobDescription).filter((t) => t.length > 3))];
  const matched = jdTokens.filter((token) => resumeTokens.has(token));
  const missing = jdTokens.filter((token) => !resumeTokens.has(token));

  return {
    coverage: matched.length / Math.max(1, jdTokens.length),
    matched: matched.slice(0, 15),
    missing,
  };
}

function generateRecommendations(breakdown, sections, jobDescription) {
  const recommendations = [];

  if (breakdown.semanticMatch.score < 70) {
    recommendations.push({
      priority: "high",
      category: "Semantic Alignment",
      suggestion: "Mirror the job's required outcomes and tools in your experience bullets to improve semantic relevance.",
    });
  }

  if (breakdown.sectionIntelligence.missingCriticalSections.length) {
    recommendations.push({
      priority: "high",
      category: "Resume Structure",
      suggestion: `Add missing critical sections: ${breakdown.sectionIntelligence.missingCriticalSections.join(", ")}.`,
    });
  }

  if (breakdown.impactEvidence.quantifications < 3) {
    recommendations.push({
      priority: "high",
      category: "Impact",
      suggestion: "Add 3-5 quantified outcomes (%, $, latency, users, revenue, conversion) across recent roles.",
    });
  }

  if (breakdown.roleFit.score < 68) {
    recommendations.push({
      priority: "medium",
      category: "Role Fit",
      suggestion: "Reorder bullets so the top 3 requirements from the job description are proven in the first page.",
    });
  }

  if (!jobDescription) {
    recommendations.push({
      priority: "low",
      category: "Targeting",
      suggestion: "Paste a job description for more accurate semantic matching and ranking.",
    });
  }

  if ((sections.projects || "").length < 40) {
    recommendations.push({
      priority: "medium",
      category: "Projects",
      suggestion: "Add one project with architecture, stack, and business impact to stand out in product interviews.",
    });
  }

  return recommendations;
}

function identifyStrengths(breakdown) {
  const strengths = [];

  if (breakdown.semanticMatch.score >= 80) strengths.push("Strong semantic alignment with role requirements");
  if (breakdown.impactEvidence.score >= 75) strengths.push("Excellent quantified outcomes and impact storytelling");
  if (breakdown.sectionIntelligence.score >= 75) strengths.push("Well-structured resume with recruiter-friendly sections");
  if (breakdown.contactCompleteness.score >= 80) strengths.push("Complete professional contact footprint");

  return strengths;
}

function extractKeyInfo(text, sections) {
  return {
    estimatedExperience: extractExperience(text),
    topSkills: extractTopSkills(text),
    education: extractEducation(text),
    sectionSummary: Object.fromEntries(
      Object.entries(sections).map(([key, value]) => [key, value.split(/\s+/).filter(Boolean).length])
    ),
  };
}

function extractExperience(text) {
  const years = (text.match(/\b(19|20)\d{2}\b/g) || []).map((y) => Number(y));
  if (years.length < 2) return "Not specified";
  const exp = Math.max(...years) - Math.min(...years);
  return exp > 0 ? `${exp}+ years` : "Not specified";
}

function extractTopSkills(text) {
  return [...new Set(analyzeKeywordCategories(text).matchedKeywords.map((item) => item.keyword))].slice(0, 12);
}

function extractEducation(text) {
  const normalized = text.toLowerCase();
  if (normalized.includes("phd") || normalized.includes("doctorate")) return "Doctorate";
  if (normalized.includes("master")) return "Master";
  if (normalized.includes("bachelor")) return "Bachelor";
  if (normalized.includes("associate")) return "Associate";
  return "Not specified";
}

async function generateLLMFeedback(context) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      provider: "heuristic",
      summary: "Enable OPENAI_API_KEY to receive model-generated, role-specific rewrite suggestions.",
      bulletFeedback: [
        "Rewrite each experience bullet using: Action + Scope + Metric + Business Outcome.",
        "Keep every bullet under 28 words and front-load verbs.",
        "Align your top 5 skills with the target role's must-haves.",
      ],
    };
  }

  const prompt = `You are an expert technical recruiter in 2026. Give concise feedback for this candidate.\nScore: ${context.overallScore}\nBreakdown: ${JSON.stringify(
    context.breakdown
  )}\nJob Description: ${context.jobDescription || "Not provided"}\nProvide JSON with {summary, bulletFeedback:[3 items], rewriteTemplate}`;

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
        input: prompt,
      }),
    });

    const data = await response.json();
    const outputText = data.output_text || "";
    const parsed = safeParseJSON(outputText);

    if (parsed) {
      return {
        provider: "openai",
        ...parsed,
      };
    }
  } catch (error) {
    console.error("LLM feedback fallback:", error.message);
  }

  return {
    provider: "heuristic",
    summary: "LLM feedback unavailable right now; using fallback coaching suggestions.",
    bulletFeedback: [
      "Move your strongest impact bullet to the top of each role.",
      "Replace generic responsibilities with measurable achievements.",
      "Map tools and outcomes directly to the target role.",
    ],
  };
}

function safeParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch {
    const block = text.match(/\{[\s\S]*\}/);
    if (!block) return null;
    try {
      return JSON.parse(block[0]);
    } catch {
      return null;
    }
  }
}

function normalizeText(text) {
  return (text || "").replace(/\r/g, "\n").replace(/\t/g, " ").replace(/[ ]{2,}/g, " ").trim();
}

function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#./ -]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function clampScore(score) {
  return Math.max(0, Math.min(100, score));
}

module.exports = {
  analyzeResume,
  rankResumes,
};
