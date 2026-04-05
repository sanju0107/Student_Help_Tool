# Job Analyzer Technical Reference Guide

## Overview
This guide documents the internal architecture, functions, and data structures of the enhanced Job Description Analyzer (`src/lib/jobAnalyzer.ts`).

---

## Architecture

### Main Entry Point: `analyzeJobDescription(description: string): JobAnalysis`

The main function orchestrates the entire analysis pipeline:

```typescript
export function analyzeJobDescription(description: string): JobAnalysis {
  // 1. Normalize input text
  const normalized = normalizeText(description);
  
  // 2. Extract core metadata
  const title = extractJobTitleFromJD(normalized);
  const jobType = detectJobType(normalized);
  const yearsRequired = extractYearsRequired(normalized);
  
  // 3. Build scoring context
  const context = { title, jobType, yearsRequired };
  
  // 4. Extract content sections
  const responsibilities = extractResponsibilities(normalized);
  const qualifications = extractQualifications(normalized);
  
  // 5. Extract skills
  const { critical, important, nice_to_have } = extractAndPrioritizeSkills(normalized, context);
  const tools = extractTools(normalized);
  const softSkills = extractSoftSkills(normalized);
  
  // 6. Calculate derived metrics
  const experienceLevel = extractExperienceLevel(normalized);
  const difficultyLevel = calculateDifficultyLevel(normalized, context);
  
  // 7. Generate advanced insights
  const missingSkills = identifyMissingSkills([...critical, ...important], yearsRequired);
  const keywords = extractTopKeywordsByFrequency(normalized, 5);
  const interviewFocusAreas = detectInterviewFocusAreas(normalized);
  const companyIntent = generateCompanyIntent(normalized, experienceLevel);
  
  // 8. Generate recommendations
  const resumeTips = generateResumeTips(critical, tools, softSkills, keywords, experienceLevel);
  const recruiterFocusPoints = generateRecruiterFocusPoints(normalized);
  
  // 9. Return analysis object
  return {
    title,
    experienceLevel,
    yearsRequired,
    jobType,
    difficultyLevel,
    keySkills: [...critical, ...important],
    skillsByPriority: { critical, important, nice_to_have },
    tools,
    softSkills,
    responsibilities,
    qualifications,
    keywords,
    missingSkillsForCandidates: missingSkills,
    topKeywordsForResume: keywords,
    interviewFocusAreas,
    resumeOptimizationTips: resumeTips,
    recruiterFocusPoints,
    companyIntent
  };
}
```

---

## Data Structures

### JobAnalysis Interface

```typescript
export interface JobAnalysis {
  // Identification
  title: string | null;
  experienceLevel: 'junior' | 'mid' | 'senior' | 'lead' | 'unknown';
  yearsRequired: number | null;
  jobType: 'remote' | 'on-site' | 'hybrid' | 'unknown';
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  
  // Skills (flat lists for backward compatibility)
  keySkills: string[];
  tools: string[];
  softSkills: string[];
  
  // Skills (prioritized structure)
  skillsByPriority: {
    critical: string[];      // Must-have
    important: string[];     // Required
    nice_to_have: string[];  // Optional
  };
  
  // Content
  responsibilities: string[];
  qualifications: string[];
  keywords: string[];
  
  // Advanced Analysis
  missingSkillsForCandidates: string[];
  topKeywordsForResume: string[];
  interviewFocusAreas: string[];
  companyIntent: string;
  
  // Recommendations
  resumeOptimizationTips: string[];
  recruiterFocusPoints: string[];
}
```

### Skill Database

```typescript
const SKILL_DATABASE = {
  programming_languages: ['Python', 'JavaScript', 'TypeScript', ...],
  frontend_frameworks: ['React', 'Vue', 'Angular', ...],
  backend_frameworks: ['Django', 'Flask', 'Express', ...],
  database_technologies: ['PostgreSQL', 'MongoDB', ...],
  cloud_platforms: ['AWS', 'Azure', 'GCP', ...],
  devops_tools: ['Docker', 'Kubernetes', ...],
  data_science: ['TensorFlow', 'PyTorch', ...],
  other_tools: ['Git', 'Docker', 'Jira', ...]
};
```

