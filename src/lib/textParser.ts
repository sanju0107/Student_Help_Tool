/**
 * Text Parser - Resume structure extraction and parsing
 * Separates resume text into logical sections for analysis
 */

export interface ParsedResume {
  fullText: string;
  sections: ResumeSection[];
  contactInfo: ContactInfo;
  metrics: ResumeMetrics;
}

export interface ResumeSection {
  type: 'contact' | 'summary' | 'skills' | 'experience' | 'education' | 'projects' | 'other';
  title: string;
  content: string;
  startLine: number;
  endLine: number;
  confidence: number; // 0-1, how confident we are this is the correct section
}

export interface ContactInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedIn: string;
  github: string;
  portfolio: string;
  website: string;
}

export interface ResumeMetrics {
  totalWords: number;
  totalLines: number;
  sectionCount: number;
  hasContactSection: boolean;
  hasSummarySection: boolean;
  hasSkillsSection: boolean;
  hasExperienceSection: boolean;
  hasEducationSection: boolean;
  hasProjectsSection: boolean;
  bulletPointCount: number;
  urlCount: number;
  dateCount: number;
}

// Keywords that indicate section headers
const SECTION_HEADERS: Record<string, string[]> = {
  contact: ['contact info', 'contact information', 'contact details', 'reach me', 'get in touch'],
  summary: [
    'professional summary', 'objective', 'about me', 'profile', 'professional profile',
    'career summary', 'executive summary', 'summary', 'about'
  ],
  skills: [
    'technical skills', 'skills', 'competencies', 'expertise', 'proficiencies',
    'core competencies', 'key skills', 'abilities', 'technologies'
  ],
  experience: [
    'work experience', 'professional experience', 'employment history', 'experience',
    'career history', 'work history', 'professional history', 'employment'
  ],
  education: [
    'education', 'academic background', 'educational background', 'degrees',
    'certifications & education', 'academic achievements'
  ],
  projects: [
    'projects', 'portfolio', 'sample work', 'case studies', 'portfolio projects',
    'featured projects', 'key projects', 'notable projects'
  ]
};

export function parseResume(text: string): ParsedResume {
  const lines = text.split('\n');
  const sections = extractSections(lines);
  const contactInfo = extractContactInfo(text);
  const metrics = calculateMetrics(text, lines, sections);

  return {
    fullText: text,
    sections,
    contactInfo,
    metrics
  };
}

function extractSections(lines: string[]): ResumeSection[] {
  const sections: ResumeSection[] = [];
  let currentSection: Partial<ResumeSection> | null = null;
  let sectionContent: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check if this line is a section header
    const detectedType = detectSectionHeader(trimmed);

    if (detectedType) {
      // Save previous section if exists
      if (currentSection) {
        sections.push({
          type: currentSection.type as ResumeSection['type'],
          title: currentSection.title || '',
          content: sectionContent.join('\n').trim(),
          startLine: currentSection.startLine || 0,
          endLine: i - 1,
          confidence: 0.9
        });
      }

      // Start new section
      currentSection = {
        type: detectedType,
        title: trimmed,
        startLine: i
      };
      sectionContent = [];
    } else if (currentSection && trimmed.length > 0) {
      sectionContent.push(line);
    }
  }

  // Save last section
  if (currentSection && sectionContent.length > 0) {
    sections.push({
      type: currentSection.type as ResumeSection['type'],
      title: currentSection.title || '',
      content: sectionContent.join('\n').trim(),
      startLine: currentSection.startLine || 0,
      endLine: lines.length - 1,
      confidence: 0.9
    });
  }

  return sections;
}

function detectSectionHeader(text: string): ResumeSection['type'] | null {
  const lowerText = text.toLowerCase();

  // Remove common punctuation
  const cleanText = lowerText.replace(/[*#-\s]+/g, ' ').trim();

  for (const [type, keywords] of Object.entries(SECTION_HEADERS)) {
    for (const keyword of keywords) {
      if (cleanText === keyword || cleanText.startsWith(keyword)) {
        return type as ResumeSection['type'];
      }
    }
  }

  return null;
}

function extractContactInfo(text: string): ContactInfo {
  const contactInfo: ContactInfo = {
    name: '',
    email: '',
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    portfolio: '',
    website: ''
  };

  // Email pattern
  const emailMatch = text.match(/[\w\.-]+@[\w\.-]+\.\w+/);
  if (emailMatch) {
    contactInfo.email = emailMatch[0];
  }

  // Phone pattern (multiple formats)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) {
    contactInfo.phone = phoneMatch[0];
  }

  // LinkedIn pattern
  const linkedInMatch = text.match(/linkedin\.com\/in\/[\w\-]+/i);
  if (linkedInMatch) {
    contactInfo.linkedIn = linkedInMatch[0];
  }

  // GitHub pattern
  const githubMatch = text.match(/github\.com\/[\w\-]+/i);
  if (githubMatch) {
    contactInfo.github = githubMatch[0];
  }

  // Portfolio/Website patterns
  const urlPattern = text.match(/(https?:\/\/)?(www\.)?[a-zA-Z0-9\-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)*/g);
  if (urlPattern) {
    // Filter out linkedin and github
    const filtered = urlPattern.filter(
      url => !url.includes('linkedin') && !url.includes('github')
    );
    if (filtered.length > 0) {
      contactInfo.portfolio = filtered[0];
    }
  }

  // Location pattern (simple heuristic)
  const locationMatch = text.match(/(located in|based in|lives in|from|city:|state:)\s*([^\n,]+)/i);
  if (locationMatch) {
    contactInfo.location = locationMatch[2].trim();
  }

  // Name extraction (usually first line or near beginning)
  const firstLine = text.split('\n')[0].trim();
  if (firstLine && !firstLine.includes('@') && firstLine.length < 100) {
    contactInfo.name = firstLine;
  }

  return contactInfo;
}

function calculateMetrics(text: string, lines: string[], sections: ResumeSection[]): ResumeMetrics {
  const bulletPoints = (text.match(/[\n\r]\s*[-•*]\s+/g) || []).length;
  const urls = (text.match(/https?:\/\/[^\s]+|github\.com|gitlab\.com/gi) || []).length;
  const dates = (text.match(/(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2}|\d{4})/gi) || []).length;

  const sectionTypes = new Set(sections.map(s => s.type));

  return {
    totalWords: text.split(/\s+/).length,
    totalLines: lines.length,
    sectionCount: sections.length,
    hasContactSection: sectionTypes.has('contact') || sections.some(s => s.type === 'contact'),
    hasSummarySection: sectionTypes.has('summary'),
    hasSkillsSection: sectionTypes.has('skills'),
    hasExperienceSection: sectionTypes.has('experience'),
    hasEducationSection: sectionTypes.has('education'),
    hasProjectsSection: sectionTypes.has('projects'),
    bulletPointCount: bulletPoints,
    urlCount: urls,
    dateCount: dates
  };
}

export function getSection(sections: ResumeSection[], type: ResumeSection['type']): ResumeSection | undefined {
  return sections.find(s => s.type === type);
}

export function getSectionContent(sections: ResumeSection[], type: ResumeSection['type']): string {
  const section = getSection(sections, type);
  return section ? section.content : '';
}
