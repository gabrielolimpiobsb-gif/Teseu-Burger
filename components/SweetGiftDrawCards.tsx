'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'motion/react';
import { SWEET_GIFT_CARDS, SweetGiftCard } from '@/lib/data';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { Sparkles, Trophy, Lock, XCircle, CheckCircle2 } from 'lucide-react';

/*
  ========================================================================
  SORTEIO DAS 4 CARTAS SAGRADAS DE DOCE BRINDE (EXCLUSIVO NA PÁGINA DO COMBO)
  ========================================================================
  - 4 cartas na mesma linha (grid-cols-4)
  - Animação 3D de virada de carta (card flip com perspectiva)
  - Ao clicar em uma carta:
      * Todas travam imediatamente (não é possível clicar em outra)
      * A carta escolhida vira revelando o brinde ganho com brilho dourado
      * As outras 3 cartas viram revelando os doces que o usuário "perdeu" (em escala de cinza e com tag de não foi dessa vez)
  
  IMAGEM DO DOCE:
  As imagens padrão dos 4 doces estão configuradas em /lib/data.ts:
    1. Carta I:   /doce-cookie.png
    2. Carta II:  /doce-ambrosia.png
    3. Carta III: /doce-brownie.png
    4. Carta IV:  /doce-torta.png
  Você pode colocar suas imagens com esses nomes dentro da pasta /public/!
  Caso a imagem ainda não exista, o sistema exibe suavemente o ícone ilustrativo.
  ========================================================================
*/

interface SweetGiftDrawCardsProps {
  comboId: string;
  selectedGift?: string | null;
  onSelectGift: (giftName: string) => void;
  className?: string;
  isCompact?: boolean;
}

