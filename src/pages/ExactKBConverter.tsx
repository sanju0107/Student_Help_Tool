import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  ImageIcon, 
  Zap,
  ShieldCheck,
  ArrowRight,
  Info,
  AlertCircle,
  FileType,
  CheckCircle2,
  Loader2,
  RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatBytes } from '../lib/utils';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function ExactKBConverter() {
  const toolData = TOOLS.find(t => t.id === 'exact-kb-converter')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/image/exact-kb'
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [targetKB, setTargetKB] = useState<number>(50);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setCompressedFile(null);
    setSuccess(false);
    setError(null);
  };

  const compressIteratively = async (img: HTMLImageElement, targetSizeInBytes: number): Promise<Blob> => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    let low = 0.01;
    let high = 1.0;
    let bestBlob: Blob | null = null;
    let iterations = 0;
    const maxIterations = 12; // Increased for better precision

    while (iterations < maxIterations) {
      const mid = (low + high) / 2;
      const blob = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob((b) => resolve(b), 'image/jpeg', mid)
      );

      if (!blob) break;

      if (blob.size <= targetSizeInBytes) {
        bestBlob = blob;
        low = mid;
      } else {
        high = mid;
      }
      iterations++;
    }

    if (!bestBlob) {
      const fallback = await new Promise<Blob | null>((resolve) => 
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.01)
      );
      return fallback!;
    }

    return bestBlob;
  };

  const handleProcess = async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);

    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const targetBytes = targetKB * 1024;
      const finalBlob = await compressIteratively(img, targetBytes);
      
      setCompressedFile(finalBlob);
      setSuccess(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      console.error(err);
      setError('Failed to compress image. Please try a different file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!compressedFile) return;
    const url = URL.createObjectURL(compressedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `compressed-${targetKB}kb-${file?.name.split('.')[0]}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setCompressedFile(null);
    setSuccess(false);
    setError(null);
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
            icon={FileType}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={compressedFile ? URL.createObjectURL(compressedFile) : preview}
                  fileName={file?.name}
                  isProcessing={isProcessing}
                  status="Compressing to exact size..."
                  progress={isProcessing ? 70 : 100}
                  label="Upload Image to Compress"
                  subLabel="Supports JPG, PNG, WEBP"
                />

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 space-y-10"
                  >
                    <div className="rounded-[2.5rem] bg-slate-50 p-10 border border-slate-100">
                      <div className="mb-8 flex items-center justify-between">
                        <label className="text-xl font-black text-slate-900 tracking-tight">Target Size: <span className="text-blue-600">{targetKB} KB</span></label>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Set exact limit</span>
                      </div>
                      <div className="flex items-center gap-8">
                        <div className="relative">
                          <input 
                            type="number" 
                            value={targetKB}
                            onChange={(e) => setTargetKB(Number(e.target.value))}
                            className="w-36 px-8 py-5 rounded-2xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 transition-all bg-white font-black text-2xl text-center shadow-sm"
                            min="1"
                            max="5000"
                          />
                          <div className="absolute -top-4 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white shadow-xl border-4 border-white">KB</div>
                        </div>
                        <input 
                          type="range" 
                          min="10" 
                          max="500" 
                          step="10"
                          value={targetKB}
                          onChange={(e) => setTargetKB(Number(e.target.value))}
                          className="h-3 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                        />
                      </div>
                      <div className="mt-10 flex flex-wrap gap-4">
                        {[20, 50, 100, 200, 500].map((size) => (
                          <button
                            key={size}
                            onClick={() => setTargetKB(size)}
                            className={`px-8 py-3.5 rounded-2xl text-base font-black transition-all ${targetKB === size ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20 scale-105' : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md'}`}
                          >
                            {size} KB
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Original Size</p>
                        <p className="text-3xl font-black text-slate-900">{formatBytes(file.size)}</p>
                      </div>
                      <div className="rounded-[2rem] border-2 border-blue-100 bg-blue-50/50 p-8 text-center shadow-sm">
                        <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-3">Final Size</p>
                        <p className="text-3xl font-black text-blue-600">
                          {compressedFile ? formatBytes(compressedFile.size) : '---'}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {!success ? (
                        <button
                          onClick={handleProcess}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="h-6 w-6 animate-spin" />
                              Processing...
                            </>
                          ) : (
                            <>
                              <Zap className="h-6 w-6" />
                              Compress to Exact KB
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                        >
                          <Download className="h-6 w-6" /> Download Image
                        </button>
                      )}
                      <button
                        onClick={reset}
                        className="btn-secondary px-12 py-5 text-xl flex items-center gap-3"
                      >
                        <RotateCcw className="h-5 w-5" />
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
                      Many online application portals for SSC, Banking, and Railway exams require you to upload images within a very specific file size range. 
                      Our tool uses an advanced iterative compression algorithm to find the perfect quality setting that keeps your image under the required KB limit while maintaining maximum clarity.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Why use this?</h3>
                <ul className="space-y-8">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">100% Secure. All processing happens locally in your browser. Your files never leave your device.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Perfect for 20KB, 50KB, and 100KB requirements for government exams.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Instant results with high-performance algorithms.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Select the image you want to compress from your device."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Set KB" 
                  description="Enter the exact target size you need (e.g., 50 KB)."
                  icon={Zap}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your optimized image instantly at the exact size."
                  icon={Download}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <HowToUseSection steps={howToSteps} useCases={useCases} />
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="exact-kb-converter" />
        </div>
      </div>
    </div>
  );
}
