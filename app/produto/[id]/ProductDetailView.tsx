'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MenuItem } from '@/types/burger';
import {
  MENU_ITEMS,
  AVAILABLE_TOPPINGS,
  AVAILABLE_SAUCES,
  FRIES_OPTIONS,
  DRINK_OPTIONS,
  FriesOption,
  DrinkOption,
  COMBO_UPGRADE_PRICE,
  COMBO_DRINKS,
  REVIEWS,
  COMBO_FRIES_UPGRADES,
  ComboFriesUpgrade,
} from '@/lib/data';
import { SweetCasinoRoulette } from '@/components/SweetCasinoRoulette';
import { useCart } from '@/context/CartContext';
import { MeatDoneness, ExtraTopping } from '@/types/burger';
import { ProductImage } from '@/components/ProductImage';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import {
  ArrowLeft,
  ShoppingBag,
  Star,
  Check,
  Plus,
  Minus,
  Sparkles,
  ChevronRight,
  Share2,
  Utensils,
  XCircle,
  Gift,
  Droplets,
  CupSoda,
} from 'lucide-react';

interface ProductDetailViewProps {
  item: MenuItem;
}

function DrinkInlineRow({
  drink,
  isSelected,
  onToggle,
}: {
  drink: DrinkOption;
  isSelected: boolean;
  onToggle: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-xs'
          : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
      }`}
    >
      {/* Inline photo + name on same line */}
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#FAF8F3] border border-[#CD9C20]/40 flex items-center justify-center shrink-0 overflow-hidden">
          {!imgError ? (
            <Image
              src={drink.image}
              alt={drink.name}
              width={32}
              height={32}
              referrerPolicy="no-referrer"
              className="object-contain w-full h-full p-0.5"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xs">🥤</span>
          )}
        </div>
        <div className="min-w-0 flex items-baseline gap-1.5">
          <span className="text-[11px] sm:text-xs font-semibold text-[#1c1c1c] truncate">{drink.name}</span>
          <span className="text-[9px] text-neutral-500 font-ancient hidden sm:inline">{drink.volume}</span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 ml-2">
        <span className="text-[11px] font-bold text-[#CD9C20]">
          +R$ {drink.price.toFixed(2).replace('.', ',')}
        </span>
        <div
          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
            isSelected ? 'border-[#CD9C20] bg-[#CD9C20] text-white' : 'border-neutral-400'
          }`}
        >
          {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
        </div>
      </div>
    </button>
  );
}

import { ComboCasalConfigurator } from '@/components/ComboCasalConfigurator';

