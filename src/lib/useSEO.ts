/**
 * SEO Metadata Hook
 * Provides reusable SEO metadata management for tool pages
 */

interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  pageUrl: string;
  imageUrl?: string;
  author?: string;
  locale?: string;
}

/**
 * Generate structured SEO metadata for tool pages
 * Returns object with all necessary meta tags and structured data
 */
export function useSEO(config: SEOConfig) {
  const {
    title,
    description,
    keywords,
    pageUrl,
    imageUrl = 'https://careersuite.io/og-image.png',
    author = 'CareerSuite',
    locale = 'en_US'
  } = config;

  // Validate length
  if (title.length > 60) {
    console.warn(
      `SEO Warning: Title exceeds 60 characters (${title.length} chars)`
    );
  }
  if (description.length < 120 || description.length > 160) {
    console.warn(
      `SEO Warning: Description should be 120-160 characters (${description.length} chars)`
    );
  }

  // Generate structured data (JSON-LD)
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: title,
    description: description,
    keywords: keywords.join(', '),
    url: pageUrl,
    image: imageUrl,
    author: {
      '@type': 'Organization',
      name: 'CareerSuite'
    },
    applicationCategory: 'Utility',
    operatingSystem: 'Web'
  };

  // Return metadata object for use in components
  return {
    // For Helmet
    helmet: {
      title: title,
      meta: [
        { name: 'description', content: description },
        { name: 'keywords', content: keywords.join(', ') },
        { name: 'author', content: author },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },

        // Open Graph tags
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: title },
        { property: 'og:description', content: description },
        { property: 'og:url', content: pageUrl },
        { property: 'og:image', content: imageUrl },
        { property: 'og:locale', content: locale },

        // Twitter tags
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: title },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },

        // Additional SEO
        { name: 'robots', content: 'index, follow' },
        { name: 'canonical', content: pageUrl }
      ],
      link: [
        { rel: 'canonical', href: pageUrl }
      ]
    },

    // For manual meta tag creation or verification
    meta: {
      title,
      description,
      keywords,
      pageUrl,
      imageUrl,
      author,
      locale
    },

    // Structured data (JSON-LD)
    structuredData
  };
}

/**
 * Generate meta tags array directly for Helmet component
 * Simpler alternative to useSEO for quick implementations
 */
export function generateMetaTags(config: SEOConfig) {
  const seoData = useSEO(config);
  return seoData.helmet;
}

/**
 * Escape special characters in strings for Meta tags
 */
export function escapeMeta(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Generate slug from tool name for URL consistency
 */
export function generateToolSlug(toolName: string): string {
  return toolName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
}
