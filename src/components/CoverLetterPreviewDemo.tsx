import React from 'react';
import { Eye, EyeOff, CheckCircle2, FileText, Briefcase, User } from 'lucide-react';

/**
 * DEMO: Enhanced Cover Letter Tool with Live Preview
 * Shows how all input fields are reflected in real-time
 */

export function CoverLetterPreviewDemo() {
  const [formData] = React.useState({
    jobTitle: 'Senior Frontend Developer',
    companyName: 'Tech Innovations Inc.',
    jobDescription: 'We are looking for an experienced Frontend Developer with 5+ years of experience in React, TypeScript, and modern web development. The ideal candidate will lead our frontend team and mentor junior developers.',
    experience: '5 years',
    skills: 'React, TypeScript, Node.js, REST APIs, Responsive Design, Performance Optimization',
  });

  return (
    <div className="bg-white p-8 rounded-lg max-w-4xl">
      <h1 className="text-3xl font-bold mb-8 text-slate-900">Enhanced Cover Letter Preview</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form Summary Preview */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-600" />
            Form Summary Preview
          </h2>

          {/* Job Title */}
          <div className="rounded-lg bg-gradient-to-r from-blue-50 to-blue-50 p-4 border border-blue-100">
            <div className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Job Title</div>
            <div className="text-slate-900 font-semibold">{formData.jobTitle}</div>
          </div>

          {/* Company Name */}
          <div className="rounded-lg bg-gradient-to-r from-orange-50 to-orange-50 p-4 border border-orange-100">
            <div className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Company</div>
            <div className="text-slate-900 font-semibold">{formData.companyName}</div>
          </div>

          {/* Experience & Skills */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-lg bg-gradient-to-r from-purple-50 to-purple-50 p-4 border border-purple-100">
              <div className="text-xs font-bold text-purple-600 uppercase tracking-wider mb-1">Experience</div>
              <div className="text-slate-900 font-semibold text-sm">{formData.experience}</div>
            </div>
            <div className="rounded-lg bg-gradient-to-r from-green-50 to-green-50 p-4 border border-green-100">
              <div className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Skills Count</div>
              <div className="text-slate-900 font-semibold text-sm">
                {formData.skills.split(',').filter(s => s.trim()).length} skills
              </div>
            </div>
          </div>

          {/* Job Description Preview */}
          <div className="rounded-lg bg-gradient-to-r from-pink-50 to-pink-50 p-4 border border-pink-100">
            <div className="text-xs font-bold text-pink-600 uppercase tracking-wider mb-2">Job Description Preview</div>
            <div className="text-slate-700 text-sm max-h-24 overflow-y-auto bg-white rounded p-3 border border-pink-100">
              {formData.jobDescription.substring(0, 200)}...
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 border-l-4 border-blue-500 p-4">
            <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-1">✓ Ready to Generate</div>
            <div className="text-sm text-blue-700">All required fields filled!</div>
          </div>
        </div>

        {/* Generated Letter Preview */}
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-blue-600" />
            Generated Letter Preview
          </h2>

          <div className="rounded-2xl bg-slate-50 p-6 border border-slate-100 shadow-inner max-h-[600px] overflow-y-auto">
            <div className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-slate-700">
{`[Your Name]
[Your Address]
[City, State, Zip]
[Your Email]
[Your Phone Number]
[Date]

Hiring Manager
Tech Innovations Inc.
[Company Address]
[City, State, Zip]

Dear Hiring Manager,

I am writing to express my enthusiasm for the Senior Frontend Developer position at Tech Innovations Inc. With over 5 years of extensive experience in frontend development, particularly with React and TypeScript, I am excited about the opportunity to lead your frontend team.

In my experience with React, TypeScript, Node.js, REST APIs, Responsive Design, and Performance Optimization, I have successfully led teams in building high-performance web applications. My expertise allows me to design solutions that enhance performance...

I am passionate about mentoring junior developers and fostering a collaborative environment. At Tech Innovations, I look forward to sharing my knowledge while learning from diverse perspectives.

I would love to discuss how my background aligns with your goals.

Warm regards,

[Your Name]`}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-bold text-blue-900 mb-3">✨ Key Features of Enhanced Preview:</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>✓ <strong>Real-time Updates:</strong> All input fields update instantly as you type</li>
          <li>✓ <strong>Color-coded Summary:</strong> Different colors for each field (Job Title, Company, Experience, Skills)</li>
          <li>✓ <strong>Live Reflection:</strong> Job title, company name, and skills are immediately reflected in the preview</li>
          <li>✓ <strong>Skills Counter:</strong> Shows how many skills you've entered</li>
          <li>✓ <strong>Job Description Preview:</strong> First 200 characters shown to verify content</li>
          <li>✓ <strong>Generation Ready Status:</strong> Clear indicator when all required fields are complete</li>
          <li>✓ <strong>Toggle Preview:</strong> Hide/show the form summary with the eye icon</li>
          <li>✓ <strong>Generated Letter:</strong> Shows the AI-crafted cover letter side-by-side with form inputs</li>
        </ul>
      </div>
    </div>
  );
}

export default CoverLetterPreviewDemo;
