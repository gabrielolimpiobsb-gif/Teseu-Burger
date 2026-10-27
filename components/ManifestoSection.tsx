'use client';

import React from 'react';
import { BurgerGraphic } from '@/components/BurgerGraphics';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';

export function ManifestoSection() {
  return (
    <section className="bg-white text-[#1c1c1c] overflow-hidden border-b border-[#CD9C20]/30 relative">
      {/* Decorative background laurel */}
      <div className="absolute top-1/2 left-4 -translate-y-1/2 opacity-10 pointer-events-none hidden lg:block">
        <LaurelWreathIcon size={300} color="#CD9C20" />
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 items-center relative z-10">
        {/* Left: Manifesto Typography in Travertine Stone */}
        <div className="md:col-span-8 p-8 sm:p-14 lg:p-16 bg-gradient-to-r from-[#FFFFFF] via-[#FBF9F5] to-[#F2ECDD]">
          <div className="inline-flex items-center gap-2 mb-3 text-xs font-ancient font-bold tracking-widest text-[#CD9C20] uppercase">
            <SpartanHelmetIcon size={16} color="#CD9C20" />
            <span>LEI DO TEMPLO // CÓDIGO DE HONRA</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-display uppercase tracking-tight leading-[0.98] text-[#1c1c1c]">
            GREAT BURGERS DON&apos;T HAPPEN BY ACCIDENT.
          </h2>

          <p className="mt-3 text-sm sm:text-base font-ancient font-bold text-[#CD9C20] tracking-widest uppercase">
            SEM ATALHOS. SEM CARNE PROCESSADA. SEM ENROLAÇÃO.
          </p>

          <p className="mt-4 text-xs sm:text-sm text-neutral-700 max-w-xl leading-relaxed font-normal">
            Como os artesãos que talhavam o mármore do Panteão, não aceitamos atalhos industriais. Cada smash patty é prensado com o peso do ferro fundido sob o fogo incandescente, selando cada gota de sabor para o seu banquete.
          </p>
        </div>

        {/* Right: Macro burger cutaway visual on basalt stone pedestal */}
        <div className="md:col-span-4 bg-[#333533] p-6 sm:p-10 flex items-center justify-center min-h-[260px] md:min-h-full border-t md:border-t-0 md:border-l border-[#CD9C20]/40">
          <div className="transform transition-transform duration-500 hover:scale-105">
            <BurgerGraphic type="melt" size={210} />
          </div>
        </div>
      </div>
    </section>
  );
}
