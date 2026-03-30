import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Download, FileType, AlertCircle, CheckCircle2, Scissors, Contrast, Info, ArrowRight, Loader2, RotateCcw, Image as ImageIcon } from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import imageCompression from 'browser-image-compression';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

export default function SignatureResizer() {
  const toolData = TOOLS.find(t => t.id === 'signature-resizer')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/image/signature'
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isBW, setIsBW] = useState(true);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please upload a valid image file.');
      return;
    }
    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setProcessedFile(null);
    setProcessedPreview(null);
    setError(null);
  };

  const handleProcess = async () => {
    if (!file || !croppedAreaPixels) return;
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

      canvas.width = croppedAreaPixels.width;
      canvas.height = croppedAreaPixels.height;
      
      ctx?.drawImage(
        img,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        croppedAreaPixels.width,
        croppedAreaPixels.height
      );

      if (isBW) {
        const imageData = ctx!.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          const val = avg > 128 ? 255 : 0;
          data[i] = val;
          data[i + 1] = val;
          data[i + 2] = val;
        }
        ctx!.putImageData(imageData, 0, 0);
      }

      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('Failed to crop');

      let quality = 0.9;
      let finalFile = new File([blob], 'signature.jpg', { type: 'image/jpeg' });
      
      while (finalFile.size / 1024 > 20 && quality > 0.1) {
        quality -= 0.05;
        finalFile = await imageCompression(finalFile, {
          maxSizeMB: 0.02,
          maxWidthOrHeight: 400,
          useWebWorker: true,
          initialQuality: quality,
        });
      }

      setProcessedFile(finalFile);
      setProcessedPreview(URL.createObjectURL(finalFile));
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#2dd4bf', '#a855f7']
      });
    } catch (err) {
      setError('Failed to process signature. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;
    const url = URL.createObjectURL(processedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `signature-${file?.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setFile(null);
    setPreview(null);
    setProcessedFile(null);
    setProcessedPreview(null);
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

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                {!file ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload Signature Image"
                    subLabel="Supports JPG, PNG, WEBP"
                  />
                ) : (
                  <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="space-y-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Crop Area</p>
                        <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                          <Cropper
                            image={preview!}
                            crop={crop}
                            zoom={zoom}
                            aspect={2 / 1}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                          />
                        </div>
                        <div className="flex items-center gap-6 px-4">
                          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Zoom</span>
                          <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={zoom}
                            onChange={(e) => setZoom(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                          />
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Preview</p>
                        <div className="aspect-video rounded-[2rem] overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shadow-inner">
                          {processedPreview ? (
                            <img src={processedPreview} alt="Processed" className="w-full h-full object-contain" />
                          ) : (
                            <div className="text-center p-8 text-slate-400">
                              <Scissors className="w-16 h-16 mx-auto mb-4 opacity-10" />
                              <p className="text-sm font-black tracking-tight">Cropped signature will appear here</p>
                            </div>
                          )}
                        </div>
                        {processedFile && (
                          <div className="flex justify-between items-center rounded-2xl bg-blue-50 p-6 border border-blue-100 shadow-sm">
                            <span className="text-xs font-black text-blue-900 uppercase tracking-[0.2em]">Final Size</span>
                            <span className="text-lg font-black text-blue-600">{Math.round(processedFile.size / 1024)} KB</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col gap-8 pt-10 border-t border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                        <button
                          onClick={() => setIsBW(!isBW)}
                          className={`flex items-center justify-center gap-3 px-8 py-5 rounded-2xl border-2 transition-all ${
                            isBW ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10' : 'border-slate-200 bg-white text-slate-600'
                          }`}
                        >
                          <Contrast className="w-6 h-6" />
                          <span className="font-black text-base">High Contrast B&W</span>
                        </button>
                        <p className="text-sm text-slate-500 leading-relaxed font-bold">
                          Recommended for signatures to ensure maximum clarity on government forms.
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {!processedFile ? (
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
                                <Scissors className="h-6 w-6" />
                                Crop & Optimize Signature
                              </>
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={handleDownload}
                            className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                          >
                            <Download className="h-6 w-6" /> Download Signature
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
                    <h3 className="text-xl font-black text-slate-900 mb-3">About Signature Resizer</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Signatures are often the most difficult part of an online application. They need to be clear, high-contrast, and very small in file size (usually 10KB to 20KB). 
                      Our tool is built specifically to solve this by providing precision cropping and automatic B&W conversion.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Key Features</h3>
                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Precision Cropping</p>
                      <p className="text-xs text-slate-400 mt-1">Focus exactly on your signature.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">High Contrast</p>
                      <p className="text-xs text-slate-400 mt-1">Automatic B&W for maximum clarity.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Size Enforcement</p>
                      <p className="text-xs text-slate-400 mt-1">Optimized to stay under 20KB limits.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Upload a photo or scan of your signature."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Crop & Sharpen" 
                  description="Select the signature area and apply B&W filter for clarity."
                  icon={Scissors}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your perfectly optimized signature file."
                  icon={Download}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="signature-resizer" />
        </div>
      </div>
    </div>
  );
}
