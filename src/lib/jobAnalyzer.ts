/**
 * Job Description Analyzer - Professional Grade Analysis
 * Transforms raw job descriptions into structured, actionable intelligence
 */

import { extractKeywords, categorizeKeywords, estimateExperienceLevel } from './keywordAnalysis';

// Comprehensive skill database by category
const SKILL_DATABASE = {
  programming_languages: [
    'python', 'javascript', 'java', 'typescript', 'c++', 'c#', 'go', 'rust', 'php', 'ruby',
    'swift', 'kotlin', 'scala', 'perl', 'r programming', 'matlab', 'vb.net', 'groovy'
  ],
  frontend_frameworks: [
    'react', 'vue', 'angular', 'svelte', 'next.js', 'nuxt', 'ember', 'backbone',
    'jquery', 'bootstrap', 'tailwind', 'material ui', 'semantic ui'
  ],
  backend_frameworks: [
    'django', 'flask', 'fastapi', 'spring', 'spring boot', 'express', 'nestjs', 'gin',
    'gorilla', 'laravel', 'symfony', 'rails', 'node.js'
  ],
  database_technologies: [
    'postgresql', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'cassandra', 'dynamo',
    'firebase', 'firestore', 'hbase', 'neo4j', 'sql server', 'oracle'
  ],
  cloud_platforms: [
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digital ocean', 'linode', 'alibaba cloud'
  ],
  devops_tools: [
    'docker', 'kubernetes', 'jenkins', 'circleci', 'terraform', 'ansible', 'github actions',
    'gitlab ci', 'travis ci', 'helm', 'prometheus', 'grafana'
  ],
  data_science: [
    'pandas', 'numpy', 'scikit-learn', 'tensorflow', 'pytorch', 'keras', 'spark',
    'hadoop', 'tableau', 'power bi', 'machine learning', 'deep learning'
  ],
  other_tools: [
    'git', 'svn', 'agile', 'scrum', 'jira', 'asana', 'slack', 'confluence', 'rest api',
    'graphql', 'soap', 'microservices', 'linux', 'windows server'
  ]
};

// Soft skills database
const SOFT_SKILLS_DB = [
  'communication', 'leadership', 'teamwork', 'problem-solving', 'analytical', 'critical thinking',
  'project management', 'time management', 'public speaking', 'mentoring', 'collaboration',
  'presentation', 'attention to detail', 'initiative', 'adaptability', 'customer service',
  'interpersonal', 'organization', 'creativity', 'innovation'
];

// Interview focus areas by keywords
const INTERVIEW_FOCUS_PATTERNS = {
  'system design': ['architecture', 'scalability', 'distributed', 'microservices', 'high-traffic'],
  'coding challenges': ['algorithms', 'data structures', 'optimization', 'efficiency'],
  'behavioral': ['leadership', 'teamwork', 'conflict resolution', 'mentoring', 'communication'],
  'domain knowledge': ['e-commerce', 'healthcare', 'finance', 'fintech', 'banking', 'education'],
  'technical depth': ['advanced', 'expert', 'mastery', 'deep understanding', 'specialized'],
  'product sense': ['product thinking', 'user experience', 'impact', 'metrics', 'user focused']
};

export interface JobAnalysis {
  title: string | null;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'unknown';
  yearsRequired: number | null;
  jobType: 'remote' | 'on-site' | 'hybrid' | 'unknown';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Skills categorized by importance
  keySkills: string[];
  skillsByPriority: {
    critical: string[];      // Must-have
    important: string[];      // Required
    nice_to_have: string[];   // Preferred
  };
  tools: string[];
  softSkills: string[];
  
  // Structured content
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
  
  // Analysis quality metrics
  missingSkillsForCandidates: string[];
  topKeywordsForResume: string[];
  interviewFocusAreas: string[];
  
  // Actionable insights
  resumeOptimizationTips: string[];
  recruiterFocusPoints: string[];
  companyIntent: string;
}

/**
 * Text normalization and cleaning
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extract job title with improved patterns
 */
function extractJobTitleFromJD(text: string): string | null {
  const patterns = [
    /^\s*#+\s*([A-Za-z\s\-()\/]+?)\s*(?:position|role|job|opening)?[\n]?$/im, // Markdown header
    /(?:position|role|opening|job title|job name|title)[:\s]+([A-Za-z\s\-()\/]+?)(?:\n|$)/im,
    /^\s*([A-Za-z\s\-()\/]+?)\s*(?:position|role|job|opening)\s*$/im,
    /(?:we're|we are|hiring|seeking)?\s+(?:looking for|seeking|hiring)\s+(?:a|an|the)?\s*([A-Za-z\s\-()\/]+?)(?:\s+(?:to|with|who|in))/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim();
      if (title.length > 3 && title.length < 80 && !/position|role|job|opening|apply|send|submit/i.test(title)) {
        return title;
      }
    }
  }
  return null;
}

