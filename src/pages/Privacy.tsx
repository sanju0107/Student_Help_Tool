import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Eye, Database, Globe, Mail } from 'lucide-react';

export default function Privacy() {
  const lastUpdated = "March 21, 2026";

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>Privacy Policy - CareerSuite | Your Data is Secure</title>
        <meta name="description" content="Read our privacy policy. We prioritize your data privacy with client-side processing for all image and PDF tools." />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Shield className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-slate-500">Last Updated: {lastUpdated}</p>
          </div>

          <div className="space-y-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            {/* Core Principle */}
            <section className="rounded-2xl bg-blue-50 p-8 border border-blue-100">
              <div className="flex items-center gap-3 mb-4 text-blue-700">
                <Lock className="h-6 w-6" />
                <h2 className="text-xl font-bold">Our Core Privacy Principle</h2>
              </div>
              <p className="text-blue-900 leading-relaxed font-medium">
                CareerSuite is designed with a "Privacy-First" architecture. 100% of the image and PDF processing (compression, resizing, merging, etc.) happens directly in your web browser. Your sensitive documents and photos are never uploaded to our servers.
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Eye className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Information We Collect</h2>
              </div>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  We do not require user accounts for most of our tools. We do not collect personal information like your name, address, or phone number unless you explicitly provide it (e.g., when using the Resume Builder or contacting us).
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Usage Data:</strong> We collect anonymous usage statistics (e.g., which tools are most popular) to improve our services.</li>
                  <li><strong>Cookies:</strong> We use essential cookies to maintain your session and preferences.</li>
                  <li><strong>AI Tools:</strong> When using AI-powered tools (Resume/Cover Letter), the text you provide is processed by Google's Gemini API to generate results.</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Database className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">How We Use Information</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                Any information collected is used solely to:
              </p>
              <ul className="mt-4 list-disc pl-6 space-y-2 text-slate-600">
                <li>Provide and maintain our free tools.</li>
                <li>Improve the user experience and tool performance.</li>
                <li>Respond to your support requests or feedback.</li>
                <li>Ensure the security and integrity of our platform.</li>
              </ul>
            </section>

            {/* Third-Party Services */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Globe className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Third-Party Services</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We use Google Analytics for anonymous traffic analysis and Google Gemini API for our AI features. These services have their own privacy policies which we encourage you to review.
              </p>
            </section>

            {/* Contact Us */}
            <section className="border-t border-slate-100 pt-12">
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Contact Us</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 font-bold text-blue-600">
                privacy@careersuite.com
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
