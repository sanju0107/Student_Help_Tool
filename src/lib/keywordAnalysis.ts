/**
 * Keyword extraction and analysis utilities
 * Provides heuristic-based keyword detection from text
 */

// Priority weights for keyword importance
export const KEYWORD_IMPORTANCE = {
  CRITICAL: 2.0,   // Must-have tools/skills explicitly required
  HIGH: 1.5,       // Important skills, mentioned multiple times
  MEDIUM: 1.0,     // Standard mentions
  LOW: 0.5         // Optional, mentioned once
};

// Skill categories with priority
export interface SkillCategory {
  name: string;
  keywords: string[];
  weight: number;
}

/**
 * Programming languages (most important for tech roles)
 */
const PROGRAMMING_LANGUAGES: SkillCategory = {
  name: 'Programming Languages',
  keywords: [
    'javascript', 'python', 'java', 'typescript', 'c#', 'c++', 'php', 'ruby', 'go', 'rust',
    'kotlin', 'swift', 'objective-c', 'scala', 'r', 'matlab', 'perl', 'elixir', 'haskell', 'clojure'
  ],
  weight: KEYWORD_IMPORTANCE.HIGH
};

/**
 * Web frameworks
 */
const WEB_FRAMEWORKS: SkillCategory = {
  name: 'Web Frameworks',
  keywords: [
    'react', 'angular', 'vue', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
    'asp.net', 'rails', 'nextjs', 'svelte', 'nuxt', 'fastapi', 'remix', 'astro'
  ],
  weight: KEYWORD_IMPORTANCE.HIGH
};

/**
 * Database technologies
 */
const DATABASES: SkillCategory = {
  name: 'Databases',
  keywords: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'firebase', 'dynamodb', 'redis', 'cassandra',
    'elasticsearch', 'oracle', 'sqlserver', 'snowflake', 'bigquery', 'mariadb', 'neo4j'
  ],
  weight: KEYWORD_IMPORTANCE.HIGH
};

/**
 * Cloud platforms and DevOps
 */
const CLOUD_DEVOPS: SkillCategory = {
  name: 'Cloud & DevOps',
  keywords: [
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'jenkins', 'gitlab',
    'github', 'terraform', 'ansible', 'ci/cd', 'circleci', 'travis', 'argocd', 'helm'
  ],
  weight: KEYWORD_IMPORTANCE.HIGH
};

/**
 * Frontend tools and technologies
 */
const FRONTEND_TOOLS: SkillCategory = {
  name: 'Frontend Technologies',
  keywords: [
    'html', 'css', 'scss', 'sass', 'webpack', 'vite', 'babel', 'jest', 'testing library',
    'cypress', 'selenium', 'playwright', 'typescript', 'jsx', 'tsx', 'tailwind', 'bootstrap'
  ],
  weight: KEYWORD_IMPORTANCE.MEDIUM
};

/**
 * Backend and system tools
 */
const BACKEND_TOOLS: SkillCategory = {
  name: 'Backend & System',
  keywords: [
    'git', 'rest', 'graphql', 'websockets', 'linux', 'unix', 'shell', 'bash', 'grpc',
    'microservices', 'serverless', 'lambda', 'api', 'soap', 'authentication', 'oauth'
  ],
  weight: KEYWORD_IMPORTANCE.MEDIUM
};

/**
 * AI/ML specializations
 */
const AI_ML: SkillCategory = {
  name: 'AI & Machine Learning',
  keywords: [
    'machine learning', 'deep learning', 'tensorflow', 'pytorch', 'scikit-learn', 'pandas',
    'numpy', 'opencv', 'nlp', 'computer vision', 'bert', 'gpt', 'llm', 'hugging face',
    'transformers', 'neural networks', 'reinforcement learning', 'gan'
  ],
  weight: KEYWORD_IMPORTANCE.HIGH
};

/**
 * Data processing and analytics
 */
