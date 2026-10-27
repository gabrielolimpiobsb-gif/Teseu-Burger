'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDown } from 'lucide-react';

interface HeroSectionProps {
  onExploreMenu: () => void;
  onQuickOrderHero?: () => void;
}

export function HeroSection({ onExploreMenu }: HeroSectionProps) {
  return (
    <section
      id="hero"
      className="relative w-full p-0 m-0 overflow-hidden cursor-pointer bg-[#f4eedf]"
      onClick={onExploreMenu}
    >
      {/* 1. Mobile Full-Bleed (fundohomemobile.png) */}
      <div className="relative w-full aspect-[1536/2752] sm:hidden">
        <Image
          src="/fundohomemobile.png"
          alt="Teseu Burger"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full"
          sizes="100vw"
        />

        {/* Ambient Subtle Filter Scrim across image */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Overlay Content with Filter Gradient: Frase Principal + Subtítulo + Botão Iniciar Jornada */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end items-center pb-8 px-5 text-center bg-gradient-to-t from-[#f4eedf] via-[#f4eedf]/90 to-transparent pt-28 pointer-events-auto">
          <h1 className="font-display font-black text-2xl uppercase tracking-wider text-[#1c1c1c] drop-shadow-xs leading-tight">
            BEM-VINDO AO OLIMPO
          </h1>

          <p className="text-xs text-neutral-800 font-medium mt-1 leading-snug max-w-xs">
            Hambúrgueres artesanais dignos da realeza greco-romana.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExploreMenu();
            }}
            className="mt-4 py-3.5 px-8 gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider rounded-full shadow-[0_6px_25px_rgba(205,156,32,0.45)] transition-all flex items-center gap-2 group cursor-pointer border border-[#CD9C20]/50"
          >
            <span>Iniciar Jornada</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Desktop & Tablet Full-Bleed (fundohome.png) */}
      <div className="hidden sm:block relative w-full aspect-[2752/1536] max-h-[92vh]">
        <Image
          src="/fundohome.png"
          alt="Teseu Burger"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full"
          sizes="100vw"
        />

        {/* Ambient Subtle Filter Scrim across image */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" />

        {/* Overlay Content with Filter Gradient */}
        <div className="absolute inset-x-0 bottom-0 z-20 flex flex-col justify-end items-center pb-8 md:pb-10 px-6 text-center bg-gradient-to-t from-[#f4eedf] via-[#f4eedf]/85 to-transparent pt-32 pointer-events-auto">
          <h1 className="font-display font-black text-3xl md:text-4xl uppercase tracking-wider text-[#1c1c1c] drop-shadow-xs leading-tight">
            BEM-VINDO AO OLIMPO
          </h1>

          <p className="text-sm md:text-base text-neutral-800 font-medium mt-1.5 leading-relaxed max-w-lg">
            Hambúrgueres artesanais dignos da realeza greco-romana.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onExploreMenu();
            }}
            className="mt-4 py-3.5 px-10 gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-[0_6px_25px_rgba(205,156,32,0.45)] transition-all flex items-center gap-2 group cursor-pointer border border-[#CD9C20]/50"
          >
            <span>Iniciar Jornada</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
