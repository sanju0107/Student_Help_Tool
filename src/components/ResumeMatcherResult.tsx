/**
 * Premium result display components for Resume vs Job Matcher
 * Provides beautiful, professional result visualization
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Zap,
  Award,
  Target,
  BookOpen
} from 'lucide-react';
import { MatchResult } from '../lib/resumeMatcher';

// Verdict badge showing match quality
export interface VerdictBadgeProps {
  verdict: 'Strong' | 'Moderate' | 'Weak';
  matchScore: number;
  confidence: number;
}

export function VerdictBadge({ verdict, matchScore, confidence }: VerdictBadgeProps) {
  const verdictConfig = {
    Strong: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-900', icon: '✓' },
    Moderate: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-900', icon: '→' },
    Weak: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-900', icon: '!' }
  };

  const config = verdictConfig[verdict];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`${config.bg} border ${config.border} rounded-lg p-6 mb-6`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`text-3xl font-bold ${config.text}`}>{verdict} Match</div>
        </div>
        <div className={`text-4xl font-bold ${config.text}`}>{matchScore}/100</div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${matchScore}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className={`h-2 rounded-full ${
            verdict === 'Strong' ? 'bg-green-500' : verdict === 'Moderate' ? 'bg-amber-500' : 'bg-red-500'
          }`}
        />
      </div>
      <p className={`text-sm ${config.text} font-medium`}>Confidence: {confidence}%</p>
    </motion.div>
  );
}

// Section breakdown with individual scores
export interface SectionBreakdownProps {
  sectionAnalysis: {
    skills: number;
    experience: number;
    keywords: number;
    roleAlignment: number;
  };
}

export function SectionBreakdown({ sectionAnalysis }: SectionBreakdownProps) {
  const sections = [
    { label: 'Skills Match', score: sectionAnalysis.skills, icon: Award, color: 'bg-blue-500' },
    { label: 'Experience', score: sectionAnalysis.experience, icon: TrendingUp, color: 'bg-purple-500' },
    { label: 'Keywords', score: sectionAnalysis.keywords, icon: Zap, color: 'bg-orange-500' },
    { label: 'Role Alignment', score: sectionAnalysis.roleAlignment, icon: Target, color: 'bg-green-500' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
    >
      {sections.map(({ label, score, icon: Icon, color }, idx) => (
        <div key={label} className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Icon className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">{label}</span>
          </div>
          <div className="mb-2">
            <div className="text-2xl font-bold text-gray-900">{score}%</div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 1, delay: idx * 0.1, ease: 'easeOut' }}
              className={`h-2 rounded-full ${color}`}
            />
          </div>
        </div>
      ))}
    </motion.div>
  );
}

// Keyword badges for matched/missing
export interface KeywordBadgesProps {
  keywords: string[];
  type: 'matched' | 'missing';
  title: string;
  maxShow?: number;
}

export function KeywordBadges({ keywords, type, title, maxShow = 8 }: KeywordBadgesProps) {
  const bgColor = type === 'matched' ? 'bg-green-100' : 'bg-red-100';
  const textColor = type === 'matched' ? 'text-green-800' : 'text-red-800';
  const remaining = keywords.length - maxShow;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="mb-6"
    >
      <h3 className="font-semibold text-gray-900 mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {keywords.slice(0, maxShow).map((keyword, idx) => (
          <motion.span
            key={keyword}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}
          >
            {keyword}
          </motion.span>
        ))}
        {remaining > 0 && (
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${bgColor} ${textColor}`}>
            +{remaining} more
          </span>
        )}
      </div>
    </motion.div>
  );
}

// Insights card (strengths, gaps, improvements)
export interface InsightListProps {
  items: string[];
  type: 'strengths' | 'gaps' | 'improvements';
  title: string;
}

export function InsightList({ items, type, title }: InsightListProps) {
  if (!items || items.length === 0) return null;

  const typeConfig = {
    strengths: {
      icon: CheckCircle2,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    gaps: {
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    },
    improvements: {
      icon: Lightbulb,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    }
  };

  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`${config.bgColor} rounded-lg p-6 mb-6`}
    >
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="text-sm text-gray-700 flex items-start gap-3"
          >
            <span className={`font-bold ${config.color} flex-shrink-0`}>
              {type === 'strengths' ? '✓' : type === 'gaps' ? '→' : '•'}
            </span>
            <span>{item}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// Top 5 changes section
export interface Top5ChangesProps {
  improvements: string[];
}

export function Top5Changes({ improvements }: Top5ChangesProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg p-6 mb-6 border border-purple-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Top Recommendations</h3>
      </div>
      <ol className="space-y-3">
        {improvements.map((improvement, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="flex gap-3 text-sm text-gray-700"
          >
            <span className="font-bold text-purple-600 flex-shrink-0 w-6">{idx + 1}.</span>
            <span>{improvement}</span>
          </motion.li>
        ))}
      </ol>
    </motion.div>
  );
}

// ATS Tips section
export interface ATSTipsProps {
  tips: string[];
}

export function ATSTips({ tips }: ATSTipsProps) {
  if (!tips || tips.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 rounded-lg p-6 mb-6 border border-blue-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-gray-900">ATS Optimization Tips</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="text-sm text-blue-900 flex items-start gap-3"
          >
            <span className="font-bold text-blue-600 flex-shrink-0">→</span>
            <span>{tip}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

// Missing keywords by priority
export interface MissingKeywordsPriorityProps {
  missingByPriority: any[];
}

export function MissingKeywordsByPriority({ missingByPriority }: MissingKeywordsPriorityProps) {
  if (!missingByPriority || missingByPriority.length === 0) return null;

  const topMissing = missingByPriority.slice(0, 5);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 rounded-lg p-6 mb-6 border border-orange-200"
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-orange-600" />
        <h3 className="font-semibold text-gray-900">Priority Missing Skills</h3>
      </div>
      <div className="space-y-3">
        {topMissing.map((keyword, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            className="flex items-center justify-between"
          >
            <div>
              <div className="font-medium text-gray-900">{keyword.keyword}</div>
              <div className="text-xs text-gray-600">{keyword.category}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-orange-600">{keyword.count} mention(s)</div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// Complete result card wrapper
export interface CompleteResultProps {
  result: MatchResult;
  onReset?: () => void;
  onCopy?: () => void;
}

export function CompleteResultCard({ result, onReset, onCopy }: CompleteResultProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Verdict */}
      <VerdictBadge
        verdict={result.verdict}
        matchScore={result.matchScore}
        confidence={result.confidence}
      />

      {/* Section Breakdown */}
      <SectionBreakdown sectionAnalysis={result.sectionAnalysis} />

      {/* Top Recommendations */}
      <Top5Changes improvements={result.improvements} />

      {/* Priority Missing Skills */}
      <MissingKeywordsByPriority missingByPriority={result.missingByPriority} />

      {/* Strengths */}
      <InsightList
        items={result.strengths}
        type="strengths"
        title={`Your Strengths (${result.strengths.length})`}
      />

      {/* Gaps */}
      <InsightList
        items={result.gaps}
        type="gaps"
        title={`Areas for Improvement (${result.gaps.length})`}
      />

      {/* ATS Tips */}
      <ATSTips tips={result.atsTips} />

      {/* Matched Keywords */}
      {(result.matchedKeywords.technical.length > 0 || result.matchedKeywords.soft.length > 0) && (
        <>
          {result.matchedKeywords.technical.length > 0 && (
            <KeywordBadges
              keywords={result.matchedKeywords.technical}
              type="matched"
              title={`Matched Technical Skills (${result.matchedKeywords.technical.length})`}
            />
          )}
          {result.matchedKeywords.soft.length > 0 && (
            <KeywordBadges
              keywords={result.matchedKeywords.soft}
              type="matched"
              title={`Matched Soft Skills (${result.matchedKeywords.soft.length})`}
            />
          )}
        </>
      )}

      {/* Missing Keywords */}
      {(result.missingKeywords.technical.length > 0 || result.missingKeywords.soft.length > 0) && (
        <>
          {result.missingKeywords.technical.length > 0 && (
            <KeywordBadges
              keywords={result.missingKeywords.technical}
              type="missing"
              title={`Missing Technical Skills (${result.missingKeywords.technical.length})`}
            />
          )}
          {result.missingKeywords.soft.length > 0 && (
            <KeywordBadges
              keywords={result.missingKeywords.soft}
              type="missing"
              title={`Missing Soft Skills (${result.missingKeywords.soft.length})`}
            />
          )}
        </>
      )}

      {/* Action Buttons */}
      {(onCopy || onReset) && (
        <div className="flex gap-3 pt-4">
          {onCopy && (
            <button
              onClick={onCopy}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Copy Results
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-300 transition"
            >
              Start Over
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
