/**
 * Reusable UI components for career tools
 */

import React from 'react';
import { motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Copy,
  Download,
  Zap,
  Trophy,
  Target,
  Lightbulb
} from 'lucide-react';

/**
 * Score Display Card
 */
interface ScoreCardProps {
  score: number;
  maxScore?: number;
  label: string;
  sublabel?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
}

export const ScoreCard: React.FC<ScoreCardProps> = ({
  score,
  maxScore = 100,
  label,
  sublabel,
  showPercentage = true,
  size = 'md',
  color = 'blue'
}) => {
  const percentage = (score / maxScore) * 100;
  const isGood = percentage >= 75;
  const isOkay = percentage >= 50;

  const sizeClasses = {
    sm: 'h-24 w-24',
    md: 'h-32 w-32',
    lg: 'h-40 w-40'
  };

  const textSizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-5xl'
  };

  const colorClasses = {
    blue: 'from-blue-600 to-blue-500',
    green: 'from-green-600 to-green-500',
    yellow: 'from-yellow-600 to-yellow-500',
    red: 'from-red-600 to-red-500',
    purple: 'from-purple-600 to-purple-500'
  };

  const bgColorClasses = {
    blue: 'bg-blue-50',
    green: 'bg-green-50',
    yellow: 'bg-yellow-50',
    red: 'bg-red-50',
    purple: 'bg-purple-50'
  };

  const getColor = () => {
    if (isGood) return 'green';
    if (isOkay) return 'yellow';
    return 'red';
  };

  const finalColor = getColor();

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="text-center"
    >
      <div className={`${bgColorClasses[finalColor]} mx-auto mb-4 flex ${sizeClasses[size]} items-center justify-center rounded-3xl shadow-lg`}>
        <div className="relative w-full h-full flex items-center justify-center">
          {/* SVG Circle Background */}
          <svg
            className="absolute inset-0 -rotate-90"
            width="100%"
            height="100%"
            viewBox="0 0 120 120"
          >
            {/* Background circle */}
            <circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-slate-200"
            />

            {/* Progress circle */}
            <motion.circle
              cx="60"
              cy="60"
              r="55"
              fill="none"
              strokeWidth="8"
              className={`text-${finalColor === 'green' ? 'green-600' : finalColor === 'yellow' ? 'yellow-600' : 'red-600'}`}
              strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 55} ${2 * Math.PI * 55}`}
              strokeLinecap="round"
              initial={{ strokeDasharray: `0 ${2 * Math.PI * 55}` }}
              animate={{ strokeDasharray: `${(percentage / 100) * 2 * Math.PI * 55} ${2 * Math.PI * 55}` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </svg>

          {/* Score Text */}
          <div className="relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className={`font-black ${textSizeClasses[size]} bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-blue-600`}
            >
              {Math.round(score)}
            </motion.div>
            {showPercentage && (
              <div className="text-xs font-bold text-slate-600">
                {Math.round(percentage)}%
              </div>
            )}
          </div>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900">{label}</h3>
      {sublabel && <p className="text-sm text-slate-500">{sublabel}</p>}
    </motion.div>
  );
};

/**
 * Insight Card - for showing single insight/recommendation
 */
interface InsightCardProps {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  description: string;
  type?: 'positive' | 'warning' | 'critical' | 'info' | 'tip';
  action?: { label: string; onClick: () => void };
}

export const InsightCard: React.FC<InsightCardProps> = ({
  icon: Icon,
  title,
  description,
  type = 'info',
  action
}) => {
  const typeClasses = {
    positive: 'bg-green-50 border-green-200 text-green-900',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    critical: 'bg-red-50 border-red-200 text-red-900',
    info: 'bg-blue-50 border-blue-200 text-blue-900',
    tip: 'bg-purple-50 border-purple-200 text-purple-900'
  };

  const iconBgClasses = {
    positive: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    critical: 'bg-red-100 text-red-600',
    info: 'bg-blue-100 text-blue-600',
    tip: 'bg-purple-100 text-purple-600'
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border-2 p-4 ${typeClasses[type]}`}
    >
      <div className="flex gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${iconBgClasses[type]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold">{title}</h3>
          <p className="mt-1 text-sm opacity-90">{description}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="mt-3 text-xs font-bold underline hover:opacity-75 transition-opacity"
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Keyword List Component
 */
interface KeywordListProps {
  keywords: string[];
  type?: 'default' | 'matched' | 'missing';
  maxShow?: number;
  onCopy?: () => void;
}

