import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  Eraser, 
  ShieldCheck, 
  Info, 
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Zap,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { validateImageFileUpload, getFirstError, removeImageBackground, formatFileSize } from '../lib';
import { TOOLS } from '../constants';

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  stage: string;
}

export default function BackgroundRemover() {
  const toolData = TOOLS.find(t => t.id === 'background-remover')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;
  
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/image/background-remover'
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<{ blob: Blob; url: string } | null>(null);
  const [processing, setProcessing] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    stage: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    const validation = validateImageFileUpload(selectedFile);
    
    if (!validation.valid) {
      setError(getFirstError(validation) || 'Invalid image file');
      return;
    }

    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResult(null);
    setSuccess(false);
    setError(null);
    setProcessing({ isProcessing: false, progress: 0, stage: '' });
  };

  const handleProcess = async () => {
    if (!file || processing.isProcessing) return;

    setProcessing({ isProcessing: true, progress: 0, stage: 'Starting...' });
    setError(null);

    try {
      const removalResult = await removeImageBackground(file, {
        maxRetries: 2,
        onProgress: (progress, stage) => {
          setProcessing({ isProcessing: true, progress, stage });
        },
        maxImageWidth: 1024,
        quality: 0.8
      });

      if (!removalResult.success) {
        setError(removalResult.error || 'Background removal failed');
        setProcessing({ isProcessing: false, progress: 0, stage: '' });
        return;
      }

      // Create URL from blob
      const url = URL.createObjectURL(removalResult.blob);
      setResult({ blob: removalResult.blob, url });
      setSuccess(true);

      // Celebration animation
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });

      setProcessing({ isProcessing: false, progress: 100, stage: 'Complete!' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(`Failed to remove background: ${message}`);
      setProcessing({ isProcessing: false, progress: 0, stage: '' });
    }
  };

  const handleDownload = () => {
    if (!result || !file) return;

    const link = document.createElement('a');
    link.href = result.url;
    link.download = `no-bg-${file.name.split('.')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setSuccess(false);
    setError(null);
    setProcessing({ isProcessing: false, progress: 0, stage: '' });
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
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 text-4xl font-black text-slate-900 sm:text-5xl">
              {seoTitle}
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-slate-600 leading-relaxed">
              {intro}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={result?.url || preview}
                  fileName={file?.name}
                  isProcessing={processing.isProcessing}
                  status={processing.stage}
                  progress={processing.progress}
                  label="Upload Image to Remove Background"
                  subLabel="Supports JPG, PNG, WEBP (Max 10MB)"
                />

                <AnimatePresence>
                  {file && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-10 space-y-8"
                    >
                      {/* Processing Progress */}
                      {processing.isProcessing && (
                        <motion.div 
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                            <span className="text-sm font-semibold text-slate-600">{processing.stage}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full overflow-hidden h-2">
                            <motion.div 
                              className="bg-gradient-to-r from-blue-600 to-cyan-500 h-full"
                              initial={{ width: 0 }}
                              animate={{ width: `${processing.progress}%` }}
                              transition={{ ease: "easeInOut" }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 text-right">{processing.progress}%</p>
                        </motion.div>
                      )}

                      {/* Success State */}
                      {success && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-3 rounded-2xl bg-green-50 p-4 text-green-700 border border-green-200"
                        >
                          <CheckCircle2 className="h-5 w-5 shrink-0" />
                          <div>
                            <p className="font-semibold text-sm">Background removed successfully!</p>
                            <p className="text-xs text-green-600 mt-1">Original: {formatFileSize(file.size)} → Result: {result ? formatFileSize(result.blob.size) : '0 B'}</p>
                          </div>
                        </motion.div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                        {!success ? (
                          <button
                            onClick={handleProcess}
                            disabled={processing.isProcessing}
                            className="btn-primary flex-1 py-5 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processing.isProcessing ? 'Processing...' : 'Remove Background'}
                          </button>
                        ) : (
                          <button
                            onClick={handleDownload}
                            className="btn-primary flex-1 py-5 text-lg font-semibold flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 hover:shadow-xl"
                          >
                            <Download className="h-6 w-6" /> Download PNG
                          </button>
                        )}
                        <button
                          onClick={reset}
                          disabled={processing.isProcessing}
                          className="btn-secondary px-8 py-5 text-lg font-semibold disabled:opacity-50"
                        >
                          Clear
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </ToolCard>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-start gap-4 rounded-2xl bg-red-50 p-6 text-red-600 border border-red-200"
                  >
                    <AlertCircle className="h-6 w-6 shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-sm mb-1">Error</p>
                      <p className="text-sm leading-relaxed">{error}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* How It Works */}
              <ToolCard>
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 shrink-0">
                    <Info className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">How it works</h3>
                    <p className="text-slate-600 leading-relaxed text-sm">
                      Our AI-powered background remover uses advanced neural networks to accurately detect and separate subjects from backgrounds. 
                      The process is optimized for speed and reliability with automatic retries. All processing happens securely in your browser.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="rounded-3xl bg-slate-900 p-10 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-bold">Key Features</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">100% Secure</p>
                      <p className="text-xs text-slate-400 mt-1">All processing in your browser</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">High Precision AI</p>
                      <p className="text-xs text-slate-400 mt-1">Advanced neural networks</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                      <Eraser className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Transparent Output</p>
                      <p className="text-xs text-slate-400 mt-1">Perfect PNG with alpha channel</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
                      <ImageIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm">Optimized Performance</p>
                      <p className="text-xs text-slate-400 mt-1">Auto-retry on failure</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ & Related */}
          <div className="mt-20 space-y-12">
            {faqItems && <FAQ items={faqItems} />}
            <RelatedTools currentToolId="background-remover" />
          </div>
        </div>
      </div>
    </div>
  );
}
