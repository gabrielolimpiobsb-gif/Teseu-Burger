'use client';

import React from 'react';
import { BurgerGraphic } from '@/components/BurgerGraphics';
import { LaurelWreathIcon, ParthenonIcon } from '@/components/GreekOrnament';
import { ArrowRight, Sparkles } from 'lucide-react';

interface SplitBannerProps {
  onOrderSeasonal: () => void;
}

export function SplitBanner({ onOrderSeasonal }: SplitBannerProps) {
  return (
    <section className="relative bg-[#f5f5f5] overflow-hidden border-b border-[#CD9C20]/25">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* Left Column: Classical Feast Experience in Travertine Marble */}
        <div className="relative min-h-[380px] sm:min-h-[440px] bg-gradient-to-br from-[#FFFFFF] via-[#FBF9F5] to-[#F2ECDD] p-8 sm:p-14 flex flex-col justify-end overflow-hidden group border-b lg:border-b-0 lg:border-r border-[#CD9C20]/30 text-[#1c1c1c]">
          <div className="absolute top-8 right-8 z-10 opacity-40">
            <BurgerGraphic type="melt" size={240} />
          </div>

          <div className="relative z-20 max-w-md">
            <div className="inline-flex items-center gap-1.5 text-xs font-ancient font-bold uppercase tracking-widest text-[#CD9C20] mb-2">
              <LaurelWreathIcon size={16} color="#CD9C20" />
              <span>Experiência Triunfal</span>
            </div>
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-display uppercase tracking-tight text-[#1c1c1c] mb-2 leading-none">
              SEMPRE SUCULENTO
            </h3>
            <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-normal">
              A mordida que estala e o queijo que flui como néctar dourado. Para quem não aceita nada menos que a perfeição de um monumento.
            </p>
          </div>
        </div>

        {/* Right Column: Imperial Basalt & Apollo Seasonal Drops Banner */}
        <div className="relative min-h-[380px] sm:min-h-[440px] bg-gradient-to-br from-[#333533] via-[#292b29] to-[#1c1e1c] p-8 sm:p-14 flex flex-col justify-between overflow-hidden text-[#F2ECDD]">
          <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#F5CB5C]/15 blur-3xl pointer-events-none rounded-full" />

          <div className="absolute top-6 right-6 sm:top-8 sm:right-8 transform transition-transform duration-500 hover:rotate-6">
            <BurgerGraphic type="fury" size={170} />
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#0B0B0B]/80 border border-[#CD9C20]/60 px-3.5 py-1 rounded-full text-[11px] font-ancient font-bold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5 text-[#F5CB5C]" />
              <span className="text-[#F5CB5C]">Drop Sagrado de Apolo</span>
            </div>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-display uppercase tracking-tight leading-[1] max-w-md text-[#F2ECDD]">
              DROPS SAZONAIS & EXPERIMENTOS DO OLIMPO
            </h3>
          </div>

          <div className="relative z-10 mt-8">
            <p className="text-xs sm:text-sm text-neutral-300 max-w-sm mb-6 leading-relaxed font-normal">
              Descubra o Apollo Truffle Royale Drop: blend duplo na chapa, queijo emmental suíço, cogumelos salteados e azeite trufado. Disponível apenas este mês.
            </p>

            <button
              type="button"
              onClick={onOrderSeasonal}
              className="py-3 px-6 gold-gradient-bg hover:brightness-110 active:scale-95 text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-[0_4px_20px_rgba(245,203,92,0.35)] transition-all flex items-center gap-2 w-fit"
            >
              <span>PROVAR OFERENDA DO MÊS</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
