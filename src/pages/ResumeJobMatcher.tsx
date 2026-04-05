/**
 * Resume vs Job Matcher - Match resume against job description
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Target,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Copy,
  Upload,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ToolHeader, ToolCard } from '../components/ToolUI';
import {
  ScoreCard,
  SectionContainer,
  UploadPasteArea,
  EmptyState,
} from '../components/CareerToolsUI';
import {
  CompleteResultCard,
  VerdictBadge,
  SectionBreakdown
} from '../components/ResumeMatcherResult';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { matchResumeToJob, MatchResult } from '../lib/resumeMatcher';
import { extractTextFromFile, validateResumeLength } from '../lib/textExtraction';
import { validateResumeFileUpload, getFirstError } from '../lib';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function ResumeJobMatcher() {
  const toolData = TOOLS.find(t => t.id === 'resume-job-matcher')!;

  useSEO({
    title: 'Resume vs Job Matcher | Free Online Tool',
    description: 'Compare your resume against a job description. See matching skills, missing keywords, and get specific recommendations to improve your match score.',
    keywords: ['resume matcher', 'job description analyzer', 'resume optimization', 'job matching'],
    pageUrl: 'https://careersuite.io/career/resume-job-matcher'
  });

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<MatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleResumeFileUpload = async (file: File) => {
    // Validate file first
    const validation = validateResumeFileUpload(file);
    
    if (!validation.valid) {
      setError(getFirstError(validation) || 'Invalid resume file');
      return;
    }

    try {
      setError('');
      setLoading(true);
      const text = await extractTextFromFile(file);
      setResumeText(text);
    } catch (err) {
      let userMessage = 'Unable to process file. ';
      
      if (err instanceof Error) {
        const errorMsg = err.message.toLowerCase();
        
        // Provide helpful error messages to users
        if (errorMsg.includes('worker') || errorMsg.includes('fetch') || errorMsg.includes('import')) {
          userMessage = 'Temporary issue loading PDF processor. Please try again in a moment, or paste your resume text directly.';
        } else if (errorMsg.includes('scanned') || errorMsg.includes('image')) {
          userMessage = 'This PDF appears to be a scanned image. Please paste the text content directly or upload a text-based PDF.';
        } else if (errorMsg.includes('unsupported')) {
          userMessage = 'Unsupported file format. Please upload PDF, DOCX, or TXT files.';
        } else if (errorMsg.includes('empty')) {
          userMessage = 'File appears to be empty. Please check the file and try again.';
        } else {
          userMessage = err.message;
        }
      }
      
      // Filter out technical jargon for display
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = () => {
    setError('');

    // Validate
    if (!resumeText.trim()) {
      setError('Please enter or upload your resume text');
      return;
    }

    if (!jobDescription.trim()) {
      setError('Please enter a job description');
      return;
    }

    if (resumeText.length < 100 || jobDescription.length < 100) {
      setError('Both resume and job description need to be at least 100 characters');
      return;
    }

    // Match
    const matchResult = matchResumeToJob(resumeText, jobDescription);
    setResult(matchResult);
  };

  const handleCopy = () => {
    if (!result) return;

    const text = `
Match Score: ${result.matchScore}/100
Verdict: ${result.verdict} Match
Confidence: ${result.confidence}%

MATCH BREAKDOWN:
- Skills Match: ${result.breakdown.skillsMatch}%
- Experience Match: ${result.breakdown.experienceMatch}%
- Keyword Frequency: ${result.breakdown.keywordFrequencyMatch}%
- Role Alignment: ${result.breakdown.roleAlignment}%

MATCHED KEYWORDS:
Technical: ${result.matchedKeywords.technical.join(', ') || 'None'}
Soft Skills: ${result.matchedKeywords.soft.join(', ') || 'None'}

MISSING KEYWORDS:
Technical: ${result.missingKeywords.technical.join(', ') || 'None'}
Soft Skills: ${result.missingKeywords.soft.join(', ') || 'None'}

STRENGTHS:
${result.strengths.map(s => `• ${s}`).join('\n')}

GAPS:
${result.gaps.map(g => `• ${g}`).join('\n')}

IMPROVEMENTS:
${result.improvements.map(i => `• ${i}`).join('\n')}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  const handleReset = () => {
    setResumeText('');
    setJobDescription('');
    setResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 sm:py-16">
      <Helmet>
        <title>Resume vs Job Matcher - Compare & Optimize</title>
        <meta name="description" content={toolData.seoDescription} />
        <meta name="keywords" content={toolData.seoKeywords.join(', ')} />
      </Helmet>

      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <ToolHeader
          title="Resume vs Job Matcher"
          description="Compare your resume against a job description and get a match score with targeted recommendations."
          icon={Target}
          iconColor="text-purple-600"
          iconBg="bg-purple-100"
          badge="AI-Powered"
        />

        {/* Main Content */}
        {!result ? (
          <ToolCard className="mb-16">
            <div className="space-y-8">
              {/* Resume Input */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  Your Resume
                </h2>
                <UploadPasteArea
                  value={resumeText}
                  onTextChange={setResumeText}
                  onFileSelect={handleResumeFileUpload}
                  placeholder="Paste your resume or upload a file (PDF/DOCX/TXT)..."
                  acceptTypes=".pdf,.docx,.txt"
                />
                <p className="mt-2 text-xs text-slate-500">
                  {resumeText.length > 0 && `${resumeText.length} characters`}
                </p>

                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 flex items-center gap-2 text-blue-600 font-semibold"
                  >
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Processing resume...
                  </motion.div>
                )}
              </div>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm font-bold text-slate-600">VS</span>
                </div>
              </div>

              {/* Job Description Input */}
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Job Description
                </h2>
                <div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the job description or job posting..."
                    className="w-full h-48 rounded-2xl border-2 border-slate-200 focus:border-purple-600 focus:outline-none p-4 font-mono text-sm resize-none transition-colors"
                  />
                  <p className="mt-2 text-xs text-slate-500">
                    {jobDescription.length > 0 && `${jobDescription.length} characters`}
                  </p>
                </div>
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

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleMatch}
                  disabled={!resumeText.trim() || !jobDescription.trim() || loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-3 font-bold text-white hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Target className="h-5 w-5" />
                  Calculate Match Score
                </button>
              </div>

              {/* Info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-lg bg-purple-50 border border-purple-200 p-4"
              >
                <p className="text-xs sm:text-sm text-purple-900">
                  <strong>How it works:</strong> We analyze keywords, requirements, and experience alignment
                  to calculate a match score and provide specific areas to improve.
                </p>
              </motion.div>
            </div>
          </ToolCard>
        ) : (
          // Results View - Using new Premium Components
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-8 mb-16"
          >
            <ToolCard>
              <CompleteResultCard
                result={result}
                onCopy={handleCopy}
                onReset={handleReset}
              />
            </ToolCard>
          </motion.div>
        )}

        {/* Empty State */}
        {!result && !error && resumeText.length === 0 && jobDescription.length === 0 && (
          <EmptyState
            icon={Upload}
            title="Compare Your Resume to a Job"
            description="Paste your resume and a job description to see how well they match and get specific recommendations."
            action={{
              label: 'Get Started',
              onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* Related Tools */}
        <RelatedTools currentToolId="resume-job-matcher" />

        {/* FAQ */}
        <FAQ
          items={[
            {
              question: 'How is the match score calculated?',
              answer: 'We analyze keyword overlap (40%), job requirements coverage (35%), and qualitative factors like certifications and experience level (25%).'
            },
            {
              question: 'What if my match score is low?',
              answer: 'Check the "Missing Keywords" tab to see what the job requires. You can highlight similar experience or learn the required skills.'
            },
            {
              question: 'Should I customize my resume for each job?',
              answer: 'Yes! Tailoring your resume for each job using keywords from the job description significantly improves your chances.'
            },
            {
              question: 'Does this replace reading the job description?',
              answer: 'No. Use this tool as a starting point, but always read the full job description and application requirements carefully.'
            }
          ]}
        />
      </div>
    </div>
  );
}