### Interview Focus Patterns

```typescript
const INTERVIEW_FOCUS_PATTERNS = {
  'system design': ['architecture', 'scalable', 'distributed', ...],
  'coding challenges': ['algorithms', 'optimization', 'data structures', ...],
  'behavioral': ['leadership', 'teamwork', 'communication', ...],
  'domain knowledge': ['e-commerce', 'healthcare', 'finance', ...],
  'technical depth': ['advanced', 'expert', 'mastery', ...],
  'product sense': ['user experience', 'impact', 'metrics', ...]
};
```

---

## Utility Functions Reference

### Text Processing

#### `normalizeText(text: string): string`
**Purpose**: Clean and normalize input text for consistent processing
**Process**:
1. Remove leading/trailing whitespace
2. Convert to lowercase
3. Replace multiple spaces with single space
4. Remove common formatting characters

**Example**:
```typescript
const normalized = normalizeText("  Senior React Developer  \n\nRequired ");
// Result: "senior react developer required"
```

---

### Job Metadata Extraction

#### `extractJobTitleFromJD(text: string): string | null`
**Purpose**: Extract job title using multiple strategies

**Patterns (tried in order)**:
1. "Position:" or "Role:" - Look for explicit role declaration
2. First line extraction - Usually job title
3. "title" or "position" regex - Common in formatted JDs
4. Common job title keywords - Match against 50+ titles

**Example**:
```typescript
extractJobTitleFromJD("Position: Senior React Developer");
// Returns: "Senior React Developer"
```

#### `detectJobType(text: string): 'remote' | 'on-site' | 'hybrid' | 'unknown'`
**Purpose**: Determine work arrangement

**Keywords**:
- Remote: "remote", "work from home", "distributed", "anywhere"
- On-site: "on-site", "onsite", "in-office", "office based"
- Hybrid: "hybrid", "flexible", "mixed"

**Logic**: Returns first match found, unknown if none

---

#### `extractYearsRequired(text: string): number | null`
**Purpose**: Parse required years of experience

**Patterns**:
- "5+ years" → 5
- "3-8 years" → 3 (takes minimum)
- "8 years of experience" → 8

**Result**: Returns first valid number found or null

---

#### `extractExperienceLevel(text: string): 'junior' | 'mid' | 'senior' | 'lead' | 'unknown'`
**Purpose**: Determine career level

**Keywords**:
- Junior: "junior", "entry", "entry-level", "trainee"
- Mid: "mid", "intermediate", "mid-level"
- Senior: "senior", "principal", "expert"
- Lead: "lead", "staff", "architect"

**Logic**: Looks for exact keywords, defaults to unknown

---

### Skill Extraction & Prioritization

#### `extractAndPrioritizeSkills(text: string, context: ScoringContext): PrioritizedSkills`
**Purpose**: Extract skills and categorize by priority

**Algorithm**:
```
1. Split JD into sections (Required, Preferred, Responsibilities)
2. For each section:
   a. Extract all skills from text
   b. Categorize: Technical, Soft Skills, Tools
   c. Prioritize based on section importance
3. Return categorized skills
```

**Priority Rules**:
- "Required" section → CRITICAL or IMPORTANT
- "Preferred" section → NICE_TO_HAVE
- Mentioned in multiple sections → Higher priority
- Appears in first 2 sentences → Likely CRITICAL

**Example**:
```typescript
const result = extractAndPrioritizeSkills(
  "Required: React, Node.js, PostgreSQL. Preferred: Docker",
  context
);
// Returns:
// {
//   critical: ['React', 'Node.js', 'PostgreSQL'],
//   important: [],
//   nice_to_have: ['Docker']
// }
```

---

#### `extractTools(text: string): string[]`
**Purpose**: Extract development tools and platforms

