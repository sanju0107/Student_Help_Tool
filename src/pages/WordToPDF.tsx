import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'motion/react';
import {
  FileType,
  Download,
  AlertCircle,
  CheckCircle2,
  Loader2,
  RotateCcw,
  FileText,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { validateWordFileUpload, getFirstError } from '../lib';
import { TOOLS } from '../constants';
import { convertWordToPDF, formatFileSize } from '../lib/pdfUtils';

export default function WordToPDF() {
  const toolData = TOOLS.find(t => t.id === 'word-to-pdf')!;
  const { name: title, description, seoTitle, seoDescription, seoKeywords } = toolData;

  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/word-to-pdf'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    url: string;
    fileName: string;
    fileSize: number;
    originalSize: number;
  } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateWordFileUpload(selectedFile);
    
    if (!validation.valid) {
      setError(getFirstError(validation) || 'Invalid Word document');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const processConvert = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const pdfBlob = await convertWordToPDF(file);
      
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('PDF generated but appears to be empty.');
      }

      const url = URL.createObjectURL(pdfBlob);
      const pdfFileName = file.name.replace(/\.docx?$/i, '.pdf');

      setResult({
        url,
        fileName: pdfFileName,
        fileSize: pdfBlob.size,
        originalSize: file.size,
      });

      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setError(null);
    setResult(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Convert DOCX to PDF Online Free | CareerSuite</title>
        <meta name="description" content={description + " Convert Word documents (.docx) to PDF with formatting preserved. Free online converter."} />
        <meta name="keywords" content="word to pdf, docx to pdf, convert word to pdf, free pdf converter" />
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
              <ToolCard>
                {!file ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload Word Document"
                    subLabel="Select a .docx file to convert to PDF"
                    accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  />
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center justify-between rounded-[2rem] bg-slate-50 p-8 border border-slate-100">
                      <div className="flex items-center gap-5">
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-inner">
                          <FileType className="h-9 w-9" />
                        </div>
                        <div>
                          <p className="font-black text-slate-900 text-lg truncate max-w-[200px] sm:max-w-xs">{file.name}</p>
                          <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-1">
                            {(file.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      {!result && !isProcessing && (
                        <button
                          onClick={reset}
                          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition-all hover:text-blue-500 border border-slate-100"
                        >
                          <RotateCcw className="h-4 w-4" />
                          CHANGE
                        </button>
                      )}
                    </div>

                    {!result ? (
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                        <button
                          onClick={processConvert}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Converting...
                            </>
                          ) : (
                            'Convert to PDF'
                          )}
                        </button>
                        {!isProcessing && (
                          <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
                            Reset
                          </button>
                        )}
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-[2.5rem] p-10 text-center border bg-emerald-50 border-emerald-100"
                      >
                        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-inner bg-emerald-100 text-emerald-600">
                          <CheckCircle2 className="h-12 w-12" />
                        </div>
                        
                        <h3 className="mb-3 text-3xl font-black text-emerald-900 tracking-tight">Conversion Complete!</h3>
                        <div className="mb-10 space-y-4">
                          <p className="text-emerald-700 font-medium text-lg">Your Word document has been converted to PDF.</p>
                          <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                              <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Original</p>
                              <p className="text-xl font-black text-slate-600">{formatFileSize(result.originalSize).formatted}</p>
                            </div>
                            <ArrowRight className="h-6 w-6 text-emerald-400" />
                            <div className="text-center">
                              <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">PDF</p>
                              <p className="text-3xl font-black text-emerald-600">{formatFileSize(result.fileSize).formatted}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                          <a
                            href={result.url}
                            download={result.fileName}
                            className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                          >
                            <Download className="h-6 w-6" />
                            Download PDF
                          </a>
                          <button onClick={reset} className="btn-secondary px-10 py-5 text-xl">
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl bg-red-50 p-6 border-2 border-red-200"
                >
                  <div className="flex items-start gap-4">
                    <AlertCircle className="h-6 w-6 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-black text-red-900 mb-1">Conversion Error</h3>
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <div>
              <div className="space-y-4">
                <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 p-8 text-white shadow-xl">
                  <h3 className="font-black text-xl mb-4">✨ How It Works</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <div className="font-black mb-1">1. Upload Your Document</div>
                      <p className="text-blue-100">Select any .docx file</p>
                    </div>
                    <div>
                      <div className="font-black mb-1">2. Convert</div>
                      <p className="text-blue-100">Preserves formatting in browser</p>
                    </div>
                    <div>
                      <div className="font-black mb-1">3. Download</div>
                      <p className="text-blue-100">Get your PDF instantly</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <RelatedTools currentToolId="word-to-pdf" />
      </div>
      
      {toolData.faqItems && <FAQ items={toolData.faqItems} />}
    </div>
  );
}
