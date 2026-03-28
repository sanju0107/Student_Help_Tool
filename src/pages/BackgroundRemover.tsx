import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  Eraser, 
  ShieldCheck, 
  ArrowRight, 
  Info, 
  AlertCircle,
  Maximize2,
  FileType,
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { removeBackground, Config } from '@imgly/background-removal';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function BackgroundRemover() {
  const toolData = TOOLS.find(t => t.id === 'background-remover')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/image/background-remover'
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError('File size too large. Please select an image under 10MB.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setResultUrl(null);
    setSuccess(false);
    setError(null);
    setProgress(0);
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setIsModelLoading(true);
    setError(null);
    setProgress(0);

    try {
      const config: Config = {
        progress: (key, current, total) => {
          if (key === 'compute') {
            setIsModelLoading(false);
          }
          const percent = Math.round((current / total) * 100);
          setProgress(percent);
        },
        model: 'isnet',
        output: {
          format: 'image/png',
          quality: 0.8,
        }
      };

      if (typeof removeBackground !== 'function') {
        throw new Error('Background removal library not loaded correctly.');
      }

      const blob = await removeBackground(file, config);
      const url = URL.createObjectURL(blob);
      
      setResultUrl(url);
      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      console.error(err);
      setError('Background removal failed. This can happen with very complex images or if the AI model fails to load. Please try again or use a smaller image.');
    } finally {
      setIsProcessing(false);
      setIsModelLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement('a');
    link.href = resultUrl;
    link.download = `no-bg-${file?.name.split('.')[0]}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setResultUrl(null);
    setSuccess(false);
    setError(null);
    setProgress(0);
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

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={resultUrl || preview}
                  fileName={file?.name}
                  isProcessing={isProcessing}
                  status={isModelLoading ? "Loading AI Model..." : "Removing Background..."}
                  progress={progress}
                  label="Upload Image to Remove Background"
                  subLabel="Supports JPG, PNG, WEBP (Max 10MB)"
                />

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 space-y-8"
                  >
                    <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                      {!success ? (
                        <button
                          onClick={handleProcess}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl"
                        >
                          {isProcessing ? 'Processing...' : 'Remove Background Now'}
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
                        >
                          <Download className="h-6 w-6" /> Download Transparent PNG
                        </button>
                      )}
                      <button
                        onClick={reset}
                        className="btn-secondary px-10 py-5 text-xl"
                      >
                        Reset
                      </button>
                    </div>
                  </motion.div>
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
                    <h3 className="text-xl font-black text-slate-900 mb-3">How it works</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Our AI-powered background remover uses advanced neural networks to accurately detect the subject in your photo and separate it from the background. 
                      The entire process happens directly in your browser, meaning your photos are never uploaded to any server, ensuring 100% privacy.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Why use this?</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">100% Secure</p>
                      <p className="text-xs text-slate-400 mt-1">Processing happens in your browser.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <Zap className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">High Precision AI</p>
                      <p className="text-xs text-slate-400 mt-1">Accurate detection for complex edges.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Select the image you want to remove the background from."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Process" 
                  description="Wait a few seconds for the AI to detect and remove the background."
                  icon={Zap}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your high-quality transparent PNG instantly."
                  icon={Download}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <HowToUseSection steps={howToSteps} useCases={useCases} />
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="background-remover" />
        </div>
      </div>
    </div>
  );
}
