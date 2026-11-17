import { ExtraTopping, MenuItem, Review } from '@/types/burger';

export const STORE_INFO = {
  name: 'Teseu Burger',
  subtitle: 'Templo do Smash Greco-Romano',
  headline: 'HAMBÚRGUERES DIGNOS DOS DEUSES DO OLIMPO',
  status: 'Aberto no Olimpo',
  avgTime: '30-45 min',
  minOrder: 25.0,
  whatsapp: '5561992055050',
  whatsappFormatted: '(61) 99205-5050',
  whatsappUrl: 'https://wa.me/message/E6QO4JEINVA2K1',
  address: 'Via Ápia do Sabor, 1420 - Templo Central / Jardins',
  hours: 'Terça a Domingo • 18h00 às 23h30',
  instagram: '@teseuburger.oficial',
};

export function getStoreWhatsAppUrl(encodedMessage?: string): string {
  if (!encodedMessage) return STORE_INFO.whatsappUrl;
  return `https://wa.me/${STORE_INFO.whatsapp}?text=${encodedMessage}`;
}

export const AVAILABLE_TOPPINGS: ExtraTopping[] = [
  { id: 'picles', name: 'Picles Artesanal Crocante', price: 3.0 },
  { id: 'carne', name: 'Carne (Blend Bovino 160g Extra)', price: 12.0 },
  { id: 'alface', name: 'Alface Americana', price: 2.0 },
  { id: 'tomate', name: 'Tomate em Rodelas Fresco', price: 2.0 },
  { id: 'bacon', name: 'Bacon Defumado Crocante', price: 5.0 },
  { id: 'cheddar', name: 'Queijo Cheddar Derretido', price: 4.0 },
];

export const AVAILABLE_SAUCES: ExtraTopping[] = [
  { id: 'sauce-defumada', name: 'Maionese Defumada da Casa', price: 3.5 },
  { id: 'sauce-alho', name: 'Maionese de Alho Artesanal', price: 3.5 },
  { id: 'sauce-barbecue', name: 'Molho Barbecue Rústico', price: 3.5 },
  { id: 'sauce-pimenta', name: 'Geleia de Pimenta Doce', price: 4.0 },
  { id: 'sauce-verde', name: 'Maionese Verde com Ervas', price: 3.5 },
  { id: 'sauce-mostarda-mel', name: 'Molho Mostarda e Mel', price: 3.5 },
];

export interface FriesOption {
  id: string;
  size: 'P' | 'M' | 'G';
  name: string;
  description: string;
  price: number;
}

export const FRIES_OPTIONS: FriesOption[] = [
  { id: 'fries-p', size: 'P', name: 'Batata P (Pequena)', description: 'Porção individual crocante', price: 9.9 },
  { id: 'fries-m', size: 'M', name: 'Batata M (Média)', description: 'Porção média dourada', price: 14.9 },
  { id: 'fries-g', size: 'G', name: 'Batata G (Grande)', description: 'Porção farta para compartilhar', price: 19.9 },
];

export interface DrinkOption {
  id: string;
  name: string;
  volume: string;
  price: number;
  image: string;
}

export const DRINK_OPTIONS: DrinkOption[] = [
  { id: 'coca', name: 'Coca-Cola Original', volume: 'Lata 350ml', price: 7.5, image: '/coca.png' },
  { id: 'coca-zero', name: 'Coca-Cola Sem Açúcar', volume: 'Lata 350ml', price: 7.5, image: '/coca-zero.png' },
  { id: 'guarana', name: 'Guaraná Antarctica', volume: 'Lata 350ml', price: 7.5, image: '/guarana.png' },
  { id: 'guarana-zero', name: 'Guaraná Antarctica Zero', volume: 'Lata 350ml', price: 7.5, image: '/guarana-zero.png' },
  { id: 'fanta', name: 'Fanta Laranja', volume: 'Lata 350ml', price: 7.5, image: '/fanta.png' },
  { id: 'agua', name: 'Água Mineral', volume: 'Garrafa 500ml', price: 5.0, image: '/agua.png' },
];