export function ProductDetailView({ item }: ProductDetailViewProps) {
  const { addToCart, totalCartCount, totalCartPrice, setIsCartOpen, cartShake, showToast, startNavigation } = useCart();

  const isComboCasal = item.id === 'combo-casal' || item.category === 'combos';
  const availableBurgers = MENU_ITEMS.filter((m) => m.isBurger);

  const [quantity, setQuantity] = useState(1);
  const [doneness, setDoneness] = useState<MeatDoneness>('Ao ponto');
  const [selectedToppings, setSelectedToppings] = useState<ExtraTopping[]>([]);
  const [selectedSauces, setSelectedSauces] = useState<ExtraTopping[]>([]);
  const [selectedFries, setSelectedFries] = useState<FriesOption | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<DrinkOption | null>(null);
  const [isCombo, setIsCombo] = useState(false);
  const [comboDrink, setComboDrink] = useState(COMBO_DRINKS[0]);
  const [notes, setNotes] = useState('');

  // 1. Estados obrigatórios para o Combo Casal
  const [casalBurger1, setCasalBurger1] = useState<MenuItem>(() => availableBurgers[0] || MENU_ITEMS[0]);
  const [casalBurger2, setCasalBurger2] = useState<MenuItem>(() => availableBurgers[1] || availableBurgers[0]);
  const [casalDoneness1, setCasalDoneness1] = useState<MeatDoneness>('Ao ponto');
  const [casalDoneness2, setCasalDoneness2] = useState<MeatDoneness>('Ao ponto');

  // 2. Os 2 Refris obrigatórios
  const [casalDrink1, setCasalDrink1] = useState<DrinkOption>(() => DRINK_OPTIONS[0]);
  const [casalDrink2, setCasalDrink2] = useState<DrinkOption>(() => DRINK_OPTIONS[2] || DRINK_OPTIONS[0]);

  // 3. As 2 Batatas (iniciam como Pequena P inclusa: 0, M: +1.50, G: +5.00)
  const [casalFries1, setCasalFries1] = useState<ComboFriesUpgrade>(COMBO_FRIES_UPGRADES[0]);
  const [casalFries2, setCasalFries2] = useState<ComboFriesUpgrade>(COMBO_FRIES_UPGRADES[0]);

  const [drawnSweetGift, setDrawnSweetGift] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const fromUrl = params.get('brinde');
      if (fromUrl) return fromUrl;
    }
    return '';
  });

  const toggleTopping = (topping: ExtraTopping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const toggleSauce = (sauce: ExtraTopping) => {
    if (selectedSauces.some((s) => s.id === sauce.id)) {
      setSelectedSauces(selectedSauces.filter((s) => s.id !== sauce.id));
    } else {
      setSelectedSauces([...selectedSauces, sauce]);
    }
  };

  const toggleFries = (fries: FriesOption) => {
    if (selectedFries?.id === fries.id) {
      setSelectedFries(null);
    } else {
      setSelectedFries(fries);
    }
  };

  const toggleDrink = (drink: DrinkOption) => {
    if (selectedDrink?.id === drink.id) {
      setSelectedDrink(null);
    } else {
      setSelectedDrink(drink);
    }
  };

  const toppingsTotal = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const saucesTotal = selectedSauces.reduce((acc, s) => acc + s.price, 0);
  const friesTotal = selectedFries ? selectedFries.price : 0;
  const drinkTotal = selectedDrink ? selectedDrink.price : 0;
  const comboPrice = isCombo ? COMBO_UPGRADE_PRICE : 0;
  
  // Cálculo de adicionais das batatas do Combo Casal (P: 0, M: +1.50, G: +5.00)
  const casalFriesExtra = isComboCasal ? (casalFries1.extraPrice + casalFries2.extraPrice) : 0;
  
  const unitPrice = isComboCasal
    ? item.price + casalFriesExtra
    : item.price + toppingsTotal + saucesTotal + friesTotal + drinkTotal + comboPrice;
  const totalPrice = unitPrice * quantity;

  const handleAdd = () => {
    // Para o Combo Casal, o sorteio na máquina caça-níqueis é obrigatório
    if (isComboCasal && !drawnSweetGift) {
      showToast('🎰 Puxe a alavanca da Máquina Caça-Níqueis Retrô para resgatar seu Doce Grátis!');
      const el = document.getElementById('sorteio-brinde-area');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (isComboCasal) {
      addToCart({
        menuItemId: item.id,
        name: item.name,
        unitPrice,
        quantity,
        totalPrice,
        imageType: item.imageType,
        image: item.image,
        selectedToppings: [],
        isComboUpgrade: true,
        drawnSweetGift: drawnSweetGift,
        comboCasal: {
          burger1: {
            id: casalBurger1.id,
            name: casalBurger1.name,
            doneness: casalDoneness1,
            image: casalBurger1.image,
          },
          burger2: {
            id: casalBurger2.id,
            name: casalBurger2.name,
            doneness: casalDoneness2,
            image: casalBurger2.image,
          },
          drink1: {
            id: casalDrink1.id,
            name: `${casalDrink1.name} (${casalDrink1.volume})`,
            image: casalDrink1.image,
          },
          drink2: {
            id: casalDrink2.id,
            name: `${casalDrink2.name} (${casalDrink2.volume})`,
            image: casalDrink2.image,
          },
          fries1: {
            size: casalFries1.size,
            name: casalFries1.name,
            extraPrice: casalFries1.extraPrice,
          },
          fries2: {
            size: casalFries2.size,
            name: casalFries2.name,
            extraPrice: casalFries2.extraPrice,
          },
        },
        notes: notes.trim() || undefined,
      });
      return;
    }

    // Pedido regular (hambúrguer individual ou acompanhamento)
    addToCart({
      menuItemId: item.id,
      name: item.name,
      unitPrice,
      quantity,
      totalPrice,
      image: item.image,
      imageType: item.imageType,
      doneness: item.isBurger ? doneness : undefined,
      selectedToppings,
      selectedSauces: selectedSauces.length > 0 ? selectedSauces : undefined,
      selectedFries: selectedFries
        ? { size: selectedFries.size, name: selectedFries.name, price: selectedFries.price }
        : undefined,
      selectedDrink: selectedDrink
        ? { id: selectedDrink.id, name: `${selectedDrink.name} (${selectedDrink.volume})`, price: selectedDrink.price, image: selectedDrink.image }
        : undefined,
      isComboUpgrade: isCombo,
      comboDrink: isCombo ? comboDrink : undefined,
      notes: notes.trim() || undefined,
    });
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link da iguaria copiado!');
    }
  };

  const relevantReviews = REVIEWS.slice(0, 2);
  const otherBurgers = MENU_ITEMS.filter((m) => m.id !== item.id && m.isBurger).slice(0, 3);

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1c1c1c] selection:bg-[#F5CB5C] selection:text-[#0B0B0B] pb-16 w-full max-w-full overflow-x-clip">
      {/* Top Header Bar - Fixed & Always Visible on Scroll */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#CD9C20]/40 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-12 sm:h-14 flex items-center justify-between">
          <Link
            href="/#cardapio"
            prefetch={true}
            className="inline-flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs font-ancient font-bold text-[#1c1c1c] hover:text-[#CD9C20] bg-[#F2ECDD] border border-[#CD9C20]/40 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span>Cardápio</span>
          </Link>

          <Link href="/" prefetch={true} className="flex items-center shrink-0">
            <div className="relative h-7 sm:h-9 w-24 sm:w-36 shrink-0">
              <Image
                src="/logo.png"
                alt="Teseu Burger"
                fill
                priority
                referrerPolicy="no-referrer"
                className="object-contain object-center"
                sizes="(max-width: 640px) 96px, 144px"
              />
            </div>
          </Link>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handleShare}
              className="p-1.5 text-neutral-600 hover:text-[#CD9C20] bg-white border border-neutral-300 rounded-full transition-colors hidden sm:flex"
              title="Compartilhar"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <Link
              href="/carinho"
              className={`gold-gradient-bg text-[#0B0B0B] font-display font-black text-[10px] sm:text-xs px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-full flex items-center gap-1 sm:gap-1.5 shadow-xs transition-all duration-300 ${
                cartShake ? 'scale-125 ring-4 ring-[#CD9C20]/60 shadow-[0_0_22px_rgba(205,156,32,0.85)]' : ''
              }`}
              aria-label="Abrir pedido"
            >
              <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
              <span suppressHydrationWarning className="font-bold">
                {totalCartCount > 0 ? `R$ ${totalCartPrice.toFixed(2).replace('.', ',')}` : 'PEDIDO (0)'}
              </span>
            </Link>
          </div>
        </div>
      </header>

      {/* Spacer to prevent content from going behind fixed header */}
      <div className="h-12 sm:h-14" />

      {/* Breadcrumb Strip - Tight */}
      <div className="bg-[#ede9de] border-b border-[#CD9C20]/20 py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-[11px] text-neutral-600 font-ancient flex items-center gap-1.5 overflow-x-auto whitespace-nowrap">
          <Link href="/" prefetch={true} className="hover:text-black">Início</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <Link href="/cardapio" prefetch={true} className="hover:text-black">Cardápio</Link>
          <ChevronRight className="w-3 h-3 text-neutral-400" />
          <span className="text-[#CD9C20] font-bold uppercase">{item.name}</span>
        </div>
      </div>

      {/* Main PDP Container - Compact, unified, 2-column layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          
          {/* Left Column: Compact Visual Preview (5 cols) */}
          <div className="lg:col-span-5">
            {/* Visual Showcase Card - Clean & Focused */}
            <div className="relative bg-gradient-to-b from-white via-[#FCFAF6] to-[#F5EFE3] border border-[#CD9C20]/40 rounded-2xl p-4 sm:p-6 flex flex-col items-center justify-center overflow-hidden shadow-sm lg:sticky lg:top-20">
              <div className="absolute inset-0 bg-[#F5CB5C]/10 blur-[80px] pointer-events-none rounded-full" />

              {/* Product Image Slot */}
              <div className="relative z-10 w-full flex items-center justify-center">
                <ProductImage
                  src={isComboCasal ? (item.image || '/combocasal.png') : item.image}
                  alt={item.name}
                  imageCodeHint={isComboCasal ? '/combocasal.png' : (item.image || `/${item.imageType}.png`)}
                  className="w-full h-56 sm:h-72 max-w-sm"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Column: Compact Product Details & Customization (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#CD9C20]/50 rounded-2xl p-4 sm:p-6 shadow-md space-y-4 text-[#1c1c1c]">
            {/* Header: Title, Category, Rating & Price on same compact block */}
            <div className="border-b border-neutral-200 pb-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[10px] font-ancient font-bold text-[#CD9C20] uppercase tracking-wider">
                  {`${item.category.toUpperCase()} • OFERENDA SAGRADA`}
                </span>
                <div className="flex items-center gap-1 text-[#CD9C20] text-xs font-bold shrink-0">
                  <Star className="w-3 h-3 fill-[#CD9C20]" />
                  <span>5.0</span>
                  <span className="text-neutral-500 font-normal font-ancient text-[11px]">(450+ avaliações)</span>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h1 className="text-xl sm:text-2xl font-display uppercase tracking-wide text-[#1c1c1c] leading-tight">
                  {item.name}
                </h1>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-display font-black text-[#1c1c1c] tracking-tight">
                    R$ {unitPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-neutral-500 font-ancient hidden sm:inline">cada</span>
                </div>
              </div>

              <p className="mt-2 text-xs text-neutral-600 leading-relaxed bg-[#F8F6F0] px-3 py-2 rounded-lg border border-neutral-200">
                {item.description}
              </p>

              {/* Official Ingredients Breakdown */}
              {item.isBurger && (item.bun || item.meat || item.cheese) && (
                <div className="mt-3 p-3 bg-[#FCFAF6] rounded-xl border border-[#CD9C20]/30 text-xs space-y-1">
                  <span className="text-[10px] font-ancient font-bold text-[#CD9C20] uppercase tracking-wider block mb-1">
                    Ingredientes Oficiais:
                  </span>
                  {item.bun && <p><strong className="text-neutral-800">Pão:</strong> {item.bun}</p>}
                  {item.meat && <p><strong className="text-neutral-800">Carne:</strong> {item.meat}</p>}
                  {item.cheese && <p><strong className="text-neutral-800">Queijo:</strong> {item.cheese}</p>}
                  {item.complements && <p><strong className="text-neutral-800">Complementos:</strong> {item.complements}</p>}
                  {item.sauce && <p><strong className="text-neutral-800">Molho:</strong> {item.sauce}</p>}
                </div>
              )}

            </div>

            {isComboCasal ? (
              <ComboCasalConfigurator
                availableBurgers={availableBurgers}
                casalBurger1={casalBurger1}
                setCasalBurger1={setCasalBurger1}
                casalBurger2={casalBurger2}
                setCasalBurger2={setCasalBurger2}
                casalDoneness1={casalDoneness1}
                setCasalDoneness1={setCasalDoneness1}
                casalDoneness2={casalDoneness2}
                setCasalDoneness2={setCasalDoneness2}
                casalDrink1={casalDrink1}
                setCasalDrink1={setCasalDrink1}
                casalDrink2={casalDrink2}
                setCasalDrink2={setCasalDrink2}
                casalFries1={casalFries1}
                setCasalFries1={setCasalFries1}
                casalFries2={casalFries2}
                setCasalFries2={setCasalFries2}
                drawnSweetGift={drawnSweetGift}
                setDrawnSweetGift={setDrawnSweetGift}
                showToast={showToast}
              />
            ) : (
              <div className="space-y-4">
                {/* Meat doneness - Compact horizontal row */}
                {item.isBurger && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20] tracking-wider flex items-center gap-1.5">
                        <SpartanHelmetIcon size={12} color="#CD9C20" />
                        <span>Ponto da Carne</span>
                        <span className="text-[8px] bg-[#CD9C20] text-white px-1 py-0.2 rounded font-black">
                          OBRIGATÓRIO
                        </span>
                      </label>
                      <span className="text-[10px] text-neutral-500 font-ancient">Selecione 1</span>
                    </div>
                    
                    {/* 3 options on the SAME ROW */}
                    <div className="grid grid-cols-3 gap-2">
                      {(['Ao ponto', 'Bem passado', 'Ao ponto para menos (Vermelhinho)'] as MeatDoneness[]).map((option) => {
                        const isSelected = doneness === option;
                        const labelShort = option === 'Ao ponto para menos (Vermelhinho)' ? 'Ao Ponto -' : option;
                        return (
                          <button
                            key={option}
                            type="button"
                            onClick={() => setDoneness(option)}
                            title={option}
                            className={`flex flex-col items-center justify-center py-1.5 sm:py-2 px-1 rounded-lg sm:rounded-xl border text-center transition-all ${
                              isSelected
                                ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-xs'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
                            }`}
                          >
                            <span className="text-[11px] sm:text-xs font-bold leading-tight">{labelShort}</span>
                            <span className="text-[9px] text-neutral-500 font-ancient mt-0.5">
                              {option === 'Ao ponto' ? 'Suculento' : option === 'Bem passado' ? 'Firme' : 'Rosado'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Extra Toppings - Compact 2-column chip grid */}
                {item.isBurger && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-ancient font-bold uppercase text-[#1c1c1c] tracking-wider flex items-center gap-1.5">
                        <Utensils className="w-3 h-3 text-[#CD9C20]" />
                        <span>Adicionais</span>
                      </label>
                      <span className="text-[10px] text-neutral-500 font-ancient">
                        {selectedToppings.length > 0 ? `${selectedToppings.length} selecionado(s)` : 'Opcional'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-0.5">
                      {AVAILABLE_TOPPINGS.map((topping) => {
                        const isSelected = selectedToppings.some((t) => t.id === topping.id);
                        return (
                          <button
                            key={topping.id}
                            type="button"
                            onClick={() => toggleTopping(topping)}
                            className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                              isSelected
                                ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c]'
                                : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              <div
                                className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                  isSelected ? 'bg-[#CD9C20] border-[#CD9C20] text-white' : 'border-neutral-400'
                                }`}
                              >
                                {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                              </div>
                              <span className="text-[11px] font-medium truncate">{topping.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-[#CD9C20] shrink-0 ml-1">
                              +R${topping.price.toFixed(0)}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 2. Categoria Molhos de Acompanhamento */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-ancient font-bold uppercase text-[#1c1c1c] tracking-wider flex items-center gap-1.5">
                      <Droplets className="w-3 h-3 text-[#CD9C20]" />
                      <span>Molhos de Acompanhamento</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-ancient">
                      {selectedSauces.length > 0 ? `${selectedSauces.length} selecionado(s)` : 'Opcional'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-0.5">
                    {AVAILABLE_SAUCES.map((sauce) => {
                      const isSelected = selectedSauces.some((s) => s.id === sauce.id);
                      return (
                        <button
                          key={sauce.id}
                          type="button"
                          onClick={() => toggleSauce(sauce)}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                            isSelected
                              ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c]'
                              : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 ${
                                isSelected ? 'bg-[#CD9C20] border-[#CD9C20] text-white' : 'border-neutral-400'
                              }`}
                            >
                              {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                            </div>
                            <span className="text-[11px] font-medium truncate">{sauce.name}</span>
                          </div>
                          <span className="text-[10px] font-bold text-[#CD9C20] shrink-0 ml-1">
                            +R${sauce.price.toFixed(2).replace('.', ',')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Categoria Adicionar Batata (P, M, G) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-ancient font-bold uppercase text-[#1c1c1c] tracking-wider flex items-center gap-1.5">
                      <span className="text-xs">🍟</span>
                      <span>Adicionar Batata (P, M, G)</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-ancient">
                      {selectedFries ? selectedFries.size : 'Opcional'}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {FRIES_OPTIONS.map((fries) => {
                      const isSelected = selectedFries?.id === fries.id;
                      return (
                        <button
                          key={fries.id}
                          type="button"
                          onClick={() => toggleFries(fries)}
                          className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-xl border text-center transition-all ${
                            isSelected
                              ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-xs'
                              : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
                          }`}
                        >
                          <span className="text-xs font-bold leading-tight uppercase">
                            {fries.name.split('(')[0].trim()}
                          </span>
                          <span className="text-[10px] text-neutral-500 font-ancient mt-0.5">
                            {fries.name.includes('Pequena') ? '120g' : fries.name.includes('Média') ? '200g' : '320g'}
                          </span>
                          <span className="text-[10px] font-bold text-[#CD9C20] mt-0.5">
                            +R$ {fries.price.toFixed(2).replace('.', ',')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Categoria Adicionar Refrigerante (Foto + Nome na mesma linha) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-ancient font-bold uppercase text-[#1c1c1c] tracking-wider flex items-center gap-1.5">
                      <CupSoda className="w-3.5 h-3.5 text-[#CD9C20]" />
                      <span>Adicionar Refrigerante</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-ancient">
                      {selectedDrink ? selectedDrink.name : 'Opcional'}
                    </span>
                  </div>

                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
                    {DRINK_OPTIONS.map((drink) => (
                      <DrinkInlineRow
                        key={drink.id}
                        drink={drink}
                        isSelected={selectedDrink?.id === drink.id}
                        onToggle={() => toggleDrink(drink)}
                      />
                    ))}
                  </div>
                </div>

                {/* Combo Upgrade Box - Compact & streamlined */}
                {item.isBurger && (
                  <div className="p-3 rounded-xl border border-[#CD9C20]/60 bg-gradient-to-r from-[#FAF8F3] to-[#F2ECDD]/60">
                    <div className="flex items-center justify-between gap-2">
                      <label htmlFor="combo-check-pdp" className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          id="combo-check-pdp"
                          checked={isCombo}
                          onChange={(e) => setIsCombo(e.target.checked)}
                          className="w-4 h-4 accent-[#CD9C20] rounded cursor-pointer"
                        />
                        <div>
                          <span className="font-ancient font-bold text-[#1c1c1c] text-xs uppercase flex items-center gap-1">
                            <span>Combo Completo</span>
                            <Sparkles className="w-3 h-3 text-[#CD9C20]" />
                          </span>
                          <p className="text-[10px] text-neutral-600">
                            Batatas crocantes + Bebida em lata gelada
                          </p>
                        </div>
                      </label>
                      <span className="font-extrabold text-xs text-[#CD9C20] shrink-0 bg-white/80 border border-[#CD9C20]/40 px-2 py-0.5 rounded-md">
                        + R$ {COMBO_UPGRADE_PRICE.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {isCombo && (
                      <div className="mt-2 pt-2 border-t border-neutral-300 flex items-center gap-2">
                        <label className="text-[10px] font-ancient font-bold text-neutral-700 uppercase shrink-0">
                          Bebida:
                        </label>
                        <select
                          value={comboDrink}
                          onChange={(e) => setComboDrink(e.target.value)}
                          className="flex-1 bg-white border border-[#CD9C20] text-xs rounded-lg px-2 py-1 text-[#1c1c1c] focus:outline-none"
                        >
                          {COMBO_DRINKS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Special Notes - Compact inline row */}
            <div className="space-y-1">
              <label className="block text-[10px] font-ancient font-bold uppercase text-neutral-700 tracking-wider">
                Observações do Pedido (Opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Pão bem tostado, sem cebola, molho à parte..."
                className="w-full bg-[#F8F6F0] border border-neutral-300 rounded-lg px-3 py-1.5 text-xs text-[#1c1c1c] placeholder-neutral-500 focus:outline-none focus:border-[#CD9C20]"
              />
            </div>

            {/* Stepper + CTA Button on SAME ROW - Compact & punchy */}
            <div className="pt-2 border-t border-neutral-200 flex items-center gap-2.5">
              <div className="flex items-center border border-neutral-300 rounded-xl bg-[#F8F6F0] p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="p-1.5 text-neutral-600 hover:text-black disabled:opacity-30 transition-colors"
                  aria-label="Diminuir"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-6 text-center font-bold text-xs text-[#1c1c1c] font-mono">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 text-neutral-600 hover:text-black transition-colors"
                  aria-label="Aumentar"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {item.isAvailable === 0 ? (
                <button
                  type="button"
                  disabled
                  className="flex-1 py-3 px-4 bg-neutral-300 text-neutral-600 font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Iguaria Esgotada no Templo</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleAdd}
                  className="flex-1 py-3 px-4 gold-gradient-bg hover:brightness-105 active:scale-[0.98] text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-between"
                >
                  <span>Adicionar ao Pedido</span>
                  <span className="font-sans font-black text-xs sm:text-sm">
                    R$ {totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section - Compact */}
        <section className="mt-10 pt-6 border-t border-[#CD9C20]/25">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-ancient font-bold text-[#CD9C20] uppercase tracking-widest block">
                Testemunhos
              </span>
              <h2 className="text-lg sm:text-xl font-display uppercase tracking-tight text-[#1c1c1c]">
                Avaliações de Clientes
              </h2>
            </div>
            <div className="flex items-center gap-1 text-[#CD9C20] text-xs font-bold">
              <Star className="w-3.5 h-3.5 fill-[#CD9C20]" />
              <span>4.9 / 5.0 estrelas</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {relevantReviews.map((rev) => (
              <div key={rev.id} className="marble-tablet text-[#0B0B0B] p-3.5 shadow-2xs border border-[#e2ddd3]">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-xs uppercase">{rev.author}</span>
                  <div className="flex gap-0.5 text-[#CD9C20]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-[#CD9C20]" />
                    ))}
                  </div>
                </div>
                <p className="text-xs italic text-neutral-800 leading-snug font-serif">&quot;{rev.comment}&quot;</p>
                <div className="mt-2 pt-1 border-t border-dashed border-[#dcd4c0] text-[9px] text-neutral-600 font-mono">
                  {rev.city} • Pedido Verificado
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Other Recommendations - Compact 3-col on desktop, 2-col on mobile */}
        <section className="mt-8 pt-6 border-t border-[#CD9C20]/25">
          <div className="flex items-center justify-between mb-4">
            <div>
              <span className="text-[10px] font-ancient font-bold text-[#CD9C20] uppercase tracking-widest block">
                Outras Oferendas
              </span>
              <h2 className="text-lg sm:text-xl font-display uppercase tracking-tight text-[#1c1c1c]">
                Experimente Também
              </h2>
            </div>
            <Link
              href="/cardapio"
              prefetch={true}
              className="text-xs font-ancient font-bold text-[#CD9C20] hover:underline uppercase tracking-wider"
            >
              Ver Cardápio Completo →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {otherBurgers.map((other) => (
              <Link
                key={other.id}
                href={`/produto/${other.id}`}
                onClick={() => startNavigation(other.name)}
                className="bg-white rounded-xl border border-[#CD9C20]/40 hover:border-[#CD9C20] p-3 group transition-all flex flex-col justify-between shadow-2xs hover:shadow-sm"
              >
                <div className="mb-2 overflow-hidden rounded-lg">
                  <ProductImage
                    src={other.image}
                    alt={other.name}
                    imageCodeHint={other.image || `/${other.imageType}.png`}
                    className="w-full h-24"
                  />
                </div>
                <div>
                  <h3 className="font-display text-xs sm:text-sm uppercase text-[#1c1c1c] group-hover:text-[#CD9C20] transition-colors truncate">
                    {other.name}
                  </h3>
                  <p className="text-[11px] text-neutral-600 line-clamp-1 mt-0.5">{other.description}</p>
                </div>
                <div className="mt-2.5 pt-2 border-t border-neutral-200 flex items-center justify-between">
                  <span className="font-black text-xs text-[#1c1c1c]">
                    R$ {other.price.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] font-ancient font-bold text-[#CD9C20] group-hover:underline">
                    Ver →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
