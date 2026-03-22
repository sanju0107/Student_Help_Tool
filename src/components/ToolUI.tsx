import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = 'text-blue-600', 
  iconBg = 'bg-blue-50' 
}) => {
  return (
    <div className="mb-12 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`mb-6 inline-flex h-20 w-20 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-lg shadow-blue-600/10`}
      >
        <Icon className="h-10 w-10" />
      </motion.div>
      <h1 className="mb-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">{title}</h1>
      <p className="mx-auto max-w-2xl text-lg font-medium text-slate-500">{description}</p>
    </div>
  );
};

interface ToolCardProps {
  children: React.ReactNode;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ children, className = '' }) => {
  return (
    <div className={`rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50 sm:p-12 ${className}`}>
      {children}
    </div>
  );
};

interface ToolStepProps {
  number: number;
  title: string;
  description: string;
  color?: string;
  icon?: LucideIcon;
  compact?: boolean;
}

export const ToolStep: React.FC<ToolStepProps> = ({ 
  number, 
  title, 
  description, 
  color = 'bg-blue-50 text-blue-600',
  icon: Icon,
  compact = false
}) => {
  if (compact) {
    return (
      <div className="flex items-center gap-4 rounded-2xl bg-slate-50/50 p-4 border border-slate-100 transition-all hover:bg-white hover:shadow-md group">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-sm ${color} group-hover:scale-110 transition-transform`}>
          {number}
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 truncate">{title}</h3>
          <p className="text-[11px] font-medium text-slate-500 truncate">{description}</p>
        </div>
        {Icon && <Icon className="ml-auto h-4 w-4 text-slate-300 group-hover:text-blue-400 transition-colors" />}
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white p-8 border border-slate-100 shadow-sm transition-all hover:shadow-md">
      <div className="mb-6 flex items-center justify-between">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl font-black text-lg ${color}`}>
          {number}
        </div>
        {Icon && <Icon className="h-6 w-6 text-slate-200" />}
      </div>
      <h3 className="mb-3 text-lg font-black text-slate-900">{title}</h3>
      <p className="text-sm font-medium leading-relaxed text-slate-500">{description}</p>
    </div>
  );
};
