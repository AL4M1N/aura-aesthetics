import { useCallback, useEffect } from 'react';
import { seoService, type SEOData } from '../../services/seoService';
import { usePersistentCache } from '../../hooks/usePersistentCache';

interface SEOHeadProps {
  pageType: string;
  pageIdentifier?: string;
  fallbackTitle?: string;
  fallbackDescription?: string;
  fallbackKeywords?: string;
}

export function SEOHead({ 
  pageType, 
  pageIdentifier, 
  fallbackTitle = 'Aura Aesthetics',
  fallbackDescription = 'Professional aesthetic treatments and beauty services',
  fallbackKeywords = 'aesthetics, beauty, skincare, treatments'
}: SEOHeadProps) {
  const cacheKey = `seo-${pageType}${pageIdentifier ? `-${pageIdentifier}` : ''}`;

  // Memoize the fetcher function to prevent infinite dependency cycles
  const fetcher = useCallback(async () => {
    const resp = await seoService.getPublicSEOData(pageType, pageIdentifier);
    return resp.success ? (resp.data ?? null) : null;
  }, [pageType, pageIdentifier]);

  const { data: seoData } = usePersistentCache<SEOData | null>(
    cacheKey,
    fetcher,
    { ttl: 5 * 60 * 1000, persistToLocalStorage: true }
  );

  useEffect(() => {
    const apply = (data: SEOData | null) => {
      try {
        const title = data?.title || fallbackTitle;
        document.title = title;

        const updateMetaTag = (name: string, content: string) => {
          let meta = document.querySelector(`meta[name=\"${name}\"]`) as HTMLMetaElement | null;
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('name', name);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        };

        const updatePropertyTag = (property: string, content: string) => {
          let meta = document.querySelector(`meta[property=\"${property}\"]`) as HTMLMetaElement | null;
          if (!meta) {
            meta = document.createElement('meta');
            meta.setAttribute('property', property);
            document.head.appendChild(meta);
          }
          meta.setAttribute('content', content);
        };

        updateMetaTag('description', data?.description || fallbackDescription);
        updateMetaTag('keywords', data?.keywords || fallbackKeywords);

        updatePropertyTag('og:title', data?.og_title || data?.title || fallbackTitle);
        updatePropertyTag('og:description', data?.og_description || data?.description || fallbackDescription);
        updatePropertyTag('og:type', 'website');
        updatePropertyTag('og:url', window.location.href);

        if (data?.og_image) {
          updatePropertyTag('og:image', data.og_image);
          updatePropertyTag('og:image:width', '1200');
          updatePropertyTag('og:image:height', '630');
        }

        updateMetaTag('twitter:card', 'summary_large_image');
        updateMetaTag('twitter:title', data?.og_title || data?.title || fallbackTitle);
        updateMetaTag('twitter:description', data?.og_description || data?.description || fallbackDescription);
        if (data?.og_image) updateMetaTag('twitter:image', data.og_image);

        updateMetaTag('robots', 'index, follow');
        updateMetaTag('viewport', 'width=device-width, initial-scale=1');
      } catch (err) {
        console.error('Error applying SEO meta tags', err);
      }
    };

    apply(seoData ?? null);
  }, [seoData, fallbackTitle, fallbackDescription, fallbackKeywords]);

  return null;
}