const DATA_ANALYTICS: SkillCategory = {
  name: 'Data & Analytics',
  keywords: [
    'data analysis', 'analytics', 'bi', 'business intelligence', 'tableau', 'power bi',
    'looker', 'sql', 'etl', 'data warehouse', 'spark', 'hadoop', 'flink'
  ],
  weight: KEYWORD_IMPORTANCE.MEDIUM
};

/**
 * Soft skills (important but lower weight than technical)
 */
const SOFT_SKILLS: SkillCategory = {
  name: 'Soft Skills',
  keywords: [
    'communication', 'teamwork', 'leadership', 'problem solving', 'critical thinking',
    'time management', 'organization', 'project management', 'stakeholder management',
    'collaboration', 'negotiation', 'presentation', 'public speaking', 'adaptability',
    'creativity', 'analytical', 'attention to detail', 'documentation', 'mentoring'
  ],
  weight: KEYWORD_IMPORTANCE.MEDIUM
};

/**
 * Action verbs (indicate impact and experience)
 */
const ACTION_VERBS: SkillCategory = {
  name: 'Action Verbs',
  keywords: [
    'developed', 'implemented', 'designed', 'created', 'built', 'engineered', 'architected',
    'led', 'managed', 'coordinated', 'supervised', 'directed', 'orchestrated', 'optimized',
    'improved', 'enhanced', 'accelerated', 'streamlined', 'automated', 'reduced', 'increased',
    'achieved', 'accomplished', 'delivered', 'executed', 'launched', 'deployed', 'released',
    'analyzed', 'evaluated', 'assessed', 'researched', 'investigated', 'identified',
    'established', 'pioneered', 'transformed', 'modernized', 'innovated', 'mentored',
    'trained', 'educated', 'drove', 'spearheaded', 'initiated', 'championed', 'scaled'
  ],
  weight: KEYWORD_IMPORTANCE.MEDIUM
};

/**
 * Certifications commonly required
 */
const CERTIFICATIONS: SkillCategory = {
  name: 'Certifications',
  keywords: [
    'aws', 'pmp', 'cissp', 'gcp', 'azure', 'docker', 'kubernetes', 'scrum master',
    'bachelor', 'master', 'phd', 'comptia', 'sec+', 'certified'
  ],
  weight: KEYWORD_IMPORTANCE.HIGH
};

/**
 * All skill categories for comprehensive analysis
 */
export const ALL_SKILL_CATEGORIES = [
  PROGRAMMING_LANGUAGES,
  WEB_FRAMEWORKS,
  DATABASES,
  CLOUD_DEVOPS,
  FRONTEND_TOOLS,
  BACKEND_TOOLS,
  AI_ML,
  DATA_ANALYTICS,
  SOFT_SKILLS,
  ACTION_VERBS,
  CERTIFICATIONS
];

/**
 * Build a hashmap of all keywords for fast lookup with category info
 */
const keywordIndex = new Map<string, { category: string; weight: number }>();
ALL_SKILL_CATEGORIES.forEach(category => {
  category.keywords.forEach(keyword => {
    keywordIndex.set(keyword.toLowerCase(), {
      category: category.name,
      weight: category.weight
    });
  });
});

/**
 * Get all technical skills (non-soft)
 */
function getAllTechnicalSkills(): Set<string> {
  const technicalCategories = [
    PROGRAMMING_LANGUAGES, WEB_FRAMEWORKS, DATABASES, CLOUD_DEVOPS,
    FRONTEND_TOOLS, BACKEND_TOOLS, AI_ML, DATA_ANALYTICS, CERTIFICATIONS
  ];
  const allTech = new Set<string>();
  technicalCategories.forEach(cat => {
    cat.keywords.forEach(kw => allTech.add(kw.toLowerCase()));
  });
  return allTech;
}

const ALL_TECH_SKILLS = getAllTechnicalSkills();
const SOFT_SKILLS_SET = new Set(SOFT_SKILLS.keywords.map(s => s.toLowerCase()));
const ACTION_VERBS_SET = new Set(ACTION_VERBS.keywords.map(s => s.toLowerCase()));

/**
 * Extracts keywords from text with category and weight information
 */