/**
 * Detect job type (remote/on-site/hybrid)
 */
function detectJobType(text: string): 'remote' | 'on-site' | 'hybrid' | 'unknown' {
  const lower = normalizeText(text);
  
  if (lower.includes('remote') || lower.includes('work from home') || lower.includes('wfh')) return 'remote';
  if (lower.includes('hybrid')) return 'hybrid';
  if (lower.includes('on-site') || lower.includes('onsite') || lower.includes('in-office') || lower.includes('office location')) return 'on-site';
  
  return 'unknown';
}

/**
 * Extract years of experience required
 */
function extractYearsRequired(text: string): number | null {
  const patterns = [
    /(\d+)\s*(?:\+)?\s*years?\s+(?:of\s+)?(?:experience|exp|yoe)/i,
    /require[sd]?\s+(\d+)\s*(?:\+)?\s*years?\s+(?:of\s+)?experience/i,
    /(\d+)\s*-\s*(\d+)\s*years?\s+(?:of\s+)?experience/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1], 10);
    }
  }
  return null;
}

/**
 * Calculate difficulty level based on content
 */
function calculateDifficultyLevel(
  experienceLevel: string,
  yearsRequired: number | null,
  skills: string[],
  text: string
): 'beginner' | 'intermediate' | 'advanced' | 'expert' {
  const lower = normalizeText(text);
  let score = 0;

  // Experience level scores
  if (experienceLevel === 'junior') score += 1;
  else if (experienceLevel === 'mid') score += 2;
  else if (experienceLevel === 'senior') score += 3;
  else if (experienceLevel === 'lead') score += 4;

  // Years of experience
  if (yearsRequired) {
    if (yearsRequired < 3) score += 1;
    else if (yearsRequired < 6) score += 2;
    else if (yearsRequired < 10) score += 3;
    else score += 4;
  }

  // Technical complexity keywords
  if (/advanced|expert|mastery|deep understanding|specialized|niche/i.test(lower)) score += 2;
  if (/architecture|distributed|microservices|system design|scalability/i.test(lower)) score += 2;
  if (/optimization|performance|high-traffic|millions/i.test(lower)) score += 1;

  // Soft skill complexity
  if (/leadership|mentoring|team lead|manage/i.test(lower)) score += 1;

  if (score >= 13) return 'expert';
  if (score >= 9) return 'advanced';
  if (score >= 5) return 'intermediate';
  return 'beginner';
}

/**
 * Extract and prioritize skills with pattern detection
 */
function extractAndPrioritizeSkills(text: string): { critical: string[]; important: string[]; nice_to_have: string[] } {
  const lower = normalizeText(text);
  const result = { critical: [] as string[], important: [] as string[], nice_to_have: [] as string[] };

  // Find required vs preferred sections
  const requiredMatch = text.match(/(?:required|must have|essential)([\s\S]{0,2000}?)(?=preferred|nice to have|qualifications|benefits)/i);
  const preferredMatch = text.match(/(?:preferred|nice to have|bonus|good to have)([\s\S]{0,1500}?)(?=qualifications|requirements|benefits|$)/i);

  const requiredSection = requiredMatch ? requiredMatch[1] : lower;
  const preferredSection = preferredMatch ? preferredMatch[1] : '';

  // Check skills in required section
  Object.entries(SKILL_DATABASE).forEach(([category, skillsList]) => {
    skillsList.forEach(skill => {
      if (requiredSection.includes(skill)) {
        if (!result.critical.includes(skill)) {
          result.critical.push(skill);
        }
      } else if (preferredSection.includes(skill.toLowerCase())) {
        if (!result.nice_to_have.includes(skill)) {
          result.nice_to_have.push(skill);
        }
      } else if (lower.includes(skill)) {
        if (!result.important.includes(skill)) {
          result.important.push(skill);
        }
      }
    });
  });

  return result;
}

/**
 * Extract tools with improved detection
 */
