import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Scissors, Download, AlertCircle, Info, FileType, Loader2, RotateCcw, CheckCircle2, ShieldCheck } from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function SplitPDF() {
  const toolData = TOOLS.find(t => t.id === 'split-pdf')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/split'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitRanges, setSplitRanges] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = async (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setTotalPages(pdfDoc.getPageCount());
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    } catch (err) {
      setError('Failed to load PDF. The file might be corrupted.');
    }
  };

  const processSplit = async () => {
    if (!file || !splitRanges) {
      setError('Please select a file and enter page ranges.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const total = pdfDoc.getPageCount();

      const ranges = splitRanges.split(',').map(r => r.trim());
      const pagesToExtract: number[] = [];

      for (const range of ranges) {
        if (range.includes('-')) {
          const parts = range.split('-');
          if (parts.length !== 2) continue;
          const start = parseInt(parts[0].trim());
          const end = parseInt(parts[1].trim());
          
          if (!isNaN(start) && !isNaN(end)) {
            const actualStart = Math.max(1, Math.min(start, end));
            const actualEnd = Math.min(total, Math.max(start, end));
            for (let i = actualStart; i <= actualEnd; i++) {
              pagesToExtract.push(i - 1);
            }
          }
        } else {
          const page = parseInt(range.trim());
          if (!isNaN(page) && page >= 1 && page <= total) {
            pagesToExtract.push(page - 1);
          }
        }
      }

      // Remove duplicates and sort
      const uniquePages = Array.from(new Set(pagesToExtract)).sort((a, b) => a - b);

      if (uniquePages.length === 0) {
        throw new Error('No valid pages found in the specified range.');
      }

      const newPdfDoc = await PDFDocument.create();
      const copiedPages = await newPdfDoc.copyPages(pdfDoc, uniquePages);
      copiedPages.forEach(page => newPdfDoc.addPage(page));

      const pdfBytes = await newPdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `split_${file.name}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to split PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setSplitRanges('');
    setError(null);
    setTotalPages(null);
    setSuccess(false);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{seoData.helmet.title}</title>
        {seoData.helmet.meta.map((meta, idx) => (
          <meta key={idx} {...meta} />
        ))}
        {seoData.helmet.link.map((link, idx) => (
          <link key={idx} {...link} />
        ))}
        <script type="application/ld+json">
          {JSON.stringify(seoData.structuredData)}
        </script>
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          {/* SEO H1 Section */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black text-slate-900 sm:text-5xl">
              {seoTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              {intro}
            </p>
          </div>
          <ToolHeader 
            title={title}
            description={description}
            icon={Scissors}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                {!file ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload PDF to Split"
                    subLabel="Select a PDF file to extract pages"
                    accept=".pdf"
                  />
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-8 border border-slate-100">
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-500 shadow-inner">
                          <FileText className="h-9 w-9" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-1">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • {totalPages} Pages
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={reset}
                        className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition-all hover:text-red-500 border border-slate-100"
                      >
                        <RotateCcw className="h-4 w-4" />
                        CHANGE
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                          Page Ranges to Extract
                        </label>
                        <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider bg-blue-50 px-3 py-1.5 rounded-xl">
                          Example: 1-5, 8, 11-15
                        </span>
                      </div>
                      <div className="relative group">
                        <input
                          type="text"
                          value={splitRanges}
                          onChange={(e) => {
                            setSplitRanges(e.target.value);
                            setSuccess(false);
                          }}
                          placeholder="e.g., 1-3, 5, 7-10"
                          className="w-full rounded-[1.5rem] border-2 border-slate-200 px-8 py-5 text-xl font-black focus:border-blue-500 focus:outline-none transition-all placeholder:text-slate-300 group-hover:border-slate-300 shadow-sm"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2">
                          <FileType className="h-7 w-7 text-slate-300 group-hover:text-blue-400 transition-colors" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 leading-relaxed px-2 font-medium">
                        Use commas to separate ranges or single pages. Total pages in this document: <span className="font-black text-slate-900">{totalPages}</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                      <button
                        onClick={processSplit}
                        disabled={isProcessing || !splitRanges}
                        className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                      >
                        {isProcessing ? 'Splitting PDF...' : success ? 'Split Successful!' : 'Split & Download'}
                      </button>
                      {!isProcessing && (
                        <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </ToolCard>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-4 rounded-3xl bg-red-50 p-6 text-red-600 border border-red-100"
                >
                  <AlertCircle className="h-6 w-6 shrink-0" />
                  <p className="font-black text-lg">{error}</p>
                </motion.div>
              )}

              <ToolCard className="prose prose-slate max-w-none">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">About PDF Splitting</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Need only a few pages from a large PDF? Our split tool allows you to precisely extract any combination of pages. 
                      Whether it's a single page or multiple ranges, you can get exactly what you need in seconds.
                      <br /><br />
                      All processing happens locally in your browser, ensuring your documents are never uploaded to any server.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Why use our tool?</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Precise Extraction</p>
                      <p className="text-xs text-slate-400 mt-1">Get exactly the pages you need.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">100% Private</p>
                      <p className="text-xs text-slate-400 mt-1">Files never leave your device.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Select the PDF file you want to split."
                  icon={FileText}
                />
                <ToolStep 
                  number={2} 
                  title="Ranges" 
                  description="Specify which pages you want to keep."
                  icon={Scissors}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your extracted pages as a new PDF."
                  icon={Download}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <HowToUseSection steps={howToSteps} useCases={useCases} />
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="split-pdf" />
        </div>
      </div>
    </div>
  );
}