export interface ExtractedKeyword {
  keyword: string;
  category: string;
  weight: number;
  count: number;  // How many times mentioned
}

/**
 * Extract keywords with detailed information
 */
export function extractKeywordsWithDetails(text: string): ExtractedKeyword[] {
  const lowerText = text.toLowerCase();
  const keywordMap = new Map<string, ExtractedKeyword>();
  
  // Find all keywords
  keywordIndex.forEach((info, keyword) => {
    // Count occurrences
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    
    if (count > 0) {
      const weight = info.weight * (1 + Math.min(count - 1, 2) * 0.2); // Max 2x boost for frequency
      keywordMap.set(keyword, {
        keyword,
        category: info.category,
        weight,
        count
      });
    }
  });
  
  // Sort by weight (importance) then by count
  return Array.from(keywordMap.values()).sort((a, b) => {
    if (b.weight !== a.weight) return b.weight - a.weight;
    return b.count - a.count;
  });
}

/**
 * Extracts keywords from text, returns normalized list
 */
export function extractKeywords(text: string): string[] {
  const details = extractKeywordsWithDetails(text);
  return details.map(k => k.keyword);
}

/**
 * Categorizes extracted keywords
 */
export interface CategorizedKeywords {
  technical: string[];
  soft: string[];
  actionVerbs: string[];
  [key: string]: string[];
}

export function categorizeKeywords(keywords: string[]): CategorizedKeywords {
  const result: CategorizedKeywords = {
    technical: [],
    soft: [],
    actionVerbs: []
  };
  
  keywords.forEach(keyword => {
    const info = keywordIndex.get(keyword.toLowerCase());
    if (!info) return;
    
    const lowerKeyword = keyword.toLowerCase();
    if (ACTION_VERBS_SET.has(lowerKeyword)) {
      result.actionVerbs.push(keyword);
    } else if (SOFT_SKILLS_SET.has(lowerKeyword)) {
      result.soft.push(keyword);
    } else if (ALL_TECH_SKILLS.has(lowerKeyword)) {
      result.technical.push(keyword);
    }
  });
  
  return result;
}

/**
 * Finds keywords in target text that are missing from source text
 */
export function findMissingKeywords(sourceText: string, targetText: string): string[] {
  const sourceKeywords = extractKeywords(sourceText);
  const sourceSet = new Set(sourceKeywords.map(k => k.toLowerCase()));
  
  const targetKeywords = extractKeywords(targetText);
  const missing: Set<string> = new Set();
  
  targetKeywords.forEach(keyword => {
    if (!sourceSet.has(keyword.toLowerCase())) {
      missing.add(keyword);
    }
  });
  
  return Array.from(missing).sort();
}

/**
 * Calculates keyword match percentage
 */
export function calculateKeywordMatchPercentage(sourceText: string, targetText: string): number {
  const targetKeywords = extractKeywords(targetText);
  
  if (targetKeywords.length === 0) return 100;
  
  const sourceKeywords = new Set(extractKeywords(sourceText).map(k => k.toLowerCase()));
  
  const matches = targetKeywords.filter(k => sourceKeywords.has(k.toLowerCase())).length;
  
  return Math.round((matches / targetKeywords.length) * 100);
}

/**
 * Extracts likely job title/role from text
 */
