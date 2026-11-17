'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  Percent,
  TrendingUp,
  TrendingDown,
  Calculator,
  Layers,
  UtensilsCrossed,
  ShoppingBag,
  PackageCheck,
  Building2,
  Receipt,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Flame,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Bike,
  Store,
  FileSpreadsheet,
} from 'lucide-react';
import { SpartanHelmetIcon } from '@/components/GreekOrnament';
import { MENU_ITEMS } from '@/lib/data';

export interface InsumoItem {
  id: string;
  nome: string;
  categoria: string;
  und: 'un' | 'g' | 'kg' | 'ml' | 'l';
  preco: number;
  qtd: number;
  custoUnit: number;
}

export interface FichaIngrediente {
  id: string;
  insumoId: string;
  nome: string;
  und: string;
  qtd: number;
  custo: number;
}

export interface FichaTecnica {
  id: string;
  nome: string;
  categoria: string;
  itens: FichaIngrediente[];
  custoTotal: number;
}

export interface ComboItem {
  id: string;
  nome: string;
  fichas: Array<{ id: string; fichaId: string; nome: string; custo: number }>;
  custoTotal: number;
  margem: number;
  taxa: number;
  precoSugerido: number;
  precoReal: number;
  lucroReal: number;
  lucroPerc: number;
}

export interface FixedCostsState {
  aluguel: number;
  energia: number;
  salarios: number;
  manutencao: number;
  outros: number;
  faturamento: number;
  percentual: number;
}

// Initial Realistic Seed Data for Teseu Burger
const INITIAL_FIXED_COSTS: FixedCostsState = {
  aluguel: 3800,
  energia: 1650,
  salarios: 9200,
  manutencao: 1100,
  outros: 1250,
  faturamento: 52000,
  percentual: 32.69,
};

const INITIAL_INSUMOS: InsumoItem[] = [
  { id: 'ins-1', nome: 'Pão Brioche Artesanal Selado', categoria: 'Pães', und: 'un', preco: 45.0, qtd: 30, custoUnit: 1.5 },
  { id: 'ins-2', nome: 'Blend Bovino Nobre Angus', categoria: 'Carnes', und: 'g', preco: 190.0, qtd: 5000, custoUnit: 0.038 },
  { id: 'ins-3', nome: 'Fatias de Queijo Cheddar Inglês', categoria: 'Queijos', und: 'g', preco: 65.0, qtd: 1000, custoUnit: 0.065 },
  { id: 'ins-4', nome: 'Queijo Provolone Nobre', categoria: 'Queijos', und: 'g', preco: 72.0, qtd: 1000, custoUnit: 0.072 },
  { id: 'ins-5', nome: 'Bacon Defumado em Fatias', categoria: 'Toppings', und: 'g', preco: 54.0, qtd: 1000, custoUnit: 0.054 },
  { id: 'ins-6', nome: 'Cebola Caramelizada Especial', categoria: 'Toppings', und: 'g', preco: 28.0, qtd: 1000, custoUnit: 0.028 },
  { id: 'ins-7', nome: 'Crispy de Alho-Poró Dourado', categoria: 'Toppings', und: 'g', preco: 38.0, qtd: 500, custoUnit: 0.076 },
  { id: 'ins-8', nome: 'Maionese Defumada da Casa', categoria: 'Molhos', und: 'ml', preco: 36.0, qtd: 2000, custoUnit: 0.018 },
  { id: 'ins-9', nome: 'Maionese de Alho Artesanal', categoria: 'Molhos', und: 'ml', preco: 34.0, qtd: 2000, custoUnit: 0.017 },
  { id: 'ins-10', nome: 'Embalagem Térmica Kraft Teseu', categoria: 'Embalagens', und: 'un', preco: 98.0, qtd: 100, custoUnit: 0.98 },
  { id: 'ins-11', nome: 'Papel Acoplado Antigordura', categoria: 'Embalagens', und: 'un', preco: 44.0, qtd: 500, custoUnit: 0.088 },
  { id: 'ins-12', nome: 'Batata Especial Pré-Frita', categoria: 'Acompanhamentos', und: 'g', preco: 33.0, qtd: 2500, custoUnit: 0.0132 },
  { id: 'ins-13', nome: 'Cookie Artesanal Brinde VIP', categoria: 'Sobremesas', und: 'un', preco: 50.0, qtd: 20, custoUnit: 2.5 },
];

const INITIAL_FICHAS: FichaTecnica[] = [
  {
    id: 'ficha-zeus',
    nome: 'Hambúrguer ZEUS (Trono do Olimpo)',
    categoria: 'Hambúrgueres',
    itens: [
      { id: 'item-1', insumoId: 'ins-1', nome: 'Pão Brioche Artesanal Selado', und: 'un', qtd: 1, custo: 1.5 },
      { id: 'item-2', insumoId: 'ins-2', nome: 'Blend Bovino Nobre Angus', und: 'g', qtd: 160, custo: 6.08 },
      { id: 'item-3', insumoId: 'ins-3', nome: 'Fatias de Queijo Cheddar Inglês', und: 'g', qtd: 40, custo: 2.6 },
      { id: 'item-4', insumoId: 'ins-5', nome: 'Bacon Defumado em Fatias', und: 'g', qtd: 30, custo: 1.62 },
      { id: 'item-5', insumoId: 'ins-6', nome: 'Cebola Caramelizada Especial', und: 'g', qtd: 30, custo: 0.84 },
      { id: 'item-6', insumoId: 'ins-8', nome: 'Maionese Defumada da Casa', und: 'ml', qtd: 30, custo: 0.54 },
      { id: 'item-7', insumoId: 'ins-10', nome: 'Embalagem Térmica Kraft Teseu', und: 'un', qtd: 1, custo: 0.98 },
      { id: 'item-8', insumoId: 'ins-11', nome: 'Papel Acoplado Antigordura', und: 'un', qtd: 1, custo: 0.09 },
    ],
    custoTotal: 14.25,
  },
  {
    id: 'ficha-atena',
    nome: 'Hambúrguer ATENA (Crispy Alho-Poró)',
    categoria: 'Hambúrgueres',
    itens: [
      { id: 'item-1', insumoId: 'ins-1', nome: 'Pão Brioche Artesanal Selado', und: 'un', qtd: 1, custo: 1.5 },
      { id: 'item-2', insumoId: 'ins-2', nome: 'Blend Bovino Nobre Angus', und: 'g', qtd: 160, custo: 6.08 },
      { id: 'item-3', insumoId: 'ins-4', nome: 'Queijo Provolone Nobre', und: 'g', qtd: 40, custo: 2.88 },
      { id: 'item-4', insumoId: 'ins-7', nome: 'Crispy de Alho-Poró Dourado', und: 'g', qtd: 20, custo: 1.52 },
      { id: 'item-5', insumoId: 'ins-9', nome: 'Maionese de Alho Artesanal', und: 'ml', qtd: 30, custo: 0.51 },
      { id: 'item-6', insumoId: 'ins-10', nome: 'Embalagem Térmica Kraft Teseu', und: 'un', qtd: 1, custo: 0.98 },
      { id: 'item-7', insumoId: 'ins-11', nome: 'Papel Acoplado Antigordura', und: 'un', qtd: 1, custo: 0.09 },
    ],
    custoTotal: 14.56,
  },
  {
    id: 'ficha-fritas',
    nome: 'Batatas Espartanas (Porção Média 180g)',
    categoria: 'Acompanhamentos',
    itens: [
      { id: 'item-1', insumoId: 'ins-12', nome: 'Batata Especial Pré-Frita', und: 'g', qtd: 180, custo: 2.38 },
      { id: 'item-2', insumoId: 'ins-8', nome: 'Maionese Defumada da Casa', und: 'ml', qtd: 30, custo: 0.54 },
      { id: 'item-3', insumoId: 'ins-10', nome: 'Embalagem Térmica Kraft Teseu', und: 'un', qtd: 1, custo: 0.98 },
    ],
    custoTotal: 3.9,
  },
];

