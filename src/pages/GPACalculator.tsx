import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  Plus, 
  Trash2, 
  RefreshCw, 
  GraduationCap, 
  Info, 
  TrendingUp, 
  Award, 
  CheckCircle2,
  ChevronDown,
  Zap,
  ShieldCheck,
  BookOpen
} from 'lucide-react';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

interface Course {
  id: string;
  name: string;
  grade: string;
  credits: number;
}

const GRADE_POINTS: Record<string, number> = {
  'O': 10,
  'A+': 9,
  'A': 8,
  'B+': 7,
  'B': 6,
  'C': 5,
  'P': 4,
  'F': 0,
};

export default function GPACalculator() {
  const toolData = TOOLS.find(t => t.id === 'gpa-calculator')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;

  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/student/gpa'
  });

  const [courses, setCourses] = useState<Course[]>([
    { id: '1', name: '', grade: 'O', credits: 4 },
  ]);

  const addCourse = () => {
    setCourses([...courses, { id: Math.random().toString(36).substr(2, 9), name: '', grade: 'O', credits: 4 }]);
  };

  const removeCourse = (id: string) => {
    if (courses.length > 1) {
      setCourses(courses.filter(c => c.id !== id));
    }
  };

  const updateCourse = (id: string, field: keyof Course, value: any) => {
    setCourses(courses.map(c => c.id === id ? { ...c, [field]: value } : c));
  };

  const calculateGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach(course => {
      totalPoints += GRADE_POINTS[course.grade] * course.credits;
      totalCredits += course.credits;
    });

    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : '0.00';
  };

  const gpa = calculateGPA();
  const percentage = (Number(gpa) * 9.5).toFixed(2); // Standard Indian conversion

  const reset = () => {
    setCourses([{ id: '1', name: '', grade: 'O', credits: 4 }]);
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
            title={title}
            description={description}
            icon={Calculator}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-100">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                      <BookOpen className="h-7 w-7 text-blue-600" />
                      Course List
                    </h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Add your subjects, grades, and credits below.</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={reset}
                      className="btn-secondary px-6 py-3 text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <RefreshCw className="h-4 w-4" /> Reset
                    </button>
                    <button
                      onClick={addCourse}
                      className="btn-primary px-6 py-3 text-sm flex items-center gap-2 whitespace-nowrap"
                    >
                      <Plus className="h-4 w-4" /> Add Course
                    </button>
                  </div>
                </div>

                <div className="space-y-6">
                  <AnimatePresence mode="popLayout">
                    {courses.map((course, index) => (
                      <motion.div 
                        key={course.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="group relative grid grid-cols-1 gap-6 rounded-[2rem] bg-slate-50 p-8 sm:grid-cols-12 border-2 border-slate-100 hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-300"
                      >
                        <div className="sm:col-span-6">
                          <label className="mb-3 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Course Name</label>
                          <input
                            type="text"
                            value={course.name}
                            onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                            placeholder={`Course ${index + 1}`}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-300"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="mb-3 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Grade</label>
                          <div className="relative">
                            <select
                              value={course.grade}
                              onChange={(e) => updateCourse(course.id, 'grade', e.target.value)}
                              className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all appearance-none cursor-pointer pr-12"
                            >
                              {Object.keys(GRADE_POINTS).map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                              <ChevronDown className="h-6 w-6" />
                            </div>
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-3 block text-xs font-black uppercase tracking-[0.2em] text-slate-400">Credits</label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={course.credits}
                            onChange={(e) => updateCourse(course.id, 'credits', Number(e.target.value))}
                            className="w-full rounded-2xl border-2 border-slate-200 bg-white px-5 py-4 text-lg font-bold text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all"
                          />
                        </div>
                        <div className="flex items-end justify-center sm:col-span-1">
                          <button
                            onClick={() => removeCourse(course.id)}
                            disabled={courses.length <= 1}
                            className="rounded-2xl p-4 text-slate-300 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-0"
                            title="Remove course"
                          >
                            <Trash2 className="h-6 w-6" />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                <div className="mt-10 pt-10 border-t border-slate-100">
                  <button
                    onClick={addCourse}
                    className="w-full flex items-center justify-center gap-4 rounded-3xl border-2 border-dashed border-slate-200 py-6 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all font-black text-xl group"
                  >
                    <Plus className="h-7 w-7 group-hover:rotate-90 transition-transform duration-300" /> 
                    Add Another Course
                  </button>
                </div>
              </ToolCard>

              {longDescription && (
                <ToolCard className="prose prose-slate max-w-none">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-3">How it works</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">{longDescription}</p>
                      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="rounded-2xl bg-slate-50 p-6 border-2 border-slate-100 shadow-inner">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Standard Formula</p>
                          <p className="text-lg font-mono font-bold text-slate-700">Σ(Grade Points × Credits) / ΣCredits</p>
                        </div>
                        <div className="rounded-2xl bg-slate-50 p-6 border-2 border-slate-100 shadow-inner">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Percentage Conversion</p>
                          <p className="text-lg font-mono font-bold text-slate-700">Percentage = GPA × 9.5</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </ToolCard>
              )}
            </div>

            <div className="space-y-8">
              <div className="rounded-[3rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/30 sticky top-10 overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-10 text-2xl font-black tracking-tight flex items-center gap-4">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                  Your Performance
                </h3>
                <div className="space-y-12">
                  <div className="text-center relative">
                    <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-4">Calculated GPA</p>
                    <p className="text-8xl font-black text-blue-400 tracking-tighter drop-shadow-2xl">{gpa}</p>
                  </div>
                  <div className="rounded-[2rem] bg-white/5 p-8 text-center border border-white/10 backdrop-blur-sm">
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-4">Equivalent Percentage</p>
                    <p className="text-4xl font-black text-white tracking-tight">{percentage}%</p>
                  </div>
                  <div className="flex items-start gap-4 rounded-2xl bg-blue-500/10 p-5 text-sm text-blue-200 leading-relaxed border border-blue-500/20">
                    <Award className="h-6 w-6 shrink-0 text-blue-400" />
                    <p className="font-bold">* Percentage = GPA × 9.5 (Standard Indian University conversion)</p>
                  </div>
                </div>
              </div>

              <div className="rounded-[2.5rem] border-2 border-slate-100 bg-white p-10 shadow-sm">
                <h3 className="mb-8 font-black text-2xl text-slate-900 tracking-tight flex items-center gap-4">
                  <GraduationCap className="h-7 w-7 text-blue-600" />
                  Grading Scale
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(GRADE_POINTS).map(([grade, point]) => (
                    <div key={grade} className="flex justify-between items-center rounded-2xl bg-slate-50 px-6 py-4 border-2 border-slate-100 hover:border-blue-100 transition-colors">
                      <span className="font-black text-xl text-slate-700">{grade}</span>
                      <span className="text-xs font-black text-slate-500 bg-white px-4 py-2 rounded-xl border-2 border-slate-100">{point} Points</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Enter Courses" 
                  description="List your subjects and their credit values."
                  icon={Plus}
                />
                <ToolStep 
                  number={2} 
                  title="Select Grades" 
                  description="Choose the grade you received for each."
                  icon={Award}
                />
                <ToolStep 
                  number={3} 
                  title="Get Result" 
                  description="View your GPA and percentage instantly."
                  icon={CheckCircle2}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <HowToUseSection steps={howToSteps} useCases={useCases} />
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="gpa-calculator" />
        </div>
      </div>
    </div>
  );
}
