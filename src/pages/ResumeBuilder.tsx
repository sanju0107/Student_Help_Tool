import React, { useState, useMemo } from 'react';
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
import OpenAI from 'openai';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { APIKeyWarning } from '../components/APIKeyWarning';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { ProfessionalResumePreview } from '../components/ResumePreviewComponents';
import { useSEO } from '../lib/useSEO';
import { checkOpenAIKeyAvailability } from '../lib/apiKeyUtils';
import { trackAiFeature, trackToolUsage } from '../lib/analytics';
import { TOOLS } from '../constants';

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
  projects: { id: string; title: string; description: string; techStack: string; link: string }[];
  positions: { id: string; role: string; organization: string; duration: string; description: string }[];
  achievements: { id: string; title: string; description: string; year: string }[];
  certifications: { id: string; name: string; organization: string; year: string; link: string }[];
  skills: string[];
  coverLetter: string;
}

const STEPS = [
  { id: 'personal', title: 'Personal', icon: User, description: 'Contact info & summary' },
  { id: 'experience', title: 'Experience', icon: Briefcase, description: 'Work history' },
  { id: 'education', title: 'Education', icon: GraduationCap, description: 'Academic background' },
  { id: 'projects', title: 'Projects', icon: Layout, description: 'Optional: Add projects' },
  { id: 'positions', title: 'Positions', icon: Award, description: 'Optional: Leadership roles' },
  { id: 'achievements', title: 'Achievements', icon: Award, description: 'Optional: Honors & awards' },
  { id: 'certifications', title: 'Certifications', icon: Award, description: 'Optional: Credentials' },
  { id: 'skills', title: 'Skills', icon: Award, description: 'Core competencies' },
  { id: 'cover-letter', title: 'Cover Letter', icon: FileText, description: 'AI generated letter' },
  { id: 'preview', title: 'Preview', icon: CheckCircle2, description: 'Download PDF' },
];