const INITIAL_COMBOS: ComboItem[] = [
  {
    id: 'combo-zeus-completo',
    nome: 'Combo Zeus Olimpo (Burger + Fritas + Refri)',
    fichas: [
      { id: 'c1', fichaId: 'ficha-zeus', nome: 'Hambúrguer ZEUS', custo: 14.25 },
      { id: 'c2', fichaId: 'ficha-fritas', nome: 'Batatas Espartanas (Média)', custo: 3.9 },
    ],
    custoTotal: 18.15,
    margem: 25,
    taxa: 12,
    precoSugerido: 60.0,
    precoReal: 54.9,
    lucroReal: 12.24,
    lucroPerc: 22.3,
  },
  {
    id: 'combo-casal-deuses',
    nome: 'Combo Casal dos Deuses (2 Burgers + 2 Fritas + Doce)',
    fichas: [
      { id: 'c3', fichaId: 'ficha-zeus', nome: 'Hambúrguer ZEUS (Burger 1)', custo: 14.25 },
      { id: 'c4', fichaId: 'ficha-atena', nome: 'Hambúrguer ATENA (Burger 2)', custo: 14.56 },
      { id: 'c5', fichaId: 'ficha-fritas', nome: 'Batatas Espartanas Casal', custo: 7.8 },
    ],
    custoTotal: 36.61,
    margem: 25,
    taxa: 10,
    precoSugerido: 113.3,
    precoReal: 99.9,
    lucroReal: 20.65,
    lucroPerc: 20.67,
  },
];

type FinancialSubTab = 'erp_unificado' | 'overview' | 'custos' | 'insumos' | 'fichas' | 'combos' | 'ifood';

