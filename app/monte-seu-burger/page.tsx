'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { BurgerBuilderComponent } from '@/components/BurgerBuilder/BurgerBuilderComponent';
import { Footer } from '@/components/Footer';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function MonteSeuBurgerPage() {
  const {
    totalCartCount,
    totalCartPrice,
    setIsCartOpen,
    cartShake,
  } = useCart();

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#1c1c1c] selection:bg-[#F5CB5C] selection:text-[#0B0B0B] relative w-full max-w-full overflow-x-hidden">
      {/* 0. Top Pill Navbar */}
      <Navbar
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        cartShake={cartShake}
      />

      {/* 1. Breadcrumb Navigation */}
      <div className="pt-24 sm:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-ancient uppercase tracking-wider text-neutral-600 hover:text-[#CD9C20] transition-colors py-1.5 px-3.5 rounded-full bg-white border border-[#CD9C20]/30 shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#CD9C20]" />
            <span>Voltar ao Templo</span>
          </Link>

          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-ancient font-bold text-[#CD9C20] uppercase bg-[#FAF7EE] border border-[#CD9C20]/40 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-[#CD9C20]" />
            <span>Forja Artesanal Ativa</span>
          </span>
        </div>
      </div>

      {/* 2. Interactive Visual Burger Builder */}
      <BurgerBuilderComponent />

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}