**Tools Database** (40+):
- Git, Docker, Kubernetes, Jenkins, AWS, Azure, GCP, Jira, Confluence, Slack, GitHub, GitLab, Heroku, Firebase, MongoDB Atlas, GraphQL, REST, Microservices, Agile, Scrum, etc.

**Process**:
1. Lowercase and normalize text
2. Search for each tool keyword
3. Deduplicate and return

---

#### `extractSoftSkills(text: string): string[]`
**Purpose**: Extract soft skills from JD

**Soft Skills Database** (19):
- Communication, Teamwork, Leadership, Problem-solving, Critical thinking, Project Management, Public speaking, Mentoring, Collaboration, Adaptability, Time Management, Decision Making, Negotiation, Presentation, Emotional Intelligence, Conflict Resolution, Self-Motivation, Initiative, Accountability

**Process**: Regex search for each soft skill keyword

---

### Content Extraction

#### `extractResponsibilities(text: string): string[]`
**Purpose**: Extract role responsibilities

**Approach**:
1. Find "Responsibilities:" section
2. Extract bullet points until next major section
3. Clean and trim each point

**Bullet Point Handling**:
- Handles: •, -, *, ►, numbered lists (1., 2., etc.)
- Removes extra whitespace
- Strips parenthetical notes

---

#### `extractQualifications(text: string): string[]`
**Purpose**: Extract required/desired qualifications

**Sections Found**:
- "Qualifications:"
- "Required Qualifications:"
- "Required:"
- "Experience:"

**Same processing as Responsibilities**

---

### Advanced Analytics

#### `calculateDifficultyLevel(text: string, context: ScoringContext): 'beginner' | 'intermediate' | 'advanced' | 'expert'`
**Purpose**: Calculate overall role difficulty/seniority

**Scoring Algorithm**:

```
Base Score:
  Junior role: +1
  Mid role: +2
  Senior role: +3
  Lead role: +4

Experience Weight:
  <3 years mentioned: +1
  3-6 years: +2
  6-10 years: +3
  10+ years: +4

Technical Complexity (keyword search):
  Advanced/Expert/Mastery: +2
  Architecture/Microservices/Scalability: +2
  Performance/Optimization/Concurrency: +1
  Leadership/Mentoring: +1

Final Level:
  Score 13+: EXPERT
  Score 9-12: ADVANCED
  Score 5-8: INTERMEDIATE
  Score <5: BEGINNER
```

---

#### `identifyMissingSkills(acquiredSkills: string[], yearsRequired: number | null): string[]`
**Purpose**: Suggest skills candidates should learn

**Junior Candidate** (0-3 years):
- Suggests: Git, Unit Testing, Data Structures, OOP, SQL, REST APIs, HTML/CSS

**Mid Candidate** (3-7 years):
- Suggests: System Design, Clean Code, Performance, Security, Docker, CI/CD

**Senior Candidate** (7+ years):
- Suggests: Architecture, Machine Learning, Microservices, Team Leadership, Strategic Skills

**Algorithm**:
1. Get skill recommendations for candidate level
2. Filter out skills already acquired
3. Return prioritized gap list

---

#### `extractTopKeywordsByFrequency(text: string, count: number = 5): string[]`
**Purpose**: Extract most important keywords for resume

**Algorithm**:
1. Split text into words
2. Remove common English stopwords
3. Count frequency of each meaningful word
4. Weight by importance category:
   - Tech skills: 2x weight
   - Tools: 1.5x weight
   - Tools: 1.5x weight
   - Regular words: 1x weight
5. Sort by weighted frequency
6. Return top N results

**Stopwords Removed**: ["the", "a", "an", "and", "or", "but", "in", "on", "at", "to", standard 50+ stopwords]

---

#### `detectInterviewFocusAreas(text: string): string[]`
**Purpose**: Identify likely interview focus areas

**Detection** (6 areas):

