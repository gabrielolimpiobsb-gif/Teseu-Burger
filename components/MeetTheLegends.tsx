'use client';

import React from 'react';
import Link from 'next/link';
import { MenuItem } from '@/types/burger';
import { ProductImage } from '@/components/ProductImage';
import { LaurelWreathIcon, AmphoraIcon } from '@/components/GreekOrnament';
import { Sparkles, ArrowRight, Gift } from 'lucide-react';
import { useCart } from '@/context/CartContext';

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
        </div>

        {/* 1 ÚNICO COMBO CASAL DESTACADO (OTIMIZADO PARA MOBILE & DESKTOP) */}
        <div className="max-w-xl mx-auto px-1 sm:px-0">
          {displayCombos.map((item) => {
            const targetUrl = `/produto/${item.id}`;

            return (
              <div
                key={item.id}
                className="bg-white text-[#1c1c1c] rounded-2xl overflow-hidden shadow-xl border-2 border-[#CD9C20] hover:border-[#F5CB5C] flex flex-col md:flex-row transition-all relative group"
              >
                {/* Preview Image (Selector 10) */}
                <Link
                  href={targetUrl}
                  onClick={() => startNavigation(item.name)}
                  className="block relative p-2.5 sm:p-4 md:w-[42%] flex flex-col items-center justify-center cursor-pointer bg-white shrink-0"
                >
                  <div className="w-full my-0.5 sm:my-1 rounded-xl bg-[#FAF8F5]">
                    <ProductImage
                      src={item.image}
                      alt={item.name}
                      imageCodeHint={item.image || '/combocasal.png'}
                      className="w-full h-36 sm:h-40 md:h-44 shadow-sm bg-[#FAF8F5]"
                    />
                  </div>
                </Link>

                {/* Card Content & Highlights (Selector 9) */}
                <div className="p-3.5 sm:p-4 md:p-5 md:w-[58%] flex-1 flex flex-col justify-between bg-white border-t md:border-t-0 md:border-l border-[#CD9C20]/30">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="inline-flex items-center gap-1 bg-[#FDF8EB] border border-[#CD9C20]/50 text-[#996D09] text-[10px] font-ancient font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                        <Gift className="w-3 h-3 text-[#CD9C20]" />
                        Exclusivo Casal
                      </span>
                      <span className="text-[11px] text-neutral-500 font-ancient">Serve 2 pessoas</span>
                    </div>

                    <Link
                      href={targetUrl}
                      onClick={() => startNavigation(item.name)}
                      className="block group-hover:text-[#996D09]"
                    >
                      <h3 className="font-display text-sm sm:text-base md:text-lg uppercase tracking-wider text-[#1c1c1c] group-hover:text-[#996D09] leading-snug transition-colors">
                        {item.name}
                      </h3>

                      <p className="text-[11px] sm:text-xs text-neutral-600 mt-1 sm:mt-1.5 leading-relaxed line-clamp-2 sm:line-clamp-none">
                        {item.description}
                      </p>
                    </Link>
                  </div>

                  {/* Bottom: Price & Button */}
                  <div className="pt-2.5 mt-3 border-t border-neutral-200 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[8px] sm:text-[9px] text-neutral-500 uppercase font-ancient block">Preço do Combo</span>
                      <span className="font-sans font-black text-base sm:text-xl text-[#1c1c1c] whitespace-nowrap">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <Link
                      href={targetUrl}
                      onClick={() => startNavigation(item.name)}
                      className="px-3.5 py-2 sm:px-4 sm:py-2 rounded-lg gold-gradient-bg text-[#0B0B0B] font-ancient font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all shrink-0 cursor-pointer"
                    >
                      <span>Montar Combo Casal</span>
                      <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
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
