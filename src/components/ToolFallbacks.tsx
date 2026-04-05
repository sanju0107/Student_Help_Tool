/**
 * Graceful UI Fallback Components
 * Provides fallback UI for various error and loading states
 */

import React from 'react';
import {
  AlertCircle,
  RefreshCw,
  Loader,
  CheckCircle2,
  FileX,
  ServerCrash,
  WifiOff,
  Lock,
  HelpCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Error display component with retry and help options
 */
export interface ErrorDisplayProps {
  error: string;
  category?: 'validation' | 'network' | 'security' | 'processing' | 'storage' | 'unknown';
  onRetry?: () => void;
  onHelp?: () => void;
  showRetry?: boolean;
  showHelp?: boolean;
  compact?: boolean;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  category = 'unknown',
  onRetry,
  onHelp,
  showRetry = true,
  showHelp = true,
  compact = false,
}) => {
  const getIcon = () => {
    switch (category) {
      case 'validation':
        return <FileX className="h-6 w-6 text-orange-600" />;
      case 'network':
        return <WifiOff className="h-6 w-6 text-blue-600" />;
      case 'security':
        return <Lock className="h-6 w-6 text-red-600" />;
      case 'processing':
        return <ServerCrash className="h-6 w-6 text-purple-600" />;
      case 'storage':
        return <AlertCircle className="h-6 w-6 text-yellow-600" />;
      default:
        return <AlertCircle className="h-6 w-6 text-red-600" />;
    }
  };

  const getBgColor = () => {
    switch (category) {
      case 'validation':
        return 'bg-orange-50 border-orange-200';
      case 'network':
        return 'bg-blue-50 border-blue-200';
      case 'security':
        return 'bg-red-50 border-red-200';
      case 'processing':
        return 'bg-purple-50 border-purple-200';
      case 'storage':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (category) {
      case 'validation':
        return 'text-orange-700';
      case 'network':
        return 'text-blue-700';
      case 'security':
        return 'text-red-700';
      case 'processing':
        return 'text-purple-700';
      case 'storage':
        return 'text-yellow-700';
      default:
        return 'text-red-700';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`rounded-xl border-2 p-4 ${getBgColor()} ${!compact ? '' : 'max-w-sm'}`}
    >
      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${getTextColor()} mb-2`}>Error</p>
          <p className={`text-sm ${getTextColor()} mb-3`}>{error}</p>
          <div className="flex gap-2">
            {showRetry && onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded transition-colors"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </button>
            )}
            {showHelp && onHelp && (
              <button
                onClick={onHelp}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-xs font-semibold rounded transition-colors"
              >
                <HelpCircle className="h-3 w-3" />
                Help
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Loading state with progress indicator
 */
export interface LoadingStateProps {
  message?: string;
  progress?: number;
  showProgress?: boolean;
  submessage?: string;
  isRetrying?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Processing...',
  progress,
  showProgress = false,
  submessage,
  isRetrying = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 gap-4"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
      >
        <Loader className="h-8 w-8 text-blue-600" />
      </motion.div>
      <div className="text-center">
        <p className="font-semibold text-gray-900">{message}</p>
        {isRetrying && (
          <p className="text-sm text-blue-600 mt-1">Retrying automatically...</p>
        )}
        {submessage && <p className="text-sm text-gray-600 mt-1">{submessage}</p>}
      </div>
      {showProgress && progress !== undefined && (
        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.3 }}
            className="h-full bg-blue-600"
          />
        </div>
      )}
    </motion.div>
  );
};

/**
 * Success state
 */
export interface SuccessStateProps {
  message?: string;
  submessage?: string;
  onReset?: () => void;
  resetButtonText?: string;
  showConfetti?: boolean;
}

export const SuccessState: React.FC<SuccessStateProps> = ({
  message = 'Success!',
  submessage,
  onReset,
  resetButtonText = 'Start Over',
  showConfetti = true,
}) => {
  React.useEffect(() => {
    if (showConfetti) {
      try {
        import('canvas-confetti').then(confetti => {
          confetti.default({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
        });
      } catch (e) {
        // Confetti import failed, continue without it
      }
    }
  }, [showConfetti]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center py-12 gap-4"
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <CheckCircle2 className="h-16 w-16 text-emerald-600" />
      </motion.div>
      <div className="text-center">
        <p className="font-bold text-lg text-gray-900">{message}</p>
        {submessage && <p className="text-sm text-gray-600 mt-1">{submessage}</p>}
      </div>
      {onReset && (
        <button
          onClick={onReset}
          className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors"
        >
          {resetButtonText}
        </button>
      )}
    </motion.div>
  );
};

/**
 * Empty/No data state
 */
export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No data',
  description = 'Nothing to display',
  actionText = 'Try again',
  onAction,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-12 gap-3"
    >
      <FileX className="h-12 w-12 text-gray-400" />
      <div className="text-center">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      {onAction && (
        <button
          onClick={onAction}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold rounded-lg transition-colors"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

/**
 * Retry prompt component
 */
export interface RetryPromptProps {
  error: string;
  retryCount: number;
  maxRetries: number;
  onRetry: () => void;
  onCancel: () => void;
}

export const RetryPrompt: React.FC<RetryPromptProps> = ({
  error,
  retryCount,
  maxRetries,
  onRetry,
  onCancel,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="rounded-xl bg-yellow-50 border-2 border-yellow-200 p-6"
    >
      <div className="flex gap-4">
        <div>
          <AlertCircle className="h-6 w-6 text-yellow-600" />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-yellow-900 mb-1">Retry Failed Operation?</h3>
          <p className="text-sm text-yellow-800 mb-2">{error}</p>
          <p className="text-xs text-yellow-700 mb-4">
            Attempt {retryCount} of {maxRetries}
          </p>
          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white font-semibold rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/**
 * State-based conditional render component
 */
export interface ConditionalStateProps {
  state: 'idle' | 'loading' | 'success' | 'error' | 'empty';
  isRetrying?: boolean;
  error?: string;
  errorCategory?: 'validation' | 'network' | 'security' | 'processing' | 'storage' | 'unknown';
  errorProgress?: number;
  loadingMessage?: string;
  loadingProgress?: number;
  successMessage?: string;
  successSubmessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  onReset?: () => void;
  onHelp?: () => void;
  children?: React.ReactNode;
}

export const ConditionalState: React.FC<ConditionalStateProps> = ({
  state,
  isRetrying,
  error,
  errorCategory,
  errorProgress,
  loadingMessage,
  loadingProgress,
  successMessage,
  successSubmessage,
  emptyTitle,
  emptyDescription,
  onRetry,
  onReset,
  onHelp,
  children,
}) => {
  return (
    <AnimatePresence mode="wait">
      {state === 'loading' && (
        <LoadingState
          key="loading"
          message={loadingMessage}
          progress={loadingProgress}
          showProgress={loadingProgress !== undefined}
          isRetrying={isRetrying}
        />
      )}
      {state === 'success' && (
        <SuccessState
          key="success"
          message={successMessage}
          submessage={successSubmessage}
          onReset={onReset}
        />
      )}
      {state === 'error' && error && (
        <ErrorDisplay
          key="error"
          error={error}
          category={errorCategory}
          onRetry={onRetry}
          onHelp={onHelp}
          showRetry={!!onRetry}
          showHelp={!!onHelp}
        />
      )}
      {state === 'empty' && (
        <EmptyState
          key="empty"
          title={emptyTitle}
          description={emptyDescription}
          onAction={onReset}
        />
      )}
      {state === 'idle' && children}
    </AnimatePresence>
  );
};

export default {
  ErrorDisplay,
  LoadingState,
  SuccessState,
  EmptyState,
  RetryPrompt,
  ConditionalState,
};