```
1. SYSTEM DESIGN
   Keywords: architecture, scalable, distributed, design, system, microservices
   
2. CODING CHALLENGES
   Keywords: algorithms, data structures, optimization, coding, leetcode
   
3. BEHAVIORAL
   Keywords: leadership, teamwork, communication, collaboration, culture
   
4. DOMAIN KNOWLEDGE
   Keywords: industry-specific (e-commerce, healthcare, fintech, etc.)
   
5. TECHNICAL DEPTH
   Keywords: advanced, expert, mastery, deep knowledge, proficiency
   
6. PRODUCT SENSE
   Keywords: user experience, impact, metrics, customer, products
```

**Process**:
1. Search for keywords for each area
2. If found, add area to results
3. Return all detected areas

---

### Recommendations

#### `generateCompanyIntent(text: string, experienceLevel: string): string`
**Purpose**: Summarize company's underlying intent/culture

**Patterns Detected** (8 types):

```typescript
// Startup: fast-moving, learning, innovation
"High-growth startup seeking versatile engineers..."

// Enterprise: stability, scalability, legacy
"Large organization with focus on scalable systems..."

// Scaleup: rapid growth, optimization
"High-growth company prioritizing scalability..."

// Innovation: cutting-edge, research
"Company focused on emerging technologies..."

// Security-focused: compliance, safety, trust
"Organization prioritizing security and compliance..."

// User-focused: customer, experience, empathy
"Company with strong focus on user experience..."

// Service-based: client needs, delivery
"Service organization seeking delivery excellence..."

// Culture-first: values, collaboration, growth
"Organization valuing team collaboration..."
```

**Return**: Single sentence describing likely company intent

---

#### `generateResumeTips(skills: string[], tools: string[], softSkills: string[], keywords: string[], experienceLevel: string): string[]`
**Purpose**: Generate personalized resume optimization tips

**8 Dynamic Tips** (varies by role):

1. **Lead with Critical Skills** - "Emphasize React, TypeScript, and Node.js in your professional summary"
2. **Create Technical Skills Section** - "Add organized section: Programming (React, TypeScript...), Tools (Docker, AWS...)"
3. **Show Soft Skills Through Actions** - "Use examples of teamwork, leadership, and communication in descriptions"
4. **Use Industry Keywords** - "Include: React, TypeScript, AWS, REST, microservices throughout resume"
5. **Quantify Performance** - "Add metrics: 'Optimized React performance by 40%'"
6. **Level-Specific Focus** - (varies by senior/junior)
7. **ATS Optimization** - "Mirror exact keywords from job description for ATS matching"
8. **Interview Prep** - "Research: system design principles, architectural patterns"

---

#### `generateRecruiterFocusPoints(text: string): string[]`
**Purpose**: Identify what recruiters likely prioritize

**Patterns** (company size and type):

```
Startup Focus:
- Versatility and ability to wear multiple hats
- Self-motivation and ownership
- Culture fit and flexibility
- Innovation mindset

Enterprise Focus:
- Scalability and system design
- Team collaboration and communication
- Stability and reliability focus
- Process and documentation

Scale-up Focus:
- Rapid learning ability
- Performance optimization
- Leadership potential
- Driving results

Culture-Driven Focus:
- Team collaboration and communication
- Values and ethics alignment
- Growth mindset
- Continuous learning
```

**Process**:
1. Detect company profile from keywords
2. Return recruiter priorities for that profile
3. Return 5-7 focus points

---

## Performance Considerations

### Optimization Patterns

**1. Compiled Regex Patterns**
```typescript
// Create once, reuse many times
const TOOLS_REGEX = /\b(docker|kubernetes|aws|gcp|azure)\b/gi;

// Then use in: text.match(TOOLS_REGEX)
```

**2. Database Lookups**
```typescript
// Use Set for O(1) lookup instead of Array
const skillSet = new Set(SKILL_DATABASE.programming_languages);
// Then use: skillSet.has(word)
```

**3. Early Returns**
```typescript
// Stop searching once found
for (const pattern of patterns) {
  if (matches) return result; // Early exit
}
```

### Recommended Enhancements

**For Large Batch Processing**:
- Cache compiled regex patterns
- Pre-build skill/tool lookup sets
- Use lazy evaluation for secondary metrics

