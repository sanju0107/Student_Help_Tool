/**
 * Related Tools Component
 * Displays internal links to related tools for SEO and user engagement
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { TOOLS } from '../constants';

interface RelatedToolsProps {
  currentToolId: string;
  limit?: number;
}

export default function RelatedTools({
  currentToolId,
  limit = 4
}: RelatedToolsProps) {
  const currentTool = TOOLS.find(t => t.id === currentToolId);

  if (!currentTool) return null;

  // Get related tools from same category
  const relatedTools = TOOLS.filter(
    tool =>
      tool.category === currentTool.category &&
      tool.id !== currentToolId
  ).slice(0, limit);

  // If not enough tools in same category, add tools from other categories
  if (relatedTools.length < limit) {
    const remainingLimit = limit - relatedTools.length;
    const otherTools = TOOLS.filter(
      tool =>
        tool.category !== currentTool.category &&
        !relatedTools.find(rt => rt.id === tool.id)
    ).slice(0, remainingLimit);
    relatedTools.push(...otherTools);
  }

  if (relatedTools.length === 0) return null;

  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          More Useful Tools
        </h2>
        <p className="mb-8 text-slate-600">
          Explore other tools that can help with your needs
        </p>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {relatedTools.map(tool => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                to={tool.path}
                className="group rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md sm:p-6"
              >
                <div className="mb-3 inline-block rounded-lg bg-blue-50 p-3 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mb-2 line-clamp-2 font-semibold text-slate-900 group-hover:text-blue-600">
                  {tool.name}
                </h3>
                <p className="mb-4 line-clamp-2 text-sm text-slate-600">
                  {tool.description}
                </p>
                <div className="inline-flex items-center text-sm font-medium text-blue-600 opacity-0 transition-all group-hover:opacity-100">
                  Explore <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
