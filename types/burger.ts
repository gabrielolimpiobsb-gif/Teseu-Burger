export type MeatDoneness = 'Ao ponto' | 'Bem passado' | 'Ao ponto para menos (Vermelhinho)';

export interface ExtraTopping {
  id: string;
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'legends' | 'smash' | 'especiais' | 'combos' | 'sides' | 'bebidas' | 'sobremesas';
  price: number;
  description: string;
  badge?: string;
  isLegend?: boolean;
  imageType: 'classic' | 'fury' | 'melt' | 'bacon' | 'combo' | 'fries' | 'shake' | 'dessert' | 'onion' | 'nuggets';
  isBurger: boolean;
  weight?: string;
  cookingTemp?: string;
  blendInfo?: string;
  bunInfo?: string;
  cheeseInfo?: string;
  sauceInfo?: string;
  pairingSuggestion?: string;
  flavorNotes?: string[];
  isAvailable?: number;
  costPrice?: number;
}

export interface CartItem {
  id: string;
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
}

export type OrderType = 'delivery' | 'pickup';

export type PaymentMethod = 'pix' | 'card' | 'cash';

export interface CustomerDetails {
  name: string;
  phone: string;
  address: string;
  number: string;
  neighborhood: string;
  complement?: string;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  cashChangeFor?: string;
  couponCode?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  verifiedOrder: string;
  comment: string;
  city: string;
}
