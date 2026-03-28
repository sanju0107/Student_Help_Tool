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
        {/* SEO Meta Tags */}
        <title>Free Online Tools for Students - Image, PDF, Resume & More</title>
        <meta name="description" content="CareerSuite: 18+ free online tools for students. Compress images, resize for SSC/UPSC, merge/split PDFs, build resumes. School-safe, fast, and secure. 500k+ users." />
        <meta name="keywords" content="image compressor, resize image, pdf merger, resume builder, ssc photo resizer, online tools free, student tools" />
        <meta name="author" content="CareerSuite" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Free Online Tools for Students - Image, PDF, Resume & More" />
        <meta property="og:description" content="18+ free online tools for students and job seekers. Compress images, resize photos, merge PDFs, create resumes with AI. Client-side processing, 100% private." />
        <meta property="og:url" content="https://careersuite.io" />
        <meta property="og:image" content="https://careersuite.io/og-image.png" />
        <meta property="og:locale" content="en_US" />
        
        {/* Twitter Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Free Online Tools for Students - CareerSuite" />
        <meta name="twitter:description" content="Resize images, compress PDFs, build resumes, calculate GPA. 18+ tools for students, 500k+ users. Free, fast, secure." />
        <meta name="twitter:image" content="https://careersuite.io/og-image.png" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://careersuite.io" />
        
        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CareerSuite",
            "url": "https://careersuite.io",
            "description": "Free online tools for students and job seekers",
            "image": "https://careersuite.io/og-image.png",
            "sameAs": [
              "https://twitter.com/careersuite",
              "https://facebook.com/careersuite"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Customer Support",
              "email": "support@careersuite.io"
            }
          })}
        </script>
        
        {/* Structured Data - WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "CareerSuite",
            "url": "https://careersuite.io",
            "description": "Free online tools for students: image compression, PDF management, resume building, calculators",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://careersuite.io/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            }
          })}
        </script>
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
            <span>Trusted by 500,000+ Students Worldwide</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl lg:text-7xl"
          >
            The <span className="text-blue-600 underline decoration-blue-600/20 underline-offset-8">Standard</span> Toolkit <br className="hidden sm:block" />
            for Modern Careers.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mx-auto mb-10 max-w-2xl text-lg font-medium text-slate-500 sm:text-xl"
          >
            Secure, private, and professional-grade tools for students and job applicants. 
            Established in 2021 to solve complex application requirements.
          </motion.p>
          
          {/* Trust Logos Placeholder */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 flex flex-wrap items-center justify-center gap-8 grayscale opacity-40"
          >
            <span className="text-xl font-black tracking-tighter text-slate-900">UNIVERSITY HUB</span>
            <span className="text-xl font-black tracking-tighter text-slate-900">CAREER PRO</span>
            <span className="text-xl font-black tracking-tighter text-slate-900">STUDENT DAILY</span>
            <span className="text-xl font-black tracking-tighter text-slate-900">TECH EDU</span>
          </motion.div>
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
              We've processed over 2.5 million files since 2021. Your data belongs to you.
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

          {/* Stats Bar */}
          <div className="mt-20 grid grid-cols-2 gap-8 border-t border-white/10 pt-20 md:grid-cols-4">
            <div className="text-center">
              <div className="text-4xl font-black text-blue-500">2.5M+</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Files Processed</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-500">500k+</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-500">150+</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">Countries</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-black text-blue-500">4.9/5</div>
              <div className="text-xs font-bold uppercase tracking-widest text-slate-500">User Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-slate-50 py-24">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-black text-slate-900 sm:text-4xl">What Students Say</h2>
            <p className="text-slate-500 font-medium">Join thousands of students who trust CareerSuite for their career needs.</p>
          </div>
          
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { name: "Rahul S.", role: "SSC Aspirant", text: "The Gov Form Resizer is a lifesaver. I used to spend hours trying to get the exact KB for my signature. Now it takes 5 seconds." },
              { name: "Priya M.", role: "Final Year Student", text: "The AI Resume Builder helped me land my first internship. The professional templates and AI summary are top-notch." },
              { name: "David K.", role: "Job Seeker", text: "I love that everything is private. I don't have to worry about my sensitive documents being stored on some random server." }
            ].map((t, i) => (
              <div key={i} className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Sparkles key={j} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="mb-6 text-slate-600 font-medium italic leading-relaxed">"{t.text}"</p>
                <div>
                  <div className="font-black text-slate-900">{t.name}</div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
