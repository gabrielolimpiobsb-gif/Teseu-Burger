'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { MenuItem, MeatDoneness, ExtraTopping } from '@/types/burger';
import { AVAILABLE_TOPPINGS, COMBO_UPGRADE_PRICE, COMBO_DRINKS } from '@/lib/data';
import { BurgerGraphic } from '@/components/BurgerGraphics';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import { X, Plus, Minus, Check, Sparkles } from 'lucide-react';

interface CustomizeModalProps {
  item: MenuItem | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (customizedItem: {
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    imageType: MenuItem['imageType'];
    doneness?: MeatDoneness;
    selectedToppings: ExtraTopping[];
    isComboUpgrade: boolean;
    comboDrink?: string;
    notes?: string;
  }) => void;
}

export function CustomizeModal({ item, isOpen, onClose, onAddToCart }: CustomizeModalProps) {
  if (!isOpen || !item) return null;

  return <CustomizeModalContent key={item.id} item={item} onClose={onClose} onAddToCart={onAddToCart} />;
}

function CustomizeModalContent({
  item,
  onClose,
  onAddToCart,
}: {
  item: MenuItem;
  onClose: () => void;
  onAddToCart: CustomizeModalProps['onAddToCart'];
}) {
  const [quantity, setQuantity] = useState(1);
  const [doneness, setDoneness] = useState<MeatDoneness>('Ao ponto');
  const [selectedToppings, setSelectedToppings] = useState<ExtraTopping[]>([]);
  const [isCombo, setIsCombo] = useState(false);
  const [comboDrink, setComboDrink] = useState(COMBO_DRINKS[0]);
  const [notes, setNotes] = useState('');

  const toggleTopping = (topping: ExtraTopping) => {
    if (selectedToppings.some((t) => t.id === topping.id)) {
      setSelectedToppings(selectedToppings.filter((t) => t.id !== topping.id));
    } else {
      setSelectedToppings([...selectedToppings, topping]);
    }
  };

  const toppingsTotal = selectedToppings.reduce((acc, t) => acc + t.price, 0);
  const comboPrice = isCombo ? COMBO_UPGRADE_PRICE : 0;
  const singleItemPrice = item.price + toppingsTotal + comboPrice;
  const finalPrice = singleItemPrice * quantity;

  const handleConfirm = () => {
    onAddToCart({
      menuItemId: item.id,
      name: item.name,
      unitPrice: singleItemPrice,
      quantity,
      totalPrice: finalPrice,
      imageType: item.imageType,
      doneness: item.isBurger ? doneness : undefined,
      selectedToppings,
      isComboUpgrade: isCombo,
      comboDrink: isCombo ? comboDrink : undefined,
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white border-2 border-[#CD9C20] rounded-2xl shadow-2xl overflow-hidden text-[#1c1c1c]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Temple Food Banner */}
        <div className="relative bg-gradient-to-b from-[#FBF9F5] via-[#F5F2EA] to-white p-6 pb-4 border-b border-[#CD9C20]/30 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 shrink-0 bg-[#F8F6F0] rounded-xl flex items-center justify-center border border-[#CD9C20]/40 p-1 shadow-sm">
              <BurgerGraphic type={item.imageType} size={70} />
            </div>
            <div>
              <span className="text-[10px] font-ancient font-bold uppercase tracking-widest text-[#CD9C20]">
                {`${item.category.toUpperCase()} • TEMPLO`}
              </span>
              <h3 className="text-lg sm:text-xl font-display uppercase tracking-wide text-[#1c1c1c] leading-tight">
                {item.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-base font-black text-[#CD9C20]">
                  R$ {item.price.toFixed(2).replace('.', ',')}
                </span>
                <Link
                  href={`/produto/${item.id}`}
                  className="text-[10px] font-ancient text-neutral-500 hover:text-[#CD9C20] underline transition-colors"
                >
                  Página completa →
                </Link>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-neutral-600 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto px-6 py-4 space-y-6 flex-1 text-sm bg-white">
          {/* Description */}
          <p className="text-xs text-neutral-700 leading-relaxed bg-[#F8F6F0] p-3.5 rounded-xl border border-neutral-200 font-normal">
            {item.description}
          </p>

          {/* 1. Meat Doneness (Burgers only) */}
          {item.isBurger && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="font-ancient font-bold text-[#CD9C20] uppercase text-xs tracking-wider flex items-center gap-1.5">
                  <SpartanHelmetIcon size={14} color="#CD9C20" />
                  <span>Ponto da Carne Sagrada</span>
                  <span className="text-[9px] bg-[#CD9C20] text-white px-1.5 py-0.2 rounded font-black">
                    OBRIGATÓRIO
                  </span>
                </label>
                <span className="text-[11px] text-neutral-500">Escolha 1</span>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {(['Ao ponto', 'Bem passado', 'Ao ponto para menos (Vermelhinho)'] as MeatDoneness[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setDoneness(option)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      doneness === option
                        ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-sm'
                        : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
                    }`}
                  >
                    <span>{option}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        doneness === option ? 'border-[#CD9C20] bg-[#CD9C20]' : 'border-neutral-400'
                      }`}
                    >
                      {doneness === option && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Extra Toppings */}
          {item.isBurger && (
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <label className="font-ancient font-bold text-[#1c1c1c] uppercase text-xs tracking-wider">
                  Turbine com Oferendas Extras
                </label>
                <span className="text-[11px] text-neutral-500">Opcional</span>
              </div>
              <div className="space-y-2">
                {AVAILABLE_TOPPINGS.map((topping) => {
                  const isSelected = selectedToppings.some((t) => t.id === topping.id);
                  return (
                    <button
                      key={topping.id}
                      type="button"
                      onClick={() => toggleTopping(topping)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs transition-all ${
                        isSelected
                          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-sm'
                          : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 text-left">
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isSelected ? 'bg-[#CD9C20] border-[#CD9C20] text-white' : 'border-neutral-400'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className="font-medium text-[#1c1c1c]">{topping.name}</span>
                      </div>
                      <span className="font-bold text-[#CD9C20] shrink-0 ml-2">
                        + R$ {topping.price.toFixed(2).replace('.', ',')}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 3. Combo Upgrade */}
          {item.isBurger && (
            <div className="p-4 rounded-xl border-2 border-[#CD9C20]/60 bg-gradient-to-r from-[#FBF9F5] to-[#F2ECDD]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="combo-check"
                    checked={isCombo}
                    onChange={(e) => setIsCombo(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-[#CD9C20] rounded cursor-pointer"
                  />
                  <div>
                    <label htmlFor="combo-check" className="font-ancient font-bold text-[#1c1c1c] text-xs uppercase flex items-center gap-1.5 cursor-pointer">
                      <span>Banquete Completo com Fritas & Néctar</span>
                      <Sparkles className="w-3.5 h-3.5 text-[#CD9C20]" />
                    </label>
                    <p className="text-[11px] text-neutral-700 mt-0.5">
                      Adicione 1 Batata Espartana individual crocante + 1 Bebida em lata gelada.
                    </p>
                  </div>
                </div>
                <span className="font-extrabold text-sm text-[#CD9C20] shrink-0">
                  + R$ {COMBO_UPGRADE_PRICE.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {isCombo && (
                <div className="mt-3 pt-3 border-t border-neutral-300">
                  <label className="block text-[11px] font-ancient font-bold text-neutral-700 uppercase mb-1.5">
                    Escolha a Bebida da Lata:
                  </label>
                  <select
                    value={comboDrink}
                    onChange={(e) => setComboDrink(e.target.value)}
                    className="w-full bg-white border border-[#CD9C20] text-xs rounded-lg p-2.5 text-[#1c1c1c] focus:outline-none focus:ring-1 focus:ring-[#CD9C20]"
                  >
                    {COMBO_DRINKS.map((drink) => (
                      <option key={drink} value={drink}>
                        {drink}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          )}

          {/* 4. Notes */}
          <div>
            <label className="block font-ancient font-bold text-[#1c1c1c] uppercase text-xs tracking-wider mb-1.5">
              Instruções para o Templo (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Pão bem tostado na manteiga, sem cebola, molho à parte..."
              rows={2}
              className="w-full bg-[#F8F6F0] border border-neutral-300 rounded-lg p-2.5 text-xs text-[#1c1c1c] placeholder-neutral-500 focus:outline-none focus:border-[#CD9C20] resize-none"
            />
          </div>
        </div>

        {/* Footer with Quantity & Add to Cart button in Imperial Gold */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#CD9C20]/30 flex items-center justify-between gap-4">
          {/* Quantity Stepper */}
          <div className="flex items-center border border-[#CD9C20]/60 rounded-xl bg-[#F8F6F0] p-1">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
              className="p-1.5 text-neutral-600 hover:text-black disabled:opacity-30 transition-colors"
              aria-label="Diminuir quantidade"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-bold text-sm text-[#1c1c1c] font-mono">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className="p-1.5 text-neutral-600 hover:text-black transition-colors"
              aria-label="Aumentar quantidade"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 gold-gradient-bg hover:brightness-105 active:scale-[0.98] text-[#0B0B0B] font-display font-black text-sm sm:text-base uppercase rounded-xl transition-all shadow-[0_4px_18px_rgba(205,156,32,0.35)] flex items-center justify-between"
          >
            <span>Adicionar ao Banquete</span>
            <span className="font-sans font-black text-sm tracking-tight">
              R$ {finalPrice.toFixed(2).replace('.', ',')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
