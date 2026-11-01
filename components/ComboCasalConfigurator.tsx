'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { MenuItem, MeatDoneness } from '@/types/burger';
import { DrinkOption, DRINK_OPTIONS, COMBO_FRIES_UPGRADES, ComboFriesUpgrade } from '@/lib/data';
import { SweetCasinoRoulette } from '@/components/SweetCasinoRoulette';
import { SpartanHelmetIcon } from '@/components/GreekOrnament';
import { Check, CupSoda, Sparkles } from 'lucide-react';

// Seletor de Hambúrguer para Combo Casal com foto e nome na mesma linha / card (pelo menos 2 na mesma linha)
function ComboBurgerCard({
  burger,
  isSelected,
  onSelect,
  doneness,
  onDonenessChange,
}: {
  burger: MenuItem;
  isSelected: boolean;
  onSelect: () => void;
  doneness: MeatDoneness;
  onDonenessChange: (d: MeatDoneness) => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-2 flex flex-col justify-between transition-all cursor-pointer select-none ${
        isSelected
          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-sm ring-1 ring-[#CD9C20]'
          : 'bg-white border-neutral-300 text-neutral-800 hover:border-[#CD9C20]'
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-lg bg-[#FAF8F3] border border-[#CD9C20]/40 flex items-center justify-center shrink-0 overflow-hidden">
          {!imgError && burger.image ? (
            <Image
              src={burger.image}
              alt={burger.name}
              width={52}
              height={52}
              referrerPolicy="no-referrer"
              className="object-cover w-full h-full"
              onError={() => setImgError(true)}
            />
          ) : (
            <span className="text-xl">🍔</span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h5 className="text-[11px] sm:text-xs font-display font-black uppercase text-[#1c1c1c] truncate">
              {burger.name}
            </h5>
            <div
              className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ml-1 ${
                isSelected ? 'border-[#CD9C20] bg-[#CD9C20] text-white' : 'border-neutral-400'
              }`}
            >
              {isSelected && <Check className="w-2 h-2 stroke-[3]" />}
            </div>
          </div>
          <p className="text-[8.5px] sm:text-[9.5px] text-neutral-600 line-clamp-1 mt-0.5 font-sans leading-tight">
            {burger.cheese || burger.description}
          </p>
        </div>
      </div>

      {/* Ponto da carne do hambúrguer selecionado */}
      {isSelected && (
        <div
          className="mt-2 pt-1.5 border-t border-[#CD9C20]/30"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[8px] font-ancient font-bold uppercase text-[#CD9C20] block mb-1">
            Ponto da Carne:
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['Ao ponto', 'Bem passado', 'Ao ponto para menos (Vermelhinho)'] as MeatDoneness[]).map((d) => {
              const active = doneness === d;
              const short = d === 'Ao ponto para menos (Vermelhinho)' ? 'Ao ponto -' : d;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => onDonenessChange(d)}
                  className={`py-0.5 px-0.5 rounded text-[8px] font-bold text-center border transition-all cursor-pointer ${
                    active
                      ? 'bg-[#CD9C20] text-white border-[#CD9C20] shadow-xs'
                      : 'bg-white/80 text-neutral-700 border-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  {short}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// Item de Refri incluso para Combo Casal com Foto e Nome na mesma linha
function ComboDrinkInlineRow({
  drink,
  isSelected,
  onSelect,
}: {
  drink: DrinkOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl border text-left transition-all cursor-pointer ${
        isSelected
          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-xs ring-1 ring-[#CD9C20]'
          : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
      }`}
    >
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

      <div className="flex items-center gap-1.5 shrink-0 ml-2">
        <span className="text-[9px] sm:text-[10px] font-bold text-emerald-600 uppercase font-ancient bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
          Incluso
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

// Seletor de Batata para Combo Casal: Pequena (+0), Média (+1,50), Grande (+5,00)
function ComboFriesSelector({
  label,
  selected,
  onSelect,
}: {
  label: string;
  selected: ComboFriesUpgrade;
  onSelect: (opt: ComboFriesUpgrade) => void;
}) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-[11px] font-ancient font-bold text-[#1c1c1c] uppercase">
          {label}
        </span>
        <span className="text-[9.5px] text-[#CD9C20] font-black">
          {selected.extraPrice === 0 ? 'Inclusa no Combo (+R$ 0)' : `+R$ ${selected.extraPrice.toFixed(2).replace('.', ',')}`}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-1.5">
        {COMBO_FRIES_UPGRADES.map((opt) => {
          const isSelected = selected.size === opt.size;
          return (
            <button
              key={opt.size}
              type="button"
              onClick={() => onSelect(opt)}
              className={`p-1.5 sm:p-2 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-xs ring-1 ring-[#CD9C20]'
                  : 'bg-white border-neutral-300 text-neutral-700 hover:border-[#CD9C20]'
              }`}
            >
              <div className="text-[10px] sm:text-xs font-black uppercase text-[#1c1c1c]">
                {opt.size === 'P' ? '🍟 Pequena (P)' : opt.size === 'M' ? '🍟 Média (M)' : '🍟 Grande (G)'}
              </div>
              <div className="text-[8.5px] text-neutral-500 font-ancient mt-0.5">
                {opt.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export interface ComboCasalConfiguratorProps {
  availableBurgers: MenuItem[];
  casalBurger1: MenuItem;
  setCasalBurger1: (b: MenuItem) => void;
  casalBurger2: MenuItem;
  setCasalBurger2: (b: MenuItem) => void;
  casalDoneness1: MeatDoneness;
  setCasalDoneness1: (d: MeatDoneness) => void;
  casalDoneness2: MeatDoneness;
  setCasalDoneness2: (d: MeatDoneness) => void;
  casalDrink1: DrinkOption;
  setCasalDrink1: (d: DrinkOption) => void;
  casalDrink2: DrinkOption;
  setCasalDrink2: (d: DrinkOption) => void;
  casalFries1: ComboFriesUpgrade;
  setCasalFries1: (f: ComboFriesUpgrade) => void;
  casalFries2: ComboFriesUpgrade;
  setCasalFries2: (f: ComboFriesUpgrade) => void;
  drawnSweetGift: string;
  setDrawnSweetGift: (gift: string) => void;
  showToast: (msg: string) => void;
}

export function ComboCasalConfigurator({
  availableBurgers,
  casalBurger1,
  setCasalBurger1,
  casalBurger2,
  setCasalBurger2,
  casalDoneness1,
  setCasalDoneness1,
  casalDoneness2,
  setCasalDoneness2,
  casalDrink1,
  setCasalDrink1,
  casalDrink2,
  setCasalDrink2,
  casalFries1,
  setCasalFries1,
  casalFries2,
  setCasalFries2,
  drawnSweetGift,
  setDrawnSweetGift,
  showToast,
}: ComboCasalConfiguratorProps) {
  return (
    <div className="space-y-4">
      {/* 1. Escolha dos 2 Hambúrgueres Obrigatórios (pelo menos 2 na mesma linha) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#FAF8F3] to-[#F5EFE3] border-2 border-[#CD9C20]/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#CD9C20]/30 pb-2">
          <label className="text-xs sm:text-sm font-ancient font-black uppercase text-[#1c1c1c] tracking-wider flex items-center gap-2">
            <SpartanHelmetIcon size={14} color="#CD9C20" />
            <span>1. Escolha os 2 Hambúrgueres do Casal</span>
          </label>
          <span className="text-[9px] bg-[#CD9C20] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            Obrigatório (2x)
          </span>
        </div>

        {/* 1º Hambúrguer */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20]">
              1º Hambúrguer: <strong className="text-[#1c1c1c]">{casalBurger1.name}</strong>
            </span>
            <span className="text-[9px] text-neutral-500 font-ancient">Escolha 1</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableBurgers.map((burger) => (
              <ComboBurgerCard
                key={`b1-${burger.id}`}
                burger={burger}
                isSelected={casalBurger1.id === burger.id}
                onSelect={() => setCasalBurger1(burger)}
                doneness={casalDoneness1}
                onDonenessChange={setCasalDoneness1}
              />
            ))}
          </div>
        </div>

        {/* 2º Hambúrguer */}
        <div className="space-y-1.5 pt-3 border-t border-dashed border-[#CD9C20]/40">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20]">
              2º Hambúrguer: <strong className="text-[#1c1c1c]">{casalBurger2.name}</strong>
            </span>
            <span className="text-[9px] text-neutral-500 font-ancient">Escolha 1</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {availableBurgers.map((burger) => (
              <ComboBurgerCard
                key={`b2-${burger.id}`}
                burger={burger}
                isSelected={casalBurger2.id === burger.id}
                onSelect={() => setCasalBurger2(burger)}
                doneness={casalDoneness2}
                onDonenessChange={setCasalDoneness2}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 2. Escolha dos 2 Refrigerantes Obrigatórios (Foto + Nome na mesma linha) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#CD9C20]/50 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <label className="text-xs sm:text-sm font-ancient font-black uppercase text-[#1c1c1c] tracking-wider flex items-center gap-2">
            <CupSoda className="w-4 h-4 text-[#CD9C20]" />
            <span>2. Escolha os 2 Refrigerantes (Inclusos)</span>
          </label>
          <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            2 Inclusos
          </span>
        </div>

        {/* 1º Refri */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20]">
              1º Refrigerante: <strong className="text-[#1c1c1c]">{casalDrink1.name}</strong>
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {DRINK_OPTIONS.map((drink) => (
              <ComboDrinkInlineRow
                key={`d1-${drink.id}`}
                drink={drink}
                isSelected={casalDrink1.id === drink.id}
                onSelect={() => setCasalDrink1(drink)}
              />
            ))}
          </div>
        </div>

        {/* 2º Refri */}
        <div className="space-y-1.5 pt-3 border-t border-dashed border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20]">
              2º Refrigerante: <strong className="text-[#1c1c1c]">{casalDrink2.name}</strong>
            </span>
          </div>
          <div className="space-y-1.5 max-h-40 overflow-y-auto pr-0.5">
            {DRINK_OPTIONS.map((drink) => (
              <ComboDrinkInlineRow
                key={`d2-${drink.id}`}
                drink={drink}
                isSelected={casalDrink2.id === drink.id}
                onSelect={() => setCasalDrink2(drink)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* 3. Escolha das 2 Batatas Crocantes (P inclusa, P->M +1.50, M->G +3.50 => G +5.00) */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-[#CD9C20]/50 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-neutral-200 pb-2">
          <label className="text-xs sm:text-sm font-ancient font-black uppercase text-[#1c1c1c] tracking-wider flex items-center gap-2">
            <span className="text-sm">🍟</span>
            <span>3. Escolha o Tamanho das 2 Batatas</span>
          </label>
          <span className="text-[9px] bg-[#CD9C20] text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">
            2 Inclusas
          </span>
        </div>

        <ComboFriesSelector
          label="1ª Batata Crocante"
          selected={casalFries1}
          onSelect={(opt) => setCasalFries1(opt)}
        />

        <div className="pt-2 border-t border-dashed border-neutral-200">
          <ComboFriesSelector
            label="2ª Batata Crocante"
            selected={casalFries2}
            onSelect={(opt) => setCasalFries2(opt)}
          />
        </div>
      </div>

      {/* 4. Roleta de Cassino do Doce Grátis (Exclusiva para o Combo Casal) */}
      <div id="sorteio-brinde-area" className="scroll-mt-24">
        <SweetCasinoRoulette
          onClaimPrize={(prize) => {
            setDrawnSweetGift(prize.name);
            showToast(`🎰 Parabéns! Você ganhou: ${prize.name}! Adicione ao pedido.`);
          }}
          initialPrize={drawnSweetGift}
        />
      </div>
    </div>
  );
}
