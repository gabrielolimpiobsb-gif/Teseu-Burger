'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { STORE_INFO } from '@/lib/data';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { ShoppingBag, Menu as MenuIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  cartShake: boolean;
}

export function Navbar({ cartCount, cartTotal, onOpenCart, cartShake }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Início', href: '/#hero' },
    { label: 'Os Deuses', href: '/#lendas' },
    { label: 'Cardápio', href: '/cardapio' },
  ];

  return (
    <>
      {/* Top Floating Pill Container */}
      <header className="fixed top-4 left-0 right-0 z-40 px-4 sm:px-6 pointer-events-none">
        <div className="max-w-4xl mx-auto flex items-center justify-between pointer-events-auto">
          {/* Pill Navbar with Roman Marble & Imperial Gold Styling */}
          <nav
            className={`w-full bg-white/95 text-[#1c1c1c] rounded-full px-4 sm:px-6 py-2 sm:py-2.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#CD9C20]/40 flex items-center justify-between gap-4 transition-all duration-300 backdrop-blur-md ${
              scrolled ? 'shadow-[0_12px_35px_rgba(0,0,0,0.12)] border-[#CD9C20]' : ''
            }`}
          >
            {/* Left: Brand with Official Logo (Only logo.png, no redundant text) */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group py-0.5">
              <div className="relative h-8 sm:h-10 w-32 sm:w-44 shrink-0 transition-transform duration-200 group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Teseu Burger"
                  fill
                  priority
                  referrerPolicy="no-referrer"
                  className="object-contain object-left"
                  sizes="(max-width: 640px) 130px, 180px"
                />
              </div>
              <div className="hidden lg:flex items-center gap-1.5 text-[10px] text-neutral-600 font-medium ml-1 border-l border-neutral-300 pl-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-neutral-800 font-semibold">{STORE_INFO.status}</span>
                <span className="text-neutral-400">·</span>
                <span>{STORE_INFO.avgTime}</span>
              </div>
            </Link>

            {/* Center: Desktop Nav Links in Roman Display Typography */}
            <div className="hidden md:flex items-center gap-5 text-xs font-display font-semibold text-[#333533] tracking-wider uppercase">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="hover:text-[#CD9C20] transition-colors whitespace-nowrap relative py-1 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-[#CD9C20] hover:after:w-full after:transition-all"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* Right: Golden Cart Button */}
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                onClick={onOpenCart}
                animate={cartShake ? { scale: [1, 1.15, 0.95, 1.1, 1], rotate: [0, -3, 3, -2, 0] } : {}}
                transition={{ duration: 0.4 }}
                className="gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs sm:text-sm px-3.5 sm:px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_2px_15px_rgba(205,156,32,0.35)] hover:shadow-[0_2px_22px_rgba(205,156,32,0.5)] transition-all"
                aria-label="Abrir banquete de pedidos"
              >
                <div className="relative">
                  <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                  {cartCount > 0 && (
                    <span suppressHydrationWarning className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#0B0B0B] text-[#F5CB5C] text-[9px] font-black rounded-full flex items-center justify-center font-sans shadow-sm border border-[#F5CB5C]">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span suppressHydrationWarning className="hidden xs:inline font-bold">
                  {cartTotal > 0 ? `R$ ${cartTotal.toFixed(2).replace('.', ',')}` : 'PEDIDO (0)'}
                </span>
                <span className="xs:hidden font-bold">PEDIR</span>
              </motion.button>

              {/* Mobile Menu Icon */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#333533] hover:text-[#CD9C20] rounded-full transition-colors"
                aria-label="Abrir menu de navegação"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-4 top-20 z-40 bg-white border-2 border-[#CD9C20]/60 rounded-2xl p-5 shadow-2xl md:hidden text-[#1c1c1c]"
          >
            <div className="flex flex-col gap-3 font-display uppercase tracking-wider text-sm">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2.5 px-3 rounded-lg hover:bg-[#F2ECDD] hover:text-[#CD9C20] transition-colors border-b border-neutral-200 flex items-center justify-between"
                >
                  <span>{link.label}</span>
                  <SpartanHelmetIcon size={16} color="#CD9C20" />
                </a>
              ))}
            </div>

            <div className="mt-4 pt-3 flex items-center justify-between text-xs text-neutral-600">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                {STORE_INFO.status}
              </span>
              <span>Tempo Médio: {STORE_INFO.avgTime}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
