import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Search, AlertCircle } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <Helmet>
        <title>404 - Page Not Found | CareerSuite</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 shadow-lg shadow-amber-600/10"
      >
        <AlertCircle className="h-12 w-12" />
      </motion.div>

      <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
        Page Not Found
      </h1>
      
      <p className="mx-auto mb-12 max-w-md text-lg font-medium text-slate-500">
        The tool or page you are looking for doesn't exist or has been moved. 
        Check the URL or return to the home page.
      </p>

      <div className="flex flex-wrap justify-center gap-4">
        <Link 
          to="/" 
          id="not-found-home-btn"
          className="btn-primary flex items-center gap-2 px-8 py-4"
        >
          <Home className="h-5 w-5" /> Back to Home
        </Link>
        <Link 
          to="/#all-tools" 
          id="not-found-tools-btn"
          className="btn-secondary flex items-center gap-2 px-8 py-4"
        >
          <Search className="h-5 w-5" /> Browse All Tools
        </Link>
      </div>

      <div className="mt-20 grid grid-cols-1 gap-6 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-bold text-slate-900">Image Tools</h3>
          <p className="text-xs text-slate-500">Compress, resize, and remove backgrounds.</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-bold text-slate-900">PDF Tools</h3>
          <p className="text-xs text-slate-500">Merge, split, and convert PDF files.</p>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-bold text-slate-900">Student Tools</h3>
          <p className="text-xs text-slate-500">GPA calculator, resume builder, and more.</p>
        </div>
      </div>
    </div>
  );
}
