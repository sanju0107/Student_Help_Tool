/**
 * Experience Analyzer - Analyze career progression, seniority level, and experience patterns
 * Extracts job history and provides insights on career trajectory
 */

export interface WorkExperience {
  jobTitle: string;
  company: string;
  startDate: string;
  endDate: string;
  duration: number; // months
  description: string;
  responsibilities: string[];
  achievements: string[];
  seniority: 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'unknown';
}

export interface ExperienceAnalysis {
  totalExperience: number; // months
  totalExperienceYears: number;
  jobCount: number;
  averageJobDuration: number; // months
  seniority: 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'unknown';
  careerProgression: 'stagnant' | 'steady' | 'accelerating' | 'declining' | 'unknown';
  promotionHistory: boolean;
  roleChangeFrequency: 'high' | 'normal' | 'low' | 'unknown';
  jobStability: 'high' | 'medium' | 'low' | 'unknown';
  latestRole: WorkExperience | null;
  identifiedJobs: WorkExperience[];
}

const SENIOR_KEYWORDS = [
  'senior', 'staff', 'principal', 'lead', 'architect', 'director', 'vp', 'chief',
  'manager', 'manager', 'head', 'lead developer', 'lead engineer'
];

const MID_KEYWORDS = [
  'mid', 'mid-level', 'advanced', 'intermediate', 'specialist', 'senior developer',
  'mid-level engineer'
];

const ENTRY_KEYWORDS = [
  'junior', 'entry', 'entry-level', 'graduate', 'fresher', 'trainee', 'intern',
  'associate', 'coordinator'
];

const LEAD_KEYWORDS = [
  'director', 'vp', 'cto', 'ceo', 'principal', 'head', 'lead engineer',
  'engineering manager', 'team lead', 'tech lead'
];

export function analyzeExperience(resumeText: string): ExperienceAnalysis {
  const jobs = extractWorkExperience(resumeText);
  
  if (jobs.length === 0) {
    return {
      totalExperience: 0,
      totalExperienceYears: 0,
      jobCount: 0,
      averageJobDuration: 0,
      seniority: 'unknown',
      careerProgression: 'unknown',
      promotionHistory: false,
      roleChangeFrequency: 'unknown',
      jobStability: 'unknown',
      latestRole: null,
      identifiedJobs: []
    };
  }

  // Calculate total experience
  const totalMonths = calculateTotalExperience(jobs);
  const totalYears = totalMonths / 12;

  // Determine seniority from latest role
  const latestJob = jobs[0];
  const seniority = determineSeniority(latestJob.jobTitle, totalYears);

  // Analyze progression
  const progression = analyzeProgression(jobs);
  const hasPromotions = checkPromotionHistory(jobs);
  const roleChangeFreq = analyzeRoleChangeFrequency(jobs);
  const stability = analyzeJobStability(jobs);

  // Average job duration
  const avgDuration = jobs.length > 0 ? totalMonths / jobs.length : 0;

  return {
    totalExperience: totalMonths,
    totalExperienceYears: Math.round(totalYears * 10) / 10,
    jobCount: jobs.length,
    averageJobDuration: Math.round(avgDuration),
    seniority,
    careerProgression: progression,
    promotionHistory: hasPromotions,
    roleChangeFrequency: roleChangeFreq,
    jobStability: stability,
    latestRole: latestJob,
    identifiedJobs: jobs
  };
}

function extractWorkExperience(resumeText: string): WorkExperience[] {
  const lines = resumeText.split('\n');
  const jobs: WorkExperience[] = [];

  // Find experience section
  let inExperienceSection = false;
  let currentJob: Partial<WorkExperience> | null = null;
  let currentDescription: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Detect experience section start
    if (/^(work\s+)?experience|employment history|professional experience|career history/i.test(trimmed)) {
      inExperienceSection = true;
      continue;
    }

    // Detect experience section end
    if (inExperienceSection && /^(education|projects|skills|certification|awards)/i.test(trimmed)) {
      if (currentJob) {
        jobs.push(buildWorkExperience(currentJob, currentDescription));
      }
      break;
    }

    if (inExperienceSection && trimmed.length > 0) {
      // Check if this is a job header (contains title and/or company)
      if (isJobHeader(trimmed, lines[i + 1])) {
        // Save previous job
        if (currentJob) {
          jobs.push(buildWorkExperience(currentJob, currentDescription));
        }

        // Start new job
        const parsed = parseJobHeader(trimmed, lines[i + 1]);
        currentJob = parsed;
        currentDescription = [];
      } else if (currentJob && trimmed.length > 10) {
        // Add to current job description
        currentDescription.push(line);
      }
    }
  }

  // Save last job
  if (currentJob) {
    jobs.push(buildWorkExperience(currentJob, currentDescription));
  }

  return jobs.sort((a, b) => {
    // Sort by end date (most recent first)
    const aEnd = new Date(a.endDate || new Date()).getTime();
    const bEnd = new Date(b.endDate || new Date()).getTime();
    return bEnd - aEnd;
  });
}

