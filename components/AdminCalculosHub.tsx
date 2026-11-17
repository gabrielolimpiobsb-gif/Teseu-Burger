'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Calculator,
  UtensilsCrossed,
  PackageCheck,
  Building2,
  Flame,
  TrendingUp,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Search,
  Bike,
  ShoppingBag,
  X,
  Calendar as CalendarIcon,
  Layers,
  ArrowRight,
  Minus,
} from 'lucide-react';
import { SpartanHelmetIcon } from '@/components/GreekOrnament';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================
export type BaseUnitType = 'mass' | 'volume' | 'unit';
export type DisplayUnit = 'kg' | 'g' | 'L' | 'ml' | 'un';
export type SalesChannelType = 'SITE' | 'IFOOD';

export const IFOOD_FEE_RATE = 0.262; // Taxa única oficial do iFood: 26,2%
export const IFOOD_CMV_DIVISOR = 0.783; // Fórmula solicitada: CMV ÷ 0,783

export interface UnifiedIngredient {
  id: string;
  name: string;
  category: string;
  baseType: BaseUnitType;
  displayUnit: DisplayUnit;
  stockBase: number; // stored in g, ml, or un
  minBase: number;   // stored in g, ml, or un
  costPerBase: number; // R$ per 1g, 1ml, or 1un
}

export interface RecipeIngredientItem {
  ingredientId: string;
  qty: number;
  unit: DisplayUnit;
}

export interface UnifiedRecipe {
  id: string;
  menuItemId?: string;
  name: string;
  description: string;
  category: string;
  price: number; // Preço no Site (Sem taxa de 26,2%)
  ifoodPrice?: number; // Preço praticado no iFood (Com taxa de 26,2%)
  isAvailable: number;
  items: RecipeIngredientItem[];
}

export interface FixedCostsConfig {
  aluguel: number;
  energia: number;
  salarios: number;
  manutencao: number;
  outros: number;
  faturamento: number;
  percentual: number;
}

export interface KdsQueueTicket {
  id: string;
  orderNumber: string;
  orderName: string;
  orderDescription: string;
  channel: string;
  channelType: SalesChannelType;
  createdAt: number;
  items: Array<{ recipeId: string; qty: number }>;
}

export interface StockDeductionEntry {
  ingredientId: string;
  name: string;
  baseType: BaseUnitType;
  baseDeducted: number;
  displayDeducted: string;
  cost: number;
}

export interface KdsConsumptionLog {
  id: string;
  orderNumber: string;
  orderName: string;
  orderDescription: string;
  channel: string;
  channelType: SalesChannelType; // 'SITE' (0% taxa) | 'IFOOD' (26,2% taxa)
  salesCount: number; // Quantidade de vendas que este registro representa (ex: 1 pedido ou baixa de N vendas no dia)
  dateKey: string; // YYYY-MM-DD
  timestamp: number;
  revenue: number; // Receita Bruta
  ifoodFee: number; // 0 para SITE, 26,2% para IFOOD
  netRevenue: number; // Receita líquida após taxa do iFood (se houver)
  totalCost: number; // CMV total abatido
  netProfit: number; // Lucro Líquido Real (revenue - ifoodFee - totalCost)
  itemsSummary: string;
  deductions: StockDeductionEntry[];
}

export interface UnifiedErpState {
  nextOrderCounter: number;
  fixedCosts: FixedCostsConfig;
  ingredients: UnifiedIngredient[];
  recipes: UnifiedRecipe[];
  kdsQueue: KdsQueueTicket[];
  logs: KdsConsumptionLog[];
}

export type GlobalPeriodFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export const ERP_STORAGE_KEY = 'TESEU_ADMIN_CALCULOS_UNIFIED_V5';
export const ERP_SYNC_EVENT = 'teseu-erp-state-updated';

// ============================================================================
// UNIT CONVERSION HELPERS (g <-> kg, ml <-> L, un)
// ============================================================================
export function getBaseType(unit: DisplayUnit): BaseUnitType {
  if (unit === 'kg' || unit === 'g') return 'mass';
  if (unit === 'L' || unit === 'ml') return 'volume';
  return 'unit';
}

export function toBaseAmount(qty: number, unit: DisplayUnit): number {
  const n = Number(qty) || 0;
  if (unit === 'kg' || unit === 'L') return Math.round(n * 1000 * 100) / 100;
  return Math.round(n * 100) / 100;
}

export function fromBaseAmount(baseQty: number, displayUnit: DisplayUnit): number {
  const n = Number(baseQty) || 0;
  if (displayUnit === 'kg' || displayUnit === 'L') {
    return Math.round((n / 1000) * 1000) / 1000;
  }
  return Math.round(n * 100) / 100;
}

export function getBaseUnitSymbol(baseType: BaseUnitType): DisplayUnit {
  if (baseType === 'mass') return 'g';
  if (baseType === 'volume') return 'ml';
  return 'un';
}

