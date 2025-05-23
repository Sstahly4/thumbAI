"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface AspectRatioImageProps {
  src: string;
  alt: string;
  fallbackSrc?: string;
  className?: string;
  onLoad?: () => void;
  onError?: (e: React.SyntheticEvent<HTMLImageElement, Event>) => void;
}

/**
 * Component that displays an image in 16:9 aspect ratio (YouTube thumbnail)
 * by cropping a 1536x1024 image from OpenAI to maintain the important center content
 */
export default function AspectRatioImage({
  src,
  alt,
  fallbackSrc,
  className = "",
  onLoad,
  onError
}: AspectRatioImageProps) {
  const [error, setError] = useState(false);
  
  // Handle error and switch to fallback if provided
  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    console.error(`Failed to load image at ${src}`);
    setError(true);
    if (onError) onError(e);
  };
  
  // Reset error state if src changes
  useEffect(() => {
    setError(false);
  }, [src]);
  
  return (
    <div className={`relative w-full overflow-hidden ${className}`} style={{ aspectRatio: '16/9' }}>
      <div className="absolute w-full h-full flex items-center justify-center">
        <div 
          className="relative w-full h-full" 
          style={{ 
            // This container maintains the original image's aspect ratio within the 16:9 container
            aspectRatio: '16/9',
            overflow: 'hidden'
          }}
        >
          <Image
            src={error && fallbackSrc ? fallbackSrc : src}
            alt={alt}
            fill
            className="object-cover" // Fills the container while maintaining aspect ratio
            onError={handleError}
            onLoad={onLoad}
            style={{
              objectPosition: 'center', // Center the image to keep important content visible
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={true} // For better LCP
          />
        </div>
      </div>
    </div>
  );
} 