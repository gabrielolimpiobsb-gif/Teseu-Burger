'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, Utensils } from 'lucide-react';
import { SpartanHelmetIcon } from './GreekOrnament';

interface BurgerGraphicProps {
  type?: string;
  imageSrc?: string | null;
  className?: string;
  size?: number | string;
  highlightLayer?: string | null;
  alt?: string;
}

/**
 * Clean product image container slot replacing the artificial SVG illustrations.
 * Automatically displays image files placed in /public (e.g. /zeus.png, /atena.png, etc.)
 * or renders a clean photo slot ready for the user to add images.
 */
export function BurgerGraphic({
  type = 'zeus',
  imageSrc,
  className = '',
  size = 180,
  alt,
}: BurgerGraphicProps) {
  const [imgError, setImgError] = useState(false);

  // Map known types to friendly image filenames
  const defaultImageMap: Record<string, string> = {
    zeus: '/zeus.png',
    atena: '/atena.png',
    apolo: '/apolo.png',
    afrodite: '/afrodite.png',
    ares: '/ares.png',
    hermes: '/hermes.png',
    hercules: '/hercules.png',
    combo: '/combo.png',
    fries: '/batatas.png',
    shake: '/nectar.png',
    dessert: '/doce.png',
    nuggets: '/nuggets.png',
    classic: '/zeus.png',
    fury: '/atena.png',
    melt: '/hercules.png',
    bacon: '/ares.png',
    onion: '/apolo.png',
  };

  const resolvedSrc = imageSrc || defaultImageMap[type] || `/${type}.png`;
  const label = alt || type.toUpperCase();

  const widthStyle = typeof size === 'number' ? `${size}px` : size;
  const heightStyle = typeof size === 'number' ? `${size}px` : size;

  if (resolvedSrc && !imgError) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl flex items-center justify-center ${className}`}
        style={{ width: widthStyle, height: heightStyle }}
      >
        <Image
          src={resolvedSrc}
          alt={label}
          fill
          referrerPolicy="no-referrer"
          className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Elegant, clean photo frame placeholder for user image files
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#1c1c1c] to-[#121212] border border-[#CD9C20]/40 p-3 flex flex-col items-center justify-center text-center shadow-md group-hover:border-[#CD9C20] transition-all select-none ${className}`}
      style={{ width: widthStyle, height: heightStyle }}
    >
      <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
        <SpartanHelmetIcon size={typeof size === 'number' ? Math.min(size * 0.5, 70) : 50} color="#CD9C20" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-1">
        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-black/60 border border-[#CD9C20]/50 flex items-center justify-center shadow text-[#F5CB5C]">
          <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-[#F5CB5C]" />
        </div>
        <span className="text-[10px] sm:text-xs font-ancient font-bold text-[#F5CB5C] uppercase tracking-wide truncate max-w-full px-1">
          {label}
        </span>
        <span className="text-[8px] sm:text-[9px] font-mono px-2 py-0.5 rounded bg-black/80 text-neutral-300 border border-[#CD9C20]/20 truncate max-w-full">
          {resolvedSrc}
        </span>
      </div>
    </div>
  );
}