export function FinancialEngineeringHub() {
  const [subTab, setSubTab] = useState<FinancialSubTab>('erp_unificado');

  // Persistence State with Lazy Initializers
  const [fixedCosts, setFixedCosts] = useState<FixedCostsState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('teseu_financial_hub_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fixedCosts) return parsed.fixedCosts;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_FIXED_COSTS;
  });

  const [insumos, setInsumos] = useState<InsumoItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('teseu_financial_hub_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.insumos && parsed.insumos.length > 0) return parsed.insumos;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_INSUMOS;
  });

  const [fichas, setFichas] = useState<FichaTecnica[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('teseu_financial_hub_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.fichas && parsed.fichas.length > 0) return parsed.fichas;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_FICHAS;
  });

  const [combos, setCombos] = useState<ComboItem[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('teseu_financial_hub_v1');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.combos && parsed.combos.length > 0) return parsed.combos;
        }
      } catch {
        // fallback
      }
    }
    return INITIAL_COMBOS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save changes
  const saveAll = (
    newFC: FixedCostsState = fixedCosts,
    newIns: InsumoItem[] = insumos,
    newFic: FichaTecnica[] = fichas,
    newComb: ComboItem[] = combos
  ) => {
    try {
      localStorage.setItem(
        'teseu_financial_hub_v1',
        JSON.stringify({
          fixedCosts: newFC,
          insumos: newIns,
          fichas: newFic,
          combos: newComb,
        })
      );
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  };

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ----------------------------------------------------
  // SUB-TAB 1: CUSTOS FIXOS STATE & HANDLERS
  // ----------------------------------------------------
  const [cfAluguel, setCfAluguel] = useState(fixedCosts.aluguel.toString());
  const [cfEnergia, setCfEnergia] = useState(fixedCosts.energia.toString());
  const [cfSalarios, setCfSalarios] = useState(fixedCosts.salarios.toString());
  const [cfManutencao, setCfManutencao] = useState(fixedCosts.manutencao.toString());
  const [cfOutros, setCfOutros] = useState(fixedCosts.outros.toString());
  const [cfFaturamento, setCfFaturamento] = useState(fixedCosts.faturamento.toString());

  const totalDespesasFixas = useMemo(() => {
    const a = parseFloat(cfAluguel) || 0;
    const e = parseFloat(cfEnergia) || 0;
    const s = parseFloat(cfSalarios) || 0;
    const m = parseFloat(cfManutencao) || 0;
    const o = parseFloat(cfOutros) || 0;
    return a + e + s + m + o;
  }, [cfAluguel, cfEnergia, cfSalarios, cfManutencao, cfOutros]);

  const percentualCustoFixo = useMemo(() => {
    const fat = parseFloat(cfFaturamento) || 1;
    if (fat <= 0) return 0;
    return (totalDespesasFixas / fat) * 100;
  }, [totalDespesasFixas, cfFaturamento]);

  const handleSaveFixedCosts = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: FixedCostsState = {
      aluguel: parseFloat(cfAluguel) || 0,
      energia: parseFloat(cfEnergia) || 0,
      salarios: parseFloat(cfSalarios) || 0,
      manutencao: parseFloat(cfManutencao) || 0,
      outros: parseFloat(cfOutros) || 0,
      faturamento: parseFloat(cfFaturamento) || 1,
      percentual: percentualCustoFixo,
    };
    setFixedCosts(updated);

    // Recalculate all combos with new fixed costs rateio
    const updatedCombos = combos.map((c) => {
      const dedutores = (c.margem + c.taxa + percentualCustoFixo) / 100;
      const precoSugerido = dedutores < 1 && dedutores >= 0 ? c.custoTotal / (1 - dedutores) : 0;
      const deducoesValor = c.precoReal * ((c.taxa + percentualCustoFixo) / 100);
      const lucroReal = c.precoReal - c.custoTotal - deducoesValor;
      const lucroPerc = c.precoReal > 0 ? (lucroReal / c.precoReal) * 100 : 0;
      return { ...c, precoSugerido, lucroReal, lucroPerc };
    });
    setCombos(updatedCombos);

    saveAll(updated, insumos, fichas, updatedCombos);
    notify('Custos Fixos salvos e rateio recalculado com sucesso!');
  };

  // ----------------------------------------------------
  // SUB-TAB 2: INSUMOS STATE & HANDLERS
  // ----------------------------------------------------
  const [insNome, setInsNome] = useState('');
  const [insCategoria, setInsCategoria] = useState('Carnes');
  const [insUnd, setInsUnd] = useState<'un' | 'g' | 'kg' | 'ml' | 'l'>('un');
  const [insPreco, setInsPreco] = useState('');
  const [insQtd, setInsQtd] = useState('');
  const [insumoFilter, setInsumoFilter] = useState('');

  const calculatedCustoUnit = useMemo(() => {
    const p = parseFloat(insPreco) || 0;
    const q = parseFloat(insQtd) || 1;
    return q > 0 ? p / q : 0;
  }, [insPreco, insQtd]);

  const handleAddInsumo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!insNome.trim()) {
      notify('Informe o nome do insumo.');
      return;
    }
    const p = parseFloat(insPreco) || 0;
    const q = parseFloat(insQtd) || 0;
    if (p <= 0 || q <= 0) {
      notify('Informe o preço do pacote e a quantidade contida válidos.');
      return;
    }

    const newItem: InsumoItem = {
      id: `ins-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: insNome.trim(),
      categoria: insCategoria,
      und: insUnd,
      preco: p,
      qtd: q,
      custoUnit: p / q,
    };

    const updated = [newItem, ...insumos];
    setInsumos(updated);
    saveAll(fixedCosts, updated, fichas, combos);

    setInsNome('');
    setInsPreco('');
    setInsQtd('');
    notify(`Insumo "${newItem.nome}" adicionado com sucesso!`);
  };

  const handleDeleteInsumo = (id: string) => {
    const updated = insumos.filter((i) => i.id !== id);
    setInsumos(updated);
    saveAll(fixedCosts, updated, fichas, combos);
    notify('Insumo removido.');
  };

  // ----------------------------------------------------
  // SUB-TAB 3: FICHAS TÉCNICAS (CMV) STATE & HANDLERS
  // ----------------------------------------------------
  const [fichaNome, setFichaNome] = useState('');
  const [fichaCategoria, setFichaCategoria] = useState('Hambúrgueres');
  const [selectedInsumoId, setSelectedInsumoId] = useState('');
  const [selectedInsumoQtd, setSelectedInsumoQtd] = useState('');
  const [tempFichaItens, setTempFichaItens] = useState<FichaIngrediente[]>([]);

  const tempFichaTotal = useMemo(() => {
    return tempFichaItens.reduce((sum, item) => sum + item.custo, 0);
  }, [tempFichaItens]);

  const handleAddInsumoToTempFicha = () => {
    if (!selectedInsumoId) {
      notify('Selecione um insumo da lista.');
      return;
    }
    const q = parseFloat(selectedInsumoQtd) || 0;
    if (q <= 0) {
      notify('Informe a quantidade utilizada na receita.');
      return;
    }

    const matched = insumos.find((i) => i.id === selectedInsumoId);
    if (!matched) return;

    const custo = matched.custoUnit * q;
    const newIng: FichaIngrediente = {
      id: `ing-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      insumoId: matched.id,
      nome: matched.nome,
      und: matched.und,
      qtd: q,
      custo,
    };

    setTempFichaItens([...tempFichaItens, newIng]);
    setSelectedInsumoQtd('');
  };

  const handleRemoveTempIngrediente = (index: number) => {
    const copy = [...tempFichaItens];
    copy.splice(index, 1);
    setTempFichaItens(copy);
  };

  const handleSaveFicha = () => {
    if (!fichaNome.trim()) {
      notify('Preencha o nome do produto/hambúrguer.');
      return;
    }
    if (tempFichaItens.length === 0) {
      notify('Adicione pelo menos 1 ingrediente à ficha técnica.');
      return;
    }

    const newFicha: FichaTecnica = {
      id: `ficha-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: fichaNome.trim(),
      categoria: fichaCategoria,
      itens: [...tempFichaItens],
      custoTotal: tempFichaTotal,
    };

    const updated = [newFicha, ...fichas];
    setFichas(updated);
    saveAll(fixedCosts, insumos, updated, combos);

    setFichaNome('');
    setTempFichaItens([]);
    notify(`Ficha Técnica "${newFicha.nome}" cadastrada com sucesso!`);
  };

  const handleDeleteFicha = (id: string) => {
    const updated = fichas.filter((f) => f.id !== id);
    setFichas(updated);
    saveAll(fixedCosts, insumos, updated, combos);
    notify('Ficha técnica excluída.');
  };

  // ----------------------------------------------------
  // SUB-TAB 4: COMBOS & MARKUP DIVISOR STATE & HANDLERS
  // ----------------------------------------------------
  const [comboNome, setComboNome] = useState('');
  const [selectedFichaForCombo, setSelectedFichaForCombo] = useState('');
  const [tempComboFichas, setTempComboFichas] = useState<
    Array<{ id: string; fichaId: string; nome: string; custo: number }>
  >([]);
  const [comboMargem, setComboMargem] = useState('25');
  const [comboTaxa, setComboTaxa] = useState('10');
  const [comboPrecoReal, setComboPrecoReal] = useState('');

  const tempComboCustoTotal = useMemo(() => {
    return tempComboFichas.reduce((sum, f) => sum + f.custo, 0);
  }, [tempComboFichas]);

  // Markup Divisor por Dentro:
  // Preço Sugerido = Custo / (1 - (Margem% + Taxas% + CustoFixo%) / 100)
  const tempComboPrecoSugerido = useMemo(() => {
    const m = parseFloat(comboMargem) || 0;
    const t = parseFloat(comboTaxa) || 0;
    const cf = fixedCosts.percentual || 0;
    const dedutores = (m + t + cf) / 100;

    if (dedutores >= 1) return 0;
    if (tempComboCustoTotal <= 0) return 0;
    return tempComboCustoTotal / (1 - dedutores);
  }, [tempComboCustoTotal, comboMargem, comboTaxa, fixedCosts.percentual]);

  // Real profit calculation for interactive simulation
  const tempComboSimulation = useMemo(() => {
    const pReal = parseFloat(comboPrecoReal) || 0;
    if (pReal <= 0 || tempComboCustoTotal <= 0) {
      return { lucroReais: 0, lucroPerc: 0, deducoes: 0 };
    }
    const t = parseFloat(comboTaxa) || 0;
    const cf = fixedCosts.percentual || 0;
    const deducoes = pReal * ((t + cf) / 100);
    const lucroReais = pReal - tempComboCustoTotal - deducoes;
    const lucroPerc = (lucroReais / pReal) * 100;

    return { lucroReais, lucroPerc, deducoes };
  }, [comboPrecoReal, tempComboCustoTotal, comboTaxa, fixedCosts.percentual]);

  const handleAddFichaToTempCombo = () => {
    if (!selectedFichaForCombo) {
      notify('Selecione uma ficha técnica.');
      return;
    }
    const matched = fichas.find((f) => f.id === selectedFichaForCombo);
    if (!matched) return;

    setTempComboFichas([
      ...tempComboFichas,
      {
        id: `cf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        fichaId: matched.id,
        nome: matched.nome,
        custo: matched.custoTotal,
      },
    ]);
  };

  const handleRemoveTempComboFicha = (index: number) => {
    const copy = [...tempComboFichas];
    copy.splice(index, 1);
    setTempComboFichas(copy);
  };

  const handleSaveCombo = () => {
    if (!comboNome.trim()) {
      notify('Informe o nome de venda do Combo ou Produto.');
      return;
    }
    if (tempComboFichas.length === 0) {
      notify('Adicione pelo menos 1 ficha ao combo.');
      return;
    }

    const m = parseFloat(comboMargem) || 0;
    const t = parseFloat(comboTaxa) || 0;
    const pReal = parseFloat(comboPrecoReal) || tempComboPrecoSugerido;

    const cf = fixedCosts.percentual || 0;
    const deducoes = pReal * ((t + cf) / 100);
    const lucroReal = pReal - tempComboCustoTotal - deducoes;
    const lucroPerc = pReal > 0 ? (lucroReal / pReal) * 100 : 0;

    const newCombo: ComboItem = {
      id: `combo-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      nome: comboNome.trim(),
      fichas: [...tempComboFichas],
      custoTotal: tempComboCustoTotal,
      margem: m,
      taxa: t,
      precoSugerido: tempComboPrecoSugerido,
      precoReal: pReal,
      lucroReal,
      lucroPerc,
    };

    const updated = [newCombo, ...combos];
    setCombos(updated);
    saveAll(fixedCosts, insumos, fichas, updated);

    setComboNome('');
    setTempComboFichas([]);
    setComboPrecoReal('');
    notify(`Produto/Combo "${newCombo.nome}" catalogado com sucesso!`);
  };

  const handleDeleteCombo = (id: string) => {
    const updated = combos.filter((c) => c.id !== id);
    setCombos(updated);
    saveAll(fixedCosts, insumos, fichas, updated);
    notify('Item de precificação removido.');
  };

  // ----------------------------------------------------
  // SUB-TAB 5: SIMULADOR ESPECIAL IFOOD (TAXA 26,2% / DIVISOR 0,738)
  // ----------------------------------------------------
  const [ifoodSelectedSource, setIfoodSelectedSource] = useState<string>('ficha-zeus');
  const [ifoodCustomCost, setIfoodCustomCost] = useState<string>('14.25');
  const [ifoodTargetMargin, setIfoodTargetMargin] = useState<string>('20');
  const [ifoodSellingPrice, setIfoodSellingPrice] = useState<string>('42.90');
  const [ifoodIncludeFixedCost, setIfoodIncludeFixedCost] = useState<boolean>(true);

  // Sync custom cost when selection changes
  const handleIfoodSourceChange = (val: string) => {
    setIfoodSelectedSource(val);
    if (val.startsWith('ficha-')) {
      const matched = fichas.find((f) => f.id === val);
      if (matched) {
        setIfoodCustomCost(matched.custoTotal.toFixed(2));
      }
    } else if (val.startsWith('menu-')) {
      const burgerId = val.replace('menu-', '');
      const matched = MENU_ITEMS.find((m) => m.id === burgerId);
      if (matched) {
        // approximate cost from burger price (e.g. 35% CMV if no exact cost)
        const approx = matched.price * 0.38;
        setIfoodCustomCost(approx.toFixed(2));
      }
    }
  };

  // Calculations for iFood:
  // Taxa padrão iFood: 26.2%
  // Fator divisor base: 1 - 0.262 = 0.738
  const ifoodCostValue = parseFloat(ifoodCustomCost) || 0;
  const ifoodMarginValue = parseFloat(ifoodTargetMargin) || 0;
  const ifoodSaleValue = parseFloat(ifoodSellingPrice) || 0;
  const ifoodCfRate = ifoodIncludeFixedCost ? fixedCosts.percentual : 0;

  // 1. Break-Even Price on iFood (Preço Mínimo para não ter prejuízo):
  // Custo / 0.738
  const ifoodBreakEvenPrice = useMemo(() => {
    if (ifoodCostValue <= 0) return 0;
    return ifoodCostValue / 0.738;
  }, [ifoodCostValue]);

  // 2. Suggested Price on iFood with Target Margin & Fixed Cost:
  // Preço = Custo / (0.738 - (Margem% + CustoFixo%) / 100)
  const ifoodSuggestedPrice = useMemo(() => {
    const dedutores = (ifoodMarginValue + ifoodCfRate) / 100;
    const divisor = 0.738 - dedutores;
    if (divisor <= 0 || ifoodCostValue <= 0) return 0;
    return ifoodCostValue / divisor;
  }, [ifoodCostValue, ifoodMarginValue, ifoodCfRate]);

  // 3. Real Simulation for the Practiced iFood Selling Price
  const ifoodRealBreakdown = useMemo(() => {
    if (ifoodSaleValue <= 0 || ifoodCostValue <= 0) {
      return {
        comissaoIfood: 0,
        repasseIfood: 0,
        custoProducao: 0,
        rateioFixo: 0,
        lucroLiquido: 0,
        margemReal: 0,
      };
    }
    const comissaoIfood = ifoodSaleValue * 0.262; // 26.2%
    const repasseIfood = ifoodSaleValue - comissaoIfood; // 73.8%
    const custoProducao = ifoodCostValue;
    const rateioFixo = ifoodSaleValue * (ifoodCfRate / 100);
    const lucroLiquido = repasseIfood - custoProducao - rateioFixo;
    const margemReal = (lucroLiquido / ifoodSaleValue) * 100;

    return {
      comissaoIfood,
      repasseIfood,
      custoProducao,
      rateioFixo,
      lucroLiquido,
      margemReal,
    };
  }, [ifoodSaleValue, ifoodCostValue, ifoodCfRate]);

  // Helper format currency
  const fmt = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-[#161616] text-[#F5CB5C] border-2 border-[#CD9C20] px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold text-white">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - Imperial Roman & Financial Engineering */}
      <div className="bg-gradient-to-r from-[#161616] via-[#221c11] to-[#161616] border border-[#CD9C20]/40 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-64 bg-radial from-[#CD9C20]/20 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full bg-[#CD9C20]/20 border border-[#CD9C20]/40 text-[#F5CB5C] text-[10px] font-black uppercase tracking-widest font-ancient">
                SISTEMA INTEGRADO DE PRECIFICAÇÃO & CMV
              </span>
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-neutral-300 text-[10px] font-mono">
                Markup Divisor por Dentro
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight flex items-center gap-2">
              <SpartanHelmetIcon size={24} color="#F5CB5C" />
              <span>Engenharia Financeira & Custos Teseu Burger</span>
            </h3>
            <p className="text-xs text-neutral-400 max-w-2xl mt-1 leading-relaxed">
              Controle absoluto de insumos, fichas técnicas com gramaturas exatas, taxa de rateio de custos fixos e simulador especializado com a taxa oficial do <strong>iFood (26,2% / divisor 0,738)</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right px-4 py-2 bg-black/40 rounded-xl border border-white/10">
              <span className="text-[10px] uppercase font-bold text-neutral-400 block">Rateio Fixo Atual</span>
              <span className="text-lg font-black text-[#F5CB5C] font-mono">
                {fixedCosts.percentual.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Tabs Navigation */}
        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap gap-2">
          {[
            { id: 'erp_unificado', label: 'ERP Unificado (KDS + Estoque + Precificação)', icon: Flame, badge: '5 Módulos' },
            { id: 'overview', label: 'Visão Geral & Indicadores', icon: TrendingUp },
            { id: 'custos', label: 'Custos Fixos & Rateio', icon: Building2 },
            { id: 'insumos', label: 'Insumos & Embalagens', icon: PackageCheck, count: insumos.length },
            { id: 'fichas', label: 'Fichas Técnicas (CMV)', icon: UtensilsCrossed, count: fichas.length },
            { id: 'combos', label: 'Combos & Precificação (Markup)', icon: Calculator, count: combos.length },
            { id: 'ifood', label: 'Simulador Especial iFood (26,2%)', icon: Bike, badge: '÷ 0,738' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setSubTab(tab.id as FinancialSubTab)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#CD9C20] text-black shadow-[0_0_15px_rgba(205,156,32,0.4)]'
                    : 'bg-white/5 hover:bg-white/15 text-neutral-300 border border-white/10'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-black' : 'text-[#F5CB5C]'}`} />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-black text-white' : 'bg-white/10 text-neutral-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
                {tab.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-extrabold ${
                      isActive ? 'bg-rose-950 text-rose-200' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
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
      {/* 0. SUB-TAB: ERP UNIFICADO (KDS + ESTOQUE INTELIGENTE + FICHAS + PRECIFICAÇÃO) */}
      {/* ========================================================================= */}
      {subTab === 'erp_unificado' && (
        <div className="space-y-4">
          <div className="bg-[#EFE5D2] border-2 border-[#C28D39] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#710912] block">
                ARQUITETURA SINGLE-FILE UNIFICADA • SISTEMA A + MÓDULO B
              </span>
              <h4 className="font-extrabold text-sm sm:text-base text-[#1A1615]">
                KDS Cozinha, Estoque Inteligente (g/kg/ml/L/un), Fichas Técnicas, Precificação & Relatórios
              </h4>
            </div>
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <a
                href="/erp/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#710912] hover:bg-[#58060d] text-white text-xs font-bold border border-[#C28D39] transition-colors"
              >
                Abrir em Tela Cheia
              </a>
              <a
                href="/erp/index.html"
                download="teseu-burger-erp-unificado.html"
                className="px-3.5 py-2 rounded-xl bg-[#1A1615] hover:bg-black text-[#C28D39] text-xs font-bold border border-[#C28D39] transition-colors"
              >
                Baixar index.html Único
              </a>
            </div>
          </div>

          <div className="w-full h-[860px] rounded-2xl overflow-hidden border-2 border-[#C28D39] shadow-lg bg-[#EFE5D2]">
            <iframe
              src="/erp/index.html"
              title="Teseu Burger — ERP Unificado"
              className="w-full h-full border-0"
            />
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: VISÃO GERAL & INDICADORES */}
      {/* ========================================================================= */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase text-slate-500">Custo Fixo Total / Mês</span>
                <Building2 className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">
                {fmt(fixedCosts.aluguel + fixedCosts.energia + fixedCosts.salarios + fixedCosts.manutencao + fixedCosts.outros)}
              </p>
              <span className="text-[11px] text-amber-700 font-bold block mt-1">
                {fixedCosts.percentual.toFixed(2)}% do faturamento médio
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase text-slate-500">Insumos Cadastrados</span>
                <PackageCheck className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{insumos.length}</p>
              <span className="text-[11px] text-slate-400 block mt-1">Com custos unitários fracionados</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase text-slate-500">Fichas Técnicas Ativas</span>
                <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{fichas.length}</p>
              <span className="text-[11px] text-slate-400 block mt-1">CMV calculado item a item</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase text-slate-500">Produtos / Combos</span>
                <Calculator className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-2xl font-black text-slate-900 font-mono">{combos.length}</p>
              <span className="text-[11px] text-purple-700 font-bold block mt-1">Precificados por Markup Divisor</span>
            </div>
          </div>

          {/* Quick Explanation of Formula */}
          <div className="bg-[#1C1C1C] text-white p-6 rounded-2xl border border-[#CD9C20]/40 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <SpartanHelmetIcon size={20} color="#F5CB5C" />
              <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#F5CB5C] font-display">
                Princípios de Precificação do Teseu Burger
              </h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed text-neutral-300">
              <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-[#F5CB5C]" />
                  1. Método Por Dentro (Markup Divisor)
                </p>
                <p className="text-neutral-400">
                  Diferente do markup simples (que aplica porcentagem sobre o custo e gera prejuízo em taxas), a margem por dentro garante o lucro real embutindo impostos e custos fixos:
                </p>
                <p className="p-2 bg-neutral-900 rounded font-mono text-[11px] text-[#F5CB5C]">
                  Preço = Custo ÷ (1 - (Margem% + Taxas% + CustoFixo%) / 100)
                </p>
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <Bike className="w-3.5 h-3.5 text-rose-400" />
                  2. Regra Especial iFood (Divisor 0,738)
                </p>
                <p className="text-neutral-400">
                  O iFood retém <strong>26,2%</strong> (23% comissão + 3,2% taxa de transação). Para empatar sem prejuízo (custo zero), o produto deve ser dividido pelo fator residual <code>(1 - 0,262 = 0,738)</code>:
                </p>
                <p className="p-2 bg-neutral-900 rounded font-mono text-[11px] text-rose-300">
                  Preço Mínimo iFood = Custo de Produção ÷ 0,738
                </p>
              </div>

              <div className="p-3.5 bg-black/40 rounded-xl border border-white/10 space-y-1.5">
                <p className="font-bold text-white flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  3. Simulação de Preço Real / Promocional
                </p>
                <p className="text-neutral-400">
                  Ao digitar qualquer preço de venda promocional, o sistema desconta insumos, taxas e rateio fixo, mostrando exatamente o lucro líquido em R$ e % que cai no caixa.
                </p>
                <p className="p-2 bg-neutral-900 rounded font-mono text-[11px] text-emerald-300">
                  Lucro = Preço - Custo - (Preço × (Taxas% + CustoFixo%))
                </p>
              </div>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-xs uppercase text-slate-800 mb-3 flex items-center justify-between">
                <span>Últimos Combos Precificados</span>
                <button
                  onClick={() => setSubTab('combos')}
                  className="text-amber-700 hover:text-amber-800 text-[11px] font-bold flex items-center gap-1"
                >
                  Novo Combo <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </h4>
              <div className="space-y-2.5">
                {combos.slice(0, 3).map((c) => (
                  <div key={c.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{c.nome}</p>
                      <p className="text-[11px] text-slate-400">Custo Direto: {fmt(c.custoTotal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-slate-900">{fmt(c.precoReal)}</p>
                      <span className="text-[10px] text-emerald-700 font-bold block">
                        Lucro: {fmt(c.lucroReal)} ({c.lucroPerc.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <h4 className="font-extrabold text-xs uppercase text-slate-800 mb-3 flex items-center justify-between">
                <span>Top Insumos Estratégicos</span>
                <button
                  onClick={() => setSubTab('insumos')}
                  className="text-amber-700 hover:text-amber-800 text-[11px] font-bold flex items-center gap-1"
                >
                  Ver Todos ({insumos.length}) <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </h4>
              <div className="space-y-2.5">
                {insumos.slice(0, 3).map((ins) => (
                  <div key={ins.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-900">{ins.nome}</p>
                      <span className="text-[10px] text-slate-400 uppercase font-mono">{ins.categoria}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-extrabold text-amber-700 font-mono">{fmt(ins.custoUnit)} / {ins.und}</p>
                      <span className="text-[10px] text-slate-400">Pct: {fmt(ins.preco)} ({ins.qtd} {ins.und})</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: CUSTOS FIXOS & RATEIO */}
      {/* ========================================================================= */}
      {subTab === 'custos' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 uppercase">
              Custos Fixos & Cálculo Automático de Rateio
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Informe as despesas mensais da hamburgueria e o faturamento médio. O sistema calcula instantaneamente a porcentagem exata que o custo fixo representa no negócio.
            </p>
          </div>

          <form onSubmit={handleSaveFixedCosts} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Aluguel & IPTU (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cfAluguel}
                    onChange={(e) => setCfAluguel(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Energia, Água & Internet (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cfEnergia}
                    onChange={(e) => setCfEnergia(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Salários & Encargos Equipe (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cfSalarios}
                    onChange={(e) => setCfSalarios(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Sistemas, Gás & Manutenção (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cfManutencao}
                    onChange={(e) => setCfManutencao(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Contabilidade & Outros Fixos (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-slate-400 font-bold">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={cfOutros}
                    onChange={(e) => setCfOutros(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-900 mb-1.5 flex items-center justify-between">
                  <span>Faturamento Médio Mensal (R$)</span>
                  <span className="text-[10px] text-amber-700 font-extrabold uppercase">Base de Cálculo</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs text-amber-700 font-black">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={cfFaturamento}
                    onChange={(e) => setCfFaturamento(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-amber-50 border border-amber-300 rounded-xl text-xs font-black text-amber-900 focus:outline-none focus:border-amber-500 shadow-xs"
                  />
                </div>
              </div>
            </div>

            {/* Live Calculation Display Box */}
            <div className="p-5 bg-gradient-to-r from-amber-50 via-amber-50/70 to-amber-100/50 rounded-2xl border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-amber-900 tracking-wider">
                  Resultado do Rateio Operacional
                </span>
                <p className="text-sm text-amber-800 mt-0.5">
                  Total de Despesas Fixas: <strong>{fmt(totalDespesasFixas)}</strong>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Cada produto vendido deverá absorver <strong>{percentualCustoFixo.toFixed(2)}%</strong> do seu valor para cobrir a estrutura.
                </p>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Taxa de Rateio Fixo</span>
                <p className="text-3xl font-black text-amber-900 font-mono">
                  {percentualCustoFixo.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="py-3 px-8 bg-[#CD9C20] hover:bg-[#b88916] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Salvar Custos & Atualizar Precificação</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: INSUMOS & EMBALAGENS */}
      {/* ========================================================================= */}
      {subTab === 'insumos' && (
        <div className="space-y-6">
          {/* Add Insumo Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="font-extrabold text-base text-slate-900 uppercase mb-1">
              Cadastrar Novo Insumo ou Embalagem
            </h3>
            <p className="text-xs text-slate-500 mb-5">
              Cadastre pães, blends de carne, queijos, bacon, molhos e embalagens informando o valor do pacote. O sistema calcula automaticamente o custo por grama, ml ou unidade.
            </p>

            <form onSubmit={handleAddInsumo} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
              <div className="lg:col-span-2">
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Nome do Insumo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Pão Brioche Artesanal"
                  value={insNome}
                  onChange={(e) => setInsNome(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Categoria
                </label>
                <select
                  value={insCategoria}
                  onChange={(e) => setInsCategoria(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="Pães">Pães</option>
                  <option value="Carnes">Carnes / Blends</option>
                  <option value="Queijos">Queijos</option>
                  <option value="Toppings">Toppings / Bacon</option>
                  <option value="Molhos">Molhos / Maionese</option>
                  <option value="Embalagens">Embalagens</option>
                  <option value="Acompanhamentos">Acompanhamentos</option>
                  <option value="Sobremesas">Sobremesas</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Unidade
                </label>
                <select
                  value={insUnd}
                  onChange={(e) => setInsUnd(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                >
                  <option value="un">Unidade (un)</option>
                  <option value="g">Gramas (g)</option>
                  <option value="kg">Quilos (kg)</option>
                  <option value="ml">Mililitros (ml)</option>
                  <option value="l">Litros (L)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Preço do Pacote (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Ex: 45.00"
                  value={insPreco}
                  onChange={(e) => setInsPreco(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-600 mb-1">
                  Qtd no Pacote ({insUnd})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder={insUnd === 'g' ? 'Ex: 5000' : 'Ex: 30'}
                  value={insQtd}
                  onChange={(e) => setInsQtd(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="sm:col-span-2 lg:col-span-6 flex items-center justify-between pt-2">
                <div className="text-xs text-slate-600">
                  Custo Unitário Calculado:{' '}
                  <span className="font-mono font-bold text-amber-700">
                    {fmt(calculatedCustoUnit)} por {insUnd}
                  </span>
                </div>
                <button
                  type="submit"
                  className="py-2.5 px-6 bg-[#CD9C20] hover:bg-[#b88916] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Adicionar Insumo</span>
                </button>
              </div>
            </form>
          </div>

          {/* Table of Insumos */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-extrabold text-xs uppercase text-slate-800 tracking-wider">
                Catálogo de Insumos & Custos Fracionados ({insumos.length})
              </h4>
              <input
                type="text"
                placeholder="Filtrar insumo..."
                value={insumoFilter}
                onChange={(e) => setInsumoFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:border-amber-500 w-48"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-slate-600 uppercase text-[10px] font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Insumo</th>
                    <th className="py-2.5 px-3">Categoria</th>
                    <th className="py-2.5 px-3">Unidade</th>
                    <th className="py-2.5 px-3">Preço / Pacote</th>
                    <th className="py-2.5 px-3">Custo Unitário</th>
                    <th className="py-2.5 px-3 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {insumos
                    .filter((i) =>
                      insumoFilter
                        ? i.nome.toLowerCase().includes(insumoFilter.toLowerCase()) ||
                          i.categoria.toLowerCase().includes(insumoFilter.toLowerCase())
                        : true
                    )
                    .map((ins) => (
                      <tr key={ins.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{ins.nome}</td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-semibold">
                            {ins.categoria}
                          </span>
                        </td>
                        <td className="py-3 px-3 uppercase font-mono font-bold text-slate-600">{ins.und}</td>
                        <td className="py-3 px-3 text-slate-600 font-mono">
                          {fmt(ins.preco)} <span className="text-[10px] text-slate-400">({ins.qtd} {ins.und})</span>
                        </td>
                        <td className="py-3 px-3 font-mono font-extrabold text-amber-700">
                          {fmt(ins.custoUnit)} <span className="text-[10px] text-slate-500">/{ins.und}</span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleDeleteInsumo(ins.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Excluir Insumo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. SUB-TAB: FICHAS TÉCNICAS (CMV) */}
      {/* ========================================================================= */}
      {subTab === 'fichas' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Creator Column */}
          <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 uppercase">
                Montar Ficha Técnica
              </h3>
              <p className="text-xs text-slate-500">
                Adicione os insumos para somar automaticamente o Custo Direto (CMV).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nome do Hambúrguer / Produto
              </label>
              <input
                type="text"
                placeholder="Ex: Hércules Duplo Bacon"
                value={fichaNome}
                onChange={(e) => setFichaNome(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Categoria
              </label>
              <select
                value={fichaCategoria}
                onChange={(e) => setFichaCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-amber-500"
              >
                <option value="Hambúrgueres">Hambúrgueres</option>
                <option value="Acompanhamentos">Acompanhamentos</option>
                <option value="Bebidas">Bebidas</option>
                <option value="Sobremesas">Sobremesas</option>
              </select>
            </div>

            {/* Insumo Picker */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-[11px] font-bold uppercase text-slate-700 block">
                Adicionar Ingrediente à Receita
              </span>
              <select
                value={selectedInsumoId}
                onChange={(e) => setSelectedInsumoId(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
              >
                <option value="">Selecione o insumo...</option>
                {insumos.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.nome} ({fmt(i.custoUnit)}/{i.und})
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  placeholder="Qtd usada (ex: 160)"
                  value={selectedInsumoQtd}
                  onChange={(e) => setSelectedInsumoQtd(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-800 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleAddInsumoToTempFicha}
                  className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* List of current composition */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold uppercase text-slate-500 block">
                Composição Atual ({tempFichaItens.length} itens)
              </span>

              <div className="min-h-[120px] max-h-[220px] overflow-y-auto space-y-1.5 pr-1">
                {tempFichaItens.length === 0 ? (
                  <p className="text-[11px] text-slate-400 italic py-6 text-center">
                    Nenhum ingrediente adicionado ainda.
                  </p>
                ) : (
                  tempFichaItens.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-2 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold text-slate-800 truncate">{item.nome}</p>
                        <span className="text-[10px] text-slate-400">
                          {item.qtd} {item.und}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-amber-700">{fmt(item.custo)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTempIngrediente(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 uppercase">Custo Direto (CMV):</span>
                <span className="text-lg font-black text-amber-700 font-mono">
                  {fmt(tempFichaTotal)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveFicha}
              className="w-full py-3 bg-[#CD9C20] hover:bg-[#b88916] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar Ficha Técnica</span>
            </button>
          </div>

          {/* List of Registered Fichas */}
          <div className="xl:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm uppercase text-slate-900 tracking-wider">
                  Fichas Técnicas Homologadas ({fichas.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Base de dados de CMV para composição de combos e precificação no cardápio e no iFood.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {fichas.map((ficha) => (
                <div
                  key={ficha.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-amber-300 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold font-mono uppercase">
                        {ficha.categoria}
                      </span>
                      <h4 className="font-black text-base text-slate-900 truncate">{ficha.nome}</h4>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {ficha.itens.map((i) => `${i.qtd}${i.und} ${i.nome}`).join(' • ')}
                    </p>
                  </div>

                  <div className="flex items-center gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 justify-between md:justify-end">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Custo Direto (CMV)</span>
                      <span className="text-lg font-black text-rose-700 font-mono">
                        {fmt(ficha.custoTotal)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteFicha(ficha.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Excluir Ficha Técnica"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. SUB-TAB: COMBOS & PRECIFICAÇÃO (MARKUP DIVISOR POR DENTRO) */}
      {/* ========================================================================= */}
      {subTab === 'combos' && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Precificador Form */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 uppercase">
                Criar / Precificar Item Final (Markup Divisor)
              </h3>
              <p className="text-xs text-slate-500">
                Agrupe fichas técnicas, defina a margem desejada e simule o preço promocional real.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                Nome de Venda (Combo ou Produto)
              </label>
              <input
                type="text"
                placeholder="Ex: Combo Zeus Clássico + Fritas"
                value={comboNome}
                onChange={(e) => setComboNome(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>

            {/* Fichas Composition */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold uppercase text-slate-700">
                Composição do Combo (Selecione as Fichas)
              </label>

              <div className="flex gap-2">
                <select
                  value={selectedFichaForCombo}
                  onChange={(e) => setSelectedFichaForCombo(e.target.value)}
                  className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-amber-500"
                >
                  <option value="">Selecione uma ficha técnica cadastrada...</option>
                  {fichas.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome} — {fmt(f.custoTotal)}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleAddFichaToTempCombo}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition-colors"
                >
                  Adicionar
                </button>
              </div>

              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {tempComboFichas.map((f, i) => (
                  <div
                    key={f.id}
                    className="flex justify-between items-center py-1.5 px-2 bg-white rounded border border-slate-100 text-xs"
                  >
                    <span className="font-semibold text-slate-800">{f.nome}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{fmt(f.custo)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTempComboFicha(i)}
                        className="text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-bold uppercase">Custo Total dos Itens:</span>
                <span className="font-black text-rose-700 font-mono text-sm">
                  {fmt(tempComboCustoTotal)}
                </span>
              </div>
            </div>

            {/* Inputs de Margem & Taxas */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Margem de Lucro Desejada (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={comboMargem}
                    onChange={(e) => setComboMargem(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                  Taxas de Venda / Cartão (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    value={comboTaxa}
                    onChange={(e) => setComboTaxa(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500"
                  />
                  <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>
            </div>

            {/* Preço Sugerido (Markup Box) */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase">Preço Sugerido (Markup Divisor)</p>
                <p className="text-[11px] text-amber-700 mt-0.5">
                  Custo Fixo rateado embutido: <strong>{fixedCosts.percentual.toFixed(2)}%</strong>
                </p>
              </div>
              <p className="text-2xl font-black text-amber-900 font-mono">
                {tempComboPrecoSugerido > 0 ? fmt(tempComboPrecoSugerido) : 'R$ 0,00'}
              </p>
            </div>

            {/* Simulador de Preço Real / Promocional */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <span className="text-xs font-bold uppercase text-slate-800 block">
                Simulador de Preço Promocional / Praticado
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">
                    Preço Final de Venda (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Digite o preço real..."
                    value={comboPrecoReal}
                    onChange={(e) => setComboPrecoReal(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">
                    Lucro Líquido Real Limpo
                  </span>
                  <p
                    className={`text-lg font-black font-mono ${
                      tempComboSimulation.lucroReais >= 0 ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {fmt(tempComboSimulation.lucroReais)}{' '}
                    <span className="text-xs">({tempComboSimulation.lucroPerc.toFixed(1)}%)</span>
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSaveCombo}
              className="w-full py-3 bg-[#CD9C20] hover:bg-[#b88916] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Salvar no Catálogo Precificado</span>
            </button>
          </div>

          {/* Catalog of Precified Combos */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm uppercase text-slate-900 tracking-wider">
                  Catálogo Precificado ({combos.length})
                </h4>
                <p className="text-xs text-slate-500">
                  Preços de venda com auditoria de custos diretos, rateio e margem líquida.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {combos.map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs relative overflow-hidden group hover:border-amber-300 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="font-black text-base text-slate-900">{c.nome}</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {c.fichas.map((f) => f.nome).join(' + ')}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteCombo(c.id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition-colors"
                      title="Excluir Combo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Custo Direto</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">{fmt(c.custoTotal)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Preço Sugerido</span>
                      <span className="text-xs font-bold text-amber-700 font-mono">{fmt(c.precoSugerido)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Preço de Venda</span>
                      <span className="text-sm font-black text-slate-900 font-mono">{fmt(c.precoReal)}</span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Lucro Líquido</span>
                      <span
                        className={`text-xs font-black font-mono block ${
                          c.lucroReal >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {fmt(c.lucroReal)}{' '}
                        <span className="text-[10px]">({c.lucroPerc.toFixed(1)}%)</span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. SUB-TAB: SIMULADOR ESPECIAL IFOOD (TAXA 26,2% / DIVISOR 0,738) */}
      {/* ========================================================================= */}
      {subTab === 'ifood' && (
        <div className="space-y-6">
          {/* Main Hero Card for iFood Rule */}
          <div className="bg-gradient-to-br from-rose-950 via-[#1e0a0a] to-[#120505] text-white p-6 sm:p-8 rounded-2xl border-2 border-rose-500/40 shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-80 bg-radial from-rose-500/20 to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500 text-white font-black text-[10px] tracking-widest uppercase">
                    REGRA OFICIAL IFOOD
                  </span>
                  <span className="text-xs text-rose-300 font-mono">Taxa de Comissão: 26,2%</span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white font-display uppercase tracking-tight">
                  Simulador de Precificação iFood (Divisor 0,738)
                </h3>

                <p className="text-xs text-rose-200/80 max-w-2xl leading-relaxed">
                  No iFood, para cada R$ 100,00 vendidos, a plataforma retém <strong>R$ 26,20</strong> (23% comissão de intermediação + 3,2% de pagamento online). Para calcular o valor exato sem prejuízo, aplica-se a fórmula matemática:
                </p>

                <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-black/60 border border-rose-500/30 rounded-xl font-mono text-xs text-rose-300">
                  <Sparkles className="w-4 h-4 text-rose-400" />
                  <span>Preço Equilíbrio = Custo de Produção ÷ 0,738</span>
                </div>
              </div>

              {/* Quick Indicator Badge */}
              <div className="p-4 bg-black/50 border border-rose-500/40 rounded-2xl text-center shrink-0">
                <span className="text-[10px] font-bold text-rose-300 uppercase tracking-widest block">
                  Fator Divisor
                </span>
                <span className="text-3xl font-black text-white font-mono block">0,738</span>
                <span className="text-[10px] text-neutral-400 font-mono block">(100% - 26,2%)</span>
              </div>
            </div>
          </div>

          {/* Interactive Calculator Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Controls (5 cols) */}
            <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h4 className="font-extrabold text-sm uppercase text-slate-900 tracking-wider flex items-center gap-2">
                <Calculator className="w-4 h-4 text-rose-600" />
                <span>Configurar Simulação do Hambúrguer</span>
              </h4>

              {/* Source Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Selecionar Hambúrguer / Ficha Técnica
                </label>
                <select
                  value={ifoodSelectedSource}
                  onChange={(e) => handleIfoodSourceChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                >
                  <optgroup label="Fichas Técnicas Homologadas (CMV Exato)">
                    {fichas.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nome} (Custo: {fmt(f.custoTotal)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Hambúrgueres do Cardápio Oficial (Estimativa)">
                    {MENU_ITEMS.filter((m) => m.isBurger).map((m) => (
                      <option key={m.id} value={`menu-${m.id}`}>
                        {m.name} — Venda Balcão: {fmt(m.price)}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {/* Cost Input */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 flex items-center justify-between">
                  <span>Custo de Produção Direto (R$)</span>
                  <span className="text-[10px] text-slate-400 font-mono">Pão + Carne + Recheios + Embalagem</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400">R$</span>
                  <input
                    type="number"
                    step="0.01"
                    value={ifoodCustomCost}
                    onChange={(e) => setIfoodCustomCost(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-black text-rose-900 font-mono focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Target Profit Margin on iFood */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5">
                  Margem de Lucro Desejada no iFood (%)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.5"
                    value={ifoodTargetMargin}
                    onChange={(e) => setIfoodTargetMargin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-rose-500"
                  />
                  <span className="absolute right-3.5 top-2 text-xs font-bold text-slate-400">%</span>
                </div>
              </div>

              {/* Fixed Cost Toggle */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Embutir Rateio Fixo</span>
                  <span className="text-[11px] text-slate-400">
                    Aluguel, luz e salários ({fixedCosts.percentual.toFixed(2)}%)
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={ifoodIncludeFixedCost}
                  onChange={(e) => setIfoodIncludeFixedCost(e.target.checked)}
                  className="w-4 h-4 text-rose-600 rounded cursor-pointer"
                />
              </div>

              {/* Actual Selling Price on iFood Input */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase text-slate-900 mb-1.5">
                  Preço Praticado no Cardápio do iFood (R$)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-xs font-bold text-emerald-600">R$</span>
                  <input
                    type="number"
                    step="0.10"
                    value={ifoodSellingPrice}
                    onChange={(e) => setIfoodSellingPrice(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-emerald-50 border border-emerald-300 rounded-xl text-sm font-black text-emerald-900 font-mono focus:outline-none focus:border-emerald-500 shadow-xs"
                  />
                </div>
                <span className="text-[11px] text-slate-400 block mt-1">
                  Digite o preço em que o hambúrguer está anunciado no app do iFood para ver o lucro real.
                </span>
              </div>
            </div>

            {/* Right Results & Breakdown (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-slate-500 block">
                    Preço Mínimo Break-Even (Zero Prejuízo)
                  </span>
                  <p className="text-2xl font-black text-slate-900 font-mono mt-1">
                    {fmt(ifoodBreakEvenPrice)}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {fmt(ifoodCostValue)} ÷ 0,738
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border-2 border-[#CD9C20]/60 shadow-xs">
                  <span className="text-[11px] font-bold uppercase text-amber-900 block">
                    Preço Sugerido com Margem ({ifoodTargetMargin}%)
                  </span>
                  <p className="text-2xl font-black text-amber-900 font-mono mt-1">
                    {ifoodSuggestedPrice > 0 ? fmt(ifoodSuggestedPrice) : 'Erro (% > 73,8%)'}
                  </p>
                  <p className="text-[11px] text-amber-700 mt-1">
                    Garante o lucro líquido desejado após a taxa do iFood.
                  </p>
                </div>
              </div>

              {/* Financial Split for Practiced Price */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h5 className="font-extrabold text-xs uppercase text-slate-800 tracking-wider">
                    Auditoria da Venda de {fmt(ifoodSaleValue)} no iFood
                  </h5>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase font-mono ${
                      ifoodRealBreakdown.lucroLiquido >= 0
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {ifoodRealBreakdown.lucroLiquido >= 0 ? 'Operação Lucrativa' : 'Prejuízo no iFood'}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600">Preço Bruto Pago pelo Cliente:</span>
                    <span className="font-bold text-slate-900 font-mono">{fmt(ifoodSaleValue)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 text-rose-700">
                    <span className="flex items-center gap-1.5">
                      <Bike className="w-3.5 h-3.5" />
                      Comissão iFood Retida (26,2%):
                    </span>
                    <span className="font-bold font-mono">- {fmt(ifoodRealBreakdown.comissaoIfood)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 bg-slate-50 px-2 rounded font-semibold text-slate-800">
                    <span>Repasse Líquido Depositado pelo iFood:</span>
                    <span className="font-mono">{fmt(ifoodRealBreakdown.repasseIfood)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 text-slate-600">
                    <span>Custo de Produção (CMV dos Insumos):</span>
                    <span className="font-mono text-rose-700 font-bold">- {fmt(ifoodRealBreakdown.custoProducao)}</span>
                  </div>

                  {ifoodIncludeFixedCost && (
                    <div className="flex justify-between items-center py-1 text-slate-600">
                      <span>Rateio de Custos Fixos ({fixedCosts.percentual.toFixed(2)}%):</span>
                      <span className="font-mono text-slate-700 font-bold">- {fmt(ifoodRealBreakdown.rateioFixo)}</span>
                    </div>
                  )}

                  <div className="pt-3 border-t-2 border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-black uppercase text-slate-900 block">
                        Lucro Líquido Real que Sobra no Bolso
                      </span>
                      <span className="text-[10px] text-slate-400">Após pagar iFood, insumos e custos fixos</span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-2xl font-black font-mono block ${
                          ifoodRealBreakdown.lucroLiquido >= 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {fmt(ifoodRealBreakdown.lucroLiquido)}
                      </span>
                      <span
                        className={`text-xs font-bold ${
                          ifoodRealBreakdown.lucroLiquido >= 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {ifoodRealBreakdown.margemReal.toFixed(1)}% de margem líquida real
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side-by-Side Comparison: Own Channel (Site/WhatsApp) vs iFood */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Store className="w-4 h-4 text-amber-800" />
                  <h5 className="font-black text-xs uppercase text-amber-950 tracking-wider">
                    Comparativo Estratégico: Venda Direta (Site/Whats) vs iFood
                  </h5>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-white/80 rounded-xl border border-amber-200/80 space-y-1">
                    <span className="text-[10px] font-black uppercase text-amber-900 block">Canal Próprio (Site / Whats)</span>
                    <p className="text-slate-500 text-[11px]">Venda com taxa 0% ou taxa de cartão média de 1,99%.</p>
                    <p className="font-mono font-black text-slate-900 text-sm mt-1">
                      Lucro Líquido: ~{fmt(ifoodSaleValue - ifoodRealBreakdown.custoProducao - ifoodRealBreakdown.rateioFixo - ifoodSaleValue * 0.02)}
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold block">
                      + R$ {fmt(ifoodRealBreakdown.comissaoIfood * 0.92)} a mais no seu bolso!
                    </span>
                  </div>

                  <div className="p-3 bg-white/80 rounded-xl border border-rose-200/80 space-y-1">
                    <span className="text-[10px] font-black uppercase text-rose-900 block">Canal iFood (26,2%)</span>
                    <p className="text-slate-500 text-[11px]">A plataforma fica com mais de 1/4 do faturamento bruto.</p>
                    <p className="font-mono font-black text-rose-900 text-sm mt-1">
                      Lucro Líquido: {fmt(ifoodRealBreakdown.lucroLiquido)}
                    </p>
                    <span className="text-[10px] text-rose-600 font-bold block">
                      Retenção de {fmt(ifoodRealBreakdown.comissaoIfood)} por hambúrguer.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
