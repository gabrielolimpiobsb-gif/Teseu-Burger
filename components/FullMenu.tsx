'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MenuItem } from '@/types/burger';
import { STORE_INFO } from '@/lib/data';
import { BurgerGraphic } from '@/components/BurgerGraphics';
import { GreekFrieze, ParthenonIcon, LaurelWreathIcon } from '@/components/GreekOrnament';
import { Search, Plus, ArrowRight, Clock, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useCart } from '@/context/CartContext';

interface FullMenuProps {
  items: MenuItem[];
  onSelectItem?: (item: MenuItem) => void;
  limit?: number;
  showViewMore?: boolean;
  isDedicatedPage?: boolean;
}

export function FullMenu({
  items,
  limit,
  showViewMore = false,
  isDedicatedPage = false,
}: FullMenuProps) {
  const { startNavigation } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [liveItems, setLiveItems] = useState<MenuItem[]>(items);

  // Sync real-time stock & prices with Admin Master Data
  React.useEffect(() => {
    let isMounted = true;
    fetch('/api/admin/menu')
      .then((res) => res.json())
      .then((data) => {
        if (data.items && isMounted) {
          setLiveItems(data.items);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const categories = [
    { id: 'all', label: '🏛️ Banquete Completo' },
    { id: 'smash', label: '⚡ Smash do Olimpo' },
    { id: 'especiais', label: '👑 Especiais & Drops' },
    { id: 'combos', label: '🏺 Combos Sagrados' },
    { id: 'sides', label: '🍟 Fritas Espartanas' },
    { id: 'bebidas', label: '🍷 Néctares & Shakes' },
    { id: 'sobremesas', label: '🍇 Ambrosias' },
  ];

  const filteredItems = liveItems.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'smash'
        ? item.category === 'smash' || item.category === 'legends'
        : item.category === selectedCategory;

    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const displayedItems = limit ? filteredItems.slice(0, limit) : filteredItems;

  return (
    <section
      id="cardapio"
      className={`${
        isDedicatedPage ? 'pt-6 pb-20' : 'py-20 sm:py-24'
      } bg-[#f5f5f5] text-[#1c1c1c] border-b border-[#CD9C20]/25 relative`}
    >
      {/* Subtle Greek Frieze Top Border */}
      {!isDedicatedPage && <GreekFrieze variant="dark" className="absolute top-0 left-0 right-0" />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest block mb-2">
              {isDedicatedPage ? 'Templo Gastronômico • Cardápio Completo' : 'Cardápio dos Deuses'}
            </span>
            <h2 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
              CARDÁPIO DO OLIMPO
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-neutral-600">
              {isDedicatedPage
                ? `Explore todas as ${items.length} criações e oferendas artesanais forjadas na chapa viva a 230°C.`
                : 'Escolha suas oferendas gastronômicas e personalize com adicionais nobres a seu gosto.'}
            </p>
          </div>

          {/* Quick Search & Status Badges */}
          <div className="flex flex-col gap-2.5 w-full md:w-auto md:items-end">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-[#CD9C20] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por lanche ou ingrediente..."
                className="w-full bg-white border border-[#CD9C20]/50 rounded-full pl-10 pr-4 py-2.5 text-xs text-[#1c1c1c] placeholder-neutral-500 shadow-sm focus:outline-none focus:border-[#CD9C20] focus:ring-1 focus:ring-[#CD9C20] transition-all"
              />
            </div>

            {/* Badges abaixo da barra de busca */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <div className="inline-flex items-center gap-1.5 bg-white border border-[#CD9C20]/40 px-2.5 py-1 rounded-full shadow-xs text-[10px] font-ancient font-semibold text-neutral-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{STORE_INFO.status}</span>
              </div>

              <div className="inline-flex items-center gap-1 bg-white border border-[#CD9C20]/40 px-2.5 py-1 rounded-full shadow-xs text-[10px] font-ancient font-semibold text-neutral-800">
                <Clock className="w-3 h-3 text-[#CD9C20]" />
                <span>Entrega: {STORE_INFO.avgTime}</span>
              </div>

              <div className="inline-flex items-center gap-1 bg-white border border-[#CD9C20]/40 px-2.5 py-1 rounded-full shadow-xs text-[10px] font-ancient font-semibold text-neutral-800">
                <Flame className="w-3 h-3 text-amber-500" />
                <span>Carne Fresca 100% Angus</span>
              </div>
            </div>
          </div>
        </div>

        {/* Categories Tab Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-2.5 px-4 rounded-full text-xs font-ancient font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                  isActive
                    ? 'gold-gradient-bg text-[#0B0B0B] shadow-[0_2px_15px_rgba(205,156,32,0.35)]'
                    : 'bg-white border border-neutral-300 text-neutral-700 hover:text-[#1c1c1c] hover:border-[#CD9C20]/60 shadow-sm'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Product Cards Grid */}
        {displayedItems.length === 0 ? (
          <div className="py-16 text-center text-neutral-500 text-sm">
            Nenhuma iguaria encontrada com o termo &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {displayedItems.map((item) => (
              <Link
                key={item.id}
                href={`/produto/${item.id}`}
                onClick={() => startNavigation(item.name)}
                className="block group h-full"
              >
                <motion.div
                  whileHover={{ y: item.isAvailable === 0 ? 0 : -4 }}
                  transition={{ duration: 0.2 }}
                  className={`rounded-xl sm:rounded-2xl border p-2.5 sm:p-5 flex flex-col justify-between h-full transition-all shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${
                    item.isAvailable === 0
                      ? 'bg-neutral-100/90 border-neutral-300 opacity-75'
                      : 'bg-white border-[#CD9C20]/30 group-hover:border-[#CD9C20] group-hover:shadow-[0_12px_30px_rgba(205,156,32,0.18)]'
                  }`}
                >
                  {/* Top: Image & Badge */}
                  <div className="relative mb-2.5 sm:mb-4 flex items-center justify-center bg-[#F8F6F0] rounded-lg sm:rounded-xl p-2 sm:p-4 min-h-[110px] sm:min-h-[170px] overflow-hidden border border-[#CD9C20]/20">
                    {item.isAvailable === 0 ? (
                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-rose-600 text-white text-[8px] sm:text-[9px] font-ancient font-black uppercase px-2 py-0.5 rounded shadow-sm z-10">
                        Esgotado
                      </span>
                    ) : item.badge ? (
                      <span className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 gold-gradient-bg text-[#0B0B0B] text-[8px] sm:text-[9px] font-ancient font-black uppercase px-1.5 sm:px-2.5 py-0.5 rounded shadow-sm">
                        {item.badge}
                      </span>
                    ) : null}
                    <div className={`transform transition-transform duration-300 ${item.isAvailable === 0 ? 'grayscale opacity-60' : 'group-hover:scale-105'}`}>
                      <div className="block sm:hidden">
                        <BurgerGraphic type={item.imageType} size={88} />
                      </div>
                      <div className="hidden sm:block">
                        <BurgerGraphic type={item.imageType} size={130} />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display text-xs sm:text-base uppercase tracking-wider text-[#1c1c1c] group-hover:text-[#CD9C20] transition-colors leading-tight line-clamp-1 sm:line-clamp-none">
                        {item.name}
                      </h3>
                      <p className="text-[10px] sm:text-xs text-neutral-600 leading-snug sm:leading-relaxed line-clamp-2 my-1.5 sm:mb-4 font-normal">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row */}
                  <div className="pt-2 sm:pt-3 border-t border-neutral-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-auto">
                    <div>
                      <span className="text-[8px] sm:text-[10px] text-neutral-500 uppercase block font-ancient font-semibold">Preço</span>
                      <span className="font-sans font-black text-xs sm:text-base text-[#1c1c1c]">
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                      {item.isAvailable === 0 ? (
                        <span className="flex-1 sm:flex-none justify-center py-1.5 sm:py-2 px-2.5 sm:px-3 bg-neutral-300 text-neutral-600 font-display font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-md sm:rounded-lg flex items-center gap-1">
                          <span>Esgotado</span>
                        </span>
                      ) : (
                        <span
                          className="flex-1 sm:flex-none justify-center py-1.5 sm:py-2 px-2.5 sm:px-3 gold-gradient-bg group-hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-[10px] sm:text-xs uppercase tracking-wider rounded-md sm:rounded-lg flex items-center gap-1 transition-all shadow-sm"
                        >
                          <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
                          <span>Ver Iguaria</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}

        {/* Ver Mais CTA Button */}
        {showViewMore && (
          <div className="mt-12 text-center">
            <Link
              href="/cardapio"
              className="inline-flex items-center justify-center gap-2.5 sm:gap-3 py-3.5 sm:py-4 px-6 sm:px-10 rounded-full gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_6px_25px_rgba(205,156,32,0.35)] group"
            >
              <LaurelWreathIcon size={18} color="#0B0B0B" />
              <span>VER MAIS NO CARDÁPIO COMPLETO ({items.length} ITENS)</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <p className="mt-2.5 text-[11px] font-ancient text-neutral-500 uppercase tracking-wider">
              Explore todos os smashes, combos, acompanhamentos, néctares e ambrosias
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
