const keywordCategories = {
  technical: [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "SQL",
    "AWS",
    "Docker",
    "Git",
    "Java",
    "C++",
    "HTML",
    "CSS",
    "Angular",
    "Vue",
    "TypeScript",
    "MongoDB",
    "PostgreSQL",
  ],
  business: [
    "Management",
    "Leadership",
    "Strategy",
    "Analysis",
    "Planning",
    "Communication",
    "Collaboration",
    "Project Management",
    "Team Lead",
  ],
  data: [
    "Analytics",
    "Machine Learning",
    "Statistics",
    "Visualization",
    "Excel",
    "Tableau",
    "Python",
    "R",
    "Data Mining",
    "Big Data",
  ],
  design: [
    "UI/UX",
    "Figma",
    "Adobe",
    "Prototype",
    "Wireframe",
    "User Research",
    "Design Systems",
  ],
  marketing: [
    "Digital Marketing",
    "SEO",
    "SEM",
    "Social Media",
    "Content",
    "Campaign",
    "Analytics",
  ],
  finance: [
    "Financial Analysis",
    "Budgeting",
    "Forecasting",
    "Risk Management",
    "Accounting",
  ],
};

const sectionHeaders = {
  standard: [
    "Experience",
    "Education",
    "Skills",
    "Projects",
    "Certifications",
    "Summary",
  ],
  variations: [
    "Work Experience",
    "Professional Experience",
    "Employment",
    "Academic Background",
    "Technical Skills",
  ],
};

async function analyzeResume(text, filename) {
  const analysis = {
    overallScore: 0,
    breakdown: {},
    recommendations: [],
    strengths: [],
    extractedInfo: {},
  };

  try {
    // Clean and normalize text
    const cleanText = text.replace(/\s+/g, " ").trim();

    // Perform analysis
    analysis.breakdown.keywordMatching = analyzeKeywords(cleanText);
    analysis.breakdown.structureAnalysis = analyzeStructure(cleanText);
    analysis.breakdown.contentQuality = analyzeContent(cleanText);
    analysis.breakdown.formatCompatibility = analyzeFormat(filename, cleanText);
    analysis.breakdown.contactInformation = analyzeContactInfo(cleanText);
    analysis.breakdown.quantification = analyzeQuantification(cleanText);

    // Calculate overall score
    analysis.overallScore = calculateOverallScore(analysis.breakdown);

    // Generate recommendations
    analysis.recommendations = generateRecommendations(
      analysis.breakdown,
      cleanText
    );

    // Identify strengths
    analysis.strengths = identifyStrengths(analysis.breakdown);

    // Extract key information
    analysis.extractedInfo = extractKeyInfo(cleanText);

    return analysis;
  } catch (error) {
    console.error("Resume analysis error:", error);
    throw new Error("Failed to analyze resume content");
  }
}

function analyzeKeywords(text) {
  const textLower = text.toLowerCase();
  let score = 0;
  let matchedKeywords = [];
  let totalKeywords = 0;

  Object.entries(keywordCategories).forEach(([category, keywords]) => {
    const categoryMatches = keywords.filter((keyword) =>
      textLower.includes(keyword.toLowerCase())
    );
    matchedKeywords = matchedKeywords.concat(
      categoryMatches.map((k) => ({ keyword: k, category }))
    );
    totalKeywords += keywords.length;
  });

  score = Math.min(25, (matchedKeywords.length / totalKeywords) * 100);

  return {
    score: Math.round(score),
    matchedKeywords,
    totalMatched: matchedKeywords.length,
    details:
      "Keywords found across technical, business, and industry-specific categories",
  };
}

function analyzeStructure(text) {
  let score = 0;
  const foundSections = [];

  // Check for standard section headers
  sectionHeaders.standard
    .concat(sectionHeaders.variations)
    .forEach((header) => {
      const regex = new RegExp(`\\b${header}\\b`, "gi");
      if (regex.test(text)) {
        foundSections.push(header);
        score += 3;
      }
    });

  score = Math.min(20, score);

  return {
    score: Math.round(score),
    foundSections,
    details: `Found ${foundSections.length} standard resume sections`,
  };
}

function analyzeContent(text) {
  let score = 0;
  const metrics = {
    wordCount: text.split(/\s+/).length,
    sentences: text.split(/[.!?]+/).length,
    actionVerbs: 0,
    professionalLanguage: 0,
  };

  // Action verbs check
  const actionVerbs = [
    "managed",
    "led",
    "developed",
    "created",
    "implemented",
    "improved",
    "increased",
    "reduced",
    "achieved",
    "delivered",
  ];
  actionVerbs.forEach((verb) => {
    if (text.toLowerCase().includes(verb)) {
      metrics.actionVerbs++;
      score += 1;
    }
  });

  // Word count scoring
  if (metrics.wordCount > 200 && metrics.wordCount < 800) {
    score += 10;
  }

  score = Math.min(20, score);

  return {
    score: Math.round(score),
    metrics,
    details: `Content analysis based on length, language quality, and action verbs`,
  };
}

