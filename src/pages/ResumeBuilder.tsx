import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Plus, 
  Trash2, 
  Download, 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles,
  FileText,
  CheckCircle2,
  Info,
  Layout
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';

interface ResumeData {
  personal: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    summary: string;
  };
  experience: { id: string; company: string; position: string; duration: string; description: string }[];
  education: { id: string; school: string; degree: string; year: string }[];
  skills: string[];
  coverLetter: string;
}

const STEPS = [
  { id: 'personal', title: 'Personal', icon: User, description: 'Contact info & summary' },
  { id: 'experience', title: 'Experience', icon: Briefcase, description: 'Work history' },
  { id: 'education', title: 'Education', icon: GraduationCap, description: 'Academic background' },
  { id: 'skills', title: 'Skills', icon: Award, description: 'Core competencies' },
  { id: 'cover-letter', title: 'Cover Letter', icon: FileText, description: 'AI generated letter' },
  { id: 'preview', title: 'Preview', icon: CheckCircle2, description: 'Download PDF' },
];

export default function ResumeBuilder() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ResumeData>({
    personal: { name: '', email: '', phone: '', location: '', website: '', summary: '' },
    experience: [{ id: '1', company: '', position: '', duration: '', description: '' }],
    education: [{ id: '1', school: '', degree: '', year: '' }],
    skills: [''],
    coverLetter: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const updatePersonal = (field: string, value: string) => {
    setData({ ...data, personal: { ...data.personal, [field]: value } });
  };

  const addExperience = () => {
    setData({
      ...data,
      experience: [...data.experience, { id: Date.now().toString(), company: '', position: '', duration: '', description: '' }]
    });
  };

  const removeExperience = (id: string) => {
    setData({ ...data, experience: data.experience.filter(e => e.id !== id) });
  };

  const updateExperience = (id: string, field: string, value: string) => {
    setData({
      ...data,
      experience: data.experience.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const addEducation = () => {
    setData({
      ...data,
      education: [...data.education, { id: Date.now().toString(), school: '', degree: '', year: '' }]
    });
  };

  const removeEducation = (id: string) => {
    setData({ ...data, education: data.education.filter(e => e.id !== id) });
  };

  const updateEducation = (id: string, field: string, value: string) => {
    setData({
      ...data,
      education: data.education.map(e => e.id === id ? { ...e, [field]: value } : e)
    });
  };

  const updateSkill = (index: number, value: string) => {
    const newSkills = [...data.skills];
    newSkills[index] = value;
    setData({ ...data, skills: newSkills });
  };

  const addSkill = () => setData({ ...data, skills: [...data.skills, ''] });
  const removeSkill = (index: number) => setData({ ...data, skills: data.skills.filter((_, i) => i !== index) });

  const generateAiSummary = async () => {
    if (!data.personal.name) {
      setError('Please enter your name first.');
      return;
    }
    setIsAiLoading('summary');
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Write a 2-3 sentence professional resume summary for ${data.personal.name}. 
      Experience: ${data.experience.map(e => e.position).join(', ')}. 
      Skills: ${data.skills.join(', ')}. 
      Make it professional and impactful for a fresher or early career professional in India.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      updatePersonal('summary', response.text || '');
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error(err);
    } finally {
      setIsAiLoading(null);
    }
  };

  const generateAiCoverLetter = async () => {
    if (!data.personal.name) {
      setError('Please enter your name first.');
      return;
    }
    setIsAiLoading('coverLetter');
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      const prompt = `Write a professional cover letter based on this resume data:
      Name: ${data.personal.name}
      Experience: ${data.experience.map(e => `${e.position} at ${e.company}`).join(', ')}
      Education: ${data.education.map(e => e.degree).join(', ')}
      Skills: ${data.skills.join(', ')}
      Keep it professional, concise, and ready for a job application in India.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      setData({ ...data, coverLetter: response.text || '' });
    } catch (err) {
      setError('Failed to generate cover letter. Please try again.');
      console.error(err);
    } finally {
      setIsAiLoading(null);
    }
  };

  const downloadResume = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 20;

      // Name
      doc.setFontSize(24);
      doc.setTextColor(30, 41, 59); // slate-800
      doc.setFont('helvetica', 'bold');
      doc.text(data.personal.name || 'Your Name', margin, y);
      y += 10;

      // Contact Info
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.setFont('helvetica', 'normal');
      const contactInfo = [data.personal.email, data.personal.phone, data.personal.location, data.personal.website].filter(Boolean).join(' | ');
      doc.text(contactInfo, margin, y);
      y += 15;

      // Line separator
      doc.setDrawColor(226, 232, 240); // slate-200
      doc.line(margin, y - 5, 190, y - 5);

      // Summary
      if (data.personal.summary) {
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235); // blue-600
        doc.setFont('helvetica', 'bold');
        doc.text('PROFESSIONAL SUMMARY', margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85); // slate-700
        doc.setFont('helvetica', 'normal');
        const summaryLines = doc.splitTextToSize(data.personal.summary, 170);
        doc.text(summaryLines, margin, y);
        y += (summaryLines.length * 5) + 10;
      }

      // Experience
      if (data.experience.some(e => e.company)) {
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.text('EXPERIENCE', margin, y);
        y += 7;
        data.experience.forEach(exp => {
          if (!exp.company) return;
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          doc.setFont('helvetica', 'bold');
          doc.text(`${exp.position} at ${exp.company}`, margin, y);
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'italic');
          doc.text(exp.duration, 190, y, { align: 'right' });
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          const descLines = doc.splitTextToSize(exp.description, 170);
          doc.text(descLines, margin, y);
          y += (descLines.length * 5) + 7;
        });
      }

      // Education
      if (data.education.some(e => e.school)) {
        y += 5;
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.text('EDUCATION', margin, y);
        y += 7;
        data.education.forEach(edu => {
          if (!edu.school) return;
          doc.setFontSize(11);
          doc.setTextColor(30, 41, 59);
          doc.setFont('helvetica', 'bold');
          doc.text(edu.degree, margin, y);
          doc.setFontSize(10);
          doc.setTextColor(100, 116, 139);
          doc.setFont('helvetica', 'italic');
          doc.text(edu.year, 190, y, { align: 'right' });
          y += 5;
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          doc.text(edu.school, margin, y);
          y += 10;
        });
      }

      // Skills
      if (data.skills.some(s => s)) {
        y += 5;
        doc.setFontSize(12);
        doc.setTextColor(37, 99, 235);
        doc.setFont('helvetica', 'bold');
        doc.text('SKILLS', margin, y);
        y += 7;
        doc.setFontSize(10);
        doc.setTextColor(51, 65, 85);
        doc.setFont('helvetica', 'normal');
        const skillsText = data.skills.filter(Boolean).join(', ');
        const skillsLines = doc.splitTextToSize(skillsText, 170);
        doc.text(skillsLines, margin, y);
      }

      const fileName = (data.personal.name || 'resume').replace(/\s+/g, '-');
      doc.save(`${fileName}.pdf`);
    } catch (err) {
      setError('Failed to generate PDF. Please try again.');
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadCoverLetter = () => {
    try {
      const doc = new jsPDF();
      const margin = 20;
      let y = 30;
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      const splitText = doc.splitTextToSize(data.coverLetter, 170);
      doc.text(splitText, margin, y);
      const fileName = (data.personal.name || 'letter').replace(/\s+/g, '-');
      doc.save(`cover-letter-${fileName}.pdf`);
    } catch (err) {
      setError('Failed to generate Cover Letter PDF.');
      console.error(err);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const renderStepContent = () => {
    switch (STEPS[currentStep].id) {
      case 'personal':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</label>
                <input 
                  type="text" 
                  value={data.personal.name}
                  onChange={(e) => updatePersonal('name', e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</label>
                <input 
                  type="email" 
                  value={data.personal.email}
                  onChange={(e) => updatePersonal('email', e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                <input 
                  type="text" 
                  value={data.personal.phone}
                  onChange={(e) => updatePersonal('phone', e.target.value)}
                  className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none transition-all"
                  placeholder="+91 98765 43210"
                />
              </div>
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Professional Summary</label>
                  <button 
                    onClick={generateAiSummary}
                    disabled={isAiLoading === 'summary' || !data.personal.name}
                    className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
                  >
                    {isAiLoading === 'summary' ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Suggest
                  </button>
                </div>
                <textarea 
                  value={data.personal.summary}
                  onChange={(e) => updatePersonal('summary', e.target.value)}
                  className="h-32 w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
                  placeholder="Briefly describe your professional background and goals..."
                />
              </div>
            </div>
          </motion.div>
        );
      case 'experience':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Work Experience</h3>
              <button onClick={addExperience} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Experience
              </button>
            </div>
            <div className="space-y-4">
              {data.experience.map((exp) => (
                <div key={exp.id} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:bg-white hover:shadow-md transition-all">
                  <button 
                    onClick={() => removeExperience(exp.id)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Company</label>
                      <input 
                        type="text" 
                        value={exp.company}
                        onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Position</label>
                      <input 
                        type="text" 
                        value={exp.position}
                        onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Duration</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Jan 2020 - Present"
                        value={exp.duration}
                        onChange={(e) => updateExperience(exp.id, 'duration', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                      <textarea 
                        value={exp.description}
                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                        className="h-24 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all resize-none"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'education':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Education</h3>
              <button onClick={addEducation} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Education
              </button>
            </div>
            <div className="space-y-4">
              {data.education.map((edu) => (
                <div key={edu.id} className="relative rounded-2xl border border-slate-100 bg-slate-50 p-6 hover:bg-white hover:shadow-md transition-all">
                  <button 
                    onClick={() => removeEducation(edu.id)}
                    className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">School/University</label>
                      <input 
                        type="text" 
                        value={edu.school}
                        onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Degree</label>
                      <input 
                        type="text" 
                        value={edu.degree}
                        onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Year</label>
                      <input 
                        type="text" 
                        value={edu.year}
                        onChange={(e) => updateEducation(edu.id, 'year', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'skills':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Skills</h3>
              <button onClick={addSkill} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Skill
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {data.skills.map((skill, index) => (
                <div key={index} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 hover:bg-white hover:shadow-sm transition-all">
                  <input 
                    type="text" 
                    value={skill}
                    onChange={(e) => updateSkill(index, e.target.value)}
                    className="w-full bg-transparent text-sm focus:outline-none font-medium"
                    placeholder="e.g. React"
                  />
                  <button onClick={() => removeSkill(index)} className="text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'cover-letter':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Cover Letter</h3>
              <button 
                onClick={generateAiCoverLetter}
                disabled={isAiLoading === 'coverLetter' || !data.personal.name}
                className="flex items-center gap-1 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50 transition-colors"
              >
                {isAiLoading === 'coverLetter' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                Generate with AI
              </button>
            </div>
            <textarea 
              value={data.coverLetter}
              onChange={(e) => setData({ ...data, coverLetter: e.target.value })}
              className="h-64 w-full rounded-xl border-2 border-slate-100 bg-slate-50 px-4 py-3 focus:border-blue-500 focus:bg-white focus:outline-none transition-all resize-none"
              placeholder="Your cover letter will appear here..."
            />
          </motion.div>
        );
      case 'preview':
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <h3 className="mb-6 text-xl font-bold text-slate-900">Final Preview</h3>
              <div className="aspect-[1/1.414] w-full overflow-hidden rounded-xl border border-slate-100 bg-white p-8 text-[10px] shadow-inner sm:text-xs">
                <div className="text-center">
                  <div className="text-xl font-bold text-slate-900">{data.personal.name || 'Your Name'}</div>
                  <div className="text-slate-500">{data.personal.email} | {data.personal.phone}</div>
                </div>
                <div className="my-4 h-px w-full bg-slate-200"></div>
                <div className="space-y-4">
                  {data.personal.summary && (
                    <div>
                      <div className="font-bold text-blue-600">SUMMARY</div>
                      <p className="text-slate-700 leading-relaxed">{data.personal.summary}</p>
                    </div>
                  )}
                  {data.experience.some(e => e.company) && (
                    <div>
                      <div className="font-bold text-blue-600">EXPERIENCE</div>
                      {data.experience.map(exp => exp.company && (
                        <div key={exp.id} className="mt-2">
                          <div className="flex justify-between font-bold">
                            <span>{exp.position} at {exp.company}</span>
                            <span className="italic">{exp.duration}</span>
                          </div>
                          <p className="text-slate-600">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {data.education.some(e => e.school) && (
                    <div>
                      <div className="font-bold text-blue-600">EDUCATION</div>
                      {data.education.map(edu => edu.school && (
                        <div key={edu.id} className="mt-2 flex justify-between">
                          <div>
                            <div className="font-bold">{edu.degree}</div>
                            <div>{edu.school}</div>
                          </div>
                          <span className="italic">{edu.year}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={downloadResume} 
                disabled={isGenerating}
                className="btn-primary flex-1 py-4 flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Download className="h-5 w-5" />}
                Download Resume PDF
              </button>
              {data.coverLetter && (
                <button onClick={downloadCoverLetter} className="btn-secondary flex-1 py-4 flex items-center justify-center gap-2">
                  <Download className="h-5 w-5" /> Download Cover Letter PDF
                </button>
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <Helmet>
        <title>Free Resume Builder for Freshers in India - AI Powered CV Maker | StudentToolBox</title>
        <meta name="description" content="Create a professional resume and cover letter in minutes with our AI-powered builder. Perfect for freshers and students in India. ATS-friendly templates and instant PDF download." />
        <meta name="keywords" content="resume builder for freshers, free cv maker india, ai resume generator, professional cover letter builder, ssc resume maker, upsc cv maker" />
      </Helmet>

      <div className="mx-auto max-w-5xl">
        <ToolHeader 
          title="Resume & Cover Letter Builder"
          description="Build your career with AI-powered professional documents in minutes. Tailored for Indian job seekers and students."
          icon={Layout}
        />

        {/* Stepper */}
        <div className="mb-12 flex items-center justify-between px-4 sm:px-12 overflow-x-auto pb-4 scrollbar-hide">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 min-w-[100px] relative group cursor-pointer" onClick={() => setCurrentStep(index)}>
                <div className={`flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-300 ${isActive ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 scale-110' : isCompleted ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                  {isCompleted ? <CheckCircle2 className="h-7 w-7" /> : <Icon className="h-7 w-7" />}
                </div>
                <div className="text-center">
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{step.title}</p>
                </div>
                {index < STEPS.length - 1 && (
                  <div className={`absolute left-[calc(100%-20px)] top-7 h-[2px] w-12 hidden lg:block ${isCompleted ? 'bg-green-200' : 'bg-slate-100'}`} />
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <ToolCard>
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{STEPS[currentStep].title}</h2>
                  <p className="text-sm text-slate-500">{STEPS[currentStep].description}</p>
                </div>
                <div className="text-xs font-bold text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                  Step {currentStep + 1} / {STEPS.length}
                </div>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-medium text-red-600 border border-red-100 flex items-center gap-2"
                >
                  <Info className="h-4 w-4" />
                  {error}
                </motion.div>
              )}

              <div className="min-h-[400px]">
                {renderStepContent()}
              </div>

              <div className="mt-12 flex justify-between border-t border-slate-100 pt-8">
                <button 
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="btn-secondary px-6 py-3 disabled:opacity-30 flex items-center gap-2"
                >
                  <ChevronLeft className="h-5 w-5" /> Previous
                </button>
                <button 
                  onClick={nextStep}
                  disabled={currentStep === STEPS.length - 1}
                  className="btn-primary px-8 py-3 flex items-center gap-2"
                >
                  Next <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </ToolCard>

            <ToolCard className="prose prose-slate max-w-none">
              <div className="flex items-start gap-3">
                <Info className="mt-1 h-5 w-5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Resume Writing Tips</h3>
                  <p className="text-slate-600 leading-relaxed text-sm">
                    Keep your resume concise and focused on achievements. Use action verbs like "Developed", "Managed", or "Achieved". 
                    Ensure your contact information is up-to-date and professional. AI suggestions can help you find the right words, 
                    but always review and personalize them.
                  </p>
                </div>
              </div>
            </ToolCard>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
              <h3 className="mb-6 text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-blue-400" />
                AI Power
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">
                Our AI can help you craft the perfect summary and cover letter. Just enter your basic details and let the magic happen.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">ATS Friendly Layouts</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 border border-white/10">
                  <div className="h-8 w-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium">Instant PDF Generation</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <ToolStep 
                number={1} 
                title="Personal Info" 
                description="Add your contact details and summary."
                icon={User}
              />
              <ToolStep 
                number={2} 
                title="Experience" 
                description="List your work history and achievements."
                icon={Briefcase}
              />
              <ToolStep 
                number={3} 
                title="Education" 
                description="Add your academic qualifications."
                icon={GraduationCap}
              />
              <ToolStep 
                number={4} 
                title="Skills" 
                description="Highlight your core competencies."
                icon={Award}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
