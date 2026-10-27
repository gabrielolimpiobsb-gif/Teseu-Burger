import React from 'react';
import Image from 'next/image';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';

export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col items-center justify-center p-6 text-center select-none relative overflow-hidden">
      {/* Top Golden Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-[#f0e4cb] overflow-hidden z-50">
        <div className="h-full bg-gradient-to-r from-[#CD9C20] via-[#F5CB5C] to-[#CD9C20] w-full animate-[progress_1.2s_ease-in-out_infinite]" />
      </div>

      <div className="max-w-md w-full flex flex-col items-center justify-center">
        {/* Official Brand Logo */}
        <div className="relative h-14 w-52 sm:h-16 sm:w-64 mb-6">
          <Image
            src="/logo.png"
            alt="Teseu Burger"
            fill
            priority
            referrerPolicy="no-referrer"
            className="object-contain"
            sizes="256px"
          />
        </div>

        {/* Animated Spartan Golden Spinner */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border-3 border-[#CD9C20]/25 border-t-[#CD9C20] animate-spin" />
          <SpartanHelmetIcon size={32} color="#CD9C20" className="animate-pulse" />
        </div>

        {/* Brand Laurel Tag */}
        <div className="inline-flex items-center gap-2 mb-2 text-[#CD9C20]">
          <LaurelWreathIcon size={16} color="#CD9C20" />
          <span className="text-[11px] font-ancient font-bold tracking-[0.25em] uppercase">
            PORTAIS DO OLIMPO
          </span>
          <LaurelWreathIcon size={16} color="#CD9C20" />
        </div>

        <h2 className="font-display font-black text-xl sm:text-2xl uppercase tracking-wider text-[#1c1c1c] leading-tight">
          CARREGANDO O PEDIDO...
        </h2>

        <p className="text-xs sm:text-sm text-neutral-600 mt-2 font-ancient">
          Forjando os cortes nobres na chapa viva a 230°C
        </p>

        {/* 3 Bouncing Golden Dots */}
        <div className="flex items-center gap-2 mt-6">
          <span className="w-2.5 h-2.5 rounded-full bg-[#CD9C20] animate-bounce [animation-delay:-0.3s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#CD9C20] animate-bounce [animation-delay:-0.15s]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#CD9C20] animate-bounce" />
        </div>
      </div>
    </div>
  );
}
