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
  image?: string;
  badge?: string;
  isLegend?: boolean;
  imageType: string;
  isBurger: boolean;
  bun?: string;
  meat?: string;
  cheese?: string;
  complements?: string;
  sauce?: string;
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
  freeSweetGift?: string;
}

export interface ComboCasalSelection {
  burger1: { id: string; name: string; doneness?: MeatDoneness; image?: string };
  burger2: { id: string; name: string; doneness?: MeatDoneness; image?: string };
  drink1: { id: string; name: string; image?: string };
  drink2: { id: string; name: string; image?: string };
  fries1: { size: 'P' | 'M' | 'G'; name: string; extraPrice: number };
  fries2: { size: 'P' | 'M' | 'G'; name: string; extraPrice: number };
}

export interface CartItem {
  id: string;
  menuItemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  image?: string;
  imageType: string;
  doneness?: MeatDoneness;
  selectedToppings: ExtraTopping[];
  selectedSauces?: ExtraTopping[];
  selectedFries?: { size: 'P' | 'M' | 'G'; name: string; price: number };
  selectedDrink?: { id: string; name: string; price: number; image?: string };
  isComboUpgrade: boolean;
  comboDrink?: string;
  notes?: string;
  isSweetGift?: boolean;
  drawnSweetGift?: string;
  comboCasal?: ComboCasalSelection;
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
