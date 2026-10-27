/**
 * Financial Engine - Cost of Goods Sold (CMV) & Profit Analytics
 * Prepares consolidated financial packages for the future Admin Panel.
 */

export interface CostBreakdown {
  bunCost?: number;
  meatCost?: number;
  cheeseCost?: number;
  sauceCost?: number;
  toppingsCost?: number;
  sideCost?: number;
  drinkCost?: number;
  packagingCost: number;
}

export interface ItemFinancialMetrics {
  name: string;
  quantity: number;
  salePrice: number;
  unitCost: number;
  totalCost: number;
  totalRevenue: number;
  grossProfit: number;
  marginPercent: string;
}

export interface OrderFinancialSummary {
  orderNumber: string;
  grossRevenue: number;    // In Reais (R$)
  productionCost: number;  // In Reais (R$)
  grossProfit: number;     // In Reais (R$)
  profitMargin: string;    // e.g. "64.2%"
  paymentMethod: string;
  itemsBreakdown: ItemFinancialMetrics[];
}

/**
 * Detailed base production costs per item ID (in Reais R$)
 */
export const ITEM_BASE_COSTS: Record<string, { cost: number; description: string }> = {
  // As Lendas
  'legend-classic': { cost: 12.4, description: 'Pão brioche (R$2.20), 160g blend Angus (R$5.60), cheddar (R$2.20), picles/cebola (R$0.80), molho (R$0.60), caixa/lacre (R$1.00)' },
  'legend-zeus': { cost: 14.5, description: 'Pão brioche (R$2.20), 160g blend Angus (R$5.60), bacon defumado (R$3.20), cheddar (R$2.00), molho (R$0.50), embalagem (R$1.00)' },
  'legend-ares': { cost: 13.8, description: 'Pão brioche (R$2.20), 160g blend (R$5.60), cheddar duplo (R$3.20), cebola crispy (R$1.20), molho (R$0.60), embalagem (R$1.00)' },

  // Smashes
  'smash-simples': { cost: 7.2, description: 'Pão brioche (R$2.00), 80g blend (R$2.80), queijo prato (R$1.20), molho (R$0.40), embalagem (R$0.80)' },
  'smash-duplo': { cost: 10.8, description: 'Pão brioche (R$2.00), 2x80g blend (R$5.60), queijo prato duplo (R$2.00), molho (R$0.40), embalagem (R$0.80)' },
  'smash-bacon': { cost: 12.6, description: 'Pão brioche (R$2.00), 160g blend (R$5.60), bacon artesanal (R$2.80), cheddar (R$1.40), embalagem (R$0.80)' },
  'smash-salad': { cost: 10.2, description: 'Pão brioche (R$2.00), 80g blend (R$2.80), alface americana/tomate (R$1.80), queijo prato (R$1.20), maionese verde (R$0.60), embalagem (R$0.80)' },
  'smash-cheddar-melt': { cost: 13.1, description: 'Pão australiano (R$2.60), 160g blend (R$5.60), cheddar melt cremoso (R$3.20), cebola shoyu (R$0.90), embalagem (R$0.80)' },
  'smash-espartano': { cost: 16.8, description: 'Pão brioche (R$2.20), 3x80g blend (R$8.40), cheddar triplo (R$3.80), bacon bits (R$1.40), embalagem (R$1.00)' },

  // Especiais
  'special-truffle': { cost: 17.5, description: 'Pão brioche artesanal (R$2.40), 180g blend (R$6.20), fonduta trufada (R$5.80), cebola crispy (R$1.80), embalagem especial (R$1.30)' },
  'special-ribs': { cost: 16.2, description: 'Pão brioche (R$2.20), 160g blend (R$5.60), costela desfiada barbecue (R$5.50), provolone (R$1.90), embalagem (R$1.00)' },
  'special-gorgonzola': { cost: 15.4, description: 'Pão brioche (R$2.20), 160g blend (R$5.60), creme de gorgonzola dolce (R$4.80), nozes caramelizadas (R$1.80), embalagem (R$1.00)' },

  // Combos
  'combo-deuses': { cost: 20.8, description: 'Legend Classic (R$12.40) + Fritas Rústica (R$4.20) + Refrigerante lata (R$2.70) + Embalagem combo (R$1.50)' },
  'combo-olimpico': { cost: 23.5, description: 'Legend Zeus (R$14.50) + Fritas Bacon/Cheddar (R$5.80) + Refrigerante lata (R$2.20) + Embalagem (R$1.00)' },
  'combo-esparta-duplo': { cost: 36.2, description: '2x Smash Duplo (R$21.60) + Fritas Grande (R$7.40) + 2x Bebidas (R$4.80) + Embalagens (R$2.40)' },

  // Fritas & Sides
  'side-fritas-classica': { cost: 3.9, description: '150g Batata palito especial (R$2.80), óleo de algodão (R$0.50), sal/tempero (R$0.20), embalagem cone térmica (R$0.40)' },
  'side-fritas-rustica': { cost: 4.8, description: '180g Batata com casca e alecrim (R$3.40), alho confit (R$0.70), embalagem (R$0.70)' },
  'side-fritas-cheddar-bacon': { cost: 6.9, description: '200g Batata (R$3.20), cheddar melt cremoso (R$2.20), farofa de bacon (R$1.00), embalagem (R$0.50)' },
  'side-nuggets': { cost: 5.4, description: '8x Nuggets peito de frango (R$4.10), molho riot (R$0.70), embalagem (R$0.60)' },
  'side-onion-rings': { cost: 4.7, description: '10x Onion rings empanadas (R$3.60), maionese alho (R$0.60), embalagem (R$0.50)' },

  // Néctares & Bebidas
  'drink-coca-original': { cost: 2.3, description: 'Lata 350ml distribuidor (R$2.30)' },
  'drink-coca-zero': { cost: 2.3, description: 'Lata 350ml distribuidor (R$2.30)' },
  'drink-guarana-antarctica': { cost: 2.1, description: 'Lata 350ml distribuidor (R$2.10)' },
  'drink-suco-laranja': { cost: 3.4, description: 'Suco integral 300ml (R$3.10) + garrafa (R$0.30)' },
  'drink-agua-gas': { cost: 1.1, description: 'Garrafa 500ml (R$1.10)' },
  'drink-cerveja-heineken': { cost: 5.2, description: 'Long neck 330ml (R$5.20)' },

  // Sobremesas / Ambrosias
  'dessert-pudim': { cost: 4.6, description: 'Pudim leite condensado individual (R$3.80) + embalagem acrílico (R$0.80)' },
  'dessert-banoffee': { cost: 6.2, description: 'Torta banoffee no pote (R$5.10) + pote térmico (R$1.10)' },
  'dessert-brownie': { cost: 5.4, description: 'Brownie chocolate nobre 70% (R$4.50) + embalagem selada (R$0.90)' },
};

