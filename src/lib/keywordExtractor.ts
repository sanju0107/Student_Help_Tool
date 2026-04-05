/**
 * Keyword Extractor - Extract and analyze keywords from job descriptions
 * Identifies important keywords, skills, and requirements from JD
 */

export interface ExtractedKeywords {
  allKeywords: string[];
  topKeywords: string[];
  skillKeywords: string[];
  technicalKeywords: string[];
  toolsAndTechnologies: string[];
  softSkills: string[];
  certifications: string[];
  yearsOfExperienceRequired: number;
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'unknown';
  frequency: Record<string, number>;
}

// Common technical keywords by category
const TECHNICAL_KEYWORDS = {
  programming: [
    'python', 'java', 'javascript', 'typescript', 'c#', 'c++', 'ruby', 'php', 'go', 'rust',
    'kotlin', 'swift', 'objective-c', 'scala', 'perl', 'groovy', 'r', 'matlab'
  ],
  frameworks: [
    'react', 'angular', 'vue', 'nextjs', 'nuxt', 'svelte', 'ember', 'backbone',
    'express', 'django', 'flask', 'spring', 'rails', 'laravel', 'symfony', 'fastapi'
  ],
  databases: [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'elasticsearch',
    'dynamodb', 'oracle', 'sqlserver', 'mariadb', 'influxdb', 'neo4j', 'firestore'
  ],
  cloud: [
    'aws', 'azure', 'gcp', 'heroku', 'vercel', 'netlify', 'digital ocean', 'linode',
    'kubernetes', 'docker', 'openshift', 'lambda'
  ],
  tools: [
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'figma',
    'webpack', 'npm', 'yarn', 'maven', 'gradle', 'jenkins', 'circleci', 'travis'
  ]
};

const SOFT_SKILLS = [
  'communication', 'leadership', 'teamwork', 'collaboration', 'problem solving',
  'critical thinking', 'creativity', 'adaptability', 'time management', 'organization',
  'attention to detail', 'reliability', 'accountability', 'initiative', 'mentoring',
  'coaching', 'negotiation', 'presentation', 'public speaking', 'listening'
];

const COMMON_STOPWORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
  'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'again', 'further', 'then', 'once', 'is', 'are', 'was',
  'were', 'be', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'want', 'need', 'help',
  'job', 'position', 'role', 'we', 'our', 'you', 'your', 'their', 'this', 'that',
  'what', 'which', 'who', 'where', 'when', 'why', 'how', 'all', 'each', 'every'
]);

export function extractKeywordsFromJD(jobDescription: string): ExtractedKeywords {
  const text = jobDescription.toLowerCase();
  const words = tokenize(text);

  // Extract different categories
  const skillKeywords = extractSkills(text, words);
  const technicalKeywords = extractTechnicalTerms(text, words);
  const toolsAndTechnologies = extractTools(text, words);
  const softSkills = extractSoftSkills(text, words);
  const certifications = extractCertifications(text, words);

  // Combine all keywords
  const allKeywords = [
    ...skillKeywords,
    ...technicalKeywords,
    ...toolsAndTechnologies,
    ...softSkills,
    ...certifications
  ];

  // Calculate frequency
  const frequency = calculateFrequency(words, allKeywords);

  // Get top keywords by frequency
  const topKeywords = Object.entries(frequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([keyword]) => keyword);

  // Extract experience requirements
  const yearsOfExperienceRequired = extractYearsRequired(text);
  const experienceLevel = determineExperienceLevel(text, yearsOfExperienceRequired);

  return {
    allKeywords: [...new Set(allKeywords)],
    topKeywords,
    skillKeywords: [...new Set(skillKeywords)],
    technicalKeywords: [...new Set(technicalKeywords)],
    toolsAndTechnologies: [...new Set(toolsAndTechnologies)],
    softSkills: [...new Set(softSkills)],
    certifications: [...new Set(certifications)],
    yearsOfExperienceRequired,
    experienceLevel,
    frequency
  };
}

function tokenize(text: string): string[] {
  return text
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !COMMON_STOPWORDS.has(word));
}