export function formatDualStock(baseQty: number, preferredUnit: DisplayUnit, baseType: BaseUnitType) {
  const baseSymbol = getBaseUnitSymbol(baseType);
  if (preferredUnit === 'kg' || preferredUnit === 'L') {
    const mainVal = (baseQty / 1000).toLocaleString('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    });
    const subVal = Math.round(baseQty).toLocaleString('pt-BR');
    return {
      primary: `${mainVal} ${preferredUnit}`,
      secondary: `${subVal} ${baseSymbol}`,
    };
  }
  const subVal = Math.round(baseQty).toLocaleString('pt-BR');
  if (baseType === 'mass' && baseQty >= 1000) {
    const kgVal = (baseQty / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    return { primary: `${subVal} g`, secondary: `equiv. ${kgVal} kg` };
  }
  if (baseType === 'volume' && baseQty >= 1000) {
    const lVal = (baseQty / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 2 });
    return { primary: `${subVal} ml`, secondary: `equiv. ${lVal} L` };
  }
  return { primary: `${subVal} ${baseSymbol}`, secondary: 'Medida exata' };
}

export function formatBRL(val: number): string {
  return (Number(val) || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

export function getTodayDateKey(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDateKeyOffsetDays(daysAgo: number): string {
  const d = new Date(Date.now() - daysAgo * 24 * 3600 * 1000);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getPeriodLabel(period: GlobalPeriodFilter): string {
  if (period === 'today') return 'Hoje';
  if (period === 'week') return 'Últimos 7 Dias (7d)';
  if (period === 'month') return 'Este Mês (30d)';
  if (period === 'year') return 'Este Ano';
  return 'Todo o Histórico (Tudo)';
}

export function matchesPeriodFilter(
  timestampOrDateStr: number | string | Date | undefined,
  dateKey: string | undefined,
  period: GlobalPeriodFilter
): boolean {
  if (period === 'all') return true;
  const now = new Date();
  const todayStr = getTodayDateKey();

  let targetDate: Date;
  let resolvedDateKey = dateKey;

  if (dateKey && /^\d{4}-\d{2}-\d{2}$/.test(dateKey)) {
    const [y, m, d] = dateKey.split('-').map(Number);
    targetDate = new Date(y, m - 1, d, 12, 0, 0);
  } else if (timestampOrDateStr) {
    targetDate = new Date(timestampOrDateStr);
    resolvedDateKey = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;
  } else {
    targetDate = now;
    resolvedDateKey = todayStr;
  }

  if (period === 'today') {
    return resolvedDateKey === todayStr;
  }

  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0);
  const targetNoon = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 12, 0, 0);
  const diffDays = (todayNoon.getTime() - targetNoon.getTime()) / (24 * 3600 * 1000);

  if (period === 'week') {
    return diffDays >= -1 && diffDays <= 7;
  }
  if (period === 'month') {
    return (
      (targetDate.getMonth() === now.getMonth() && targetDate.getFullYear() === now.getFullYear()) ||
      (diffDays >= -1 && diffDays <= 30)
    );
  }
  if (period === 'year') {
    return targetDate.getFullYear() === now.getFullYear() || (diffDays >= -1 && diffDays <= 365);
  }
  return true;
}

export function detectChannelType(channelStr?: string): SalesChannelType {
  if (!channelStr) return 'SITE';
  const lower = channelStr.toLowerCase();
  if (lower.includes('ifood')) return 'IFOOD';
  return 'SITE';
}

// ============================================================================
// INITIAL SEED DATA
// ============================================================================
export function createInitialErpState(): UnifiedErpState {
  const now = Date.now();
  const hour = 3600 * 1000;
  const todayKey = getTodayDateKey();

  const fixedCosts: FixedCostsConfig = {
    aluguel: 2800,
    energia: 1150,
    salarios: 5400,
    manutencao: 600,
    outros: 850,
    faturamento: 45000,
    percentual: 24.0,
  };

  const ingredients: UnifiedIngredient[] = [
    {
      id: 'ing_carne',
      name: 'Blend Bovino Angus 160g',
      category: 'Carnes & Proteínas',
      baseType: 'unit',
      displayUnit: 'un',
      stockBase: 45,
      minBase: 10,
      costPerBase: 6.08,
    },
    {
      id: 'ing_batata',
      name: 'Batata Palito Especial Pré-Frita',
      category: 'Congelados & Fritos',
      baseType: 'mass',
      displayUnit: 'kg',
      stockBase: 4000, // 4 kg = 4000 g
      minBase: 1000,
      costPerBase: 0.018, // R$ 18,00 / kg
    },
    {
      id: 'ing_pao',
      name: 'Pão Brioche Artesanal Selado',
      category: 'Pães & Massas',
      baseType: 'unit',
      displayUnit: 'un',
      stockBase: 50,
      minBase: 12,
      costPerBase: 1.5,
    },
    {
      id: 'ing_cheddar',
      name: 'Queijo Cheddar Inglês Fatiado',
      category: 'Queijos & Laticínios',
      baseType: 'mass',
      displayUnit: 'kg',
      stockBase: 1800,
      minBase: 400,
      costPerBase: 0.065,
    },
    {
      id: 'ing_provolone',
      name: 'Queijo Provolone Nobre',
      category: 'Queijos & Laticínios',
      baseType: 'mass',
      displayUnit: 'kg',
      stockBase: 1400,
      minBase: 300,
      costPerBase: 0.072,
    },
    {
      id: 'ing_bacon',
      name: 'Bacon Defumado em Tiras',
      category: 'Carnes & Proteínas',
      baseType: 'mass',
      displayUnit: 'kg',
      stockBase: 1600,
      minBase: 400,
      costPerBase: 0.054,
    },
    {
      id: 'ing_crispy',
      name: 'Crispy de Alho-Poró / Cebola Dourada',
      category: 'Hortifruti & Toppings',
      baseType: 'mass',
      displayUnit: 'g',
      stockBase: 850,
      minBase: 200,
      costPerBase: 0.056,
    },
    {
      id: 'ing_tomate',
      name: 'Tomate Italiano Fatiado',
      category: 'Hortifruti & Toppings',
      baseType: 'mass',
      displayUnit: 'g',
      stockBase: 1000,
      minBase: 300,
      costPerBase: 0.009,
    },
    {
      id: 'ing_maionese',
      name: 'Maionese Defumada da Casa',
      category: 'Molhos & Condimentos',
      baseType: 'volume',
      displayUnit: 'L',
      stockBase: 2500,
      minBase: 500,
      costPerBase: 0.018,
    },
    {
      id: 'ing_embalagem',
      name: 'Kit Embalagem Térmica Kraft + Papel Acoplado',
      category: 'Embalagens',
      baseType: 'unit',
      displayUnit: 'un',
      stockBase: 100,
      minBase: 20,
      costPerBase: 1.07,
    },
  ];

  const recipes: UnifiedRecipe[] = [
    {
      id: 'rec_zeus',
      menuItemId: 'zeus',
      name: 'Zeus (Trono do Olimpo)',
      description: 'Pão brioche selado na manteiga, blend bovino 160g, queijo cheddar inglês, bacon defumado e maionese da casa.',
      category: 'legends',
      price: 38.9,
      ifoodPrice: 49.9,
      isAvailable: 1,
      items: [
        { ingredientId: 'ing_pao', qty: 1, unit: 'un' },
        { ingredientId: 'ing_carne', qty: 1, unit: 'un' },
        { ingredientId: 'ing_cheddar', qty: 40, unit: 'g' },
        { ingredientId: 'ing_bacon', qty: 30, unit: 'g' },
        { ingredientId: 'ing_maionese', qty: 30, unit: 'ml' },
        { ingredientId: 'ing_embalagem', qty: 1, unit: 'un' },
      ],
    },
    {
      id: 'rec_atena',
      menuItemId: 'atena',
      name: 'Atena (Deusa da Sabedoria)',
      description: 'Pão brioche, blend bovino 160g, queijo provolone derretido, crispy dourado e maionese artesanal.',
      category: 'legends',
      price: 36.9,
      ifoodPrice: 46.9,
      isAvailable: 1,
      items: [
        { ingredientId: 'ing_pao', qty: 1, unit: 'un' },
        { ingredientId: 'ing_carne', qty: 1, unit: 'un' },
        { ingredientId: 'ing_provolone', qty: 40, unit: 'g' },
        { ingredientId: 'ing_crispy', qty: 20, unit: 'g' },
        { ingredientId: 'ing_maionese', qty: 30, unit: 'ml' },
        { ingredientId: 'ing_embalagem', qty: 1, unit: 'un' },
      ],
    },
    {
      id: 'rec_apolo',
      menuItemId: 'apolo',
      name: 'Apolo Duplo Bacon',
      description: '2 Blends 160g, pão brioche, 40g cheddar inglês, 35g bacon crocante, 10g tomate e maionese.',
      category: 'legends',
      price: 44.9,
      ifoodPrice: 56.9,
      isAvailable: 1,
      items: [
        { ingredientId: 'ing_pao', qty: 1, unit: 'un' },
        { ingredientId: 'ing_carne', qty: 2, unit: 'un' },
        { ingredientId: 'ing_cheddar', qty: 40, unit: 'g' },
        { ingredientId: 'ing_bacon', qty: 35, unit: 'g' },
        { ingredientId: 'ing_tomate', qty: 10, unit: 'g' },
        { ingredientId: 'ing_maionese', qty: 25, unit: 'ml' },
        { ingredientId: 'ing_embalagem', qty: 1, unit: 'un' },
      ],
    },
    {
      id: 'rec_combo_teseu',
      menuItemId: 'combo-teseu',
      name: 'Combo Clássico Teseu + Batata (250g)',
      description: '1 Blend 160g, pão brioche, 30g cheddar, 10g tomate + Porção de 250g de batata palito.',
      category: 'combos',
      price: 46.9,
      ifoodPrice: 59.9,
      isAvailable: 1,
      items: [
        { ingredientId: 'ing_pao', qty: 1, unit: 'un' },
        { ingredientId: 'ing_carne', qty: 1, unit: 'un' },
        { ingredientId: 'ing_batata', qty: 250, unit: 'g' },
        { ingredientId: 'ing_tomate', qty: 10, unit: 'g' },
        { ingredientId: 'ing_cheddar', qty: 30, unit: 'g' },
        { ingredientId: 'ing_maionese', qty: 25, unit: 'ml' },
        { ingredientId: 'ing_embalagem', qty: 1, unit: 'un' },
      ],
    },
    {
      id: 'rec_batata_olimpica',
      menuItemId: 'batata-olimpica',
      name: 'Porção Batata Olímpica (250g)',
      description: '250g de batata palito super crocante acompanhada de 30ml de maionese defumada Teseu.',
      category: 'sides',
      price: 19.9,
      ifoodPrice: 25.9,
      isAvailable: 1,
      items: [
        { ingredientId: 'ing_batata', qty: 250, unit: 'g' },
        { ingredientId: 'ing_maionese', qty: 30, unit: 'ml' },
        { ingredientId: 'ing_embalagem', qty: 1, unit: 'un' },
      ],
    },
  ];

  const kdsQueue: KdsQueueTicket[] = [
    {
      id: 'kds_101',
      orderNumber: '#1039',
      orderName: 'Pedido #1039 — Aquiles (Site)',
      orderDescription: 'Ponto da carne: Ao ponto. Enviar maionese extra bem embalada.',
      channel: 'Site (Sem Taxa)',
      channelType: 'SITE',
      createdAt: now - 7 * 60 * 1000,
      items: [{ recipeId: 'rec_combo_teseu', qty: 1 }],
    },
    {
      id: 'kds_102',
      orderNumber: '#1040',
      orderName: 'Pedido #1040 — Helena (iFood)',
      orderDescription: 'Sem cebola no Atena, batata bem dourada.',
      channel: 'iFood (Taxa 26,2%)',
      channelType: 'IFOOD',
      createdAt: now - 3 * 60 * 1000,
      items: [
        { recipeId: 'rec_atena', qty: 1 },
        { recipeId: 'rec_batata_olimpica', qty: 1 },
      ],
    },
  ];

  const siteRev = 46.9;
  const siteCost = 15.17;

  const ifoodRev = 97.7;
  const ifoodFee = Math.round(ifoodRev * IFOOD_FEE_RATE * 100) / 100; // 25.60
  const ifoodCost = 33.76;

  // Multi-period historical seed data (Hoje, 7d, Mês, Tudo) so the period filter buttons work out-of-the-box
  const dayMs = 24 * hour;
  const weekDateKey = getDateKeyOffsetDays(3); // 3 days ago (included in 7d, Mês, Tudo)
  const monthDateKey = getDateKeyOffsetDays(12); // 12 days ago (included in Mês, Tudo)
  const allHistoryDateKey = getDateKeyOffsetDays(45); // 45 days ago (included in Tudo)

  const logs: KdsConsumptionLog[] = [
    // 1. HOJE (Today)
    {
      id: 'log_101',
      orderNumber: '#1038',
      orderName: 'Pedido #1038 — Ulisses (Site Hoje)',
      orderDescription: 'Compra direta pelo Site (0% taxa iFood)',
      channel: 'Site (Sem Taxa)',
      channelType: 'SITE',
      salesCount: 1,
      dateKey: todayKey,
      timestamp: now - 2 * hour,
      revenue: siteRev,
      ifoodFee: 0,
      netRevenue: siteRev,
      totalCost: siteCost,
      netProfit: Math.round((siteRev - siteCost) * 100) / 100,
      itemsSummary: '1x Combo Clássico Teseu + Batata (250g)',
      deductions: [
        { ingredientId: 'ing_carne', name: 'Blend Bovino Angus 160g', baseType: 'unit', baseDeducted: 1, displayDeducted: '1 un', cost: 6.08 },
        { ingredientId: 'ing_batata', name: 'Batata Palito Especial Pré-Frita', baseType: 'mass', baseDeducted: 250, displayDeducted: '250 g', cost: 4.5 },
        { ingredientId: 'ing_pao', name: 'Pão Brioche Artesanal Selado', baseType: 'unit', baseDeducted: 1, displayDeducted: '1 un', cost: 1.5 },
        { ingredientId: 'ing_cheddar', name: 'Queijo Cheddar Inglês Fatiado', baseType: 'mass', baseDeducted: 30, displayDeducted: '30 g', cost: 1.95 },
        { ingredientId: 'ing_embalagem', name: 'Kit Embalagem Térmica Kraft + Papel Acoplado', baseType: 'unit', baseDeducted: 1, displayDeducted: '1 un', cost: 1.07 },
      ],
    },
    {
      id: 'log_102',
      orderNumber: '#IFOOD-HOJE',
      orderName: 'Baixa iFood Hoje — 2 Vendas (Zeus + Batata)',
      orderDescription: 'Vendas realizadas hoje via iFood com desconto de 26,2%',
      channel: 'iFood (Taxa 26,2%)',
      channelType: 'IFOOD',
      salesCount: 2,
      dateKey: todayKey,
      timestamp: now - 1 * hour,
      revenue: ifoodRev,
      ifoodFee: ifoodFee,
      netRevenue: Math.round((ifoodRev - ifoodFee) * 100) / 100,
      totalCost: ifoodCost,
      netProfit: Math.round((ifoodRev - ifoodFee - ifoodCost) * 100) / 100,
      itemsSummary: '2x Zeus (Trono do Olimpo), 1x Porção Batata Olímpica (250g)',
      deductions: [
        { ingredientId: 'ing_carne', name: 'Blend Bovino Angus 160g', baseType: 'unit', baseDeducted: 2, displayDeducted: '2 un', cost: 12.16 },
        { ingredientId: 'ing_batata', name: 'Batata Palito Especial Pré-Frita', baseType: 'mass', baseDeducted: 250, displayDeducted: '250 g', cost: 4.5 },
        { ingredientId: 'ing_pao', name: 'Pão Brioche Artesanal Selado', baseType: 'unit', baseDeducted: 2, displayDeducted: '2 un', cost: 3.0 },
        { ingredientId: 'ing_cheddar', name: 'Queijo Cheddar Inglês Fatiado', baseType: 'mass', baseDeducted: 80, displayDeducted: '80 g', cost: 5.2 },
      ],
    },
    // 2. ÚLTIMOS 7 DIAS (3 days ago)
    {
      id: 'log_103',
      orderNumber: '#SITE-7D',
      orderName: 'Fechamento Site (3 dias atrás) — 4 Vendas',
      orderDescription: 'Vendas diretas pelo Site sem taxa do iFood (0%)',
      channel: 'Site (Sem Taxa)',
      channelType: 'SITE',
      salesCount: 4,
      dateKey: weekDateKey,
      timestamp: now - 3 * dayMs,
      revenue: 169.6,
      ifoodFee: 0,
      netRevenue: 169.6,
      totalCost: 56.4,
      netProfit: 113.2,
      itemsSummary: '2x Zeus (Trono do Olimpo), 2x Apolo Duplo Bacon',
      deductions: [],
    },
    {
      id: 'log_104',
      orderNumber: '#IFOOD-7D',
      orderName: 'Baixa Diária iFood (3 dias atrás) — 5 Vendas',
      orderDescription: 'Fechamento de 5 vendas no iFood com desconto de 26,2%',
      channel: 'iFood (Taxa 26,2%)',
      channelType: 'IFOOD',
      salesCount: 5,
      dateKey: weekDateKey,
      timestamp: now - 3 * dayMs - hour,
      revenue: 234.5,
      ifoodFee: 61.44,
      netRevenue: 173.06,
      totalCost: 75.85,
      netProfit: 97.21,
      itemsSummary: '5x Combo Clássico Teseu + Batata (250g)',
      deductions: [],
    },
    // 3. ESTE MÊS (12 days ago)
    {
      id: 'log_105',
      orderNumber: '#SITE-MES',
      orderName: 'Fechamento Site (Este Mês) — 8 Vendas',
      orderDescription: 'Compras pelo Site sem taxa de aplicativo (0%)',
      channel: 'Site (Sem Taxa)',
      channelType: 'SITE',
      salesCount: 8,
      dateKey: monthDateKey,
      timestamp: now - 12 * dayMs,
      revenue: 342.2,
      ifoodFee: 0,
      netRevenue: 342.2,
      totalCost: 114.1,
      netProfit: 228.1,
      itemsSummary: '4x Combo Clássico Teseu, 4x Zeus (Trono do Olimpo)',
      deductions: [],
    },
    {
      id: 'log_106',
      orderNumber: '#IFOOD-MES',
      orderName: 'Baixa iFood (Este Mês) — 10 Vendas',
      orderDescription: 'Fechamento de 10 vendas iFood com taxa de 26,2%',
      channel: 'iFood (Taxa 26,2%)',
      channelType: 'IFOOD',
      salesCount: 10,
      dateKey: monthDateKey,
      timestamp: now - 12 * dayMs - hour,
      revenue: 469.0,
      ifoodFee: 122.88,
      netRevenue: 346.12,
      totalCost: 151.7,
      netProfit: 194.42,
      itemsSummary: '6x Combo Clássico Teseu, 4x Atena (Deusa da Sabedoria)',
      deductions: [],
    },
    // 4. HISTÓRICO COMPLETO / TUDO (45 days ago)
    {
      id: 'log_107',
      orderNumber: '#SITE-HIST',
      orderName: 'Acumulado Anterior Site — 15 Vendas',
      orderDescription: 'Vendas anteriores pelo Site (0% taxa)',
      channel: 'Site (Sem Taxa)',
      channelType: 'SITE',
      salesCount: 15,
      dateKey: allHistoryDateKey,
      timestamp: now - 45 * dayMs,
      revenue: 643.5,
      ifoodFee: 0,
      netRevenue: 643.5,
      totalCost: 212.0,
      netProfit: 431.5,
      itemsSummary: '15x Lanches e Combos pelo Site',
      deductions: [],
    },
    {
      id: 'log_108',
      orderNumber: '#IFOOD-HIST',
      orderName: 'Acumulado Anterior iFood — 18 Vendas',
      orderDescription: 'Vendas anteriores iFood com taxa de 26,2%',
      channel: 'iFood (Taxa 26,2%)',
      channelType: 'IFOOD',
      salesCount: 18,
      dateKey: allHistoryDateKey,
      timestamp: now - 45 * dayMs - hour,
      revenue: 844.2,
      ifoodFee: 221.18,
      netRevenue: 623.02,
      totalCost: 273.06,
      netProfit: 349.96,
      itemsSummary: '18x Lanches e Combos via iFood',
      deductions: [],
    },
  ];

  return {
    nextOrderCounter: 1041,
    fixedCosts,
    ingredients,
    recipes,
    kdsQueue,
    logs,
  };
}

export function loadErpStateFromStorage(): UnifiedErpState {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(ERP_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.ingredients && parsed.recipes && Array.isArray(parsed.logs)) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
  }
  return createInitialErpState();
}

export function persistErpStateToStorage(next: UnifiedErpState) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(ERP_STORAGE_KEY, JSON.stringify(next));
      window.dispatchEvent(new CustomEvent(ERP_SYNC_EVENT));
    } catch {
      // ignore
    }
  }
}

