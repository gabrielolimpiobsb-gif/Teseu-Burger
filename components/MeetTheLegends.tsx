'use client';

import React from 'react';
import Link from 'next/link';
import { MenuItem } from '@/types/burger';
import { ProductImage } from '@/components/ProductImage';
import { LaurelWreathIcon, AmphoraIcon } from '@/components/GreekOrnament';
import { Sparkles, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { RouletteTourMiniAnimation } from '@/components/RouletteTourMiniAnimation';

interface MeetTheLegendsProps {
  legends?: MenuItem[];
  combos?: MenuItem[];
}

export function MeetTheLegends({ legends, combos }: MeetTheLegendsProps) {
  const { startNavigation } = useCart();

  // Exibe apenas 1 único combo com brinde (Combo Casal)
  const displayCombos =
    combos && combos.length > 0
      ? combos.slice(0, 1)
      : (legends || []).filter((item) => item.category === 'combos' || item.id === 'combo-casal').slice(0, 1);

  return (
    <section
      id="lendas"
      className="relative py-14 sm:py-20 bg-[#141414] text-[#F2ECDD] border-b border-[#CD9C20]/40 overflow-hidden w-full max-w-full"
    >
      {/* Anchor for combos-especiais navigation */}
      <span id="combos-especiais" className="absolute -top-10" />

      {/* Classical Ornaments in Gold */}
      <div className="absolute top-10 left-8 opacity-40 pointer-events-none hidden lg:flex items-center gap-3">
        <AmphoraIcon size={32} color="#CD9C20" />
        <span className="text-[10px] font-ancient tracking-widest text-[#CD9C20] font-bold uppercase">
          OFERENDA SAGRADA
        </span>
      </div>

      <div className="absolute top-10 right-8 opacity-40 pointer-events-none hidden lg:flex items-center gap-3">
        <span className="text-[10px] font-ancient tracking-widest text-[#CD9C20] font-bold uppercase">
          DOCE GRÁTIS INCLUSO
        </span>
        <LaurelWreathIcon size={32} color="#CD9C20" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-10">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LaurelWreathIcon size={18} color="#F5CB5C" />
            <span className="text-[10px] sm:text-xs font-ancient font-bold text-[#F5CB5C] uppercase tracking-widest">
              Banquete dos Deuses para Dois
            </span>
            <LaurelWreathIcon size={18} color="#F5CB5C" />
          </div>

          <h2 className="text-xl sm:text-3xl md:text-5xl font-display uppercase tracking-tight text-white">
            MONTE SEU COMBO CASAL + DOCE GRÁTIS
          </h2>

          <div className="w-24 sm:w-28 h-0.5 bg-gradient-to-r from-transparent via-[#CD9C20] to-transparent mx-auto my-2.5 sm:my-3" />

          {/* Animação de Tour de como a Roleta funciona */}
          <div className="mt-2 sm:mt-3">
            <RouletteTourMiniAnimation />
          </div>
        </div>

        {/* 1 ÚNICO COMBO CASAL DESTACADO */}
        <div className="max-w-2xl mx-auto">
          {displayCombos.map((item) => {
            const targetUrl = `/produto/${item.id}`;

            return (
              <div
                key={item.id}
                className="bg-gradient-to-b from-[#221B12] via-[#1A1610] to-[#14110C] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border-2 border-[#CD9C20] hover:border-[#F5CB5C] flex flex-col md:flex-row transition-all relative group"
              >
                {/* Preview Image */}
                <Link
                  href={targetUrl}
                  onClick={() => startNavigation(item.name)}
                  className="block relative p-4 sm:p-6 md:w-2/5 flex flex-col items-center justify-center cursor-pointer bg-black/30"
                >
                  <div className="w-full my-2">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      imageCodeHint={item.image || '/combocasal.png'}
                      className="w-full h-36 sm:h-44 md:h-52"
                    />
                  </div>
                </Link>

                {/* Card Content & Highlights */}
                <div className="p-4 sm:p-6 md:w-3/5 flex-1 flex flex-col justify-between bg-[#191919] border-t md:border-t-0 md:border-l border-[#CD9C20]/40">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="inline-flex items-center gap-1 bg-[#CD9C20]/20 border border-[#CD9C20]/60 text-[#F5CB5C] text-[10px] sm:text-xs font-ancient font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                        <Gift className="w-3.5 h-3.5 text-[#F5CB5C]" />
                        Exclusivo Casal
                      </span>
                      <span className="text-xs text-neutral-400 font-ancient">Serve 2 pessoas</span>
                    </div>

                    <Link
                      href={targetUrl}
                      onClick={() => startNavigation(item.name)}
                      className="block group-hover:text-white"
                    >
                      <h3 className="font-display text-base sm:text-xl uppercase tracking-wider text-[#F5CB5C] leading-snug transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-xs text-neutral-300 mt-2 leading-relaxed">
                        {item.description}
                      </p>
                    </Link>
                  </div>

                  {/* Bottom: Price & Button */}
                  <div className="pt-3.5 mt-4 border-t border-white/10 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[9px] text-neutral-400 uppercase font-ancient block">Preço do Combo</span>
                      <span className="font-sans font-black text-lg sm:text-2xl text-white whitespace-nowrap">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <Link
                      href={targetUrl}
                      onClick={() => startNavigation(item.name)}
                      className="px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl gold-gradient-bg text-[#0B0B0B] font-ancient font-black text-xs sm:text-sm uppercase tracking-wider flex items-center gap-1.5 shadow-lg hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <span>Montar Combo Casal</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
