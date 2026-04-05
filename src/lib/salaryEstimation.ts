/**
 * Salary Estimation Engine
 * Rule-based salary estimations with transparent heuristics
 * Built to be replaceable with real data API later
 */

export interface SalaryEstimate {
  low: number;
  median: number;
  high: number;
  currency: string;
  confidence: 'low' | 'medium' | 'high';
  factors: SalaryFactor[];
  disclaimer: string;
}

export interface SalaryFactor {
  name: string;
  impact: number; // -20 to +20 (percentage impact)
  reason: string;
}

// BASE SALARIES BY ROLE (USD, yearly)
// These are illustrative - based on public salary data
const BASE_SALARIES: Record<string, { low: number; median: number; high: number }> = {
  // Tech roles
  'software engineer': { low: 80000, median: 130000, high: 200000 },
  'developer': { low: 75000, median: 120000, high: 190000 },
  'frontend developer': { low: 75000, median: 125000, high: 180000 },
  'backend developer': { low: 80000, median: 135000, high: 200000 },
  'full stack developer': { low: 85000, median: 140000, high: 210000 },
  'devops engineer': { low: 90000, median: 145000, high: 220000 },
  'data engineer': { low: 95000, median: 150000, high: 230000 },
  'machine learning engineer': { low: 100000, median: 160000, high: 250000 },
  'data scientist': { low: 90000, median: 145000, high: 220000 },
  'qa engineer': { low: 70000, median: 110000, high: 160000 },
  'technical lead': { low: 120000, median: 180000, high: 260000 },
  'engineering manager': { low: 130000, median: 190000, high: 280000 },
  'staff engineer': { low: 140000, median: 210000, high: 300000 },
  'principal engineer': { low: 160000, median: 240000, high: 350000 },
  
  // Product/Design
  'product manager': { low: 120000, median: 175000, high: 260000 },
  'product designer': { low: 85000, median: 130000, high: 190000 },
  'ux designer': { low: 80000, median: 125000, high: 180000 },
  'ui designer': { low: 75000, median: 115000, high: 170000 },
  
  // Data
  'business analyst': { low: 70000, median: 110000, high: 160000 },
  'analytics engineer': { low: 85000, median: 135000, high: 200000 },
  
  // Marketing/Sales
  'marketing manager': { low: 85000, median: 130000, high: 190000 },
  'sales engineer': { low: 90000, median: 145000, high: 220000 },
  'product marketing manager': { low: 100000, median: 155000, high: 230000 },
  
  // HR/Ops
  'operations manager': { low: 75000, median: 115000, high: 170000 },
  'human resources manager': { low: 70000, median: 110000, high: 160000 },
  
  // Default (used if no specific role match)
  'default': { low: 60000, median: 100000, high: 150000 }
};

// LOCATION MULTIPLIERS
// Relative to base salary
const LOCATION_MULTIPLIERS: Record<string, number> = {
  // US - Silicon Valley / Bay Area
  'san francisco': 1.4,
  'san jose': 1.35,
  'palo alto': 1.4,
  'mountain view': 1.35,
  'bay area': 1.35,
  'silicon valley': 1.4,
  
  // US - Major Tech Hubs
  'new york': 1.25,
  'seattle': 1.2,
  'austin': 1.15,
  'denver': 1.1,
  'boston': 1.15,
  'los angeles': 1.15,
  'chicago': 1.05,
  'miami': 1.0,
  
  // US - General
  'united states': 1.0,
  'us': 1.0,
  'remote': 1.05,
  'remote (us)': 1.05,
  
  // International
  'london': 0.80,
  'uk': 0.75,
  'canada': 0.85,
  'toronto': 0.85,
  'vancouver': 0.85,
  'india': 0.30,
  'bangalore': 0.30,
  'india (remote)': 0.35,
  'australia': 0.85,
  'sydney': 0.85,
  'singapore': 0.75,
  'dubai': 0.70,
  'germany': 0.85,
  'berlin': 0.80,
  'europe': 0.80,
};