export interface SweetPrize {
  id: string;
  name: string;
  subtitle: string;
  icon: string;
  color: string;
  accent: string;
  image?: string;
}

export const SWEET_PRIZES: SweetPrize[] = [
  {
    id: 'cookie-supremo',
    name: 'Cookie Artesanal',
    subtitle: 'Gotas de Chocolate Belga',
    icon: '🍪',
    color: '#1e1b4b', // Índigo escuro luxo
    accent: '#f59e0b',
    image: '/doce-cookie.png',
  },
  {
    id: 'brigadeiro-gourmet',
    name: 'Brigadeiro Gourmet',
    subtitle: 'Cacau 70% com Granulado Nobre',
    icon: '🍫',
    color: '#7f1d1d', // Carmesim cassino
    accent: '#fbbf24',
    image: '/doce-ambrosia.png',
  },
  {
    id: 'brownie-intenso',
    name: 'Brownie Supremo',
    subtitle: 'Casquinha Crocante & Fudge',
    icon: '🥮',
    color: '#0f172a', // Slate profundo
    accent: '#f59e0b',
    image: '/doce-brownie.png',
  },
  {
    id: 'doce-especial',
    name: 'Bombom da Casa',
    subtitle: 'Recheio Cremoso Exclusivo',
    icon: '🍬',
    color: '#881337', // Ruby escuro
    accent: '#fde047',
    image: '/doce-torta.png',
  },
];

export interface SweetGiftCard {
  id: number;
  roman: string;
  name: string;
  emoji: string;
  description: string;
  image: string;
}

export const SWEET_GIFT_CARDS: SweetGiftCard[] = [
  {
    id: 1,
    roman: 'I',
    name: 'Cookie Artesanal',
    emoji: '🍪',
    description: 'Gotas de Chocolate Belga',
    image: '/doce-cookie.png',
  },
  {
    id: 2,
    roman: 'II',
    name: 'Brigadeiro Gourmet',
    emoji: '🍫',
    description: 'Cacau 70% com Granulado Nobre',
    image: '/doce-ambrosia.png',
  },
  {
    id: 3,
    roman: 'III',
    name: 'Brownie Supremo',
    emoji: '🥮',
    description: 'Casquinha Crocante & Fudge',
    image: '/doce-brownie.png',
  },
  {
    id: 4,
    roman: 'IV',
    name: 'Bombom da Casa',
    emoji: '🍬',
    description: 'Recheio Cremoso Exclusivo',
    image: '/doce-torta.png',
  },
];

export const COMBO_UPGRADE_PRICE = 14.9;

export const COMBO_DRINKS = [
  'Coca-Cola Original (Lata 350ml)',
  'Coca-Cola Sem Açúcar (Lata 350ml)',
  'Guaraná Antarctica (Lata 350ml)',
  'Guaraná Antarctica Zero (Lata 350ml)',
  'Água Mineral das Fontes com Gás (500ml)',
];

export const NEIGHBORHOOD_FEES: Record<string, number> = {
  'Asa Sul': 6.0,
  'Asa Norte': 6.0,
  'Sudoeste / Octogonal': 7.0,
  'Noroeste': 7.5,
  'Águas Claras': 8.0,
  'Taguatinga': 9.0,
  'Guará I e II': 7.0,
  'Lago Sul / Lago Norte': 9.0,
  'Vicente Pires': 8.5,
  'Ceilândia': 10.0,
  'Gama': 12.0,
  'Sobradinho': 12.0,
  'Planaltina': 14.0,
  'Samambaia': 10.0,
  'Outro Bairro de Brasília': 10.0,
};

export interface NeighborhoodCoupon {
  code: string;
  neighborhood: string;
  giftTitle: string;
  giftDescription: string;
}

