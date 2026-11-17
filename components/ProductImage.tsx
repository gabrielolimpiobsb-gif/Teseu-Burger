'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera } from 'lucide-react';
import { SpartanHelmetIcon } from './GreekOrnament';

interface ProductImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  size?: number | string;
  imageCodeHint?: string;
  badge?: string;
  priority?: boolean;
}

export function ProductImage({
  src,
  alt,
  className = '',
  size,
  imageCodeHint,
  badge,
  priority = false,
}: ProductImageProps) {
  const [useNativeImg, setUseNativeImg] = useState(false);
  const [imgError, setImgError] = useState(false);

  // If a valid src is provided and has not completely failed
  const hasValidImage = Boolean(src) && !imgError;

  return (
    <div
      className={`relative overflow-hidden rounded-xl flex items-center justify-center select-none bg-[#FAF8F5] ${className}`}
      style={
        size
          ? {
              width: typeof size === 'number' ? `${size}px` : size,
              height: typeof size === 'number' ? `${size}px` : size,
            }
          : undefined
      }
    >
      {hasValidImage ? (
        !useNativeImg ? (
          <Image
            src={src!}
            alt={alt}
            fill
            priority={priority}
            unoptimized={true}
            referrerPolicy="no-referrer"
            className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={() => setUseNativeImg(true)}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src!}
            alt={alt}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105 absolute inset-0"
            onError={() => setImgError(true)}
          />
        )
      ) : (
        /* Clean, professional placeholder frame specifically designed for the user to drop images */
        <div className="w-full h-full min-h-[110px] sm:min-h-[150px] bg-gradient-to-b from-[#FAF8F5] to-[#EFECE4] border border-[#CD9C20]/35 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-inner group-hover:border-[#CD9C20] transition-colors relative">
          {/* Subtle Greek accent in background */}
          <div className="absolute inset-0 opacity-10 flex items-center justify-center pointer-events-none">
            <SpartanHelmetIcon size={70} color="#CD9C20" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center space-y-1.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white border border-[#CD9C20]/40 flex items-center justify-center shadow-sm text-[#996D09]">
              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-[#CD9C20]" />
            </div>

            <span className="text-[10px] sm:text-xs font-ancient font-bold uppercase tracking-wider text-[#1c1c1c] block">
              {alt}
            </span>

            <span className="text-[9px] sm:text-[10px] font-mono px-2 py-0.5 rounded bg-white border border-[#CD9C20]/30 text-neutral-600 block">
              {imageCodeHint || 'Adicionar Imagem'}
            </span>
          </div>
        </div>
      )}

      {badge && (
        <span className="absolute top-2 left-2 z-10 gold-gradient-bg text-[#0B0B0B] text-[9px] font-ancient font-black uppercase px-2 py-0.5 rounded shadow-sm">
          {badge}
        </span>
      )}
    </div>
  );
}