function extractTools(text: string): string[] {
  const toolsDatabase = [
    // Cloud
    'aws', 'azure', 'gcp', 'google cloud', 'heroku', 'digital ocean', 'vercel', 'netlify',
    // Containers & Orchestration
    'docker', 'kubernetes', 'k8s', 'helm', 'podman',
    // CI/CD
    'jenkins', 'circleci', 'travis', 'github actions', 'gitlab ci', 'travis ci',
    // Databases
    'postgresql', 'postgres', 'mysql', 'mongodb', 'firestore', 'firebase', 'dynamodb', 'redis', 'elasticsearch',
    // Message Queues
    'kafka', 'rabbitmq', 'activemq', 'sns', 'sqs',
    // Monitoring
    'datadog', 'newrelic', 'splunk', 'sentry', 'prometheus', 'grafana', 'cloudwatch',
    // Project Management
    'jira', 'asana', 'monday', 'trello', 'confluence', 'notion',
    // Testing
    'jest', 'pytest', 'mocha', 'chai', 'rspec', 'jasmine', 'cypress', 'selenium', 'junit',
    // IaaC & Config
    'terraform', 'ansible', 'puppet', 'chef',
    // VCS
    'git', 'github', 'gitlab', 'bitbucket', 'azure devops',
    // APIs & Protocols
    'rest', 'graphql', 'grpc', 'soap', 'webhooks',
    // Other
    'slack', 'docker', 'linux', 'windows'
  ];

  const lower = normalizeText(text);
  return toolsDatabase.filter(tool => lower.includes(tool));
}

/**
 * Identify missing skills for candidates
 */
function identifyMissingSkills(allSkills: string[], yearsRequired: number | null): string[] {
  const missing: string[] = [];

  // Suggest foundational skills if junior/mid level
  if (!yearsRequired || yearsRequired < 5) {
    const foundational = ['data structures', 'algorithms', 'version control (git)', 'testing practices'];
    foundational.forEach(skill => {
      if (!allSkills.some(s => s.includes(skill.split('(')[0].trim()))) {
        missing.push(skill);
      }
    });
  }

  // Suggest senior skills if senior/lead level
  if (yearsRequired && yearsRequired >= 8) {
    const senior = ['system design', 'architecture patterns', 'mentoring skills', 'technical leadership'];
    senior.forEach(skill => {
      if (!allSkills.some(s => s.includes(skill.split('(')[0].trim()))) {
        missing.push(skill);
      }
    });
  }

  return missing;
}

/**
 * Extract top keywords weighted by frequency
 */
function extractTopKeywordsByFrequency(text: string, count: number = 5): string[] {
  const keywords = extractKeywords(text);
  const frequency: { [key: string]: number } = {};

  keywords.forEach(kw => {
    const lower = kw.toLowerCase();
    frequency[lower] = (frequency[lower] || 0) + 1;
  });

  return Object.entries(frequency)
    .sort(([, freqA], [, freqB]) => freqB - freqA)
    .slice(0, count)
    .map(([kw]) => kw);
}

/**
 * Detect interview focus areas
 */
function detectInterviewFocusAreas(text: string): string[] {
  const lower = normalizeText(text);
  const areas: string[] = [];

  Object.entries(INTERVIEW_FOCUS_PATTERNS).forEach(([area, keywords]) => {
    if (keywords.some(kw => lower.includes(kw))) {
      areas.push(area);
    }
  });

  return areas.length > 0 ? areas : ['Technical competency', 'Problem-solving ability'];
}

/**
 * Generate company intent summary
 */
function generateCompanyIntent(text: string, experienceLevel: string): string {
  const lower = normalizeText(text);

  if (lower.includes('startup')) return 'Startup looking for versatile, fast-learning engineers who can wear multiple hats';
  if (lower.includes('enterprise')) return 'Enterprise seeking experienced professionals with focus on scalability and process';
  if (lower.includes('scale') || lower.includes('high-growth')) return 'High-growth company prioritizing scalability and optimization';
  if (lower.includes('security') || lower.includes('compliance')) return 'Organization prioritizing security, compliance, and robust architecture';
  if (lower.includes('innovation') || lower.includes('cutting-edge')) return 'Company focused on innovation and adopting cutting-edge technologies';
  if (lower.includes('mentor') || lower.includes('leadership')) return 'Team looking for experienced mentor or technical leader';
  
  if (experienceLevel === 'junior') return 'Team looking to mentor junior developers and provide growth opportunities';
  if (experienceLevel === 'senior' || experienceLevel === 'lead') return 'Organization seeking senior-level expertise and strategic thinking';
  
  return 'Company seeking skilled professionals who can contribute effectively to their team';
}

/**
 * Extract responsibilities with better bullet point handling
 */