export default function ResumeBuilder() {
  const toolData = TOOLS.find(t => t.id === 'resume-builder')!;
  const { seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;

  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/student/resume'
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<ResumeData>({
    personal: { name: '', email: '', phone: '', location: '', website: '', summary: '' },
    experience: [{ id: '1', company: '', position: '', duration: '', description: '' }],
    education: [{ id: '1', school: '', degree: '', year: '' }],
    projects: [{ id: '1', title: '', description: '', techStack: '', link: '' }],
    positions: [{ id: '1', role: '', organization: '', duration: '', description: '' }],
    achievements: [{ id: '1', title: '', description: '', year: '' }],
    certifications: [{ id: '1', name: '', organization: '', year: '', link: '' }],
    skills: [''],
    coverLetter: '',
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check API key availability
  const apiKeyStatus = useMemo(() => checkOpenAIKeyAvailability(), []);
  const isAPIConfigured = apiKeyStatus.isConfigured;

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

  const addProject = () => {
    setData({
      ...data,
      projects: [...data.projects, { id: Date.now().toString(), title: '', description: '', techStack: '', link: '' }]
    });
  };

  const updateProject = (id: string, field: string, value: string) => {
    setData({
      ...data,
      projects: data.projects.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const removeProject = (id: string) => {
    setData({ ...data, projects: data.projects.filter(p => p.id !== id) });
  };

  const addPosition = () => {
    setData({
      ...data,
      positions: [...data.positions, { id: Date.now().toString(), role: '', organization: '', duration: '', description: '' }]
    });
  };

  const updatePosition = (id: string, field: string, value: string) => {
    setData({
      ...data,
      positions: data.positions.map(p => p.id === id ? { ...p, [field]: value } : p)
    });
  };

  const removePosition = (id: string) => {
    setData({ ...data, positions: data.positions.filter(p => p.id !== id) });
  };

  const addAchievement = () => {
    setData({
      ...data,
      achievements: [...data.achievements, { id: Date.now().toString(), title: '', description: '', year: '' }]
    });
  };

  const updateAchievement = (id: string, field: string, value: string) => {
    setData({
      ...data,
      achievements: data.achievements.map(a => a.id === id ? { ...a, [field]: value } : a)
    });
  };

  const removeAchievement = (id: string) => {
    setData({ ...data, achievements: data.achievements.filter(a => a.id !== id) });
  };

  const addCertification = () => {
    setData({
      ...data,
      certifications: [...data.certifications, { id: Date.now().toString(), name: '', organization: '', year: '', link: '' }]
    });
  };

  const updateCertification = (id: string, field: string, value: string) => {
    setData({
      ...data,
      certifications: data.certifications.map(c => c.id === id ? { ...c, [field]: value } : c)
    });
  };

  const removeCertification = (id: string) => {
    setData({ ...data, certifications: data.certifications.filter(c => c.id !== id) });
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
      // Check if API key is set
      if (!process.env.OPENAI_API_KEY) {
        setError('OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.');
        setIsAiLoading(null);
        return;
      }

      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      const prompt = `Write a 2-3 sentence professional resume summary for ${data.personal.name}. 
      Experience: ${data.experience.map(e => e.position).join(', ')}. 
      Skills: ${data.skills.join(', ')}. 
      Make it professional and impactful for a fresher or early career professional in India.`;
      
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
      updatePersonal('summary', response.choices[0].message.content || '');
      trackAiFeature('resume_summary_generation', true);
    } catch (err: any) {
      console.error('Summary generation error:', err);
      const errorMessage = err?.message || 'Failed to generate summary. Please try again.';
      setError(errorMessage);
      trackAiFeature('resume_summary_generation', false);
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
      // Check if API key is set
      if (!process.env.OPENAI_API_KEY) {
        setError('OpenAI API key is not configured. Please set OPENAI_API_KEY in environment variables.');
        setIsAiLoading(null);
        return;
      }

      const openai = new OpenAI({ 
        apiKey: process.env.OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Required for client-side usage
      });
      const prompt = `Write a professional cover letter based on this resume data:
      Name: ${data.personal.name}
      Experience: ${data.experience.map(e => `${e.position} at ${e.company}`).join(', ')}
      Education: ${data.education.map(e => e.degree).join(', ')}
      Skills: ${data.skills.join(', ')}
      Keep it professional, concise, and ready for a job application in India.`;
      
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
      setData({ ...data, coverLetter: response.choices[0].message.content || '' });
      trackAiFeature('resume_cover_letter_generation', true);
    } catch (err: any) {
      console.error('Cover letter generation error:', err);
      const errorMessage = err?.message || 'Failed to generate cover letter. Please try again.';
      setError(errorMessage);
      trackAiFeature('resume_cover_letter_generation', false);
    } finally {
      setIsAiLoading(null);
    }
  };

  const downloadResume = () => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const contentWidth = pageWidth - (margin * 2);
      let y = 15;

      // Helper functions
      const addSectionTitle = (title: string) => {
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(30, 41, 59);
        doc.text(title.toUpperCase(), margin, y);
        y += 1.5;
        doc.setDrawColor(100, 116, 139);
        doc.line(margin, y, pageWidth - margin, y);
        y += 4;
      };

      // HEADER - Name and Contact
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(15, 23, 42);
      doc.text(data.personal.name || 'Your Name', margin, y);
      y += 8;

      // Contact Info
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 95, 120);
      const contactItems = [data.personal.email, data.personal.phone, data.personal.location, data.personal.website].filter(Boolean);
      if (contactItems.length) {
        const contactLine = contactItems.join(' | ');
        doc.text(contactLine, margin, y);
      }
      y += 6;

      // SUMMARY
      if (data.personal.summary && data.personal.summary.trim()) {
        addSectionTitle('Summary');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const summaryLines = doc.splitTextToSize(data.personal.summary, contentWidth);
        doc.text(summaryLines, margin, y);
        y += (summaryLines.length * 3.5) + 4;
      }

      // EXPERIENCE
      const hasExperience = data.experience.some(e => e.company && e.company.trim());
      if (hasExperience) {
        addSectionTitle('Experience');
        data.experience.forEach(exp => {
          if (!exp.company || !exp.company.trim()) return;
          
          // Job title and company
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          const jobLine = `${exp.position} — ${exp.company}`.substring(0, 80);
          doc.text(jobLine, margin, y);
          
          // Duration on the right
          if (exp.duration) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(exp.duration, pageWidth - margin - 20, y, { align: 'right' });
          }
          y += 5;

          // Description
          if (exp.description && exp.description.trim()) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(exp.description, contentWidth);
            doc.text(descLines, margin, y);
            y += (descLines.length * 3) + 5;
          } else {
            y += 2;
          }
        });
        y += 2;
      }

      // EDUCATION
      const hasEducation = data.education.some(e => e.school && e.school.trim());
      if (hasEducation) {
        addSectionTitle('Education');
        data.education.forEach(edu => {
          if (!edu.school || !edu.school.trim()) return;
          
          // Degree and school
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          const eduLine = `${edu.degree}${edu.school ? ' — ' + edu.school : ''}`.substring(0, 80);
          doc.text(eduLine, margin, y);
          
          // Year on the right
          if (edu.year) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(edu.year, pageWidth - margin - 20, y, { align: 'right' });
          }
          y += 6;
        });
        y += 2;
      }

      // PROJECTS
      const hasProjects = data.projects && data.projects.some(p => p.title && p.title.trim());
      if (hasProjects) {
        addSectionTitle('Projects');
        data.projects.forEach(proj => {
          if (!proj.title || !proj.title.trim()) return;
          
          // Project title (bold)
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          doc.text(proj.title, margin, y);
          y += 5;
          
          // Tech stack (italic, if present)
          if (proj.techStack && proj.techStack.trim()) {
            doc.setFont('helvetica', 'italic');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            const techLine = doc.splitTextToSize(`${proj.techStack}`, contentWidth - 5);
            doc.text(techLine, margin + 2, y);
            y += techLine.length * 4 + 1;
          }
          
          // Description
          if (proj.description && proj.description.trim()) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(proj.description, contentWidth - 5);
            doc.text(descLines, margin + 2, y);
            y += descLines.length * 4 + 2;
          }
          
          y += 1;
        });
        y += 2;
      }

      // POSITIONS OF RESPONSIBILITY
      const hasPositions = data.positions && data.positions.some(p => p.role && p.role.trim());
      if (hasPositions) {
        addSectionTitle('Positions of Responsibility');
        data.positions.forEach(pos => {
          if (!pos.role || !pos.role.trim()) return;
          
          // Role and organization
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          const posLine = `${pos.role}${pos.organization ? ' — ' + pos.organization : ''}`.substring(0, 80);
          doc.text(posLine, margin, y);
          
          // Duration on the right
          if (pos.duration) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(pos.duration, pageWidth - margin - 20, y, { align: 'right' });
          }
          y += 6;
          
          // Description
          if (pos.description && pos.description.trim()) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(51, 65, 85);
            const descLines = doc.splitTextToSize(pos.description, contentWidth - 5);
            doc.text(descLines, margin + 2, y);
            y += descLines.length * 4 + 1;
          }
          
          y += 1;
        });
        y += 2;
      }

      // ACHIEVEMENTS
      const hasAchievements = data.achievements && data.achievements.some(a => a.title && a.title.trim());
      if (hasAchievements) {
        addSectionTitle('Achievements');
        data.achievements.forEach(ach => {
          if (!ach.title || !ach.title.trim()) return;
          
          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(51, 65, 85);
          
          // Bullet point with title and year
          const achText = `${ach.title}${ach.year ? ' (' + ach.year + ')' : ''}`;
          const achLines = doc.splitTextToSize(`• ${achText}`, contentWidth - 5);
          doc.text(achLines, margin + 2, y);
          y += achLines.length * 4;
          
          // Description if present
          if (ach.description && ach.description.trim()) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            const descLines = doc.splitTextToSize(ach.description, contentWidth - 10);
            doc.text(descLines, margin + 5, y);
            y += descLines.length * 4;
          }
          
          y += 1;
        });
        y += 2;
      }

      // CERTIFICATIONS
      const hasCertifications = data.certifications && data.certifications.some(c => c.name && c.name.trim());
      if (hasCertifications) {
        addSectionTitle('Certifications');
        data.certifications.forEach(cert => {
          if (!cert.name || !cert.name.trim()) return;
          
          // Certificate name and organization
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(30, 41, 59);
          const certLine = `${cert.name}${cert.organization ? ' — ' + cert.organization : ''}`.substring(0, 80);
          doc.text(certLine, margin, y);
          
          // Year on the right
          if (cert.year) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(100, 116, 139);
            doc.text(cert.year, pageWidth - margin - 20, y, { align: 'right' });
          }
          y += 6;
        });
        y += 2;
      }

      // SKILLS
      const filteredSkills = data.skills.filter(s => s && s.trim());
      if (filteredSkills.length > 0) {
        addSectionTitle('Skills');
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(51, 65, 85);
        const skillsText = filteredSkills.join(', ');
        const skillsLines = doc.splitTextToSize(skillsText, contentWidth);
        doc.text(skillsLines, margin, y);
      }

      const fileName = (data.personal.name || 'resume').replace(/\s+/g, '-').toLowerCase();
      doc.save(`${fileName}.pdf`);
      setError(null);
    } catch (err) {
      setError('Failed to generate PDF. Please ensure all required fields are filled.');
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
      case 'projects':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Projects (Optional)</h3>
              <button onClick={addProject} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Project
              </button>
            </div>
            <div className="space-y-4">
              {data.projects.map((proj) => (
                <div key={proj.id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6">
                  <button 
                    onClick={() => removeProject(proj.id)}
                    className="float-right text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Project Title</label>
                      <input 
                        type="text" 
                        value={proj.title}
                        onChange={(e) => updateProject(proj.id, 'title', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                      <textarea 
                        value={proj.description}
                        onChange={(e) => updateProject(proj.id, 'description', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all h-20"
                        placeholder="Brief description of the project"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Tech Stack</label>
                      <input 
                        type="text" 
                        value={proj.techStack}
                        onChange={(e) => updateProject(proj.id, 'techStack', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="e.g. React, Node.js, PostgreSQL"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Project Link</label>
                      <input 
                        type="text" 
                        value={proj.link}
                        onChange={(e) => updateProject(proj.id, 'link', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="e.g. https://github.com/..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'positions':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Positions of Responsibility (Optional)</h3>
              <button onClick={addPosition} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Position
              </button>
            </div>
            <div className="space-y-4">
              {data.positions.map((pos) => (
                <div key={pos.id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6">
                  <button 
                    onClick={() => removePosition(pos.id)}
                    className="float-right text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Role/Position</label>
                      <input 
                        type="text" 
                        value={pos.role}
                        onChange={(e) => updatePosition(pos.id, 'role', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Organization/College</label>
                      <input 
                        type="text" 
                        value={pos.organization}
                        onChange={(e) => updatePosition(pos.id, 'organization', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Duration</label>
                      <input 
                        type="text" 
                        value={pos.duration}
                        onChange={(e) => updatePosition(pos.id, 'duration', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                        placeholder="e.g. 2023-2024"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description of Duties</label>
                      <textarea 
                        value={pos.description}
                        onChange={(e) => updatePosition(pos.id, 'description', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all h-20"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'achievements':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Achievements & Awards (Optional)</h3>
              <button onClick={addAchievement} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Achievement
              </button>
            </div>
            <div className="space-y-4">
              {data.achievements.map((ach) => (
                <div key={ach.id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6">
                  <button 
                    onClick={() => removeAchievement(ach.id)}
                    className="float-right text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Achievement Title</label>
                      <input 
                        type="text" 
                        value={ach.title}
                        onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Year</label>
                      <input 
                        type="text" 
                        value={ach.year}
                        onChange={(e) => updateAchievement(ach.id, 'year', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Description (Optional)</label>
                      <input 
                        type="text" 
                        value={ach.description}
                        onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        );
      case 'certifications':
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Certifications (Optional)</h3>
              <button onClick={addCertification} className="btn-secondary px-4 py-2 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Certification
              </button>
            </div>
            <div className="space-y-4">
              {data.certifications.map((cert) => (
                <div key={cert.id} className="rounded-2xl border border-slate-200 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 p-6">
                  <button 
                    onClick={() => removeCertification(cert.id)}
                    className="float-right text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Certificate Name</label>
                      <input 
                        type="text" 
                        value={cert.name}
                        onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Issuing Organization</label>
                      <input 
                        type="text" 
                        value={cert.organization}
                        onChange={(e) => updateCertification(cert.id, 'organization', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Year</label>
                      <input 
                        type="text" 
                        value={cert.year}
                        onChange={(e) => updateCertification(cert.id, 'year', e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 focus:border-blue-500 focus:outline-none transition-all"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Credential Link (Optional)</label>
                      <input 
                        type="text" 
                        value={cert.link}
                        onChange={(e) => updateCertification(cert.id, 'link', e.target.value)}
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
              <h3 className="mb-6 text-xl font-bold text-slate-900">Professional Resume Preview</h3>
              <div className="aspect-[1/1.414] w-full overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                <div className="h-full overflow-auto">
                  <div className="scale-[0.6] origin-top-left w-[166.67%] h-[166.67%]">
                    <ProfessionalResumePreview
                      personal={data.personal}
                      experience={data.experience}
                      education={data.education}
                      projects={data.projects}
                      positions={data.positions}
                      achievements={data.achievements}
                      certifications={data.certifications}
                      skills={data.skills}
                      summary={data.personal.summary}
                    />
                  </div>
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
          title="Resume & Cover Letter Builder"
          description="Build your career with AI-powered professional documents in minutes. Tailored for Indian job seekers and students."
          icon={Layout}
        />

        {/* API Key Status Warning */}
        <APIKeyWarning isVisible={!isAPIConfigured} message={apiKeyStatus.message} />

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

          {/* SEO Content Sections */}
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="resume-builder" />
        </div>
        </div>
      </div>
    </div>
  );
}
