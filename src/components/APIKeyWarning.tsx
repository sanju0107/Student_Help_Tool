import React from 'react';
import { AlertCircle } from 'lucide-react';

interface APIKeyWarningProps {
  message: string;
  isVisible: boolean;
}

export const APIKeyWarning: React.FC<APIKeyWarningProps> = ({ message, isVisible }) => {
  if (!isVisible) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
      <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
      <div>
        <h3 className="font-semibold text-amber-900 mb-1">API Configuration Required</h3>
        <p className="text-sm text-amber-800">{message}</p>
        <p className="text-xs text-amber-700 mt-2">
          💡 Tip: AI features like text generation and suggestions require a valid OpenAI API key. 
          The rest of the tool will work normally.
        </p>
      </div>
    </div>
  );
};
