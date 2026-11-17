'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { TeseuFortune } from '@/components/TeseuFortune';
import {
  ArrowLeft,
  ShoppingBag,
  Info,
  X,
  Gift,
} from 'lucide-react';
import { SpartanHelmetIcon } from '@/components/GreekOrnament';

export default function BrindesPage() {
  const { totalCartCount, setIsCartOpen } = useCart();
  const [showRulesModal, setShowRulesModal] = useState<boolean>(false);

  return (
    <main className="h-[100dvh] max-h-[100dvh] w-full bg-[#120303] text-white selection:bg-[#F5CB5C] selection:text-[#0B0B0B] relative overflow-hidden font-sans flex flex-col justify-between">
      {/* Cortinas de Veludo Escuro e Iluminação Teatral de Cassino */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40 z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #180203 0px, #3d0206 35px, #180203 70px)',
        }}
      />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(245,158,11,0.25)_0%,transparent_65%)] z-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0.95)_0%,transparent_80%)] z-0" />

      {/* 1. BARRA SUPERIOR COMPACTA (Sem rolagem, altura fixa h-11 sm:h-12) */}
      <header className="relative z-30 h-11 sm:h-12 px-3 sm:px-6 bg-[#1a0404]/90 backdrop-blur-md border-b border-amber-500/30 flex items-center justify-between shrink-0 shadow-sm">
        {/* Voltar ao Cardápio */}
        <Link
          href="/#lendas"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 border border-amber-500/30 text-amber-200 text-xs font-bold hover:text-white hover:border-amber-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Voltar ao Cardápio</span>
          <span className="sm:hidden">Cardápio</span>
        </Link>

        {/* Logo Central Compacto */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
            <SpartanHelmetIcon size={14} color="#F5CB5C" />
          </div>
          <span className="font-display font-black text-xs sm:text-sm tracking-wider uppercase text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-200">
            Teseu Fortune
          </span>
          <span className="hidden md:inline px-1.5 py-0.2 rounded-md bg-amber-500/15 border border-amber-400/30 text-[9px] font-black text-amber-300 uppercase">
            Brinde VIP
          </span>
        </div>

        {/* Ações: Regras & Carrinho */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowRulesModal(true)}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-400/40 text-amber-300 text-xs font-bold hover:bg-amber-500/25 transition"
            title="Como Funciona"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Regras</span>
          </button>

          <Link
            href="/carinho"
            className="relative p-1.5 rounded-full bg-black/60 border border-amber-500/30 text-amber-300 hover:text-white hover:border-amber-400 transition"
            title="Abrir Carrinho"
          >
            <ShoppingBag className="w-4 h-4" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[9px] font-black flex items-center justify-center font-mono">
                {totalCartCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      {/* 2. ÁREA CENTRAL: GABINETE FORTUNE TIGER PERFEITAMENTE AJUSTADO AO VIEWPORT */}
      <div className="relative z-10 flex-1 min-h-0 w-full flex items-center justify-center p-1.5 sm:p-3 overflow-hidden">
        <TeseuFortune onOpenRules={() => setShowRulesModal(true)} />
      </div>

      {/* 3. MODAL DE REGRAS E COMO FUNCIONA O BRINDE (Para não poluir a tela com scroll) */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-gradient-to-b from-[#220505] to-[#120202] border-2 border-amber-500/70 rounded-3xl p-6 shadow-2xl text-white relative space-y-4">
            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-black text-base uppercase text-white">
                  Regras do Teseu Fortune
                </h3>
                <p className="text-[11px] text-amber-300">
                  Como funciona o sorteio de doces cortesia
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <span>1.</span> Sistema de 3 Tentativas
                </h4>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  As 2 primeiras tentativas geram combinações mistas (ex: 2 brownies e 1 brigadeiro = não ganha). Na 3ª e última tentativa, o modo <strong>&quot;Rodar Até Ganhar&quot;</strong> é ativado com Jackpot garantido!
                </p>
              </div>

              <div className="p-3 rounded-xl bg-black/40 border border-zinc-800">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                  <span>2.</span> Só Ganha com 3 Doces Iguais
                </h4>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Para ser premiado, é obrigatório alinhar 3 doces idênticos na tela (3 Cookies, 3 Brigadeiros, 3 Brownies ou 3 Bombons).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-red-950/40 border border-red-700/50">
                <h4 className="font-bold text-red-300 flex items-center gap-1.5 mb-1">
                  <span>3.</span> 1 Brinde por Combo Casal
                </h4>
                <p className="text-zinc-300 text-[11px] leading-relaxed">
                  Cada cliente tem direito a <strong>1 brinde cortesia por compra de Combo Casal</strong>. Fora da compra do Combo Casal, o brinde não é validado no carrinho.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowRulesModal(false)}
              className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow hover:brightness-110 transition"
            >
              Entendido, Vamos Jogar!
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
