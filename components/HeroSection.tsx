'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowDown, Flame, Award } from 'lucide-react';
import { LaurelWreathIcon } from '@/components/GreekOrnament';

interface HeroSectionProps {
  onExploreMenu?: () => void;
  onExploreCombos?: () => void;
  onQuickOrderHero?: () => void;
}

export function HeroSection({ onExploreMenu, onExploreCombos }: HeroSectionProps) {
  const handleAction = () => {
    if (onExploreCombos) {
      onExploreCombos();
    } else if (onExploreMenu) {
      onExploreMenu();
    }
  };

  return (
    <section
      id="hero"
      className="relative w-full max-w-full p-0 m-0 overflow-hidden cursor-pointer bg-[#f8f6f0]"
      onClick={handleAction}
    >
      {/* 1. Mobile Full-Bleed (fundohomemobile.png - 1536x2752) */}
      <div className="relative w-full aspect-[1536/2752] sm:hidden">
        <Image
          src="/fundohomemobile.png"
          alt="Teseu Burger Olimpo"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full select-none"
          sizes="100vw"
        />

        {/* Top Celestial Open Area Content */}
        <div className="absolute inset-x-0 top-0 z-20 flex flex-col items-center text-center pt-36 px-5 pointer-events-auto">


          <h1 className="font-display font-black text-3xl uppercase tracking-wider text-[#1c1c1c] drop-shadow-xs leading-[1.1] flex flex-col items-center gap-1.5">
            BEM-VINDO AO{' '}
            <span className="inline-flex items-center justify-center">
              <Image
                src="/logo.png"
                alt="Teseu Burger"
                width={220}
                height={68}
                priority
                referrerPolicy="no-referrer"
                className="h-12 w-auto object-contain drop-shadow-xs"
              />
            </span>
          </h1>

          <p className="text-sm text-neutral-800 font-semibold mt-2 leading-relaxed max-w-xs">
            Hambúrgueres artesanais dignos da realeza greco-romana.
          </p>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="mt-4 py-3.5 px-8 gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider rounded-full shadow-[0_6px_25px_rgba(205,156,32,0.45)] transition-all flex items-center gap-2 group cursor-pointer border border-[#CD9C20]/50"
          >
            <span>Iniciar Jornada</span>
            <ArrowDown className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
          </button>
        </div>
      </div>

      {/* 2. Desktop & Tablet Full-Bleed (fundohome.png - 2752x1536) */}
      <div className="hidden sm:block relative w-full aspect-[2752/1536] max-h-[92vh] overflow-hidden">
        <Image
          src="/fundohome.png"
          alt="Teseu Burger Olimpo"
          fill
          priority
          referrerPolicy="no-referrer"
          className="object-cover w-full h-full select-none"
          sizes="100vw"
        />

        {/* Left Side Content */}
        <div className="absolute inset-y-0 left-0 z-20 flex flex-col justify-center items-start text-left pl-8 md:pl-14 lg:pl-20 pr-6 max-w-xl lg:max-w-2xl pointer-events-auto">


          <h1 className="font-display font-black text-3xl md:text-5xl lg:text-6xl uppercase tracking-wider text-[#1c1c1c] drop-shadow-xs leading-[1.08] flex flex-col items-start gap-2">
            BEM-VINDO AO{' '}
            <span className="inline-flex items-center">
              <Image
                src="/logo.png"
                alt="Teseu Burger"
                width={340}
                height={104}
                priority
                referrerPolicy="no-referrer"
                className="h-14 md:h-20 lg:h-24 w-auto object-contain drop-shadow-xs"
              />
            </span>
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-neutral-800 font-medium mt-3 leading-relaxed max-w-lg">
            Hambúrgueres artesanais dignos da realeza greco-romana. Forjados no fogo sagrado com carnes nobres e ingredientes divinos.
          </p>



          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            className="mt-6 py-4 px-9 gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-xs md:text-sm uppercase tracking-wider rounded-full shadow-[0_8px_30px_rgba(205,156,32,0.4)] transition-all flex items-center gap-2.5 group cursor-pointer border border-[#CD9C20]/50"
          >
            <span>Iniciar Jornada</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform stroke-[2.5]" />
          </button>
        </div>
      </div>
    </section>
  );
}
