import React, { useState, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Download, 
  ImageIcon, 
  AlertCircle, 
  CheckCircle2, 
  Scissors, 
  Info, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Camera,
  ShieldCheck,
  Zap,
  Loader2
} from 'lucide-react';
import Cropper, { Area } from 'react-easy-crop';
import confetti from 'canvas-confetti';
import { ToolHeader, ToolCard, ToolStep } from '../components/ToolUI';
import { FileUpload } from '../components/FileUpload';
import { TOOLS } from '../constants';

export default function PassportPhotoMaker() {
  const toolData = TOOLS.find(t => t.id === 'passport-photo-maker')!;
  const { name: title, description, longDescription } = toolData;

  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);
  const [useWhiteBackground, setUseWhiteBackground] = useState(true);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setImage(reader.result as string);
      setError(null);
      setFinalImage(null);
    };
    reader.readAsDataURL(file);
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
  ): Promise<string | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    // Standard 35mm x 45mm at 300 DPI is 413x531 pixels
    const targetWidth = 413;
    const targetHeight = 531;

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    if (useWhiteBackground) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);
    }

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      targetWidth,
      targetHeight
    );

    return canvas.toDataURL('image/jpeg', 0.9);
  };

  const handleGenerate = async () => {
    if (!image || !croppedAreaPixels) return;
    setIsProcessing(true);
    setError(null);

    try {
      const croppedImage = await getCroppedImg(image, croppedAreaPixels);
      if (croppedImage) {
        setFinalImage(croppedImage);
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#2dd4bf', '#a855f7', '#10b981', '#f59e0b']
        });
      }
    } catch (err) {
      setError('Failed to generate passport photo. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!finalImage) return;
    const link = document.createElement('a');
    link.href = finalImage;
    link.download = `passport-photo-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const reset = () => {
    setImage(null);
    setFinalImage(null);
    setError(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <div className="bg-[#fcfcfd] min-h-screen py-12 lg:py-20">
      <Helmet>
        <title>{title} - Free Online Passport Photo Maker | StudentToolBox</title>
        <meta name="description" content={description + " Create standard 3.5 x 4.5 cm passport size photos for Indian government applications. Fast, secure, and free online tool for students."} />
        <meta name="keywords" content="passport photo maker, 3.5 x 4.5 cm photo, passport size photo online, ssc photo maker, upsc photo resizer, online passport photo crop" />
      </Helmet>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-5xl">
          <ToolHeader 
            title={title}
            description={description}
            icon={Camera}
          />

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              <ToolCard>
                {!image ? (
                  <FileUpload 
                    onFileSelect={handleFileSelect}
                    onFileClear={reset}
                    label="Upload Portrait Photo"
                    subLabel="Ensure your face is clearly visible"
                  />
                ) : (
                  <div className="space-y-10">
                    {!finalImage ? (
                      <div className="space-y-8">
                        <div className="relative h-[450px] w-full overflow-hidden rounded-[2.5rem] bg-slate-100 border-2 border-slate-200 shadow-inner">
                          <Cropper
                            image={image}
                            crop={crop}
                            zoom={zoom}
                            aspect={35 / 45}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                          />
                        </div>
                        
                        <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
                          <div className="flex flex-1 items-center gap-6">
                            <ZoomOut className="h-6 w-6 text-slate-400" />
                            <input
                              type="range"
                              value={zoom}
                              min={1}
                              max={3}
                              step={0.1}
                              onChange={(e) => setZoom(Number(e.target.value))}
                              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-blue-600"
                            />
                            <ZoomIn className="h-6 w-6 text-slate-400" />
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <label className="flex cursor-pointer items-center gap-4 text-sm font-black text-slate-700 uppercase tracking-wider">
                              <input
                                type="checkbox"
                                checked={useWhiteBackground}
                                onChange={(e) => setUseWhiteBackground(e.target.checked)}
                                className="h-6 w-6 rounded-xl border-slate-300 text-blue-600 focus:ring-blue-500 transition-all"
                              />
                              Standard White Background
                            </label>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <button 
                            onClick={handleGenerate}
                            disabled={isProcessing}
                            className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3"
                          >
                            {isProcessing ? (
                              <>
                                <Loader2 className="h-6 w-6 animate-spin" />
                                Generating...
                              </>
                            ) : (
                              <>
                                <Zap className="h-6 w-6" />
                                Generate Passport Photo
                              </>
                            )}
                          </button>
                          <button 
                            onClick={reset} 
                            className="btn-secondary px-12 py-5 text-xl flex items-center gap-3"
                          >
                            <RotateCcw className="h-5 w-5" />
                            New Photo
                          </button>
                        </div>
                      </div>
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-10"
                      >
                        <div className="flex flex-col items-center gap-8 py-10">
                          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Final Result (35mm x 45mm)</p>
                          <div className="relative h-[300px] w-[233px] overflow-hidden rounded-[2rem] border-8 border-white shadow-2xl ring-1 ring-slate-200">
                            <img src={finalImage} alt="Passport Photo" className="h-full w-full object-cover" />
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-green-50 px-8 py-4 text-green-700 border border-green-100">
                            <CheckCircle2 className="h-6 w-6" />
                            <p className="text-lg font-black">Photo generated successfully!</p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4 pt-10 border-t border-slate-100">
                          <button 
                            onClick={handleDownload} 
                            className="btn-primary flex-1 py-5 text-xl flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-600/20"
                          >
                            <Download className="h-6 w-6" /> Download Photo
                          </button>
                          <button 
                            onClick={() => setFinalImage(null)} 
                            className="btn-secondary px-12 py-5 text-xl"
                          >
                            Back to Crop
                          </button>
                          <button 
                            onClick={reset} 
                            className="btn-secondary px-12 py-5 text-xl"
                          >
                            Reset
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
                <h3 className="mb-8 text-2xl font-black tracking-tight">Photo Guidelines</h3>
                <ul className="space-y-8">
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                      <ShieldCheck className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Plain white background is preferred for most government forms.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Face should be centered, clear, and looking directly at the camera.</p>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="mt-1 flex h-8 w-8 items-center justify-center rounded-xl bg-purple-500/20 text-purple-400">
                      <Zap className="h-5 w-5" />
                    </div>
                    <p className="text-sm font-bold text-slate-300 leading-relaxed">Neutral expression, no hats, and no dark glasses allowed.</p>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <ToolStep 
                  number={1} 
                  title="Upload" 
                  description="Upload a clear portrait photo from your device."
                  icon={ImageIcon}
                />
                <ToolStep 
                  number={2} 
                  title="Crop" 
                  description="Align your face within the guide and zoom if needed."
                  icon={Scissors}
                />
                <ToolStep 
                  number={3} 
                  title="Download" 
                  description="Get your standard 3.5 x 4.5 cm passport photo."
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