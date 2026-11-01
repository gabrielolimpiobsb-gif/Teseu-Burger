'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MENU_ITEMS } from '@/lib/data';
import { useCart } from '@/context/CartContext';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { MeetTheLegends } from '@/components/MeetTheLegends';
import { FullMenu } from '@/components/FullMenu';
import { VipClubSection } from '@/components/VipClubSection';
import { Footer } from '@/components/Footer';

export default function Home() {
  const router = useRouter();
  const {
    totalCartCount,
    totalCartPrice,
    setIsCartOpen,
    cartShake,
    showToast,
    triggerCartAnimation,
  } = useCart();

  // Smooth scroll to combos specials
  const handleScrollToCombos = () => {
    const el = document.getElementById('combos-especiais') || document.getElementById('lendas');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Smooth scroll helper
  const handleScrollToMenu = () => {
    const el = document.getElementById('cardapio');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Quick order hero handler - scrolls to combos
  const handleQuickOrderHero = () => {
    handleScrollToCombos();
  };

  // VIP coupon unlocked
  const handleCouponUnlocked = (code: string) => {
    showToast(`Cupom de 10% "${code}" desbloqueado e ativado!`);
    triggerCartAnimation();
  };

  const comboPromos = MENU_ITEMS.filter((item) => item.category === 'combos').slice(0, 3);
  const legendsList = MENU_ITEMS.filter((item) => item.isLegend);

  return (
    <main className="min-h-screen bg-[#f5f5f5] text-[#1c1c1c] selection:bg-[#F5CB5C] selection:text-[#0B0B0B] relative w-full max-w-full overflow-x-hidden">
      {/* 0. Floating Pill Navbar */}
      <Navbar
        cartCount={totalCartCount}
        cartTotal={totalCartPrice}
        onOpenCart={() => setIsCartOpen(true)}
        cartShake={cartShake}
      />

      {/* 1. Hero Section */}
      <HeroSection
        onExploreCombos={handleScrollToCombos}
        onExploreMenu={handleScrollToCombos}
        onQuickOrderHero={handleQuickOrderHero}
      />

      {/* 2. Combos Especiais com Doce Brinde (Dark Charcoal almost black background) */}
      <MeetTheLegends
        combos={comboPromos}
        legends={legendsList}
      />

      {/* 2B. Full Interactive Menu (Opens product in new tab) */}
      <FullMenu
        items={MENU_ITEMS}
        limit={8}
        showViewMore={true}
      />

      {/* 3. VIP Club / Gamified Burger Coupon */}
      <VipClubSection onCouponUnlocked={handleCouponUnlocked} />

      {/* 4. Giant Brand Footer */}
      <Footer />
    </main>
  );
}