function analyzeFormat(filename, text) {
  let score = 0;

  // File type scoring
  if (filename.toLowerCase().endsWith(".pdf")) {
    score += 10;
  } else if (filename.toLowerCase().endsWith(".docx")) {
    score += 8;
  }

  // Text quality checks
  const hasSpecialChars = /[^\x00-\x7F]/.test(text);
  if (!hasSpecialChars) {
    score += 5;
  }

  return {
    score: Math.min(15, Math.round(score)),
    fileType: filename.split(".").pop(),
    details: "Format compatibility for ATS systems",
  };
}

function analyzeContactInfo(text) {
  let score = 0;
  const contactInfo = {
    email: false,
    phone: false,
    linkedin: false,
    location: false,
  };

  // Email check
  if (/@/.test(text)) {
    contactInfo.email = true;
    score += 3;
  }

  // Phone check
  if (/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(text)) {
    contactInfo.phone = true;
    score += 3;
  }

  // LinkedIn check
  if (/linkedin/i.test(text)) {
    contactInfo.linkedin = true;
    score += 2;
  }

  // Location check
  if (/\b[A-Z][a-z]+,\s*[A-Z]{2}\b/.test(text)) {
    contactInfo.location = true;
    score += 2;
  }

  return {
    score: Math.min(10, score),
    contactInfo,
    details: "Professional contact information completeness",
  };
}

function analyzeQuantification(text) {
  let score = 0;
  const quantificationPatterns = [
    /\d+%/g, // Percentages
    /\$[\d,]+/g, // Dollar amounts
    /\b\d+\s*(years?|months?)/gi, // Time periods
    /\b(increased|decreased|improved|reduced|grew)\s+.*?\s+\d+/gi, // Achievement with numbers
  ];

  let totalQuantifications = 0;
  quantificationPatterns.forEach((pattern) => {
    const matches = text.match(pattern);
    if (matches) {
      totalQuantifications += matches.length;
    }
  });

  score = Math.min(10, totalQuantifications * 2);

  return {
    score: Math.round(score),
    quantifications: totalQuantifications,
    details: `Found ${totalQuantifications} quantified achievements`,
  };
}

function calculateOverallScore(breakdown) {
  const weights = {
    keywordMatching: 0.25,
    structureAnalysis: 0.2,
    contentQuality: 0.2,
    formatCompatibility: 0.15,
    contactInformation: 0.1,
    quantification: 0.1,
  };

  let totalScore = 0;
  Object.entries(weights).forEach(([key, weight]) => {
    totalScore += breakdown[key].score * weight;
  });

  return Math.round(totalScore);
}

function generateRecommendations(breakdown, text) {
  const recommendations = [];

  if (breakdown.keywordMatching.score < 15) {
    recommendations.push({
      priority: "high",
      category: "Keywords",
      suggestion:
        "Add more industry-relevant keywords and technical skills to match job descriptions",
    });
  }

  if (breakdown.structureAnalysis.score < 12) {
    recommendations.push({
      priority: "high",
      category: "Structure",
      suggestion:
        'Use standard section headers like "Professional Experience", "Education", and "Skills"',
    });
  }

  if (breakdown.quantification.score < 6) {
    recommendations.push({
      priority: "high",
      category: "Achievements",
      suggestion:
        "Add quantifiable achievements with specific numbers, percentages, and metrics",
    });
  }

  if (breakdown.contactInformation.score < 7) {
    recommendations.push({
      priority: "medium",
      category: "Contact Info",
      suggestion:
        "Ensure complete contact information including professional email and phone number",
    });
  }

  if (breakdown.contentQuality.score < 12) {
    recommendations.push({
      priority: "medium",
      category: "Content",
      suggestion:
        "Use more action verbs and improve content depth with detailed descriptions",
    });
  }

  return recommendations;
}

function identifyStrengths(breakdown) {
  const strengths = [];

  if (breakdown.keywordMatching.score >= 18) {
    strengths.push("Strong keyword optimization for ATS systems");
  }

  if (breakdown.structureAnalysis.score >= 15) {
    strengths.push("Well-organized with standard resume sections");
  }

  if (breakdown.quantification.score >= 8) {
    strengths.push("Good use of quantifiable achievements");
  }

  if (breakdown.formatCompatibility.score >= 12) {
    strengths.push("ATS-friendly file format and structure");
  }

  return strengths;
}

function extractKeyInfo(text) {
  return {
    estimatedExperience: extractExperience(text),
    topSkills: extractTopSkills(text),
    education: extractEducation(text),
  };
}

function extractExperience(text) {
  const yearMatches = text.match(/\b(19|20)\d{2}\b/g);
  if (yearMatches && yearMatches.length >= 2) {
    const years = yearMatches.map((y) => parseInt(y)).sort();
    const experienceYears = years[years.length - 1] - years;
    return `${experienceYears}+ years`;
  }
  return "Not specified";
}

function extractTopSkills(text) {
  const allKeywords = Object.values(keywordCategories).flat();
  return allKeywords
    .filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))
    .slice(0, 10);
}

function extractEducation(text) {
  const degrees = [
    "bachelor",
    "master",
    "phd",
    "doctorate",
    "associate",
    "diploma",
  ];
  for (let degree of degrees) {
    if (text.toLowerCase().includes(degree)) {
      return degree.charAt(0).toUpperCase() + degree.slice(1);
    }
  }
  return "Not specified";
}

module.exports = {
  analyzeResume,
};
