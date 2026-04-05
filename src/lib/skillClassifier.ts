/**
 * Skill Classifier - Classify, group, and assess skill proficiency
 * Identifies skill equivalences, proficiency levels, and skill categories
 */

export interface ClassifiedSkill {
  name: string;
  category: string;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown';
  yearsOfExperience: number;
  mentioned: boolean;
}

export interface SkillCategory {
  name: string;
  skills: ClassifiedSkill[];
  averageProficiency: number; // 0-4 scale
  totalYears: number;
}

export interface SkillAnalysis {
  allSkills: ClassifiedSkill[];
  byCategory: SkillCategory[];
  totalSkillCount: number;
  strongestSkills: ClassifiedSkill[];
  weakestSkills: ClassifiedSkill[];
  skillDensity: number; // skills per 1000 words
}

// Skill equivalences - map similar skills to standard names
const SKILL_EQUIVALENCES: Record<string, string[]> = {
  'javascript': ['js', 'ecmascript', 'es6', 'es5', 'typescript'],
  'react': ['react.js', 'reactjs'],
  'typescript': ['ts'],
  'node.js': ['nodejs', 'node'],
  'express': ['express.js', 'expressjs'],
  'angular': ['angularjs', 'angular.js'],
  'vue': ['vue.js', 'vuejs'],
  'python': ['py', 'python3'],
  'django': ['django rest framework'],
  'flask': ['flask api'],
  'sql': ['mysql', 'postgresql', 'oracle'],
  'mongodb': ['mongo', 'nosql'],
  'docker': ['containerization'],
  'kubernetes': ['k8s', 'orchestration'],
  'aws': ['amazon web services', 'amazon aws'],
  'gcp': ['google cloud', 'google cloud platform'],
  'azure': ['microsoft azure'],
  'git': ['github', 'gitlab'],
  'rest api': ['restful', 'rest'],
  'machine learning': ['ml', 'deep learning', 'neural networks'],
  'data science': ['data analytics'],
  'communication': ['interpersonal', 'soft skills'],
  'leadership': ['team lead', 'management'],
};

// Skill categories
const SKILL_CATEGORIES: Record<string, string[]> = {
  'Programming Languages': [
    'python', 'javascript', 'typescript', 'java', 'c#', 'c++', 'ruby', 'php',
    'go', 'rust', 'kotlin', 'swift', 'scala', 'r'
  ],
  'Web Frameworks': [
    'react', 'angular', 'vue', 'nextjs', 'nuxt', 'express', 'django', 'flask',
    'spring', 'rails', 'laravel', 'symfony'
  ],
  'Databases': [
    'sql', 'mysql', 'postgresql', 'mongodb', 'redis', 'cassandra', 'elasticsearch',
    'dynamodb', 'oracle', 'firestore'
  ],
  'Cloud & DevOps': [
    'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'terraform', 'jenkins',
    'circleci', 'gitlab ci'
  ],
  'Data & Analytics': [
    'machine learning', 'data science', 'tensorflow', 'pytorch', 'pandas',
    'numpy', 'tableu', 'power bi'
  ],
  'Tools & Platforms': [
    'git', 'github', 'jira', 'confluence', 'slack', 'figma', 'adobe xd'
  ],
  'Soft Skills': [
    'communication', 'leadership', 'teamwork', 'problem solving', 'adaptability',
    'time management', 'critical thinking', 'mentoring'
  ]
};

// Proficiency keywords
const PROFICIENCY_KEYWORDS: Record<string, string[]> = {
  expert: ['expert', 'mastery', 'master', 'proficient', 'specializing', 'deep expertise'],
  advanced: ['advanced', 'intermediate+', 'strong', 'extensively', 'fluent'],
  intermediate: ['intermediate', 'comfortable', 'familiar', 'working knowledge'],
  beginner: ['beginner', 'novice', 'learning', 'exposure to', 'some experience']
};

export function classifySkills(resumeText: string, skillMentions?: string[]): SkillAnalysis {
  const text = resumeText.toLowerCase();
  const lines = resumeText.split('\n');

  // Find skills section if available
  const skillsSection = extractSkillsSection(resumeText);
  
  // Identify individual skills
  const identifiedSkills = skillMentions ? 
    skillMentions.map(skill => normalizeSkillName(skill)) :
    extractSkillsFromText(skillsSection || text);

  // Classify each skill
  const classified: ClassifiedSkill[] = identifiedSkills.map(skill => {
    const category = categorizeSkill(skill);
    const proficiency = determineProficiency(text, skill);
    const yearsOfExperience = estimateYearsOfExperience(text, skill);

    return {
      name: skill,
      category,
      proficiency,
      yearsOfExperience,
      mentioned: true
    };
  });

  // Group by category
  const byCategory = groupByCategory(classified);

  // Calculate analysis metrics
  const totalSkillCount = classified.length;
  const wordCount = text.split(/\s+/).length;
  const skillDensity = (totalSkillCount / wordCount) * 1000;

  // Sort by proficiency
  const strongestSkills = classified
    .sort((a, b) => getProficiencyScore(b.proficiency) - getProficiencyScore(a.proficiency))
    .slice(0, 5);

  const weakestSkills = classified
    .sort((a, b) => getProficiencyScore(a.proficiency) - getProficiencyScore(b.proficiency))
    .slice(0, 5);

  return {
    allSkills: classified,
    byCategory,
    totalSkillCount,
    strongestSkills,
    weakestSkills,
    skillDensity
  };
}