export function SweetGiftDrawCards({
  comboId,
  selectedGift,
  onSelectGift,
  className = '',
  isCompact = false,
}: SweetGiftDrawCardsProps) {
  // If already preselected, start with it
  const [chosenCardId, setChosenCardId] = useState<number | null>(() => {
    if (!selectedGift) return null;
    const found = SWEET_GIFT_CARDS.find((c) => c.name === selectedGift);
    return found ? found.id : null;
  });

  // Track image load errors to display fallback seamlessly
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const handleImageError = (cardId: number) => {
    setImageErrors((prev) => ({ ...prev, [cardId]: true }));
  };

  const handleCardClick = (card: SweetGiftCard) => {
    // Regra: Uma vez aberta, trava e não pode abrir outras
    if (chosenCardId !== null) return;

    setChosenCardId(card.id);
    onSelectGift(card.name);
  };

  const activeWonGift = SWEET_GIFT_CARDS.find((c) => c.id === chosenCardId) || null;

  return (
    <div
      className={`rounded-2xl border-2 border-[#CD9C20]/50 bg-gradient-to-b from-[#1C1812] via-[#14110C] to-[#0D0B08] p-3 sm:p-4 text-white shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Decorative Golden Ambient Aura */}
      <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#CD9C20]/15 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#F5CB5C]/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header Info */}
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-[#CD9C20]/30 relative z-10">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <div className="w-6 h-6 rounded-full bg-[#CD9C20]/20 border border-[#CD9C20] flex items-center justify-center shrink-0">
            {chosenCardId !== null ? (
              <Trophy className="w-3.5 h-3.5 text-[#F5CB5C] animate-bounce" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-[#F5CB5C] animate-pulse" />
            )}
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-display uppercase tracking-wider text-[#F5CB5C] leading-none">
              {chosenCardId !== null ? 'Brinde Sagrado Revelado!' : 'Sorteie seu Doce Brinde'}
            </h4>
            <p className="text-[10px] text-neutral-400 font-ancient mt-0.5">
              {chosenCardId !== null
                ? 'Você escolheu sua carta sagrada e garantiu seu brinde!'
                : 'Escolha 1 das 4 cartas. Ao virar uma, o destino é selado!'}
            </p>
          </div>
        </div>

        {chosenCardId !== null ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold uppercase tracking-wider shrink-0 font-ancient">
            <Lock className="w-3 h-3" />
            Selado
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#CD9C20]/20 border border-[#CD9C20]/40 text-[#F5CB5C] text-[10px] font-bold uppercase tracking-wider shrink-0 font-ancient animate-pulse">
            Toque em 1
          </span>
        )}
      </div>

      {/* 4 Cards strictly on the SAME LINE (grid-cols-4) with 3D Flip */}
      <div className="grid grid-cols-4 gap-2 sm:gap-3 py-1 relative z-10 [perspective:1000px]">
        {SWEET_GIFT_CARDS.map((card, index) => {
          const isChosen = chosenCardId === card.id;
          const isFlipped = chosenCardId !== null; // When one is clicked, all flip open!
          const isLost = chosenCardId !== null && !isChosen;
          const hasImageError = !!imageErrors[card.id];

          return (
            <div
              key={card.id}
              className={`relative h-36 sm:h-44 md:h-48 cursor-pointer select-none transition-all duration-300 ${
                chosenCardId === null ? 'hover:-translate-y-1.5' : ''
              }`}
              onClick={() => handleCardClick(card)}
            >
              {/* Card Inner with 3D Transform */}
              <motion.div
                initial={false}
                animate={{
                  rotateY: isFlipped ? 180 : 0,
                  scale: isChosen ? 1.04 : isLost ? 0.96 : 1,
                }}
                transition={{
                  duration: 0.65,
                  delay: isLost ? 0.15 + index * 0.05 : 0,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                style={{ transformStyle: 'preserve-3d' }}
                className="w-full h-full relative rounded-xl"
              >
                {/* ========================================================
                    FACE 1: DORSAL DA CARTA (VIRADA PARA BAIXO)
                    ======================================================== */}
                <div
                  style={{ backfaceVisibility: 'hidden' }}
                  className={`absolute inset-0 w-full h-full rounded-xl p-2 flex flex-col items-center justify-between text-center border shadow-lg transition-colors ${
                    chosenCardId === null
                      ? 'bg-gradient-to-b from-[#2A2215] via-[#1E170E] to-[#110D07] border-[#CD9C20] hover:border-[#F5CB5C] hover:shadow-[0_0_15px_rgba(245,203,92,0.35)]'
                      : 'bg-[#181510] border-neutral-700 opacity-60'
                  }`}
                >
                  {/* Top Roman Numeral */}
                  <div className="w-full flex items-center justify-between">
                    <span className="text-[9px] sm:text-[10px] font-ancient font-bold text-[#CD9C20] tracking-widest">
                      {card.roman}
                    </span>
                    <Sparkles className="w-2.5 h-2.5 text-[#CD9C20]/60" />
                  </div>

                  {/* Center Emblem */}
                  <div className="flex flex-col items-center gap-1 my-auto">
                    <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-gradient-to-br from-[#3D3019] to-[#1E170C] border border-[#CD9C20]/60 flex items-center justify-center shadow-inner group">
                      <SpartanHelmetIcon size={18} color="#F5CB5C" />
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-ancient font-black text-[#F5CB5C] uppercase tracking-wider">
                      Olimpo
                    </span>
                  </div>

                  {/* Bottom Hint */}
                  <div className="w-full pt-1 border-t border-[#CD9C20]/20">
                    <span className="text-[8px] sm:text-[9px] font-ancient text-neutral-300 uppercase tracking-tight block">
                      Toque p/ Virar
                    </span>
                  </div>
                </div>

                {/* ========================================================
                    FACE 2: FRENTE DA CARTA (REVELADA - 180deg)
                    ======================================================== */}
                <div
                  style={{
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                  className={`absolute inset-0 w-full h-full rounded-xl p-1.5 sm:p-2 flex flex-col items-center justify-between text-center border-2 transition-all overflow-hidden ${
                    isChosen
                      ? 'bg-gradient-to-b from-[#2A2111] via-[#1F170B] to-[#120D06] border-[#F5CB5C] shadow-[0_0_20px_rgba(245,203,92,0.5)] ring-2 ring-[#CD9C20]'
                      : 'bg-[#151310] border-neutral-800 text-neutral-400 opacity-65 grayscale'
                  }`}
                >
                  {/* Status Banner */}
                  <div className="w-full">
                    {isChosen ? (
                      <div className="bg-gradient-to-r from-[#F5CB5C] via-[#CD9C20] to-[#F5CB5C] text-[#0B0B0B] font-display font-black text-[8px] sm:text-[9px] uppercase px-1 py-0.5 rounded shadow-sm tracking-tight flex items-center justify-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5 stroke-[3]" />
                        <span>SEU BRINDE!</span>
                      </div>
                    ) : (
                      <div className="bg-red-950/80 border border-red-800/40 text-red-300 font-ancient font-black text-[7.5px] sm:text-[8px] uppercase px-0.5 py-0.5 rounded tracking-tighter flex items-center justify-center gap-0.5">
                        <XCircle className="w-2.5 h-2.5" />
                        <span>Perdeu</span>
                      </div>
                    )}
                  </div>

                  {/* IMAGEM DO DOCE: Altere o arquivo correspondente em /public */}
                  <div className="relative w-12 h-12 sm:w-16 sm:h-16 md:w-18 md:h-18 my-auto flex items-center justify-center">
                    {!hasImageError ? (
                      <Image
                        src={card.image}
                        alt={card.name}
                        width={72}
                        height={72}
                        className={`object-contain w-full h-full transition-transform ${
                          isChosen ? 'scale-105 drop-shadow-[0_4px_8px_rgba(245,203,92,0.4)]' : 'opacity-60'
                        }`}
                        onError={() => handleImageError(card.id)}
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <span className="text-2xl sm:text-3xl filter drop-shadow">
                          {card.emoji}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Sweet Title & Tag */}
                  <div className="w-full pt-1 border-t border-white/10">
                    <span
                      className={`text-[8.5px] sm:text-[10px] font-display font-black uppercase leading-tight line-clamp-2 block ${
                        isChosen ? 'text-[#F5CB5C]' : 'text-neutral-400 line-through opacity-75'
                      }`}
                    >
                      {card.name.replace('Gigante com ', '').replace('70% Cacau', '')}
                    </span>

                    <span
                      className={`text-[7px] sm:text-[8px] font-ancient uppercase mt-0.5 block ${
                        isChosen ? 'text-emerald-400 font-bold' : 'text-neutral-500'
                      }`}
                    >
                      {isChosen ? 'Grátis c/ Combo' : 'Não sorteado'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Result strip below the 4 cards */}
      <AnimatePresence mode="wait">
        {activeWonGift ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="mt-3 pt-2.5 border-t border-[#CD9C20]/40 flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#221B10] px-3 py-2 rounded-xl border border-[#CD9C20]/40 shadow-inner"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xl sm:text-2xl shrink-0">{activeWonGift.emoji}</span>
              <div>
                <p className="text-[11px] sm:text-xs font-display font-black text-[#F5CB5C] uppercase tracking-wide truncate">
                  {activeWonGift.name}
                </p>
                <p className="text-[10px] text-neutral-300 font-ancient">
                  {activeWonGift.description} • <strong className="text-emerald-400 uppercase font-black">100% CORTESIA</strong>
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 text-[10px] font-ancient font-black text-[#0B0B0B] bg-gradient-to-r from-[#F5CB5C] to-[#CD9C20] px-2.5 py-1 rounded-lg uppercase tracking-wider shrink-0 shadow-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Garantido na Comanda!</span>
            </div>
          </motion.div>
        ) : (
          <div className="mt-2.5 text-center text-[10px] sm:text-[11px] text-neutral-400 font-ancient">
            👆 Toque em qualquer uma das 4 cartas para sortear seu brinde. Ao abrir, as outras serão travadas e reveladas!
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
