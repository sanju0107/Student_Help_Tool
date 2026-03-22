import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Send, Copy, Download, Loader2, FileText, Briefcase, User, Zap, CheckCircle2, Info } from 'lucide-react';
import { AlertCircle } from 'lucide-react';
import OpenAI from 'openai';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';

export default function CoverLetterAI() {
  const [formData, setFormData] = useState({
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateCoverLetter = async () => {
    if (!formData.jobTitle || !formData.companyName) {
      setError('Please provide at least job title and company name.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `Generate a professional cover letter for the following position:
        Job Title: ${formData.jobTitle}
        Company: ${formData.companyName}
        Job Description: ${formData.jobDescription}
        Years of Experience: ${formData.experience}
        Key Skills: ${formData.skills}
        
        The cover letter should be professional, persuasive, and tailored to the job description. 
        Format it clearly with placeholders for personal contact information.`;

      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
      });

      setCoverLetter(response.choices[0].message.content || '');
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (coverLetter) {
      navigator.clipboard.writeText(coverLetter);
      setCopied(true);
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
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>AI Cover Letter Generator - Professional & Tailored | CareerSuite</title>
        <meta name="description" content="Generate professional, job-winning cover letters tailored to your target role in seconds with AI. Stand out to recruiters effortlessly with high-quality content." />
        <meta name="keywords" content="ai cover letter generator, professional cover letter, job application letter, tailored cover letter, free ai writing tool" />
      </Helmet>

      <div className="mx-auto max-w-5xl">
        <ToolHeader 
          title="AI Cover Letter Generator"
          description="Create professional, job-winning cover letters tailored to your target role in seconds using advanced AI."
          icon={Sparkles}
        />

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Input Section */}
          <div className="space-y-6">
            <ToolCard>
              <h2 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-blue-600" />
                Job Details
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wider">Job Title</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                      placeholder="e.g. Software Engineer"
                      className="w-full rounded-xl border-2 border-slate-100 pl-12 pr-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wider">Company Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      placeholder="e.g. Google"
                      className="w-full rounded-xl border-2 border-slate-100 pl-12 pr-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wider">Experience</label>
                    <div className="relative">
                      <User className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleInputChange}
                        placeholder="e.g. 2 years"
                        className="w-full rounded-xl border-2 border-slate-100 pl-12 pr-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wider">Key Skills</label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. React, Node.js"
                      className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700 uppercase tracking-wider">Job Description (Optional)</label>
                  <textarea
                    name="jobDescription"
                    value={formData.jobDescription}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Paste the job description here for better tailoring..."
                    className="w-full rounded-xl border-2 border-slate-100 px-4 py-3 focus:border-blue-500 focus:outline-none transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <p className="font-bold">{error}</p>
                  </div>
                )}

                <button
                  onClick={generateCoverLetter}
                  disabled={isGenerating}
                  className="btn-primary w-full py-4 flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating with AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Cover Letter
                    </>
                  )}
                </button>
              </div>
            </ToolCard>

            <ToolCard className="prose prose-slate max-w-none">
              <div className="flex items-start gap-3">
                <Info className="mt-1 h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Pro Tip</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    The more details you provide in the job description, the better the AI can tailor your cover letter to specific requirements. 
                    Mentioning specific projects or achievements in your skills section also helps create a more persuasive letter.
                  </p>
                </div>
              </div>
            </ToolCard>
          </div>

          {/* Preview Section */}
          <div className="flex flex-col space-y-6">
            <ToolCard className="flex-1 flex flex-col h-full min-h-[500px]">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  Preview
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
                        className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
                        title="Copy to clipboard"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                        {copied ? 'Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={downloadText}
                        className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm font-bold text-slate-600 transition-all hover:bg-blue-50 hover:text-blue-600"
                        title="Download as .txt"
                      >
                        <Download className="h-4 w-4" />
                        Download
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 relative rounded-2xl bg-slate-50 p-8 text-sm leading-relaxed text-slate-700 border border-slate-100 shadow-inner overflow-y-auto max-h-[600px]">
                {coverLetter ? (
                  <div className="whitespace-pre-wrap font-serif text-base">
                    {coverLetter}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center text-center text-slate-400">
                    <div className="rounded-full bg-slate-100 p-8 mb-4">
                      <FileText className="h-16 w-16 opacity-20" />
                    </div>
                    <p className="font-medium max-w-[250px]">Fill in the job details and click generate to see your AI-crafted cover letter here.</p>
                  </div>
                )}
              </div>
            </ToolCard>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ToolStep 
                number={1} 
                title="Job Info" 
                description="Enter the role and company details."
                icon={Briefcase}
              />
              <ToolStep 
                number={2} 
                title="AI Magic" 
                description="AI generates a tailored letter."
                icon={Zap}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