function extractSkillsSection(resumeText: string): string {
  const lines = resumeText.split('\n');
  let inSkillsSection = false;
  let skillsContent = '';

  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();

    if (/^(skills|technical skills|competencies|expertise)/.test(trimmed)) {
      inSkillsSection = true;
      continue;
    }

    if (inSkillsSection && /^(experience|education|projects|certification|summary)/.test(trimmed)) {
      break;
    }

    if (inSkillsSection) {
      skillsContent += line + '\n';
    }
  }

  return skillsContent;
}

function extractSkillsFromText(text: string): string[] {
  const skills: string[] = [];

  // Look for comma-separated skills
  const skillPatterns = [
    /(?:skills|technologies|expertise):\s*([^.\n]+)/gi,
    /[-•*]\s+([^\n,]+?)(?:,|$)/g
  ];

  for (const pattern of skillPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const potential = match[1].trim();
      if (isLikelySkill(potential)) {
        skills.push(normalizeSkillName(potential));
      }
    }
  }

  return [...new Set(skills)];
}

function isLikelySkill(text: string): boolean {
  if (text.length > 100) return false;
  if (text.includes('with') || text.includes('in') || text.includes('at')) return false;
  if (text.split(/\s+/).length > 5) return false;

  return true;
}

function normalizeSkillName(skill: string): string {
  const normalized = skill.toLowerCase().trim();

  // Check equivalences
  for (const [canonical, equivalents] of Object.entries(SKILL_EQUIVALENCES)) {
    if (equivalents.includes(normalized) || canonical === normalized) {
      return canonical;
    }
  }

  return normalized;
}

function categorizeSkill(skill: string): string {
  const normalized = normalizeSkillName(skill);

  for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
    if (skills.includes(normalized) || skills.some(s => s.includes(normalized))) {
      return category;
    }
  }

  return 'Other';
}

function determineProficiency(text: string, skill: string): 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'unknown' {
  const skillLower = skill.toLowerCase();
  
  // Look for the skill in context
  const regex = new RegExp(`([^.]{0,100}${skillLower}[^.]{0,100})`, 'gi');
  const matches = text.match(regex) || [];

  let proficiencyScore = 0;

  for (const match of matches) {
    const context = match.toLowerCase();

    for (const [level, keywords] of Object.entries(PROFICIENCY_KEYWORDS)) {
      for (const keyword of keywords) {
        if (context.includes(keyword)) {
          switch (level) {
            case 'expert': proficiencyScore += 4; break;
            case 'advanced': proficiencyScore += 3; break;
            case 'intermediate': proficiencyScore += 2; break;
            case 'beginner': proficiencyScore += 1; break;
          }
        }
      }
    }
  }

  // Average score across mentions
  const avgScore = matches.length > 0 ? proficiencyScore / matches.length : 0;

  if (avgScore >= 3.5) return 'expert';
  if (avgScore >= 2.5) return 'advanced';
  if (avgScore >= 1.5) return 'intermediate';
  if (avgScore >= 1) return 'beginner';

  return 'unknown';
}

function estimateYearsOfExperience(text: string, skill: string): number {
  const skillLower = skill.toLowerCase();
  const regex = new RegExp(`([^.]{0,150}${skillLower}[^.]{0,150})`, 'gi');
  const matches = text.match(regex) || [];

  for (const match of matches) {
    const yearMatch = match.match(/(\d+)\s*\+?\s*(?:years?|yrs?)/i);
    if (yearMatch) {
      return parseInt(yearMatch[1], 10);
    }
  }

  return 0;
}

function getProficiencyScore(proficiency: string): number {
  switch (proficiency) {
    case 'expert': return 4;
    case 'advanced': return 3;
    case 'intermediate': return 2;
    case 'beginner': return 1;
    default: return 0;
  }
}

function groupByCategory(skills: ClassifiedSkill[]): SkillCategory[] {
  const grouped: Record<string, ClassifiedSkill[]> = {};

  for (const skill of skills) {
    if (!grouped[skill.category]) {
      grouped[skill.category] = [];
    }
    grouped[skill.category].push(skill);
  }

  return Object.entries(grouped).map(([name, categorySkills]) => {
    const proficiencies = categorySkills.map(s => getProficiencyScore(s.proficiency));
    const avgProficiency = proficiencies.length > 0 ? proficiencies.reduce((a, b) => a + b) / proficiencies.length : 0;
    const totalYears = categorySkills.reduce((sum, s) => sum + s.yearsOfExperience, 0);

    return {
      name,
      skills: categorySkills,
      averageProficiency: avgProficiency,
      totalYears
    };
  });
}

export function findSkillGaps(resumeSkills: ClassifiedSkill[], jobKeywords: string[]): { missing: string[]; recommendation: string } {
  const resumeSkillNames = resumeSkills.map(s => normalizeSkillName(s.name));
  const missing: string[] = [];

  for (const keyword of jobKeywords) {
    const normalized = normalizeSkillName(keyword);
    if (!resumeSkillNames.includes(normalized)) {
      missing.push(keyword);
    }
  }

  let recommendation = '';
  if (missing.length === 0) {
    recommendation = 'All key skills are present in resume.';
  } else if (missing.length <= 3) {
    recommendation = `Consider adding: ${missing.join(', ')}`;
  } else {
    recommendation = `Multiple skill gaps detected. Prioritize learning: ${missing.slice(0, 3).join(', ')}`;
  }

  return {
    missing,
    recommendation
  };
}