// INDUSTRY MULTIPLIERS
const INDUSTRY_MULTIPLIERS: Record<string, number> = {
  'faang': 1.3, // Facebook, Apple, Amazon, Netflix, Google
  'tech startup': 1.1,
  'tech company': 1.1,
  'fintech': 1.2,
  'finance': 1.15,
  'finance company': 1.15,
  'bank': 1.05,
  'government': 0.85,
  'nonprofit': 0.75,
  'healthcare': 0.95,
  'healthcare tech': 1.05,
  'ecommerce': 1.1,
  'retail': 0.9,
  'consulting': 1.05,
  'fortune 500': 1.05,
  'enterprise': 1.0,
  'startup': 0.8,
  'mid-size': 0.95,
  'small business': 0.85,
};

// COMPANY TYPE MULTIPLIERS
const COMPANY_TYPE_MULTIPLIERS: Record<string, number> = {
  'startup': 0.80,
  'scaleup': 0.95,
  'mid-size': 1.0,
  'enterprise': 1.05,
  'large enterprise': 1.1,
  'public': 1.05,
  'private': 0.95
};

// EMPLOYMENT TYPE ADJUSTMENTS
const EMPLOYMENT_TYPE_ADJUSTMENTS: Record<string, number> = {
  'full-time': 1.0,
  'contract': 1.2,  // Contract usually pays more hourly
  'part-time': 0.6,
  'freelance': 1.3   // Freelance premium
};

/**
 * Parse role name and find closest match
 */
function findClosestRole(inputRole: string): string {
  const input = inputRole.toLowerCase().trim();
  const roles = Object.keys(BASE_SALARIES).filter(r => r !== 'default');
  
  // Exact match
  if (BASE_SALARIES[input]) return input;
  
  // Contains match
  for (const role of roles) {
    if (input.includes(role) || role.includes(input)) {
      return role;
    }
  }
  
  // Fuzzy match on key words
  const inputWords = input.split(/\s+/);
  for (const role of roles) {
    const roleWords = role.split(/\s+/);
    const matches = inputWords.filter(w => roleWords.some(rw => rw.includes(w) || w.includes(rw)));
    if (matches.length >= 1) {
      return role;
    }
  }
  
  return 'default';
}

/**
 * Get location multiplier
 */
function getLocationMultiplier(location: string): number {
  if (!location) return 1.0;
  
  const loc = location.toLowerCase().trim();
  
  // Exact match
  if (LOCATION_MULTIPLIERS[loc]) return LOCATION_MULTIPLIERS[loc];
  
  // Partial match
  for (const [key, value] of Object.entries(LOCATION_MULTIPLIERS)) {
    if (loc.includes(key) || key.includes(loc)) {
      return value;
    }
  }
  
  return 1.0;
}

/**
 * Get industry multiplier
 */
function getIndustryMultiplier(industry: string): number {
  if (!industry) return 1.0;
  
  const ind = industry.toLowerCase().trim();
  
  // Exact match
  if (INDUSTRY_MULTIPLIERS[ind]) return INDUSTRY_MULTIPLIERS[ind];
  
  // Partial match
  for (const [key, value] of Object.entries(INDUSTRY_MULTIPLIERS)) {
    if (ind.includes(key) || key.includes(ind)) {
      return value;
    }
  }
  
  return 1.0;
}

/**
 * Calculate experience multiplier
 */
function getExperienceMultiplier(yearsOfExperience: number): { multiplier: number; factor: SalaryFactor } {
  // Junior (0-2 years)
  if (yearsOfExperience <= 2) {
    return {
      multiplier: 0.8,
      factor: {
        name: 'Junior Level Experience',
        impact: -20,
        reason: `Early career with ${yearsOfExperience} years experience`
      }
    };
  }
  
  // Mid (3-6 years)
  if (yearsOfExperience <= 6) {
    return {
      multiplier: 1.0,
      factor: {
        name: 'Mid-Level Experience',
        impact: 0,
        reason: `${yearsOfExperience} years of experience`
      }
    };
  }
  
  // Senior (7-12 years)
  if (yearsOfExperience <= 12) {
    return {
      multiplier: 1.15,
      factor: {
        name: 'Senior Level Experience',
        impact: 15,
        reason: `Senior role with ${yearsOfExperience} years experience`
      }
    };
  }
  
  // Lead (13+ years)
  return {
    multiplier: 1.3,
    factor: {
      name: 'Lead/Principal Level',
      impact: 30,
      reason: `${yearsOfExperience}+ years - leadership level`
    }
  };
}