/**
 * Extra toppings production costs (in Reais R$)
 */
export const TOPPING_COSTS: Record<string, number> = {
  bacon: 1.8,
  cheddar: 1.3,
  patty: 2.8,
  onion: 0.6,
  sauce: 0.7,
  pickles: 0.5,
};

export const COMBO_UPGRADE_COST = 4.8; // Batata individual (R$2.50) + Refrigerante lata (R$2.30)

/**
 * Calculates item-by-item and consolidated order financials (CMV & Gross Profit).
 */
export function calculateOrderFinancials(
  orderNumber: string,
  items: Array<{
    menuItemId: string;
    name: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    selectedToppings?: Array<{ id: string; name: string; price: number }>;
    isComboUpgrade?: boolean;
  }>,
  totalRevenue: number,
  paymentMethod: string = 'pix',
  customCosts?: Record<string, number>
): OrderFinancialSummary {
  let totalProductionCost = 0;
  const itemsBreakdown: ItemFinancialMetrics[] = [];

  for (const item of items) {
    let unitCost: number;
    if (customCosts && customCosts[item.menuItemId] !== undefined) {
      unitCost = customCosts[item.menuItemId];
    } else {
      const baseEntry = ITEM_BASE_COSTS[item.menuItemId];
      unitCost = baseEntry ? baseEntry.cost : Math.round(item.unitPrice * 0.35 * 100) / 100;
    }

    // Add cost of selected extra toppings
    if (item.selectedToppings && item.selectedToppings.length > 0) {
      for (const topping of item.selectedToppings) {
        const toppingCost = TOPPING_COSTS[topping.id] ?? 1.0;
        unitCost += toppingCost;
      }
    }

    // Add cost of combo upgrade if applied
    if (item.isComboUpgrade) {
      unitCost += COMBO_UPGRADE_COST;
    }

    const itemTotalCost = Math.round(unitCost * item.quantity * 100) / 100;
    const itemTotalRevenue = item.totalPrice;
    const itemGrossProfit = Math.round((itemTotalRevenue - itemTotalCost) * 100) / 100;
    const itemMargin = itemTotalRevenue > 0
      ? `${((itemGrossProfit / itemTotalRevenue) * 100).toFixed(1)}%`
      : '0.0%';

    totalProductionCost += itemTotalCost;

    itemsBreakdown.push({
      name: item.name,
      quantity: item.quantity,
      salePrice: item.unitPrice,
      unitCost,
      totalCost: itemTotalCost,
      totalRevenue: itemTotalRevenue,
      grossProfit: itemGrossProfit,
      marginPercent: itemMargin,
    });
  }

  const grossProfit = Math.max(0, Math.round((totalRevenue - totalProductionCost) * 100) / 100);
  const profitMargin = totalRevenue > 0
    ? `${((grossProfit / totalRevenue) * 100).toFixed(1)}%`
    : '0.0%';

  return {
    orderNumber,
    grossRevenue: totalRevenue,
    productionCost: Math.round(totalProductionCost * 100) / 100,
    grossProfit,
    profitMargin,
    paymentMethod,
    itemsBreakdown,
  };
}
