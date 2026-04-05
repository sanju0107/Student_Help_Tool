/**
 * Home Component - Optimized for Performance
 * Uses lazy loading, memoization, and code splitting
 */

import React, { lazy, Suspense, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { TOOLS } from '../constants';
import { ImageIcon, FileText, GraduationCap, ChevronRight, Sparkles, Zap } from 'lucide-react';
import { prefetchRoutes } from '../lib/performance/performanceOptimization';

// Lazy load heavy components
const RelatedTools = lazy(() => import('../components/RelatedTools'));
const FAQ = lazy(() => import('../components/FAQ'));
const HowToUseSection = lazy(() => import('../components/HowToUseSection'));

// Fallback component
const SectionLoadingFallback = () => (
  <div className="h-40 bg-gradient-to-r from-slate-100 to-slate-50 rounded-lg animate-pulse" />
);

// Memoized category icon and header
const CategoryHeader = React.memo(({ category, toolCount }: any) => {
  const isAISection = category.isPriority;

  return (
    <div className={`${isAISection ? 'mb-8' : 'mb-6'} flex items-start justify-between ${isAISection ? 'pb-6 border-b border-indigo-200' : 'pb-4 border-b border-slate-200'}`}>
      <div className="flex items-center gap-3">
        <div className={`rounded-lg ${category.bg} p-2`}>
          <category.icon className={`h-5 w-5 ${category.color}`} />
        </div>
        <div>
          <h2 className={`${isAISection ? 'text-2xl' : 'text-lg'} font-bold text-slate-900 uppercase tracking-tight`}>{category.name}</h2>
          {isAISection && (
            <p className="text-sm font-medium text-slate-600 mt-1">AI-powered career & productivity tools to excel in your field</p>
          )}
        </div>
      </div>
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
        {toolCount} Tools
      </div>
    </div>
  );
});

CategoryHeader.displayName = 'CategoryHeader';

// Memoized tool card for performance
const ToolCard = React.memo(({ tool, isAISection }: any) => (
  <Link
    key={tool.id}
    to={tool.path}
    className={`group relative flex flex-col items-start text-left overflow-hidden rounded-xl border-2 transition-all ${
      isAISection
        ? 'border-indigo-200 bg-white/80 backdrop-blur-sm p-6 hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-1 hover:border-indigo-400 hover:bg-white'
        : 'border-slate-200 bg-white p-5 hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-50/30'
    }`}
  >
    <div className={`rounded-lg mb-3 p-3 ${tool.bgColor}`}>
      <tool.icon className={`h-5 w-5 ${tool.color}`} />
    </div>
    <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{tool.name}</h3>
    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{tool.description}</p>

    <div className="mt-auto pt-4 flex items-center gap-2 text-xs font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
      Use Tool <ChevronRight className="h-3 w-3" />
    </div>
  </Link>
));

ToolCard.displayName = 'ToolCard';

// Memoized category section
const CategorySection = React.memo(({ category, tools }: any) => {
  const isAISection = category.isPriority;

  if (tools.length === 0) return null;

  return (
    <section
      id={`${category.id}-tools`}
      className={`${isAISection ? 'mb-20 -mx-4 px-4 py-12 bg-gradient-to-br from-indigo-50 via-white to-blue-50 border-b-2 border-indigo-100' : 'mb-16'}`}
    >
      <div className="container mx-auto px-0">
        <CategoryHeader category={category} toolCount={tools.length} />

        <div
          className={`grid gap-5 ${
            isAISection
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {tools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} isAISection={isAISection} />
          ))}
        </div>
      </div>
    </section>
  );
});

CategorySection.displayName = 'CategorySection';

export default function Home() {
  // Memoize categories to prevent recreating on every render
  const categories = useMemo(
    () => [
      {
        id: 'professional',
        name: 'Professional Tools',
        icon: Zap,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        border: 'border-indigo-100',
        isPriority: true,
        subCategories: ['ai', 'career'],
      },
      { id: 'image', name: 'Image Tools', icon: ImageIcon, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-100' },
      { id: 'pdf', name: 'PDF Tools', icon: FileText, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
      { id: 'student', name: 'Student Tools', icon: GraduationCap, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    ],
    []
  );

  // Memoize category tools filtering
  const categoryToolsMap = useMemo(() => {
    const map = new Map();
    for (const category of categories) {
      const categoryTools = (category as any).subCategories
        ? TOOLS.filter((t) => (category as any).subCategories.includes(t.category))
        : TOOLS.filter((t) => t.category === category.id);
      map.set(category.id, categoryTools);
    }
    return map;
  }, [categories]);

  // Prefetch critical routes on component mount
  React.useLayoutEffect(() => {
    // Prefetch top tools
    const topToolPaths = TOOLS.slice(0, 6).map((tool) => () => import(`./pages/${tool.id}`));
    prefetchRoutes(topToolPaths);
  }, []);

  // Callback for smooth scrolling
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

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
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'CareerSuite',
            url: 'https://careersuite.io',
            logo: 'https://careersuite.io/logo.png',
            description: 'Free online tools for students and job seekers',
          })}
        </script>
      </Helmet>

      {/* Clean Header Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-8 lg:py-12 border-b border-slate-100">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Over 500k Users Trust Us</span>
              <Sparkles className="h-5 w-5 text-blue-600" />
            </div>
            <h1 className="mb-3 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">Free Online Tools</h1>
            <p className="text-base font-medium text-slate-600">
              Fast, private, and professional tools for students and job seekers. All processing happens on your device.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tool Sections */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {categories.map((category) => {
          const tools = categoryToolsMap.get(category.id);
          return <CategorySection key={category.id} category={category} tools={tools} />;
        })}
      </div>

      {/* Lazy-loaded sections - Optional features that require additional data */}
      {/* Uncomment to use these sections after providing required props */}
      {/* <Suspense fallback={<SectionLoadingFallback />}>
        <HowToUseSection steps={[]} />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <RelatedTools currentToolId="image-compressor" />
      </Suspense>

      <Suspense fallback={<SectionLoadingFallback />}>
        <FAQ items={[]} />
      </Suspense> */}
    </>
  );
}