/**
 * Main salary estimation function
 */
export function estimateSalary(params: {
  jobTitle: string;
  yearsOfExperience: number;
  location?: string;
  industry?: string;
  companyType?: string; // 'startup', 'mid-size', 'enterprise'
  employmentType?: string; // 'full-time', 'contract', etc.
  currency?: string;
}): SalaryEstimate {
  const {
    jobTitle,
    yearsOfExperience,
    location = 'united states',
    industry,
    companyType,
    employmentType = 'full-time',
    currency = 'USD'
  } = params;
  
  // Get base salary
  const matchedRole = findClosestRole(jobTitle);
  const baseSalary = BASE_SALARIES[matchedRole] || BASE_SALARIES['default'];
  
  // Calculate multipliers
  const locationMult = getLocationMultiplier(location);
  const industryMult = getIndustryMultiplier(industry || '');
  const companyTypeMult = companyType ? (COMPANY_TYPE_MULTIPLIERS[companyType.toLowerCase()] || 1.0) : 1.0;
  const employmentMult = EMPLOYMENT_TYPE_ADJUSTMENTS[employmentType.toLowerCase()] || 1.0;
  const expResult = getExperienceMultiplier(yearsOfExperience);
  
  // Apply multipliers
  const multiplier = locationMult * industryMult * companyTypeMult * employmentMult * expResult.multiplier;
  const confidence = yearsOfExperience > 0 ? ('medium' as const) : ('low' as const);
  
  const estimate = {
    low: Math.round(baseSalary.low * multiplier / 5000) * 5000,
    median: Math.round(baseSalary.median * multiplier / 5000) * 5000,
    high: Math.round(baseSalary.high * multiplier / 5000) * 5000,
    currency,
    confidence,
    factors: [] as SalaryFactor[],
    disclaimer: 'This is an indicative estimate based on publicly available salary data. Actual salaries vary based on individual negotiation, company policies, and market conditions. This is not a guarantee.'
  };
  
  // Build factors for transparency
  estimate.factors.push({
    name: 'Base Role Salary',
    impact: 0,
    reason: `${matchedRole} base range`
  });
  
  if (locationMult !== 1.0) {
    estimate.factors.push({
      name: 'Geographic Location',
      impact: Math.round((locationMult - 1) * 100),
      reason: location
    });
  }
  
  if (industryMult !== 1.0) {
    estimate.factors.push({
      name: 'Industry',
      impact: Math.round((industryMult - 1) * 100),
      reason: industry || 'General industry'
    });
  }
  
  if (companyTypeMult !== 1.0) {
    estimate.factors.push({
      name: 'Company Size',
      impact: Math.round((companyTypeMult - 1) * 100),
      reason: companyType || 'Company type'
    });
  }
  
  if (employmentMult !== 1.0) {
    estimate.factors.push({
      name: 'Employment Type',
      impact: Math.round((employmentMult - 1) * 100),
      reason: employmentType
    });
  }
  
  estimate.factors.push(expResult.factor);
  
  return estimate;
}

/**
 * Generate suggestions to improve salary potential
 */
export function generateSalarySuggestions(yearsOfExperience: number, currentSkills: string[]): string[] {
  const suggestions: string[] = [];
  
  if (yearsOfExperience < 2) {
    suggestions.push('Gain 2-3 years of solid experience in your field to move to mid-level roles');
    suggestions.push('Get relevant certifications (AWS, GCP, etc.) to accelerate career growth');
  }
  
  if (yearsOfExperience < 5 && currentSkills.length < 5) {
    suggestions.push('Develop specialized skills in high-demand areas (ML, DevOps, Cloud) to earn more');
  }
  
  if (yearsOfExperience >= 5) {
    suggestions.push('Consider leadership or specialization roles (Tech Lead, Architect, Manager) for significantly higher pay');
    suggestions.push('Pursue roles at large tech companies or FAANG organizations');
  }
  
  suggestions.push('Remote/US positions typically pay 15-40% more than international locations');
  suggestions.push('Contract roles pay 20-30% more hourly but lack benefits');
  suggestions.push('Negotiate your baseline - first offers are often 10-20% below market');
  
  return suggestions;
}
