/**
 * API Key Configuration Utils
 * Checks and manages API key availability
 */

export const checkOpenAIKeyAvailability = (): {
  isConfigured: boolean;
  message: string;
} => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    return {
      isConfigured: false,
      message:
        '⚠️ OpenAI API Key Not Configured - AI features are disabled. Contact your administrator to enable AI-powered features.',
    };
  }

  // Check if it's a valid-looking API key (basic validation)
  if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
    return {
      isConfigured: false,
      message:
        '⚠️ OpenAI API Key Invalid - The configured key appears to be invalid. Contact your administrator to verify the API key configuration.',
    };
  }

  return {
    isConfigured: true,
    message: '',
  };
};

export const getAPIKeyStatus = () => {
  return checkOpenAIKeyAvailability();
};
