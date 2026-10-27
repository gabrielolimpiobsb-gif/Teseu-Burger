'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_INFO } from '@/lib/data';
import { GreekFrieze, LaurelWreathIcon, ParthenonIcon } from '@/components/GreekOrnament';
import { ArrowUp, Instagram, MessageCircle, MapPin, Clock } from 'lucide-react';

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#EFEAE0] text-[#1c1c1c] relative border-t border-[#CD9C20]/30">
      {/* Authentic Horizontal Greek Key Meander Frieze (from IMG-20261023-WA0003 & WA0005) */}
      <GreekFrieze variant="gold" className="relative z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-12 pt-16 pb-12">
        {/* Giant Monumental Brand Name with Official Logo */}
        <div className="text-center overflow-hidden select-none py-6 flex flex-col items-center">
          <div className="relative h-16 sm:h-20 w-56 sm:w-72 mb-4">
            <Image
              src="/logo.png"
              alt="Teseu Burger"
              fill
              referrerPolicy="no-referrer"
              className="object-contain"
              sizes="(max-width: 640px) 224px, 288px"
            />
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <LaurelWreathIcon size={20} color="#CD9C20" />
            <span className="text-xs font-ancient tracking-[0.3em] text-[#CD9C20] font-bold uppercase">
              TEMPLO DO SMASH ARTESANAL
            </span>
            <LaurelWreathIcon size={20} color="#CD9C20" />
          </div>
        </div>

        {/* 3 Columns Info Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-10 border-t border-[#CD9C20]/25 text-xs text-neutral-700">
          {/* Col 1: Store Location & Info */}
          <div className="space-y-2">
            <h4 className="font-ancient font-bold text-[#CD9C20] uppercase text-[11px] tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#CD9C20]" />
              <span>O Templo Principal</span>
            </h4>
            <p className="text-neutral-800 font-medium">{STORE_INFO.address}</p>
            <p className="text-neutral-500 font-ancient">Entregas de cavalo de ferro até 8km do templo</p>
          </div>

          {/* Col 2: Hours */}
          <div className="space-y-2">
            <h4 className="font-ancient font-bold text-[#CD9C20] uppercase text-[11px] tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#CD9C20]" />
              <span>Horário dos Banquetes</span>
            </h4>
            <p className="font-semibold text-neutral-900">{STORE_INFO.hours}</p>
            <p className="text-neutral-500 font-ancient">Portões abertos também em feriados nacionais</p>
          </div>

          {/* Col 3: Social & WhatsApp */}
          <div className="space-y-3">
            <h4 className="font-ancient font-bold text-[#CD9C20] uppercase text-[11px] tracking-wider">
              Canais do Oráculo
            </h4>
            <div className="flex items-center gap-4 text-neutral-800">
              <a
                href={`https://wa.me/${STORE_INFO.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-600 transition-colors flex items-center gap-1.5 font-medium"
              >
                <MessageCircle className="w-4 h-4 text-[#CD9C20]" />
                <span>WhatsApp Oficial</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#CD9C20] transition-colors flex items-center gap-1.5 font-medium"
              >
                <Instagram className="w-4 h-4 text-[#CD9C20]" />
                <span>Instagram</span>
              </a>
            </div>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-neutral-600 hover:text-[#CD9C20] transition-colors pt-1 font-ancient font-bold"
            >
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Elevar-se ao topo</span>
            </button>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-12 pt-6 border-t border-[#CD9C20]/20 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-600 gap-4">
          <p suppressHydrationWarning>© {new Date().getFullYear()} Teseu Burger // Templo do Smash. Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <span className="font-ancient text-[#CD9C20] font-bold">Forjado para os verdadeiros conquistadores do sabor.</span>
            <Link
              href="/cozinha"
              className="text-neutral-400/80 hover:text-[#CD9C20] transition-colors text-[10px] font-mono"
              title="Terminal da Cozinha (KDS)"
            >
              • Cozinha
            </Link>
            <Link
              href="/admin"
              className="text-neutral-400/80 hover:text-[#CD9C20] transition-colors text-[10px] font-mono"
              title="Painel de Administração Master"
            >
              • Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