export function extractJobTitle(text: string): string | null {
  // Common job title patterns - simplified heuristic
  const jobTitlePatterns = [
    /(?:job title|position|role|title)[\s:]*([a-zA-Z\s\-]+?)(?:\n|,|$)/i,
    /^([a-zA-Z\s\-]+(?:engineer|developer|manager|analyst|designer|architect|specialist))[\s:]*(?:\n|$)/im,
  ];
  
  for (const pattern of jobTitlePatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  
  return null;
}

/**
 * Extracts likely experience level from text
 */
export function estimateExperienceLevel(text: string): 'junior' | 'mid' | 'senior' | 'lead' | 'unknown' {
  const lowerText = text.toLowerCase();
  
  if (/senior|10\+|ten\+|principal|architect|director|vp /i.test(lowerText)) {
    return 'senior';
  }
  
  if (/lead|tech lead|staff|5\+|five\+|manager/i.test(lowerText)) {
    return 'lead';
  }
  
  if (/mid.?level|3\+|four|5 years/i.test(lowerText)) {
    return 'mid';
  }
  
  if (/junior|entry.?level|0.?2|graduate|intern|entry level/i.test(lowerText)) {
    return 'junior';
  }
  
  return 'unknown';
}

/**
 * Extract keywords by priority (required vs preferred)
 */
export function extractKeywordsByPriority(text: string): { required: ExtractedKeyword[]; preferred: ExtractedKeyword[] } {
  const allKeywords = extractKeywordsWithDetails(text);
  
  // Simple heuristic: keywords with high weight or multiple mentions are "required"
  // Single mentions are "preferred"
  const required = allKeywords.filter(k => k.weight >= KEYWORD_IMPORTANCE.HIGH || k.count > 1);
  const preferred = allKeywords.filter(k => k.weight < KEYWORD_IMPORTANCE.HIGH && k.count === 1);
  
  return { required, preferred };
}

/**
 * Extract years of experience from text
 */
export function extractYearsOfExperience(text: string): number | null {
  const match = text.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1]) : null;
}

/**
 * Detect industry/domain from keywords
 */
export function detectIndustry(text: string): string[] {
  const industries: { name: string; keywords: string[] }[] = [
    { name: 'Web Development', keywords: ['react', 'vue', 'angular', 'nextjs', 'frontend', 'backend', 'fullstack'] },
    { name: 'Mobile Development', keywords: ['ios', 'android', 'swift', 'kotlin', 'react native', 'flutter'] },
    { name: 'DevOps / Infrastructure', keywords: ['kubernetes', 'docker', 'aws', 'terraform', 'ci/cd', 'jenkins'] },
    { name: 'Data Science / ML', keywords: ['machine learning', 'python', 'tensorflow', 'pandas', 'ai', 'nlp'] },
    { name: 'Cloud Engineering', keywords: ['aws', 'azure', 'gcp', 'cloud', 'serverless'] },
    { name: 'Database Engineering', keywords: ['sql', 'postgresql', 'mongodb', 'elasticsearch', 'database'] },
    { name: 'Security', keywords: ['security', 'penetration', 'ssl', 'encryption', 'cissp', 'auth'] }
  ];
  
  const lowerText = text.toLowerCase();
  const detected = industries
    .filter(ind => ind.keywords.some(kw => lowerText.includes(kw)))
    .map(ind => ind.name);
  
  return Array.from(new Set(detected));
}

/**
 * Calculate keyword match with weighting
 */
export function calculateWeightedMatchPercentage(sourceText: string, targetText: string): {
  percentage: number;
  matchedWeight: number;
  totalWeight: number;
} {
  const sourceDetails = extractKeywordsWithDetails(sourceText);
  const targetDetails = extractKeywordsWithDetails(targetText);
  
  const sourceMap = new Map(sourceDetails.map(k => [k.keyword.toLowerCase(), k]));
  
  let matchedWeight = 0;
  let totalWeight = 0;
  
  targetDetails.forEach(target => {
    totalWeight += target.weight;
    if (sourceMap.has(target.keyword.toLowerCase())) {
      matchedWeight += target.weight;
    }
  });
  
  const percentage = totalWeight > 0 ? Math.round((matchedWeight / totalWeight) * 100) : 100;
  
  return { percentage, matchedWeight, totalWeight };
}

/**
 * Get missing keywords ranked by importance
 */
export function getMissingKeywordsByPriority(sourceText: string, targetText: string): ExtractedKeyword[] {
  const sourceSet = new Set(extractKeywords(sourceText).map(k => k.toLowerCase()));
  const targetDetails = extractKeywordsWithDetails(targetText);
  
  return targetDetails
    .filter(k => !sourceSet.has(k.keyword.toLowerCase()))
    .sort((a, b) => b.weight - a.weight);  // Sort by importance
}
