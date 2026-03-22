import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { TOOLS } from '../constants';
import { ImageIcon, FileText, GraduationCap, ChevronRight, Sparkles, Maximize, RefreshCw } from 'lucide-react';

export default function Home() {
  const categories = [
    { id: 'image', name: 'Image Tools', icon: ImageIcon, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
    { id: 'pdf', name: 'PDF Tools', icon: FileText, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
    { id: 'student', name: 'Student Tools', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    { id: 'ai', name: 'AI Tools', icon: Sparkles, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-100' },
  ];

  return (
    <>
      <Helmet>
        <title>StudentToolBox - Professional Tools for Students & Job Seekers</title>
        <meta name="description" content="The ultimate toolkit for students and job seekers. Resize images for SSC forms, hit exact KB targets, create resumes, and manage PDFs for free." />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-white py-16 lg:py-24 border-b border-slate-100">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-blue-600"
          >
            <Sparkles className="h-4 w-4" />
            <span>Professional Online Toolkit</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          >
            Every tool you need to <br className="hidden sm:block" />
            <span className="text-blue-600">accelerate</span> your career.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-10 max-w-2xl text-lg font-medium text-slate-500 sm:text-xl"
          >
            Secure, private, and high-performance tools for students and job applicants. 
            Processed entirely in your browser.
          </motion.p>
        </div>
      </section>

      {/* Tool Sections */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        {categories.map((category) => {
          const categoryTools = TOOLS.filter(t => t.category === category.id);
          if (categoryTools.length === 0) return null;
          
          return (
            <section 
              key={category.id} 
              id={`${category.id}-tools`} 
              className="mb-24 last:mb-0"
            >
              <div className="mb-10 flex items-center justify-between border-b border-slate-100 pb-6">
                <div className="flex items-center gap-4">
                  <div className={`rounded-xl ${category.bg} p-2.5`}>
                    <category.icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{category.name}</h2>
                </div>
                <div className="hidden sm:block text-xs font-black text-slate-400 uppercase tracking-widest">
                  {categoryTools.length} Tools Available
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categoryTools.map((tool) => (
                  <Link 
                    key={tool.id} 
                    to={tool.path}
                    className="group relative flex flex-col items-center text-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 transition-all hover:shadow-2xl hover:shadow-blue-600/10 hover:-translate-y-1.5 hover:border-blue-400"
                  >
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-50 text-slate-600 shadow-inner transition-all group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-600/30 group-hover:scale-110">
                      <tool.icon className="h-8 w-8" />
                    </div>
                    <h3 className="mb-3 text-xl font-black text-slate-900 group-hover:text-blue-600">{tool.name}</h3>
                    <p className="text-sm font-medium leading-relaxed text-slate-500">{tool.description}</p>
                    
                    <div className="mt-8 flex items-center text-xs font-black text-blue-600 uppercase tracking-widest opacity-0 transition-all group-hover:translate-y-0 group-hover:opacity-100 translate-y-2">
                      Open Tool <ChevronRight className="ml-1 h-3 w-3" />
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Trust Section */}
      <section className="bg-slate-900 py-24 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black sm:text-5xl">Built for Privacy & Speed</h2>
            <p className="mx-auto max-w-2xl text-slate-400 font-medium">
              We believe your data belongs to you. That's why we built our tools to run entirely in your browser.
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-blue-400">
                <Maximize className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black">100% Client-Side</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Files are processed on your device. Nothing is ever uploaded to a server, ensuring total privacy.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-emerald-400">
                <RefreshCw className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black">Lightning Fast</h3>
              <p className="text-slate-400 text-sm leading-relaxed">No upload/download wait times. Get instant results with high-performance browser-based processing.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-purple-400">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-black">Pro Quality</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Professional-grade algorithms for compression, resizing, and AI generation without the cost.</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
