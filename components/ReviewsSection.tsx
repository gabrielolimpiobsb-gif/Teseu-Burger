'use client';

import React, { useState } from 'react';
import { REVIEWS } from '@/lib/data';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export function ReviewsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const prevReview = () => {
    setCurrentIndex((prev) => (prev === 0 ? REVIEWS.length - 1 : prev - 1));
  };

  const nextReview = () => {
    setCurrentIndex((prev) => (prev === REVIEWS.length - 1 ? 0 : prev + 1));
  };

  return (
    <section id="avaliacoes" className="py-24 bg-white text-[#1c1c1c] border-b border-[#CD9C20]/25 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center justify-center gap-2 mb-2">
            <LaurelWreathIcon size={18} color="#CD9C20" />
            <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest">
              A Voz dos Cidadãos
            </span>
            <LaurelWreathIcon size={18} color="#CD9C20" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
            QUEM PROVA NÃO GUARDA SEGREDO — COMENTA.
          </h2>

          <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#CD9C20] to-transparent mx-auto my-3" />

          <p className="text-xs sm:text-sm text-neutral-600">
            Mais de 12.000 banquetes entregues com nota máxima de 4.9/5 estrelas de ouro.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative max-w-5xl mx-auto">
          {/* Navigation Controls in Roman Stone & Gold */}
          <div className="flex items-center justify-end gap-3 mb-6">
            <button
              onClick={prevReview}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#F2ECDD] text-[#1c1c1c] flex items-center justify-center border border-[#CD9C20] transition-colors shadow-sm"
              aria-label="Depoimento anterior"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>
            <button
              onClick={nextReview}
              className="w-10 h-10 rounded-full bg-white hover:bg-[#F2ECDD] text-[#1c1c1c] flex items-center justify-center border border-[#CD9C20] transition-colors shadow-sm"
              aria-label="Próximo depoimento"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>

          {/* Cards Grid: Marble & Parchment Tablets */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((review) => (
              <div
                key={review.id}
                className="marble-tablet p-5 shadow-2xl flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1.5"
              >
                <div>
                  {/* Top Customer Info */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#0B0B0B] border border-[#CD9C20] text-[#F5CB5C] font-display text-xs flex items-center justify-center font-bold">
                        {review.author[0]}
                      </div>
                      <div>
                        <h4 className="font-display font-bold text-xs uppercase text-[#0B0B0B] flex items-center gap-1">
                          <span>{review.author}</span>
                        </h4>
                        <span className="text-[10px] text-neutral-600 font-mono">
                          {review.city} • {review.date}
                        </span>
                      </div>
                    </div>
                    <Quote className="w-4 h-4 text-[#CD9C20]/60" />
                  </div>

                  {/* 5 Golden Stars */}
                  <div className="flex gap-1 text-[#CD9C20] my-2">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#CD9C20]" />
                    ))}
                  </div>

                  <div className="w-full border-t border-[#dcd4c0] my-2.5" />

                  {/* Quote */}
                  <p className="text-xs text-neutral-800 italic leading-relaxed font-serif">
                    &quot;{review.comment}&quot;
                  </p>
                </div>

                {/* Bottom receipt / tablet note */}
                <div className="mt-4 pt-2 border-t border-dashed border-[#dcd4c0] text-[10px] text-neutral-700 font-mono">
                  <span className="font-bold text-[#0B0B0B]">BANQUETE:</span> {review.verifiedOrder}
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-1.5 mt-8">
            {REVIEWS.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  currentIndex === i ? 'bg-[#F5CB5C] w-6' : 'bg-neutral-700 w-2'
                }`}
                aria-label={`Ir para depoimento ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
