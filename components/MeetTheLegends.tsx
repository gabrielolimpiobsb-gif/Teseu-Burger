'use client';

import React from 'react';
import Link from 'next/link';
import { MenuItem } from '@/types/burger';
import { BurgerGraphic } from '@/components/BurgerGraphics';
import { LaurelWreathIcon, AmphoraIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { Plus } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '@/context/CartContext';

interface MeetTheLegendsProps {
  legends: MenuItem[];
}

export function MeetTheLegends({ legends }: MeetTheLegendsProps) {
  const { startNavigation } = useCart();
  return (
    <section id="lendas" className="relative py-24 bg-white text-[#1c1c1c] border-b border-[#CD9C20]/25 overflow-hidden">
      {/* Classical Amphora & Laurel side ornaments from IMG-20261023-WA0001 & WA0002 */}
      <div className="absolute top-10 left-8 opacity-60 pointer-events-none hidden lg:flex items-center gap-3">
        <AmphoraIcon size={32} color="#CD9C20" />
        <span className="text-[10px] font-ancient tracking-widest text-[#CD9C20] font-bold uppercase">
          SELEÇÃO DO OLIMPO
        </span>
      </div>

      <div className="absolute top-10 right-8 opacity-60 pointer-events-none hidden lg:flex items-center gap-3">
        <span className="text-[10px] font-ancient tracking-widest text-[#CD9C20] font-bold uppercase">
          FORJADOS EM OURO
        </span>
        <LaurelWreathIcon size={32} color="#CD9C20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LaurelWreathIcon size={20} color="#CD9C20" />
            <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest">
              A Trindade Sagrada
            </span>
            <LaurelWreathIcon size={20} color="#CD9C20" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
            MEET THE LEGENDS
          </h2>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#CD9C20] to-transparent mx-auto my-3" />

          <p className="text-xs sm:text-sm text-neutral-600">
            Três lanches dignos dos banquetes imperiais. Clique em qualquer monumento gastronômico para inspecionar os cortes e a anatomia da receita.
          </p>
        </div>

        {/* 3 Legends Grid - 2 columns on mobile, 3 on md+ */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 lg:gap-8 max-w-5xl mx-auto">
          {legends.map((item) => (
            <Link
              key={item.id}
              href={`/produto/${item.id}`}
              onClick={() => startNavigation(item.name)}
              className="block group"
            >
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.2 }}
                className="bg-[#F2ECDD] rounded-xl sm:rounded-2xl overflow-hidden shadow-xl sm:shadow-2xl border-2 border-[#CD9C20]/60 hover:border-[#F5CB5C] flex flex-col justify-between cursor-pointer h-full transition-colors relative"
              >
                {/* Top: Burger Graphic with projected shadow */}
                <div className="relative pt-3 sm:pt-6 pb-2 sm:pb-4 px-2 sm:px-6 flex flex-col items-center justify-center min-h-[135px] sm:min-h-[220px]">
                  {item.badge && (
                    <span className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 bg-[#333533] text-[#F5CB5C] text-[8px] sm:text-[10px] font-ancient font-bold uppercase px-1.5 sm:px-3 py-0.5 rounded-full border border-[#CD9C20]/50 shadow-md">
                      {item.badge}
                    </span>
                  )}

                  <div className="transform transition-transform duration-300 group-hover:scale-105 group-hover:-translate-y-1 sm:group-hover:-translate-y-2">
                    <div className="block sm:hidden">
                      <BurgerGraphic type={item.imageType} size={105} />
                    </div>
                    <div className="hidden sm:block">
                      <BurgerGraphic type={item.imageType} size={180} />
                    </div>
                  </div>
                </div>

                {/* Bottom: Deep Basalt Stone Block with Imperial Gold & Action Button */}
                <div className="bg-[#333533] p-2.5 sm:p-5 text-[#F2ECDD] flex items-center justify-between gap-1.5 sm:gap-3 border-t-2 border-[#CD9C20]">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-display text-xs sm:text-lg uppercase tracking-wider text-[#F5CB5C] leading-tight truncate group-hover:text-white transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-[9px] sm:text-[11px] text-[#F2ECDD]/80 mt-0.5 line-clamp-1">
                      {item.id === 'legend-classic'
                        ? 'Smash duplo 160g + cheddar de Hefesto'
                        : item.id === 'legend-fury'
                        ? 'Molho verde espartano + farofa de bacon'
                        : 'Cascata de cheddar líquido + cebola 4h'}
                    </p>
                    <p className="font-sans font-black text-xs sm:text-base text-[#F2ECDD] mt-0.5 sm:mt-1">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>

                  <span
                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full gold-gradient-bg text-[#0B0B0B] group-hover:brightness-110 active:scale-90 flex items-center justify-center font-black text-sm sm:text-xl shadow-md transition-all shrink-0"
                    aria-label={`Ver ${item.name}`}
                  >
                    <Plus className="w-3.5 h-3.5 sm:w-5 sm:h-5 stroke-[3]" />
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
