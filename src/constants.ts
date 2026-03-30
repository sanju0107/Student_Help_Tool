import { 
  Image as ImageIcon, 
  Minimize2, 
  Maximize, 
  RefreshCw, 
  FilePlus, 
  FileDown,
  Scissors, 
  Calculator, 
  FileUser, 
  Sparkles,
  Maximize2,
  FileType,
  FileStack,
  Eraser,
  ArrowRightLeft,
  Cake,
  ScanText
} from 'lucide-react';

export interface Step {
  title: string;
  description: string;
}

export interface UseCase {
  title: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface Tool {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  icon: any;
  category: 'image' | 'pdf' | 'student' | 'ai';
  path: string;
  
  // SEO Metadata
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  slug: string;
  
  // Content Structure
  intro: string;
  howToSteps: Step[];
  useCases: UseCase[];
  faqItems: FAQItem[];
}

export const TOOLS: Tool[] = [
  {
    id: 'image-compressor',
    name: 'Image Compressor',
    description: 'Reduce file size (KB) by adjusting quality.',
    longDescription: 'Professional image compression tool that reduces file size without changing dimensions. Ideal for optimizing web assets and storage.',
    icon: Minimize2,
    category: 'image',
    path: '/image/compressor',
    seoTitle: 'Free Image Compressor - Reduce Size Online',
    seoDescription: 'Compress images to KB in seconds without losing quality. Perfect for uploads, email, and web. Works with JPG, PNG, WebP and more.',
    seoKeywords: ['image compressor', 'compress image', 'reduce image size', 'image optimizer', 'online image compression'],
    slug: 'image-compressor',
    intro: 'Reduce your image file sizes instantly without sacrificing quality. Our image compressor uses advanced algorithms to optimize images for web, email, and storage.',
    howToSteps: [
      {
        title: 'Upload Image',
        description: 'Click to upload or drag and drop your JPG, PNG, or WebP image'
      },
      {
        title: 'Adjust Quality',
        description: 'Use the quality slider to find the perfect balance between size and clarity'
      },
      {
        title: 'Download',
        description: 'Download your compressed image instantly with reduced file size'
      },
      {
        title: 'Use Anywhere',
        description: 'Use your optimized image for uploads, websites, emails, and social media'
      }
    ],
    useCases: [
      { title: 'Website Optimization' },
      { title: 'Email Attachments' },
      { title: 'Social Media Posts' },
      { title: 'Cloud Storage' },
      { title: 'Job Form Uploads' },
      { title: 'Resume Photo Reduction' }
    ],
    faqItems: [
      {
        question: 'Does image compression reduce quality?',
        answer: 'No, our tool maintains excellent quality while reducing file size. You control the compression level with the quality slider.'
      },
      {
        question: 'What formats are supported?',
        answer: 'We support JPG, PNG, WebP, GIF, and BMP formats for compression.'
      },
      {
        question: 'Is my image data secure?',
        answer: 'Yes, all compression happens in your browser. Your images are never stored on our servers.'
      }
    ]
  },
  {
    id: 'image-resizer',
    name: 'Image Resizer',
    description: 'Change image dimensions (pixels).',
    longDescription: 'Precisely change the width and height of your images. Supports aspect ratio locking for distortion-free resizing.',
    icon: Maximize,
    category: 'image',
    path: '/image/resizer',
    seoTitle: 'Online Image Resizer - Change Pixel Dimensions',
    seoDescription: 'Resize images to exact dimensions instantly. Lock aspect ratio to prevent distortion. Perfect for profile photos and thumbnails.',
    seoKeywords: ['image resizer', 'resize image', 'change image size', 'crop image', 'photo resizer'],
    slug: 'image-resizer',
    intro: 'Easily resize your images to specific pixel dimensions. Maintain aspect ratio or resize freely with our intuitive online image resizer.',
    howToSteps: [
      {
        title: 'Upload Image',
        description: 'Select your image file or drag and drop it'
      },
      {
        title: 'Set Dimensions',
        description: 'Enter width and height in pixels or choose a preset'
      },
      {
        title: 'Lock Aspect Ratio',
        description: 'Toggle aspect ratio lock to prevent distortion'
      },
      {
        title: 'Download Resized Image',
        description: 'Get your resized image in the same format'
      }
    ],
    useCases: [
      { title: 'Profile Pictures' },
      { title: 'Thumbnail Creation' },
      { title: 'Website Banners' },
      { title: 'Social Media Images' },
      { title: 'Document Photos' },
      { title: 'Standardized Sizes' }
    ],
    faqItems: [
      {
        question: 'Can I resize without distortion?',
        answer: 'Yes, enable aspect ratio lock to maintain proportions and prevent distortion during resizing.'
      },
      {
        question: 'What are preset sizes for?',
        answer: 'Presets offer common dimensions for profile pictures, thumbnails, and social media sizes.'
      },
      {
        question: 'Can I batch resize multiple images?',
        answer: 'Currently, you can resize one image at a time, but the process is very fast.'
      }
    ]
  },
  {
    id: 'exact-kb-converter',
    name: 'Exact KB Converter',
    description: 'Hit a specific target size (e.g., 50KB).',
    longDescription: 'Uses iterative compression logic to reach an exact target file size in KB. Perfect for strict portal requirements.',
    icon: FileDown,
    category: 'image',
    path: '/image/exact-kb',
    seoTitle: 'Resize Image to Exact KB - Online Tool',
    seoDescription: 'Reduce image to exact KB size (e.g., 50KB, 100KB) for job portals. Perfect for SSC, railway, banking forms.',
    seoKeywords: ['resize image to kb', 'exact kb converter', 'image to specific size', 'reduce image to 50kb'],
    slug: 'exact-kb-converter',
    intro: 'Need your image to be exactly 50KB or 100KB? Our Exact KB Converter uses smart compression to hit your target file size precisely.',
    howToSteps: [
      {
        title: 'Upload Your Image',
        description: 'Choose the image you want to resize to exact KB'
      },
      {
        title: 'Set Target Size',
        description: 'Enter the exact KB size you need (e.g., 50, 100, 200)'
      },
      {
        title: 'Convert',
        description: 'Our algorithm automatically compresses to your exact size'
      },
      {
        title: 'Download Result',
        description: 'Get your image at the precise KB size you specified'
      }
    ],
    useCases: [
      { title: 'SSC Form Uploads' },
      { title: 'Railway Job Portal' },
      { title: 'Banking Exam Forms' },
      { title: 'Government Portals' },
      { title: 'Competitive Exams' },
      { title: 'Strict Size Requirements' }
    ],
    faqItems: [
      {
        question: 'What if my original image is too large?',
        answer: 'Our algorithm will progressively compress until reaching your target size, even from very large images.'
      },
      {
        question: 'Can I get 50KB exactly?',
        answer: 'Our algorithm aims for your target size within a small margin. It typically achieves within 2-5% of target.'
      },
      {
        question: 'Is there a maximum target size?',
        answer: 'You can target any size up to your original image size. If your image is smaller than target, we cannot enlarge it.'
      }
    ]
  },
  {
    id: 'gov-form-resizer',
    name: 'Gov Form Photo Resizer',
    description: 'One-click resize for SSC, UPSC, Banking.',
    longDescription: 'Automated templates for Indian government forms. Automatically sets correct dimensions and KB limits for photos.',
    icon: Maximize2,
    category: 'image',
    path: '/image/gov-form',
    seoTitle: 'SSC Photo Resizer - Gov Form Image Optimizer',
    seoDescription: 'Resize photos for SSC, UPSC, Railway, Banking exams in one click. Automatic size and KB optimization for government forms.',
    seoKeywords: ['ssc photo resizer', 'gov form photo', 'railway photo resize', 'upsc photo size', 'banking exam photo'],
    slug: 'gov-form-resizer',
    intro: 'Perfect your government exam photos instantly. Automatically optimize image dimensions and file size for SSC, UPSC, Railway, and Banking portals.',
    howToSteps: [
      {
        title: 'Upload Your Photo',
        description: 'Select your government exam photo'
      },
      {
        title: 'Choose Exam Type',
        description: 'Select from SSC, UPSC, Railway, Banking, or other exam boards'
      },
      {
        title: 'Auto Optimize',
        description: 'We instantly resize and compress to exact requirements'
      },
      {
        title: 'Download',
        description: 'Get your photo ready for form submission'
      }
    ],
    useCases: [
      { title: 'SSC CGL/CHSL Exams' },
      { title: 'UPSC Civil Services' },
      { title: 'Railway Recruitment' },
      { title: 'Banking Exams (IBPS/SBI)' },
      { title: 'Teaching Exams (CTET)' },
      { title: 'Other Government Jobs' }
    ],
    faqItems: [
      {
        question: 'Does this support all exam boards?',
        answer: 'We support most Indian government exams. Select your exam type from the dropdown for exact specifications.'
      },
      {
        question: 'What if my photo is off-center?',
        answer: 'Use the crop tool to center your face before selecting your exam type for best results.'
      },
      {
        question: 'Can I use a digital photo?',
        answer: 'Yes, both downloaded photos and professional digital photos work perfectly with our optimizer.'
      }
    ]
  },
  {
    id: 'signature-resizer',
    name: 'Signature Resizer',
    description: 'Crop and convert signature to B&W.',
    longDescription: 'Specialized tool for signatures. Crop, convert to high-contrast black & white, and compress to under 20KB.',
    icon: FileType,
    category: 'image',
    path: '/image/signature',
    seoTitle: 'Digital Signature Resizer & Converter - B&W',
    seoDescription: 'Convert and resize digital signatures to black & white under 20KB. Perfect for forms, documents, and job applications.',
    seoKeywords: ['signature resizer', 'digital signature converter', 'crop signature', 'reduce signature size'],
    slug: 'signature-resizer',
    intro: 'Convert your digital signature to professional black & white format and resize it under 20KB for document uploads and forms.',
    howToSteps: [
      {
        title: 'Upload Signature Photo',
        description: 'Upload or take a photo of your scanned signature'
      },
      {
        title: 'Crop Signature',
        description: 'Crop the image to show only your signature'
      },
      {
        title: 'Convert to B&W',
        description: 'Transform to high-contrast black and white automatically'
      },
      {
        title: 'Download',
        description: 'Get your compressed signature under 20KB as PNG'
      }
    ],
    useCases: [
      { title: 'Document Signing' },
      { title: 'PDF Uploads' },
      { title: 'Form Submissions' },
      { title: 'Job Applications' },
      { title: 'Legal Documents' },
      { title: 'Email Signatures' }
    ],
    faqItems: [
      {
        question: 'What is the maximum signature size?',
        answer: 'Our tool compresses signatures to under 20KB, making them ideal for all online portals.'
      },
      {
        question: 'Can I adjust contrast?',
        answer: 'Yes, you can fine-tune the black & white contrast to make your signature clearer.'
      },
      {
        question: 'What format will I get?',
        answer: 'Your signature is saved as a PNG file with transparency for easy insertion into documents.'
      }
    ]
  },
  {
    id: 'passport-photo-maker',
    name: 'Passport Photo Maker',
    description: 'Create standard 3.5 x 4.5 cm photos.',
    longDescription: 'Generate professional passport size photos with standard dimensions and white background normalization.',
    icon: ImageIcon,
    category: 'image',
    path: '/image/passport',
    seoTitle: 'Passport Photo Maker - 3.5x4.5cm Creator',
    seoDescription: 'Create passport photos in standard 3.5x4.5cm size with white background. Download for visa, passport, ID applications.',
    seoKeywords: ['passport photo maker', 'passport size photo', 'visa photo creator', 'id photo generator'],
    slug: 'passport-photo-maker',
    intro: 'Create professional passport and visa photos in seconds. Our tool automatically crops and sizes your photo to 3.5x4.5cm standards.',
    howToSteps: [
      {
        title: 'Upload Your Photo',
        description: 'Select a clear head shot or self portrait'
      },
      {
        title: 'Position Face',
        description: 'Adjust the crop to center your face properly'
      },
      {
        title: 'Set Background',
        description: 'Choose white, blue, or red background as needed'
      },
      {
        title: 'Download Passport Photo',
        description: 'Get your 3.5x4.5cm photo ready for any application'
      }
    ],
    useCases: [
      { title: 'Passport Applications' },
      { title: 'Visa Requirements' },
      { title: 'Driver\'s License' },
      { title: 'ID Card Photos' },
      { title: 'Travel Documents' },
      { title: 'Official Documents' }
    ],
    faqItems: [
      {
        question: 'What is the standard passport photo size?',
        answer: 'The international standard is 3.5 x 4.5 cm (35 x 45 mm) with white background.'
      },
      {
        question: 'Can I choose different backgrounds?',
        answer: 'Yes, we offer white (most common), blue, and red backgrounds depending on your requirements.'
      },
      {
        question: 'How many copies can I print?',
        answer: 'You can print multiple copies on standard photo paper from your downloaded image.'
      }
    ]
  },
  {
    id: 'background-remover',
    name: 'Background Remover',
    description: 'Remove background and get transparent PNG.',
    longDescription: 'AI-powered background removal. Instantly creates transparent PNGs for resumes, IDs, and professional profiles.',
    icon: Eraser,
    category: 'image',
    path: '/image/background-remover',
    seoTitle: 'AI Background Remover - Transparent PNG Creator',
    seoDescription: 'Remove background from images instantly using AI. Get transparent PNG for profiles, resumes, products, and designs.',
    seoKeywords: ['background remover', 'remove background', 'transparent background', 'png converter', 'image background removal'],
    slug: 'background-remover',
    intro: 'Remove image backgrounds in seconds with AI-powered technology. Create professional transparent PNGs for profiles, resumes, and products.',
    howToSteps: [
      {
        title: 'Upload Your Image',
        description: 'Select any JPG, PNG, or WebP image'
      },
      {
        title: 'AI Processing',
        description: 'Our AI automatically detects and removes the background'
      },
      {
        title: 'Instant Result',
        description: 'Get a transparent PNG within seconds'
      },
      {
        title: 'Download & Use',
        description: 'Download for profiles, resumes, products, or designs'
      }
    ],
    useCases: [
      { title: 'Profile Pictures' },
      { title: 'Resume Photos' },
      { title: 'Product Listings' },
      { title: 'Logo Design' },
      { title: 'Certificate Photos' },
      { title: 'Creative Projects' }
    ],
    faqItems: [
      {
        question: 'How accurate is the AI removal?',
        answer: 'Our AI is highly accurate for most images. Complex backgrounds or hair details may need manual refining.'
      },
      {
        question: 'What if the background removal is imperfect?',
        answer: 'You can use standard image editing tools to manually refine the edges before final use.'
      },
      {
        question: 'Can I restore the background later?',
        answer: 'Yes, the original image is preserved, and you can always re-upload to keep the background.'
      }
    ]
  },
  // PDF Tools
  {
    id: 'merge-pdf',
    name: 'Merge PDF',
    description: 'Combine multiple PDFs into one.',
    longDescription: 'Combine multiple PDF documents into a single file. Perfect for merging marksheets and certificates.',
    icon: FileStack,
    category: 'pdf',
    path: '/pdf/merge',
    seoTitle: 'Merge PDF Online - Combine PDFs Free',
    seoDescription: 'Combine multiple PDF documents into one instantly. No size limits. Merge marksheets, certificates, and documents online for free.',
    seoKeywords: ['merge pdf', 'combine pdf', 'pdf merger', 'merge pdfs online', 'pdf combiner'],
    slug: 'merge-pdf',
    intro: 'Easily combine multiple PDF documents into a single file. No software needed, no size limits, and completely secure.',
    howToSteps: [
      {
        title: 'Select PDFs',
        description: 'Choose 2 or more PDF files to merge'
      },
      {
        title: 'Arrange Order',
        description: 'Drag and reorder the PDFs as needed'
      },
      {
        title: 'Merge',
        description: 'Click merge to combine all files'
      },
      {
        title: 'Download',
        description: 'Download your single merged PDF file'
      }
    ],
    useCases: [
      { title: 'Merge Marksheets' },
      { title: 'Combine Certificates' },
      { title: 'Join Documents' },
      { title: 'Compile Reports' },
      { title: 'Consolidate Scans' },
      { title: 'Application Packages' }
    ],
    faqItems: [
      {
        question: 'How many PDFs can I merge?',
        answer: 'You can merge unlimited PDFs with no size restrictions.'
      },
      {
        question: 'Is there a file size limit?',
        answer: 'No, we support files of any size. Merging happens in your browser for security.'
      },
      {
        question: 'Can I rearrange page order?',
        answer: 'Yes, use drag and drop to arrange PDFs in any order before merging.'
      }
    ]
  },
  {
    id: 'split-pdf',
    name: 'Split PDF',
    description: 'Extract specific pages from a PDF.',
    longDescription: 'Separate a single PDF file into multiple documents or extract specific pages for your needs.',
    icon: Scissors,
    category: 'pdf',
    path: '/pdf/split',
    seoTitle: 'Split PDF Online - Extract Pages Free',
    seoDescription: 'Extract specific pages from PDF or split into separate files. Online tool to split PDFs by page numbers instantly.',
    seoKeywords: ['split pdf', 'extract pdf pages', 'pdf splitter', 'separate pdf pages', 'cut pdf'],
    slug: 'split-pdf',
    intro: 'Extract pages from your PDF or split it into separate documents. Manage your PDFs exactly how you need them.',
    howToSteps: [
      {
        title: 'Upload PDF',
        description: 'Select your PDF file'
      },
      {
        title: 'Select Pages',
        description: 'Choose which pages to extract or specify ranges'
      },
      {
        title: 'Split',
        description: 'Process your file to split or extract'
      },
      {
        title: 'Download',
        description: 'Get your extracted or split PDF files'
      }
    ],
    useCases: [
      { title: 'Extract Specific Pages' },
      { title: 'Remove Unwanted Pages' },
      { title: 'Separate Contracts' },
      { title: 'Split Scanned Docs' },
      { title: 'Page Extraction' },
      { title: 'Document Management' }
    ],
    faqItems: [
      {
        question: 'Can I extract a single page?',
        answer: 'Yes, you can extract any single page or range of pages from your PDF.'
      },
      {
        question: 'What happens to the original file?',
        answer: 'Your original PDF is never modified. You get new files with your selections.'
      },
      {
        question: 'Can I delete pages instead of extracting?',
        answer: 'Yes, this is equivalent to extracting the pages you want to keep.'
      }
    ]
  },
  {
    id: 'reduce-pdf',
    name: 'Reduce PDF Size',
    description: 'Compress PDF file size.',
    longDescription: 'Reduce the file size of your PDF documents without losing quality. Ideal for email attachments and uploads.',
    icon: Minimize2,
    category: 'pdf',
    path: '/pdf/reduce',
    seoTitle: 'Compress PDF Online - Reduce File Size Free',
    seoDescription: 'Reduce PDF file size instantly without losing quality. Perfect for email, uploads, and document sharing.',
    seoKeywords: ['compress pdf', 'reduce pdf size', 'pdf compressor', 'shrink pdf', 'email pdf size'],
    slug: 'reduce-pdf',
    intro: 'Compress large PDF files to smaller sizes instantly. Perfect for email attachments, uploads, and document sharing.',
    howToSteps: [
      {
        title: 'Upload PDF',
        description: 'Select your large PDF file'
      },
      {
        title: 'Compression Level',
        description: 'Choose compression strength (high, medium, low)'
      },
      {
        title: 'Compress',
        description: 'Our tool optimizes and compresses your PDF'
      },
      {
        title: 'Download',
        description: 'Download your smaller PDF file'
      }
    ],
    useCases: [
      { title: 'Email Attachments' },
      { title: 'Cloud Storage' },
      { title: 'Document Uploads' },
      { title: 'File Sharing' },
      { title: 'Web Optimization' },
      { title: 'Archive Storage' }
    ],
    faqItems: [
      {
        question: 'Will compression affect PDF quality?',
        answer: 'No, you control the compression level. Even high compression maintains readable quality.'
      },
      {
        question: 'How much smaller will my PDF be?',
        answer: 'Compression typically reduces size by 30-70% depending on your PDF content and compression level.'
      },
      {
        question: 'Can I compress encrypted PDFs?',
        answer: 'Our tool can compress most PDFs, but encrypted files may need decryption first.'
      }
    ]
  },
  {
    id: 'pdf-to-word',
    name: 'PDF to Word',
    description: 'Convert PDF to editable Word doc.',
    longDescription: 'Transform your PDF files into editable Microsoft Word documents while preserving formatting.',
    icon: FileType,
    category: 'pdf',
    path: '/pdf/to-word',
    seoTitle: 'PDF to Word Converter - Free Online Tool',
    seoDescription: 'Convert PDF to editable Word document instantly. Preserves formatting and text. Download as DOCX online free.',
    seoKeywords: ['pdf to word', 'convert pdf to word', 'pdf to docx', 'word converter from pdf', 'extract text from pdf'],
    slug: 'pdf-to-word',
    intro: 'Convert your PDF documents to editable Word format instantly. Preserve all formatting and convert in seconds.',
    howToSteps: [
      {
        title: 'Upload PDF',
        description: 'Select your PDF file'
      },
      {
        title: 'Convert',
        description: 'Our tool converts PDF to Word with formatting'
      },
      {
        title: 'Download DOCX',
        description: 'Get your editable Word document'
      },
      {
        title: 'Edit & Use',
        description: 'Open in Microsoft Word and edit as needed'
      }
    ],
    useCases: [
      { title: 'Convert Documents' },
      { title: 'Edit PDF Content' },
      { title: 'Reuse Templates' },
      { title: 'Format Conversion' },
      { title: 'Data Extraction' },
      { title: 'Document Archiving' }
    ],
    faqItems: [
      {
        question: 'Will formatting be preserved?',
        answer: 'Yes, most formatting is preserved including fonts, colors, and layout.'
      },
      {
        question: 'Can I convert scanned PDFs?',
        answer: 'Scanned PDFs (image-based) may require OCR processing for text extraction.'
      },
      {
        question: 'Is the conversion accurate?',
        answer: 'Our conversion is highly accurate for standard PDFs. Always review the output in Word for any adjustments.'
      }
    ]
  },
  {
    id: 'image-to-pdf',
    name: 'Image to PDF',
    description: 'Convert images (JPG, PNG, WEBP) to PDF.',
    longDescription: 'Combine multiple images into a single PDF document with customizable page sizes and margins. Perfect for scanned documents, photo albums, or document consolidation.',
    icon: ImageIcon,
    category: 'pdf',
    path: '/pdf/image-to-pdf',
    seoTitle: 'Image to PDF Converter - Free Online Tool',
    seoDescription: 'Convert JPG, PNG, and WEBP images to PDF. Combine multiple images, choose page sizes, customize margins. Free and private.',
    seoKeywords: ['image to pdf', 'convert image to pdf', 'jpg to pdf', 'png to pdf', 'webp to pdf', 'images to pdf converter'],
    slug: 'image-to-pdf',
    intro: 'Easily convert your images (JPG, PNG, WEBP) into a professional PDF document. Combine multiple images with custom page sizes and margins.',
    howToSteps: [
      {
        title: 'Upload Images',
        description: 'Add one or more images in JPG, PNG, or WEBP format'
      },
      {
        title: 'Arrange & Configure',
        description: 'Drag to reorder images and set page size and margins'
      },
      {
        title: 'Convert',
        description: 'Click convert to create your PDF'
      },
      {
        title: 'Download',
        description: 'Get your PDF file instantly'
      }
    ],
    useCases: [
      { title: 'Scan Documents' },
      { title: 'Photo Albums' },
      { title: 'Screenshot Collections' },
      { title: 'Multiple Page Documents' },
      { title: 'Document Consolidation' },
      { title: 'Archive Creation' }
    ],
    faqItems: [
      {
        question: 'Can I reorder images?',
        answer: 'Yes, drag and drop images to arrange them in any order before conversion.'
      },
      {
        question: 'What page sizes are available?',
        answer: 'A4 (210x297mm), Letter (215.9x279.4mm), and Fit-to-image modes are supported.'
      },
      {
        question: 'Will image quality be preserved?',
        answer: 'Yes, images are embedded in the PDF at their original quality. Margins can be added for professional appearance.'
      },
      {
        question: 'What image formats are supported?',
        answer: 'JPG, PNG, and WEBP formats are fully supported.'
      }
    ]
  },
  {
    id: 'word-to-pdf',
    name: 'Word to PDF',
    description: 'Convert Word documents (.docx) to PDF.',
    longDescription: 'Convert Microsoft Word documents to PDF format with recommended tools and methods. This page explains why browser-based conversion is limited and provides reliable alternatives.',
    icon: FileType,
    category: 'pdf',
    path: '/pdf/word-to-pdf',
    seoTitle: 'Word to PDF Converter - DOCX to PDF Online',
    seoDescription: 'Convert Word (.docx) documents to PDF with formatting preserved. Learn the best methods and recommended tools for reliable DOCX to PDF conversion.',
    seoKeywords: ['word to pdf', 'docx to pdf', 'convert word to pdf', 'word converter', 'doc to pdf', 'document conversion'],
    slug: 'word-to-pdf',
    intro: 'Learn the best ways to convert Word documents to PDF with full formatting. This page explains why we recommend external services and provides quick links to trusted converters.',
    howToSteps: [
      {
        title: 'Choose Method',
        description: 'Select from recommended online services or Microsoft tools'
      },
      {
        title: 'Upload or Open',
        description: 'Upload your Word file or open in Microsoft Office'
      },
      {
        title: 'Convert',
        description: 'Click export/convert to PDF option'
      },
      {
        title: 'Download',
        description: 'Save your PDF file'
      }
    ],
    useCases: [
      { title: 'Document Sharing' },
      { title: 'Preserve Formatting' },
      { title: 'Create Reports' },
      { title: 'Professional Documents' },
      { title: 'Archive Documents' },
      { title: 'Email Attachments' }
    ],
    faqItems: [
      {
        question: 'Why not a browser-based converter?',
        answer: 'Converting DOCX with full formatting preservation requires parsing Microsoft\'s complex format and font rendering, which adds significant size and complexity to web apps.'
      },
      {
        question: 'Which service should I use?',
        answer: 'Smallpdf and iLovePDF are popular free options. Microsoft Word\'s native export is the most reliable.'
      },
      {
        question: 'Will my formatting be preserved?',
        answer: 'Yes, with proper tools. Use Microsoft Word\'s export feature or dedicated online services for best results.'
      },
      {
        question: 'Is my file secure?',
        answer: 'Use reputable services or Microsoft\'s own tools. Always check privacy policies if uploading to external services.'
      }
    ]
  },
  // Student Tools
  {
    id: 'gpa-calculator',
    name: 'GPA Calculator',
    description: 'Calculate CGPA and percentage.',
    longDescription: 'Calculate your semester GPA or overall CGPA and convert it to percentage for job applications.',
    icon: Calculator,
    category: 'student',
    path: '/student/gpa',
    seoTitle: 'GPA & CGPA Calculator - Convert to Percentage',
    seoDescription: 'Calculate CGPA and convert to percentage instantly. Perfect for job applications and academic transcripts.',
    seoKeywords: ['gpa calculator', 'cgpa calculator', 'gpa to percentage', 'calculate gpa', 'grade point average calculator'],
    slug: 'gpa-calculator',
    intro: 'Calculate your CGPA and convert to percentage easily. Perfect for job applications and academic discussions.',
    howToSteps: [
      {
        title: 'Enter Grades',
        description: 'Input your marks for each subject'
      },
      {
        title: 'Set Credits',
        description: 'Specify credit hours or weights for each course'
      },
      {
        title: 'Calculate',
        description: 'Get instant GPA/CGPA calculation'
      },
      {
        title: 'Convert',
        description: 'Automatic conversion to percentage'
      }
    ],
    useCases: [
      { title: 'Job Applications' },
      { title: 'Scholarship Forms' },
      { title: 'Semester Planning' },
      { title: 'Academic Tracking' },
      { title: 'Admission Processes' },
      { title: 'Career Counseling' }
    ],
    faqItems: [
      {
        question: 'What is CGPA?',
        answer: 'CGPA (Cumulative Grade Point Average) is the average GPA across all semesters of your academic career.'
      },
      {
        question: 'How is GPA calculated?',
        answer: 'GPA is calculated by multiplying grade points by credit hours, summing all courses, and dividing by total credits.'
      },
      {
        question: 'What is the percentage formula?',
        answer: 'Most universities use Percentage = GPA × 9.5 or similar formula. Check your institution for exact conversion.'
      }
    ]
  },
  {
    id: 'age-calculator',
    name: 'Age Calculator',
    description: 'Calculate age for exam forms.',
    longDescription: 'Precisely calculate your age in years, months, and days as required by government exam portals.',
    icon: Cake,
    category: 'student',
    path: '/student/age',
    seoTitle: 'Age Calculator - Calculate Exact Age',
    seoDescription: 'Calculate your exact age in years, months, and days. Perfect for government exams, forms, and applications.',
    seoKeywords: ['age calculator', 'calculate age', 'exact age calculator', 'age from date of birth', 'age in years months days'],
    slug: 'age-calculator',
    intro: 'Calculate your exact age in years, months, and days. Perfect for government exam eligibility and form applications.',
    howToSteps: [
      {
        title: 'Enter Birth Date',
        description: 'Input your date of birth'
      },
      {
        title: 'Select Reference Date',
        description: 'Choose today or a specific date'
      },
      {
        title: 'Calculate',
        description: 'Get exact age calculation'
      },
      {
        title: 'Use Results',
        description: 'Copy age for form submission'
      }
    ],
    useCases: [
      { title: 'Government Exams' },
      { title: 'Job Applications' },
      { title: 'Eligibility Verification' },
      { title: 'Forms & Applications' },
      { title: 'Passport/Visa' },
      { title: 'Medical Records' }
    ],
    faqItems: [
      {
        question: 'Why is exact age important for exams?',
        answer: 'Many government exams have strict age requirements and need precise calculation as of the exam date.'
      },
      {
        question: 'Can the reference date be in the future?',
        answer: 'Yes, you can calculate your age as of any specific date for eligibility checking.'
      },
      {
        question: 'Is the calculation official?',
        answer: 'This calculator is for reference. Always verify with official sources for legal documents.'
      }
    ]
  },
  // AI Tools
  {
    id: 'ocr-tool',
    name: 'Image to Text (OCR)',
    description: 'Extract editable text from images.',
    longDescription: 'AI-powered text extraction from screenshots and documents. Edit and download as text files.',
    icon: ScanText,
    category: 'ai',
    path: '/ocr-tool',
    seoTitle: 'Online OCR Tool - Extract Text From Images',
    seoDescription: 'Extract text from images instantly using AI-powered OCR. Convert screenshots, PDFs to editable text online free.',
    seoKeywords: ['ocr tool', 'extract text from image', 'image to text', 'ocr converter', 'screenshot to text'],
    slug: 'ocr-tool',
    intro: 'Extract text from images instantly with AI-powered Optical Character Recognition. Perfect for documents, screenshots, and scans.',
    howToSteps: [
      {
        title: 'Upload Image',
        description: 'Choose your image or screenshot'
      },
      {
        title: 'AI Processing',
        description: 'Our OCR processes and extracts text'
      },
      {
        title: 'Review Text',
        description: 'Check the extracted text for accuracy'
      },
      {
        title: 'Download or Copy',
        description: 'Copy or download as text file'
      }
    ],
    useCases: [
      { title: 'Document Digitization' },
      { title: 'Screenshot Conversion' },
      { title: 'Text Extraction' },
      { title: 'Data Entry Automation' },
      { title: 'Receipt Scanning' },
      { title: 'Book Scanning' }
    ],
    faqItems: [
      {
        question: 'How accurate is the OCR?',
        answer: 'Our OCR is highly accurate for clear text. Blurry or unusual fonts may have lower accuracy.'
      },
      {
        question: 'What languages are supported?',
        answer: 'We support multiple languages. Detection is automatic for most common languages.'
      },
      {
        question: 'Can I extract text from handwriting?',
        answer: 'Our OCR works best with printed text. Handwriting recognition is limited.'
      }
    ]
  },
  {
    id: 'resume-builder',
    name: 'AI Resume Builder',
    description: 'Create a professional resume in minutes.',
    longDescription: 'Build a job-winning professional resume with AI suggestions. Download as PDF instantly.',
    icon: FileUser,
    category: 'ai',
    path: '/student/resume',
    seoTitle: 'AI Resume Builder - Create Professional Resume Free',
    seoDescription: 'Build a professional resume with AI suggestions in minutes. Download as PDF. Perfect for job applications.',
    seoKeywords: ['resume builder', 'ai resume', 'build resume', 'resume maker', 'resume template'],
    slug: 'resume-builder',
    intro: 'Create a professional, job-winning resume with AI-powered suggestions. Download as PDF in minutes.',
    howToSteps: [
      {
        title: 'Fill Your Details',
        description: 'Enter personal, education, and work experience'
      },
      {
        title: 'Get AI Suggestions',
        description: 'Receive AI recommendations for descriptions'
      },
      {
        title: 'Choose Template',
        description: 'Select from professional resume templates'
      },
      {
        title: 'Download PDF',
        description: 'Get your resume as a PDF file'
      }
    ],
    useCases: [
      { title: 'Job Applications' },
      { title: 'First Job Resume' },
      { title: 'Career Switch' },
      { title: 'Internship Applications' },
      { title: 'Contract Positions' },
      { title: 'Freelance Profiles' }
    ],
    faqItems: [
      {
        question: 'Can I customize the resume template?',
        answer: 'Yes, choose from multiple professional templates and customize colors, fonts, and layout.'
      },
      {
        question: 'What if my experience is very limited?',
        answer: 'Our AI helps highlight skills, projects, and coursework to create an impressive first resume.'
      },
      {
        question: 'Can I download in other formats?',
        answer: 'Currently we support PDF download. You can convert to other formats after downloading.'
      }
    ]
  },
  {
    id: 'cover-letter-ai',
    name: 'AI Cover Letter',
    description: 'Generate tailored cover letters.',
    longDescription: 'AI-powered cover letter generator that creates professional letters tailored to specific job descriptions.',
    icon: Sparkles,
    category: 'ai',
    path: '/ai/cover-letter',
    seoTitle: 'AI Cover Letter Generator - Create Free Cover Letter',
    seoDescription: 'Generate professional cover letters with AI tailored to job descriptions instantly. Download as PDF online.',
    seoKeywords: ['cover letter generator', 'ai cover letter', 'cover letter maker', 'professional cover letter', 'job cover letter'],
    slug: 'cover-letter-ai',
    intro: 'Generate tailored professional cover letters instantly with AI. Perfect for every job application you submit.',
    howToSteps: [
      {
        title: 'Job Posting',
        description: 'Paste the job description you\'re applying to'
      },
      {
        title: 'Your Info',
        description: 'Enter your background and achievements'
      },
      {
        title: 'Generate',
        description: 'AI creates a tailored cover letter'
      },
      {
        title: 'Download & Apply',
        description: 'Download as PDF and submit with resume'
      }
    ],
    useCases: [
      { title: 'Job Applications' },
      { title: 'Career Transitions' },
      { title: 'Internship Positions' },
      { title: 'Cold Outreach' },
      { title: 'Company Inquiries' },
      { title: 'Contract Opportunities' }
    ],
    faqItems: [
      {
        question: 'How does the AI personalize cover letters?',
        answer: 'Our AI analyzes job descriptions and your background to highlight matching skills and achievements.'
      },
      {
        question: 'Can I edit the generated letter?',
        answer: 'Yes, the generated draft is a starting point. You can edit everything to match your voice.'
      },
      {
        question: 'What if the letter is too long?',
        answer: 'Most cover letters are 3-4 paragraphs. Trim to fit requirements while keeping key points.'
      }
    ]
  },
];
