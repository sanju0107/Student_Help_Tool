import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, CheckCircle, AlertTriangle, Scale, ShieldAlert, Mail } from 'lucide-react';

export default function Terms() {
  const lastUpdated = "March 21, 2026";

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <Helmet>
        <title>Terms of Service - StudentToolBox | User Agreement</title>
        <meta name="description" content="Read our terms of service. Understand your rights and responsibilities when using StudentToolBox's free tools." />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText className="h-8 w-8" />
            </div>
            <h1 className="mb-4 text-4xl font-bold text-slate-900">Terms of Service</h1>
            <p className="text-slate-500">Last Updated: {lastUpdated}</p>
          </div>

          <div className="space-y-12 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm sm:p-12">
            {/* Acceptance of Terms */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                By accessing or using StudentToolBox, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            {/* Description of Service */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Scale className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Description of Service</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                StudentToolBox provides a variety of free online tools for image processing, PDF manipulation, student calculations, and AI-powered content generation. We reserve the right to modify or discontinue any part of the service at any time without notice.
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <ShieldAlert className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">User Responsibilities</h2>
              </div>
              <ul className="list-disc pl-6 space-y-4 text-slate-600 leading-relaxed">
                <li><strong>Lawful Use:</strong> You agree to use our tools only for lawful purposes and in accordance with these Terms.</li>
                <li><strong>No Misuse:</strong> You must not attempt to interfere with the proper working of the site or bypass any security measures.</li>
                <li><strong>Content Ownership:</strong> You retain ownership of any content you process using our tools. We do not claim any rights to your files.</li>
              </ul>
            </section>

            {/* Disclaimer of Warranties */}
            <section className="rounded-2xl bg-amber-50 p-8 border border-amber-100">
              <div className="flex items-center gap-3 mb-4 text-amber-700">
                <AlertTriangle className="h-6 w-6" />
                <h2 className="text-xl font-bold">Disclaimer of Warranties</h2>
              </div>
              <p className="text-amber-900 leading-relaxed font-medium">
                StudentToolBox is provided "as is" and "as available" without any warranties of any kind. We do not guarantee that the tools will be error-free or that the results will meet your specific requirements. Use of our tools is at your own risk.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Scale className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Limitation of Liability</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                In no event shall StudentToolBox or its creators be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of our services.
              </p>
            </section>

            {/* Contact Us */}
            <section className="border-t border-slate-100 pt-12">
              <div className="flex items-center gap-3 mb-6 text-slate-900">
                <Mail className="h-6 w-6 text-blue-600" />
                <h2 className="text-2xl font-bold">Contact Us</h2>
              </div>
              <p className="text-slate-600 leading-relaxed">
                If you have any questions about these Terms of Service, please contact us at:
              </p>
              <div className="mt-4 font-bold text-blue-600">
                terms@studenttoolbox.com
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
