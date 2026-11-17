'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  BUILDER_INGREDIENTS,
  BURGER_PRESETS,
  BuilderIngredient,
  BurgerStackItem,
} from './burgerData';
import { BurgerVisualStack } from './BurgerVisualStack';
import { BurgerLayerGraphic } from './BurgerLayerGraphic';
import { useCart } from '@/context/CartContext';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import {
  ShoppingBag,
  RotateCcw,
  Sparkles,
  Check,
  Plus,
  Flame,
  ArrowRight,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

let layerCounter = 0;
function createLayerInstance(ing: BuilderIngredient, suffix = ''): BurgerStackItem {
  layerCounter += 1;
  return {
    ...ing,
    instanceId: `${ing.id}_${layerCounter}${suffix ? '_' + suffix : ''}`,
  };
}

export function BurgerBuilderComponent() {
  const router = useRouter();
  const { addToCart, setIsCartOpen, showToast, triggerCartAnimation } = useCart();

  // Selected Category tab in Left Panel
  const [activeCategory, setActiveCategory] = useState<
    'buns' | 'patties' | 'cheeses' | 'veggies' | 'sauces' | 'extras'
  >('patties');

  // Exploded View vs Assembled View state (default to Exploded View matching reference image)
  const [isExploded, setIsExploded] = useState(true);

  // Initial burger stack loaded from "The Olympian Classic" preset
  const [stack, setStack] = useState<BurgerStackItem[]>(() => {
    const classicPreset = BURGER_PRESETS[0];
    return classicPreset.ingredientIds
      .map((id, index) => {
        const ing = BUILDER_INGREDIENTS.find((i) => i.id === id);
        if (!ing) return null;
        return createLayerInstance(ing, String(index));
      })
      .filter(Boolean) as BurgerStackItem[];
  });

  // Calculate live totals (Price, Calories, Weight)
  // Base price for custom build starts at R$ 16,00 (Brioche base + montagem artesanal)
  const BASE_BUILDER_PRICE = 16.0;
  const ingredientsPrice = stack.reduce((sum, item) => sum + item.price, 0);
  const totalPrice = BASE_BUILDER_PRICE + ingredientsPrice;
  const totalCalories = stack.reduce((sum, item) => sum + item.calories, 0);
  const totalGrams = stack.reduce((sum, item) => sum + item.grams, 0);

  // Golden Rule of Burger Stacking:
  // - pao-baixo is always at index 0.
  // - pao-cima is always at the last index.
  // - New ingredients are inserted immediately BEFORE pao-cima.
  const handleAddIngredient = (ingredient: BuilderIngredient) => {
    // If user clicked a bun:
    if (ingredient.isBun) {
      // If user selected an Australian or Brioche bun, update both base and top buns
      const isAustralian = ingredient.id.includes('australiano');
      const bottomBunId = isAustralian ? 'pao-australiano-baixo' : 'pao-baixo';
      const topBunId = isAustralian ? 'pao-australiano-cima' : 'pao-cima';

      const newBottomBun = BUILDER_INGREDIENTS.find((i) => i.id === bottomBunId)!;
      const newTopBun = BUILDER_INGREDIENTS.find((i) => i.id === topBunId)!;

      setStack((prev) => {
        const withoutBuns = prev.filter((i) => !i.isBun);
        return [
          createLayerInstance(newBottomBun, 'base'),
          ...withoutBuns,
          createLayerInstance(newTopBun, 'top'),
        ];
      });
      return;
    }

    // For any other filling, insert it right before the top bun
    const newItem = createLayerInstance(ingredient);

    setStack((prev) => {
      const topBunIndex = prev.findIndex((i) => i.isTopBun);
      if (topBunIndex !== -1) {
        const next = [...prev];
        next.splice(topBunIndex, 0, newItem);
        return next;
      }
      return [...prev, newItem];
    });
  };

  // Duplicate a layer (e.g. from the exploded view (+) button)
  const handleDuplicateLayer = (index: number) => {
    const target = stack[index];
    if (!target || target.isBun) return;

    const duplicateItem = createLayerInstance(target, 'copy');

    setStack((prev) => {
      const next = [...prev];
      next.splice(index + 1, 0, duplicateItem);
      return next;
    });
  };

  // Remove a specific layer (e.g. from the exploded view (-) button)
  const handleRemoveLayer = (index: number) => {
    const target = stack[index];
    if (!target || target.isBun) return;

    setStack((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Undo last added ingredient
  const handleUndo = () => {
    setStack((prev) => {
      // Find the last non-bun item
      for (let i = prev.length - 1; i >= 0; i--) {
        if (!prev[i].isBun) {
          return prev.filter((_, idx) => idx !== i);
        }
      }
      return prev;
    });
  };

  // Load a preset
  const handleLoadPreset = (preset: (typeof BURGER_PRESETS)[0]) => {
    const newItems = preset.ingredientIds
      .map((id, index) => {
        const ing = BUILDER_INGREDIENTS.find((i) => i.id === id);
        if (!ing) return null;
        return createLayerInstance(ing, `preset_${index}`);
      })
      .filter(Boolean) as BurgerStackItem[];

    setStack(newItems);
    showToast(`Receita "${preset.name}" carregada na forja!`);
  };

  // Add the custom creation to the global cart
  const handleAddToCart = () => {
    // Collect burger details
    const nonBuns = stack.filter((i) => !i.isBun);
    const bun = stack.find((i) => i.isTopBun)?.name || 'Pão Brioche';

    const ingredientsSummary = nonBuns.map((i) => i.name).join(' + ');
    const burgerName = `Burger Artesanal do Olimpo (${stack.length} camadas)`;

    addToCart({
      menuItemId: `custom-burger-${Date.now()}`,
      name: burgerName,
      unitPrice: totalPrice,
      quantity: 1,
      totalPrice,
      imageType: 'classic',
      selectedToppings: nonBuns.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
      })),
      isComboUpgrade: false,
      notes: `Ingredientes da forja: ${bun} + ${ingredientsSummary}`,
    });

    triggerCartAnimation();
    showToast('Hambúrguer personalizado adicionado ao banquete!');
    router.push('/carinho');
  };

  // Count how many times an ingredient appears in the current burger
  const getIngredientCount = (id: string) => {
    if (id.includes('pao-baixo') || id.includes('pao-cima')) {
      const isAustralian = id.includes('australiano');
      const hasCurrent = stack.some((i) =>
        isAustralian ? i.id.includes('australiano') : !i.id.includes('australiano')
      );
      return hasCurrent ? 1 : 0;
    }
    return stack.filter((i) => i.id === id).length;
  };

  const categories = [
    { id: 'buns', label: 'Pães', icon: '🥖' },
    { id: 'patties', label: 'Carnes', icon: '🥩' },
    { id: 'cheeses', label: 'Queijos', icon: '🧀' },
    { id: 'veggies', label: 'Saladas', icon: '🥗' },
    { id: 'sauces', label: 'Molhos', icon: '🏺' },
    { id: 'extras', label: 'Extras', icon: '🥓' },
  ] as const;

  const currentCategoryIngredients = BUILDER_INGREDIENTS.filter(
    (item) => item.category === activeCategory
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      {/* 1. Header & Live Nutrition / Price Bar */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          <LaurelWreathIcon size={20} color="#CD9C20" />
          <span className="text-xs font-ancient font-bold text-[#CD9C20] uppercase tracking-widest">
            Forja de Hefesto • Construtor Visual
          </span>
          <LaurelWreathIcon size={20} color="#CD9C20" />
        </div>

        <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-[#1c1c1c]">
          BUILD YOUR CRAVE
        </h1>

        {/* Live Metrics: Price & Calories & Weight (matching reference image) */}
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="font-display font-black text-2xl sm:text-3xl text-[#1c1c1c] tracking-tight">
            R$ {totalPrice.toFixed(2).replace('.', ',')}
          </span>
          <span className="text-neutral-400 font-ancient">•</span>
          <span className="text-xs sm:text-sm font-ancient font-semibold text-neutral-600">
            {totalCalories} kcal
          </span>
          <span className="text-neutral-400 font-ancient">•</span>
          <span className="text-xs sm:text-sm font-ancient font-semibold text-neutral-600">
            {totalGrams}g peso
          </span>
        </div>

        <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-lg mx-auto">
          Escolha cada fatia do seu lanche artesanal. Os ingredientes empilham-se em tempo real na forja sagrada.
        </p>
      </div>

      {/* 2. Main Two-Column Layout (Matching reference image: Options on Left, Burger in Center/Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: CATEGORIES & INGREDIENT CARDS (5 cols)       */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 bg-white border border-[#CD9C20]/40 rounded-3xl p-5 shadow-lg flex flex-col space-y-5">
          {/* Category Tabs Header (Buns, Patty, Cheese, Veggies, etc.) */}
          <div className="grid grid-cols-3 gap-2 bg-[#F8F6F0] p-1.5 rounded-2xl border border-[#CD9C20]/25">
            {categories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  className={`py-2 px-3 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                    isActive
                      ? 'bg-[#161616] text-[#F5CB5C] shadow-md'
                      : 'text-neutral-600 hover:text-black hover:bg-white/60'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Ingredient Cards Grid (Matching reference card styling) */}
          <div className="grid grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1 scrollbar-none">
            {currentCategoryIngredients.map((ingredient) => {
              const count = getIngredientCount(ingredient.id);
              const isSelected = count > 0;

              return (
                <button
                  key={ingredient.id}
                  type="button"
                  onClick={() => handleAddIngredient(ingredient)}
                  className={`relative p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-[#FAF7EE] border-[#CD9C20] shadow-md ring-1 ring-[#CD9C20]'
                      : 'bg-[#FBFBF9] border-neutral-200 hover:border-[#CD9C20]/60 hover:bg-white shadow-xs'
                  }`}
                >
                  {/* Selected check badge / counter */}
                  {isSelected && (
                    <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full gold-gradient-bg text-[#0B0B0B] flex items-center justify-center font-black text-[10px] shadow-sm">
                      {count > 1 ? `${count}x` : <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  )}

                  {/* Thumbnail / Graphic preview */}
                  <div className="w-full h-16 flex items-center justify-center mb-2 overflow-hidden transform transition-transform group-hover:scale-105">
                    <BurgerLayerGraphic
                      id={ingredient.id}
                      imagePath={ingredient.imagePath}
                      width={120}
                      height={48}
                    />
                  </div>

                  {/* Name & Pricing */}
                  <div>
                    <h3 className="font-display font-bold text-xs text-[#1c1c1c] uppercase tracking-wider leading-snug line-clamp-2">
                      {ingredient.name}
                    </h3>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-sans font-black text-xs text-[#CD9C20]">
                        {ingredient.price > 0
                          ? `+ R$ ${ingredient.price.toFixed(2).replace('.', ',')}`
                          : 'Incluso'}
                      </span>
                      <span className="text-[10px] text-neutral-500 font-ancient">
                        {ingredient.calories} kcal
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Preset Buttons Strip */}
          <div className="pt-3 border-t border-neutral-200">
            <span className="text-[11px] font-ancient font-bold uppercase tracking-wider text-neutral-500 block mb-2">
              Ou comece com um Preset Sagrado:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {BURGER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleLoadPreset(preset)}
                  className="py-1 px-2.5 rounded-lg bg-[#F8F6F0] hover:bg-[#F2ECDD] border border-[#CD9C20]/40 text-neutral-800 text-[11px] font-ancient font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                >
                  <span>{preset.name}</span>
                  <span className="text-[9px] text-[#CD9C20]">({preset.badge})</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: 3D INTERACTIVE VISUAL BURGER STACK (7 cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 flex flex-col items-center">
          {/* Main Visual Display Card */}
          <div className="w-full bg-gradient-to-b from-white via-[#FAF8F2] to-[#F2ECDD]/60 border border-[#CD9C20]/50 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col items-center justify-between relative overflow-hidden min-h-[500px]">
            {/* Ambient Background Gold Halo */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#F5CB5C]/15 rounded-full blur-3xl pointer-events-none" />

            {/* The Floating / Stacked Burger Visual Component */}
            <BurgerVisualStack
              stack={stack}
              isExploded={isExploded}
              onToggleExploded={() => setIsExploded(!isExploded)}
              onDuplicateLayer={handleDuplicateLayer}
              onRemoveLayer={handleRemoveLayer}
            />

            {/* Stack Info Summary Bar */}
            <div className="w-full mt-4 pt-4 border-t border-[#CD9C20]/25 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-600">
              <div className="flex items-center gap-2">
                <span className="font-ancient font-bold text-[#1c1c1c] uppercase">
                  {stack.length} Camadas:
                </span>
                <span className="text-neutral-500 text-[11px] truncate max-w-xs sm:max-w-md">
                  {stack.map((i) => i.name).join(' • ')}
                </span>
              </div>

              {/* Undo / Reset Buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndo}
                  className="py-1.5 px-3 rounded-xl bg-white border border-neutral-300 hover:border-[#CD9C20] text-neutral-700 text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs"
                  title="Remover o último ingrediente adicionado"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Desfazer</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleLoadPreset(BURGER_PRESETS[3])}
                  className="py-1.5 px-3 rounded-xl bg-white border border-neutral-300 hover:border-rose-400 text-rose-700 text-xs font-semibold transition-colors shadow-xs"
                  title="Limpar todos os ingredientes e começar do zero"
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Big CTA Bar (Add to Cart) */}
          <div className="w-full mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-5 bg-white border border-[#CD9C20]/60 rounded-2xl shadow-lg">
            <div>
              <span className="text-[10px] font-ancient font-bold uppercase text-[#CD9C20] tracking-widest block">
                Total do Monumento
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-display font-black text-[#1c1c1c]">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
                <span className="text-xs text-neutral-500 font-ancient">
                  ({totalCalories} kcal • {totalGrams}g)
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full sm:w-auto py-3.5 sm:py-4 px-8 sm:px-12 rounded-full gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] font-display font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_25px_rgba(205,156,32,0.4)] transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
              <span>Adicionar ao Banquete</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