function isJobHeader(line: string, nextLine?: string): boolean {
  // Job headers typically contain:
  // - A job title
  // - A company name
  // - Dates
  // - In a specific format

  const hasDate = /(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(line);
  const hasTitle = /developer|engineer|designer|manager|analyst|specialist|consultant|lead|architect|director/i.test(line);
  const isShort = line.length < 150;

  return hasDate && hasTitle && isShort;
}

function parseJobHeader(line: string, nextLine?: string): Partial<WorkExperience> {
  const job: Partial<WorkExperience> = {
    jobTitle: '',
    company: '',
    startDate: '',
    endDate: '',
    duration: 0
  };

  // Extract dates
  const dateMatch = line.match(/(\w+\s+\d{4}|\d{1,2}\/\d{1,2}\/\d{4})/g);
  if (dateMatch && dateMatch.length >= 1) {
    job.startDate = dateMatch[0];
    if (dateMatch.length >= 2) {
      job.endDate = dateMatch[1];
    } else {
      job.endDate = 'Present';
    }
  }

  // Extract job title (usually before company)
  const titleMatch = line.match(/^([^–|,]+)(?:\s*(?:–|@|,|\|)\s*(.+))?/);
  if (titleMatch) {
    job.jobTitle = titleMatch[1].replace(/(\d{1,2}\/\d{1,2}\/\d{4}|\w+\s+\d{4})/g, '').trim();
    if (titleMatch[2]) {
      job.company = titleMatch[2].replace(/(\d{1,2}\/\d{1,2}\/\d{4}|\w+\s+\d{4})/g, '').trim();
    }
  }

  // Calculate duration
  if (job.startDate && job.endDate) {
    job.duration = calculateMonthsDuration(job.startDate, job.endDate);
  }

  return job;
}

function buildWorkExperience(partial: Partial<WorkExperience>, descriptionLines: string[]): WorkExperience {
  const description = descriptionLines.join('\n').trim();
  const responsibilities = extractBulletPoints(description);
  const achievements = extractAchievements(description);

  const seniority = determineSeniority(partial.jobTitle || '', 0);

  return {
    jobTitle: partial.jobTitle || '',
    company: partial.company || '',
    startDate: partial.startDate || '',
    endDate: partial.endDate || '',
    duration: partial.duration || 0,
    description,
    responsibilities,
    achievements,
    seniority
  };
}

function extractBulletPoints(text: string): string[] {
  return text
    .split(/[\n\r]/)
    .filter(line => /^[\s]*[-•*]/.test(line))
    .map(line => line.replace(/^[\s]*[-•*]\s+/, '').trim())
    .filter(line => line.length > 0);
}

function extractAchievements(text: string): string[] {
  const achievements: string[] = [];
  const lines = text.split(/[\n\r]/);

  for (const line of lines) {
    if (/increased|improved|reduced|optimized|achieved|delivered|launched|generated|saved/i.test(line)) {
      achievements.push(line.replace(/^[\s]*[-•*]\s+/, '').trim());
    }
  }

  return achievements;
}

function determineSeniority(jobTitle: string, yearsExperience: number): 'entry' | 'mid' | 'senior' | 'lead' | 'executive' | 'unknown' {
  const lower = jobTitle.toLowerCase();

  for (const keyword of LEAD_KEYWORDS) {
    if (lower.includes(keyword)) return 'lead';
  }

  for (const keyword of SENIOR_KEYWORDS) {
    if (lower.includes(keyword)) return yearsExperience > 10 ? 'lead' : 'senior';
  }

  for (const keyword of MID_KEYWORDS) {
    if (lower.includes(keyword)) return 'mid';
  }

  for (const keyword of ENTRY_KEYWORDS) {
    if (lower.includes(keyword)) return 'entry';
  }

  if (yearsExperience > 15) return 'lead';
  if (yearsExperience > 8) return 'senior';
  if (yearsExperience > 3) return 'mid';
  if (yearsExperience > 0) return 'entry';

  return 'unknown';
}

function calculateTotalExperience(jobs: WorkExperience[]): number {
  return jobs.reduce((sum, job) => sum + job.duration, 0);
}

function calculateMonthsDuration(startDate: string, endDate: string): number {
  try {
    const start = parseDate(startDate);
    const end = endDate.toLowerCase() === 'present' ? new Date() : parseDate(endDate);

    const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    return Math.max(1, months);
  } catch {
    return 1;
  }
}

function parseDate(dateStr: string): Date {
  // Try various date formats
  const formats = [
    /(\w+)\s+(\d{4})/, // e.g., "January 2020"
    /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // e.g., "01/15/2020"
    /(\d{4})-(\d{2})-(\d{2})/ // e.g., "2020-01-15"
  ];

  for (const format of formats) {
    const match = dateStr.match(format);
    if (match) {
      if (match[1] && isNaN(Number(match[1]))) {
        // Month name format
        return new Date(`${match[1]} 1, ${match[2]}`);
      } else if (match.length === 4) {
        // Numeric format with day
        return new Date(Number(match[3]), Number(match[2]) - 1, Number(match[1]));
      } else if (match.length === 3) {
        // Year only format
        return new Date(Number(match[1]), 0, 1);
      }
    }
  }

  return new Date();
}

function analyzeProgression(jobs: WorkExperience[]): 'stagnant' | 'steady' | 'accelerating' | 'declining' | 'unknown' {
  if (jobs.length < 2) return 'unknown';

  // Compare seniority levels over time
  const seniorityProgression = jobs.map(job => getSeniorityScore(job.seniority)).reverse();

  let progressingCount = 0;
  let decliningCount = 0;

  for (let i = 1; i < seniorityProgression.length; i++) {
    if (seniorityProgression[i] > seniorityProgression[i - 1]) {
      progressingCount++;
    } else if (seniorityProgression[i] < seniorityProgression[i - 1]) {
      decliningCount++;
    }
  }

  if (decliningCount > progressingCount) return 'declining';
  if (progressingCount > 2) return 'accelerating';
  if (progressingCount > 0) return 'steady';

  return 'stagnant';
}

function getSeniorityScore(seniority: string): number {
  switch (seniority) {
    case 'executive': return 5;
    case 'lead': return 4;
    case 'senior': return 3;
    case 'mid': return 2;
    case 'entry': return 1;
    default: return 0;
  }
}

function checkPromotionHistory(jobs: WorkExperience[]): boolean {
  if (jobs.length < 2) return false;

  // Check if there are role progressions within same companies or seniority increases
  const companies = new Set(jobs.map(j => j.company.toLowerCase()).filter(c => c.length > 0));

  if (companies.size < jobs.length) {
    // Some jobs in same company - potential for promotions
    return true;
  }

  // Check seniority progression
  const seniorityScores = jobs.map(j => getSeniorityScore(j.seniority)).reverse();
  let isProgressing = false;

  for (let i = 1; i < seniorityScores.length; i++) {
    if (seniorityScores[i] > seniorityScores[i - 1]) {
      isProgressing = true;
      break;
    }
  }

  return isProgressing;
}

function analyzeRoleChangeFrequency(jobs: WorkExperience[]): 'high' | 'normal' | 'low' {
  if (jobs.length === 0) return 'unknown' as any;

  const avgDuration = calculateTotalExperience(jobs) / jobs.length;

  if (avgDuration < 12) return 'high';
  if (avgDuration < 36) return 'normal';

  return 'low';
}

function analyzeJobStability(jobs: WorkExperience[]): 'high' | 'medium' | 'low' {
  if (jobs.length === 0) return 'unknown' as any;

  const avgDuration = calculateTotalExperience(jobs) / jobs.length;

  if (avgDuration > 60) return 'high';
  if (avgDuration > 24) return 'medium';

  return 'low';
}
