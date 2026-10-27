'use client';

import React from 'react';
import Link from 'next/link';
import { MENU_ITEMS } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { FullMenu } from '@/components/FullMenu';
import { Footer } from '@/components/Footer';
import { ArrowLeft } from 'lucide-react';

export default function CardapioPage() {
  const {
    totalCartCount,
    totalCartPrice,
    setIsCartOpen,
    cartShake,
  } = useCart();

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#1c1c1c] selection:bg-[#F5CB5C] selection:text-[#0B0B0B] relative">
      {/* 0. Top Pill Navbar */}
      <Navbar
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        cartShake={cartShake}
      />

      {/* 1. Breadcrumb Navigation */}
      <div className="pt-24 sm:pt-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-ancient uppercase tracking-wider text-neutral-600 hover:text-[#CD9C20] transition-colors py-1.5 px-3.5 rounded-full bg-white border border-[#CD9C20]/30 shadow-xs"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-[#CD9C20]" />
          <span>Voltar ao Templo (Início)</span>
        </Link>
      </div>

      {/* 2. Full Menu Interactive Component (every card directly navigates to /produto/[id]) */}
      <FullMenu
        items={MENU_ITEMS}
        isDedicatedPage={true}
      />

      {/* 3. Footer */}
      <Footer />
    </main>
  );
}
