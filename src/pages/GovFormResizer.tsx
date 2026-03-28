import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { Download, Maximize2, AlertCircle, CheckCircle2, Info, ArrowRight, FileType, Image as ImageIcon } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import RelatedTools from '../components/RelatedTools';
import HowToUseSection from '../components/HowToUseSection';
import FAQ from '../components/FAQ';
import { useSEO } from '../lib/useSEO';
import { TOOLS } from '../constants';

const FORM_TEMPLATES = [
  { id: 'ssc-photo', name: 'SSC Photo', width: 350, height: 450, maxKB: 50, minKB: 20 },
  { id: 'ssc-sign', name: 'SSC Signature', width: 400, height: 200, maxKB: 20, minKB: 10 },
  { id: 'upsc-photo', name: 'UPSC Photo', width: 350, height: 350, maxKB: 300, minKB: 20 },
  { id: 'upsc-sign', name: 'UPSC Signature', width: 350, height: 350, maxKB: 300, minKB: 20 },
  { id: 'banking-photo', name: 'Banking/IBPS Photo', width: 450, height: 350, maxKB: 50, minKB: 20 },
  { id: 'banking-sign', name: 'Banking/IBPS Signature', width: 140, height: 60, maxKB: 20, minKB: 10 },
];

export default function GovFormResizer() {
  const toolData = TOOLS.find(t => t.id === 'gov-form-resizer')!;
  const { name: title, description, longDescription, seoTitle, seoDescription, seoKeywords, intro, howToSteps, useCases, faqItems } = toolData;
  
  // Generate SEO metadata
  const seoData = useSEO({
    title: seoTitle,
    description: seoDescription,
    keywords: seoKeywords,
    pageUrl: 'https://careersuite.io/image/gov-form'
  });

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [processedPreview, setProcessedPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState(FORM_TEMPLATES[0]);

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
    if (!file) return;
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

      canvas.width = selectedTemplate.width;
      canvas.height = selectedTemplate.height;
      ctx?.drawImage(img, 0, 0, selectedTemplate.width, selectedTemplate.height);

      const resizedBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!resizedBlob) throw new Error('Failed to resize');

      let quality = 0.9;
      let finalFile = new File([resizedBlob], file.name, { type: 'image/jpeg' });
      
      while (finalFile.size / 1024 > selectedTemplate.maxKB && quality > 0.1) {
        quality -= 0.05;
        const compressed = await imageCompression(finalFile, {
          maxSizeMB: selectedTemplate.maxKB / 1024,
          maxWidthOrHeight: selectedTemplate.width,
          useWebWorker: true,
          initialQuality: quality,
        });
        finalFile = compressed;
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
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!processedFile) return;
    const url = URL.createObjectURL(processedFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = `gov-form-${selectedTemplate.id}-${file?.name}`;
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
                <div className="mb-10">
                  <label className="block text-xs font-black text-slate-400 mb-6 uppercase tracking-[0.2em]">Select Form Template</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {FORM_TEMPLATES.map((template) => (
                      <button
                        key={template.id}
                        onClick={() => setSelectedTemplate(template)}
                        className={`p-6 rounded-[1.5rem] border-2 text-left transition-all ${
                          selectedTemplate.id === template.id
                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md shadow-blue-500/10'
                            : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-200'
                        }`}
                      >
                        <p className="font-black text-base">{template.name}</p>
                        <p className="text-xs mt-2 font-bold opacity-70 tracking-wide">
                          {template.width}x{template.height}px • {template.minKB}-{template.maxKB}KB
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <FileUpload 
                  onFileSelect={handleFileSelect}
                  onFileClear={reset}
                  previewUrl={processedPreview || preview}
                  fileName={file?.name}
                  isProcessing={isProcessing}
                  status={`Adjusting for ${selectedTemplate.name}...`}
                  label={`Upload Photo for ${selectedTemplate.name}`}
                  subLabel="We will automatically adjust it to required dimensions"
                />

                {file && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-10 space-y-8"
                  >
                    {processedFile && (
                      <div className="flex items-center justify-between rounded-[1.5rem] bg-blue-50 p-6 border border-blue-100">
                        <div className="flex items-center gap-4">
                          <CheckCircle2 className="h-6 w-6 text-blue-600" />
                          <span className="text-base font-black text-blue-900 tracking-tight">Ready for {selectedTemplate.name}</span>
                        </div>
                        <span className="text-base font-black text-blue-600">
                          {selectedTemplate.width}x{selectedTemplate.height}px • {Math.round(processedFile.size / 1024)}KB
                        </span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-4 pt-8 border-t border-slate-100">
                      {!processedFile ? (
                        <button
                          onClick={handleProcess}
                          disabled={isProcessing}
                          className="btn-primary flex-1 py-5 text-xl"
                        >
                          {isProcessing ? 'Processing...' : `Apply ${selectedTemplate.name} Format`}
                        </button>
                      ) : (
                        <button
                          onClick={handleDownload}
                          className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20"
                        >
                          <Download className="h-6 w-6" /> Download for {selectedTemplate.name}
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
                    <h3 className="text-xl font-black text-slate-900 mb-3">About Gov Form Resizer</h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      Most government portals like SSC, UPSC, and IBPS have very strict requirements for photo dimensions and file sizes. 
                      Our tool automates this process entirely, ensuring your face is correctly scaled to the required aspect ratio without stretching.
                    </p>
                  </div>
                </div>
              </ToolCard>
            </div>

            <div className="space-y-8">
              <div className="rounded-[2.5rem] bg-slate-900 p-10 text-white shadow-2xl shadow-slate-900/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <h3 className="mb-8 text-2xl font-black tracking-tight">Key Features</h3>
                <ul className="space-y-6">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Predefined Templates</p>
                      <p className="text-xs text-slate-400 mt-1">SSC, UPSC, IBPS, and more.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Automatic KB Control</p>
                      <p className="text-xs text-slate-400 mt-1">Hit target size every time.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-lg bg-blue-500/20 text-blue-400">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-black text-sm">Zero Distortion</p>
                      <p className="text-xs text-slate-400 mt-1">Professional resizing logic.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Select Template" 
                  description="Choose the exam or form you are applying for."
                  icon={FileType}
                />
                <ToolStep 
                  number={2} 
                  title="Upload Photo" 
                  description="Upload your passport size photo or signature."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get the perfectly formatted image for your form."
                  icon={Download}
                />
              </div>
            </div>
          </div>

          {/* SEO Content Sections */}
          <HowToUseSection steps={howToSteps} useCases={useCases} />
          <FAQ items={faqItems} />
          <RelatedTools currentToolId="gov-form-resizer" />
        </div>
      </div>
    </div>
  );
}
