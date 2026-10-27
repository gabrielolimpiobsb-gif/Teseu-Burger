'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BURGER_LAYERS } from '@/lib/data';
import { LaurelWreathIcon, ParthenonIcon } from '@/components/GreekOrnament';
import { SlidersHorizontal, Sparkles } from 'lucide-react';

export function ExplodedBurger() {
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [explosionGap, setExplosionGap] = useState<number>(36);

  return (
    <section id="anatomia" className="relative py-24 bg-[#f5f5f5] text-[#1c1c1c] overflow-hidden border-b border-[#CD9C20]/25">
      {/* Background ambient golden aura */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#F5CB5C]/10 blur-[160px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LaurelWreathIcon size={18} color="#CD9C20" />
            <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest">
              Engenharia dos Deuses
            </span>
            <LaurelWreathIcon size={18} color="#CD9C20" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
            O QUE TORNA NOSSO BURGER TÃO ESPECIAL?
          </h2>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#CD9C20] to-transparent mx-auto my-3" />

          <p className="mt-2 text-xs sm:text-sm text-neutral-600">
            A harmonia matemática de cada camada, erguida como as colunas do Parthenon para a mordida suprema.
          </p>

          {/* Interactive slider for explosion spacing in classical style */}
          <div className="mt-6 inline-flex items-center gap-4 bg-white border border-[#CD9C20]/50 rounded-full px-5 py-2 shadow-sm">
            <SlidersHorizontal className="w-4 h-4 text-[#CD9C20]" />
            <span className="text-xs font-ancient font-bold text-[#1c1c1c] uppercase tracking-wider">Abertura:</span>
            <input
              type="range"
              min="10"
              max="55"
              value={explosionGap}
              onChange={(e) => setExplosionGap(Number(e.target.value))}
              className="accent-[#CD9C20] cursor-pointer w-28 sm:w-40"
              aria-label="Controle de abertura das camadas"
            />
            <span className="text-xs font-mono text-[#CD9C20] w-12 font-bold">{explosionGap}px</span>
            <button
              onClick={() => setExplosionGap(explosionGap > 25 ? 12 : 45)}
              className="text-xs font-ancient font-bold text-[#CD9C20] hover:underline uppercase ml-1"
            >
              {explosionGap > 25 ? 'Montar' : 'Explodir'}
            </button>
          </div>
        </div>

        {/* Exploded Architecture Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Callouts (3 layers) */}
          <div className="lg:col-span-3 order-2 lg:order-1 flex flex-col gap-6">
            {BURGER_LAYERS.filter((l) => l.side === 'left').map((layer) => {
              const isHovered = activeLayer === layer.id;
              return (
                <motion.div
                  key={layer.id}
                  onMouseEnter={() => setActiveLayer(layer.id)}
                  onMouseLeave={() => setActiveLayer(null)}
                  onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 relative ${
                    isHovered
                      ? 'bg-white border-[#CD9C20] shadow-[0_8px_30px_rgba(205,156,32,0.25)] scale-[1.03]'
                      : 'bg-white/80 border-[#CD9C20]/30 hover:border-[#CD9C20] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-block bg-[#333533] text-[#F2ECDD] font-display font-black text-[11px] px-2 py-0.5 rounded uppercase tracking-wider">
                      {layer.tag}
                    </span>
                    {isHovered && <Sparkles className="w-3.5 h-3.5 text-[#CD9C20] animate-pulse" />}
                  </div>
                  <h4 className="text-sm font-display font-bold text-[#1c1c1c] mb-1">{layer.name}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">{layer.description}</p>
                </motion.div>
              );
            })}
          </div>

          {/* Center Graphic Stack with Golden Halos */}
          <div className="lg:col-span-6 order-1 lg:order-2 flex flex-col items-center justify-center py-6 min-h-[520px]">
            <div className="relative w-full max-w-[340px] flex flex-col items-center justify-center">
              {/* Layer 1: Pão Topo */}
              <motion.div
                animate={{
                  y: -explosionGap * 2.5,
                  scale: activeLayer === 'layer-top-bun' ? 1.08 : 1,
                  filter:
                    activeLayer && activeLayer !== 'layer-top-bun'
                      ? 'brightness(0.55)'
                      : activeLayer === 'layer-top-bun'
                      ? 'drop-shadow(0 0 24px rgba(245,203,92,0.8))'
                      : 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setActiveLayer('layer-top-bun')}
                onMouseLeave={() => setActiveLayer(null)}
                className="cursor-pointer z-30 transition-colors"
              >
                <svg viewBox="0 0 260 90" className="w-[260px] h-[90px]" fill="none">
                  <path
                    d="M 30 80 C 30 20 75 5 130 5 C 185 5 230 20 230 80 C 230 86 210 88 130 88 C 50 88 30 86 30 80 Z"
                    fill="#df8a34"
                    stroke="#CD9C20"
                    strokeWidth="2.5"
                  />
                  <path d="M 60 40 Q 130 20 200 40 Q 170 25 130 18 Q 80 25 60 40 Z" fill="rgba(255,255,255,0.3)" filter="blur(2px)" />
                  {/* Sesame seeds */}
                  <g fill="#fffaf0">
                    <ellipse cx="90" cy="40" rx="3.5" ry="2" transform="rotate(-15 90 40)" />
                    <ellipse cx="130" cy="28" rx="3.5" ry="2" transform="rotate(5 130 28)" />
                    <ellipse cx="170" cy="38" rx="3.5" ry="2" transform="rotate(25 170 38)" />
                    <ellipse cx="110" cy="50" rx="3.5" ry="2" transform="rotate(-5 110 50)" />
                    <ellipse cx="150" cy="48" rx="3.5" ry="2" transform="rotate(15 150 48)" />
                  </g>
                </svg>
              </motion.div>

              {/* Layer 2: Bacon */}
              <motion.div
                animate={{
                  y: -explosionGap * 1.5,
                  scale: activeLayer === 'layer-bacon' ? 1.08 : 1,
                  filter:
                    activeLayer && activeLayer !== 'layer-bacon'
                      ? 'brightness(0.55)'
                      : activeLayer === 'layer-bacon'
                      ? 'drop-shadow(0 0 24px rgba(245,203,92,0.8))'
                      : 'drop-shadow(0 10px 15px rgba(0,0,0,0.7))',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setActiveLayer('layer-bacon')}
                onMouseLeave={() => setActiveLayer(null)}
                className="cursor-pointer z-25 my-1"
              >
                <svg viewBox="0 0 260 40" className="w-[260px] h-[40px]" fill="none">
                  <path
                    d="M 25 20 Q 55 5 95 24 Q 135 6 175 22 Q 210 8 235 22 L 232 30 Q 200 16 168 30 Q 130 14 90 32 Q 50 14 25 28 Z"
                    fill="#851d28"
                    stroke="#590004"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M 35 23 Q 65 11 100 25 Q 140 10 180 25 Q 210 14 225 24"
                    stroke="#ffe4b5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.div>

              {/* Layer 3: Tomate */}
              <motion.div
                animate={{
                  y: -explosionGap * 0.5,
                  scale: activeLayer === 'layer-tomato' ? 1.08 : 1,
                  filter:
                    activeLayer && activeLayer !== 'layer-tomato'
                      ? 'brightness(0.55)'
                      : activeLayer === 'layer-tomato'
                      ? 'drop-shadow(0 0 24px rgba(245,203,92,0.8))'
                      : 'drop-shadow(0 10px 15px rgba(0,0,0,0.7))',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setActiveLayer('layer-tomato')}
                onMouseLeave={() => setActiveLayer(null)}
                className="cursor-pointer z-20 my-1"
              >
                <svg viewBox="0 0 250 35" className="w-[250px] h-[35px]" fill="none">
                  <ellipse cx="85" cy="18" rx="48" ry="14" fill="#d90429" stroke="#990011" strokeWidth="1.5" />
                  <ellipse cx="85" cy="18" rx="36" ry="10" fill="#ef233c" />
                  <ellipse cx="165" cy="17" rx="48" ry="14" fill="#d90429" stroke="#990011" strokeWidth="1.5" />
                  <ellipse cx="165" cy="17" rx="36" ry="10" fill="#ef233c" />
                </svg>
              </motion.div>

              {/* Layer 4: Smash Patty + Cheddar */}
              <motion.div
                animate={{
                  y: explosionGap * 0.5,
                  scale: activeLayer === 'layer-patty' ? 1.08 : 1,
                  filter:
                    activeLayer && activeLayer !== 'layer-patty'
                      ? 'brightness(0.55)'
                      : activeLayer === 'layer-patty'
                      ? 'drop-shadow(0 0 24px rgba(245,203,92,0.8))'
                      : 'drop-shadow(0 12px 18px rgba(0,0,0,0.8))',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setActiveLayer('layer-patty')}
                onMouseLeave={() => setActiveLayer(null)}
                className="cursor-pointer z-15 my-1"
              >
                <svg viewBox="0 0 260 65" className="w-[260px] h-[65px]" fill="none">
                  <path
                    d="M 22 25 C 22 15 65 18 130 16 C 195 18 238 15 238 27 C 238 42 195 48 130 46 C 65 48 22 42 22 25 Z"
                    fill="#2c170d"
                    stroke="#1a0a03"
                    strokeWidth="2"
                  />
                  {/* Cheddar Melt in Radiant Gold */}
                  <path
                    d="M 28 20 Q 130 12 232 20 Q 220 42 200 28 Q 180 58 160 30 Q 130 62 105 32 Q 80 56 60 28 Q 40 45 28 20 Z"
                    fill="#F5CB5C"
                  />
                  <circle cx="105" cy="58" r="3.5" fill="#F5CB5C" />
                  <circle cx="160" cy="54" r="3" fill="#F5CB5C" />
                </svg>
              </motion.div>

              {/* Layer 5: Alface Americana */}
              <motion.div
                animate={{
                  y: explosionGap * 1.5,
                  scale: activeLayer === 'layer-lettuce' ? 1.08 : 1,
                  filter:
                    activeLayer && activeLayer !== 'layer-lettuce'
                      ? 'brightness(0.55)'
                      : activeLayer === 'layer-lettuce'
                      ? 'drop-shadow(0 0 24px rgba(245,203,92,0.8))'
                      : 'drop-shadow(0 10px 15px rgba(0,0,0,0.7))',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setActiveLayer('layer-lettuce')}
                onMouseLeave={() => setActiveLayer(null)}
                className="cursor-pointer z-10 my-1"
              >
                <svg viewBox="0 0 260 35" className="w-[260px] h-[35px]" fill="none">
                  <path
                    d="M 20 18 Q 35 6 52 18 Q 72 4 92 18 Q 115 2 138 18 Q 162 4 185 18 Q 208 6 225 18 Q 240 8 245 18 Q 235 32 205 25 Q 170 34 135 25 Q 95 34 60 25 Q 35 32 20 18 Z"
                    fill="#40916c"
                    stroke="#1b4332"
                    strokeWidth="1.5"
                  />
                </svg>
              </motion.div>

              {/* Layer 6: Pão Base */}
              <motion.div
                animate={{
                  y: explosionGap * 2.5,
                  scale: activeLayer === 'layer-bottom-bun' ? 1.08 : 1,
                  filter:
                    activeLayer && activeLayer !== 'layer-bottom-bun'
                      ? 'brightness(0.55)'
                      : activeLayer === 'layer-bottom-bun'
                      ? 'drop-shadow(0 0 24px rgba(245,203,92,0.8))'
                      : 'drop-shadow(0 15px 25px rgba(0,0,0,0.8))',
                }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                onMouseEnter={() => setActiveLayer('layer-bottom-bun')}
                onMouseLeave={() => setActiveLayer(null)}
                className="cursor-pointer z-5 my-1"
              >
                <svg viewBox="0 0 260 70" className="w-[260px] h-[70px]" fill="none">
                  <path
                    d="M 35 15 Q 130 8 225 15 Q 230 55 130 55 Q 30 55 35 15 Z"
                    fill="#df8a34"
                    stroke="#CD9C20"
                    strokeWidth="2.5"
                  />
                  <ellipse cx="130" cy="18" rx="85" ry="8" fill="#f4a261" opacity="0.6" />
                </svg>
              </motion.div>
            </div>
          </div>

          {/* Right Callouts (3 layers) */}
          <div className="lg:col-span-3 order-3 flex flex-col gap-6">
            {BURGER_LAYERS.filter((l) => l.side === 'right').map((layer) => {
              const isHovered = activeLayer === layer.id;
              return (
                <motion.div
                  key={layer.id}
                  onMouseEnter={() => setActiveLayer(layer.id)}
                  onMouseLeave={() => setActiveLayer(null)}
                  onClick={() => setActiveLayer(activeLayer === layer.id ? null : layer.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all duration-300 relative ${
                    isHovered
                      ? 'bg-white border-[#CD9C20] shadow-[0_8px_30px_rgba(205,156,32,0.25)] scale-[1.03]'
                      : 'bg-white/80 border-[#CD9C20]/30 hover:border-[#CD9C20] shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-block bg-[#333533] text-[#F2ECDD] font-display font-black text-[11px] px-2 py-0.5 rounded uppercase tracking-wider">
                      {layer.tag}
                    </span>
                    {isHovered && <Sparkles className="w-3.5 h-3.5 text-[#CD9C20] animate-pulse" />}
                  </div>
                  <h4 className="text-sm font-display font-bold text-[#1c1c1c] mb-1">{layer.name}</h4>
                  <p className="text-xs text-neutral-600 leading-relaxed font-normal">{layer.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
