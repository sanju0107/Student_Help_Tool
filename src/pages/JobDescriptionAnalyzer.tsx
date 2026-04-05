/**
 * Job Description Analyzer - Break down job description into insights
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  BookOpen,
  Copy,
  Share2,
  Lightbulb,
  Zap,
  AlertCircle,
  CheckCircle2,
  Briefcase,
  Code,
  Trophy
} from 'lucide-react';
import { motion } from 'motion/react';
import { ToolHeader, ToolCard } from '../components/ToolUI';
import {
  ScoreCard,
  InsightCard,
  SectionContainer,
  UploadPasteArea,
  EmptyState,
  ActionButtonGroup,
  KeywordList,
  FeatureList
} from '../components/CareerToolsUI';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { analyzeJobDescription, JobAnalysis } from '../lib/jobAnalyzer';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function JobDescriptionAnalyzer() {
  const toolData = TOOLS.find(t => t.id === 'job-description-analyzer')!;

  useSEO({
    title: 'Job Description Analyzer | Free Online Tool',
    description: 'Analyze job descriptions to find key skills, tools, responsibilities, and get resume optimization tips. Understand what recruiters are looking for.',
    keywords: ['job description analyzer', 'job analyzer', 'skill extraction', 'job posting analysis'],
    pageUrl: 'https://careersuite.io/career/job-description-analyzer'
  });

  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<JobAnalysis | null>(null);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState<'overview' | 'skills' | 'keywords' | 'resume' | 'interview' | 'recruiter'>('overview');

  const handleAnalyze = () => {
    setError('');

    if (!jobDescription.trim() || jobDescription.length < 100) {
      setError('Please enter a complete job description (at least 100 characters)');
      return;
    }

    const analysis = analyzeJobDescription(jobDescription);
    setResult(analysis);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const handleReset = () => {
    setJobDescription('');
    setResult(null);
    setError('');
    setActiveSection('overview');
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      junior: 'bg-green-100 text-green-700',
      mid: 'bg-blue-100 text-blue-700',
      senior: 'bg-purple-100 text-purple-700',
      lead: 'bg-red-100 text-red-700',
      unknown: 'bg-gray-100 text-gray-700'
    };
    return colors[level as keyof typeof colors] || colors.unknown;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 py-8 sm:py-16">
      <Helmet>
        <title>Job Description Analyzer - Extract Key Insights</title>
        <meta name="description" content={toolData.seoDescription} />
        <meta name="keywords" content={toolData.seoKeywords.join(', ')} />
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <ToolHeader
          title="Job Description Analyzer"
          description="Analyze job descriptions to extract key skills, tools, responsibilities, and get insights on what recruiters are looking for."
          icon={BookOpen}
          iconColor="text-amber-600"
          iconBg="bg-amber-100"
          badge="Instant Insights"
        />

        {/* Main Content */}
        <div className="grid gap-8 lg:grid-cols-3 mb-16">
          {/* Input Section */}
          <div className="lg:col-span-2">
            <ToolCard>
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 mb-4">
                    Paste Job Description
                  </h2>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description or job posting..."
                    className="w-full h-56 rounded-2xl border-2 border-slate-200 focus:border-amber-600 focus:outline-none p-4 font-mono text-sm resize-none transition-colors"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {jobDescription.length > 0 && `${jobDescription.length} characters`}
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4"
                  >
                    <p className="text-sm font-semibold text-red-900">{error}</p>
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAnalyze}
                    disabled={!jobDescription.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-500 px-6 py-3 font-bold text-white hover:shadow-lg hover:shadow-amber-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Zap className="h-5 w-5" />
                    Analyze Job Description
                  </button>

                  {result && (
                    <button
                      onClick={handleReset}
                      className="rounded-lg border-2 border-slate-200 bg-white px-6 py-3 font-bold text-slate-900 hover:bg-slate-50 transition-colors"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>
            </ToolCard>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-4"
            >
              <p className="text-xs sm:text-sm text-amber-900">
                <strong>Tip:</strong> Include the full job posting for the most accurate analysis. The more complete the description, the better our extraction.
              </p>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <SectionContainer
              title="Quick Tips"
              icon={Lightbulb}
              subtitle="For job seekers"
            >
              <FeatureList
                items={[
                  {
                    label: 'Read Carefully',
                    description: 'Review the full job description, not just the title'
                  },
                  {
                    label: 'Keywords Matter',
                    description: 'Use the key skills to tailor your resume'
                  },
                  {
                    label: 'Explore Tools',
                    description: 'Learn the required tools and platforms'
                  },
                  {
                    label: 'Match Intent',
                    description: 'Understand recruiter priorities'
                  }
                ]}
              />
            </SectionContainer>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 mb-16"
          >
            {/* Header Info - Enhanced */}
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
              <div className="grid gap-6 mb-6">
                <div>
                  {result.title && (
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">{result.title}</h2>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {/* Experience Level Badge */}
                    <span className={`inline-block rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${getLevelBadge(result.experienceLevel)}`}>
                      {result.experienceLevel === 'unknown' ? 'Level: Not Specified' : `${result.experienceLevel} Level`}
                    </span>

                    {/* Years Required */}
                    {result.yearsRequired !== null && (
                      <span className="inline-block rounded-full bg-blue-100 text-blue-700 px-4 py-2 text-xs font-bold">
                        {result.yearsRequired}+ Years Experience
                      </span>
                    )}

                    {/* Job Type */}
                    {result.jobType !== 'unknown' && (
                      <span className="inline-block rounded-full bg-emerald-100 text-emerald-700 px-4 py-2 text-xs font-bold uppercase">
                        {result.jobType}
                      </span>
                    )}

                    {/* Difficulty Level */}
                    <span className={`inline-block rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide ${
                      result.difficultyLevel === 'beginner' ? 'bg-yellow-100 text-yellow-700' :
                      result.difficultyLevel === 'intermediate' ? 'bg-orange-100 text-orange-700' :
                      result.difficultyLevel === 'advanced' ? 'bg-red-100 text-red-700' :
                      'bg-purple-100 text-purple-700'
                    }`}>
                      {result.difficultyLevel} Difficulty
                    </span>
                  </div>
                </div>

                {/* Company Intent / Role Summary */}
                {result.companyIntent && (
                  <div className="rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 p-4">
                    <p className="text-sm font-semibold text-amber-900">What the Company is Looking For</p>
                    <p className="text-sm text-amber-800 mt-1">{result.companyIntent}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {result.title && (
                  <button
                    onClick={() => handleCopy(result.title || '')}
                    className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Title
                  </button>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-slate-200">
              <div className="flex gap-4 overflow-x-auto pb-4">
                {[
                  { id: 'overview', label: 'Overview', icon: Briefcase },
                  { id: 'skills', label: 'Skills & Tools', icon: Code },
                  { id: 'keywords', label: 'Top Keywords', icon: Lightbulb },
                  { id: 'resume', label: 'Resume Tips', icon: CheckCircle2 },
                  { id: 'interview', label: 'Interview Prep', icon: Trophy },
                  { id: 'recruiter', label: 'Recruiter Focus', icon: AlertCircle }
                ].map(tab => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveSection(tab.id as any)}
                    className={`pb-2 px-3 whitespace-nowrap font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${
                      activeSection === tab.id
                        ? 'border-amber-600 text-amber-600'
                        : 'border-transparent text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Tab: Overview */}
            {activeSection === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SectionContainer title="Key Responsibilities">
                  {result.responsibilities.length > 0 ? (
                    <div className="space-y-2">
                      {result.responsibilities.map((resp, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3 p-3 rounded-lg bg-slate-50"
                        >
                          <CheckCircle2 className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                          <p className="text-sm text-slate-700">{resp}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">No specific responsibilities found in job description.</p>
                  )}
                </SectionContainer>

                <SectionContainer title="Required Qualifications">
                  {result.qualifications.length > 0 ? (
                    <div className="space-y-2">
                      {result.qualifications.map((qual, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3 p-3 rounded-lg bg-slate-50"
                        >
                          <AlertCircle className="h-5 w-5 shrink-0 text-orange-600 mt-0.5" />
                          <p className="text-sm text-slate-700">{qual}</p>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">No specific qualifications found.</p>
                  )}
                </SectionContainer>
              </motion.div>
            )}

            {/* Tab: Skills & Tools */}
            {activeSection === 'skills' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Critical Skills */}
                {result.skillsByPriority?.critical && result.skillsByPriority.critical.length > 0 && (
                  <SectionContainer title="🔴 Critical Skills (Must-Have)">
                    <p className="text-sm text-slate-600 mb-3">These are essential for the role. Focus on these first.</p>
                    <div>
                      <KeywordList keywords={result.skillsByPriority.critical} type="default" />
                      <button
                        onClick={() => handleCopy(result.skillsByPriority.critical.join(', '))}
                        className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700"
                      >
                        Copy critical skills
                      </button>
                    </div>
                  </SectionContainer>
                )}

                {/* Important Skills */}
                {result.skillsByPriority?.important && result.skillsByPriority.important.length > 0 && (
                  <SectionContainer title="🟡 Important Skills (Required)">
                    <p className="text-sm text-slate-600 mb-3">These are frequently mentioned and important.</p>
                    <div>
                      <KeywordList keywords={result.skillsByPriority.important} type="default" />
                      <button
                        onClick={() => handleCopy(result.skillsByPriority.important.join(', '))}
                        className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700"
                      >
                        Copy important skills
                      </button>
                    </div>
                  </SectionContainer>
                )}

                {/* Nice-to-Have Skills */}
                {result.skillsByPriority?.nice_to_have && result.skillsByPriority.nice_to_have.length > 0 && (
                  <SectionContainer title="⚪ Nice-to-Have Skills (Preferred)">
                    <p className="text-sm text-slate-600 mb-3">Bonus skills that would make you more competitive.</p>
                    <KeywordList keywords={result.skillsByPriority.nice_to_have} type="default" />
                  </SectionContainer>
                )}

                {/* Tools & Platforms */}
                {result.tools && result.tools.length > 0 && (
                  <SectionContainer title="Tools & Platforms">
                    <p className="text-sm text-slate-600 mb-3">Technologies and tools required for this role.</p>
                    <div>
                      <KeywordList keywords={result.tools} type="default" />
                      <button
                        onClick={() => handleCopy(result.tools.join(', '))}
                        className="mt-4 text-xs font-bold text-amber-600 hover:text-amber-700"
                      >
                        Copy all tools
                      </button>
                    </div>
                  </SectionContainer>
                )}

                {/* Soft Skills */}
                {result.softSkills && result.softSkills.length > 0 && (
                  <SectionContainer title="Soft Skills">
                    <p className="text-sm text-slate-600 mb-3">Interpersonal and professional skills valued in this role.</p>
                    <KeywordList keywords={result.softSkills} type="default" />
                  </SectionContainer>
                )}

                {/* Missing Skills Awareness */}
                {result.missingSkillsForCandidates && result.missingSkillsForCandidates.length > 0 && (
                  <SectionContainer title="Skills to Prepare For">
                    <p className="text-sm text-slate-600 mb-3">Consider developing these skills to be competitive.</p>
                    <div className="space-y-2">
                      {result.missingSkillsForCandidates.map((skill, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-2 p-2 rounded bg-slate-50"
                        >
                          <Lightbulb className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
                          <span className="text-sm text-slate-700">{skill}</span>
                        </motion.div>
                      ))}
                    </div>
                  </SectionContainer>
                )}
              </motion.div>
            )}

            {/* Tab: Top Keywords for Resume */}
            {activeSection === 'keywords' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SectionContainer title="Top Keywords to Include in Your Resume" icon={Lightbulb}>
                  {result.topKeywordsForResume && result.topKeywordsForResume.length > 0 ? (
                    <div>
                      <p className="text-sm text-slate-600 mb-4">
                        These are the most important keywords from this job description. Use them naturally throughout your resume to improve ATS matching.
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                        {result.topKeywordsForResume.map((keyword, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: idx * 0.1 }}
                            className="rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 px-4 py-3 text-center"
                          >
                            <p className="font-bold text-amber-900 text-sm">{keyword}</p>
                            <p className="text-xs text-amber-700 mt-1">#{idx + 1} Keyword</p>
                          </motion.div>
                        ))}
                      </div>
                      <button
                        onClick={() => handleCopy(result.topKeywordsForResume.join(', '))}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-amber-50 px-4 py-2 text-sm font-bold text-amber-600 hover:bg-amber-100 transition-colors"
                      >
                        <Copy className="h-4 w-4" />
                        Copy All Keywords
                      </button>
                    </div>
                  ) : (
                    <p className="text-slate-600">No specific keywords extracted.</p>
                  )}
                </SectionContainer>

                {/* How to Use Keywords */}
                <SectionContainer title="How to Use These Keywords">
                  <div className="space-y-3">
                    <div className="flex gap-3 p-3 rounded-lg bg-blue-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">Include them in your professional summary</p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-blue-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">Use them when describing your experience and projects</p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-blue-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">Highlight them in your technical skills section</p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-blue-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600 mt-0.5" />
                      <p className="text-sm text-blue-900">Mirror the language naturally—don't keyword stuff</p>
                    </div>
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Tab: Interview Preparation */}
            {activeSection === 'interview' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <SectionContainer title="Common Interview Focus Areas" icon={Trophy}>
                  {result.interviewFocusAreas && result.interviewFocusAreas.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-sm text-slate-600 mb-4">
                        Based on this job description, these are likely areas the interviewer will focus on:
                      </p>
                      {result.interviewFocusAreas.map((area, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex gap-3 p-4 rounded-lg bg-purple-50 border border-purple-200"
                        >
                          <Trophy className="h-5 w-5 shrink-0 text-purple-600 mt-0.5" />
                          <div>
                            <p className="font-semibold text-purple-900 text-sm capitalize">{area}</p>
                            {area === 'system design' && <p className="text-xs text-purple-700 mt-1">Design scalable architectures and discuss trade-offs</p>}
                            {area === 'coding challenges' && <p className="text-xs text-purple-700 mt-1">Solve algorithmic problems efficiently</p>}
                            {area === 'behavioral' && <p className="text-xs text-purple-700 mt-1">Discuss teamwork, leadership, and past experiences</p>}
                            {area === 'domain knowledge' && <p className="text-xs text-purple-700 mt-1">Understand the company's industry and products</p>}
                            {area === 'technical depth' && <p className="text-xs text-purple-700 mt-1">Be prepared for deep technical discussions</p>}
                            {area === 'product sense' && <p className="text-xs text-purple-700 mt-1">Think about user needs and measurable impact</p>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-600">Unable to determine specific interview focus areas.</p>
                  )}
                </SectionContainer>

                <SectionContainer title="Interview Preparation Tips">
                  <div className="space-y-2">
                    <div className="flex gap-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-900">Prepare concrete examples from your experience</p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-900">Research the company's products and technology stack</p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-900">Practice with problems related to the key focus areas</p>
                    </div>
                    <div className="flex gap-3 p-3 rounded-lg bg-green-50">
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                      <p className="text-sm text-green-900">Ask insightful questions about the role and team</p>
                    </div>
                  </div>
                </SectionContainer>
              </motion.div>
            )}
            {activeSection === 'resume' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionContainer title="Optimize Your Resume for This Job" icon={CheckCircle2}>
                  <div className="space-y-3">
                    {result.resumeOptimizationTips.map((tip, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                      >
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                        <p className="text-sm text-green-900">{tip}</p>
                      </motion.div>
                    ))}
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Tab: Recruiter Focus */}
            {activeSection === 'recruiter' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <SectionContainer title="What Recruiters Likely Prioritize" icon={Trophy}>
                  <div className="space-y-3">
                    {result.recruiterFocusPoints.map((point, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex gap-3 p-3 rounded-lg bg-purple-50 border border-purple-200"
                      >
                        <Trophy className="h-5 w-5 shrink-0 text-purple-600 mt-0.5" />
                        <p className="text-sm text-purple-900">{point}</p>
                      </motion.div>
                    ))}
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => handleCopy(JSON.stringify(result, null, 2))}
                className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy Full Analysis
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <Zap className="h-4 w-4" />
                Analyze Another
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!result && !error && jobDescription.length === 0 && (
          <EmptyState
            icon={BookOpen}
            title="Analyze a Job Description"
            description="Paste a job posting to extract key skills, responsibilities, and get tailored resume optimization tips."
            action={{
              label: 'Get Started',
              onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* Related Tools */}
        <RelatedTools currentToolId="job-description-analyzer" />

        {/* FAQ */}
        <FAQ
          items={[
            {
              question: 'How accurate is the skill extraction?',
              answer: 'We identify common industry skills and tools using pattern matching. For best results, paste the complete job description including all sections.'
            },
            {
              question: 'Can I use this to compare multiple jobs?',
              answer: 'Yes! Analyze each job description separately to compare required skills and find the best match for your background.'
            },
            {
              question: 'Should I have all the listed skills?',
              answer: 'No. Look for "required" vs "preferred" sections. Usually having 70-80% of required skills is competitive.'
            },
            {
              question: 'How should I use the recruiter focus points?',
              answer: 'These insights help you tailor your cover letter and resume to emphasize what the recruiter cares about most.'
            }
          ]}
        />
      </div>
    </div>
  );
}
