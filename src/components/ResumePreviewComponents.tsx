/**
 * Professional Resume Preview Components
 * LaTeX/Overleaf-inspired design for ATS-friendly resumes
 */

import React from 'react';

// Header Component - Name and Contact Info
export function ResumeHeader({ 
  name, 
  email, 
  phone, 
  location, 
  website 
}: {
  name: string;
  email?: string;
  phone?: string;
  location?: string;
  website?: string;
}) {
  const contactInfo = [email, phone, location, website].filter(Boolean).join(' | ');
  
  return (
    <div className="mb-5 pb-4 border-b border-slate-300">
      <h1 className="text-2xl font-bold text-slate-900 mb-1 leading-tight">
        {name || 'Your Name'}
      </h1>
      {contactInfo && (
        <p className="text-xs text-slate-600 leading-tight">
          {contactInfo}
        </p>
      )}
    </div>
  );
}

// Section Header Component
export function ResumeSectionHeader({ title }: { title: string }) {
  return (
    <div className="mb-2 mt-3 first:mt-0">
      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
        {title}
      </h2>
      <div className="h-px bg-slate-400 mt-1"></div>
    </div>
  );
}

// Experience Item Component
export function ResumeExperienceItem({
  position,
  company,
  duration,
  description,
  bulletPoints = []
}: {
  position: string;
  company: string;
  duration?: string;
  description?: string;
  bulletPoints?: string[];
}) {
  return (
    <div className="mb-3">
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="font-semibold text-slate-900">
          {position}
          {company && <span className="font-normal"> — {company}</span>}
        </span>
        {duration && (
          <span className="text-xs text-slate-600 ml-2 flex-shrink-0">
            {duration}
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-slate-700 mb-2 leading-snug">
          {description}
        </p>
      )}
      
      {bulletPoints && bulletPoints.length > 0 && (
        <ul className="ml-4 space-y-0.5">
          {bulletPoints.map((point, idx) => (
            point && (
              <li key={idx} className="text-xs text-slate-700 leading-snug flex">
                <span className="mr-2 flex-shrink-0">•</span>
                <span>{point}</span>
              </li>
            )
          ))}
        </ul>
      )}
    </div>
  );
}

// Education Item Component
export function ResumeEducationItem({
  degree,
  school,
  year,
  gpa,
  details
}: {
  degree: string;
  school: string;
  year?: string;
  gpa?: string;
  details?: string;
}) {
  return (
    <div className="mb-2.5">
      <div className="flex items-baseline justify-between mb-0.5">
        <span className="font-semibold text-slate-900">
          {degree}
          {school && <span className="font-normal"> — {school}</span>}
        </span>
        {year && (
          <span className="text-xs text-slate-600 ml-2 flex-shrink-0">
            {year}
          </span>
        )}
      </div>
      
      <div className="text-xs text-slate-700">
        {gpa && <span className="block">GPA: {gpa}</span>}
        {details && <span className="block">{details}</span>}
      </div>
    </div>
  );
}

// Skills Section Component
export function ResumeSkillsSection({
  skills,
  layout = 'list' // 'list', 'inline', or 'categories'
}: {
  skills: string[] | { category: string; items: string[] }[];
  layout?: 'list' | 'inline' | 'categories';
}) {
  if (layout === 'categories' && Array.isArray(skills) && skills.length > 0 && typeof skills[0] === 'object') {
    return (
      <div className="space-y-2">
        {(skills as { category: string; items: string[] }[]).map((skillGroup, idx) => (
          <div key={idx}>
            <span className="font-semibold text-slate-900">{skillGroup.category}:</span>
            <span className="text-slate-700 ml-2">{skillGroup.items.join(', ')}</span>
          </div>
        ))}
      </div>
    );
  }
  
  const skillList = Array.isArray(skills) 
    ? skills.filter(s => typeof s === 'string' && s.trim())
    : [];
  
  if (layout === 'inline') {
    return (
      <p className="text-xs text-slate-700 leading-snug">
        {skillList.join(', ')}
      </p>
    );
  }
  
  // Default: list layout
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-1">
      {skillList.map((skill, idx) => (
        <div key={idx} className="text-xs text-slate-700 flex items-start">
          <span className="mr-2 flex-shrink-0">•</span>
          <span>{skill}</span>
        </div>
      ))}
    </div>
  );
}

// Summary Section Component
export function ResumeSummarySection({ text }: { text: string }) {
  if (!text) return null;
  
  return (
    <p className="text-xs text-slate-700 leading-snug mb-0">
      {text}
    </p>
  );
}

// Complete Professional Resume Preview
export function ProfessionalResumePreview({
  personal,
  experience,
  education,
  skills,
  summary
}: {
  personal: {
    name: string;
    email?: string;
    phone?: string;
    location?: string;
    website?: string;
  };
  experience: Array<{
    id?: string;
    position: string;
    company: string;
    duration?: string;
    description?: string;
    bulletPoints?: string[];
  }>;
  education: Array<{
    id?: string;
    degree: string;
    school: string;
    year?: string;
    gpa?: string;
  }>;
  skills: string[];
  summary?: string;
}) {
  const hasExperience = experience.some(e => e.position || e.company);
  const hasEducation = education.some(e => e.degree || e.school);
  const hasSkills = skills && skills.length > 0 && skills.some(s => s && s.trim());
  
  return (
    <div className="bg-white p-6 text-slate-900 font-sans" style={{ fontSize: '11px', lineHeight: '1.4' }}>
      {/* Header */}
      <ResumeHeader
        name={personal.name}
        email={personal.email}
        phone={personal.phone}
        location={personal.location}
        website={personal.website}
      />

      {/* Summary */}
      {summary && (
        <>
          <ResumeSectionHeader title="Summary" />
          <ResumeSummarySection text={summary} />
        </>
      )}

      {/* Experience */}
      {hasExperience && (
        <>
          <ResumeSectionHeader title="Experience" />
          <div className="space-y-2">
            {experience.map(exp => (
              (exp.position || exp.company) && (
                <ResumeExperienceItem
                  key={exp.id}
                  position={exp.position || ''}
                  company={exp.company || ''}
                  duration={exp.duration}
                  description={exp.description}
                />
              )
            ))}
          </div>
        </>
      )}

      {/* Education */}
      {hasEducation && (
        <>
          <ResumeSectionHeader title="Education" />
          <div className="space-y-2">
            {education.map(edu => (
              (edu.degree || edu.school) && (
                <ResumeEducationItem
                  key={edu.id}
                  degree={edu.degree || ''}
                  school={edu.school || ''}
                  year={edu.year}
                />
              )
            ))}
          </div>
        </>
      )}

      {/* Skills */}
      {hasSkills && (
        <>
          <ResumeSectionHeader title="Skills" />
          <ResumeSkillsSection skills={skills} layout="inline" />
        </>
      )}
    </div>
  );
}
