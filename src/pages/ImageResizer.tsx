import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  Download, 
  Maximize, 
  Lock, 
  Unlock,
  ShieldCheck,
  Zap,
  Info,
  AlertCircle,
  Loader2,
  RotateCcw,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function ImageResizer() {
  const toolData = TOOLS.find(t => t.id === 'image-resizer')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/image/resizer'
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);
  const [originalWidth, setOriginalWidth] = useState<number>(0);
  const [originalHeight, setOriginalHeight] = useState<number>(0);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    
    const img = new Image();
    img.onload = () => {
      setOriginalWidth(img.width);
      setOriginalHeight(img.height);
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = URL.createObjectURL(selectedFile);
    
    setProcessedPreview(null);
    setError(null);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (maintainAspectRatio && originalWidth > 0) {
      setHeight(Math.round((val / originalWidth) * originalHeight));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (maintainAspectRatio && originalHeight > 0) {
      setWidth(Math.round((val / originalHeight) * originalWidth));
    }
  };

  const handleProcess = async () => {
    if (!file || width <= 0 || height <= 0) return;
    setIsProcessing(true);
    setError(null);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = preview!;
      });

      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, 1));
      if (blob) {
        setProcessedPreview(URL.createObjectURL(blob));
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#2dd4bf', '#a855f7', '#10b981', '#f59e0b']
        });
      }
    } catch (err) {
      setError('Failed to resize image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedPreview) return;
    const link = document.createElement('a');
    link.href = processedPreview;
    link.download = `resized-${width}x${height}-${file?.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProcessedPreview(null);
    setError(null);
    setWidth(0);
    setHeight(0);
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
            icon={Maximize}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={processedPreview || preview}
                  fileName={file?.name}
                  isProcessing={isProcessing}
                  status="Resizing..."
                  progress={isProcessing ? 70 : 100}
                  label="Upload Image to Resize"
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
                        <h4 className="text-xl font-black text-slate-900 tracking-tight">Resize Settings</h4>
                        <button 
                          onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                          className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black transition-all ${maintainAspectRatio ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white text-slate-600 border border-slate-200 shadow-sm'}`}
                        >
                          {maintainAspectRatio ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                          Maintain Aspect Ratio
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Width (px)</label>
                          <input 
                            type="number" 
                            value={width}
                            onChange={(e) => handleWidthChange(Number(e.target.value))}
                            className="w-full px-8 py-5 rounded-3xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 transition-all bg-white font-black text-2xl shadow-sm"
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Height (px)</label>
                          <input 
                            type="number" 
                            value={height}
                            onChange={(e) => handleHeightChange(Number(e.target.value))}
                            className="w-full px-8 py-5 rounded-3xl border-2 border-slate-200 focus:border-blue-500 focus:ring-0 transition-all bg-white font-black text-2xl shadow-sm"
                          />
                        </div>
                      </div>

                      <div className="mt-10 flex flex-wrap gap-4">
                        {[0.25, 0.5, 0.75, 1.5, 2].map((scale) => (
                          <button
                            key={scale}
                            onClick={() => {
                              handleWidthChange(Math.round(originalWidth * scale));
                            }}
                            className="px-6 py-3 rounded-2xl text-sm font-black bg-white text-slate-600 border border-slate-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md transition-all shadow-sm"
                          >
                            {scale * 100}%
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                      <div className="rounded-[2rem] border border-slate-100 bg-white p-8 text-center shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Original</p>
                        <p className="text-3xl font-black text-slate-900">{originalWidth} × {originalHeight}</p>
                      </div>
                      <div className="rounded-[2rem] border-2 border-blue-100 bg-blue-50/50 p-8 text-center shadow-sm">
                        <p className="text-xs font-black text-blue-400 uppercase tracking-[0.2em] mb-3">New Size</p>
                        <p className="text-3xl font-black text-blue-600">{width} × {height}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {!processedPreview ? (
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
                              Resize Image Now
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                        >
                          <Download className="h-6 w-6" /> Download Resized Image
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
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Resize to exact dimensions for social media or application forms.</p>
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
                  description="Select the image you want to resize from your device."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Dimensions" 
                  description="Enter your target width and height in pixels."
                  icon={Maximize}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your resized image instantly in high quality."
                  icon={Download}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <HowToUseSection steps={howToSteps} useCases={useCases} />
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="image-resizer" />
        </div>
      </div>
    </div>
  );
}