export const KeywordList: React.FC<KeywordListProps> = ({
  keywords,
  type = 'default',
  maxShow = 20,
  onCopy
}) => {
  if (keywords.length === 0) {
    return (
      <p className="text-sm text-slate-500">No keywords found.</p>
    );
  }

  const typeClasses = {
    default: 'bg-blue-50 text-blue-700 border-blue-200',
    matched: 'bg-green-50 text-green-700 border-green-200',
    missing: 'bg-yellow-50 text-yellow-700 border-yellow-200'
  };

  const displayed = keywords.slice(0, maxShow);
  const hasMore = keywords.length > maxShow;

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {displayed.map((keyword, idx) => (
          <motion.span
            key={idx}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.02 }}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${typeClasses[type]}`}
          >
            {keyword}
          </motion.span>
        ))}
      </div>
      {hasMore && (
        <p className="mt-2 text-xs text-slate-500">
          +{keywords.length - maxShow} more
        </p>
      )}
      {onCopy && keywords.length > 0 && (
        <button
          onClick={onCopy}
          className="mt-3 flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700"
        >
          <Copy className="h-3 w-3" />
          Copy Keywords
        </button>
      )}
    </div>
  );
};

/**
 * Section Container
 */
interface SectionContainerProps {
  title: string;
  icon?: React.ComponentType<{ className: string }>;
  children: React.ReactNode;
  subtitle?: string;
}

export const SectionContainer: React.FC<SectionContainerProps> = ({
  title,
  icon: Icon,
  children,
  subtitle
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
    >
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          {Icon && <Icon className="h-6 w-6 text-blue-600" />}
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
        </div>
        {subtitle && <p className="text-sm text-slate-600">{subtitle}</p>}
      </div>
      {children}
    </motion.div>
  );
};

/**
 * Upload/Paste Area
 */
interface UploadPasteAreaProps {
  onTextChange: (text: string) => void;
  onFileSelect?: (file: File) => void;
  placeholder?: string;
  acceptTypes?: string;
  value?: string;
}

export const UploadPasteArea: React.FC<UploadPasteAreaProps> = ({
  onTextChange,
  onFileSelect,
  placeholder = 'Paste your text here or upload a file...',
  acceptTypes = '.pdf,.docx,.txt',
  value = ''
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  return (
    <div className="space-y-3">
      {/* Textarea */}
      <textarea
        value={value}
        onChange={(e) => onTextChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-48 rounded-2xl border-2 border-slate-200 focus:border-blue-600 focus:outline-none p-4 font-mono text-sm resize-none transition-colors"
      />

      {/* Upload Area */}
      {onFileSelect && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-300 hover:border-blue-400 bg-slate-50 hover:bg-blue-50 p-6 transition-colors text-center"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={acceptTypes}
            onChange={handleFileChange}
            className="hidden"
          />
          <p className="text-sm font-semibold text-slate-600">
            Or <span className="text-blue-600 hover:underline">click to upload</span> ({acceptTypes})
          </p>
          <p className="text-xs text-slate-500 mt-1">Max file size: 10MB</p>
        </div>
      )}
    </div>
  );
};

/**
 * Empty State
 */
interface EmptyStateProps {
  icon: React.ComponentType<{ className: string }>;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50/50 p-12 text-center"
    >
      <Icon className="mx-auto h-12 w-12 text-slate-400 mb-4" />
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
        >
          <Zap className="h-4 w-4" />
          {action.label}
        </button>
      )}
    </motion.div>
  );
};

/**
 * Feature Highlight List
 */
interface FeatureListProps {
  items: {
    label: string;
    description: string;
  }[];
  showCheckmarks?: boolean;
}

export const FeatureList: React.FC<FeatureListProps> = ({
  items,
  showCheckmarks = true
}) => {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex gap-3"
        >
          {showCheckmarks && (
            <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 mt-0.5" />
          )}
          <div>
            <p className="font-semibold text-slate-900">{item.label}</p>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Action Button Group
 */
interface ActionButtonGroupProps {
  onCopy?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onReset?: () => void;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  onCopy,
  onDownload,
  onShare,
  onReset
}) => {
  return (
    <div className="flex flex-wrap gap-3">
      {onCopy && (
        <button
          onClick={onCopy}
          className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-100 transition-colors"
        >
          <Copy className="h-4 w-4" />
          Copy Results
        </button>
      )}

      {onDownload && (
        <button
          onClick={onDownload}
          className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-bold text-green-600 hover:bg-green-100 transition-colors"
        >
          <Download className="h-4 w-4" />
          Download
        </button>
      )}

      {onShare && (
        <button
          onClick={onShare}
          className="flex items-center gap-2 rounded-lg bg-purple-50 px-4 py-2 text-sm font-bold text-purple-600 hover:bg-purple-100 transition-colors"
        >
          <Zap className="h-4 w-4" />
          Share
        </button>
      )}

      {onReset && (
        <button
          onClick={onReset}
          className="flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <AlertCircle className="h-4 w-4" />
          Reset
        </button>
      )}
    </div>
  );
};
