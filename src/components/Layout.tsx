import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { GraduationCap, Github, Twitter, Mail, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Layout() {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[#fcfcfd]">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2 text-2xl font-black text-slate-900">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <GraduationCap className="h-6 w-6" />
            </div>
            <span className="hidden tracking-tight sm:inline">CareerSuite</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link to="/" className={`text-sm font-bold transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Home</Link>
            <Link to="/#image-tools" className="text-sm font-bold text-slate-600 hover:text-blue-600">Image</Link>
            <Link to="/#pdf-tools" className="text-sm font-bold text-slate-600 hover:text-blue-600">PDF</Link>
            <Link to="/#student-tools" className="text-sm font-bold text-slate-600 hover:text-blue-600">Student</Link>
            <Link to="/#ai-tools" className="text-sm font-bold text-slate-600 hover:text-blue-600">AI Tools</Link>
          </nav>

          <div className="flex items-center gap-4">
            <button 
              className="md:hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <div className="hidden md:block h-6 w-px bg-slate-200 mx-2"></div>
            <Link to="/about" className="hidden md:block text-sm font-bold text-slate-600 hover:text-blue-600">
              About
            </Link>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-slate-100 bg-white px-4 py-6"
            >
              <nav className="flex flex-col gap-4">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">Home</Link>
                <Link to="/#image-tools" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">Image Tools</Link>
                <Link to="/#pdf-tools" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">PDF Tools</Link>
                <Link to="/#student-tools" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">Student Tools</Link>
                <Link to="/#ai-tools" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">AI Tools</Link>
                <hr className="border-slate-100" />
                <Link to="/about" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold text-slate-900">About Us</Link>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-200 bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-4">
            <div className="space-y-6">
              <Link to="/" className="flex items-center gap-2 text-xl font-black text-slate-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-600/20">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <span>CareerSuite</span>
              </Link>
              <p className="text-sm leading-relaxed text-slate-500">
                The ultimate professional toolkit for students and job seekers. Secure, private, and 100% free online tools. Established in 2021.
              </p>
              <div className="flex gap-4">
                <a href="#" className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><Twitter className="h-5 w-5" /></a>
                <a href="#" className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><Github className="h-5 w-5" /></a>
                <a href="#" className="rounded-full bg-slate-50 p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all"><Mail className="h-5 w-5" /></a>
              </div>
            </div>
            
            <div>
              <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Popular Tools</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-600">
                <li><Link to="/image/compressor" className="hover:text-blue-600">Compress Image</Link></li>
                <li><Link to="/image/gov-form" className="hover:text-blue-600">Gov Form Resizer</Link></li>
                <li><Link to="/pdf/merge" className="hover:text-blue-600">Merge PDF</Link></li>
                <li><Link to="/student/resume" className="hover:text-blue-600">Resume Builder</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Resources</h4>
              <ul className="space-y-3 text-sm font-bold text-slate-600">
                <li><Link to="/about" className="hover:text-blue-600">About Us</Link></li>
                <li><Link to="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
                <li><Link to="/about" className="hover:text-blue-600">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="mb-6 text-xs font-black uppercase tracking-widest text-slate-400">Security & Status</h4>
              <p className="text-sm leading-relaxed text-slate-500 mb-4">
                All processing is done client-side. Your files never leave your computer.
              </p>
              <div className="flex flex-col gap-2">
                <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  All Systems Operational
                </div>
                <div className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  Privacy Guaranteed
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 border-t border-slate-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <div>© 2021 - {new Date().getFullYear()} CareerSuite. All rights reserved.</div>
            <div className="flex gap-8">
              <Link to="/privacy" className="hover:text-slate-600">Privacy</Link>
              <Link to="/terms" className="hover:text-slate-600">Terms</Link>
              <Link to="/about" className="hover:text-slate-600">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
