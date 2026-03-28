import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FileText, 
  FileType, 
  Download, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  RotateCcw, 
  Loader2,
  Zap,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as pdfjsLib from 'pdfjs-dist';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function DocConverter() {
  const toolData = TOOLS.find(t => t.id === 'pdf-to-word')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/to-word'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResultBlob(null);
  };

  const processConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      
      const docSections = [];
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const textItems = textContent.items.map((item: any) => item.str).join(' ');
        
        docSections.push({
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun(textItems),
              ],
            }),
          ],
        });
      }

      const doc = new Document({
        sections: docSections,
      });

      const blob = await Packer.toBlob(doc);
      setResultBlob(blob);
      
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7', '#10b981', '#f59e0b']
      });
    } catch (err) {
      console.error(err);
      setError('Failed to convert PDF. The file might be complex or protected.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!resultBlob || !file) return;
    const url = URL.createObjectURL(resultBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file.name.replace('.pdf', '')}.docx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setFile(null);
    setResultBlob(null);
    setError(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Convert PDF to Word Online Free | CareerSuite</title>
        <meta name="description" content={description + " Transform your PDF documents into editable Word files while preserving layout and formatting."} />
        <meta name="keywords" content="pdf to word, convert pdf to docx, free pdf to word converter, online document converter, pdf to editable word" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={FileText}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                {!file ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload PDF to Convert"
                    subLabel="Select a PDF file to transform into Word"
                    accept=".pdf"
                  />
                ) : (
                  <div className="space-y-10">
                    <div className="flex items-center justify-between rounded-[2.5rem] bg-slate-50 p-10 border-2 border-slate-100 shadow-inner">
                      <div className="flex items-center gap-6">
                        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 shadow-sm border border-red-100">
                          <FileText className="h-10 w-10" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-xl truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-2">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {!resultBlob && !isProcessing && (
                        <button
                          onClick={reset}
                          className="flex items-center gap-3 rounded-2xl bg-white px-6 py-3 text-sm font-black text-slate-600 shadow-sm transition-all hover:text-red-500 border border-slate-200 hover:border-red-200"
                        >
                          <RotateCcw className="h-4 w-4" />
                          CHANGE
                        </button>
                      )}
                    </div>

                    {!resultBlob ? (
                      <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-100">
                        <button
                          onClick={processConvert}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin" />
                              Converting to Word...
                            </>
                          ) : (
                            <>
                              <Zap className="h-6 w-6" />
                              Convert to Word Now
                            </>
                          )}
                        </button>
                        {!isProcessing && (
                          <button onClick={reset} className="btn-secondary px-12 py-5 text-xl">
                            Reset
                          </button>
                        )}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[3rem] bg-emerald-50 p-12 text-center border-2 border-emerald-100 shadow-xl shadow-emerald-500/5"
                      >
                        <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner border-4 border-white">
                          <CheckCircle2 className="h-14 w-14" />
                        </div>
                        <h3 className="mb-4 text-4xl font-black text-emerald-900 tracking-tight">Conversion Successful!</h3>
                        <p className="mb-12 text-emerald-700 font-medium text-xl">Your editable Word document is ready for download.</p>
                        <div className="flex flex-wrap gap-4">
                          <button
                            onClick={handleDownload}
                            className="btn-primary flex-1 py-6 text-2xl flex items-center justify-center gap-4 bg-emerald-600 hover:bg-emerald-700 shadow-xl shadow-emerald-600/30"
                          >
                            <Download className="h-8 w-8" />
                            Download Word Doc
                          </button>
                          <button onClick={reset} className="btn-secondary px-12 py-6 text-xl bg-white">
                            Convert Another
                          </button>
                        </div>
                      </motion.div>
                    )}
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

              {longDescription && (
                <ToolCard className="prose prose-slate max-w-none">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                      <Info className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-900 mb-3">How it works</h3>
                      <p className="text-slate-600 leading-relaxed font-medium">{longDescription}</p>
                    </div>
                  </div>
                </ToolCard>
              )}
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Why use our converter?</h3>
                <ul className="space-y-8">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-wide">Preserve Layout</p>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Maintains tables, columns, and graphics.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm tracking-wide">100% Secure</p>
                      <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">Files are processed locally in your browser.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload PDF" 
                  description="Select the document you want to edit."
                  icon={FileText}
                />
                <ToolStep 
                  number={2} 
                  title="Convert" 
                  description="Wait while we transform the layout."
                  icon={Zap}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your editable .docx file instantly."
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
