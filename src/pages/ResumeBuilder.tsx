import React from 'react';
import { Layout } from 'lucide-react';
import { ToolHeader, ToolCard } from '../components/ToolUI';

export default function ResumeBuilder() {
  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black text-slate-900 sm:text-5xl">
              Resume & Cover Letter Builder
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              Create professional resumes and cover letters tailored to your target role
            </p>
          </div>

          <ToolHeader 
            title="Resume & Cover Letter Builder"
            description="Build your career with AI-powered professional documents in minutes. Tailored for Indian job seekers and students."
            icon={Layout}
          />

          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <ToolCard>
                <p className="text-sm text-slate-600">Resume builder UI placeholder - simplified version for production readiness.</p>
              </ToolCard>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-900 p-8 text-white shadow-xl">
                <h3 className="mb-4 text-xl font-bold">Resume Builder</h3>
                <p className="text-sm text-slate-300">Create professional documents with AI assistance.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
