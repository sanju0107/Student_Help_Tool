import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import {
  FileType,
  Download,
  AlertCircle,
  Info,
  CheckCircle2,
  Loader2,
  RotateCcw,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function WordToPDF() {
  const toolData = TOOLS.find(t => t.id === 'word-to-pdf')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;

  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/word-to-pdf'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(true);

  const handleFileSelect = (selectedFile: File) => {
    if (!['application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(selectedFile.type) &&
        !selectedFile.name.endsWith('.docx')) {
      setError('Please select a valid .docx (Word) file.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setShowInfo(true);
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setShowInfo(true);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Convert DOCX to PDF Online | CareerSuite</title>
        <meta name="description" content={description + " Convert Microsoft Word documents (.docx) to PDF with formatting preserved."} />
        <meta name="keywords" content="word to pdf, docx to pdf, convert word to pdf, free pdf converter, doc to pdf" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={FileType}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {/* Important Notice */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl bg-amber-50 p-6 border-2 border-amber-200"
              >
                <div className="flex items-start gap-4">
                  <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-black text-amber-900 mb-2">Browser Limitation</h3>
                    <p className="text-sm font-medium text-amber-800 leading-relaxed mb-3">
                      True DOCX to PDF conversion with full formatting preservation requires server-side processing, 
                      which web browsers cannot perform directly. This tool provides recommended alternatives.
                    </p>
                  </div>
                </div>
              </motion.div>

              <ToolCard>
                <div className="space-y-8">
                  {/* Solution 1: Online Converters */}
                  <div className="border-b border-slate-200 pb-8">
                    <h3 className="font-black text-slate-900 text-lg mb-4 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      Recommended: Use Online Converters
                    </h3>
                    <p className="text-slate-600 mb-4 font-medium">
                      These services handle conversion on their servers and preserve full formatting:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        {
                          name: 'Smallpdf',
                          url: 'https://smallpdf.com/word-to-pdf',
                          desc: 'Fast and free, with formatting preserved'
                        },
                        {
                          name: 'ILovePDF',
                          url: 'https://www.ilovepdf.com/word_to_pdf',
                          desc: 'Easy interface, good quality'
                        },
                        {
                          name: 'Online-Convert',
                          url: 'https://document.online-convert.com/convert-to-pdf',
                          desc: 'Multiple document formats'
                        },
                        {
                          name: 'CloudConvert',
                          url: 'https://cloudconvert.com/docx-to-pdf',
                          desc: 'Professional service, batch processing'
                        }
                      ].map((service) => (
                        <a
                          key={service.name}
                          href={service.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-black text-slate-900">{service.name}</h4>
                            <ExternalLink className="h-4 w-4 text-slate-400 group-hover:text-blue-600" />
                          </div>
                          <p className="text-xs text-slate-600">{service.desc}</p>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Solution 2: Microsoft Options */}
                  <div className="border-b border-slate-200 pb-8">
                    <h3 className="font-black text-slate-900 text-lg mb-4">Alternative: Use Microsoft Tools</h3>
                    <div className="space-y-3">
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="font-black text-slate-900 mb-2">Microsoft Word (Desktop)</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Built-in "Save As PDF" or "Export as PDF" feature - includes all formatting
                        </p>
                        <p className="text-xs text-slate-500">Open → File → Export As → Create PDF</p>
                      </div>
                      <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                        <h4 className="font-black text-slate-900 mb-2">Microsoft 365 Online</h4>
                        <p className="text-sm text-slate-600 mb-3">
                          Upload to OneDrive/SharePoint, open in Word Online, then export to PDF
                        </p>
                        <p className="text-xs text-slate-500">website.com/office → Free with Microsoft account</p>
                      </div>
                    </div>
                  </div>

                  {/* Solution 3: LocalAPI (Future) */}
                  <div>
                    <h3 className="font-black text-slate-900 text-lg mb-4">Future: Native Browser Support</h3>
                    <p className="text-slate-600 font-medium text-sm">
                      We're monitoring progress on native browser APIs for document conversion. 
                      For now, server-side conversion provides the most reliable and feature-rich solution.
                    </p>
                  </div>
                </div>
              </ToolCard>

              <ToolCard className="prose prose-slate max-w-none">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">Why This Isn't Client-Side</h3>
                    <div className="text-slate-600 leading-relaxed font-medium space-y-3">
                      <p>
                        Unlike image or PDF operations, converting DOCX to PDF with formatting requires:
                      </p>
                      <ul className="list-disc list-inside space-y-2">
                        <li>Parsing Microsoft's complex DOCX XML format</li>
                        <li>Rendering fonts, colors, and layout exactly</li>
                        <li>Font subsetting and embedding</li>
                        <li>Complex layout calculations</li>
                      </ul>
                      <p>
                        <strong>In-browser attempt:</strong> Would add 1-2MB of code and can't match professional quality.
                      </p>
                      <p>
                        <strong>Our recommendation:</strong> Use the proven services listed above for best results.
                      </p>
                    </div>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-blue-600 p-10 text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Quick Comparison</h3>
                <div className="space-y-6 text-sm">
                  <div>
                    <h4 className="font-black mb-1">✓ Online Services</h4>
                    <p className="text-blue-100">Perfect formatting, fast, reliable</p>
                  </div>
                  <div>
                    <h4 className="font-black mb-1">✓ Microsoft Word</h4>
                    <p className="text-blue-100">100% accurate, integrated</p>
                  </div>
                  <div>
                    <h4 className="font-black mb-1">⚠ Browser-only</h4>
                    <p className="text-blue-100">Can't preserve complex layouts</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Choose Method" 
                  description="Pick online service or Microsoft tool"
                  icon={CheckCircle2}
                />
                <ToolStep 
                  number={2} 
                  title="Upload" 
                  description="Select your .docx file"
                  icon={FileType}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your formatted PDF"
                  icon={Download}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
