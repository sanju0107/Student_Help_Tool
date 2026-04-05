import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: string;
  badges?: string[];
}

export const ToolHeader: React.FC<ToolHeaderProps> = ({ 
  title, 
  description, 
  icon: Icon, 
  iconColor = 'text-blue-600', 
  iconBg = 'bg-blue-50',
  badge,
  badges = []
}) => {
  const allBadges = badge ? [badge, ...badges] : badges;
  const gradientBg = `linear-gradient(135deg, ${iconBg} 0%, rgba(59, 130, 246, 0.05) 100%)`;
  
  return (
    <div className="mb-16 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
              'radial-gradient(circle at 40% 20%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute inset-0"
        />
      </div>

      <div className="text-center py-8">
        {/* Icon Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-8 inline-flex"
        >
          <div className={`relative inline-flex h-24 w-24 items-center justify-center rounded-2xl ${iconBg} ${iconColor} shadow-xl`}>
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 rounded-2xl opacity-30 bg-gradient-to-br"
            />
            <Icon className="h-12 w-12 relative z-10" />
          </div>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="mb-3 text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-600 to-slate-900">
              {title}
            </span>
          </h1>
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mx-auto max-w-3xl text-lg md:text-xl font-medium text-slate-600 mb-6"
        >
          {description}
        </motion.p>

        {/* Badges */}
        {allBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-2"
          >
            {allBadges.map((badgeText, idx) => (
              <motion.span
                key={idx}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 text-xs font-bold text-blue-700 shadow-sm hover:shadow-md transition-all hover:scale-105"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {badgeText}
              </motion.span>
            ))}
          </motion.div>
        )}
      </div>
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
