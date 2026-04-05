/**
 * Scoring logic and constants for Resume vs Job Matcher
 * Extracted for cleaner architecture and easier maintenance
 */

// Critical tools & technologies that carry high weight
export const CRITICAL_TOOLS = {
  programming: ['python', 'java', 'javascript', 'typescript', 'go', 'rust', 'c++', 'c#'],
  frontend: ['react', 'vue', 'angular', 'nextjs'],
  backend: ['node', 'django', 'spring', 'fastapi'],
  database: ['sql', 'postgresql', 'mongodb', 'redis'],
  cloud: ['aws', 'azure', 'gcp', 'google cloud'],
  devops: ['docker', 'kubernetes', 'terraform', 'jenkins', 'ci/cd'],
  data: ['pandas', 'tensorflow', 'machine learning', 'spark'],
  other: ['git', 'agile', 'scrum']
} as const;

// Certifications and their weight
export const CERTIFICATIONS = {
  high: ['aws', 'cka', 'cissp', 'gcp', 'azure'],
  medium: ['pmp', 'scrum master', 'certified', 'bachelor', 'master'],
  low: ['phd', 'diploma']
} as const;

// Scoring weights - can be adjusted based on feedback
export const SCORING_WEIGHTS = {
  keywordMatch: 0.40,        // Keyword overlap (increased importance)
  coverage: 0.25,             // Requirements coverage
  roleAlignment: 0.20,        // Role/industry fit
  experience: 0.15            // Years and level match
} as const;

// Bonus conditions
export const SCORE_BONUSES = {
  hasPortfolio: 5,           // Has GitHub/portfolio
  hasQuantifiedMetrics: 4,   // Has numbers/metrics
  hasProfessionalSummary: 3, // Has professional summary
  industryMatch: 3,          // Matches industry
  certificationMatch: 3      // Relevant cert
} as const;

// Penalties for gaps
export const SCORE_PENALTIES = {
  missingCriticalTool: -8,   // Each critical tool missing
  experienceGap: -5,         // Significant experience gap
  noQuantifiedMetrics: -3,   // No proof of impact
  noPortfolio: -2            // No portfolio/GitHub
} as const;

/**
 * Scoring context object - aggregates all scoring data
 */
export interface ScoringContext {
  matchedCount: number;      // Total matched keywords
  totalInJD: number;         // Total keywords in JD
  criticalMissing: string[]; // Missing must-have tools
  experienceGap: number;     // Years experience gap (positive = candidate has more)
  hasPortfolio: boolean;
  hasMetrics: boolean;
  hasSummary: boolean;
  industryMatches: number;   // How many industry categories match
  certMatches: number;
}

/**
 * Calculate enhanced match score with smart weighting and penalties
 */
export function calculateEnhancedScore(
  keywordPercentage: number,
  coveragePercentage: number,
  roleAlignment: number,
  experienceScore: number,
  context: ScoringContext
): {
  score: number;
  breakdown: {
    baseScore: number;
    bonuses: number;
    penalties: number;
    finalScore: number;
  };
} {
  // Calculate base score from weighted components
  const baseScore = Math.round(
    keywordPercentage * SCORING_WEIGHTS.keywordMatch +
    coveragePercentage * SCORING_WEIGHTS.coverage +
    roleAlignment * SCORING_WEIGHTS.roleAlignment +
    experienceScore * SCORING_WEIGHTS.experience
  );

  // Calculate bonuses
  let bonuses = 0;
  if (context.hasPortfolio) bonuses += SCORE_BONUSES.hasPortfolio;
  if (context.hasMetrics) bonuses += SCORE_BONUSES.hasQuantifiedMetrics;
  if (context.hasSummary) bonuses += SCORE_BONUSES.hasProfessionalSummary;
  if (context.industryMatches > 0) bonuses += SCORE_BONUSES.industryMatch * Math.min(context.industryMatches, 2);
  if (context.certMatches > 0) bonuses += SCORE_BONUSES.certificationMatch;

  // Calculate penalties
  let penalties = 0;
  penalties += context.criticalMissing.length * SCORE_PENALTIES.missingCriticalTool;
  if (context.experienceGap < -2) penalties += SCORE_PENALTIES.experienceGap;
  if (!context.hasMetrics) penalties += SCORE_PENALTIES.noQuantifiedMetrics;
  if (!context.hasPortfolio) penalties += SCORE_PENALTIES.noPortfolio;

  // Calculate final score
  const finalScore = Math.max(0, Math.min(100, baseScore + bonuses + penalties));

  return {
    score: Math.round(finalScore),
    breakdown: {
      baseScore,
      bonuses,
      penalties,
      finalScore: Math.round(finalScore)
    }
  };
}