// ============================================================================
// REUSABLE WIDGET: BAIXA DIÁRIA DE VENDAS DO IFOOD (E SITE)
// Can be embedded directly in AdminDashboard ('dashboard' tab) AND in AdminCalculosHub
// ============================================================================
export function IfoodDailyBatchWidget({
  erpState,
  onSaveErpState,
  onNotify,
  compact = false,
  activePeriodFilter = 'today',
}: {
  erpState: UnifiedErpState;
  onSaveErpState: (next: UnifiedErpState) => void;
  onNotify?: (msg: string) => void;
  compact?: boolean;
  activePeriodFilter?: GlobalPeriodFilter;
}) {
  const [batchDate, setBatchDate] = useState<string>(() => getTodayDateKey());
  const [batchChannel, setBatchChannel] = useState<SalesChannelType>('IFOOD');
  const [batchSalesCountInput, setBatchSalesCountInput] = useState<string>('');
  const [batchNotes, setBatchNotes] = useState<string>('');
  // Map of recipeId -> quantity sold in the day
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({
    rec_zeus: 2,
    rec_combo_teseu: 1,
  });
  // Optional override for total revenue if user wants to type exact R$ sold on iFood
  const [customRevenueOverride, setCustomRevenueOverride] = useState<string>('');

  const calcRecipeCMV = useCallback(
    (recipe: UnifiedRecipe): number => {
      let total = 0;
      recipe.items.forEach((item) => {
        const ing = erpState.ingredients.find((i) => i.id === item.ingredientId);
        if (ing) {
          const baseNeed = toBaseAmount(item.qty, item.unit);
          total += baseNeed * ing.costPerBase;
        }
      });
      return Math.round(total * 100) / 100;
    },
    [erpState.ingredients]
  );

  const selectedItemsArray = useMemo(() => {
    return Object.entries(itemQuantities)
      .filter(([, qty]) => qty > 0)
      .map(([recipeId, qty]) => {
        const recipe = erpState.recipes.find((r) => r.id === recipeId);
        return recipe ? { recipe, qty } : null;
      })
      .filter(Boolean) as Array<{ recipe: UnifiedRecipe; qty: number }>;
  }, [itemQuantities, erpState.recipes]);

  const totalUnitsSelected = useMemo(
    () => selectedItemsArray.reduce((acc, entry) => acc + entry.qty, 0),
    [selectedItemsArray]
  );

  // Effective number of sales/orders in the batch
  const effectiveSalesCount = useMemo(() => {
    const parsed = parseInt(batchSalesCountInput, 10);
    if (!isNaN(parsed) && parsed > 0) return parsed;
    return Math.max(1, totalUnitsSelected);
  }, [batchSalesCountInput, totalUnitsSelected]);

  // Calculate automatic revenue, CMV, iFood 26.2% fee, and net profit
  const batchCalculation = useMemo(() => {
    let autoRevenue = 0;
    let totalCmv = 0;

    selectedItemsArray.forEach(({ recipe, qty }) => {
      // No Site usa o preço normal; no iFood usa o preço do cardápio (ou personalizado)
      autoRevenue += recipe.price * qty;
      totalCmv += calcRecipeCMV(recipe) * qty;
    });

    const overrideNum = parseFloat(customRevenueOverride.replace(',', '.'));
    const grossRevenue = !isNaN(overrideNum) && overrideNum > 0 ? overrideNum : autoRevenue;

    // Regra estrita: Site = 0% de taxa | iFood = 26,2% de taxa
    const ifoodFee = batchChannel === 'IFOOD' ? Math.round(grossRevenue * IFOOD_FEE_RATE * 100) / 100 : 0;
    const netRevenue = Math.round((grossRevenue - ifoodFee) * 100) / 100;
    const netProfit = Math.round((grossRevenue - ifoodFee - totalCmv) * 100) / 100;

    return {
      grossRevenue: Math.round(grossRevenue * 100) / 100,
      ifoodFee,
      netRevenue,
      totalCmv: Math.round(totalCmv * 100) / 100,
      netProfit,
    };
  }, [selectedItemsArray, customRevenueOverride, batchChannel, calcRecipeCMV]);

  const handleQtyChange = (recipeId: string, delta: number) => {
    setItemQuantities((prev) => {
      const curr = prev[recipeId] || 0;
      const next = Math.max(0, curr + delta);
      return { ...prev, [recipeId]: next };
    });
  };

  const handleDirectQtyInput = (recipeId: string, valStr: string) => {
    const num = Math.max(0, parseInt(valStr, 10) || 0);
    setItemQuantities((prev) => ({ ...prev, [recipeId]: num }));
  };

  const handleExecuteDailyBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedItemsArray.length === 0 && batchCalculation.grossRevenue <= 0) {
      onNotify?.('Selecione pelo menos 1 produto vendido ou informe o faturamento para dar baixa.');
      return;
    }

    // Aggregate ingredient deductions
    const ingDeductionMap: Record<string, { ing: UnifiedIngredient; baseNeeded: number }> = {};
    selectedItemsArray.forEach(({ recipe, qty }) => {
      recipe.items.forEach((ri) => {
        const ing = erpState.ingredients.find((i) => i.id === ri.ingredientId);
        if (!ing) return;
        const needed = toBaseAmount(ri.qty, ri.unit) * qty;
        if (!ingDeductionMap[ing.id]) {
          ingDeductionMap[ing.id] = { ing, baseNeeded: 0 };
        }
        ingDeductionMap[ing.id].baseNeeded += needed;
      });
    });

    const deductions: StockDeductionEntry[] = [];
    const nextIngredients = erpState.ingredients.map((ing) => {
      const found = ingDeductionMap[ing.id];
      if (!found) return ing;
      const baseSym = getBaseUnitSymbol(ing.baseType);
      const cost = found.baseNeeded * ing.costPerBase;
      deductions.push({
        ingredientId: ing.id,
        name: ing.name,
        baseType: ing.baseType,
        baseDeducted: found.baseNeeded,
        displayDeducted: `${found.baseNeeded.toLocaleString('pt-BR')} ${baseSym}`,
        cost: Math.round(cost * 100) / 100,
      });
      return {
        ...ing,
        stockBase: Math.max(0, Math.round((ing.stockBase - found.baseNeeded) * 100) / 100),
      };
    });

    const summaryText =
      selectedItemsArray.length > 0
        ? selectedItemsArray.map(({ recipe, qty }) => `${qty}x ${recipe.name}`).join(', ')
        : `${effectiveSalesCount} venda(s) avulsa(s)`;

    const isIfood = batchChannel === 'IFOOD';
    const newLog: KdsConsumptionLog = {
      id: `log_${Date.now()}`,
      orderNumber: isIfood ? `#IFOOD-${erpState.nextOrderCounter}` : `#SITE-${erpState.nextOrderCounter}`,
      orderName:
        batchNotes.trim() ||
        (isIfood
          ? `Baixa Diária iFood (${effectiveSalesCount} ${effectiveSalesCount === 1 ? 'venda' : 'vendas'})`
          : `Baixa Vendas Site (${effectiveSalesCount} ${effectiveSalesCount === 1 ? 'venda' : 'vendas'})`),
      orderDescription: isIfood
        ? `Fechamento de ${effectiveSalesCount} venda(s) no iFood • Taxa 26,2% descontada (${formatBRL(batchCalculation.ifoodFee)})`
        : `Fechamento de ${effectiveSalesCount} venda(s) pelo Site • Sem taxa iFood (0%)`,
      channel: isIfood ? 'iFood (Taxa 26,2%)' : 'Site (Sem Taxa)',
      channelType: batchChannel,
      salesCount: effectiveSalesCount,
      dateKey: batchDate || getTodayDateKey(),
      timestamp: Date.now(),
      revenue: batchCalculation.grossRevenue,
      ifoodFee: batchCalculation.ifoodFee,
      netRevenue: batchCalculation.netRevenue,
      totalCost: batchCalculation.totalCmv,
      netProfit: batchCalculation.netProfit,
      itemsSummary: summaryText,
      deductions,
    };

    const nextState: UnifiedErpState = {
      ...erpState,
      nextOrderCounter: erpState.nextOrderCounter + 1,
      ingredients: nextIngredients,
      logs: [newLog, ...erpState.logs],
    };

    onSaveErpState(nextState);
    setBatchNotes('');
    setCustomRevenueOverride('');
    onNotify?.(
      isIfood
        ? `Baixa de ${effectiveSalesCount} venda(s) do iFood concluída! Taxa 26,2%: -${formatBRL(batchCalculation.ifoodFee)} | Lucro Real: ${formatBRL(batchCalculation.netProfit)} adicionado ao Dashboard.`
        : `Baixa de ${effectiveSalesCount} venda(s) do Site (Sem taxa) concluída! Lucro Real: ${formatBRL(batchCalculation.netProfit)} adicionado ao Dashboard.`
    );
  };

  const handleRemoveLog = (logId: string) => {
    const nextLogs = erpState.logs.filter((l) => l.id !== logId);
    onSaveErpState({ ...erpState, logs: nextLogs });
    onNotify?.('Registro removido e cálculos do Dashboard atualizados.');
  };

  // Logs filtered by the active top-header periodFilter (Hoje, 7d, Mês, Tudo)
  const logsForSelectedDate = useMemo(
    () =>
      erpState.logs.filter((l) =>
        matchesPeriodFilter(l.timestamp, l.dateKey, activePeriodFilter)
      ),
    [erpState.logs, activePeriodFilter]
  );

  return (
    <div className="bg-white border-2 border-[#CD9C20]/50 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]/50 text-[10px] font-black uppercase tracking-widest">
              FECHAMENTO &amp; BAIXA AUTOMÁTICA DE VENDAS
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
              Site: 0% Taxa • iFood: 26,2% Taxa (CMV ÷ 0,783)
            </span>
          </div>
          <h3 className="font-extrabold text-base sm:text-lg text-[#161616] font-display uppercase mt-1 flex items-center gap-2">
            <Bike className="w-5 h-5 text-[#CD9C20]" />
            <span>Dar Baixa de Quantas Vendas Fiz no iFood no Dia (ou no Site)</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Informe quantas vendas de cada lanche você fez no <strong>iFood</strong> (com desconto automático de <strong>26,2%</strong>) ou no <strong>Site</strong> (sem taxa). Ao confirmar, o estoque é abatido e os <strong>cálculos gerais do Dashboard</strong> são atualizados na hora.
          </p>
        </div>

        {/* Channel Switcher: iFood (26,2%) vs Site (0% Taxa) */}
        <div className="flex items-center gap-1.5 bg-[#F8F6F0] p-1.5 rounded-xl border border-[#CD9C20]/40 shrink-0">
          <button
            type="button"
            onClick={() => setBatchChannel('IFOOD')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              batchChannel === 'IFOOD'
                ? 'bg-[#161616] text-[#F5CB5C] border border-[#CD9C20] shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <Bike className="w-3.5 h-3.5 text-[#CD9C20]" />
            <span>Vendas iFood (Taxa 26,2%)</span>
          </button>
          <button
            type="button"
            onClick={() => setBatchChannel('SITE')}
            className={`px-3.5 py-2 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
              batchChannel === 'SITE'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-black'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Vendas Site (Sem Taxa 0%)</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleExecuteDailyBatch} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Select Quantities of Products Sold on That Day */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-extrabold uppercase text-slate-800 font-display">
              1. Quantidade Vendida por Produto no Dia ({batchChannel === 'IFOOD' ? 'iFood' : 'Site'}):
            </label>
            <button
              type="button"
              onClick={() => setItemQuantities({})}
              className="text-[11px] font-bold text-slate-500 hover:text-slate-900 underline cursor-pointer"
            >
              Zerar quantidades
            </button>
          </div>

          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-2.5 ${compact ? 'max-h-64' : 'max-h-80'} overflow-y-auto pr-1`}>
            {erpState.recipes.map((rec) => {
              const qty = itemQuantities[rec.id] || 0;
              const cmv = calcRecipeCMV(rec);
              return (
                <div
                  key={rec.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    qty > 0
                      ? 'bg-[#F8F6F0] border-[#CD9C20] shadow-2xs'
                      : 'bg-white border-slate-200 hover:border-[#CD9C20]/40'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="font-bold text-xs text-slate-900 truncate">{rec.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">
                      Venda: {formatBRL(rec.price)} • CMV: {formatBRL(cmv)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleQtyChange(rec.id, -1)}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-300 hover:border-[#CD9C20] flex items-center justify-center text-slate-700 font-bold cursor-pointer"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={qty}
                      onChange={(e) => handleDirectQtyInput(rec.id, e.target.value)}
                      className="w-11 h-7 text-center rounded-lg bg-white border border-slate-300 font-extrabold text-xs text-slate-900 font-mono outline-none focus:border-[#CD9C20]"
                    />
                    <button
                      type="button"
                      onClick={() => handleQtyChange(rec.id, 1)}
                      className="w-7 h-7 rounded-lg bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]/50 flex items-center justify-center font-bold cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Date, Sales Count, Financial Summary & Confirm Button */}
        <div className="lg:col-span-5 bg-[#F8F6F0] rounded-2xl p-4 sm:p-5 border border-[#CD9C20]/40 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Data das Vendas</label>
                <div className="relative">
                  <input
                    type="date"
                    value={batchDate}
                    onChange={(e) => setBatchDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 outline-none focus:border-[#CD9C20]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Qtd. de Vendas / Pedidos
                </label>
                <input
                  type="number"
                  min={1}
                  placeholder={`Auto (${effectiveSalesCount})`}
                  value={batchSalesCountInput}
                  onChange={(e) => setBatchSalesCountInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-extrabold text-slate-900 font-mono outline-none focus:border-[#CD9C20]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Faturamento Bruto R$ (Opcional)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={`Auto: ${batchCalculation.grossRevenue.toFixed(2)}`}
                  value={customRevenueOverride}
                  onChange={(e) => setCustomRevenueOverride(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold text-slate-900 font-mono outline-none focus:border-[#CD9C20]"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Identificação / Observação
                </label>
                <input
                  type="text"
                  placeholder={batchChannel === 'IFOOD' ? 'Ex: Turno Noite iFood' : 'Ex: Vendas WhatsApp/Site'}
                  value={batchNotes}
                  onChange={(e) => setBatchNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 outline-none focus:border-[#CD9C20]"
                />
              </div>
            </div>

            {/* Live Financial Breakdown Box */}
            <div className="bg-white rounded-xl p-3.5 border border-[#CD9C20]/30 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Canal Selecionado:</span>
                <strong className="text-slate-900 uppercase">
                  {batchChannel === 'IFOOD' ? 'iFood (Com Taxa 26,2%)' : 'Site Próprio (Sem Taxa 0%)'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-700">
                <span>Faturamento Bruto ({effectiveSalesCount} vendas):</span>
                <strong className="font-mono text-slate-900">{formatBRL(batchCalculation.grossRevenue)}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">
                  {batchChannel === 'IFOOD' ? 'Taxa iFood (26,2%):' : 'Taxa iFood (Isento no Site):'}
                </span>
                <strong className={`font-mono ${batchChannel === 'IFOOD' ? 'text-amber-700' : 'text-emerald-700'}`}>
                  {batchChannel === 'IFOOD' ? `- ${formatBRL(batchCalculation.ifoodFee)}` : 'R$ 0,00 (0%)'}
                </strong>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Custo de Insumos (CMV Abatido):</span>
                <strong className="font-mono text-slate-800">- {formatBRL(batchCalculation.totalCmv)}</strong>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <span className="font-extrabold text-slate-900 uppercase">Lucro Líquido Real:</span>
                <strong className="text-base font-black text-emerald-700 font-mono">
                  {formatBRL(batchCalculation.netProfit)}
                </strong>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 px-4 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-[#CD9C20]" />
            <span>
              Dar Baixa em {effectiveSalesCount} {effectiveSalesCount === 1 ? 'Venda' : 'Vendas'} do{' '}
              {batchChannel === 'IFOOD' ? 'iFood (26,2%)' : 'Site (0% Taxa)'} &amp; Atualizar Dashboard
            </span>
          </button>
        </div>
      </form>

      {/* History of Logged Batches for the Active Period Filter (Hoje, 7d, Mês, Tudo) */}
      {logsForSelectedDate.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase text-slate-500">
              Baixas Registradas no Período ({getPeriodLabel(activePeriodFilter)}):
            </span>
            <span className="text-[11px] text-slate-500">
              Total no período:{' '}
              <strong className="text-slate-900">
                {logsForSelectedDate.reduce((acc, l) => acc + (l.salesCount || 1), 0)} vendas
              </strong>
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto">
            {logsForSelectedDate.map((log) => {
              const isIfood = log.channelType === 'IFOOD' || detectChannelType(log.channel) === 'IFOOD';
              return (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-[#F8F6F0] border border-slate-200 flex items-center justify-between gap-2 text-xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          isIfood
                            ? 'bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]/40'
                            : 'bg-emerald-700 text-white'
                        }`}
                      >
                        {isIfood ? 'iFood (26,2%)' : 'Site (0% Taxa)'}
                      </span>
                      <strong className="text-slate-900 truncate">{log.orderName}</strong>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{log.itemsSummary}</p>
                    <p className="text-[11px] font-mono text-slate-700 mt-0.5">
                      Bruto: {formatBRL(log.revenue)}{' '}
                      {isIfood && `• Taxa 26,2%: -${formatBRL(log.ifoodFee || log.revenue * IFOOD_FEE_RATE)}`}{' '}
                      • CMV: -{formatBRL(log.totalCost)} •{' '}
                      <strong className="text-emerald-700">
                        Lucro: {formatBRL(log.netProfit ?? log.revenue - (log.ifoodFee || 0) - log.totalCost)}
                      </strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveLog(log.id)}
                    className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-800 shrink-0 cursor-pointer"
                    title="Remover lançamento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT: ADMIN CALCULOS HUB (/admin-calculos)
// ============================================================================
type CalculosTab =
  | 'baixa_ifood_site'
  | 'cardapio_fichas'
  | 'precificacao_ifood'
  | 'estoque_insumos'
  | 'kds_cozinha'
  | 'relatorios';
type ReportPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY';

export function AdminCalculosHub({
  periodFilter = 'today',
  onPeriodFilterChange,
}: {
  periodFilter?: GlobalPeriodFilter;
  onPeriodFilterChange?: (next: GlobalPeriodFilter) => void;
} = {}) {
  const [activeTab, setActiveTab] = useState<CalculosTab>('baixa_ifood_site');
  const [erpState, setErpState] = useState<UnifiedErpState>(() => loadErpStateFromStorage());

  const [toast, setToast] = useState<string | null>(null);
  const notify = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }, []);

  const saveErpState = useCallback((next: UnifiedErpState) => {
    setErpState(next);
    persistErpStateToStorage(next);
  }, []);

  // Listen to external updates (e.g. if user logs iFood sales from the main Dashboard tab)
  useEffect(() => {
    const handleSync = () => {
      setErpState(loadErpStateFromStorage());
    };
    window.addEventListener(ERP_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(ERP_SYNC_EVENT, handleSync);
  }, []);

  // Sync extra menu items from /api/admin/menu so user can edit any store item here too
  useEffect(() => {
    async function syncStoreMenu() {
      try {
        const res = await fetch('/api/admin/menu');
        if (!res.ok) return;
        const data = await res.json();
        if (!data.items || !Array.isArray(data.items)) return;

        setErpState((prev) => {
          const existingIds = new Set(prev.recipes.map((r) => r.menuItemId || r.id));
          const additions: UnifiedRecipe[] = [];

          data.items.forEach((mItem: any) => {
            if (!existingIds.has(mItem.id)) {
              additions.push({
                id: `rec_${mItem.id}`,
                menuItemId: mItem.id,
                name: mItem.name,
                description: mItem.description || '',
                category: mItem.category || 'legends',
                price: Number(mItem.price) || 34.9,
                isAvailable: mItem.isAvailable !== undefined ? mItem.isAvailable : 1,
                items: [
                  { ingredientId: 'ing_pao', qty: 1, unit: 'un' },
                  { ingredientId: 'ing_carne', qty: 1, unit: 'un' },
                  { ingredientId: 'ing_cheddar', qty: 30, unit: 'g' },
                  { ingredientId: 'ing_maionese', qty: 25, unit: 'ml' },
                  { ingredientId: 'ing_embalagem', qty: 1, unit: 'un' },
                ],
              });
            }
          });

          if (additions.length === 0) return prev;
          const updated = { ...prev, recipes: [...prev.recipes, ...additions] };
          persistErpStateToStorage(updated);
          return updated;
        });
      } catch {
        // ignore
      }
    }
    syncStoreMenu();
  }, []);

  // Calculate CMV of a recipe from current ingredient costs
  const calcRecipeCMV = useCallback(
    (recipe: UnifiedRecipe): number => {
      let total = 0;
      recipe.items.forEach((item) => {
        const ing = erpState.ingredients.find((i) => i.id === item.ingredientId);
        if (ing) {
          const baseNeed = toBaseAmount(item.qty, item.unit);
          total += baseNeed * ing.costPerBase;
        }
      });
      return Math.round(total * 100) / 100;
    },
    [erpState.ingredients]
  );

  // ============================================================================
  // STATE FOR TAB: CARDÁPIO & FICHAS TÉCNICAS
  // ============================================================================
  const [recipeSearch, setRecipeSearch] = useState('');
  const [recipeCatFilter, setRecipeCatFilter] = useState('all');
  const [editingRecipe, setEditingRecipe] = useState<UnifiedRecipe | null>(null);
  const [recFormName, setRecFormName] = useState('');
  const [recFormDesc, setRecFormDesc] = useState('');
  const [recFormCategory, setRecFormCategory] = useState('legends');
  const [recFormPrice, setRecFormPrice] = useState('38.90');
  const [recFormItems, setRecFormItems] = useState<RecipeIngredientItem[]>([]);
  const [draftIngId, setDraftIngId] = useState('ing_carne');
  const [draftIngQty, setDraftIngQty] = useState('1');
  const [draftIngUnit, setDraftIngUnit] = useState<DisplayUnit>('un');

  const openNewRecipeModal = () => {
    const empty: UnifiedRecipe = {
      id: '',
      name: '',
      description: '',
      category: 'legends',
      price: 36.9,
      isAvailable: 1,
      items: [],
    };
    setEditingRecipe(empty);
    setRecFormName('');
    setRecFormDesc('');
    setRecFormCategory('legends');
    setRecFormPrice('36.90');
    setRecFormItems([
      { ingredientId: 'ing_pao', qty: 1, unit: 'un' },
      { ingredientId: 'ing_carne', qty: 1, unit: 'un' },
    ]);
  };

  const openEditRecipeModal = (rec: UnifiedRecipe) => {
    setEditingRecipe(rec);
    setRecFormName(rec.name);
    setRecFormDesc(rec.description || '');
    setRecFormCategory(rec.category || 'legends');
    setRecFormPrice(rec.price.toFixed(2));
    setRecFormItems([...rec.items]);
  };

  const handleSaveRecipeModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recFormName.trim()) {
      notify('Informe o nome do produto / pedido.');
      return;
    }
    const priceNum = parseFloat(recFormPrice.replace(',', '.')) || 0;
    const newRec: UnifiedRecipe = {
      id: editingRecipe?.id || `rec_${Date.now()}`,
      menuItemId: editingRecipe?.menuItemId,
      name: recFormName.trim(),
      description: recFormDesc.trim(),
      category: recFormCategory,
      price: priceNum,
      isAvailable: editingRecipe?.isAvailable ?? 1,
      items: recFormItems,
    };

    const cmvNum = calcRecipeCMV(newRec);

    const exists = erpState.recipes.some((r) => r.id === newRec.id);
    const nextRecipes = exists
      ? erpState.recipes.map((r) => (r.id === newRec.id ? newRec : r))
      : [newRec, ...erpState.recipes];

    saveErpState({ ...erpState, recipes: nextRecipes });

    if (newRec.menuItemId) {
      try {
        const storedToken = localStorage.getItem('teseu_admin_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
        await fetch('/api/admin/menu', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            itemId: newRec.menuItemId,
            name: newRec.name,
            description: newRec.description,
            price: newRec.price,
            costPrice: cmvNum,
          }),
        });
      } catch {
        // ignore
      }
    }

    setEditingRecipe(null);
    notify(`"${newRec.name}" salvo com sucesso! Nome, descrição, preço e CMV atualizados.`);
  };

  const handleToggleAvailability = async (rec: UnifiedRecipe) => {
    const nextAvail = rec.isAvailable === 0 ? 1 : 0;
    const nextRecipes = erpState.recipes.map((r) =>
      r.id === rec.id ? { ...r, isAvailable: nextAvail } : r
    );
    saveErpState({ ...erpState, recipes: nextRecipes });

    if (rec.menuItemId) {
      try {
        const storedToken = localStorage.getItem('teseu_admin_token');
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (storedToken) headers['Authorization'] = `Bearer ${storedToken}`;
        await fetch('/api/admin/menu', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            itemId: rec.menuItemId,
            isAvailable: nextAvail,
          }),
        });
      } catch {
        // ignore
      }
    }
    notify(`Status de "${rec.name}" alterado para ${nextAvail === 1 ? 'Em Estoque (ON)' : 'Esgotado (OFF)'}.`);
  };

  // ============================================================================
  // STATE FOR TAB: CALCULADORA DE MARGEM EM CIMA DO CMV + IFOOD 26,2% (CMV ÷ 0,783)
  // Sem nenhuma outra taxa inexistente! Site = 0% | iFood = 26,2% (÷ 0,783)
  // ============================================================================
  const [selectedSimRecipeId, setSelectedSimRecipeId] = useState<string>('rec_zeus');
  const [customCmvInput, setCustomCmvInput] = useState<string>('13.41');
  const [desiredMarginOnCmvPct, setDesiredMarginOnCmvPct] = useState<string>('120');
  const [practicedSellingPrice, setPracticedSellingPrice] = useState<string>('38.90');

  const handleSelectSimRecipe = (recId: string) => {
    setSelectedSimRecipeId(recId);
    const found = erpState.recipes.find((r) => r.id === recId);
    if (found) {
      const c = calcRecipeCMV(found);
      setCustomCmvInput(c.toFixed(2));
      setPracticedSellingPrice(found.price.toFixed(2));
    }
  };

  const simCmv = parseFloat(customCmvInput.replace(',', '.')) || 0;
  const simMarginOnCmv = parseFloat(desiredMarginOnCmvPct.replace(',', '.')) || 0;
  const practicedPriceNum = parseFloat(practicedSellingPrice.replace(',', '.')) || 0;

  // 1. Lucro em R$ desejado em cima do CMV: CMV * (Margem% / 100)
  const desiredProfitBRL = simCmv * (simMarginOnCmv / 100);
  // 2. Preço de Venda no Site (0% taxa iFood): CMV + Lucro desejado
  const directPriceWithMarginOnCmv = simCmv + desiredProfitBRL;
  // 3. Cálculo Base do iFood a 26,2% (Fórmula exclusiva: CMV ÷ 0,783)
  const ifoodBaseBy0783 = simCmv > 0 ? simCmv / IFOOD_CMV_DIVISOR : 0;
  // 4. Preço no iFood (26,2%) garantindo o CMV + Margem de Lucro desejada em cima do CMV:
  const ifoodPriceWithMarginOnCmv =
    simCmv > 0 ? (simCmv + desiredProfitBRL) / IFOOD_CMV_DIVISOR : 0;

  const handleApplyCalculatedPriceToProduct = (targetPrice: number) => {
    const found = erpState.recipes.find((r) => r.id === selectedSimRecipeId);
    if (!found || targetPrice <= 0) return;
    const rounded = Math.round(targetPrice * 100) / 100;
    const nextRecipes = erpState.recipes.map((r) =>
      r.id === found.id ? { ...r, price: rounded } : r
    );
    saveErpState({ ...erpState, recipes: nextRecipes });
    setPracticedSellingPrice(rounded.toFixed(2));
    notify(`Preço de "${found.name}" no cardápio atualizado para ${formatBRL(rounded)}!`);
  };

  // Fixed Costs state inputs
  const [fcAluguel, setFcAluguel] = useState(String(erpState.fixedCosts.aluguel));
  const [fcEnergia, setFcEnergia] = useState(String(erpState.fixedCosts.energia));
  const [fcSalarios, setFcSalarios] = useState(String(erpState.fixedCosts.salarios));
  const [fcManutencao, setFcManutencao] = useState(String(erpState.fixedCosts.manutencao || 0));
  const [fcOutros, setFcOutros] = useState(String(erpState.fixedCosts.outros));
  const [fcFaturamento, setFcFaturamento] = useState(String(erpState.fixedCosts.faturamento));

  const handleSaveFixedCosts = (e: React.FormEvent) => {
    e.preventDefault();
    const aluguel = parseFloat(fcAluguel) || 0;
    const energia = parseFloat(fcEnergia) || 0;
    const salarios = parseFloat(fcSalarios) || 0;
    const manutencao = parseFloat(fcManutencao) || 0;
    const outros = parseFloat(fcOutros) || 0;
    const faturamento = Math.max(1, parseFloat(fcFaturamento) || 1);
    const total = aluguel + energia + salarios + manutencao + outros;
    const percentual = (total / faturamento) * 100;

    saveErpState({
      ...erpState,
      fixedCosts: { aluguel, energia, salarios, manutencao, outros, faturamento, percentual },
    });
    notify(`Rateio de Custos Fixos salvo: ${percentual.toFixed(2)}% sobre o faturamento.`);
  };

  // ============================================================================
  // STATE FOR TAB: ESTOQUE DE INSUMOS
  // ============================================================================
  const [ingSearch, setIngSearch] = useState('');
  const [editingIng, setEditingIng] = useState<UnifiedIngredient | null>(null);
  const [ingName, setIngName] = useState('');
  const [ingCat, setIngCat] = useState('Carnes & Proteínas');
  const [ingUnit, setIngUnit] = useState<DisplayUnit>('kg');
  const [ingStock, setIngStock] = useState('2');
  const [ingMin, setIngMin] = useState('0.5');
  const [ingPackPrice, setIngPackPrice] = useState('');
  const [ingPackQty, setIngPackQty] = useState('');
  const [ingUnitCost, setIngUnitCost] = useState('18.00');

  const [restockTarget, setRestockTarget] = useState<UnifiedIngredient | null>(null);
  const [restockQty, setRestockQty] = useState('');
  const [restockUnit, setRestockUnit] = useState<DisplayUnit>('kg');

  const openNewIngModal = () => {
    setEditingIng({
      id: '',
      name: '',
      category: 'Carnes & Proteínas',
      baseType: 'mass',
      displayUnit: 'kg',
      stockBase: 0,
      minBase: 0,
      costPerBase: 0,
    });
    setIngName('');
    setIngCat('Carnes & Proteínas');
    setIngUnit('kg');
    setIngStock('');
    setIngMin('');
    setIngPackPrice('');
    setIngPackQty('');
    setIngUnitCost('');
  };

  const openEditIngModal = (ing: UnifiedIngredient) => {
    setEditingIng(ing);
    setIngName(ing.name);
    setIngCat(ing.category);
    setIngUnit(ing.displayUnit);
    setIngStock(String(fromBaseAmount(ing.stockBase, ing.displayUnit)));
    setIngMin(String(fromBaseAmount(ing.minBase, ing.displayUnit)));
    setIngPackPrice('');
    setIngPackQty('');
    const displayCost =
      ing.displayUnit === 'kg' || ing.displayUnit === 'L'
        ? (ing.costPerBase * 1000).toFixed(2)
        : ing.costPerBase.toFixed(4);
    setIngUnitCost(displayCost);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;
    const baseType = getBaseType(ingUnit);
    const stockBase = toBaseAmount(parseFloat(ingStock) || 0, ingUnit);
    const minBase = toBaseAmount(parseFloat(ingMin) || 0, ingUnit);
    const costInput = parseFloat(ingUnitCost) || 0;
    const costPerBase = ingUnit === 'kg' || ingUnit === 'L' ? costInput / 1000 : costInput;

    const newIng: UnifiedIngredient = {
      id: editingIng?.id || `ing_${Date.now()}`,
      name: ingName.trim(),
      category: ingCat,
      baseType,
      displayUnit: ingUnit,
      stockBase,
      minBase,
      costPerBase,
    };

    const exists = erpState.ingredients.some((i) => i.id === newIng.id);
    const nextIngs = exists
      ? erpState.ingredients.map((i) => (i.id === newIng.id ? newIng : i))
      : [...erpState.ingredients, newIng];

    saveErpState({ ...erpState, ingredients: nextIngs });
    setEditingIng(null);
    notify(`Insumo "${newIng.name}" salvo e CMVs recalculados!`);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockTarget) return;
    const addedBase = toBaseAmount(parseFloat(restockQty) || 0, restockUnit);
    if (addedBase <= 0) return;

    const nextIngs = erpState.ingredients.map((i) =>
      i.id === restockTarget.id
        ? { ...i, stockBase: Math.round((i.stockBase + addedBase) * 100) / 100 }
        : i
    );
    saveErpState({ ...erpState, ingredients: nextIngs });
    setRestockTarget(null);
    setRestockQty('');
    notify(`Estoque de "${restockTarget.name}" atualizado com sucesso!`);
  };

  // ============================================================================
  // STATE FOR TAB: KDS COZINHA + EDITAR NOME E DESCRIÇÃO DO PEDIDO
  // ============================================================================
  const [builderOrderName, setBuilderOrderName] = useState('Pedido #1041 — Cliente');
  const [builderOrderDesc, setBuilderOrderDesc] = useState('Carne ao ponto, batata crocante');
  const [builderChannelType, setBuilderChannelType] = useState<SalesChannelType>('SITE');
  const [builderRecipeId, setBuilderRecipeId] = useState('rec_combo_teseu');
  const [builderQty, setBuilderQty] = useState(1);
  const [builderItems, setBuilderItems] = useState<Array<{ recipeId: string; qty: number }>>([
    { recipeId: 'rec_combo_teseu', qty: 1 },
  ]);

  const [editingKdsTicket, setEditingKdsTicket] = useState<KdsQueueTicket | null>(null);
  const [editTicketName, setEditTicketName] = useState('');
  const [editTicketDesc, setEditTicketDesc] = useState('');
  const [editTicketChannelType, setEditTicketChannelType] = useState<SalesChannelType>('SITE');

  const openEditKdsTicketModal = (ticket: KdsQueueTicket) => {
    setEditingKdsTicket(ticket);
    setEditTicketName(ticket.orderName);
    setEditTicketDesc(ticket.orderDescription || '');
    setEditTicketChannelType(ticket.channelType || detectChannelType(ticket.channel));
  };

  const handleSaveKdsTicketEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingKdsTicket) return;
    const nextQueue = erpState.kdsQueue.map((q) =>
      q.id === editingKdsTicket.id
        ? {
            ...q,
            orderName: editTicketName.trim() || q.orderName,
            orderDescription: editTicketDesc.trim(),
            channelType: editTicketChannelType,
            channel: editTicketChannelType === 'IFOOD' ? 'iFood (Taxa 26,2%)' : 'Site (Sem Taxa)',
          }
        : q
    );
    saveErpState({ ...erpState, kdsQueue: nextQueue });
    setEditingKdsTicket(null);
    notify('Nome, descrição e canal do pedido atualizados com sucesso!');
  };

  const aggregateOrderIngredients = useCallback(
    (orderItems: Array<{ recipeId: string; qty: number }>) => {
      const map: Record<string, { ingredient: UnifiedIngredient; baseNeeded: number }> = {};
      orderItems.forEach((oi) => {
        const rec = erpState.recipes.find((r) => r.id === oi.recipeId);
        if (!rec) return;
        rec.items.forEach((ri) => {
          const ing = erpState.ingredients.find((i) => i.id === ri.ingredientId);
          if (!ing) return;
          const needed = toBaseAmount(ri.qty, ri.unit) * oi.qty;
          if (!map[ing.id]) {
            map[ing.id] = { ingredient: ing, baseNeeded: 0 };
          }
          map[ing.id].baseNeeded += needed;
        });
      });

      return Object.values(map).map((entry) => {
        const ing = entry.ingredient;
        const currentBase = ing.stockBase;
        const remainingBase = currentBase - entry.baseNeeded;
        const cost = entry.baseNeeded * ing.costPerBase;
        return {
          ingredient: ing,
          baseNeeded: entry.baseNeeded,
          currentBase,
          remainingBase,
          cost,
          hasEnough: remainingBase >= 0,
        };
      });
    },
    [erpState.recipes, erpState.ingredients]
  );

  const executeOrderDeduction = (ticket: KdsQueueTicket) => {
    const breakdown = aggregateOrderIngredients(ticket.items);
    let totalCost = 0;
    const deductions: StockDeductionEntry[] = [];

    const nextIngredients = erpState.ingredients.map((ing) => {
      const found = breakdown.find((b) => b.ingredient.id === ing.id);
      if (!found) return ing;
      totalCost += found.cost;
      const baseSym = getBaseUnitSymbol(ing.baseType);
      deductions.push({
        ingredientId: ing.id,
        name: ing.name,
        baseType: ing.baseType,
        baseDeducted: found.baseNeeded,
        displayDeducted: `${found.baseNeeded.toLocaleString('pt-BR')} ${baseSym}`,
        cost: Math.round(found.cost * 100) / 100,
      });
      return {
        ...ing,
        stockBase: Math.max(0, Math.round((ing.stockBase - found.baseNeeded) * 100) / 100),
      };
    });

    let revenue = 0;
    const summaryParts: string[] = [];
    ticket.items.forEach((oi) => {
      const rec = erpState.recipes.find((r) => r.id === oi.recipeId);
      if (rec) {
        revenue += rec.price * oi.qty;
        summaryParts.push(`${oi.qty}x ${rec.name}`);
      }
    });

    const cType = ticket.channelType || detectChannelType(ticket.channel);
    const revRounded = Math.round(revenue * 100) / 100;
    const costRounded = Math.round(totalCost * 100) / 100;
    const ifoodFee = cType === 'IFOOD' ? Math.round(revRounded * IFOOD_FEE_RATE * 100) / 100 : 0;
    const netRevenue = Math.round((revRounded - ifoodFee) * 100) / 100;
    const netProfit = Math.round((revRounded - ifoodFee - costRounded) * 100) / 100;

    const newLog: KdsConsumptionLog = {
      id: `log_${Date.now()}`,
      orderNumber: ticket.orderNumber,
      orderName: ticket.orderName,
      orderDescription: ticket.orderDescription,
      channel: cType === 'IFOOD' ? 'iFood (Taxa 26,2%)' : 'Site (Sem Taxa)',
      channelType: cType,
      salesCount: 1,
      dateKey: getTodayDateKey(),
      timestamp: Date.now(),
      revenue: revRounded,
      ifoodFee,
      netRevenue,
      totalCost: costRounded,
      netProfit,
      itemsSummary: summaryParts.join(', '),
      deductions,
    };

    const nextQueue = erpState.kdsQueue.filter((q) => q.id !== ticket.id);
    saveErpState({
      ...erpState,
      ingredients: nextIngredients,
      kdsQueue: nextQueue,
      logs: [newLog, ...erpState.logs],
    });

    notify(
      `Saída confirmada (${ticket.orderName})! Canal: ${cType === 'IFOOD' ? 'iFood (26,2%)' : 'Site (0%)'} • Lucro Real: ${formatBRL(netProfit)}`
    );
  };

  // ============================================================================
  // STATE FOR TAB: RELATÓRIOS SEPARANDO SITE (0%) VS IFOOD (26,2%)
  // Synchronized with the top header's periodFilter (Hoje, 7d, Mês, Tudo)
  // ============================================================================
  const reportPeriod: ReportPeriod = useMemo(() => {
    if (periodFilter === 'today') return 'DAILY';
    if (periodFilter === 'week') return 'WEEKLY';
    if (periodFilter === 'month') return 'MONTHLY';
    return 'YEARLY';
  }, [periodFilter]);

  const handleSelectReportPeriod = (p: ReportPeriod) => {
    if (!onPeriodFilterChange) return;
    if (p === 'DAILY') onPeriodFilterChange('today');
    else if (p === 'WEEKLY') onPeriodFilterChange('week');
    else if (p === 'MONTHLY') onPeriodFilterChange('month');
    else onPeriodFilterChange('all');
  };

  const filteredLogs = useMemo(() => {
    return erpState.logs.filter((l) => matchesPeriodFilter(l.timestamp, l.dateKey, periodFilter));
  }, [erpState.logs, periodFilter]);

  const periodStats = useMemo(() => {
    let siteRevenue = 0;
    let siteCost = 0;
    let siteProfit = 0;
    let siteSalesCount = 0;

    let ifoodRevenue = 0;
    let ifoodFeeTotal = 0;
    let ifoodCost = 0;
    let ifoodProfit = 0;
    let ifoodSalesCount = 0;

    filteredLogs.forEach((l) => {
      const cType = l.channelType || detectChannelType(l.channel);
      const count = l.salesCount || 1;
      if (cType === 'IFOOD') {
        const fee = l.ifoodFee !== undefined ? l.ifoodFee : Math.round(l.revenue * IFOOD_FEE_RATE * 100) / 100;
        ifoodRevenue += l.revenue;
        ifoodFeeTotal += fee;
        ifoodCost += l.totalCost;
        ifoodProfit += l.revenue - fee - l.totalCost;
        ifoodSalesCount += count;
      } else {
        siteRevenue += l.revenue;
        siteCost += l.totalCost;
        siteProfit += l.revenue - l.totalCost;
        siteSalesCount += count;
      }
    });

    const totalRevenue = siteRevenue + ifoodRevenue;
    const totalCost = siteCost + ifoodCost;
    const totalIfoodFee = ifoodFeeTotal;
    const netProfit = siteProfit + ifoodProfit;

    return {
      siteRevenue,
      siteCost,
      siteProfit,
      siteSalesCount,
      ifoodRevenue,
      ifoodFeeTotal: totalIfoodFee,
      ifoodCost,
      ifoodProfit,
      ifoodSalesCount,
      totalRevenue,
      totalCost,
      netProfit,
      totalSalesCount: siteSalesCount + ifoodSalesCount,
    };
  }, [filteredLogs]);

  const displayedRecipes = useMemo(() => {
    return erpState.recipes.filter((r) => {
      const matchesCat = recipeCatFilter === 'all' || r.category === recipeCatFilter;
      const matchesSearch =
        !recipeSearch.trim() ||
        r.name.toLowerCase().includes(recipeSearch.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(recipeSearch.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [erpState.recipes, recipeCatFilter, recipeSearch]);

  const criticalStockCount = useMemo(
    () => erpState.ingredients.filter((i) => i.stockBase <= i.minBase).length,
    [erpState.ingredients]
  );

  const totalInventoryValue = useMemo(
    () => erpState.ingredients.reduce((acc, i) => acc + i.stockBase * i.costPerBase, 0),
    [erpState.ingredients]
  );

  return (
    <div className="space-y-6 text-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-[#161616] text-[#F5CB5C] border border-[#CD9C20] px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-white">{toast}</span>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-[#161616] border border-[#CD9C20]/40 rounded-2xl p-5 sm:p-6 shadow-md text-white">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#CD9C20]/20 border border-[#CD9C20]/40 text-[#F5CB5C] text-[10px] font-black uppercase tracking-widest">
                CENTRAL UNIFICADA • SITE (0% TAXA) vs. IFOOD (TAXA 26,2%)
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-neutral-300 text-[10px] font-mono">
                Fórmula iFood: CMV ÷ 0,783 (26,2%)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight flex items-center gap-2.5">
              <SpartanHelmetIcon size={24} color="#F5CB5C" />
              <span>Cardápio, Estoque, Baixa Diária iFood &amp; Cálculos</span>
            </h2>
            <p className="text-xs text-neutral-400 max-w-3xl mt-1">
              Separação automática entre <strong>Compras pelo Site (sem a taxa de 26,2%)</strong> e <strong>Compras do iFood (com taxa de 26,2% • CMV ÷ 0,783)</strong>, com sistema de baixa diária de vendas do iFood integrado ao Dashboard Geral.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex items-center gap-2.5 shrink-0">
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-[#CD9C20]/30 text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Saldo em Estoque</span>
              <span className="text-sm sm:text-base font-black text-[#F5CB5C] font-mono">
                {formatBRL(totalInventoryValue)}
              </span>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-[#CD9C20]/30 text-right">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Vendas iFood Hoje</span>
              <span className="text-sm sm:text-base font-black text-emerald-400 font-mono">
                {erpState.logs
                  .filter((l) => (l.channelType === 'IFOOD' || detectChannelType(l.channel) === 'IFOOD') && (l.dateKey || getTodayDateKey()) === getTodayDateKey())
                  .reduce((acc, l) => acc + (l.salesCount || 1), 0)}{' '}
                vendas
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            {
              id: 'baixa_ifood_site',
              label: 'Baixa Diária iFood vs. Site',
              icon: Bike,
              badge: 'Novo',
            },
            {
              id: 'cardapio_fichas',
              label: 'Cardápio & Fichas Técnicas (CMV)',
              icon: UtensilsCrossed,
              badge: erpState.recipes.length,
            },
            {
              id: 'precificacao_ifood',
              label: 'Margem s/ CMV & iFood (26,2% • ÷ 0,783)',
              icon: Calculator,
              badge: '26,2%',
            },
            {
              id: 'estoque_insumos',
              label: 'Estoque & Insumos (g/kg/ml/un)',
              icon: PackageCheck,
              badge: criticalStockCount > 0 ? `${criticalStockCount} alerta` : erpState.ingredients.length,
            },
            {
              id: 'kds_cozinha',
              label: 'Pedidos KDS & Baixa Individual',
              icon: Flame,
              badge: erpState.kdsQueue.length,
            },
            {
              id: 'relatorios',
              label: 'Relatórios (Site vs. iFood)',
              icon: TrendingUp,
            },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as CalculosTab)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#CD9C20] text-black shadow-[0_0_15px_rgba(205,156,32,0.35)]'
                    : 'bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/10'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : 'text-[#F5CB5C]'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full font-extrabold ${
                      isActive ? 'bg-black text-[#F5CB5C]' : 'bg-white/10 text-[#F5CB5C]'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ABA 0: BAIXA DIÁRIA DE VENDAS DO IFOOD (26,2%) E SEPARAÇÃO SITE (0%)      */}
      {/* ========================================================================= */}
      {activeTab === 'baixa_ifood_site' && (
        <div className="space-y-6">
          <IfoodDailyBatchWidget
            erpState={erpState}
            onSaveErpState={saveErpState}
            onNotify={notify}
            activePeriodFilter={periodFilter}
          />

          {/* Resumo Comparativo Rápido Site (0% Taxa) vs iFood (26,2% Taxa) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Compras pelo Site (Sem Taxa 26,2%) */}
            <div className="bg-white rounded-2xl border border-emerald-300 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <ShoppingBag className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase font-display">
                      Compras pelo Site (Delivery Próprio)
                    </h4>
                    <span className="text-[11px] text-emerald-700 font-bold">
                      Isento de Taxa iFood (0% de comissão)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-extrabold">
                  {periodStats.siteSalesCount} vendas
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center bg-[#F8F6F0] p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Receita Site</span>
                  <strong className="text-sm font-black text-slate-900 font-mono">
                    {formatBRL(periodStats.siteRevenue)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">CMV Site</span>
                  <strong className="text-sm font-black text-slate-700 font-mono">
                    -{formatBRL(periodStats.siteCost)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Lucro Limpo Site</span>
                  <strong className="text-sm font-black text-emerald-700 font-mono">
                    {formatBRL(periodStats.siteProfit)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Compras pelo iFood (Com Taxa de 26,2%) */}
            <div className="bg-white rounded-2xl border border-[#CD9C20]/50 p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]">
                    <Bike className="w-4 h-4" />
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 uppercase font-display">
                      Compras pelo iFood
                    </h4>
                    <span className="text-[11px] text-amber-700 font-bold">
                      Com Desconto Oficial de 26,2% do iFood (CMV ÷ 0,783)
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]/40 text-xs font-extrabold">
                  {periodStats.ifoodSalesCount} vendas
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center bg-[#F8F6F0] p-3 rounded-xl border border-[#CD9C20]/30">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Bruto iFood</span>
                  <strong className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                    {formatBRL(periodStats.ifoodRevenue)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Taxa 26,2%</span>
                  <strong className="text-xs sm:text-sm font-black text-amber-700 font-mono">
                    -{formatBRL(periodStats.ifoodFeeTotal)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">CMV iFood</span>
                  <strong className="text-xs sm:text-sm font-black text-slate-700 font-mono">
                    -{formatBRL(periodStats.ifoodCost)}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Lucro iFood</span>
                  <strong className="text-xs sm:text-sm font-black text-emerald-700 font-mono">
                    {formatBRL(periodStats.ifoodProfit)}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 1: CARDÁPIO & FICHAS TÉCNICAS (EDITAR NOME, DESCRIÇÃO, PREÇO & CMV)  */}
      {/* ========================================================================= */}
      {activeTab === 'cardapio_fichas' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#CD9C20]/30 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 uppercase font-display">
                  Cardápio, Fichas Técnicas &amp; Comparativo Site (0%) vs. iFood (26,2%)
                </h3>
                <p className="text-xs text-slate-500">
                  Clique em <strong>&quot;Editar Nome, Descrição &amp; Ficha&quot;</strong> em qualquer item para alterar o nome do pedido/produto, sua descrição no cardápio, o preço de venda no site e os ingredientes.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={recipeSearch}
                    onChange={(e) => setRecipeSearch(e.target.value)}
                    placeholder="Buscar lanche ou descrição..."
                    className="w-full pl-8 pr-3 py-2 bg-[#F8F6F0] border border-[#CD9C20]/30 rounded-xl text-xs outline-none focus:border-[#CD9C20]"
                  />
                </div>
                <button
                  type="button"
                  onClick={openNewRecipeModal}
                  className="px-4 py-2 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-4 h-4 text-[#CD9C20]" />
                  <span>Novo Produto / Ficha</span>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { id: 'all', label: 'Todos os Itens' },
                { id: 'legends', label: 'As Lendas' },
                { id: 'smash', label: 'Smashes' },
                { id: 'especiais', label: 'Especiais' },
                { id: 'combos', label: 'Combos' },
                { id: 'sides', label: 'Acompanhamentos' },
                { id: 'bebidas', label: 'Bebidas' },
                { id: 'sobremesas', label: 'Sobremesas' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setRecipeCatFilter(cat.id)}
                  className={`px-3 py-1.5 rounded-xl uppercase font-bold text-[11px] whitespace-nowrap transition-colors cursor-pointer ${
                    recipeCatFilter === cat.id
                      ? 'bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]'
                      : 'bg-[#F8F6F0] text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {displayedRecipes.map((rec) => {
              const cmv = calcRecipeCMV(rec);
              const siteProfit = rec.price - cmv; // Site: 0% taxa
              const markupOnCmvPct = cmv > 0 ? (siteProfit / cmv) * 100 : 0;
              const ifoodPrice0783 = cmv > 0 ? cmv / IFOOD_CMV_DIVISOR : 0;
              const isSoldOut = rec.isAvailable === 0;

              return (
                <div
                  key={rec.id}
                  className="bg-white rounded-2xl border border-[#CD9C20]/30 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#F8F6F0] text-slate-600 border border-[#CD9C20]/30">
                            {rec.category}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleAvailability(rec)}
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md cursor-pointer ${
                              isSoldOut
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {isSoldOut ? 'Esgotado (OFF)' : 'Em Estoque (ON)'}
                          </button>
                        </div>
                        <h4 className="font-extrabold text-base text-slate-900 mt-1.5 font-display">
                          {rec.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {rec.description || 'Sem descrição cadastrada.'}
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Preço Site</span>
                        <span className="px-2.5 py-1 rounded-xl bg-[#161616] text-[#F5CB5C] font-extrabold text-sm inline-block border border-[#CD9C20]/40">
                          {formatBRL(rec.price)}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                        Composição da Ficha Técnica (Baixa no Estoque):
                      </span>
                      <ul className="bg-[#F8F6F0] rounded-xl p-2.5 border border-[#CD9C20]/20 divide-y divide-slate-200/60 max-h-40 overflow-y-auto">
                        {rec.items.map((it, idx) => {
                          const ing = erpState.ingredients.find((i) => i.id === it.ingredientId);
                          if (!ing) return null;
                          const itemCost = toBaseAmount(it.qty, it.unit) * ing.costPerBase;
                          return (
                            <li key={idx} className="py-1.5 flex items-center justify-between text-xs">
                              <span className="text-slate-700 font-medium truncate pr-2">{ing.name}</span>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800 font-bold text-[11px]">
                                  {it.qty} {it.unit}
                                </span>
                                <span className="text-slate-500 font-mono text-[11px] w-14 text-right">
                                  {formatBRL(itemCost)}
                                </span>
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="grid grid-cols-3 gap-2 text-center bg-[#F8F6F0] p-2.5 rounded-xl border border-[#CD9C20]/30">
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">Custo (CMV)</span>
                        <strong className="text-xs sm:text-sm text-slate-900 font-mono">{formatBRL(cmv)}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-emerald-700 font-bold block">Lucro Site (0%)</span>
                        <strong className="text-xs sm:text-sm text-emerald-700 font-mono">
                          {formatBRL(siteProfit)}
                        </strong>
                        <span className="text-[10px] text-emerald-700 block font-bold">
                          +{markupOnCmvPct.toFixed(0)}% s/ CMV
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-slate-500 font-bold block">
                          iFood (÷ 0,783)
                        </span>
                        <strong className="text-xs sm:text-sm text-[#161616] font-mono">
                          {formatBRL(ifoodPrice0783)}
                        </strong>
                        <span className="text-[10px] text-slate-500 block">Taxa 26,2%</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditRecipeModal(rec)}
                        className="flex-1 py-2.5 px-3 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20]/40 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#CD9C20]" />
                        <span>Editar Nome, Descrição &amp; Ficha</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleSelectSimRecipe(rec.id);
                          setActiveTab('precificacao_ifood');
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#F8F6F0] hover:bg-[#CD9C20]/20 text-slate-800 border border-[#CD9C20]/40 font-bold text-xs cursor-pointer"
                        title="Calcular Margem & iFood"
                      >
                        <Calculator className="w-4 h-4 text-[#CD9C20]" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 2: CALCULADORA DE MARGEM EM CIMA DO CMV + IFOOD (26,2% / CMV ÷ 0,783) */}
      {/* ========================================================================= */}
      {activeTab === 'precificacao_ifood' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border-2 border-[#CD9C20]/50 shadow-sm p-5 sm:p-6 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#CD9C20] block">
                  SIMULADOR OFICIAL • SITE (SEM TAXA 0%) vs. IFOOD (TAXA 26,2% • CMV ÷ 0,783)
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display uppercase">
                  Cálculo de Margem em cima do CMV &amp; Preço iFood (CMV ÷ 0,783)
                </h3>
                <p className="text-xs text-slate-500">
                  No <strong>Site</strong> não há taxa do iFood (0%). No <strong>iFood</strong> aplica-se exclusivamente a taxa de <strong>26,2% (CMV ÷ 0,783)</strong>.
                </p>
              </div>

              <div className="px-3.5 py-2 rounded-xl bg-[#161616] text-[#F5CB5C] border border-[#CD9C20] text-xs font-bold shrink-0">
                Taxa Oficial iFood: 26,2% (CMV ÷ 0,783)
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Selecionar Produto / Ficha
                </label>
                <select
                  value={selectedSimRecipeId}
                  onChange={(e) => handleSelectSimRecipe(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F0] border border-[#CD9C20]/40 text-xs sm:text-sm font-bold text-slate-900 outline-none"
                >
                  {erpState.recipes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} (CMV: {formatBRL(calcRecipeCMV(r))})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Custo de Produção — CMV (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={customCmvInput}
                  onChange={(e) => setCustomCmvInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white border-2 border-slate-300 focus:border-[#CD9C20] text-sm font-extrabold text-slate-900 font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-emerald-800 mb-1">
                  3. Margem Desejada em cima do CMV (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    value={desiredMarginOnCmvPct}
                    onChange={(e) => setDesiredMarginOnCmvPct(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-emerald-50/70 border-2 border-emerald-400 focus:border-emerald-600 text-sm font-extrabold text-emerald-900 font-mono outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-emerald-700">
                    % s/ CMV
                  </span>
                </div>
                <div className="flex gap-1 mt-1.5">
                  {[50, 80, 100, 120, 150, 200].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDesiredMarginOnCmvPct(String(preset))}
                      className="px-2 py-0.5 rounded bg-slate-100 hover:bg-[#CD9C20]/20 text-[10px] font-bold text-slate-700 cursor-pointer"
                    >
                      +{preset}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Preço Praticado p/ Comparar (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={practicedSellingPrice}
                  onChange={(e) => setPracticedSellingPrice(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F0] border-2 border-[#CD9C20]/50 text-sm font-extrabold text-slate-900 font-mono outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card A: Cálculo Base iFood 26,2% (CMV ÷ 0,783) */}
              <div className="bg-[#F8F6F0] rounded-2xl p-5 border border-[#CD9C20]/40 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#161616] text-[#F5CB5C]">
                    CÁLCULO BASE IFOOD (26,2%)
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">
                    Cobertura do CMV no iFood (CMV ÷ 0,783)
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Valor mínimo no iFood para cobrir o custo dos ingredientes descontando a taxa de 26,2%:
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">CMV ÷ 0,783:</span>
                    <strong className="text-lg font-black text-slate-900 font-mono">
                      {formatBRL(ifoodBaseBy0783)}
                    </strong>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <span>Taxa Aplicada:</span>
                    <strong className="font-mono">26,2% (Exclusiva iFood)</strong>
                  </div>
                </div>
              </div>

              {/* Card B: Preço no Site (Sem Taxa 26,2%) com Margem sobre CMV */}
              <div className="bg-emerald-50/60 rounded-2xl p-5 border border-emerald-300 flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-700 text-white">
                    VENDA PELO SITE (0% TAXA IFOOD)
                  </span>
                  <h4 className="font-bold text-sm text-slate-900 mt-2">
                    Preço no Site (CMV + {simMarginOnCmv}% de Lucro)
                  </h4>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Custo CMV ({formatBRL(simCmv)}) + Lucro Desejado ({formatBRL(desiredProfitBRL)}) sem taxa de 26,2%:
                  </p>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Preço Final no Site
                    </span>
                    <strong className="text-xl font-black text-emerald-700 font-mono">
                      {formatBRL(directPriceWithMarginOnCmv)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCalculatedPriceToProduct(directPriceWithMarginOnCmv)}
                    className="px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Aplicar no Site
                  </button>
                </div>
              </div>

              {/* Card C: Preço no iFood (Com Taxa 26,2%) Garantindo o CMV + Margem Desejada */}
              <div className="bg-[#161616] text-white rounded-2xl p-5 border border-[#CD9C20] flex flex-col justify-between space-y-3">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded bg-[#CD9C20] text-black">
                    VENDA NO IFOOD (TAXA 26,2%)
                  </span>
                  <h4 className="font-bold text-sm text-[#F5CB5C] mt-2">
                    Preço no iFood (Garantindo +{formatBRL(desiredProfitBRL)} de Lucro)
                  </h4>
                  <p className="text-[11px] text-neutral-300 mt-0.5">
                    Fórmula: (CMV + Lucro Desejado) ÷ 0,783
                  </p>
                </div>

                <div className="bg-white/10 p-3.5 rounded-xl border border-[#CD9C20]/40 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-neutral-300 block">
                      Cobrar no iFood
                    </span>
                    <strong className="text-xl font-black text-[#F5CB5C] font-mono">
                      {formatBRL(ifoodPriceWithMarginOnCmv)}
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleApplyCalculatedPriceToProduct(ifoodPriceWithMarginOnCmv)}
                    className="px-3 py-2 rounded-xl bg-[#CD9C20] hover:bg-[#b88918] text-black text-xs font-extrabold cursor-pointer"
                  >
                    Aplicar Preço
                  </button>
                </div>
              </div>
            </div>

            {/* Real-time Audit of the Practiced Selling Price */}
            {(() => {
              const ifoodFee262 = practicedPriceNum * IFOOD_FEE_RATE;
              const netAfterIfoodAndCmv = practicedPriceNum - ifoodFee262 - simCmv;
              const directProfit = practicedPriceNum - simCmv;
              const directMarkupOnCmv = simCmv > 0 ? (directProfit / simCmv) * 100 : 0;

              return (
                <div className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#CD9C20]/30 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Preço Praticado Simulado
                    </span>
                    <strong className="text-base font-black text-slate-900 font-mono">
                      {formatBRL(practicedPriceNum)}
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">
                      Lucro se Vendido pelo Site (0% Taxa)
                    </span>
                    <strong className="text-base font-black text-emerald-700 font-mono">
                      {formatBRL(directProfit)} (+{directMarkupOnCmv.toFixed(0)}% s/ CMV)
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Taxa se Vendido no iFood (26,2%)
                    </span>
                    <strong className="text-base font-black text-amber-700 font-mono">
                      -{formatBRL(ifoodFee262)}
                    </strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Lucro Líquido no iFood (após 26,2% e CMV)
                    </span>
                    <strong
                      className={`text-base font-black font-mono ${
                        netAfterIfoodAndCmv >= 0 ? 'text-emerald-700' : 'text-amber-700'
                      }`}
                    >
                      {formatBRL(netAfterIfoodAndCmv)}
                    </strong>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* 2.2 RATEIO DE CUSTOS FIXOS MENSAIS */}
          <div className="bg-white rounded-2xl border border-[#CD9C20]/30 shadow-xs p-5 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 uppercase font-display flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#CD9C20]" />
                  <span>Rateio de Custos Fixos Mensais da Loja</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Informe seus custos fixos e o faturamento médio para calcular a taxa de rateio.
                </p>
              </div>
              <div className="px-4 py-2 rounded-xl bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]/40 text-right">
                <span className="text-[10px] uppercase text-neutral-400 block">Rateio Atual</span>
                <strong className="text-base font-black font-mono">
                  {erpState.fixedCosts.percentual.toFixed(2)}%
                </strong>
              </div>
            </div>

            <form
              onSubmit={handleSaveFixedCosts}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3 items-end text-xs"
            >
              <div>
                <label className="block font-bold text-slate-700 mb-1">Aluguel (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcAluguel}
                  onChange={(e) => setFcAluguel(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Energia/Água (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcEnergia}
                  onChange={(e) => setFcEnergia(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Equipe/Salários (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcSalarios}
                  onChange={(e) => setFcSalarios(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Manutenção (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcManutencao}
                  onChange={(e) => setFcManutencao(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Outros (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcOutros}
                  onChange={(e) => setFcOutros(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-[#161616] mb-1">Faturamento Médio (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={fcFaturamento}
                  onChange={(e) => setFcFaturamento(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border-2 border-[#CD9C20] font-extrabold"
                />
              </div>
              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20]/50 font-bold cursor-pointer"
                >
                  Salvar Rateio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 3: ESTOQUE & INSUMOS (CONVERSÃO g, kg, ml, L, un + PACOTE)            */}
      {/* ========================================================================= */}
      {activeTab === 'estoque_insumos' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#CD9C20]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 uppercase font-display">
                Controle de Estoque Inteligente (g, kg, ml, L, un)
              </h3>
              <p className="text-xs text-slate-500">
                Conversão matemática automática: ao dar baixa nas vendas do iFood ou do Site, o sistema desconta exatamente as gramas, ml ou unidades do seu saldo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ingSearch}
                  onChange={(e) => setIngSearch(e.target.value)}
                  placeholder="Buscar insumo..."
                  className="w-full pl-8 pr-3 py-2 bg-[#F8F6F0] border border-[#CD9C20]/30 rounded-xl text-xs outline-none"
                />
              </div>
              <button
                type="button"
                onClick={openNewIngModal}
                className="px-4 py-2 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20]/50 text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4 text-[#CD9C20]" />
                <span>Cadastrar Insumo</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#CD9C20]/30 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#161616] text-[#F5CB5C] uppercase text-[10px] font-bold">
                  <tr>
                    <th className="py-3.5 px-4">Insumo / Categoria</th>
                    <th className="py-3.5 px-4">Saldo Atual</th>
                    <th className="py-3.5 px-4">Equivalência Base</th>
                    <th className="py-3.5 px-4">Custo Unitário</th>
                    <th className="py-3.5 px-4">Valor em Estoque</th>
                    <th className="py-3.5 px-4 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {erpState.ingredients
                    .filter(
                      (i) =>
                        !ingSearch.trim() ||
                        i.name.toLowerCase().includes(ingSearch.toLowerCase()) ||
                        i.category.toLowerCase().includes(ingSearch.toLowerCase())
                    )
                    .map((ing) => {
                      const dual = formatDualStock(ing.stockBase, ing.displayUnit, ing.baseType);
                      const isCrit = ing.stockBase <= ing.minBase;
                      const costInDisplay =
                        ing.displayUnit === 'kg' || ing.displayUnit === 'L'
                          ? ing.costPerBase * 1000
                          : ing.costPerBase;
                      const totalVal = ing.stockBase * ing.costPerBase;

                      return (
                        <tr key={ing.id} className="hover:bg-[#F8F6F0]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-slate-900">{ing.name}</p>
                            <span className="text-[11px] text-slate-400">{ing.category}</span>
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-2">
                              <strong className="text-sm font-extrabold text-slate-900">
                                {dual.primary}
                              </strong>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isCrit
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                }`}
                              >
                                {isCrit ? 'REPOR' : 'OK'}
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-lg bg-[#F8F6F0] border border-slate-200 font-mono text-slate-700">
                              {dual.secondary}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-800">
                            {formatBRL(costInDisplay)} / {ing.displayUnit}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-emerald-700">
                            {formatBRL(totalVal)}
                          </td>
                          <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                setRestockTarget(ing);
                                setRestockUnit(ing.displayUnit);
                                setRestockQty('');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                            >
                              + Repor
                            </button>
                            <button
                              type="button"
                              onClick={() => openEditIngModal(ing)}
                              className="px-3 py-1.5 rounded-xl bg-[#F8F6F0] hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs cursor-pointer"
                            >
                              Editar
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 4: PEDIDOS KDS & BAIXA INDIVIDUAL (COM CANAL SITE vs IFOOD)           */}
      {/* ========================================================================= */}
      {activeTab === 'kds_cozinha' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-[#CD9C20]/30 shadow-xs p-5 space-y-4">
            <div className="border-b border-slate-100 pb-3">
              <span className="text-[10px] font-bold uppercase text-[#CD9C20]">
                LANÇADOR DE PEDIDOS &amp; CANAL (SITE 0% vs. IFOOD 26,2%)
              </span>
              <h3 className="font-extrabold text-base text-slate-900 uppercase font-display">
                Criar Pedido com Nome &amp; Descrição Personalizados
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Canal da Compra</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBuilderChannelType('SITE')}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer ${
                      builderChannelType === 'SITE'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-[#F8F6F0] text-slate-700 border-slate-200'
                    }`}
                  >
                    Site (Sem Taxa 0%)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBuilderChannelType('IFOOD')}
                    className={`py-2 px-3 rounded-xl font-bold border text-xs cursor-pointer ${
                      builderChannelType === 'IFOOD'
                        ? 'bg-[#161616] text-[#F5CB5C] border-[#CD9C20]'
                        : 'bg-[#F8F6F0] text-slate-700 border-slate-200'
                    }`}
                  >
                    iFood (Taxa 26,2%)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nome do Pedido / Cliente
                </label>
                <input
                  type="text"
                  value={builderOrderName}
                  onChange={(e) => setBuilderOrderName(e.target.value)}
                  placeholder="Ex: Pedido #1045 — João (Combo Zeus)"
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold text-slate-900 outline-none focus:border-[#CD9C20]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Descrição / Observações do Pedido
                </label>
                <textarea
                  rows={2}
                  value={builderOrderDesc}
                  onChange={(e) => setBuilderOrderDesc(e.target.value)}
                  placeholder="Ex: Carne bem passada, sem cebola, enviar maionese extra..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 text-slate-800 outline-none focus:border-[#CD9C20]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Adicionar Item (Ficha Técnica)
                </label>
                <div className="flex gap-2">
                  <select
                    value={builderRecipeId}
                    onChange={(e) => setBuilderRecipeId(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 font-bold"
                  >
                    {erpState.recipes.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({formatBRL(r.price)})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={builderQty}
                    onChange={(e) => setBuilderQty(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-16 px-2 py-2 rounded-xl bg-[#F8F6F0] border border-slate-200 text-center font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const existing = builderItems.find((i) => i.recipeId === builderRecipeId);
                      if (existing) {
                        setBuilderItems(
                          builderItems.map((i) =>
                            i.recipeId === builderRecipeId ? { ...i, qty: i.qty + builderQty } : i
                          )
                        );
                      } else {
                        setBuilderItems([...builderItems, { recipeId: builderRecipeId, qty: builderQty }]);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-[#161616] text-[#F5CB5C] font-bold cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              <div className="bg-[#F8F6F0] rounded-xl p-3 border border-slate-200 space-y-2">
                {builderItems.map((bi, idx) => {
                  const rec = erpState.recipes.find((r) => r.id === bi.recipeId);
                  if (!rec) return null;
                  return (
                    <div key={idx} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-slate-200">
                      <span className="font-bold text-slate-900">
                        {bi.qty}x {rec.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => setBuilderItems(builderItems.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-slate-800 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (builderItems.length === 0) return;
                    const newTicket: KdsQueueTicket = {
                      id: `kds_${Date.now()}`,
                      orderNumber: `#${erpState.nextOrderCounter}`,
                      orderName: builderOrderName.trim() || `Pedido #${erpState.nextOrderCounter}`,
                      orderDescription: builderOrderDesc.trim(),
                      channel: builderChannelType === 'IFOOD' ? 'iFood (Taxa 26,2%)' : 'Site (Sem Taxa)',
                      channelType: builderChannelType,
                      createdAt: Date.now(),
                      items: [...builderItems],
                    };
                    saveErpState({
                      ...erpState,
                      nextOrderCounter: erpState.nextOrderCounter + 1,
                      kdsQueue: [...erpState.kdsQueue, newTicket],
                    });
                    setBuilderOrderName(`Pedido #${erpState.nextOrderCounter + 1} — Cliente`);
                    notify('Pedido enviado para a fila do KDS!');
                  }}
                  className="py-3 px-4 rounded-xl bg-[#F8F6F0] hover:bg-slate-200 text-slate-900 border border-[#CD9C20]/40 font-extrabold cursor-pointer"
                >
                  Enviar p/ Fila KDS
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (builderItems.length === 0) return;
                    const directTicket: KdsQueueTicket = {
                      id: `direct_${Date.now()}`,
                      orderNumber: `#${erpState.nextOrderCounter}`,
                      orderName: builderOrderName.trim() || `Pedido #${erpState.nextOrderCounter}`,
                      orderDescription: builderOrderDesc.trim(),
                      channel: builderChannelType === 'IFOOD' ? 'iFood (Taxa 26,2%)' : 'Site (Sem Taxa)',
                      channelType: builderChannelType,
                      createdAt: Date.now(),
                      items: [...builderItems],
                    };
                    executeOrderDeduction(directTicket);
                  }}
                  className="py-3 px-4 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20] font-extrabold cursor-pointer"
                >
                  Dar Saída Imediata
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#CD9C20]/30 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 uppercase font-display">
                  Fila Ativa de Pedidos (KDS)
                </h3>
                <p className="text-xs text-slate-500">
                  Altere o <strong>nome, descrição e canal (Site 0% ou iFood 26,2%)</strong> antes de dar saída no estoque.
                </p>
              </div>
            </div>

            {erpState.kdsQueue.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Nenhum pedido pendente na fila. Lance um pedido ao lado para testar!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {erpState.kdsQueue.map((ticket) => {
                  const breakdown = aggregateOrderIngredients(ticket.items);
                  const totalCmv = breakdown.reduce((acc, b) => acc + b.cost, 0);
                  const isIfood = (ticket.channelType || detectChannelType(ticket.channel)) === 'IFOOD';

                  return (
                    <div
                      key={ticket.id}
                      className="bg-[#F8F6F0] rounded-2xl p-4 border border-[#CD9C20]/40 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span
                              className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                                isIfood
                                  ? 'bg-[#161616] text-[#F5CB5C]'
                                  : 'bg-emerald-700 text-white'
                              }`}
                            >
                              {ticket.orderNumber} • {isIfood ? 'iFood (26,2%)' : 'Site (0% Taxa)'}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900 mt-1">
                              {ticket.orderName}
                            </h4>
                            {ticket.orderDescription && (
                              <p className="text-xs text-slate-600 italic mt-0.5 bg-white p-2 rounded-lg border border-slate-200">
                                &ldquo;{ticket.orderDescription}&rdquo;
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditKdsTicketModal(ticket)}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 border border-[#CD9C20]/40 text-[11px] font-bold flex items-center gap-1 shrink-0 cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3 text-[#CD9C20]" />
                            <span>Editar</span>
                          </button>
                        </div>

                        <div className="bg-white p-2.5 rounded-xl border border-slate-200 space-y-1">
                          {ticket.items.map((ti, idx) => {
                            const rec = erpState.recipes.find((r) => r.id === ti.recipeId);
                            return rec ? (
                              <div key={idx} className="text-xs font-extrabold text-slate-900">
                                • {ti.qty}x {rec.name}
                              </div>
                            ) : null;
                          })}
                          <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex justify-between">
                            <span>Custo CMV a descontar:</span>
                            <strong className="font-mono text-slate-900">{formatBRL(totalCmv)}</strong>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => executeOrderDeduction(ticket)}
                        className="w-full py-3 px-4 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                      >
                        <Flame className="w-4 h-4 text-[#CD9C20]" />
                        <span>Dar Saída &amp; Descontar Estoque</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ABA 5: RELATÓRIOS FINANCEIROS SEPARANDO SITE (0%) VS IFOOD (26,2%)        */}
      {/* ========================================================================= */}
      {activeTab === 'relatorios' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-[#CD9C20]/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 uppercase font-display">
                Relatórios Financeiros: Compras Site (0%) vs. Compras iFood (26,2%)
              </h3>
              <p className="text-xs text-slate-500">
                Auditoria separada por canal mostrando receita, comissão de 26,2% exclusiva do iFood, CMV abatido e lucro líquido real.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#F8F6F0] p-1.5 rounded-xl border border-[#CD9C20]/30">
              {[
                { id: 'DAILY', label: 'Hoje (Diário)' },
                { id: 'WEEKLY', label: '7 Dias (Semanal)' },
                { id: 'MONTHLY', label: '30 Dias (Mensal)' },
                { id: 'YEARLY', label: 'Tudo (Histórico)' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectReportPeriod(p.id as ReportPeriod)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    reportPeriod === p.id
                      ? 'bg-[#161616] text-[#F5CB5C] border border-[#CD9C20]'
                      : 'text-slate-600 hover:text-black'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#CD9C20]/30 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Receita Bruta Geral</span>
              <p className="text-2xl font-black text-slate-900 mt-1 font-mono">
                {formatBRL(periodStats.totalRevenue)}
              </p>
              <span className="text-[11px] text-slate-500">
                Site: {formatBRL(periodStats.siteRevenue)} | iFood: {formatBRL(periodStats.ifoodRevenue)}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#CD9C20]/30 shadow-xs">
              <span className="text-xs font-bold text-amber-700 uppercase">Taxa iFood (26,2%)</span>
              <p className="text-2xl font-black text-amber-700 mt-1 font-mono">
                -{formatBRL(periodStats.ifoodFeeTotal)}
              </p>
              <span className="text-[11px] text-slate-500">
                Cobrada apenas nas {periodStats.ifoodSalesCount} vendas do iFood
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-[#CD9C20]/30 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase">Gasto de Insumos (CMV)</span>
              <p className="text-2xl font-black text-slate-800 mt-1 font-mono">
                -{formatBRL(periodStats.totalCost)}
              </p>
              <span className="text-[11px] text-slate-500">
                Site: {formatBRL(periodStats.siteCost)} | iFood: {formatBRL(periodStats.ifoodCost)}
              </span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-xs">
              <span className="text-xs font-bold text-emerald-700 uppercase">Lucro Líquido Real</span>
              <p className="text-2xl font-black text-emerald-700 mt-1 font-mono">
                {formatBRL(periodStats.netProfit)}
              </p>
              <span className="text-[11px] text-emerald-700 font-bold">
                Site: {formatBRL(periodStats.siteProfit)} + iFood: {formatBRL(periodStats.ifoodProfit)}
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-[#CD9C20]/30 p-5 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 uppercase">
              Histórico Detalhado de Vendas &amp; Baixas (Site vs. iFood)
            </h4>
            <div className="space-y-2.5 max-h-96 overflow-y-auto">
              {filteredLogs.map((log) => {
                const isIfood = (log.channelType || detectChannelType(log.channel)) === 'IFOOD';
                const fee = isIfood
                  ? log.ifoodFee !== undefined
                    ? log.ifoodFee
                    : Math.round(log.revenue * IFOOD_FEE_RATE * 100) / 100
                  : 0;
                const netP = log.netProfit !== undefined ? log.netProfit : log.revenue - fee - log.totalCost;

                return (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-xl bg-[#F8F6F0] border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            isIfood ? 'bg-[#161616] text-[#F5CB5C]' : 'bg-emerald-700 text-white'
                          }`}
                        >
                          {isIfood ? 'iFood (Taxa 26,2%)' : 'Site (0% Taxa)'}
                        </span>
                        <p className="font-extrabold text-slate-900">
                          {log.orderName}{' '}
                          <span className="text-slate-400 font-mono">
                            ({log.salesCount || 1} {(log.salesCount || 1) === 1 ? 'venda' : 'vendas'})
                          </span>
                        </p>
                      </div>
                      {log.orderDescription && (
                        <p className="text-slate-600 italic text-[11px] mt-0.5">{log.orderDescription}</p>
                      )}
                      <p className="text-slate-500 text-[11px] mt-0.5">{log.itemsSummary}</p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5 font-mono">
                      <span className="font-bold text-slate-900 block">
                        Bruto: {formatBRL(log.revenue)}
                      </span>
                      {isIfood && (
                        <span className="text-amber-700 text-[11px] block">
                          Taxa iFood (26,2%): -{formatBRL(fee)}
                        </span>
                      )}
                      <span className="text-slate-600 text-[11px] block">
                        CMV: -{formatBRL(log.totalCost)}
                      </span>
                      <span className="font-extrabold text-emerald-700 text-xs block">
                        Lucro Real: {formatBRL(netP)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: EDITAR NOME, DESCRIÇÃO, PREÇO E FICHA TÉCNICA DO PRODUTO         */}
      {/* ========================================================================= */}
      {editingRecipe && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-[#CD9C20]/40 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-[#161616] text-white px-6 py-4 flex items-center justify-between border-b border-[#CD9C20]/40">
              <h3 className="font-display font-bold text-base text-[#F5CB5C] uppercase">
                {editingRecipe.id ? `Editar Produto / Pedido: ${editingRecipe.name}` : 'Novo Produto & Ficha Técnica'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingRecipe(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRecipeModal} className="p-6 space-y-4 overflow-y-auto flex-1 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Nome do Produto / Pedido *
                  </label>
                  <input
                    type="text"
                    required
                    value={recFormName}
                    onChange={(e) => setRecFormName(e.target.value)}
                    placeholder="Ex: Zeus (Trono do Olimpo)"
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold text-slate-900 outline-none focus:border-[#CD9C20]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 uppercase mb-1">
                    Preço de Venda Site (R$) *
                  </label>
                  <input
                    type="text"
                    required
                    value={recFormPrice}
                    onChange={(e) => setRecFormPrice(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F0] border border-slate-300 font-extrabold text-emerald-800 outline-none focus:border-[#CD9C20]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Descrição Completa do Pedido / Produto
                </label>
                <textarea
                  rows={2}
                  value={recFormDesc}
                  onChange={(e) => setRecFormDesc(e.target.value)}
                  placeholder="Descreva os ingredientes e detalhes do produto..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 text-slate-800 outline-none focus:border-[#CD9C20]"
                />
              </div>

              <div className="bg-[#F8F6F0] p-4 rounded-2xl border border-[#CD9C20]/30 space-y-3">
                <label className="block font-bold text-slate-800 uppercase">
                  Ingredientes da Ficha Técnica (Calcula o CMV Automaticamente)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <select
                    value={draftIngId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setDraftIngId(id);
                      const ing = erpState.ingredients.find((i) => i.id === id);
                      if (ing) {
                        setDraftIngUnit(
                          ing.baseType === 'mass' ? 'g' : ing.baseType === 'volume' ? 'ml' : 'un'
                        );
                      }
                    }}
                    className="sm:col-span-6 px-3 py-2 rounded-xl bg-white border border-slate-300 font-semibold"
                  >
                    {erpState.ingredients.map((i) => (
                      <option key={i.id} value={i.id}>
                        {i.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={draftIngQty}
                    onChange={(e) => setDraftIngQty(e.target.value)}
                    placeholder="Qtd"
                    className="sm:col-span-3 px-3 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                  />
                  <select
                    value={draftIngUnit}
                    onChange={(e) => setDraftIngUnit(e.target.value as DisplayUnit)}
                    className="sm:col-span-2 px-2 py-2 rounded-xl bg-white border border-slate-300 font-bold"
                  >
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="L">L</option>
                    <option value="un">un</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const q = parseFloat(draftIngQty) || 0;
                      if (q <= 0) return;
                      const exists = recFormItems.some((i) => i.ingredientId === draftIngId);
                      if (exists) {
                        setRecFormItems(
                          recFormItems.map((i) =>
                            i.ingredientId === draftIngId ? { ...i, qty: q, unit: draftIngUnit } : i
                          )
                        );
                      } else {
                        setRecFormItems([
                          ...recFormItems,
                          { ingredientId: draftIngId, qty: q, unit: draftIngUnit },
                        ]);
                      }
                    }}
                    className="sm:col-span-1 py-2 rounded-xl bg-[#161616] text-[#F5CB5C] font-bold cursor-pointer"
                  >
                    +
                  </button>
                </div>

                <div className="divide-y divide-slate-200 bg-white rounded-xl p-3 border border-slate-200 max-h-44 overflow-y-auto">
                  {recFormItems.map((it, idx) => {
                    const ing = erpState.ingredients.find((i) => i.id === it.ingredientId);
                    if (!ing) return null;
                    const cost = toBaseAmount(it.qty, it.unit) * ing.costPerBase;
                    return (
                      <div key={idx} className="py-1.5 flex items-center justify-between">
                        <span className="font-bold text-slate-800">
                          {ing.name} ({it.qty} {it.unit})
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-slate-600">{formatBRL(cost)}</span>
                          <button
                            type="button"
                            onClick={() =>
                              setRecFormItems(recFormItems.filter((_, i) => i !== idx))
                            }
                            className="text-slate-400 hover:text-slate-900 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingRecipe(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#161616] hover:bg-black text-[#F5CB5C] border border-[#CD9C20] font-bold cursor-pointer"
                >
                  Salvar Nome, Descrição &amp; Ficha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: EDITAR NOME, DESCRIÇÃO E CANAL DO PEDIDO NO KDS                  */}
      {/* ========================================================================= */}
      {editingKdsTicket && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#CD9C20]/40 shadow-2xl overflow-hidden">
            <div className="bg-[#161616] text-white px-6 py-4 flex items-center justify-between border-b border-[#CD9C20]/40">
              <h3 className="font-display font-bold text-sm text-[#F5CB5C] uppercase">
                Editar Pedido ({editingKdsTicket.orderNumber})
              </h3>
              <button
                type="button"
                onClick={() => setEditingKdsTicket(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveKdsTicketEdit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Canal da Compra
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditTicketChannelType('SITE')}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                      editTicketChannelType === 'SITE'
                        ? 'bg-emerald-700 text-white border-emerald-700'
                        : 'bg-[#F8F6F0] text-slate-700 border-slate-200'
                    }`}
                  >
                    Site (0% Taxa)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditTicketChannelType('IFOOD')}
                    className={`py-2 px-3 rounded-xl font-bold border cursor-pointer ${
                      editTicketChannelType === 'IFOOD'
                        ? 'bg-[#161616] text-[#F5CB5C] border-[#CD9C20]'
                        : 'bg-[#F8F6F0] text-slate-700 border-slate-200'
                    }`}
                  >
                    iFood (26,2% Taxa)
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Nome do Pedido / Identificação do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={editTicketName}
                  onChange={(e) => setEditTicketName(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold text-slate-900 outline-none focus:border-[#CD9C20]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Descrição / Observações do Pedido
                </label>
                <textarea
                  rows={3}
                  value={editTicketDesc}
                  onChange={(e) => setEditTicketDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 text-slate-800 outline-none focus:border-[#CD9C20]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingKdsTicket(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#161616] text-[#F5CB5C] border border-[#CD9C20] font-bold cursor-pointer"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CADASTRAR / EDITAR INSUMO                                        */}
      {/* ========================================================================= */}
      {editingIng && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl border border-[#CD9C20]/40 shadow-2xl overflow-hidden">
            <div className="bg-[#161616] text-white px-6 py-4 flex items-center justify-between border-b border-[#CD9C20]/40">
              <h3 className="font-display font-bold text-sm text-[#F5CB5C] uppercase">
                {editingIng.id ? 'Editar Insumo do Estoque' : 'Cadastrar Novo Insumo'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingIng(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nome do Insumo *</label>
                  <input
                    type="text"
                    required
                    value={ingName}
                    onChange={(e) => setIngName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidade Principal *</label>
                  <select
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value as DisplayUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold"
                  >
                    <option value="kg">Quilo (kg)</option>
                    <option value="g">Grama (g)</option>
                    <option value="L">Litro (L)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="un">Unidade (un)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Saldo em Estoque *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={ingStock}
                    onChange={(e) => setIngStock(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Alerta Mínimo *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={ingMin}
                    onChange={(e) => setIngMin(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold"
                  />
                </div>
              </div>

              <div className="bg-[#F8F6F0] p-3.5 rounded-xl border border-[#CD9C20]/30 space-y-2">
                <span className="text-[10px] font-bold uppercase text-slate-600 block">
                  Calculadora Opcional de Pacote / Fardo
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    step="0.01"
                    value={ingPackPrice}
                    onChange={(e) => {
                      const p = e.target.value;
                      setIngPackPrice(p);
                      const pv = parseFloat(p) || 0;
                      const qv = parseFloat(ingPackQty) || 0;
                      if (pv > 0 && qv > 0) setIngUnitCost((pv / qv).toFixed(4));
                    }}
                    placeholder="Preço Pago no Pacote (R$)"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200"
                  />
                  <input
                    type="number"
                    step="0.001"
                    value={ingPackQty}
                    onChange={(e) => {
                      const q = e.target.value;
                      setIngPackQty(q);
                      const pv = parseFloat(ingPackPrice) || 0;
                      const qv = parseFloat(q) || 0;
                      if (pv > 0 && qv > 0) setIngUnitCost((pv / qv).toFixed(4));
                    }}
                    placeholder="Qtd no Pacote"
                    className="px-3 py-1.5 rounded-lg bg-white border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Custo por {ingUnit} (R$) *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  required
                  value={ingUnitCost}
                  onChange={(e) => setIngUnitCost(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-extrabold text-emerald-800"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingIng(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#161616] text-[#F5CB5C] border border-[#CD9C20] font-bold cursor-pointer"
                >
                  Salvar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: REPOR ESTOQUE                                                    */}
      {/* ========================================================================= */}
      {restockTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl border border-[#CD9C20]/40 shadow-2xl overflow-hidden">
            <div className="bg-[#161616] text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-display font-bold text-sm text-[#F5CB5C] uppercase">
                Repor Estoque: {restockTarget.name}
              </h3>
              <button
                type="button"
                onClick={() => setRestockTarget(null)}
                className="text-neutral-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleConfirmRestock} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Quantidade a Somar *</label>
                  <input
                    type="number"
                    step="0.001"
                    required
                    value={restockQty}
                    onChange={(e) => setRestockQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unidade</label>
                  <select
                    value={restockUnit}
                    onChange={(e) => setRestockUnit(e.target.value as DisplayUnit)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F8F6F0] border border-slate-300 font-bold"
                  >
                    {restockTarget.baseType === 'mass' && (
                      <>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </>
                    )}
                    {restockTarget.baseType === 'volume' && (
                      <>
                        <option value="L">L</option>
                        <option value="ml">ml</option>
                      </>
                    )}
                    {restockTarget.baseType === 'unit' && <option value="un">un</option>}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockTarget(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold cursor-pointer"
                >
                  Somar ao Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
