'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, Gift, Dices, ChevronRight, Play, Pause } from 'lucide-react';

interface TourStep {
  id: number;
  badge: string;
  title: string;
  description: string;
  accent: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 1,
    badge: '1. Monte o Combo',
    title: 'Escolha 2 Burgers, 2 Refris e 2 Batatas',
    description: 'Personalize os pontos da carne e os acompanhamentos do seu jeito.',
    accent: '#CD9C20',
  },
  {
    id: 2,
    badge: '2. Puxe a Alavanca',
    title: 'Caça-Níqueis Retrô Vermelho',
    description: '3 cilindros vintage com alavanca lateral e jackpot de brinde garantido.',
    accent: '#F5CB5C',
  },
  {
    id: 3,
    badge: '3. Doce 100% Grátis',
    title: 'Ganhe 1 Sobremesa Artesanal no Pedido',
    description: 'O doce sorteado entra como cortesia oficial (R$ 0,00) na sua comanda.',
    accent: '#34D399',
  },
];

export function RouletteTourMiniAnimation() {
  const [activeStep, setActiveStep] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-play stepper with pause on hover
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % TOUR_STEPS.length);
    }, 3800);
    return () => clearInterval(interval);
  }, [isPaused]);

  const current = TOUR_STEPS[activeStep];

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full max-w-2xl mx-auto bg-gradient-to-r from-[#121110] via-[#1a1714] to-[#121110] border border-[#CD9C20]/60 rounded-2xl p-3 sm:p-3.5 shadow-[0_4px_24px_rgba(0,0,0,0.6),0_0_15px_rgba(205,156,32,0.15)] overflow-hidden"
    >
      {/* Top subtle golden shimmer line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#F5CB5C] to-transparent" />

      {/* Top Stepper Tabs & Progress Indicator */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2 mb-2 pb-2 border-b border-white/5">
        <div className="flex items-center gap-1.5 text-[9.5px] sm:text-[10px] font-ancient font-bold uppercase tracking-wider text-[#F5CB5C]">
          <Dices className="w-3.5 h-3.5 text-[#F5CB5C] animate-spin" style={{ animationDuration: '8s' }} />
          <span>Como Funciona o Combo Casal:</span>
        </div>

        {/* 3 Step Progress Bars */}
        <div className="flex items-center gap-1.5 flex-1 max-w-[200px] sm:max-w-[240px] justify-end">
          {TOUR_STEPS.map((step, idx) => {
            const isActive = idx === activeStep;
            const isPassed = idx < activeStep;
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => setActiveStep(idx)}
                title={`Ir para ${step.badge}`}
                className="group flex-1 flex flex-col gap-0.5 cursor-pointer py-0.5 text-left"
              >
                <div className="h-1 sm:h-1.5 rounded-full bg-white/10 overflow-hidden relative">
                  {isActive && !isPaused ? (
                    <motion.div
                      key={`progress-${idx}`}
                      initial={{ width: '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 3.8, ease: 'linear' }}
                      className="h-full rounded-full bg-gradient-to-r from-[#CD9C20] to-[#F5CB5C]"
                    />
                  ) : (
                    <div
                      className={`h-full rounded-full transition-all ${
                        isActive
                          ? 'bg-[#F5CB5C] w-full shadow-[0_0_8px_rgba(245,203,92,0.8)]'
                          : isPassed
                          ? 'bg-[#CD9C20]/80 w-full'
                          : 'w-0'
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}

          {/* Pause / Play toggle */}
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            className="text-neutral-400 hover:text-white p-0.5 transition-colors ml-1"
            title={isPaused ? 'Continuar tour' : 'Pausar tour'}
          >
            {isPaused ? <Play className="w-2.5 h-2.5" /> : <Pause className="w-2.5 h-2.5" />}
          </button>
        </div>
      </div>

      {/* Main Tour Body: Visual Demo + Step Narrative (Compact layout) */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Left Column: Custom SVG Micro-Animation for Each Stage */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-xl bg-black/60 border border-[#CD9C20]/40 flex items-center justify-center p-1 relative overflow-hidden shadow-inner">
          <AnimatePresence mode="wait">
            {activeStep === 0 && (
              <motion.div
                key="step-0-anim"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full h-full flex flex-col items-center justify-center"
              >
                {/* Micro burger + drink + fries assembling */}
                <div className="relative flex items-center justify-center">
                  <motion.div
                    animate={{ y: [-2, 2, -2] }}
                    transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                    className="text-xl sm:text-2xl drop-shadow"
                  >
                    🍔
                  </motion.div>
                  <motion.div
                    animate={{ y: [2, -2, 2] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.3, ease: 'easeInOut' }}
                    className="text-sm sm:text-base -ml-2 -mt-2 drop-shadow"
                  >
                    🥤
                  </motion.div>
                  <motion.div
                    animate={{ y: [-1, 2, -1] }}
                    transition={{ repeat: Infinity, duration: 2, delay: 0.6, ease: 'easeInOut' }}
                    className="text-xs sm:text-sm -ml-1 mt-2 drop-shadow"
                  >
                    🍟
                  </motion.div>
                </div>
                <span className="text-[7.5px] sm:text-[8px] font-black uppercase text-[#F5CB5C] font-ancient bg-[#CD9C20]/20 px-1 py-0.2 rounded border border-[#CD9C20]/40 mt-1">
                  2x Inclusos
                </span>
              </motion.div>
            )}

            {activeStep === 1 && (
              <motion.div
                key="step-1-anim"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Micro Retro Red Slot Machine */}
                <div className="relative w-12 h-14 flex items-center justify-center">
                  {/* Red Cabinet */}
                  <div className="w-10 h-13 rounded-t-xl rounded-b-md bg-gradient-to-b from-red-600 via-red-800 to-red-950 p-1 border border-red-500 shadow-md flex flex-col justify-between items-center relative">
                    {/* Chrome screen bezel */}
                    <div className="w-full h-6 rounded bg-gradient-to-r from-zinc-300 via-zinc-100 to-zinc-400 p-[1.5px] shadow-inner">
                      <div className="w-full h-full bg-zinc-950 rounded-sm grid grid-cols-3 gap-[1px] p-[1px] overflow-hidden">
                        {[0, 1, 2].map((idx) => (
                          <div key={idx} className="bg-[#ebd9b4] rounded-[1px] flex items-center justify-center overflow-hidden">
                            <motion.div
                              animate={{ y: [-15, 0, -15] }}
                              transition={{ repeat: Infinity, duration: 0.6 + idx * 0.15, ease: 'linear' }}
                              className="text-[8px]"
                            >
                              🍪
                            </motion.div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Lower slot opening */}
                    <div className="w-6 h-1.5 rounded-sm bg-zinc-400 p-[1px] mb-0.5">
                      <div className="w-full h-full bg-black rounded-[0.5px]" />
                    </div>
                  </div>

                  {/* Micro side lever */}
                  <motion.div
                    animate={{ rotate: [5, 40, 5] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                    className="absolute -right-2 top-2 origin-bottom flex flex-col items-center"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 border border-red-400 shadow-xs" />
                    <div className="w-[1.5px] h-6 bg-zinc-300" />
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeStep === 2 && (
              <motion.div
                key="step-2-anim"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative w-full h-full flex flex-col items-center justify-center"
              >
                {/* Micro Sweet Prize reveal */}
                <motion.div
                  animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="text-2xl sm:text-3xl drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                >
                  🍪
                </motion.div>
                <div className="flex items-center gap-0.5 mt-0.5 bg-emerald-500/20 border border-emerald-400 px-1 py-0.2 rounded text-[7.5px] sm:text-[8px] text-emerald-300 font-black">
                  <Sparkles className="w-2 h-2 text-emerald-400" />
                  <span>R$ 0,00</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right Column: Step Description with Smooth Motion Transition */}
        <div className="flex-1 min-w-0 pr-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-0.5 sm:space-y-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="text-[9px] sm:text-[10px] font-ancient font-black uppercase px-2 py-0.5 rounded-md border"
                  style={{
                    backgroundColor: `${current.accent}20`,
                    borderColor: `${current.accent}70`,
                    color: current.accent,
                  }}
                >
                  {current.badge}
                </span>

                <span className="text-[9px] text-neutral-400 font-mono hidden xs:inline">
                  Passo {current.id} de 3
                </span>
              </div>

              <h4 className="font-display text-xs sm:text-sm font-bold text-white uppercase tracking-tight truncate">
                {current.title}
              </h4>

              <p className="text-[10px] sm:text-[11.5px] text-neutral-300 font-sans leading-tight line-clamp-2">
                {current.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Interactive Next Arrow Button */}
        <button
          type="button"
          onClick={() => setActiveStep((prev) => (prev + 1) % TOUR_STEPS.length)}
          className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#F5CB5C] border border-[#CD9C20]/40 transition-colors shrink-0 cursor-pointer"
          title="Próximo passo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
