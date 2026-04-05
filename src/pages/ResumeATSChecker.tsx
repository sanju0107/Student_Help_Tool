/**
 * Resume ATS Checker - Advanced ATS Analysis with Professional Dashboard
 * Analyzes resume for ATS-friendliness with deep insights and actionable fixes
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  FileText,
  Upload,
  Zap,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Loader2,
  BarChart3,
  Share2,
  TrendingUp,
  Target,
  Lightbulb,
  Award,
  Percent,
  Zap as Lightning,
  Layout
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
import { performATSAnalysis, type ATSScore, extractTextFromFile, validateResumeLength, validateResumeFileUpload, getFirstError } from '@/src/lib';
import { useSEO } from '@/src/lib/useSEO';
import { TOOLS } from '../constants';


export default function ResumeATSChecker() {
  const toolData = TOOLS.find(t => t.id === 'resume-ats-checker')!;

  useSEO({
    title: 'Resume ATS Checker | Free Online Tool',
    description: 'Advanced ATS analysis for your resume. Get a detailed ATS score, section breakdown, keyword analysis, and prioritized fixes to improve compatibility with applicant tracking systems.',
    keywords: ['resume ats checker', 'ats score', 'resume optimization', 'applicant tracking system', 'ats analysis'],
    pageUrl: 'https://careersuite.io/career/resume-ats-checker'
  });

  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState<ATSScore | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (file: File) => {
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
        if (errorMsg.includes('worker') || errorMsg.includes('fetch') || errorMsg.includes('import')) {
          userMessage = 'Temporary issue loading PDF processor. Please try again or paste text directly.';
        } else if (errorMsg.includes('scanned') || errorMsg.includes('image')) {
          userMessage = 'This PDF appears to be scanned. Please paste the text or upload a text-based PDF.';
        } else if (errorMsg.includes('unsupported')) {
          userMessage = 'Unsupported format. Please upload PDF, DOCX, or TXT files.';
        } else if (errorMsg.includes('empty')) {
          userMessage = 'File appears empty. Please check and try again.';
        } else {
          userMessage = err.message;
        }
      }
      setError(userMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    setError('');

    const validation = validateResumeLength(resumeText);
    if (!validation.valid) {
      setError(validation.message);
      return;
    }

    try {
      const atsResult = performATSAnalysis(
        resumeText,
        jobDescription || undefined
      );
      setResult(atsResult);
    } catch (err) {
      setError('Error analyzing resume. Please try again.');
      console.error(err);
    }
  };

  const handleCopy = () => {
    if (!result) return;

    const text = `
ATS ANALYSIS REPORT
Score: ${result.totalScore}/100 (${result.scoreCategory})

SCORE BREAKDOWN:
Keyword Match: ${result.breakdown.keywordScore}/30
Skills Match: ${result.breakdown.skillsScore}/20
Experience Quality: ${result.breakdown.experienceScore}/15
Action Verbs: ${result.breakdown.actionScore}/10
Section Completeness: ${result.breakdown.sectionScore}/10
Formatting: ${result.breakdown.formattingScore}/10
Readability: ${result.breakdown.readabilityScore}/5

KEYWORD ANALYSIS:
Matched (${result.matchedKeywords.length}): ${result.matchedKeywords.slice(0, 10).join(', ')}
Missing (${result.missingKeywords.length}): ${result.missingKeywords.slice(0, 10).join(', ')}

STRENGTHS:
${result.strengths.map(s => `• ${s}`).join('\n')}

TOP FIXES:
${result.topFixes.map((f, i) => `${i + 1}. [${f.priority.toUpperCase()}] ${f.title}\n   ${f.description}\n   Impact: ${f.impact}`).join('\n\n')}
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

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-emerald-500';
    if (score >= 70) return 'from-blue-500 to-cyan-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  const getScoreBg = (score: number) => {
    if (score >= 85) return 'bg-green-50';
    if (score >= 70) return 'bg-blue-50';
    if (score >= 50) return 'bg-yellow-50';
    return 'bg-red-50';
  };

  return (
    <div className={`min-h-screen py-8 sm:py-16 ${!result ? 'bg-gradient-to-br from-blue-50 via-white to-indigo-50' : 'bg-white'}`}>
      <Helmet>
        <title>Resume ATS Checker - Advanced ATS Analysis</title>
        <meta name="description" content={toolData.seoDescription} />
        <meta name="keywords" content={toolData.seoKeywords.join(', ')} />
      </Helmet>

      <div className="container mx-auto max-w-6xl px-4">
        {/* Header */}
        <ToolHeader
          title="Resume ATS Checker"
          description="Advanced ATS analysis with detailed scoring, keyword matching, and prioritized fixes to optimize your resume for applicant tracking systems."
          icon={BarChart3}
          iconColor="text-blue-600"
          iconBg="bg-blue-100"
          badge="Advanced Analysis"
        />

        {!result ? (
          <>
            {/* Main Input Section */}
            <div className="grid gap-8 lg:grid-cols-3 mb-16">
              {/* Input */}
              <div className="lg:col-span-2">
                <ToolCard>
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-4">
                        Your Resume
                      </h2>
                      <UploadPasteArea
                        value={resumeText}
                        onTextChange={setResumeText}
                        onFileSelect={handleFileUpload}
                        placeholder="Paste your resume or upload a file..."
                        acceptTypes=".pdf,.docx,.txt"
                      />
                      {loading && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 flex items-center gap-2 text-blue-600 font-semibold"
                        >
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Processing...
                        </motion.div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-2">
                        Job Description (Optional)
                      </label>
                      <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the job description to get keyword matching analysis..."
                        className="w-full h-24 rounded-lg border-2 border-slate-200 focus:border-blue-600 focus:outline-none px-4 py-2 text-sm transition-colors"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Helps identify missing keywords specific to the role
                      </p>
                    </div>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg border-l-4 border-red-400 bg-red-50 p-4"
                      >
                        <p className="text-sm font-semibold text-red-900">{error}</p>
                      </motion.div>
                    )}

                    <button
                      onClick={handleAnalyze}
                      disabled={!resumeText.trim() || loading}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-3 font-bold text-white hover:shadow-lg hover:shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Zap className="h-5 w-5" />
                      Analyze Resume
                    </button>
                  </div>
                </ToolCard>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 rounded-lg bg-blue-50 border border-blue-200 p-4"
                >
                  <p className="text-xs sm:text-sm text-blue-900">
                    <strong>Advanced Analysis:</strong> This tool simulates professional ATS systems to provide realistic feedback on your resume's compatibility and offers specific, actionable improvements.
                  </p>
                </motion.div>
              </div>

              {/* Tips */}
              <div className="space-y-4">
                <SectionContainer
                  title="What We Analyze"
                  icon={Target}
                  subtitle="7 Major Dimensions"
                >
                  <FeatureList
                    items={[
                      { label: 'Sections', description: 'Contact, summary, skills, experience, education, projects' },
                      { label: 'Formatting', description: 'ATS parsing compatibility' },
                      { label: 'Keywords', description: 'Relevance and density' },
                      { label: 'Action Verbs', description: 'Strength and diversity' },
                      { label: 'Metrics', description: 'Quantified achievements' },
                      { label: 'Readability', description: 'Structure and clarity' },
                      { label: 'Job Match', description: 'Keyword alignment with JD' }
                    ]}
                  />
                </SectionContainer>
              </div>
            </div>

            {/* Related Tools & FAQ */}
            <RelatedTools currentToolId="resume-ats-checker" />
            <FAQ
              items={[
                {
                  question: 'What makes a resume ATS-friendly?',
                  answer: 'Simple formatting, clear sections, relevant keywords, strong action verbs, quantified achievements, and standard file types. Avoid tables, graphics, and complex layouts.'
                },
                {
                  question: 'How accurate is this analysis?',
                  answer: 'This tool simulates industry-standard ATS practices. Real ATS systems are proprietary, but this analysis is based on verified best practices used by most modern systems.'
                },
                {
                  question: 'Should I add the job description?',
                  answer: 'Yes! Adding the job description enables keyword matching analysis, showing how well your resume aligns with the specific role requirements.'
                }
              ]}
            />
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
          >
            {/* Main Score Card */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`rounded-2xl ${getScoreBg(result.totalScore)} border-2 border-slate-200 p-8 shadow-lg`}
            >
              <div className="grid gap-8 lg:grid-cols-2 items-center">
                {/* Score Display */}
                <motion.div
                  className="text-center lg:text-left"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <p className="text-sm font-semibold text-slate-600 mb-2">Overall ATS Score</p>
                  <div className="flex items-baseline gap-4 justify-center lg:justify-start mb-6">
                    <div className={`text-7xl font-black bg-gradient-to-r ${getScoreColor(result.totalScore)} bg-clip-text text-transparent`}>
                      {result.totalScore}
                    </div>
                    <div>
                      <p className="text-3xl font-bold text-slate-900">/100</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className={`text-lg font-bold ${result.totalScore >= 85 ? 'text-green-700' : result.totalScore >= 70 ? 'text-blue-700' : result.totalScore >= 50 ? 'text-yellow-700' : 'text-red-700'}`}>
                      {result.scoreCategory}
                    </p>
                    <p className="text-sm text-slate-600">
                      {result.totalScore >= 85 && '✨ Excellent ATS compatibility. Your resume is well-optimized!'}
                      {result.totalScore >= 70 && result.totalScore < 85 && '👍 Strong ATS compatibility. Consider minor improvements.'}
                      {result.totalScore >= 50 && result.totalScore < 70 && '⚠️ Moderate compatibility. Several improvements needed.'}
                      {result.totalScore < 50 && '❌ Needs significant improvements for ATS compatibility.'}
                    </p>
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div
                  className="grid grid-cols-2 gap-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="rounded-lg bg-white p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Keywords</p>
                    <p className="text-3xl font-bold text-slate-900">{result.breakdown.keywordScore}</p>
                    <p className="text-xs text-slate-500">/ 30</p>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                        style={{ width: `${(result.breakdown.keywordScore / 30) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Skills</p>
                    <p className="text-3xl font-bold text-slate-900">{result.breakdown.skillsScore}</p>
                    <p className="text-xs text-slate-500">/ 20</p>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all"
                        style={{ width: `${(result.breakdown.skillsScore / 20) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Experience</p>
                    <p className="text-3xl font-bold text-slate-900">{result.breakdown.experienceScore}</p>
                    <p className="text-xs text-slate-500">/ 15</p>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-orange-600 transition-all"
                        style={{ width: `${(result.breakdown.experienceScore / 15) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="rounded-lg bg-white p-4 border border-slate-200 hover:shadow-md transition-shadow">
                    <p className="text-xs font-semibold text-slate-600 mb-2">Action Verbs</p>
                    <p className="text-3xl font-bold text-slate-900">{result.breakdown.actionScore}</p>
                    <p className="text-xs text-slate-500">/ 10</p>
                    <div className="mt-2 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all"
                        style={{ width: `${(result.breakdown.actionScore / 10) * 100}%` }}
                      />
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>

            {/* Complete Score Breakdown */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <SectionContainer title="Complete Score Breakdown" icon={BarChart3}>
                <div className="space-y-4">
                  {[
                    { label: 'Keyword Match', score: result.breakdown.keywordScore, max: 30, color: 'from-blue-500 to-blue-600' },
                    { label: 'Skills Match', score: result.breakdown.skillsScore, max: 20, color: 'from-purple-500 to-purple-600' },
                    { label: 'Experience Quality', score: result.breakdown.experienceScore, max: 15, color: 'from-orange-500 to-orange-600' },
                    { label: 'Action Verbs', score: result.breakdown.actionScore, max: 10, color: 'from-red-500 to-red-600' },
                    { label: 'Section Completeness', score: result.breakdown.sectionScore, max: 10, color: 'from-green-500 to-green-600' },
                    { label: 'Formatting', score: result.breakdown.formattingScore, max: 10, color: 'from-cyan-500 to-cyan-600' },
                    { label: 'Readability', score: result.breakdown.readabilityScore, max: 5, color: 'from-indigo-500 to-indigo-600' }
                  ].map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + idx * 0.05 }}
                      className="rounded-lg border border-slate-200 p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3 flex-1">
                          <p className="font-semibold text-slate-900">{item.label}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-slate-900">{item.score}/{item.max}</p>
                          <p className="text-xs text-slate-500">{Math.round((item.score / item.max) * 100)}%</p>
                        </div>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full bg-gradient-to-r ${item.color}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${(item.score / item.max) * 100}%` }}
                          transition={{ delay: 0.6 + idx * 0.05, duration: 0.8 }}
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </SectionContainer>
            </motion.div>

            {/* Strengths */}
            {result.strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <SectionContainer title="Strengths" icon={Award}>
                  <div className="space-y-3">
                    {result.strengths.map((strength, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 + idx * 0.05 }}
                        className="flex gap-3 p-3 rounded-lg bg-green-50 border border-green-200"
                      >
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-green-900">{strength}</p>
                      </motion.div>
                    ))}
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Top Fixes */}
            {result.topFixes.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <SectionContainer title="Top Fixes (Prioritized)" icon={Lightbulb} subtitle="Make these changes first for maximum impact">
                  <div className="space-y-3">
                    {result.topFixes.map((fix, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.6 + idx * 0.08 }}
                        className={`rounded-lg border-2 p-4 hover:shadow-md transition-shadow ${
                          fix.priority === 'critical' ? 'border-red-300 bg-red-50' :
                          fix.priority === 'high' ? 'border-yellow-300 bg-yellow-50' :
                          fix.priority === 'medium' ? 'border-blue-300 bg-blue-50' :
                          'border-slate-300 bg-slate-50'
                        }`}
                      >
                        <div className="flex gap-4">
                          <div className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                            fix.priority === 'critical' ? 'bg-red-600' :
                            fix.priority === 'high' ? 'bg-yellow-600' :
                            fix.priority === 'medium' ? 'bg-blue-600' :
                            'bg-slate-600'
                          }`}>
                            {idx + 1}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <h4 className="font-bold text-slate-900 text-base">{fix.title}</h4>
                              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full whitespace-nowrap ${
                                fix.priority === 'critical' ? 'bg-red-200 text-red-800' :
                                fix.priority === 'high' ? 'bg-yellow-200 text-yellow-800' :
                                fix.priority === 'medium' ? 'bg-blue-200 text-blue-800' :
                                'bg-slate-200 text-slate-800'
                              }`}>
                                {fix.priority} Priority
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 mb-3">{fix.description}</p>
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 bg-white bg-opacity-60 rounded px-3 py-2 inline-block">
                              <Lightning className="h-4 w-4" />
                              Impact: {fix.impact}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Keyword Analysis */}
            {result.matchedKeywords.length > 0 || result.missingKeywords.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
              >
                <SectionContainer title="Keyword Analysis" icon={Target} subtitle={`${result.matchedKeywords.length} matched from ${result.matchedKeywords.length + result.missingKeywords.length} total`}>
                  <div className="grid gap-6 lg:grid-cols-2">
                    {result.matchedKeywords.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          <h3 className="font-bold text-slate-900">Matched Keywords</h3>
                          <span className="ml-auto badge bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold">{result.matchedKeywords.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.matchedKeywords.slice(0, 20).map((kw, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.7 + idx * 0.02 }}
                              className="rounded-full bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 text-sm font-semibold text-green-700 border border-green-300 hover:shadow-md transition-shadow"
                            >
                              ✓ {kw}
                            </motion.span>
                          ))}
                        </div>
                        {result.matchedKeywords.length > 20 && (
                          <p className="text-xs text-slate-500 mt-3">+{result.matchedKeywords.length - 20} more matches</p>
                        )}
                      </motion.div>
                    )}
                    {result.missingKeywords.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 }}
                      >
                        <div className="flex items-center gap-2 mb-4">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <h3 className="font-bold text-slate-900">Missing Keywords</h3>
                          <span className="ml-auto badge bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-bold">{result.missingKeywords.length}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {result.missingKeywords.slice(0, 20).map((kw, idx) => (
                            <motion.span
                              key={idx}
                              initial={{ scale: 0.8, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ delay: 0.7 + idx * 0.02 }}
                              className="rounded-full bg-gradient-to-r from-red-100 to-rose-100 px-4 py-2 text-sm font-semibold text-red-700 border border-red-300 hover:shadow-md transition-shadow"
                            >
                              ✕ {kw}
                            </motion.span>
                          ))}
                        </div>
                        {result.missingKeywords.length > 20 && (
                          <p className="text-xs text-slate-500 mt-3">+{result.missingKeywords.length - 20} more keywords to add</p>
                        )}
                      </motion.div>
                    )}
                  </div>
                </SectionContainer>
              </motion.div>
            ) : null}

            {/* Suggestions */}
            {result.suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <SectionContainer title="Recommendations" icon={Lightbulb}>
                  <div className="space-y-3">
                    {result.suggestions.map((suggestion, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.7 + idx * 0.05 }}
                        className="flex gap-3 p-4 rounded-lg bg-indigo-50 border border-indigo-200 hover:shadow-md transition-shadow"
                      >
                        <Lightbulb className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-indigo-900">{suggestion}</p>
                      </motion.div>
                    ))}
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Weaknesses */}
            {result.weaknesses.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.75 }}
              >
                <SectionContainer title="Areas for Improvement" icon={AlertTriangle}>
                  <div className="space-y-2">
                    {result.weaknesses.map((weak, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.75 + idx * 0.05 }}
                        className="flex gap-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200"
                      >
                        <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-yellow-900">{weak}</p>
                      </motion.div>
                    ))}
                  </div>
                </SectionContainer>
              </motion.div>
            )}

            {/* Score Interpretation Guide */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <ToolCard>
                <div className="space-y-4">
                  <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                    <Percent className="h-5 w-5 text-blue-600" />
                    Score Interpretation Guide
                  </h3>
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div className="rounded-lg bg-green-50 border-l-4 border-green-600 p-4">
                      <p className="font-bold text-green-900 mb-1">90-100: Excellent</p>
                      <p className="text-sm text-green-800">Your resume is highly optimized for ATS systems. Strong keyword match, well-structured, and professionally formatted.</p>
                    </div>
                    <div className="rounded-lg bg-blue-50 border-l-4 border-blue-600 p-4">
                      <p className="font-bold text-blue-900 mb-1">75-89: Strong</p>
                      <p className="text-sm text-blue-800">Good ATS compatibility. Consider the suggested improvements to increase your ATS score further.</p>
                    </div>
                    <div className="rounded-lg bg-yellow-50 border-l-4 border-yellow-600 p-4">
                      <p className="font-bold text-yellow-900 mb-1">60-74: Moderate</p>
                      <p className="text-sm text-yellow-800">Several improvements needed. Focus on keywords, formatting, and section completeness.</p>
                    </div>
                    <div className="rounded-lg bg-red-50 border-l-4 border-red-600 p-4">
                      <p className="font-bold text-red-900 mb-1">Below 60: Needs Improvement</p>
                      <p className="text-sm text-red-800">Significant optimization required. Follow the top fixes and add missing sections.</p>
                    </div>
                  </div>
                </div>
              </ToolCard>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.85 }}
              className="flex flex-wrap gap-3 justify-center pt-4 border-t border-slate-200"
            >
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-blue-600 text-white px-8 py-3 font-semibold hover:bg-blue-700 transition-colors hover:shadow-lg"
              >
                <Copy className="h-5 w-5" />
                Copy Results
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg border-2 border-slate-300 bg-white text-slate-900 px-8 py-3 font-semibold hover:bg-slate-50 transition-colors"
              >
                <TrendingUp className="h-5 w-5" />
                Analyze Another Resume
              </button>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
