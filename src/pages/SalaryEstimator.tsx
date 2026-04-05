/**
 * Salary Estimator - Estimate salary based on role, experience, and location
 */

import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  DollarSign,
  TrendingUp,
  Copy,
  Share2,
  Lightbulb,
  Info,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import { ToolHeader, ToolCard } from '../components/ToolUI';
import {
  ScoreCard,
  InsightCard,
  SectionContainer,
  EmptyState,
  FeatureList
} from '../components/CareerToolsUI';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { estimateSalary, generateSalarySuggestions, SalaryEstimate } from '../lib/salaryEstimation';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function SalaryEstimator() {
  const toolData = TOOLS.find(t => t.id === 'salary-estimator')!;

  useSEO({
    title: 'Salary Estimator | Free Career Salary Calculator',
    description: 'Estimate your salary based on job title, experience, location, industry, and company type. Get a realistic salary range for your role.',
    keywords: ['salary estimator', 'salary calculator', 'job salary', 'career salary', 'wage estimator'],
    pageUrl: 'https://careersuite.io/career/salary-estimator'
  });

  const [formData, setFormData] = useState({
    jobTitle: '',
    yearsOfExperience: 3,
    location: 'united states',
    industry: '',
    companyType: 'mid-size',
    employmentType: 'full-time',
    currency: 'USD'
  });

  const [result, setResult] = useState<SalaryEstimate | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' ? parseInt(value) : value
    }));
  };

  const handleEstimate = () => {
    if (!formData.jobTitle.trim()) {
      alert('Please enter a job title');
      return;
    }

    const estimate = estimateSalary(formData);
    setResult(estimate);

    const sugg = generateSalarySuggestions(formData.yearsOfExperience, []);
    setSuggestions(sugg);
  };

  const handleReset = () => {
    setFormData({
      jobTitle: '',
      yearsOfExperience: 3,
      location: 'united states',
      industry: '',
      companyType: 'mid-size',
      employmentType: 'full-time',
      currency: 'USD'
    });
    setResult(null);
    setSuggestions([]);
  };

  const handleCopy = () => {
    if (!result) return;

    const text = `
Salary Estimate for ${formData.jobTitle}

Range: $${result.low.toLocaleString()} - $${result.high.toLocaleString()}
Median: $${result.median.toLocaleString()}

Factors Affecting Salary:
${result.factors.map(f => `${f.name}: ${f.impact >= 0 ? '+' : ''}${f.impact}% (${f.reason})`).join('\n')}

${result.disclaimer}
    `.trim();

    navigator.clipboard.writeText(text);
    alert('Results copied to clipboard!');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-cyan-50 py-8 sm:py-16">
      <Helmet>
        <title>Salary Estimator - Calculate Your Salary Range</title>
        <meta name="description" content={toolData.seoDescription} />
        <meta name="keywords" content={toolData.seoKeywords.join(', ')} />
      </Helmet>

      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <ToolHeader
          title="Salary Estimator"
          description="Get an estimated salary range based on your job title, experience, location, and industry. Data-informed estimates to help with your career planning."
          icon={DollarSign}
          iconColor="text-green-600"
          iconBg="bg-green-100"
          badge="Beta"
        />

        <div className="grid gap-8 lg:grid-cols-3 mb-16">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <ToolCard>
              <div className="space-y-6">
                {/* Job Title */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleInputChange}
                    placeholder="e.g., Senior Software Engineer, Product Manager"
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-green-600 focus:outline-none px-4 py-2 text-sm transition-colors"
                  />
                  <p className="text-xs text-slate-500 mt-1">Try various titles to explore salary ranges</p>
                </div>

                {/* Years of Experience */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Years of Experience: <span className="text-green-600">{formData.yearsOfExperience}</span>
                  </label>
                  <input
                    type="range"
                    name="yearsOfExperience"
                    min="0"
                    max="50"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                  />
                  <div className="mt-2 flex justify-between text-xs text-slate-500">
                    <span>Entry Level</span>
                    <span>Mid Level</span>
                    <span>Senior</span>
                    <span>Executive</span>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-green-600 focus:outline-none px-4 py-2 text-sm transition-colors"
                  >
                    <optgroup label="United States">
                      <option value="san francisco">San Francisco, CA</option>
                      <option value="new york">New York, NY</option>
                      <option value="seattle">Seattle, WA</option>
                      <option value="boston">Boston, MA</option>
                      <option value="austin">Austin, TX</option>
                      <option value="los angeles">Los Angeles, CA</option>
                      <option value="chicago">Chicago, IL</option>
                      <option value="denver">Denver, CO</option>
                      <option value="united states">US Average</option>
                      <option value="remote">Remote (US)</option>
                    </optgroup>
                    <optgroup label="International">
                      <option value="london">London, UK</option>
                      <option value="canada">Canada</option>
                      <option value="india">India</option>
                      <option value="australia">Australia</option>
                      <option value="singapore">Singapore</option>
                      <option value="germany">Germany</option>
                    </optgroup>
                  </select>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {/* Industry */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Industry
                    </label>
                    <select
                      name="industry"
                      value={formData.industry}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-green-600 focus:outline-none px-4 py-2 text-sm transition-colors"
                    >
                      <option value="">Select industry...</option>
                      <option value="faang">FAANG (Big Tech)</option>
                      <option value="tech startup">Tech Startup</option>
                      <option value="fintech">FinTech</option>
                      <option value="finance">Finance</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="consulting">Consulting</option>
                      <option value="enterprise">Enterprise</option>
                      <option value="ecommerce">E-commerce</option>
                    </select>
                  </div>

                  {/* Company Type */}
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-2">
                      Company Type
                    </label>
                    <select
                      name="companyType"
                      value={formData.companyType}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border-2 border-slate-200 focus:border-green-600 focus:outline-none px-4 py-2 text-sm transition-colors"
                    >
                      <option value="startup">Startup</option>
                      <option value="scaleup">Scaleup</option>
                      <option value="mid-size">Mid-size</option>
                      <option value="enterprise">Enterprise</option>
                      <option value="large enterprise">Large Enterprise</option>
                    </select>
                  </div>
                </div>

                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-bold text-slate-900 mb-2">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border-2 border-slate-200 focus:border-green-600 focus:outline-none px-4 py-2 text-sm transition-colors"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="contract">Contract</option>
                    <option value="freelance">Freelance</option>
                    <option value="part-time">Part-time</option>
                  </select>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEstimate}
                    disabled={!formData.jobTitle.trim()}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-green-600 to-cyan-600 px-6 py-3 font-bold text-white hover:shadow-lg hover:shadow-green-600/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <TrendingUp className="h-5 w-5" />
                    Estimate Salary
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

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 rounded-lg bg-cyan-50 border border-cyan-200 p-4"
            >
              <p className="text-xs sm:text-sm text-cyan-900 flex gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> This is an indicative estimate based on public salary data.
                  Actual salaries vary widely based on individual circumstances, negotiations, and company policies.
                </span>
              </p>
            </motion.div>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-4">
            <SectionContainer
              title="Factors Affecting Salary"
              icon={Info}
              subtitle="What we consider"
            >
              <FeatureList
                showCheckmarks={false}
                items={[
                  {
                    label: 'Experience Level',
                    description: 'More experience typically increases salary'
                  },
                  {
                    label: 'Location',
                    description: 'Tech hubs pay 30-40% more than average'
                  },
                  {
                    label: 'Company Size',
                    description: 'Large companies often pay more'
                  },
                  {
                    label: 'Industry',
                    description: 'Finance & tech pay more than other sectors'
                  },
                  {
                    label: 'Employment Type',
                    description: 'Contract roles pay more per hour'
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
            {/* Main Salary Cards */}
            <div className="grid gap-6 sm:grid-cols-3">
              {/* Low */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-orange-50 to-red-50 p-8 shadow-lg text-center"
              >
                <p className="text-sm font-bold text-slate-600 mb-2">Low End</p>
                <p className="text-3xl font-black text-orange-600 mb-2">
                  {formatCurrency(result.low)}
                </p>
                <p className="text-xs text-slate-600">Entry-level experience</p>
              </motion.div>

              {/* Median */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-3xl border-2 border-green-600 bg-gradient-to-br from-green-50 to-cyan-50 p-8 shadow-xl text-center relative"
              >
                <div className="absolute top-3 right-3 bg-green-600 text-white px-3 py-1 rounded-full text-xs font-bold">
                  Typical
                </div>
                <p className="text-sm font-bold text-slate-600 mb-2">Median</p>
                <p className="text-4xl font-black text-green-600 mb-2">
                  {formatCurrency(result.median)}
                </p>
                <p className="text-xs text-slate-600">Mid-level experience</p>
              </motion.div>

              {/* High */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="rounded-3xl border border-slate-200 bg-gradient-to-br from-purple-50 to-blue-50 p-8 shadow-lg text-center"
              >
                <p className="text-sm font-bold text-slate-600 mb-2">High End</p>
                <p className="text-3xl font-black text-purple-600 mb-2">
                  {formatCurrency(result.high)}
                </p>
                <p className="text-xs text-slate-600">Senior-level experience</p>
              </motion.div>
            </div>

            {/* Salary Factors Breakdown */}
            <SectionContainer title="Factors Affecting Your Estimate">
              <div className="space-y-3">
                {result.factors.map((factor, idx) => {
                  const isPositive = factor.impact > 0;
                  const isNegative = factor.impact < 0;
                  const isNeutral = factor.impact === 0;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200"
                    >
                      <div className="flex-1">
                        <p className="font-bold text-slate-900">{factor.name}</p>
                        <p className="text-xs text-slate-600">{factor.reason}</p>
                      </div>
                      <div className={`text-right ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-slate-600'}`}>
                        <p className="font-black text-lg">
                          {isPositive ? '+' : ''}{factor.impact}%
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </SectionContainer>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <SectionContainer title="Ways to Increase Your Salary" icon={Lightbulb}>
                <div className="space-y-3">
                  {suggestions.slice(0, 5).map((sugg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex gap-3 p-3 rounded-lg bg-green-50"
                    >
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
                      <p className="text-sm text-slate-700">{sugg}</p>
                    </motion.div>
                  ))}
                </div>
              </SectionContainer>
            )}

            {/* Disclaimer Box */}
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-xs sm:text-sm text-amber-900">
                {result.disclaimer}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Copy className="h-4 w-4" />
                Copy Results
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <TrendingUp className="h-4 w-4" />
                Try Another Role
              </button>
            </div>
          </motion.div>
        )}

        {/* Empty State */}
        {!result && (
          <EmptyState
            icon={DollarSign}
            title="Estimate Your Salary"
            description="Enter your job title and experience level to get an estimated salary range based on industry and location data."
            action={{
              label: 'Get Started',
              onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        )}

        {/* Related Tools */}
        <RelatedTools currentToolId="salary-estimator" />

        {/* FAQ */}
        <FAQ
          items={[
            {
              question: 'How is the salary estimate calculated?',
              answer: 'We use base salaries for each role and apply multipliers for location, industry, company size, employment type, and experience level. All factors are transparent.'
            },
            {
              question: 'Why is this just an estimate?',
              answer: 'Real salaries vary greatly based on individual negotiations, company politics, equity packages, and benefits. This tool provides a data-informed starting point.'
            },
            {
              question: 'Should I use this for negotiation?',
              answer: 'Yes, research multiple tools and resources. Use this estimate as one data point among many (Glassdoor, Levels.fyi, PayScale, etc.).'
            },
            {
              question: 'Does this include bonuses and equity?',
              answer: 'This estimates base salary only. Many roles include bonuses (10-50%), stock options, or equity which can significantly increase total compensation.'
            },
            {
              question: 'Why do rates vary so much by location?',
              answer: 'Cost of living, local demand, and company headquarters location significantly impact salary offers. Silicon Valley pays 30-40% more than average.'
            }
          ]}
        />
      </div>
    </div>
  );
}