export const NEIGHBORHOOD_COUPONS: Record<string, NeighborhoodCoupon> = {
  'ASASUL': {
    code: 'ASASUL',
    neighborhood: 'Asa Sul',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'ASANORTE': {
    code: 'ASANORTE',
    neighborhood: 'Asa Norte',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'SUDOESTE': {
    code: 'SUDOESTE',
    neighborhood: 'Sudoeste / Octogonal',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'NOROESTE': {
    code: 'NOROESTE',
    neighborhood: 'Noroeste',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'AGUASCLARAS': {
    code: 'AGUASCLARAS',
    neighborhood: 'Águas Claras',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'TAGUATINGA': {
    code: 'TAGUATINGA',
    neighborhood: 'Taguatinga',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'GUARA': {
    code: 'GUARA',
    neighborhood: 'Guará I e II',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'LAGO': {
    code: 'LAGO',
    neighborhood: 'Lago Sul / Norte',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'VICENTEPIRES': {
    code: 'VICENTEPIRES',
    neighborhood: 'Vicente Pires',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'CEILANDIA': {
    code: 'CEILANDIA',
    neighborhood: 'Ceilândia',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'GAMA': {
    code: 'GAMA',
    neighborhood: 'Gama',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'SOBRADINHO': {
    code: 'SOBRADINHO',
    neighborhood: 'Sobradinho',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'PLANALTINA': {
    code: 'PLANALTINA',
    neighborhood: 'Planaltina',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'SAMAMBAIA': {
    code: 'SAMAMBAIA',
    neighborhood: 'Samambaia',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
  'BRASILIA': {
    code: 'BRASILIA',
    neighborhood: 'Distrito Federal (Geral)',
    giftTitle: 'Doce Brinde: Ambrosia dos Deuses',
    giftDescription: 'Cookie vulcânico com Nutella pura ou mini sobremesa artesanal cortesia!',
  },
};

export interface ComboFriesUpgrade {
  size: 'P' | 'M' | 'G';
  name: string;
  extraPrice: number;
  label: string;
}

export const COMBO_FRIES_UPGRADES: ComboFriesUpgrade[] = [
  { size: 'P', name: 'Batata Pequena (P)', extraPrice: 0, label: 'Inclusa (+R$ 0,00)' },
  { size: 'M', name: 'Batata Média (M)', extraPrice: 1.5, label: '+R$ 1,50' },
  { size: 'G', name: 'Batata Grande (G)', extraPrice: 5.0, label: '+R$ 5,00' },
];

export const MENU_ITEMS: MenuItem[] = [
  // ========================================================
  // 1. OS 7 DEUSES DO OLIMPO (HAMBÚRGUERES OFICIAIS)
  // ========================================================
  {
    id: 'burger-zeus',
    name: 'ZEUS',
    category: 'smash',
    price: 36.9,
    description: 'Pão brioche selado na manteiga, blend bovino (160g) grelhado, fatias de queijo cheddar derretido, cebola caramelizada doce, farofa de bacon super crocante e maionese defumada.',
    badge: 'Trono do Olimpo',
    isLegend: true,
    image: '/zeus.png',
    imageType: 'zeus',
    isBurger: true,
    bun: 'Brioche selado na manteiga',
    meat: 'Blend bovino (160g) grelhado',
    cheese: 'Fatias de queijo cheddar derretido',
    complements: 'Cebola caramelizada doce e farofa de bacon super crocante',
    sauce: 'Maionese defumada',
    weight: '350g',
    cookingTemp: '230°C na chapa viva',
    blendInfo: '160g blend nobre bovino moído fresco e grelhado com crosta Maillard',
    bunInfo: 'Brioche artesanal selado na manteiga clarificada',
    cheeseInfo: 'Fatias generosas de queijo cheddar derretido no vapor',
    sauceInfo: 'Maionese defumada autoral da casa',
    pairingSuggestion: 'Batatas Espartanas + Coca-Cola bem gelada',
    flavorNotes: ['Doçura da Cebola', 'Crosta Defumada', 'Crocância da Farofa de Bacon', 'Cheddar Intenso'],
  },
  {
    id: 'burger-atena',
    name: 'ATENA',
    category: 'smash',
    price: 37.9,
    description: 'Pão brioche selado na manteiga, blend bovino (160g) grelhado, queijo provolone derretido, farta camada de crispy de alho-poró frito e sequinho, com maionese de alho ou cream cheese.',
    badge: 'Sabedoria & Sabor',
    isLegend: true,
    image: '/atena.png',
    imageType: 'atena',
    isBurger: true,
    bun: 'Brioche selado na manteiga',
    meat: 'Blend bovino (160g) grelhado',
    cheese: 'Queijo provolone ou muçarela derretida',
    complements: 'Farta camada de crispy de alho-poró frito e sequinho',
    sauce: 'Cream cheese ou maionese de alho',
    weight: '340g',
    cookingTemp: '230°C na chapa viva',
    blendInfo: '160g blend bovino suculento grelhado',
    bunInfo: 'Brioche macio com selagem perfeita na manteiga',
    cheeseInfo: 'Provolone nobre ou muçarela fundida',
    sauceInfo: 'Cream cheese cremoso ou maionese de alho suave',
    pairingSuggestion: 'Batatas Espartanas + Néctar Sagrado',
    flavorNotes: ['Crocância Dourada do Alho-Poró', 'Untuosidade do Provolone', 'Alho Harmonioso', 'Maciez'],
  },
  {
    id: 'burger-apolo',
    name: 'APOLO',
    category: 'smash',
    price: 35.9,
    description: 'Pão brioche macio, blend bovino (160g) grelhado, queijo coalho em fatia grossa tostado na chapa, uma rodela de abacaxi grelhado finalizada com um fio de mel puro e maionese tradicional.',
    badge: 'Luz Dourada',
    isLegend: true,
    image: '/apolo.png',
    imageType: 'apolo',
    isBurger: true,
    bun: 'Brioche macio',
    meat: 'Blend bovino (160g) grelhado',
    cheese: 'Queijo coalho em fatia grossa, tostado na chapa',
    complements: 'Uma rodela de abacaxi grelhado finalizada com um fio de mel puro',
    sauce: 'Maionese tradicional',
    weight: '360g',
    cookingTemp: '230°C na chapa viva',
    blendInfo: '160g carne bovina suculenta',
    bunInfo: 'Brioche macio e amanteigado',
    cheeseInfo: 'Queijo coalho artesanal tostado com crosta dourada',
    sauceInfo: 'Maionese tradicional leve e aveludada com toque de mel puro',
    pairingSuggestion: 'Loaded Fries + Guaraná bem gelado',
    flavorNotes: ['Agridoce Perfeito', 'Acidez Cítrica do Abacaxi', 'Coalho Tostado', 'Toque de Mel Puro'],
  },
  {
    id: 'burger-afrodite',
    name: 'AFRODITE',
    category: 'smash',
    price: 34.9,
    description: 'Pão brioche selado na manteiga, blend bovino (160g) grelhado, queijo prato derretido, folhas de alface americana, rodelas de tomate fresco, anéis de cebola roxa crua e maionese verde artesanal.',
    badge: 'Deusa da Beleza',
    isLegend: false,
    image: '/afrodite.png',
    imageType: 'afrodite',
    isBurger: true,
    bun: 'Brioche selado na manteiga',
    meat: 'Blend bovino (160g) grelhado',
    cheese: 'Queijo prato derretido',
    complements: 'Folhas de alface americana, rodelas de tomate fresco e anéis de cebola roxa crua',
    sauce: 'Maionese verde artesanal',
    weight: '350g',
    cookingTemp: '230°C na chapa viva',
    blendInfo: '160g blend bovino fresco e tenro',
    bunInfo: 'Brioche selado na manteiga',
    cheeseInfo: 'Queijo prato clássico derretido',
    sauceInfo: 'Maionese verde artesanal com ervas frescas',
    pairingSuggestion: 'Batatas Espartanas + Bebida gelada',
    flavorNotes: ['Frescor dos Vegetais', 'Crocância da Cebola Roxa', 'Ervas Frescas', 'Suavidade'],
  },
  {
    id: 'burger-ares',
    name: 'ARES',
    category: 'smash',
    price: 38.9,
    description: 'Pão brioche selado na manteiga, blend bovino (160g) grelhado, queijo gouda ou cheddar, anéis de cebola empanada (onion rings) inteiros e crocantes, geleia de pimenta na tampa e maionese na base.',
    badge: 'Fúria da Guerra',
    isLegend: false,
    image: '/ares.png',
    imageType: 'ares',
    isBurger: true,
    bun: 'Brioche selado na manteiga',
    meat: 'Blend bovino (160g) grelhado',
    cheese: 'Queijo gouda ou cheddar',
    complements: 'Anéis de cebola empanada (onion rings) inteiros e crocantes',
    sauce: 'Geleia de pimenta (na tampa) e maionese na base',
    weight: '380g',
    cookingTemp: '235°C na chapa viva',
    blendInfo: '160g blend bovino grelhado com força total',
    bunInfo: 'Brioche amanteigado com gergelim',
    cheeseInfo: 'Queijo gouda cremoso ou cheddar',
    sauceInfo: 'Geleia de pimenta doce e picante na tampa com maionese na base',
    pairingSuggestion: 'Loaded Fries do Coliseu + Bebida gelada',
    flavorNotes: ['Picância Doce', 'Crocância Monumental da Onion Ring', 'Gouda Fundido', 'Explosão de Sabor'],
  },
  {
    id: 'burger-hermes',
    name: 'HERMES',
    category: 'smash',
    price: 33.9,
    description: 'Pão brioche selado na manteiga, filé de sobrecoxa ou peito de frango empanado, frito até dourar, queijo prato ou muçarela, alface americana fresca, picles de pepino e maionese de limão siciliano ou mostarda e mel.',
    badge: 'Velocidade dos Deuses',
    isLegend: false,
    image: '/hermes.png',
    imageType: 'hermes',
    isBurger: true,
    bun: 'Brioche selado na manteiga',
    meat: 'Filé de sobrecoxa ou peito de frango empanado, frito até dourar',
    cheese: 'Queijo prato ou muçarela',
    complements: 'Alface americana e picles de pepino',
    sauce: 'Maionese de limão siciliano ou molho de mostarda e mel',
    weight: '330g',
    cookingTemp: 'Frito no ponto dourado perfeito',
    blendInfo: 'Filé de frango nobre marinado e super crocante',
    bunInfo: 'Brioche fofo selado',
    cheeseInfo: 'Queijo prato ou muçarela derretida',
    sauceInfo: 'Maionese cítrica de limão siciliano ou mostarda e mel',
    pairingSuggestion: 'Batatas com Páprica + Refrigerante',
    flavorNotes: ['Crocância do Frango Empanado', 'Acidez do Picles', 'Frescor Cítrico', 'Equilíbrio'],
  },
  {
    id: 'burger-hercules',
    name: 'HÉRCULES',
    category: 'smash',
    price: 39.9,
    description: 'Pão brioche selado na manteiga, blend bovino (160g) grelhado, queijo cheddar ou prato derretido em dobro, tiras longas de bacon defumado e crocante, molho barbecue ou maionese da casa.',
    badge: 'Força Titânica',
    isLegend: true,
    image: '/hercules.png',
    imageType: 'hercules',
    isBurger: true,
    bun: 'Brioche selado na manteiga',
    meat: 'Blend bovino (160g) grelhado',
    cheese: 'Queijo cheddar ou prato derretido em dobro',
    complements: 'Tiras longas de bacon defumado e crocante',
    sauce: 'Molho barbecue ou maionese da casa',
    weight: '390g',
    cookingTemp: '230°C na chapa viva',
    blendInfo: '160g blend bovino nobre grelhado no ponto',
    bunInfo: 'Brioche tostado na manteiga clarificada',
    cheeseInfo: 'Dose dupla de cheddar ou queijo prato derretido',
    sauceInfo: 'Molho barbecue rústico defumado ou maionese da casa',
    pairingSuggestion: 'Batatas Espartanas + Doce Brinde do Bairro',
    flavorNotes: ['Queijo em Dobro', 'Bacon Rústico Defumado', 'Barbecue Encorpado', 'Poder Máximo'],
  },

  // ========================================================
  // 2. O ÚNICO COMBO ESPECIAL COM DOCE BRINDE: COMBO CASAL
  // ========================================================
  {
    id: 'combo-casal',
    name: 'MONTE SEU COMBO CASAL + DOCE GRÁTIS',
    category: 'combos',
    price: 69.9,
    description: 'Banquete Completo para 2 Pessoas: 2 Hambúrgueres artesanais à sua escolha + 2 Refrigerantes gelados + 2 Batatas crocantes (P, M ou G) + 1 DOCE GRÁTIS no Caça-Níqueis Retrô!',
    badge: '🎰 Combo Casal + Doce Grátis',
    isLegend: true,
    image: '/combocasal.png',
    imageType: 'combo',
    isBurger: false,
    freeSweetGift: 'Doce do Caça-Níqueis Retrô',
    weight: 'Banquete para 2 Pessoas + Doce Grátis',
    flavorNotes: ['2 Burgers dos Deuses', '2 Batatas Crocantes', '2 Refris Gelados', 'Doce Grátis no Caça-Níqueis'],
  },

  // ========================================================
  // 3. FRITAS & ACOMPANHAMENTOS (BATATA P, M, G)
  // ========================================================
  {
    id: 'side-fries-p',
    name: 'BATATA ESPARTANA P (Pequena)',
    category: 'sides',
    price: 9.9,
    description: 'Porção individual de batatas crocantes com flor de sal e páprica especial (120g).',
    image: '/batata-p.png',
    imageType: 'fries',
    isBurger: false,
  },
  {
    id: 'side-fries-m',
    name: 'BATATA ESPARTANA M (Média)',
    category: 'sides',
    price: 14.9,
    description: 'Porção média de batatas crocantes fritas duas vezes com toque de páprica (200g).',
    image: '/batata-m.png',
    imageType: 'fries',
    isBurger: false,
  },
  {
    id: 'side-fries-g',
    name: 'BATATA ESPARTANA G (Grande)',
    category: 'sides',
    price: 19.9,
    description: 'Porção generosa de batatas crocantes para compartilhar com a legião (320g).',
    image: '/batata-g.png',
    imageType: 'fries',
    isBurger: false,
  },
  {
    id: 'side-fries-cheddar-bacon',
    name: 'LOADED FRIES DO COLISEU (Cheddar & Bacon)',
    category: 'sides',
    price: 27.9,
    description: 'Porção farta de fritas douradas cobertas com piscina de cheddar cremoso quente e chuva de bacon artesanal crocante.',
    badge: 'Para a Legião',
    image: '/loaded-fries.png',
    imageType: 'fries',
    isBurger: false,
  },
  {
    id: 'side-onion-rings',
    name: 'ONION RINGS CROCANTES DE ARES (8 un)',
    category: 'sides',
    price: 21.9,
    description: 'Anéis de cebola selecionados empanados na farinha especial e fritos ultra crocantes. Acompanha geleia de pimenta.',
    image: '/onion-rings.png',
    imageType: 'nuggets',
    isBurger: false,
  },

  // ========================================================
  // 4. BEBIDAS & NÉCTARES
  // ========================================================
  {
    id: 'drink-coca',
    name: 'Coca-Cola Original (Lata 350ml)',
    category: 'bebidas',
    price: 7.5,
    description: 'Lata bem gelada servida com copo e gelo.',
    image: '/coca.png',
    imageType: 'combo',
    isBurger: false,
  },
  {
    id: 'drink-coca-zero',
    name: 'Coca-Cola Sem Açúcar (Lata 350ml)',
    category: 'bebidas',
    price: 7.5,
    description: 'Lata zero açúcares bem gelada.',
    image: '/coca-zero.png',
    imageType: 'combo',
    isBurger: false,
  },
  {
    id: 'drink-guarana',
    name: 'Guaraná Antarctica (Lata 350ml)',
    category: 'bebidas',
    price: 7.5,
    description: 'Lata bem gelada servida com copo e gelo.',
    image: '/guarana.png',
    imageType: 'combo',
    isBurger: false,
  },
  {
    id: 'drink-guarana-zero',
    name: 'Guaraná Antarctica Zero (Lata 350ml)',
    category: 'bebidas',
    price: 7.5,
    description: 'Lata zero açúcares bem gelada.',
    image: '/guarana-zero.png',
    imageType: 'combo',
    isBurger: false,
  },

  // ========================================================
  // 5. DOCES & SOBREMESAS (DOCES BRINDES DO OLIMPO)
  // ========================================================
  {
    id: 'dessert-cookie',
    name: 'AMBROSIA: COOKIE GIGANTE COM NUTELLA',
    category: 'sobremesas',
    price: 16.9,
    description: 'Massa quentinha de cookie assada com pedaços de chocolate nobre e recheio de Nutella pura. O Doce Brinde oficial dos cupons de bairro!',
    badge: 'Doce Brinde',
    image: '/cookie.png',
    imageType: 'dessert',
    isBurger: false,
  },
  {
    id: 'dessert-brownie',
    name: 'FUDGE BROWNIE COM CALDA QUENTE',
    category: 'sobremesas',
    price: 19.9,
    description: 'Brownie artesanal 70% cacau super macio com nozes douradas e calda fervente de chocolate meio amargo.',
    image: '/brownie.png',
    imageType: 'dessert',
    isBurger: false,
  },
];

export const QUALITY_PILLARS = [
  {
    id: 'pillar-1',
    title: 'A CHAPA SAGRADA',
    subtitle: 'Calor de 230°C',
    description: 'Carne 100% fresca prensada com prensa de ferro fundido sob o calor intenso, gerando a crosta caramelizada de Maillard que retém todos os sucos vitais.',
  },
  {
    id: 'pillar-2',
    title: 'MOLHOS & NÉCTARES',
    subtitle: 'Receitas Autorais',
    description: 'Do Molho Riot sagrado à maionese verde com ervas aromáticas frescas, todas as emulsões são forjadas diariamente em nosso templo gastronômico.',
  },
  {
    id: 'pillar-3',
    title: 'VELOCIDADE DE MERCÚRIO',
    subtitle: 'Entrega Térmica Quente',
    description: 'Embalagens térmicas ventiladas desenvolvidas para conservar a temperatura de forja e garantir que o pão brioche chegue fofo e as fritas ultra crocantes.',
  },
  {
    id: 'pillar-4',
    title: 'PUREZA DE MÁRMORE',
    subtitle: 'Ingredientes Nobres',
    description: 'Blend limpo de costela e peito bovino, queijo de verdade e bacon defumado lentamente em lenha nobre. Sem atalhos, sem conservantes e com total transparência.',
  },
];

export const BURGER_LAYERS = [
  {
    id: 'layer-top-bun',
    name: 'Pão Brioche com Gergelim Dourado',
    side: 'right',
    tag: 'Cúpula Dourada',
    description: 'Brioche artesanal tostado na manteiga clarificada quente, criando uma barreira impermeável de ouro que nunca murcha.',
    height: '60px',
  },
  {
    id: 'layer-bacon',
    name: 'Bacon Artesanal Defumado 7 Dias',
    side: 'left',
    tag: 'Fatias Sagradas',
    description: 'Barriga suína nobre curada por 7 dias com sais especiais e assada lentamente até atingir uma crocância cristalina.',
    height: '24px',
  },
  {
    id: 'layer-tomato',
    name: 'Rodelas de Tomate Caqui Maduro',
    side: 'right',
    tag: 'Frescor do Egeu',
    description: 'Tomates caqui maduros e firmes, fatiados milimetricamente no momento da montagem para acidez e frescor solar.',
    height: '20px',
  },
  {
    id: 'layer-patty',
    name: 'Smash 100g + Cheddar Fundido de Hefesto',
    side: 'left',
    tag: 'Forja a 230°C',
    description: 'Blend bovino nobre prensado contra a chapa de ferro viva para caramelização máxima, banhado por cheddar inglês derretendo nos sulcos da carne.',
    height: '48px',
  },
  {
    id: 'layer-lettuce',
    name: 'Alface Americana dos Vales',
    side: 'right',
    tag: 'Textura Crocante',
    description: 'Folhas selecionadas higienizadas e secas que garantem o contraste térmico refrescante e o estalo a cada mordida.',
    height: '18px',
  },
  {
    id: 'layer-bottom-bun',
    name: 'Pão Base com Estrutura de Coluna Dórica',
    side: 'left',
    tag: 'Pedestal Firme',
    description: 'Brioche denso na medida ideal para sustentar o fluxo dos molhos e caldos da carne sem desmanchar até a última mordida.',
    height: '52px',
  },
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    author: 'MARCUS AURELIUS',
    rating: 5,
    date: 'Ontem',
    verifiedOrder: 'The Olympian Classic + Fritas Espartanas',
    comment: 'O melhor smash da cidade inteira. A crostinha da carne é surreal e o cheddar derretido é de um nível imperial inquestionável!',
    city: 'Jardins / Centro',
  },
  {
    id: 'rev-2',
    author: 'HELENA DE TROIA',
    rating: 5,
    date: 'Há 2 dias',
    verifiedOrder: 'Ares Green Fury + Néctar dos Deuses',
    comment: 'Chegou fumegando em menos de 30 minutos. Pão fofo, bacon hiper crocante e a maionese verde de ervas é uma dádiva.',
    city: 'Consolação',
  },
  {
    id: 'rev-3',
    author: 'LEÔNIDAS S.',
    rating: 5,
    date: 'Há 4 dias',
    verifiedOrder: 'Titan 4x4 + Loaded Fries do Coliseu',
    comment: 'O Monster Titan é um verdadeiro teste de força. Quatro carnes maciças com queijo escorrendo. Comi e já quero de novo.',
    city: 'Pinheiros',
  },
  {
    id: 'rev-4',
    author: 'ATENA P.',
    rating: 5,
    date: 'Há 5 dias',
    verifiedOrder: 'Hephaestus Molten Melt + Ambrosia Cookie',
    comment: 'Pão brioche com selagem impecável, não amolece. O cookie vulcânico com Nutella fechou a noite com chave de ouro.',
    city: 'Bela Vista',
  },
  {
    id: 'rev-5',
    author: 'ALEXANDRE M.',
    rating: 5,
    date: 'Há 1 semana',
    verifiedOrder: 'Colossus Oklahoma + Cerveja Artesanal',
    comment: 'A cebola prensada diretamente na carne na chapa viva traz uma caramelização que poucos lugares conseguem atingir. Nota 10/10.',
    city: 'Higienópolis',
  },
];
