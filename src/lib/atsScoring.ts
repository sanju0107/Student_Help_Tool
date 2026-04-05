/**
 * Production-Ready ATS Scoring Engine
 * 
 * Rule-based scoring system with transparent, explainable logic
 * 
 * Score Breakdown (Total: 100):
 * - Keyword Match: 30 points
 * - Skills Match: 20 points
 * - Experience Quality: 15 points
 * - Action Verbs: 10 points
 * - Section Completeness: 10 points
 * - Formatting & Structure: 10 points
 * - Readability: 5 points
 */

// ============================================================================
// INTERFACES
// ============================================================================

export interface ATSScore {
  totalScore: number;
  scoreCategory: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Improvement';
  breakdown: ScoreBreakdown;
  matchedKeywords: string[];
  missingKeywords: string[];
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  topFixes: TopFix[];
}

export interface ScoreBreakdown {
  keywordScore: number;
  skillsScore: number;
  experienceScore: number;
  actionScore: number;
  sectionScore: number;
  formattingScore: number;
  readabilityScore: number;
}

export interface TopFix {
  priority: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
}

// ============================================================================
// KEYWORD EXTRACTION & MATCHING (30 POINTS)
// ============================================================================

/**
 * Extract important keywords from job description
 * Prioritizes: skills, tools, technologies
 * Ignores: stop words, articles, prepositions
 */
