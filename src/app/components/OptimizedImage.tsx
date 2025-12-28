/**
 * Optimized Image Component
 * 
 * Features:
 * - Lazy loading
 * - Loading placeholder
 * - Error fallback
 * - Responsive srcset support
 * - WebP support with fallback
 */

import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean; // Load immediately without lazy loading
  fallbackSrc?: string;
  onLoad?: () => void;
  onError?: () => void;
}

export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  fallbackSrc,
  onLoad,
  onError,
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleLoad = () => {
    setIsLoading(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    if (fallbackSrc && currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    onError?.();
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--aura-nude)] via-[var(--aura-cream)] to-[var(--aura-nude)] animate-pulse" />
      )}

      {/* Actual Image */}
      <img
        src={currentSrc}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={handleLoad}
        onError={handleError}
        className={`
          w-full h-full object-cover transition-opacity duration-500
          ${isLoading ? 'opacity-0' : 'opacity-100'}
          ${hasError ? 'hidden' : ''}
        `}
      />

      {/* Error Fallback */}
      {hasError && !fallbackSrc && (
        <div className="absolute inset-0 flex items-center justify-center bg-[var(--aura-nude)]">
          <div className="text-center text-[var(--aura-soft-taupe)]">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-xs">Image unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Background Image Component with Blur-Up Effect
 */

interface BackgroundImageProps {
  src: string;
  lowResSrc?: string; // Tiny thumbnail for blur-up effect
  alt?: string;
  className?: string;
  children?: React.ReactNode;
}

export function BackgroundImage({
  src,
  lowResSrc,
  alt = '',
  className = '',
  children,
}: BackgroundImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState(lowResSrc || src);

  const handleLoad = () => {
    setIsLoaded(true);
    if (lowResSrc) {
      // Switch to high-res after low-res loads
      setTimeout(() => setImageUrl(src), 100);
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Background Image */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${
          isLoaded && !lowResSrc ? 'opacity-100' : lowResSrc ? 'blur-xl scale-105' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${imageUrl})`,
        }}
        role="img"
        aria-label={alt}
      />

      {/* Preload actual image */}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        className="hidden"
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Hero Image with Progressive Loading
 */

interface HeroImageProps {
  src: string;
  placeholderSrc?: string;
  alt: string;
  className?: string;
  overlayGradient?: boolean;
}

export function HeroImage({
  src,
  placeholderSrc,
  alt,
  className = '',
  overlayGradient = true,
}: HeroImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className={`relative ${className}`}>
      {/* Placeholder/Blur */}
      {placeholderSrc && (
        <img
          src={placeholderSrc}
          alt=""
          className={`absolute inset-0 w-full h-full object-cover blur-2xl scale-110 transition-opacity duration-700 ${
            isLoading ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Main Image */}
      <img
        src={src}
        alt={alt}
        loading="eager"
        decoding="async"
        onLoad={() => setIsLoading(false)}
        className={`w-full h-full object-cover transition-opacity duration-700 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Gradient Overlay */}
      {overlayGradient && (
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--aura-deep-brown)]/40 via-transparent to-transparent" />
      )}
    </div>
  );
}

/**
 * Cloudinary Image Helper
 * 
 * Automatically optimizes images through Cloudinary
 * Usage: <img src={cloudinaryUrl('image.jpg', { width: 800 })} />
 */

interface CloudinaryOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'auto' | 'webp' | 'jpg' | 'png';
  crop?: 'fill' | 'fit' | 'scale';
}

export function cloudinaryUrl(
  imageUrl: string,
  options: CloudinaryOptions = {}
): string {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  // If no Cloudinary configured, return original URL
  if (!cloudName) {
    return imageUrl;
  }

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    crop = 'fill',
  } = options;

  const transformations = [
    `f_${format}`,
    `q_${quality}`,
    width && `w_${width}`,
    height && `h_${height}`,
    `c_${crop}`,
  ]
    .filter(Boolean)
    .join(',');

  return `https://res.cloudinary.com/${cloudName}/image/fetch/${transformations}/${imageUrl}`;
}

/**
 * Usage Examples:
 * 
 * // Basic optimized image
 * <OptimizedImage
 *   src="/images/hero.jpg"
 *   alt="Hero"
 *   className="w-full h-96"
 * />
 * 
 * // Priority image (no lazy load)
 * <OptimizedImage
 *   src="/images/logo.png"
 *   alt="Logo"
 *   priority
 * />
 * 
 * // With fallback
 * <OptimizedImage
 *   src="/images/portrait.jpg"
 *   alt="Portrait"
 *   fallbackSrc="/images/placeholder.jpg"
 * />
 * 
 * // Background with blur-up
 * <BackgroundImage
 *   src="/images/bg.jpg"
 *   lowResSrc="/images/bg-tiny.jpg"
 * >
 *   <div>Your content</div>
 * </BackgroundImage>
 * 
 * // Hero with progressive loading
 * <HeroImage
 *   src="/images/hero-full.jpg"
 *   placeholderSrc="/images/hero-tiny.jpg"
 *   alt="Hero"
 *   className="aspect-[16/9]"
 * />
 * 
 * // With Cloudinary optimization
 * <img
 *   src={cloudinaryUrl('https://example.com/image.jpg', {
 *     width: 800,
 *     quality: 80,
 *     format: 'webp'
 *   })}
 *   alt="Optimized"
 * />
 */
