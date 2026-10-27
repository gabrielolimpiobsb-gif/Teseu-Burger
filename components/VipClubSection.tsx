'use client';

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LaurelWreathIcon, ParthenonIcon } from '@/components/GreekOrnament';
import { Check, Send } from 'lucide-react';

interface VipClubSectionProps {
  onCouponUnlocked: (code: string) => void;
}

export function VipClubSection({ onCouponUnlocked }: VipClubSectionProps) {
  const [phone, setPhone] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').length >= 8) {
      setIsUnlocked(true);
      onCouponUnlocked('OLYMPUS10');
    }
  };

  return (
    <section className="relative py-24 bg-[#f5f5f5] text-[#1c1c1c] border-b border-[#CD9C20]/25 overflow-hidden">
      {/* Golden Floating Fries & Olive Leaves in Zero-Gravity */}
      <motion.div
        animate={{ y: [0, -14, 0], rotate: [-10, 5, -10] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute left-4 sm:left-12 top-1/3 pointer-events-none opacity-80 hidden md:block"
      >
        <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none">
          <rect x="20" y="20" width="12" height="70" rx="3" fill="#F5CB5C" stroke="#CD9C20" strokeWidth="1" transform="rotate(-30 20 20)" />
          <rect x="45" y="10" width="13" height="85" rx="3" fill="#F5CB5C" stroke="#CD9C20" strokeWidth="1" transform="rotate(-15 45 10)" />
          <rect x="75" y="15" width="12" height="75" rx="3" fill="#CD9C20" stroke="#F5CB5C" strokeWidth="1" transform="rotate(10 75 15)" />
        </svg>
      </motion.div>

      <motion.div
        animate={{ y: [0, -16, 0], rotate: [12, -8, 12] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
        className="absolute right-4 sm:right-12 top-1/3 pointer-events-none opacity-80 hidden md:block"
      >
        <svg viewBox="0 0 120 120" className="w-24 h-24" fill="none">
          <rect x="30" y="25" width="12" height="80" rx="3" fill="#F5CB5C" stroke="#CD9C20" strokeWidth="1" transform="rotate(25 30 25)" />
          <rect x="60" y="15" width="13" height="75" rx="3" fill="#CD9C20" stroke="#F5CB5C" strokeWidth="1" transform="rotate(40 60 15)" />
          <rect x="20" y="45" width="11" height="65" rx="3" fill="#F5CB5C" stroke="#CD9C20" strokeWidth="1" transform="rotate(10 20 45)" />
        </svg>
      </motion.div>

      <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <LaurelWreathIcon size={18} color="#CD9C20" />
          <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest">
            O Oráculo do Olimpo
          </span>
          <LaurelWreathIcon size={18} color="#CD9C20" />
        </div>

        <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
          UNLOCK EXCLUSIVE DROPS
        </h2>

        <div className="w-24 h-0.5 bg-gradient-to-r from-transparent via-[#CD9C20] to-transparent mx-auto my-3" />

        <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto">
          Insira seu WhatsApp abaixo para abrir o templo sagrado e receber <span className="text-[#CD9C20] font-bold">10% OFF</span> no seu primeiro banquete.
        </p>

        {/* Giant Interactive Temple-Burger Container */}
        <div
          className="mt-12 relative max-w-md mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {/* Top Bun / Pediment (Lifts on hover or unlock) */}
          <motion.div
            animate={{
              y: isUnlocked ? -55 : isHovered ? -35 : -15,
            }}
            transition={{ type: 'spring', stiffness: 220, damping: 18 }}
            className="relative z-20 flex justify-center"
          >
            <div className="bg-gradient-to-b from-[#df8a34] to-[#c77727] border-2 border-[#CD9C20] w-72 sm:w-88 h-20 rounded-t-full shadow-[0_10px_25px_rgba(0,0,0,0.15)] relative flex items-center justify-center">
              <span className="gold-gradient-bg text-[#0B0B0B] text-[10px] font-ancient font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md border border-[#F5CB5C]">
                {isUnlocked ? 'SEGREDO REVELADO!' : 'ABRA O TEMPLO DO SMASH'}
              </span>
              <div className="absolute top-3 left-16 w-2 h-1 bg-[#fffaf0] rounded-full rotate-12" />
              <div className="absolute top-2 left-36 w-2 h-1 bg-[#fffaf0] rounded-full -rotate-6" />
              <div className="absolute top-4 right-16 w-2 h-1 bg-[#fffaf0] rounded-full rotate-45" />
            </div>
          </motion.div>

          {/* Secret Center Input Chamber in Marble & Gold */}
          <div className="relative z-15 bg-white border-2 border-[#CD9C20] rounded-xl p-4 sm:p-5 shadow-xl -mt-4 mb-2">
            {isUnlocked ? (
              <div className="py-2 text-center space-y-2 animate-in zoom-in-95 duration-300">
                <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-500/60 text-emerald-800 px-4 py-1.5 rounded-full font-bold text-xs">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Oferenda de 10% Concedida!</span>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <span className="font-mono text-2xl font-black text-[#CD9C20] tracking-widest bg-[#F8F6F0] px-5 py-2 rounded-lg border border-[#CD9C20] shadow-sm">
                    OLYMPUS10
                  </span>
                </div>
                <p className="text-[11px] text-neutral-600 font-medium">
                  Cupom de 10% ativo e pronto para o seu pedido!
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Seu WhatsApp: (11) 99999-8888"
                    className="w-full bg-[#F8F6F0] border border-[#CD9C20]/50 rounded-lg px-3.5 py-3 text-xs sm:text-sm text-[#1c1c1c] placeholder-neutral-500 focus:outline-none focus:border-[#CD9C20] shadow-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="py-3 px-6 gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>RESGATAR 10% OFF</span>
                  <Send className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </form>
            )}
          </div>

          {/* Bottom Bun / Classical Plinth */}
          <div className="relative z-10 flex justify-center -mt-6">
            <div className="bg-gradient-to-b from-[#c77727] to-[#df8a34] border-2 border-[#CD9C20] w-72 sm:w-88 h-12 rounded-b-[2rem] shadow-lg flex items-center justify-center">
              <span className="text-[10px] font-ancient text-[#0B0B0B] font-black tracking-widest uppercase">
                TEMPLO DO SMASH // TESEU BURGER
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