export function extractKeywords(text: string): string[] {
  if (!text) return [];

  // Stop words to ignore
  const stopWords = new Set([
    'the', 'and', 'or', 'a', 'an', 'is', 'are', 'was', 'were',
    'be', 'been', 'being', 'of', 'to', 'in', 'for', 'with',
    'by', 'at', 'from', 'up', 'about', 'into', 'on', 'as',
    'if', 'that', 'this', 'it', 'we', 'you', 'they', 'i',
    'etc', 'e.g', 'i.e', 'required', 'preferred', 'your',
    'our', 'we', 'will', 'can', 'should', 'must', 'may',
    'experience', 'knowledge', 'understand', 'working',
    'including', 'such', 'years', 'year'
  ]);

  // Priority keywords (weighted)
  const priorityPatterns = [
    /\b(javascript|typescript|python|java|c#|c\+\+|ruby|php|go|rust|kotlin)\b/gi,
    /\b(react|vue|angular|svelte|next\.?js|gatsby|express|spring|django|flask)\b/gi,
    /\b(aws|azure|gcp|google cloud|docker|kubernetes|terraform|jenkins)\b/gi,
    /\b(sql|mongodb|postgresql|mysql|redis|elasticsearch|firebase)\b/gi,
    /\b(git|github|gitlab|bitbucket|devops|ci\/cd|agile|scrum)\b/gi,
  ];

  const keywords = new Set<string>();

  // Extract priority keywords (higher weight)
  priorityPatterns.forEach(pattern => {
    const matches = text.matchAll(pattern);
    for (const match of matches) {
      if (match[1]) {
        keywords.add(match[1].toLowerCase());
      }
    }
  });

  // Extract general keywords (3+ character words)
  const words: string[] = text.toLowerCase().match(/\b[a-z]+(?:\+\+|\.js|\.net)?\b/g) || [];
  words.forEach(word => {
    if (word.length >= 3 && !stopWords.has(word)) {
      keywords.add(word);
    }
  });

  return Array.from(keywords).slice(0, 50); // Return top 50
}

/**
 * Calculate keyword match score (0-30)
 * Formula: (matchedKeywords / totalKeywords) * 30
 */
export function calculateKeywordScore(
  resumeText: string,
  jobDescription: string
): { score: number; matched: string[]; missing: string[] } {
  if (!jobDescription || !resumeText) {
    return { score: 0, matched: [], missing: [] };
  }

  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  const resumeLower = resumeText.toLowerCase();

  if (jdKeywords.length === 0) {
    return { score: 15, matched: [], missing: [] }; // Default if no keywords found
  }

  const matched = jdKeywords.filter(keyword => {
    const pattern = new RegExp(`\\b${keyword}\\b`, 'i');
    return pattern.test(resumeLower);
  });

  const matchPercentage = matched.length / jdKeywords.length;
  const score = Math.round(matchPercentage * 30);

  return {
    score: Math.min(score, 30),
    matched,
    missing: jdKeywords.filter(k => !matched.includes(k))
  };
}

// ============================================================================
// SKILLS MATCHING (20 POINTS)
// ============================================================================

const COMMON_SKILLS = [
  'javascript', 'typescript', 'python', 'java', 'react', 'node', 'express',
  'sql', 'mongodb', 'aws', 'docker', 'git', 'html', 'css', 'nodejs',
  'angular', 'vue', 'c#', 'php', 'ruby', 'golang', 'api', 'rest',
  'microservices', 'devops', 'agile', 'scrum', 'teamwork', 'leadership',
  'communication', 'problem-solving', 'project management', 'testing',
  'kubernetes', 'jenkins', 'ci/cd', 'firebase', 'postgresql', 'mysql',
  'graphql', 'webpack', 'npm', 'yarn', 'figma', 'ui/ux', 'design',
  'marketing', 'sales', 'analytics', 'excel', 'powerpoint', 'salesforce'
];

/**
 * Extract skills from resume text
 */
export function extractSkills(resumeText: string): string[] {
  const resume = resumeText.toLowerCase();
  const foundSkills = new Set<string>();

  COMMON_SKILLS.forEach(skill => {
    const pattern = new RegExp(`\\b${skill}\\b`, 'i');
    if (pattern.test(resume)) {
      foundSkills.add(skill);
    }
  });

  return Array.from(foundSkills);
}

/**
 * Calculate skills match score (0-20)
 * 0–40% match → 5 points
 * 40–70% match → 10 points
 * 70–100% match → 20 points
 */
export function calculateSkillScore(
  resumeText: string,
  jobDescription?: string
): number {
  const resumeSkills = extractSkills(resumeText);

  if (!jobDescription) {
    // If no JD, base score on number of skills found
    const skillCount = resumeSkills.length;
    if (skillCount >= 15) return 20;
    if (skillCount >= 10) return 10;
    if (skillCount >= 5) return 5;
    return 0;
  }

  const jdSkills = extractSkills(jobDescription);
  if (jdSkills.length === 0) return 10; // Default if no skills in JD

  const matchedSkills = resumeSkills.filter(skill => jdSkills.includes(skill));
  const matchPercentage = matchedSkills.length / jdSkills.length;

  if (matchPercentage >= 0.7) return 20;
  if (matchPercentage >= 0.4) return 10;
  if (matchPercentage > 0) return 5;
  return 0;
}

// ============================================================================
// EXPERIENCE QUALITY (15 POINTS)
// ============================================================================

/**
 * Calculate experience quality score (0-15)
 * Evaluates: years of experience, relevance, role alignment
 */
export function calculateExperienceScore(resumeText: string): number {
  const hasExperienceSection = /experience|work\s+history|employment/i.test(resumeText);
  if (!hasExperienceSection) return 0;

  // Count job entries (indicators: company names, dates)
  const jobPattern = /(?:201[0-9]|202[0-9])|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i;
  const jobEntries = (resumeText.match(jobPattern) || []).length / 2; // Rough estimate

  // Look for experience indicators
  const seniorPatterns = /senior|lead|principal|architect|manager|director|head of/i;
  const midPatterns = /mid[- ]?level|intermediate|specialist|engineer|analyst|developer/i;
  const juniPatterns = /junior|associate|entry[- ]?level|intern|graduate|coordinator/i;

  // Count strong indicators
  const seniorMatches = (resumeText.match(seniorPatterns) || []).length;
  const midMatches = (resumeText.match(midPatterns) || []).length;
  const juniorMatches = (resumeText.match(juniPatterns) || []).length;

  // Calculate experience level
  let experienceScore = 0;

  if (seniorMatches > 0 && jobEntries >= 3) {
    experienceScore = 15; // High relevance
  } else if (seniorMatches > 0 || (midMatches > 0 && jobEntries >= 2)) {
    experienceScore = 10; // Moderate
  } else if (jobEntries >= 1) {
    experienceScore = 5; // Low
  } else {
    experienceScore = 0; // Very limited
  }

  return Math.min(experienceScore, 15);
}

// ============================================================================
// ACTION VERBS (10 POINTS)
// ============================================================================

const STRONG_ACTION_VERBS = [
  'developed', 'built', 'led', 'designed', 'improved', 'created',
  'architected', 'engineered', 'implemented', 'delivered', 'optimized',
  'increased', 'reduced', 'automated', 'managed', 'supervised',
  'coordinated', 'launched', 'pioneered', 'spearheaded', 'established',
  'enhanced', 'transformed', 'streamlined', 'accelerated', 'scaled',
  'collaborated', 'mentored', 'trained', 'directed', 'oversaw'
];

/**
 * Count strong action verbs in resume
 */
export function countActionVerbs(resumeText: string): { strong: number; total: number } {
  const resume = resumeText.toLowerCase();

  // Count bullet points / achievement statements
  const bulletPattern = /[-•*]\s*(.+?)(?=\n|$)/g;
  const bullets = resumeText.match(bulletPattern) || [];
  const totalBullets = bullets.length;

  // Count strong verbs
  let strongVerbCount = 0;
  STRONG_ACTION_VERBS.forEach(verb => {
    const pattern = new RegExp(`\\b${verb}\\b`, 'gi');
    const matches = resume.match(pattern) || [];
    strongVerbCount += matches.length;
  });

  return {
    strong: strongVerbCount,
    total: totalBullets > 0 ? totalBullets : (resumeText.split(/[.!?]/).length - 1)
  };
}

/**
 * Calculate action verb score (0-10)
 * Formula: (strongVerbs / totalBulletPoints) * 10
 */
export function calculateActionScore(resumeText: string): number {
  const { strong, total } = countActionVerbs(resumeText);

  if (total === 0) return 0;

  const percentage = strong / total;
  const score = Math.round(percentage * 10);

  return Math.min(score, 10);
}

// ============================================================================
// SECTION COMPLETENESS (10 POINTS)
// ============================================================================

const REQUIRED_SECTIONS = [
  { name: 'contact', patterns: [/contact|email|phone/i] },
  { name: 'summary', patterns: [/summary|objective|profile/i] },
  { name: 'skills', patterns: [/skills|competencies|technical|proficiencies/i] },
  { name: 'experience', patterns: [/experience|employment|work history|professional/i] },
  { name: 'education', patterns: [/education|degree|university|college|school/i] },
  { name: 'projects', patterns: [/projects|portfolio|accomplishments|achievements/i] }
];

/**
 * Check for required sections in resume
 */
export function checkSections(resumeText: string): {
  found: string[];
  missing: string[];
  count: number;
} {
  const found: string[] = [];
  const missing: string[] = [];

  REQUIRED_SECTIONS.forEach(section => {
    const hasSection = section.patterns.some(pattern => pattern.test(resumeText));
    if (hasSection) {
      found.push(section.name);
    } else {
      missing.push(section.name);
    }
  });

  return { found, missing, count: found.length };
}

/**
 * Calculate section completeness score (0-10)
 * All present → 10
 * Missing 1–2 → 7
 * Missing 3+ → 4
 */
export function calculateSectionScore(resumeText: string): number {
  const { missing } = checkSections(resumeText);

  if (missing.length === 0) return 10;
  if (missing.length <= 2) return 7;
  return 4;
}

// ============================================================================
// FORMATTING & STRUCTURE (10 POINTS)
// ============================================================================

/**
 * Calculate formatting score (0-10)
 */
export function calculateFormattingScore(resumeText: string): number {
  let score = 10;

  // Check for good structure indicators
  const hasGoodBulletUsage = (resumeText.match(/[-•*]/g) || []).length >= 6;
  const hasExcessiveSymbols = (resumeText.match(/[#@&%$!]/g) || []).length > 20;
  const excessiveLineBreaks = (resumeText.match(/\n{3,}/g) || []).length > 5;
  const hasReasonableLength = resumeText.length < 20000; // Not bloated

  // Positive factors
  if (hasGoodBulletUsage) score += 0; // Already counted in base
  
  // Negative factors
  if (hasExcessiveSymbols) score -= 4;
  if (excessiveLineBreaks) score -= 3;
  if (!hasReasonableLength) score -= 2;

  // Check for consistent formatting patterns
  const bulletLines = (resumeText.match(/^[-•*]\s+.+/gm) || []).length;
  const hasConsistentFormatting = bulletLines >= 5;
  
  if (!hasConsistentFormatting) score -= 2;

  return Math.max(Math.min(score, 10), 3); // Between 3-10
}

// ============================================================================
// READABILITY (5 POINTS)
// ============================================================================

/**
 * Calculate readability score (0-5)
 */
export function calculateReadabilityScore(resumeText: string): number {
  // Analyze sentence clarity and length
  const sentences = resumeText.match(/[.!?]+/g) || [];
  const avgWordsPerSentence = resumeText.split(/\s+/).length / (sentences.length || 1);

  let score = 5;

  // Too long sentences indicate complexity
  if (avgWordsPerSentence > 20) score -= 1;
  if (avgWordsPerSentence > 30) score -= 2;

  // Check for readability patterns
  const shortLines = (resumeText.match(/^.{1,50}$/gm) || []).length;
  const hasGoodLineLength = shortLines > (resumeText.split('\n').length / 2);

  if (!hasGoodLineLength) score -= 1;

  // Grammar issues (basic checks)
  const hasBasicGrammarIssues = /\b(thier|teh|recieve)\b/i.test(resumeText);
  if (hasBasicGrammarIssues) score -= 1;

  return Math.max(Math.min(score, 5), 1); // Between 1-5
}

// ============================================================================
// MAIN ATS SCORING FUNCTION
// ============================================================================

/**
 * Perform comprehensive ATS scoring
 * Returns structured result with breakdown, keywords, strengths, weaknesses, and suggestions
 */
export function performATSAnalysis(
  resumeText: string,
  jobDescription?: string
): ATSScore {
  // Calculate all scores
  const keywordData = calculateKeywordScore(resumeText, jobDescription || '');
  const keywordScore = keywordData.score;
  const skillsScore = calculateSkillScore(resumeText, jobDescription);
  const experienceScore = calculateExperienceScore(resumeText);
  const actionScore = calculateActionScore(resumeText);
  const sectionScore = calculateSectionScore(resumeText);
  const formattingScore = calculateFormattingScore(resumeText);
  const readabilityScore = calculateReadabilityScore(resumeText);

  // Calculate total score
  const totalScore = Math.round(
    keywordScore +
    skillsScore +
    experienceScore +
    actionScore +
    sectionScore +
    formattingScore +
    readabilityScore
  );

  // Determine category
  let scoreCategory: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Improvement';
  if (totalScore >= 90) scoreCategory = 'Excellent';
  else if (totalScore >= 75) scoreCategory = 'Strong';
  else if (totalScore >= 60) scoreCategory = 'Moderate';
  else scoreCategory = 'Needs Improvement';

  // Get sections info
  const { found: foundSections, missing: missingSections } = checkSections(resumeText);

  // Get action verbs info
  const { strong: strongVerbs, total: totalBullets } = countActionVerbs(resumeText);

  // Generate strengths
  const strengths: string[] = [];
  if (keywordScore >= 25) strengths.push('Strong keyword alignment with job description');
  if (skillsScore >= 15) strengths.push('Good skills coverage');
  if (experienceScore >= 12) strengths.push('Solid experience background');
  if (actionScore >= 8) strengths.push('Effective use of action verbs');
  if (sectionScore >= 9) strengths.push('Complete resume sections');
  if (formattingScore >= 9) strengths.push('Professional formatting');
  if (readabilityScore >= 4) strengths.push('Clear and readable content');

  // Generate weaknesses
  const weaknesses: string[] = [];
  if (keywordScore < 15) weaknesses.push('Limited keyword matches with job description');
  if (skillsScore < 10) weaknesses.push('Missing key skills from job requirements');
  if (experienceScore < 7) weaknesses.push('Limited relevant experience shown');
  if (actionScore < 5) weaknesses.push('Could use stronger action verbs');
  if (sectionScore < 8) weaknesses.push('Some important sections missing');
  if (formattingScore < 7) weaknesses.push('Formatting could be improved');
  if (readabilityScore < 3) weaknesses.push('Readability needs improvement');

  // Generate suggestions
  const suggestions = generateSuggestions(
    totalScore,
    keywordData.missing,
    missingSections,
    strongVerbs,
    totalBullets,
    jobDescription
  );

  // Generate top fixes
  const topFixes = generateTopFixes(
    keywordScore,
    skillsScore,
    experienceScore,
    actionScore,
    sectionScore,
    formattingScore,
    readabilityScore,
    keywordData.missing,
    missingSections
  );

  return {
    totalScore,
    scoreCategory,
    breakdown: {
      keywordScore,
      skillsScore,
      experienceScore,
      actionScore,
      sectionScore,
      formattingScore,
      readabilityScore
    },
    matchedKeywords: keywordData.matched,
    missingKeywords: keywordData.missing,
    strengths,
    weaknesses,
    suggestions,
    topFixes
  };
}

// ============================================================================
// SUGGESTION ENGINE
// ============================================================================

/**
 * Generate actionable suggestions based on score analysis
 */
function generateSuggestions(
  totalScore: number,
  missingKeywords: string[],
  missingSections: string[],
  strongVerbs: number,
  totalBullets: number,
  jobDescription?: string
): string[] {
  const suggestions: string[] = [];

  // Keyword suggestions
  if (missingKeywords.length > 0) {
    const topMissing = missingKeywords.slice(0, 3).join(', ');
    suggestions.push(
      `Add keywords like "${topMissing}" to better match the job description`
    );
  }

  // Section suggestions
  missingSections.forEach(section => {
    suggestions.push(`Add a "${section
      .charAt(0)
      .toUpperCase()}${section.slice(1)}" section to your resume`);
  });

  // Action verb suggestions
  const verbRatio = totalBullets > 0 ? strongVerbs / totalBullets : 0;
  if (verbRatio < 0.5) {
    suggestions.push(
      'Replace weak verbs with stronger action verbs like: Led, Designed, Optimized, Created'
    );
  }

  // Achievement metrics
  const hasMetrics = /(\d+%|\$\d+[kK]?|\d+x|increased by)/i.test('');
  if (!hasMetrics) {
    suggestions.push(
      'Quantify your achievements with metrics (e.g., "increased revenue by 25%")'
    );
  }

  // Overall suggestions
  if (totalScore < 60) {
    suggestions.push('Consider restructuring your resume to highlight most relevant experience');
    suggestions.push('Ensure clear alignment between your background and target role');
  } else if (totalScore < 75) {
    suggestions.push('Fine-tune keyword usage to better match job requirements');
  }

  return suggestions;
}

/**
 * Generate prioritized fixes
 */
function generateTopFixes(
  keywordScore: number,
  skillsScore: number,
  experienceScore: number,
  actionScore: number,
  sectionScore: number,
  formattingScore: number,
  readabilityScore: number,
  missingKeywords: string[],
  missingSections: string[]
): TopFix[] {
  const fixes: TopFix[] = [];

  // Critical fixes (score 0 or very low)
  if (keywordScore < 10) {
    fixes.push({
      priority: 'critical',
      title: 'Add Missing Keywords',
      description: `Resume is missing important keywords: ${missingKeywords.slice(0, 5).join(', ')}`,
      impact: 'Could improve score by +15 points'
    });
  }

  if (sectionScore < 6) {
    fixes.push({
      priority: 'critical',
      title: 'Complete Missing Sections',
      description: `Add missing sections: ${missingSections.join(', ')}`,
      impact: 'Could improve score by +4-6 points'
    });
  }

  // High priority fixes
  if (actionScore < 5) {
    fixes.push({
      priority: 'high',
      title: 'Strengthen Action Verbs',
      description: 'Replace weak verbs with: Developed, Designed, Led, Optimized, Scaled',
      impact: 'Could improve score by +3-5 points'
    });
  }

  if (readabilityScore < 3) {
    fixes.push({
      priority: 'high',
      title: 'Improve Readability',
      description: 'Use shorter sentences, better spacing, and bullet points consistently',
      impact: 'Could improve score by +2-3 points'
    });
  }

  // Medium priority fixes
  if (skillsScore < 12) {
    fixes.push({
      priority: 'medium',
      title: 'Expand Skills Section',
      description: 'Add more relevant technical and soft skills',
      impact: 'Could improve score by +3-5 points'
    });
  }

  if (formattingScore < 8) {
    fixes.push({
      priority: 'medium',
      title: 'Improve Formatting',
      description: 'Clean up layout, use consistent bullet points, remove excessive symbols',
      impact: 'Could improve score by +2-3 points'
    });
  }

  // Low priority fixes
  if (experienceScore < 10) {
    fixes.push({
      priority: 'low',
      title: 'Highlight Relevant Experience',
      description: 'Emphasize experience most relevant to target role',
      impact: 'Could improve score by +2-3 points'
    });
  }

  return fixes.slice(0, 5); // Return top 5 fixes
}

// ============================================================================
// BACKWARD COMPATIBILITY
// ============================================================================

// Legacy interface for existing code
export interface ATSCheckResult {
  score: number;
  feedback: string;
  actionItems: string[];
  sectionScores: Record<string, number>;
}

/**
 * Backward compatibility wrapper
 */
export function checkATSFriendliness(resumeText: string): ATSCheckResult {
  const result = performATSAnalysis(resumeText);

  return {
    score: result.totalScore,
    feedback: `Your resume scores ${result.totalScore}/100 (${result.scoreCategory})`,
    actionItems: result.topFixes.map(f => f.description),
    sectionScores: {
      keywords: result.breakdown.keywordScore,
      skills: result.breakdown.skillsScore,
      experience: result.breakdown.experienceScore,
      verbs: result.breakdown.actionScore,
      sections: result.breakdown.sectionScore,
      formatting: result.breakdown.formattingScore,
      readability: result.breakdown.readabilityScore
    }
  };
}
