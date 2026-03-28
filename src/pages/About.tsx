import React from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import { GraduationCap, ShieldCheck, Zap, Heart, Users, Globe } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>About CareerSuite - Free Tools for Students & Job Seekers</title>
        <meta name="description" content="CareerSuite is a free platform with 15+ online tools for students. Image compression, PDF management, resume building, and more. 100% secure and private. 500k+ users trust us." />
        <meta name="keywords" content="about careersuite, free student tools, online tools platform, career tools, professional toolkit, student resources" />
        <meta name="author" content="CareerSuite" />
        <meta property="og:title" content="About CareerSuite - Our Story & Mission" />
        <meta property="og:description" content="Learn how CareerSuite grew from a small project to help 500k+ students with professional tools for careers and education." />
        <meta property="og:url" content="https://careersuite.io/about" />
        <meta name="twitter:card" content="summary_large_image" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "CareerSuite",
            "url": "https://careersuite.io",
            "description": "Free online tools platform for students and job seekers",
            "image": "https://careersuite.io/og-image.png",
            "foundingDate": "2021",
            "numberOfEmployees": "small team",
            "sameAs": [
              "https://twitter.com/careersuite",
              "https://facebook.com/careersuite"
            ]
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          {/* Hero Section */}
          <div className="mb-16 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-white shadow-xl shadow-blue-600/20"
            >
              <GraduationCap className="h-10 w-10" />
            </motion.div>
            <h1 className="mb-6 text-4xl font-black tracking-tight text-slate-900 sm:text-6xl">
              Empowering <span className="text-blue-600">Careers</span> Through Technology.
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 sm:text-xl">
              CareerSuite was established in 2021 with a simple goal: to provide high-performance, professional-grade tools to every student and job seeker, completely free of charge.
            </p>
          </div>

          {/* Our Values */}
          <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Privacy First</h3>
              <p className="text-slate-600 leading-relaxed">
                We believe your data belongs to you. That's why 100% of our image and PDF processing happens directly in your browser. We never upload your sensitive documents to our servers.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">High Performance</h3>
              <p className="text-slate-600 leading-relaxed">
                Our tools are optimized for speed and precision. Whether it's hitting an exact KB target for a government form or generating an AI resume, we provide professional results in seconds.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Always Free</h3>
              <p className="text-slate-600 leading-relaxed">
                Education and career growth shouldn't be gated by subscriptions. All our core tools are and will always remain free for students and job seekers.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-slate-900">Community Driven</h3>
              <p className="text-slate-600 leading-relaxed">
                We listen to our users. Most of our specialized tools, like the Gov Form Resizer, were built based on the specific needs of students navigating complex application processes.
              </p>
            </div>
          </div>

          {/* Story Section */}
          <div className="rounded-3xl bg-blue-600 p-12 text-white shadow-2xl shadow-blue-600/30">
            <div className="mx-auto max-w-2xl text-center">
              <Globe className="mx-auto mb-6 h-12 w-12 opacity-50" />
              <h2 className="mb-6 text-3xl font-bold">Our Story</h2>
              <p className="mb-8 text-lg text-blue-100 leading-relaxed">
                Started as a small project to help friends resize photos for Indian government exams, CareerSuite has grown into a comprehensive platform used by thousands. We understand the frustration of rejected forms and complex PDF requirements, and we're here to solve them with one-click solutions.
              </p>
              <div className="flex justify-center gap-4">
                <div className="text-center">
                  <div className="text-3xl font-black">500k+</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Users Trust Us</div>
                </div>
                <div className="h-12 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-black">18</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Professional Tools</div>
                </div>
                <div className="h-12 w-px bg-white/20"></div>
                <div className="text-center">
                  <div className="text-3xl font-black">100%</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-blue-200">Secure & Private</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