**For Real-time Feedback**:
- Debounce analysis on input change (400-500ms)
- Cache previous analyses
- Show incremental results

---

## Testing Strategies

### Unit Test Examples

```typescript
describe('normalizeText', () => {
  test('removes extra whitespace', () => {
    const result = normalizeText('  hello  world  ');
    expect(result).toBe('hello world');
  });

  test('converts to lowercase', () => {
    const result = normalizeText('HELLO World');
    expect(result).toBe('hello world');
  });
});

describe('detectJobType', () => {
  test('identifies remote position', () => {
    expect(detectJobType('Remote position')).toBe('remote');
  });

  test('defaults to unknown for ambiguous', () => {
    expect(detectJobType('Flexible working arrangement')).toBe('unknown');
  });
});

describe('extractYearsRequired', () => {
  test('parses "X+ years"', () => {
    expect(extractYearsRequired('5+ years experience')).toBe(5);
  });

  test('returns null if no years mentioned', () => {
    expect(extractYearsRequired('Experienced developer')).toBeNull();
  });
});
```

### Integration Test Strategy

```typescript
test('full analysis pipeline', () => {
  const jd = `
    Senior React Developer
    Remote position
    Required: 5+ years React, TypeScript, Node.js
    Nice to have: Kubernetes, GraphQL
  `;
  
  const result = analyzeJobDescription(jd);
  
  expect(result.title).toBe('Senior React Developer');
  expect(result.jobType).toBe('remote');
  expect(result.yearsRequired).toBe(5);
  expect(result.skillsByPriority.critical).toContain('React');
  expect(result.skillsByPriority.nice_to_have).toContain('Kubernetes');
  expect(result.companyIntent).toBeDefined();
});
```

---

## Maintenance Guide

### Adding New Skills

1. **Locate Skill Database**: Line 20-100 in jobAnalyzer.ts
2. **Add to Category**:
   ```typescript
   const SKILL_DATABASE = {
     programming_languages: ['Python', 'JavaScript', 'NewLanguage'], // Add here
     // ...
   };
   ```
3. **Rebuild**: `npm run build`
4. **Test**: Add unit test for new skill extraction

### Adding New Interview Focus Area

1. **Update INTERVIEW_FOCUS_PATTERNS**:
   ```typescript
   const INTERVIEW_FOCUS_PATTERNS = {
     'system design': [...],
     'coding challenges': [...],
     'new_focus_area': ['keyword1', 'keyword2', 'keyword3']
   };
   ```

2. **Update detectInterviewFocusAreas()**: Verify it includes new area

3. **Update JobDescriptionAnalyzer.tsx**: Add display for new area (if needed)

### Adding New Company Intent Pattern

1. **Update generateCompanyIntent()**: Add new pattern detection
2. **Test with sample JDs**: Verify pattern matches correctly
3. **Document pattern**: Add comment explaining detection logic

---

## Troubleshooting

### Issue: Skills Not Extracted
**Diagnosis**: Check if skill is in database
- Solution: Add to appropriate category in SKILL_DATABASE
- Verify: Rebuild and test

### Issue: Incorrect Difficulty Level
**Diagnosis**: Scoring algorithm miscalibration
- Solution: Review scoring weights in calculateDifficultyLevel
- Adjust weights if needed
- Test with various role types

### Issue: Wrong Job Type Detected
**Diagnosis**: Keywords not matching
- Solution: Check detectJobType() keywords
- Add more flexible patterns if needed
- Update regex if required

### Issue: Missing Content in Sections
**Diagnosis**: Section headers not found
- Solution: Add alternate section names to extraction functions
- Update regex patterns for better matching
- Handle edge cases

---

## API Reference

### Main Export
```typescript
export function analyzeJobDescription(description: string): JobAnalysis
```

### Helper Exports (if needed externally)
```typescript
export function normalizeText(text: string): string
export function detectJobType(text: string): 'remote' | 'on-site' | 'hybrid' | 'unknown'
export interface JobAnalysis { ... }
```

---

Updated: [Current Date]
Current Version: 1.0 (Production)
