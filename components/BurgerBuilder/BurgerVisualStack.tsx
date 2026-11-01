'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BurgerStackItem } from './burgerData';
import { BurgerLayerGraphic } from './BurgerLayerGraphic';
import { Plus, Minus, Layers, Eye } from 'lucide-react';

interface BurgerVisualStackProps {
  stack: BurgerStackItem[];
  isExploded: boolean;
  onToggleExploded: () => void;
  onDuplicateLayer: (index: number) => void;
  onRemoveLayer: (index: number) => void;
}

export function BurgerVisualStack({
  stack,
  isExploded,
  onToggleExploded,
  onDuplicateLayer,
  onRemoveLayer,
}: BurgerVisualStackProps) {
  // Calculate total container height based on whether it is exploded or assembled
  const totalLayers = stack.length;
  // Exploded spacing: each layer has ~52px gap; Assembled spacing: ~20px gap
  const layerSpacing = isExploded ? 52 : 20;
  const containerHeight = Math.max(380, totalLayers * layerSpacing + 120);

  return (
    <div className="relative w-full flex flex-col items-center justify-center select-none py-4">
      {/* View Mode Toggle Pill (Exploded vs Compact Stack) */}
      <div className="mb-4 z-20">
        <button
          type="button"
          onClick={onToggleExploded}
          className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-white/95 border border-[#CD9C20]/40 text-[#1c1c1c] shadow-md hover:border-[#CD9C20] transition-all text-xs font-display font-bold uppercase tracking-wider group"
          title="Alternar entre visualização montada e camadas explodidas"
        >
          {isExploded ? (
            <>
              <Layers className="w-3.5 h-3.5 text-[#CD9C20]" />
              <span>Vista Explodida (Ativa)</span>
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5 text-[#CD9C20]" />
              <span>Lanche Montado (Compacto)</span>
            </>
          )}
          <span className="text-[10px] text-neutral-600 bg-neutral-100 group-hover:bg-[#F2ECDD] px-2 py-0.5 rounded-full transition-colors font-sans">
            Alternar
          </span>
        </button>
      </div>

      {/* Zero-gravity ambient floating dust / sesame speckles (matching reference image) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-[#CD9C20]/40 absolute top-1/4 left-1/4 animate-pulse" />
        <div className="w-2 h-2 rounded-full bg-[#df8a34]/30 absolute top-1/3 right-1/4 animate-ping" style={{ animationDuration: '3s' }} />
        <div className="w-1.5 h-1.5 rounded-full bg-[#CD9C20]/40 absolute bottom-1/3 left-1/3" />
        <div className="w-1 h-1 rounded-full bg-[#1c1c1c]/20 absolute bottom-1/4 right-1/3" />
      </div>

      {/* Main 3D / Relative Burger Canvas */}
      <div
        className="relative w-full max-w-[340px] flex justify-center items-end transition-all duration-500 ease-out"
        style={{ height: `${containerHeight}px` }}
      >
        {/* Soft plate shadow beneath the bottom bun */}
        <div
          className="absolute bottom-2 w-56 h-8 rounded-full bg-black/15 blur-md pointer-events-none transition-all duration-300"
          style={{ transform: `scale(${isExploded ? 0.85 : 1})` }}
        />

        {/* Stack Layers Rendered bottom-to-top */}
        <AnimatePresence mode="popLayout">
          {stack.map((item, index) => {
            // Calculate bottom offset for this layer
            const bottomOffset = index * layerSpacing + (isExploded ? 20 : 10);
            const isBottomBun = item.isBottomBun;
            const isTopBun = item.isTopBun;

            return (
              <motion.div
                key={item.instanceId}
                layout
                initial={{
                  y: -140,
                  opacity: 0,
                  scale: 0.9,
                  rotate: index % 2 === 0 ? -2 : 2,
                }}
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                  rotate: 0,
                }}
                exit={{
                  y: 50,
                  opacity: 0,
                  scale: 0.85,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  type: 'spring',
                  stiffness: 280,
                  damping: 20,
                  mass: 0.8,
                }}
                style={{
                  position: 'absolute',
                  bottom: `${bottomOffset}px`,
                  zIndex: index + 5,
                  width: '100%',
                }}
                className="flex items-center justify-center group"
              >
                {/* Burger Layer Graphic */}
                <div className="relative transform transition-transform duration-200 group-hover:scale-[1.02]">
                  <BurgerLayerGraphic
                    id={item.id}
                    imagePath={item.imagePath}
                    width={280}
                    height={item.isTopBun ? 95 : item.isBottomBun ? 75 : 65}
                  />

                  {/* Inline Layer Actions in Exploded View (Matching reference image +/- buttons) */}
                  {isExploded && (
                    <div className="absolute inset-y-0 -right-6 sm:-right-8 flex items-center gap-1 z-30">
                      {/* Duplicate (+) button */}
                      {!isBottomBun && !isTopBun && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateLayer(index);
                          }}
                          className="w-6 h-6 rounded-full bg-white shadow-md border border-[#CD9C20]/50 text-neutral-700 hover:text-black hover:scale-110 active:scale-95 flex items-center justify-center transition-transform text-xs"
                          title={`Adicionar mais ${item.name}`}
                          aria-label={`Adicionar mais ${item.name}`}
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}

                      {/* Remove (-) button */}
                      {!isBottomBun && !isTopBun && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRemoveLayer(index);
                          }}
                          className="w-6 h-6 rounded-full bg-white shadow-md border border-rose-300 text-rose-600 hover:text-rose-800 hover:scale-110 active:scale-95 flex items-center justify-center transition-transform text-xs"
                          title={`Remover ${item.name}`}
                          aria-label={`Remover ${item.name}`}
                        >
                          <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Layer Label on hover */}
                  {isExploded && (
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 -translate-x-full pr-2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                      <span className="bg-[#161616] text-[#F5CB5C] text-[10px] font-ancient font-bold uppercase tracking-wider py-1 px-2.5 rounded-lg shadow-md whitespace-nowrap border border-[#CD9C20]/40">
                        {item.name}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
