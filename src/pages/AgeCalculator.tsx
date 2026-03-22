import React, { useState, useMemo } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Cake, 
  Calendar, 
  RefreshCw, 
  ChevronRight, 
  Info, 
  History, 
  Clock, 
  CheckCircle2,
  Zap,
  ShieldCheck,
  CalendarDays,
  Timer
} from 'lucide-react';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { TOOLS } from '../constants';

export default function AgeCalculator() {
  const tool = useMemo(() => TOOLS.find(t => t.id === 'age-calculator')!, []);
  
  const [birthDate, setBirthDate] = useState<string>('');
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [result, setResult] = useState<{ 
    years: number; 
    months: number; 
    days: number;
    totalMonths: number;
    totalWeeks: number;
    totalDays: number;
    nextBirthday: { months: number; days: number };
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateAge = () => {
    if (!birthDate || !targetDate) {
      setError('Please select both dates.');
      return;
    }

    const birth = new Date(birthDate);
    const target = new Date(targetDate);

    if (birth > target) {
      setError('Birth date cannot be after the target date.');
      setResult(null);
      return;
    }

    setError(null);

    // Basic Age Calculation
    let years = target.getFullYear() - birth.getFullYear();
    let months = target.getMonth() - birth.getMonth();
    let days = target.getDate() - birth.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(target.getFullYear(), target.getMonth(), 0);
      days += prevMonth.getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    // Advanced Stats
    const diffTime = Math.abs(target.getTime() - birth.getTime());
    const totalDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.floor(totalDays / 7);
    const totalMonths = (years * 12) + months;

    // Next Birthday
    const nextBday = new Date(target.getFullYear(), birth.getMonth(), birth.getDate());
    if (nextBday < target) {
      nextBday.setFullYear(target.getFullYear() + 1);
    }
    
    let nextMonths = nextBday.getMonth() - target.getMonth();
    let nextDays = nextBday.getDate() - target.getDate();

    if (nextDays < 0) {
      nextMonths--;
      const prevMonth = new Date(nextBday.getFullYear(), nextBday.getMonth(), 0);
      nextDays += prevMonth.getDate();
    }
    if (nextMonths < 0) {
      nextMonths += 12;
    }

    setResult({ 
      years, 
      months, 
      days, 
      totalMonths, 
      totalWeeks, 
      totalDays,
      nextBirthday: { months: nextMonths, days: nextDays }
    });
  };

  const reset = () => {
    setBirthDate('');
    setTargetDate(new Date().toISOString().split('T')[0]);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] py-12">
      <Helmet>
        <title>{tool.name} - Precise Age for Exam Forms | CareerSuite</title>
        <meta name="description" content={tool.longDescription} />
        <meta name="keywords" content="age calculator, exam age calculator, upsc age limit, ssc age calculator, date of birth calculator, age in days, age in weeks" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={tool.name}
            description={tool.description}
            icon={tool.icon}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ToolCard className="overflow-hidden border-none shadow-2xl shadow-slate-200/50">
                <div className="p-1">
                  <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <CalendarDays className="h-5 w-5" />
                      </div>
                      <h2 className="text-xl font-bold text-slate-900">Calculate Age</h2>
                    </div>
                    <button
                      onClick={reset}
                      className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all"
                    >
                      <RefreshCw className="h-3 w-3" /> Reset
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Date of Birth</label>
                      <div className="relative group">
                        <input
                          type="date"
                          value={birthDate}
                          onChange={(e) => setBirthDate(e.target.value)}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-4 text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none transition-all outline-none"
                        />
                        <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 ml-1">Age at the Date of</label>
                      <div className="relative group">
                        <input
                          type="date"
                          value={targetDate}
                          onChange={(e) => setTargetDate(e.target.value)}
                          className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50/50 px-5 py-4 text-slate-900 font-semibold focus:border-blue-500 focus:bg-white focus:outline-none transition-all outline-none"
                        />
                        <Calendar className="absolute right-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none group-focus-within:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600 border border-red-100"
                    >
                      <Info className="h-5 w-5 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <button
                    onClick={calculateAge}
                    className="group relative mt-8 w-full overflow-hidden rounded-2xl bg-blue-600 py-5 text-lg font-bold text-white shadow-xl shadow-blue-600/20 transition-all hover:bg-blue-700 active:scale-[0.98]"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-3">
                      <Timer className="h-6 w-6" />
                      Calculate Precise Age
                    </div>
                    <div className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                  </button>

                  <AnimatePresence>
                    {result && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 space-y-8"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="group relative rounded-3xl bg-blue-600 p-8 text-center text-white shadow-2xl shadow-blue-600/30 transition-transform hover:-translate-y-1">
                            <p className="text-6xl font-black mb-1 tracking-tighter">{result.years}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-blue-100 opacity-80">Years</p>
                            <div className="absolute top-4 right-4 opacity-10">
                              <Cake className="h-12 w-12" />
                            </div>
                          </div>
                          <div className="group relative rounded-3xl bg-slate-900 p-8 text-center text-white shadow-2xl shadow-slate-900/30 transition-transform hover:-translate-y-1">
                            <p className="text-6xl font-black mb-1 tracking-tighter">{result.months}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Months</p>
                            <div className="absolute top-4 right-4 opacity-10">
                              <Calendar className="h-12 w-12" />
                            </div>
                          </div>
                          <div className="group relative rounded-3xl bg-white p-8 text-center text-slate-900 border-2 border-slate-100 shadow-xl shadow-slate-200/50 transition-transform hover:-translate-y-1">
                            <p className="text-6xl font-black mb-1 tracking-tighter">{result.days}</p>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Days</p>
                            <div className="absolute top-4 right-4 opacity-5">
                              <Clock className="h-12 w-12" />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: 'Total Months', value: result.totalMonths.toLocaleString() },
                            { label: 'Total Weeks', value: result.totalWeeks.toLocaleString() },
                            { label: 'Total Days', value: result.totalDays.toLocaleString() },
                            { label: 'Next Birthday', value: `${result.nextBirthday.months}m ${result.nextBirthday.days}d` },
                          ].map((stat, i) => (
                            <div key={i} className="rounded-2xl bg-slate-50 p-4 border border-slate-100 text-center">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                              <p className="text-lg font-bold text-slate-700">{stat.value}</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </ToolCard>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ToolCard className="border-none shadow-lg shadow-slate-200/50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">100% Accurate</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Our algorithm accounts for leap years and varying month lengths, ensuring your age is calculated exactly as required by official portals.
                      </p>
                    </div>
                  </div>
                </ToolCard>
                <ToolCard className="border-none shadow-lg shadow-slate-200/50">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Instant Results</h3>
                      <p className="text-slate-500 text-sm leading-relaxed">
                        Get your precise age in years, months, and days instantly. No registration or personal data storage required.
                      </p>
                    </div>
                  </div>
                </ToolCard>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-white p-8 border border-slate-100 shadow-xl shadow-slate-200/50 sticky top-6">
                <h3 className="mb-6 text-xl font-bold text-slate-900 flex items-center gap-3">
                  <History className="h-6 w-6 text-blue-600" />
                  Exam Eligibility
                </h3>
                <div className="space-y-4">
                  {[
                    { exam: 'UPSC', rule: 'Age as on Aug 1st of exam year.' },
                    { exam: 'SSC CGL', rule: 'Usually Jan 1st or Aug 1st.' },
                    { exam: 'IBPS', rule: 'Varies by specific notification.' },
                    { exam: 'State PSC', rule: 'Often Jan 1st of notification year.' }
                  ].map((item, i) => (
                    <div key={i} className="group flex items-start gap-3 rounded-2xl p-3 transition-colors hover:bg-slate-50">
                      <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <ChevronRight className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900">{item.exam}</p>
                        <p className="text-xs text-slate-500">{item.rule}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">How to use</h4>
                  <div className="space-y-4">
                    <ToolStep 
                      number={1} 
                      title="Birth Date" 
                      description="Select your DOB"
                      icon={Calendar}
                      compact
                    />
                    <ToolStep 
                      number={2} 
                      title="Target Date" 
                      description="Set calculation date"
                      icon={Clock}
                      compact
                    />
                    <ToolStep 
                      number={3} 
                      title="Calculate" 
                      description="Get precise results"
                      icon={CheckCircle2}
                      compact
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
