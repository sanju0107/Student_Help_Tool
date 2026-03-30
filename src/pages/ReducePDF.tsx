import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { FileText, Minimize2, Download, AlertCircle, Info, CheckCircle2, Zap, Loader2, RotateCcw, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';
import { compressPDF, formatFileSize, calculateCompressionRatio } from '../lib/pdfUtils';

export default function ReducePDF() {
  const toolData = TOOLS.find(t => t.id === 'reduce-pdf')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/pdf/reduce'
  });

  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ 
    url: string; 
    originalSize: number; 
    compressedSize: number; 
    ratio: number;
    originalFormatted: string;
    compressedFormatted: string;
  } | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile.type !== 'application/pdf') {
      setError('Please select a valid PDF file.');
      return;
    }
    setFile(selectedFile);
    setError(null);
    setResult(null);
  };

  const processReduce = async () => {
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      
      // Use improved compression utility
      const { blob, originalSize, compressedSize, ratio } = await compressPDF(arrayBuffer);
      
      // Check if compression actually happened
      if (ratio <= 0) {
        setError(
          'This PDF could not be compressed further. The file is already well-optimized. ' +
          'PDFs with text-only content have limited compression potential since they are typically already optimized.'
        );
        setIsProcessing(false);
        return;
      }
      
      const url = URL.createObjectURL(blob);
      const originalFormatted = formatFileSize(originalSize).formatted;
      const compressedFormatted = formatFileSize(compressedSize).formatted;
      
      setResult({ 
        url, 
        originalSize, 
        compressedSize, 
        ratio,
        originalFormatted,
        compressedFormatted
      });
      
      // Show celebration only if significant compression occurred
      if (ratio >= 5) {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#2dd4bf', '#a855f7']
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reduce PDF.');
    } finally {
      setIsProcessing(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Compress PDF Online Free | CareerSuite</title>
        <meta name="description" content={description + " Compress your PDF documents for free. Reduce file size for email attachments and uploads while maintaining quality."} />
        <meta name="keywords" content="compress pdf, reduce pdf size, online pdf compressor, free pdf tool, shrink pdf file" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={Minimize2}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                {!file ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload PDF to Compress"
                    subLabel="Select a PDF file to reduce its size"
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
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      {!result && !isProcessing && (
                        <button
                          onClick={reset}
                          className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-black text-slate-600 shadow-sm transition-all hover:text-red-500 border border-slate-100"
                        >
                          <RotateCcw className="h-4 w-4" />
                          CHANGE
                        </button>
                      )}
                    </div>

                    {!result ? (
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                        <button
                          onClick={processReduce}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              Compressing...
                            </>
                          ) : (
                            'Compress PDF Now'
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
                        className={`rounded-[2.5rem] p-10 text-center border ${
                          result.ratio > 0
                            ? 'bg-emerald-50 border-emerald-100'
                            : 'bg-yellow-50 border-yellow-100'
                        }`}
                      >
                        <div className={`mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full shadow-inner ${
                          result.ratio > 0
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          {result.ratio > 0 ? (
                            <CheckCircle2 className="h-12 w-12" />
                          ) : (
                            <AlertTriangle className="h-12 w-12" />
                          )}
                        </div>
                        
                        {result.ratio > 0 ? (
                          <>
                            <h3 className="mb-3 text-3xl font-black text-emerald-900 tracking-tight">Compression Complete!</h3>
                            <div className="mb-10 space-y-4">
                              <p className="text-emerald-700 font-medium text-lg">Your PDF has been optimized.</p>
                              <div className="flex items-center justify-center gap-12">
                                <div className="text-center">
                                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Original</p>
                                  <p className="text-xl font-black text-slate-600">{result.originalFormatted}</p>
                                </div>
                                <ArrowRight className="h-6 w-6 text-emerald-400" />
                                <div className="text-center">
                                  <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-1">Compressed</p>
                                  <p className="text-3xl font-black text-emerald-600">{result.compressedFormatted}</p>
                                </div>
                              </div>
                              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-200/50 px-5 py-2 text-xs font-black text-emerald-700 uppercase tracking-wider">
                                <Zap className="h-4 w-4 fill-current" />
                                {result.ratio}% Smaller
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <h3 className="mb-3 text-3xl font-black text-yellow-900 tracking-tight">No Compression Needed</h3>
                            <div className="mb-10 space-y-4">
                              <p className="text-yellow-700 font-medium text-lg">This PDF is already optimized.</p>
                              <div className="text-center">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">File Size</p>
                                <p className="text-2xl font-black text-slate-600">{result.originalFormatted}</p>
                              </div>
                              <p className="text-sm text-yellow-700 leading-relaxed">
                                PDFs with text-only content are typically already well-optimized. 
                                Further compression is not possible without quality loss. 
                                Consider checking for unnecessary images or metadata in the source document.
                              </p>
                            </div>
                          </>
                        )}
                        
                        <div className="flex flex-wrap gap-4">
                          {result.ratio > 0 && (
                            <a
                              href={result.url}
                              download={`compressed_${file.name}`}
                              className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20"
                            >
                              <Download className="h-6 w-6" />
                              Download Compressed
                            </a>
                          )}
                          <button onClick={reset} className={`${result.ratio > 0 ? 'btn-secondary' : 'btn-primary flex-1'} px-10 py-5 text-xl`}>
                            {result.ratio > 0 ? 'Compress Another' : 'Back'}
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

              <ToolCard className="prose prose-slate max-w-none">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-3">About PDF Compression</h3>
                    <div className="text-slate-600 leading-relaxed font-medium space-y-3">
                      <p>
                        PDF compression works by optimizing internal PDF structure and removing unnecessary metadata. 
                        This is most effective for PDFs that have been created with unoptimized settings.
                      </p>
                      <p>
                        <strong>What this tool does:</strong> Reorganizes PDF streams and removes metadata to reduce file size.
                      </p>
                      <p>
                        <strong>Browser limitation:</strong> True image compression (downsampling/resampling) requires 
                        computational resources beyond browser capabilities and is best done on a server.
                      </p>
                      <p>
                        <strong>Text-only PDFs:</strong> Already optimized and typically won't compress further. 
                        If you see "No Compression Needed," your PDF is already well-optimized.
                      </p>
                      <p className="text-xs text-slate-500">
                        All processing happens on your device. Your files are never uploaded or stored anywhere.
                      </p>
                    </div>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Why compress?</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Faster Sharing</p>
                      <p className="text-xs text-slate-400 mt-1">Smaller files upload and send much faster.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">100% Secure</p>
                      <p className="text-xs text-slate-400 mt-1">Your files are processed locally and never stored.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Select your large PDF file."
                  icon={FileText}
                />
                <ToolStep 
                  number={2} 
                  title="Compress" 
                  description="We optimize images and metadata."
                  icon={Zap}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your smaller PDF instantly."
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
