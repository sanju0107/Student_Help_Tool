import React, { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Copy, Download, Loader2, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import OpenAI from 'openai';
import { ToolHeader, ToolCard } from '../components/ToolUI';
import { APIKeyWarning } from '../components/APIKeyWarning';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { checkOpenAIKeyAvailability } from '../lib/apiKeyUtils';
import { trackAiFeature, trackToolUsage } from '../lib/analytics';
import { TOOLS } from '../constants';
import { 
  sanitizeText, 
  validateText, 
  validateEmail,
  rateLimiters,
  profileAsync,
  logError,
  categorizeError
} from '../lib';
import { useValidatedInput, useSanitizedInput, useAsyncOperation } from '../hooks/useValidation';

export default function CoverLetterAI() {
  const toolData = TOOLS.find(t => t.id === 'cover-letter-ai')!;
  const { seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;

  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/ai/cover-letter'
  });

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    jobTitle: '',
    companyName: '',
    jobDescription: '',
    experience: '',
    skills: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Check API key availability
  const apiKeyStatus = useMemo(() => checkOpenAIKeyAvailability(), []);
  const isAPIConfigured = apiKeyStatus.isConfigured;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Sanitize input as user types
    const sanitizedValue = sanitizeText(value);
    setFormData({ ...formData, [name]: sanitizedValue });
  };

  const generateCoverLetter = async () => {
    // Check for required fields
    if (!formData.jobTitle || !formData.companyName || !formData.fullName || !formData.email) {
      setError('Please fill in all required fields: Full Name, Email, Job Title, and Company Name.');
      return;
    }

    // Validate email format
    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.valid) {
      setError(emailValidation.error);
      return;
    }

    // Check rate limit for AI operations
    if (!rateLimiters.aiOperation.consume()) {
      setError('AI operation rate limit reached. Please wait a moment before trying again.');
      trackAiFeature('cover_letter_generation', false);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      if (!process.env.OPENAI_API_KEY) {
        setError('OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.');
        trackAiFeature('cover_letter_generation', false);
        setIsGenerating(false);
        return;
      }

      // Profile the operation for performance tracking
      const result = await profileAsync('cover_letter_generation', async () => {
        const openai = new OpenAI({ 
          apiKey: process.env.OPENAI_API_KEY,
          dangerouslyAllowBrowser: true
        });
        
        const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        // Sanitize all inputs to prevent injection attacks
        const sanitizedName = sanitizeText(formData.fullName);
        const sanitizedAddress = sanitizeText(formData.address);
        const sanitizedCity = sanitizeText(formData.city);
        const sanitizedEmail = sanitizeText(formData.email);
        const sanitizedCompany = sanitizeText(formData.companyName);
        const sanitizedJobTitle = sanitizeText(formData.jobTitle);
        const sanitizedExperience = sanitizeText(formData.experience);
        const sanitizedSkills = sanitizeText(formData.skills);
        const sanitizedJobDesc = sanitizeText(formData.jobDescription);
        
        const applicantAddress = `${sanitizedAddress}\n${sanitizedCity}, ${formData.state} ${formData.zipCode}`.trim();

        const prompt = `Generate a professional, concise cover letter with these EXACT details:

LETTER HEADER (use EXACTLY as provided):
Name: ${sanitizedName}
Address: ${applicantAddress || '[Your Address]'}
Email: ${sanitizedEmail}
Date: ${today}

HIRING MANAGER:
Company: ${sanitizedCompany}

JOB DETAILS:
Job Title: ${sanitizedJobTitle}
Experience: ${sanitizedExperience || 'Not specified'}
Skills: ${sanitizedSkills || 'Not specified'}
Job Description: ${sanitizedJobDesc || 'Not provided'}

FORMAT & REQUIREMENTS:
1. Start with applicant's full name on first line
2. Followed by complete address (street, city, state zip) on next lines
3. Then email and date
4. Leave blank line then write 'Hiring Manager' and company name
5. Professional business letter format
6. Opening paragraph with specific interest in the role
7. 2-3 body paragraphs highlighting relevant skills and experience matched to job
8. Closing paragraph with call to action
9. Professional sign off with full name
10. Total length: 200-300 words
11. CRITICAL: NO placeholder text like [Your Name], [Your Address], etc.
12. Use ACTUAL provided information everywhere
13. Ready to send immediately to the company
14. Professional and human-like tone`;

        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });

        return response.choices[0].message.content || '';
      }, { operation: 'cover_letter', tool: 'cover-letter-ai' });

      setCoverLetter(result);
      trackAiFeature('cover_letter_generation', true);
    } catch (err: any) {
      console.error('Cover letter generation error:', err);
      
      // Categorize error and provide user-friendly message
      const { category, userMessage } = categorizeError(err);
      setError(userMessage);
      
      // Log error for debugging
      logError(err, 'CoverLetterAI-generation');
      trackAiFeature('cover_letter_generation', false);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      trackToolUsage('cover_letter_generator', 'copy');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const downloadText = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cover-letter-${formData.companyName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    trackToolUsage('cover_letter_generator', 'download');
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{seoData.helmet.title}</title>
        {seoData.helmet.meta.map((meta, idx) => (
          <meta key={idx} {...meta} />
        ))}
        {seoData.helmet.link.map((link, idx) => (
          <link key={idx} {...link} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* SEO H1 Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black text-slate-900 sm:text-5xl">
              {seoTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              {intro}
            </p>
          </div>

        <ToolHeader 
          title="AI Cover Letter Generator"
          description="Create professional cover letters tailored to your target role in seconds."
          icon={Sparkles}
        />

        {/* API Key Status Warning */}
        <APIKeyWarning isVisible={!isAPIConfigured} message={apiKeyStatus.message} />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div>
            <ToolCard className="space-y-6">
              <h2 className="text-lg font-bold text-slate-900">Your Details</h2>
              
              {/* Full Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Address */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Street Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="123 Main Street"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* City, State, Zip */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="New York"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">State</label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    placeholder="NY"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Zip Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Job Title */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Job Title *</label>
                <input
                  type="text"
                  name="jobTitle"
                  value={formData.jobTitle}
                  onChange={handleInputChange}
                  placeholder="e.g. Senior Developer"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Company Name */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Company Name *</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="e.g. Google"
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Experience & Skills */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Experience</label>
                  <input
                    type="text"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    placeholder="e.g. 5 years"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Key Skills</label>
                  <input
                    type="text"
                    name="skills"
                    value={formData.skills}
                    onChange={handleInputChange}
                    placeholder="e.g. React, Node.js"
                    className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Job Description */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Job Description</label>
                <textarea
                  name="jobDescription"
                  value={formData.jobDescription}
                  onChange={handleInputChange}
                  rows={5}
                  placeholder="Paste the job description for better tailoring..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-2.5 text-sm focus:border-blue-500 focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-red-50 p-4 border border-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              {/* Generate Button */}
              <button
                onClick={generateCoverLetter}
                disabled={isGenerating}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5" />
                    Generate Letter
                  </>
                )}
              </button>
            </ToolCard>
          </div>

          {/* Output Section */}
          <div>
            <ToolCard className="h-full flex flex-col">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Your Cover Letter
                </h2>
                <AnimatePresence>
                  {coverLetter && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex gap-2"
                    >
                      <button
                        onClick={copyToClipboard}
                        className="flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors"
                        title="Copy to clipboard"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={downloadText}
                        className="flex items-center gap-2 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 px-3 py-2 text-sm font-medium transition-colors"
                        title="Download as .txt"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 rounded-lg bg-slate-50 p-6 text-sm leading-relaxed text-slate-700 border border-slate-200 overflow-y-auto">
                {coverLetter ? (
                  <div className="whitespace-pre-wrap font-serif text-base text-slate-800">
                    {coverLetter}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <FileText className="h-12 w-12 text-slate-300 mb-3" />
                    <p className="text-slate-500 text-sm">Fill in your details and generate a tailored cover letter</p>
                  </div>
                )}
              </div>
            </ToolCard>
          </div>
        </div>

        {/* SEO Content Sections */}
        <FAQ items={faqItems} />
        <RelatedTools currentToolId="cover-letter-ai" />
        </div>
      </div>
    </div>
  );
}
