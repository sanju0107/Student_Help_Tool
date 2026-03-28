/**
 * FAQ Component
 * Reusable FAQ section with accordion functionality
 */

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  items: FAQItem[];
  title?: string;
  schema?: boolean;
}

export default function FAQ({ items, title = 'Frequently Asked Questions', schema = true }: FAQProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  // Generate structured data for FAQ
  const structuredData = schema
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer
          }
        }))
      }
    : null;

  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
          {title}
        </h2>
        <p className="mb-8 text-slate-600">
          Find answers to common questions about this tool
        </p>

        <div className="max-w-3xl space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-slate-200 transition-all hover:border-blue-300"
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="flex w-full items-center justify-between bg-white px-4 py-4 text-left sm:px-6 sm:py-5"
              >
                <h3 className="font-semibold text-slate-900">
                  {item.question}
                </h3>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 text-slate-500 transition-transform ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-200 bg-slate-50 px-4 py-4 text-slate-600 sm:px-6 sm:py-5">
                      {item.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Render structured data */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </section>
  );
}
