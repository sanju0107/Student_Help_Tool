/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import Layout from './components/Layout';
import { ErrorBoundary } from './components/ErrorBoundary';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'));
const ImageResizer = lazy(() => import('./pages/ImageResizer'));
const ExactKBConverter = lazy(() => import('./pages/ExactKBConverter'));
const GovFormResizer = lazy(() => import('./pages/GovFormResizer'));
const SignatureResizer = lazy(() => import('./pages/SignatureResizer'));
const PassportPhotoMaker = lazy(() => import('./pages/PassportPhotoMaker'));
const BackgroundRemover = lazy(() => import('./pages/BackgroundRemover'));
const MergePDF = lazy(() => import('./pages/MergePDF'));
const SplitPDF = lazy(() => import('./pages/SplitPDF'));
const ReducePDF = lazy(() => import('./pages/ReducePDF'));
const DocConverter = lazy(() => import('./pages/DocConverter'));
const GPACalculator = lazy(() => import('./pages/GPACalculator'));
const AgeCalculator = lazy(() => import('./pages/AgeCalculator'));
const OCRTool = lazy(() => import('./pages/OCRTool'));
const ResumeBuilder = lazy(() => import('./pages/ResumeBuilder'));
const CoverLetterAI = lazy(() => import('./pages/CoverLetterAI'));
const About = lazy(() => import('./pages/About'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));

import { TOOLS } from './constants';

const LoadingSpinner = () => (
  <div className="flex h-[60vh] w-full items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
  </div>
);

export default function App() {
  const getToolData = (id: string) => TOOLS.find(t => t.id === id)!;

  return (
    <HelmetProvider>
      <Router>
        <ErrorBoundary>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                
                {/* Image Tools */}
            <Route 
              path="/image/compressor" 
              element={<ImageCompressor />} 
            />
            <Route 
              path="/image/resizer" 
              element={<ImageResizer />} 
            />
            <Route 
              path="/image/exact-kb" 
              element={<ExactKBConverter />} 
            />
            <Route 
              path="/image/gov-form" 
              element={<GovFormResizer />} 
            />
            <Route 
              path="/image/signature" 
              element={<SignatureResizer />} 
            />
            <Route 
              path="/image/passport" 
              element={<PassportPhotoMaker />} 
            />
            <Route 
              path="/image/background-remover" 
              element={<BackgroundRemover />} 
            />

            {/* PDF & AI Tools */}
            <Route 
              path="/pdf/merge" 
              element={<MergePDF />} 
            />
            <Route 
              path="/pdf/split" 
              element={<SplitPDF />} 
            />
            <Route 
              path="/pdf/reduce" 
              element={<ReducePDF />} 
            />
            <Route 
              path="/pdf/to-word" 
              element={<DocConverter />} 
            />

            {/* Student Tools */}
            <Route 
              path="/student/gpa" 
              element={<GPACalculator />} 
            />
            <Route 
              path="/student/age" 
              element={<AgeCalculator />} 
            />

            {/* AI Tools */}
            <Route 
              path="/ocr-tool" 
              element={<OCRTool />} 
            />
            <Route 
              path="/student/resume" 
              element={<ResumeBuilder />} 
            />
            <Route 
              path="/ai/cover-letter" 
              element={<CoverLetterAI />} 
            />

            {/* Static Pages */}
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  </Router>
</HelmetProvider>
  );
}
