/**
 * Resume vs Job Description matching logic
 * Provides intelligent matching with weighted scoring, verdicts, and actionable insights
 */

import {
  extractKeywords,
  extractKeywordsWithDetails,
  findMissingKeywords,
  calculateKeywordMatchPercentage,
  categorizeKeywords,
  calculateWeightedMatchPercentage,
  getMissingKeywordsByPriority,
  extractYearsOfExperience,
  estimateExperienceLevel,
  detectIndustry,
  extractJobTitle,
  ALL_SKILL_CATEGORIES,
  ExtractedKeyword
} from './keywordAnalysis';
import {
  CRITICAL_TOOLS,
  CERTIFICATIONS,
  ScoringContext,
  calculateEnhancedScore,
  generateVerdictWithReasoning,
  categorizeMissingSkills,
  estimateGapEffort,
  GapEffort
} from './scoreConstants';

export interface MatchResult {
  // Core scoring
  matchScore: number;                           // 0-100 overall score
  verdict: 'Strong' | 'Moderate' | 'Weak';    // Match verdict
  verdictReasoning?: string;                    // Explanation of verdict
  actionability?: 'immediately-addressable' | 'medium-term' | 'long-term'; // How soon can gaps be closed
  confidence: number;                           // 0-100 confidence in score

  // Detailed scoring breakdown
  breakdown: {
    skillsMatch: number;                        // 0-100: keyword match %
    experienceMatch: number;                    // 0-100: years + level match
    keywordFrequencyMatch: number;              // 0-100: weighted keyword match
    roleAlignment: number;                      // 0-100: role fit
  };

  // Keywords analysis
  matchedKeywords: {
    technical: string[];
    soft: string[];
    actionVerbs: string[];
  };
  missingKeywords: {
    technical: string[];
    soft: string[];
  };
  missingByPriority: ExtractedKeyword[];        // Sorted by importance
  missingSkillsWithContext?: Array<{
    skill: string;
    category: 'must-have' | 'should-have' | 'nice-to-have';
    effort: GapEffort;
    priority: number;
  }>;

  // Insights
  strengths: string[];
  gaps: string[];
  improvements: string[];
  
  // Section-wise analysis
  sectionAnalysis: {
    skills: number;                             // 0-100
    experience: number;                         // 0-100
    keywords: number;                           // 0-100
    roleAlignment: number;                      // 0-100
  };

  // ATS insights
  atsTips: string[];
  keywordDensity: number;                       // % of JD keywords found
}

/**
 * Extract requirements from job description with priority
 */