function extractSkills(text: string, words: string[]): string[] {
  const skills: string[] = [];

  // Look for common skill patterns
  const skillPatterns = [
    /(?:experience with|proficiency in|knowledge of|expertise in|skilled in|familiar with)\s+([^,.]+)/gi,
    /(?:ability to|able to|capable of)\s+([^,.]+)/gi
  ];

  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skill = match[1].trim();
      if (skill.length > 2 && skill.length < 50) {
        skills.push(skill);
      }
    }
  }

  return skills;
}

function extractTechnicalTerms(text: string, words: string[]): string[] {
  const technical: string[] = [];

  // Check for known technical keywords
  for (const category of Object.values(TECHNICAL_KEYWORDS)) {
    for (const keyword of category) {
      if (text.includes(keyword)) {
        technical.push(keyword);
      }
    }
  }

  return technical;
}

function extractTools(text: string, words: string[]): string[] {
  const tools: string[] = [];

  // Multi-word tools
  const multiWordTools = [
    'rest api', 'graphql', 'microservices', 'machine learning', 'deep learning',
    'natural language processing', 'computer vision', 'data science', 'big data',
    'real-time processing', 'cloud computing', 'devops', 'ci/cd'
  ];

  for (const tool of multiWordTools) {
    if (text.includes(tool.toLowerCase())) {
      tools.push(tool);
    }
  }

  return tools;
}

function extractSoftSkills(text: string, words: string[]): string[] {
  const found: string[] = [];

  for (const skill of SOFT_SKILLS) {
    if (text.includes(skill)) {
      found.push(skill);
    }
  }

  return found;
}

function extractCertifications(text: string, words: string[]): string[] {
  const certifications: string[] = [];

  const certPatterns = [
    /(?:required|preferred|nice to have)?\s*(?:certification|certifications|cert|certs|certified)\s*(?:in|of|for)?\s*([^,.]+)/gi,
    /(?:aws|gcp|azure|kubernetes|scrum|cissp|cpa|pmp)\s*(?:certified)?/gi
  ];

  for (const pattern of certPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const cert = match[1]?.trim() || match[0].trim();
      if (cert.length > 2 && cert.length < 100) {
        certifications.push(cert);
      }
    }
  }

  return certifications;
}

function extractYearsRequired(text: string): number {
  // Look for patterns like "5+ years", "3 years", "10 years of experience"
  const match = text.match(/(\d+)\s*\+?\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)?/i);

  if (match && match[1]) {
    return parseInt(match[1], 10);
  }

  return 0;
}

function determineExperienceLevel(text: string, yearsRequired: number): 'entry' | 'mid' | 'senior' | 'lead' | 'unknown' {
  if (text.includes('entry level') || text.includes('entry-level') || text.includes('junior')) {
    return 'entry';
  }

  if (text.includes('senior') && !text.includes('lead')) {
    return 'senior';
  }

  if (text.includes('lead') || text.includes('principal') || text.includes('staff')) {
    return 'lead';
  }

  if (yearsRequired >= 5) {
    return 'senior';
  }

  if (yearsRequired >= 2) {
    return 'mid';
  }

  if (yearsRequired === 0 || yearsRequired === 1) {
    return 'entry';
  }

  return 'unknown';
}

function calculateFrequency(words: string[], keywords: string[]): Record<string, number> {
  const frequency: Record<string, number> = {};

  for (const keyword of keywords) {
    const keywordLower = keyword.toLowerCase();
    const count = words.filter(word => word.includes(keywordLower) || keywordLower.includes(word)).length;
    if (count > 0) {
      frequency[keyword] = count;
    }
  }

  return frequency;
}

export function matchKeywords(resumeText: string, jobKeywords: ExtractedKeywords): { matched: string[]; missing: string[]; matchPercentage: number } {
  const resumeLower = resumeText.toLowerCase();
  const matched: string[] = [];
  const missing: string[] = [];

  for (const keyword of jobKeywords.topKeywords) {
    if (resumeLower.includes(keyword.toLowerCase())) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  const matchPercentage = matched.length > 0 ? (matched.length / jobKeywords.topKeywords.length) * 100 : 0;

  return {
    matched,
    missing,
    matchPercentage: Math.round(matchPercentage)
  };
}
