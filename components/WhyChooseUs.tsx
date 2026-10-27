'use client';

import React from 'react';
import { QUALITY_PILLARS } from '@/lib/data';
import { LaurelWreathIcon, AmphoraIcon, ZeusShieldIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { Flame, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function WhyChooseUs() {
  const pillarIcons = [
    <Flame key="flame" className="w-6 h-6 text-[#F5CB5C]" />,
    <AmphoraIcon key="amphora" size={26} color="#F5CB5C" />,
    <Zap key="zap" className="w-6 h-6 text-[#F5CB5C]" />,
    <ZeusShieldIcon key="shield" size={26} color="#F5CB5C" />,
  ];

  return (
    <section id="diferenciais" className="py-24 bg-white text-[#1c1c1c] border-b border-[#CD9C20]/25 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LaurelWreathIcon size={18} color="#CD9C20" />
            <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest">
              Colunas de Excelência
            </span>
            <LaurelWreathIcon size={18} color="#CD9C20" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
            POR QUE NOS ESCOLHER?
          </h2>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#CD9C20] to-transparent mx-auto my-3" />

          <p className="mt-2 text-xs sm:text-sm text-neutral-600">
            A tradição clássica da forja: calor implacável, ingredientes nobres sem aditivos e a velocidade de mensageiros divinos.
          </p>
        </div>

        {/* 4 Vertical Pillar Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {QUALITY_PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.id}
              whileHover={{ y: -6 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl border border-[#CD9C20]/40 hover:border-[#CD9C20] overflow-hidden flex flex-col justify-between group shadow-[0_6px_25px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_35px_rgba(205,156,32,0.18)] transition-all relative"
            >
              {/* Visual Backdrop with Column Fluting Accent */}
              <div className="relative h-44 bg-gradient-to-b from-[#FBF9F5] to-[#F2ECDD] p-6 flex flex-col justify-between overflow-hidden border-b border-[#CD9C20]/30">
                {/* Subtle classical grid */}
                <div
                  className="absolute inset-0 opacity-15"
                  style={{
                    backgroundImage:
                      'linear-gradient(to right, #CD9C20 1px, transparent 1px), linear-gradient(to bottom, #CD9C20 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                  }}
                />

                {/* Golden Icon Seal */}
                <div className="relative z-10 w-12 h-12 rounded-xl bg-white border border-[#CD9C20] flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                  {pillarIcons[idx]}
                </div>

                <span className="relative z-10 text-[10px] font-ancient tracking-widest text-[#CD9C20] uppercase font-black">
                  PILAR IV.{idx + 1}
                </span>
              </div>

              {/* Marble Tablet Bottom Box */}
              <div className="p-5 bg-white border-t border-neutral-100 -mt-6 rounded-t-2xl relative z-10">
                <div className="inline-block bg-[#333533] text-[#F2ECDD] font-display font-black text-[11px] px-2.5 py-1 rounded uppercase tracking-wider mb-2">
                  {pillar.title}
                </div>
                <p className="text-[11px] font-ancient font-bold text-[#CD9C20] uppercase mb-1">
                  {pillar.subtitle}
                </p>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {pillar.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