function extractJobRequirements(jobDescription: string): {
  required: string[];
  preferred: string[];
  responsibilities: string[];
} {
  const lowerText = jobDescription.toLowerCase();

  // Extract requirements sections
  const requiredMatch = jobDescription.match(
    /(required|must have|requirements)([\s\S]{0,1500}?)(?=preferred|nice to have|responsibilities|about|qualifications|skip|nice|\n\n)/i
  );
  const requiredSection = requiredMatch ? requiredMatch[2] : '';

  const preferredMatch = jobDescription.match(
    /(preferred|nice to have|should have|bonus)([\s\S]{0,800}?)(?=responsibilities|qualifications|about|required|skip|\n\n)/i
  );
  const preferredSection = preferredMatch ? preferredMatch[2] : '';

  const respMatch = jobDescription.match(
    /(responsibilities|what you'll do|you will|in this role)([\s\S]{0,1500}?)(?=requirements|qualifications|about|preferred|skip|\n\n)/i
  );
  const respSection = respMatch ? respMatch[2] : '';

  // Extract bullet points/numbered items
  const extractItems = (text: string): string[] => {
    return text
      .split(/[\n•\-*\d+\.]/g)
      .map(item => item.trim())
      .filter(item => item.length > 8 && item.length < 250)
      .slice(0, 20);
  };

  return {
    required: extractItems(requiredSection),
    preferred: extractItems(preferredSection),
    responsibilities: extractItems(respSection)
  };
}

/**
 * Assess how well resume addresses job requirements
 */
function assessRequirementsCoverage(
  resume: string,
  requirements: string[]
): { coverage: number; covered: string[]; uncovered: string[] } {
  const resumeLower = resume.toLowerCase();
  const covered: string[] = [];
  const uncovered: string[] = [];

  requirements.forEach(req => {
    const reqWords = req.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const matchCount = reqWords.filter(word => resumeLower.includes(word)).length;
    const coveragePercent = reqWords.length > 0 ? matchCount / reqWords.length : 0;

    if (coveragePercent >= 0.7) {
      covered.push(req);
    } else if (coveragePercent > 0) {
      covered.push(`${req} (partial match)`);
    } else {
      uncovered.push(req);
    }
  });

  const totalCoverage = requirements.length > 0
    ? Math.round((covered.length / requirements.length) * 100)
    : 100;

  return { coverage: totalCoverage, covered, uncovered };
}

/**
 * Identify resume strengths relative to job
 */
function identifyStrengths(resume: string, jobDescription: string): string[] {
  const strengths: string[] = [];
  const resumeLower = resume.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Certifications match
  const certsInJob = (jobDescription.match(/(bachelor|master|phd|aws|gcp|azure|certified|certification)/gi) || []);
  const matchingCerts = certsInJob.filter((cert: string) => resumeLower.includes(cert.toLowerCase()));

  if (matchingCerts.length > 0) {
    strengths.push(`✓ Has ${matchingCerts.length} relevant certification(s) mentioned in job`);
  }

  // Experience level match
  const resumeExpYears = extractYearsOfExperience(resume);
  const jobExpYears = extractYearsOfExperience(jobDescription);

  if (resumeExpYears && jobExpYears) {
    if (resumeExpYears >= jobExpYears) {
      strengths.push(`✓ Meets experience requirement (${resumeExpYears}+ years vs ${jobExpYears} required)`);
    } else if (resumeExpYears >= jobExpYears * 0.8) {
      strengths.push(`✓ Experience close to requirement (${resumeExpYears} vs ${jobExpYears} years needed)`);
    }
  }

  // Portfolio/GitHub presence
  if (resumeLower.includes('github') || resumeLower.includes('portfolio') || resumeLower.includes('github.com')) {
    strengths.push('✓ Portfolio/GitHub profile visible (good for hiring teams)');
  }

  // Leadership experience
  if ((resumeLower.includes('led') || resumeLower.includes('managed') || resumeLower.includes('team lead')) &&
      (jobLower.includes('lead') || jobLower.includes('manage') || jobLower.includes('team'))) {
    strengths.push('✓ Relevant team/leadership experience');
  }

  // Quantified achievements
  if (resume.match(/(\d+%|\d+\s*(?:million|thousand|\$)|increase|growth|improve)/i)) {
    strengths.push('✓ Uses quantified metrics in achievements (ATS-friendly)');
  }

  // Industry match
  const detectedIndustries = detectIndustry(resume);
  const jobIndustries = detectIndustry(jobDescription);
  const overlap = detectedIndustries.filter(ind => jobIndustries.includes(ind));
  if (overlap.length > 0) {
    strengths.push(`✓ Relevant industry experience: ${overlap[0]}`);
  }

  return strengths;
}

/**
 * Identify resume gaps relative to job
 */
function identifyGaps(resume: string, jobDescription: string): string[] {
  const gaps: string[] = [];
  const resumeLower = resume.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  // Missing critical technologies
  const criticalTools = ['kubernetes', 'docker', 'aws', 'azure', 'gcp', 'react', 'python', 'java', 'go'];
  const toolsInJob = criticalTools.filter(tool => jobLower.includes(tool));
  const missingTools = toolsInJob.filter(tool => !resumeLower.includes(tool));

  if (missingTools.length > 0) {
    gaps.push(`→ Missing key tools: ${missingTools.join(', ')}`);
  }

  // Missing required ML/AI
  if (jobLower.includes('machine learning') && !resumeLower.includes('machine learning') && !resumeLower.includes('ml')) {
    gaps.push('→ Job requires ML/AI; not visible in resume');
  }

  // Missing DevOps/CI-CD
  if (jobLower.includes('devops') && !resumeLower.includes('devops') && !resumeLower.includes('ci/cd')) {
    gaps.push('→ DevOps/CI-CD emphasized; not clearly mentioned');
  }

  // Missing security focus
  if (jobLower.includes('security') && !resumeLower.includes('security')) {
    gaps.push('→ Security is key; needs stronger security background mention');
  }

  // Experience level mismatch
  const jobExpYears = extractYearsOfExperience(jobDescription);
  const resumeExpYears = extractYearsOfExperience(resume);
  if (jobExpYears && resumeExpYears && resumeExpYears < jobExpYears * 0.5) {
    gaps.push(`→ Experience gap: ${jobExpYears} years required vs ${resumeExpYears} shown`);
  }

  // No quantified achievements
  if (!resume.match(/(\d+%|\$\d+|increased|improved|grew|reduced)/i)) {
    gaps.push('→ No quantified metrics in achievements (hurts ATS score)');
  }

  return gaps;
}

/**
 * Generate top 5 specific, actionable improvements
 * Prioritized by impact and effort estimation
 */
function generateTopImprovements(
  resume: string,
  jobDescription: string,
  missingKeywords: ExtractedKeyword[]
): string[] {
  const improvements: string[] = [];
  const jobLower = jobDescription.toLowerCase();

  // Priority 1: Add top missing CRITICAL/MUST-HAVE skills (quick wins)
  const criticalMissing = missingKeywords
    .filter(k => k.weight >= 2.0)
    .slice(0, 2)
    .map(k => k.keyword);

  if (criticalMissing.length > 0) {
    const urgency = criticalMissing.length === 1 ? 'CRITICAL:' : 'CRITICAL:';
    improvements.push(`1. ${urgency} Add/emphasize experience with: ${criticalMissing.join(', ')}`);
  }

  // Priority 2: Emphasize role-specific keywords and seniority markers
  const jobTitle = extractJobTitle(jobDescription);
  if (jobTitle && !resume.toLowerCase().includes(jobTitle.toLowerCase())) {
    improvements.push(`2. Highlight your "${jobTitle}" or similar role experience prominently in summary`);
  } else {
    // If role is already there, focus on seniority
    if ((jobLower.includes('senior') || jobLower.includes('lead')) && !resume.toLowerCase().match(/(?:senior|lead|principal)/)) {
      improvements.push('2. Emphasize seniority level and leadership contributions to stand out');
    } else {
      improvements.push('2. Restructure to lead with most relevant experience for this role');
    }
  }

  // Priority 3: Quantify achievements and add metrics
  if (!resume.match(/(\d+%|\$\d+\+?M?|increased|improved|grew|reduced|optimized|saved)/i)) {
    improvements.push('3. Quantify impact with metrics: "increased speed by 40%", "shipped 5 features", "managed $2M budget"');
  } else if (resume.match(/(\d+%|\$\d+)/i)) {
    // They have some metrics, suggest adding more
    improvements.push('3. Add more quantified achievements to strengthen each role description');
  }

  // Priority 4: Gain certifications or specific tool expertise
  let certSuggestion = '';
  if (jobLower.includes('aws') && !resume.toLowerCase().includes('aws')) {
    certSuggestion = 'AWS Solutions Architect Associate or Developer Associate';
  } else if (jobLower.includes('kubernetes') && !resume.toLowerCase().includes('kubernetes')) {
    certSuggestion = 'Certified Kubernetes Administrator (CKA)';
  } else if (jobLower.includes('cloud') && !resume.toLowerCase().match(/aws|azure|gcp|cloud/)) {
    certSuggestion = 'cloud platform certification (AWS, Azure, or GCP)';
  } else if (jobLower.includes('security') && !resume.toLowerCase().includes('security')) {
    certSuggestion = 'relevant security certification';
  }

  if (certSuggestion) {
    improvements.push(`4. Pursue ${certSuggestion} and gain hands-on project experience`);
  }

  // Priority 5: Strategic resume positioning
  if (!improvements.some(i => i.includes('summary') || i.includes('professional'))) {
    if (jobLower.includes('leadership') && !resume.toLowerCase().match(/lead|mentor|manage/)) {
      improvements.push('5. Highlight leadership and mentoring experiences; use "led", "managed", "mentored"');
    } else if (jobLower.includes('full.?stack') && !resume.toLowerCase().match(/full.?stack/)) {
      improvements.push('5. Explicitly mention full-stack contributions; highlight both frontend and backend work');
    } else if (!resume.toLowerCase().includes('summary')) {
      improvements.push('5. Add professional summary tailored to this role in your next application');
    } else {
      improvements.push('5. Mirror job description language; use their keywords naturally in your bullets');
    }
  }

  return improvements.slice(0, 5);
}

/**
 * Generate ATS optimization tips
 */
function generateATSTips(resume: string, jobDescription: string, keywordDensity: number): string[] {
  const tips: string[] = [];
  const resumeLower = resume.toLowerCase();

  if (keywordDensity < 30) {
    tips.push('• Add more keywords from job posting (keyword density is low)');
  }

  if (!resume.match(/[A-Z][a-z]+\s+[A-Z][a-z]+/) || resume.split('\n').length < 15) {
    tips.push('• Consider expanding sections with more detail');
  }

  if (!resumeLower.includes('summary') && !resumeLower.includes('professional profile')) {
    tips.push('• Add professional summary personalized to this role');
  }

  if (!resumeLower.includes('•') && !resume.match(/^\s*-/m)) {
    tips.push('• Use bullet points/clean formatting (improves ATS parsing)');
  }

  if (resume.includes('(')) {
    tips.push('• Check for special characters; some ATSs struggle with parentheses');
  }

  return tips.slice(0, 3);
}

/**
 * Calculate section-specific match scores
 */
function calculateSectionScores(
  resume: string,
  jobDescription: string,
  matchedKeywords: { technical: string[]; soft: string[]; actionVerbs: string[] },
  coverage: { coverage: number; covered: string[]; uncovered: string[] }
): {
  skills: number;
  experience: number;
  keywords: number;
  roleAlignment: number;
} {
  const resumeKeywords = extractKeywords(resume);
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywordSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
  const totalJobKeywords = jobKeywords.length;

  // Skills match: % of technical + soft skills matched
  const totalSkills = matchedKeywords.technical.length + matchedKeywords.soft.length;
  const jobRequiredSkills = totalJobKeywords * 0.6;  // Estimate required skills
  const skillsScore = Math.min(100, Math.round((totalSkills / Math.max(jobRequiredSkills, 1)) * 100));

  // Experience match: Based on coverage + years
  const experienceScore = coverage.coverage;

  // Keywords match: % of all keywords from JD found in resume
  const keywordsScore = Math.round((resumeKeywordSet.size / Math.max(totalJobKeywords, 1)) * 100);

  // Role alignment: Based on action verbs + industry match
  const actionVerbCount = matchedKeywords.actionVerbs.length;
  const resumeIndustries = detectIndustry(resume);
  const jobIndustries = detectIndustry(jobDescription);
  const industryMatch = resumeIndustries.filter(ind => jobIndustries.includes(ind)).length > 0;
  const roleAlignment = Math.min(100, Math.round((actionVerbCount / 5 * 50) + (industryMatch ? 50 : 0)));

  return {
    skills: Math.min(100, skillsScore),
    experience: Math.min(100, experienceScore),
    keywords: Math.min(100, keywordsScore),
    roleAlignment: Math.min(100, roleAlignment)
  };
}

/**
 * Generate match verdict based on score
 */
function generateVerdict(score: number): 'Strong' | 'Moderate' | 'Weak' {
  if (score >= 75) return 'Strong';
  if (score >= 50) return 'Moderate';
  return 'Weak';
}

/**
 * Main function: Compare resume against job description
 */
export function matchResumeToJob(resume: string, jobDescription: string): MatchResult {
  // Validate inputs
  if (!resume.trim() || !jobDescription.trim()) {
    return {
      matchScore: 0,
      verdict: 'Weak',
      verdictReasoning: 'Please enter both resume and job description to receive analysis.',
      actionability: 'long-term',
      confidence: 0,
      breakdown: { skillsMatch: 0, experienceMatch: 0, keywordFrequencyMatch: 0, roleAlignment: 0 },
      matchedKeywords: { technical: [], soft: [], actionVerbs: [] },
      missingKeywords: { technical: [], soft: [] },
      missingByPriority: [],
      missingSkillsWithContext: [],
      strengths: ['Please enter both resume and job description text.'],
      gaps: [],
      improvements: [],
      sectionAnalysis: { skills: 0, experience: 0, keywords: 0, roleAlignment: 0 },
      atsTips: [],
      keywordDensity: 0
    };
  }

  // Extract keywords with weighting
  const jobKeywordsDetailed = extractKeywordsWithDetails(jobDescription);
  const resumeKeywordsDetailed = extractKeywordsWithDetails(resume);
  const jobKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resume);

  // Calculate weighted match
  const weightedMatch = calculateWeightedMatchPercentage(resume, jobDescription);

  // Calculate standard keyword match
  const keywordMatchPercentage = calculateKeywordMatchPercentage(resume, jobDescription);

  // Categorize matched keywords
  const resumeKeywordSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
  const matchedKeywords = categorizeKeywords(
    jobKeywords.filter(k => resumeKeywordSet.has(k.toLowerCase()))
  );

  // Get missing keywords sorted by priority
  const missingByPriority = getMissingKeywordsByPriority(resume, jobDescription);
  const missing = findMissingKeywords(resume, jobDescription);
  const missingCategorized = categorizeKeywords(missing);

  // Extract requirements and assess coverage
  const requirements = extractJobRequirements(jobDescription);
  const allRequirements = [...requirements.required, ...requirements.preferred];
  const coverage = assessRequirementsCoverage(resume, allRequirements);

  // Calculate section scores
  const sectionAnalysis = calculateSectionScores(resume, jobDescription, matchedKeywords, coverage);

  // Extract experience and industry info for context
  const yearsOfExperience = extractYearsOfExperience(resume);
  const experienceLevel = estimateExperienceLevel(resume); // Pass resume string directly
  const industryList = detectIndustry(resume);

  // Build critical tools set
  const criticalToolsSet = new Set<string>();
  Object.values(CRITICAL_TOOLS).forEach(tools => {
    tools.forEach(tool => criticalToolsSet.add(tool.toLowerCase()));
  });

  // Find missing critical tools
  const missingCriticalTools: string[] = [];
  missingByPriority.slice(0, 10).forEach(keyword => {
    if (criticalToolsSet.has(keyword.keyword.toLowerCase())) {
      missingCriticalTools.push(keyword.keyword);
    }
  });

  // Create scoring context matching ScoringContext interface
  const scoringContext: import('./scoreConstants').ScoringContext = {
    matchedCount: matchedKeywords.technical.length + matchedKeywords.soft.length,
    totalInJD: jobKeywords.length,
    criticalMissing: missingCriticalTools,
    experienceGap: yearsOfExperience - extractYearsOfExperience(jobDescription),
    hasPortfolio: resume.toLowerCase().includes('github') || resume.toLowerCase().includes('portfolio'),
    hasMetrics: /(\d+%|\$\d+|\d+\s*(?:million|thousand))/i.test(resume),
    hasSummary: /(?:objective|summary|professional profile)/i.test(resume),
    industryMatches: (Array.isArray(industryList) ? industryList.length : 1),
    certMatches: Object.values(CERTIFICATIONS)
      .flat()
      .filter(cert => resume.toLowerCase().includes(cert.toLowerCase())).length
  };

  // Calculate enhanced score using new formula from scoreConstants
  const enhancedScoreResult = calculateEnhancedScore(
    weightedMatch.percentage,
    coverage.coverage,
    sectionAnalysis.roleAlignment,
    sectionAnalysis.experience,
    scoringContext
  );
  const matchScore = Math.min(100, enhancedScoreResult.score);

  // Calculate keyword density for verdict reasoning
  const keywordDensity = jobKeywords.length > 0
    ? Math.round((matchedKeywords.technical.length + matchedKeywords.soft.length) / jobKeywords.length * 100)
    : 0;

  // Generate verdict with reasoning
  const verdictInfo = generateVerdictWithReasoning(matchScore, scoringContext, keywordDensity);
  const verdict = verdictInfo.verdict;

  // Calculate confidence (higher when we have good data)
  const dataQuality = Math.min(100, (jobKeywords.length + resumeKeywords.length) / 4);
  const confidence = Math.round((matchScore * 0.7) + (dataQuality * 0.3));

  // Categorize missing skills by urgency
  const missingSkillsCategorized = categorizeMissingSkills(
    missingByPriority,
    new Set(missingCriticalTools.map(t => t.toLowerCase()))
  );

  // Flatten the categorized skills for easier processing
  const allCategorizedSkills = [
    ...missingSkillsCategorized.mustHave.map(s => ({ ...s, category: 'must-have' as const })),
    ...missingSkillsCategorized.shouldHave.map(s => ({ ...s, category: 'should-have' as const })),
    ...missingSkillsCategorized.niceToHave.map(s => ({ ...s, category: 'nice-to-have' as const }))
  ];

  // Estimate effort for each missing skill
  const missingSkillsWithEffort = allCategorizedSkills.slice(0, 10).map((skillItem, idx) => ({
    skill: skillItem.keyword,
    category: skillItem.category,
    effort: estimateGapEffort(skillItem.keyword, skillItem.category),
    priority: idx + 1
  }));

  // Generate insights
  const strengths = identifyStrengths(resume, jobDescription);
  const gaps = identifyGaps(resume, jobDescription);
  const improvements = generateTopImprovements(resume, jobDescription, missingByPriority);
  const atsTips = generateATSTips(resume, jobDescription, keywordDensity);

  // Create result object with enhanced fields
  const result: MatchResult = {
    matchScore,
    verdict,
    verdictReasoning: verdictInfo.reason,
    actionability: verdictInfo.actionable ? 'immediately-addressable' : 'long-term',
    confidence,
    breakdown: {
      skillsMatch: sectionAnalysis.skills,
      experienceMatch: sectionAnalysis.experience,
      keywordFrequencyMatch: weightedMatch.percentage,
      roleAlignment: sectionAnalysis.roleAlignment
    },
    matchedKeywords,
    missingKeywords: missingCategorized,
    missingByPriority,
    missingSkillsWithContext: missingSkillsWithEffort,
    strengths,
    gaps,
    improvements,
    sectionAnalysis,
    atsTips,
    keywordDensity
  };

  return result;
}
