'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';

export function NavigationLoadingOverlay() {
  const { isNavigating, navigatingItemName, stopNavigation } = useCart();
  const pathname = usePathname();

  // Reset loading when route changes
  useEffect(() => {
    stopNavigation();
  }, [pathname, stopNavigation]);

  // Safety timer to prevent hanging indefinitely
  useEffect(() => {
    if (isNavigating) {
      const timer = setTimeout(() => {
        stopNavigation();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isNavigating, stopNavigation]);

  if (!isNavigating) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF7F0]/90 backdrop-blur-md animate-in fade-in duration-150 select-none cursor-wait">
      {/* Top Golden Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-[#f0e4cb] overflow-hidden z-50">
        <div className="h-full bg-gradient-to-r from-[#CD9C20] via-[#F5CB5C] to-[#CD9C20] w-full animate-[progress_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="flex flex-col items-center justify-center max-w-sm px-6 text-center">
        {/* Official Brand Logo */}
        <div className="relative h-12 w-48 sm:h-14 sm:w-56 mb-6">
          <Image
            src="/logo.png"
            alt="Teseu Burger"
            fill
            priority
            referrerPolicy="no-referrer"
            className="object-contain"
            sizes="224px"
          />
        </div>

        {/* Golden Animated Spinner with Spartan/Laurel Theme */}
        <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-3 border-[#CD9C20]/25 border-t-[#CD9C20] animate-spin" />
          <SpartanHelmetIcon size={26} color="#CD9C20" className="animate-pulse" />
        </div>

        {/* Loading Headings */}
        <span className="text-[10px] font-ancient font-bold tracking-[0.25em] text-[#CD9C20] uppercase mb-1 flex items-center gap-1.5">
          <LaurelWreathIcon size={14} color="#CD9C20" />
          <span>PORTAIS DO OLIMPO</span>
          <LaurelWreathIcon size={14} color="#CD9C20" />
        </span>

        <h3 className="font-display font-bold text-lg sm:text-xl uppercase tracking-wider text-[#1c1c1c] leading-tight">
          {navigatingItemName ? `Preparando ${navigatingItemName}...` : 'Carregando o Pedido...'}
        </h3>

        <p className="text-xs text-neutral-600 mt-1.5 font-ancient">
          Forjando os cortes nobres na chapa viva a 230°C
        </p>

        {/* Animated 3 golden dots */}
        <div className="flex items-center gap-1.5 mt-4">
          <span className="w-2 h-2 rounded-full bg-[#CD9C20] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2 h-2 rounded-full bg-[#CD9C20] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2 h-2 rounded-full bg-[#CD9C20] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
