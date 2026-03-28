/**
 * How to Use Section Component
 * Reusable component for displaying tool usage steps and use cases
 */

import React from 'react';
import { CheckCircle2, Briefcase } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface UseCase {
  title: string;
  icon?: React.ReactNode;
}

interface HowToUseSectionProps {
  steps: Step[];
  useCases?: UseCase[];
}

export default function HowToUseSection({
  steps,
  useCases = []
}: HowToUseSectionProps) {
  return (
    <>
      {/* How to Use Steps */}
      <section className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
            How to Use
          </h2>
          <p className="mb-8 text-slate-600">
            Follow these simple steps to get the most from this tool
          </p>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6"
              >
                <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-lg font-bold text-white">
                  {index + 1}
                </div>
                <h3 className="mb-2 font-semibold text-slate-900">
                  {step.title}
                </h3>
                <p className="text-sm text-slate-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      {useCases.length > 0 && (
        <section className="bg-slate-50 py-12 sm:py-16">
          <div className="container mx-auto px-4">
            <h2 className="mb-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Common Use Cases
            </h2>
            <p className="mb-8 text-slate-600">
              This tool is perfect for a variety of scenarios
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 rounded-lg bg-white p-4 sm:p-6"
                >
                  <CheckCircle2 className="mt-1 h-5 w-5 flex-shrink-0 text-green-600" />
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {useCase.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