function extractResponsibilities(text: string): string[] {
  const patterns = [
    /(?:your\s+)?responsibilities?[:\s]+?([\s\S]{0,2000}?)(?=qualifications|requirements|about|preferred|nice to|salary|benefits|expectations|success criteria)/i,
    /what you'll do[:\s]+?([\s\S]{0,2000}?)(?=requirements|qualifications|preferred|conditions)/i,
    /day-to-day[:\s]+?([\s\S]{0,1500}?)(?=requirements|qualifications|preferred)/i,
    /in this role[:\s]+?([\s\S]{0,1500}?)(?=requirements|qualifications|responsibilities)/i,
  ];

  let responsibilityText = '';

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      responsibilityText = match[1];
      break;
    }
  }

  // Extract clean bullet points
  const bullets = responsibilityText
    .split(/[\n•\-*►]/g)
    .map(item => {
      const cleaned = item
        .replace(/^\d+\.\s*/, '') // Remove numbers
        .replace(/\(.*?\)/g, '') // Remove parenthetical
        .trim();
      return cleaned;
    })
    .filter(item => item.length > 15 && item.length < 300)
    .slice(0, 12);

  return bullets.length > 0 ? bullets : ['See full job description for responsibilities'];
}

/**
 * Extract qualifications with priority detection
 */
function extractQualifications(text: string): string[] {
  const patterns = [
    /(?:qualifications?|requirements?|we're looking for|ideal candidate|must have|essential)[:\s]+([\s\S]{0,2000}?)(?=responsibilities|prefer|nice|about us|compensation|salary|benefits|apply|deadline|how to apply)/i,
  ];

  let qualText = '';

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      qualText = match[1];
      break;
    }
  }

  // Extract bullets
  const bullets = qualText
    .split(/[\n•\-*►]/g)
    .map(item => {
      const cleaned = item
        .replace(/^\d+\.\s*/, '')
        .trim();
      return cleaned;
    })
    .filter(item => item.length > 12 && item.length < 300)
    .slice(0, 12);

  return bullets.length > 0 ? bullets : ['See full job description for qualifications'];
}

/**
 * Generate smart resume optimization tips
 */
function generateResumeTips(analysis: Partial<JobAnalysis>): string[] {
  const tips: string[] = [];

  // Critical skills
  if (analysis.skillsByPriority?.critical && analysis.skillsByPriority.critical.length > 0) {
    tips.push(`Lead with these critical skills in your resume:${analysis.skillsByPriority.critical.slice(0, 4).join(', ')}`);
  }

  // Required skills
  if (analysis.skillsByPriority?.important && analysis.skillsByPriority.important.length > 0) {
    tips.push(`Ensure these are prominently mentioned: ${analysis.skillsByPriority.important.slice(0, 3).join(', ')}`);
  }

  // Tools
  if (analysis.tools && analysis.tools.length > 0) {
    tips.push(`Create a "Technical Skills" section highlighting: ${analysis.tools.slice(0, 5).join(', ')}`);
  }

  // Soft skills
  if (analysis.softSkills && analysis.softSkills.length > 0) {
    const topSoft = analysis.softSkills.slice(0, 3).map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(', ');
    tips.push(`Demonstrate these soft skills through achievements: ${topSoft}`);
  }

  // Keywords
  if (analysis.topKeywordsForResume && analysis.topKeywordsForResume.length > 0) {
    tips.push(`Use these keywords throughout your resume: "${analysis.topKeywordsForResume.join('", "')}"`);
  }

  // Quantification
  tips.push('Quantify achievements with metrics (improved X%, shipped Y features, managed $Z budget)');

  // Level-specific
  if (analysis.experienceLevel === 'senior' || analysis.experienceLevel === 'lead') {
    tips.push('Emphasize leadership, mentoring, and architectural contributions');
  } else if (analysis.experienceLevel === 'junior') {
    tips.push('Highlight learning ability and enthusiasm; include academic projects if relevant');
  }

  // Interview prep
  if (analysis.interviewFocusAreas && analysis.interviewFocusAreas.length > 0) {
    tips.push(`Research these topics before interview: ${analysis.interviewFocusAreas.slice(0, 2).join(', ')}`);
  }

  return tips.slice(0, 8);
}

/**
 * Generate recruiter focus points
 */