/**
 * Determine verdict with more nuance than just score
 */
export function generateVerdictWithReasoning(
  score: number,
  context: ScoringContext,
  keywordDensity: number
): {
  verdict: 'Strong' | 'Moderate' | 'Weak';
  reason: string;
  actionable: boolean;
} {
  let verdict: 'Strong' | 'Moderate' | 'Weak' = 'Weak';
  let reason = '';
  let actionable = true;

  if (score >= 75) {
    verdict = 'Strong';
    reason = 'You have most of the required skills. Consider fine-tuning your resume with job-specific keywords.';
    actionable = context.criticalMissing.length > 0; // Actionable if improvements possible
  } else if (score >= 60) {
    verdict = 'Moderate';
    reason = 'You meet the core requirements. Focus on bridging skill gaps and adding quantified achievements.';
    actionable = true;
  } else if (score >= 45) {
    verdict = 'Moderate';
    reason = 'You have some relevant experience. Highlighting transferable skills and learning new ones could strengthen your candidacy.';
    actionable = true;
  } else {
    verdict = 'Weak';
    if (context.criticalMissing.length > 2) {
      reason = `Missing several critical technologies (${context.criticalMissing.slice(0, 2).join(', ')}, ...). Consider upskilling before applying.`;
    } else if (context.experienceGap < -3) {
      reason = 'Experience level is significantly below requirements. Build relevant experience or look for more junior roles.';
    } else {
      reason = 'Limited match. Gain additional skills or experience aligned with this role.';
    }
    actionable = false;
  }

  return { verdict, reason, actionable };
}

/**
 * Categorize missing skills by urgency
 */
export function categorizeMissingSkills(
  missingByPriority: any[],
  criticalTools: Set<string>
): {
  mustHave: any[];
  shouldHave: any[];
  niceToHave: any[];
} {
  const mustHave: any[] = [];
  const shouldHave: any[] = [];
  const niceToHave: any[] = [];

  missingByPriority.slice(0, 15).forEach(skill => {
    if (criticalTools.has(skill.keyword.toLowerCase()) || skill.weight >= 1.5) {
      mustHave.push(skill);
    } else if (skill.weight >= 1.0) {
      shouldHave.push(skill);
    } else {
      niceToHave.push(skill);
    }
  });

  return { mustHave, shouldHave, niceToHave };
}

/**
 * Estimate effort to close gaps
 */
export interface GapEffort {
  skill: string;
  effort: 'quick' | 'medium' | 'long';
  timeframe: string;
  action: string;
}

export function estimateGapEffort(skill: string, skillType: string): GapEffort {
  let effort: 'quick' | 'medium' | 'long' = 'medium';
  let timeframe = '';
  let action = '';

  // Quick wins (< 1 week)
  if (['agile', 'scrum', 'jira', 'github', 'git'].includes(skill.toLowerCase())) {
    effort = 'quick';
    timeframe = '1-3 days';
    action = 'Tutorial or online course';
  }
  // Medium effort (1-2 months)
  else if (['aws', 'docker', 'kubernetes', 'terraform'].includes(skill.toLowerCase())) {
    effort = 'medium';
    timeframe = '2-8 weeks';
    action = 'Online certification course + hands-on labs';
  }
  // Long-term (3+ months)
  else if (
    ['machine learning', 'deep learning', 'data science'].includes(skill.toLowerCase()) ||
    skillType === 'programming'
  ) {
    effort = 'long';
    timeframe = '3-6 months';
    action = 'Structured course or bootcamp';
  }
  // Default: medium
  else {
    effort = 'medium';
    timeframe = '4-12 weeks';
    action = 'Online course or hands-on project';
  }

  return { skill, effort, timeframe, action };
}