function generateRecruiterFocusPoints(text: string, analysis: Partial<JobAnalysis>): string[] {
  const points: string[] = [];
  const lower = normalizeText(text);

  // Company type insights
  if (lower.includes('startup') || lower.includes('fast-paced')) {
    points.push('Recruiter values adaptability, rapid learning, and comfort with ambiguity');
  } else if (lower.includes('enterprise')) {
    points.push('Recruiter values stability, process adherence, and ability to work in structured environments');
  }

  // Team dynamics
  if (lower.includes('collaboration') || lower.includes('team')) {
    points.push('Strong team collaboration and communication skills are critical to success');
  }

  // Technical depth
  if (lower.includes('advanced') || lower.includes('expert') || lower.includes('mastery')) {
    points.push('Recruiter seeks candidates with deep technical expertise in their domain');
  }

  // Leadership
  if (lower.includes('leadership') || lower.includes('mentor') || lower.includes('lead')) {
    points.push('Leadership and ability to mentor junior team members are must-haves');
  }

  // User/Customer focus
  if (lower.includes('customer') || lower.includes('user') || lower.includes('experience')) {
    points.push('Customer empathy and user-focused thinking are core to this company');
  }

  // Innovation
  if (lower.includes('innovation') || lower.includes('cutting-edge') || lower.includes('emerging')) {
    points.push('Organization values innovative thinking and staying current with technology');
  }

  // Impact
  if (lower.includes('impact') || lower.includes('scale') || lower.includes('millions')) {
    points.push('Recruiter cares about your ability to create measurable impact and scale solutions');
  }

  // Generic fallback
  if (points.length < 3) {
    points.push('Clearly demonstrate fit for the role requirements');
    points.push('Share specific examples of relevant experience and projects');
    points.push('Discuss your understanding of their company goals and culture');
  }

  return points.slice(0, 5);
}
/**
 * Main job description analyzer - Professional grade
 */
export function analyzeJobDescription(jobDescription: string): JobAnalysis {
  if (!jobDescription.trim() || jobDescription.length < 100) {
    return {
      title: null,
      experienceLevel: 'unknown',
      yearsRequired: null,
      jobType: 'unknown',
      difficultyLevel: 'beginner',
      keySkills: [],
      skillsByPriority: { critical: [], important: [], nice_to_have: [] },
      tools: [],
      softSkills: [],
      responsibilities: [],
      qualifications: [],
      keywords: [],
      missingSkillsForCandidates: [],
      topKeywordsForResume: [],
      interviewFocusAreas: [],
      resumeOptimizationTips: ['Please enter a complete job description for detailed analysis'],
      recruiterFocusPoints: ['Provide the full job posting for best results'],
      companyIntent: 'Unable to determine'
    };
  }

  // Extract core information
  const title = extractJobTitleFromJD(jobDescription);
  const experienceLevel = estimateExperienceLevel(jobDescription);
  const yearsRequired = extractYearsRequired(jobDescription);
  const jobType = detectJobType(jobDescription);

  // Extract keywords
  const keywordsExtracted = extractKeywords(jobDescription);
  const categorized = categorizeKeywords(keywordsExtracted);

  // Extract and prioritize skills
  const skillsByPriority = extractAndPrioritizeSkills(jobDescription);
  const allExtractedSkills = [
    ...skillsByPriority.critical,
    ...skillsByPriority.important,
    ...skillsByPriority.nice_to_have
  ];

  // Extract tools and soft skills
  const tools = extractTools(jobDescription);
  const softSkillsExtracted = SOFT_SKILLS_DB.filter(skill =>
    jobDescription.toLowerCase().includes(skill)
  );

  // Extract responsibilities and qualifications
  const responsibilities = extractResponsibilities(jobDescription);
  const qualifications = extractQualifications(jobDescription);

  // Calculate difficulty level
  const difficultyLevel = calculateDifficultyLevel(experienceLevel, yearsRequired, allExtractedSkills, jobDescription);

  // Generate all analysis
  const missingSkillsForCandidates = identifyMissingSkills(allExtractedSkills, yearsRequired);
  const topKeywordsForResume = extractTopKeywordsByFrequency(jobDescription, 5);
  const interviewFocusAreas = detectInterviewFocusAreas(jobDescription);
  const companyIntent = generateCompanyIntent(jobDescription, experienceLevel);

  // Create analysis object
  const analysis: JobAnalysis = {
    title,
    experienceLevel,
    yearsRequired,
    jobType,
    difficultyLevel,
    keySkills: skillsByPriority.critical.slice(0, 8),
    skillsByPriority,
    tools: tools.slice(0, 10),
    softSkills: softSkillsExtracted.slice(0, 6),
    responsibilities,
    qualifications,
    keywords: keywordsExtracted.slice(0, 15),
    missingSkillsForCandidates,
    topKeywordsForResume,
    interviewFocusAreas,
    resumeOptimizationTips: [],
    recruiterFocusPoints: [],
    companyIntent
  };

  // Generate final tips
  analysis.resumeOptimizationTips = generateResumeTips(analysis);
  analysis.recruiterFocusPoints = generateRecruiterFocusPoints(jobDescription, analysis);

  return analysis;
}
