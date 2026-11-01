export interface BuilderIngredient {
  id: string;
  name: string;
  category: 'buns' | 'patties' | 'cheeses' | 'veggies' | 'sauces' | 'extras';
  price: number;
  calories: number;
  grams: number;
  imagePath: string; // The user will place their custom PNG here (e.g. /paodebaixo.png)
  layerHeight: number; // Vertical stacking offset in pixels
  description: string;
  isBun?: boolean;
  isTopBun?: boolean;
  isBottomBun?: boolean;
}

export interface BurgerStackItem extends BuilderIngredient {
  instanceId: string; // Unique id for each placed slice in the stack
}

export const BUILDER_INGREDIENTS: BuilderIngredient[] = [
  // ==========================================
  // 1. PÃES (BUNS)
  // ==========================================
  {
    id: 'pao-baixo',
    name: 'Pão Brioche Selado (Base)',
    category: 'buns',
    price: 0,
    calories: 140,
    grams: 40,
    imagePath: '/paodebaixo.png',
    layerHeight: 35,
    description: 'Pão brioche fofíssimo tostado na manteiga de garrafa',
    isBun: true,
    isBottomBun: true,
  },
  {
    id: 'pao-cima',
    name: 'Pão Brioche com Gergelim (Topo)',
    category: 'buns',
    price: 0,
    calories: 150,
    grams: 45,
    imagePath: '/paodecima.png',
    layerHeight: 50,
    description: 'Cúpula dourada brilhante com sementes de gergelim nobres',
    isBun: true,
    isTopBun: true,
  },
  {
    id: 'pao-australiano-baixo',
    name: 'Pão Australiano (Base)',
    category: 'buns',
    price: 2.0,
    calories: 160,
    grams: 45,
    imagePath: '/paoaustraliano-baixo.png',
    layerHeight: 35,
    description: 'Pão escuro macio com notas suaves de mel e cacau',
    isBun: true,
    isBottomBun: true,
  },
  {
    id: 'pao-australiano-cima',
    name: 'Pão Australiano (Topo)',
    category: 'buns',
    price: 2.0,
    calories: 170,
    grams: 50,
    imagePath: '/paoaustraliano-cima.png',
    layerHeight: 50,
    description: 'Cúpula escura polvilhada com fubá artesanal',
    isBun: true,
    isTopBun: true,
  },

  // ==========================================
  // 2. CARNES & SMASH (PATTIES)
  // ==========================================
  {
    id: 'carne-smash',
    name: 'Smash Angus 80g na Chapa',
    category: 'patties',
    price: 9.0,
    calories: 210,
    grams: 80,
    imagePath: '/carne.png',
    layerHeight: 28,
    description: 'Carne fresca 100% Angus prensada na chapa a 230°C com crosta crocante',
  },
  {
    id: 'carne-dupla',
    name: 'Smash Duplo Angus 160g',
    category: 'patties',
    price: 16.0,
    calories: 420,
    grams: 160,
    imagePath: '/carnedupla.png',
    layerHeight: 45,
    description: 'Dois discos suculentos de puro Angus com caramelização extrema',
  },
  {
    id: 'carne-160g',
    name: 'Hambúrguer Alto 160g de Hefesto',
    category: 'patties',
    price: 14.0,
    calories: 380,
    grams: 160,
    imagePath: '/carne160g.png',
    layerHeight: 38,
    description: 'Blend alto, macio e ultra suculento preparado na brasa viva',
  },
  {
    id: 'frango-crispy',
    name: 'Frango Crispy Espartano',
    category: 'patties',
    price: 11.0,
    calories: 290,
    grams: 120,
    imagePath: '/frangocrispy.png',
    layerHeight: 34,
    description: 'Sobrecoxa empanada em crosta panko ultra crocante e temperos sagrados',
  },
  {
    id: 'veggie-patty',
    name: 'Smash Veggie de Grão-de-Bico',
    category: 'patties',
    price: 9.0,
    calories: 180,
    grams: 90,
    imagePath: '/veggie.png',
    layerHeight: 26,
    description: 'Blend vegetal leve temperado com cominho, alho confit e ervas finas',
  },

  // ==========================================
  // 3. QUEIJOS (CHEESES)
  // ==========================================
  {
    id: 'queijo-cheddar',
    name: 'Cheddar Inglês Derretido',
    category: 'cheeses',
    price: 4.5,
    calories: 115,
    grams: 30,
    imagePath: '/queijocheddar.png',
    layerHeight: 18,
    description: 'Fatia espessa derretida sob a cúpula de vapor na chapa',
  },
  {
    id: 'queijo-prato',
    name: 'Queijo Prato da Tessália',
    category: 'cheeses',
    price: 4.0,
    calories: 105,
    grams: 30,
    imagePath: '/queijoprato.png',
    layerHeight: 18,
    description: 'Queijo macio e elástico com ponto de fusão aveludado',
  },
  {
    id: 'gorgonzola',
    name: 'Creme de Gorgonzola do Olimpo',
    category: 'cheeses',
    price: 6.0,
    calories: 130,
    grams: 35,
    imagePath: '/gorgonzola.png',
    layerHeight: 16,
    description: 'Intensidade e elegância para os verdadeiros conquistadores do sabor',
  },

  // ==========================================
  // 4. SALADAS & FRESCURA (VEGGIES)
  // ==========================================
  {
    id: 'alface',
    name: 'Alface Americana Crocante',
    category: 'veggies',
    price: 2.0,
    calories: 8,
    grams: 25,
    imagePath: '/alface.png',
    layerHeight: 22,
    description: 'Folhas frescas e onduladas colhidas diariamente',
  },
  {
    id: 'tomate',
    name: 'Tomate Italiano Fresco (2 fatias)',
    category: 'veggies',
    price: 2.5,
    calories: 14,
    grams: 40,
    imagePath: '/tomate.png',
    layerHeight: 20,
    description: 'Fatias maduras, vermelhas e suculentas temperadas com flor de sal',
  },
  {
    id: 'picles',
    name: 'Picles Artesanais Agridoces',
    category: 'veggies',
    price: 3.0,
    calories: 12,
    grams: 20,
    imagePath: '/picles.png',
    layerHeight: 16,
    description: 'Pepino em lâminas com acidez equilibrada em especiarias da Grécia',
  },
  {
    id: 'cebola-caramelizada',
    name: 'Cebola Caramelizada 4 Horas',
    category: 'veggies',
    price: 4.0,
    calories: 60,
    grams: 30,
    imagePath: '/cebolacaramelizada.png',
    layerHeight: 18,
    description: 'Cebola dourada lentamente até atingir doçura pura e textura aveludada',
  },
  {
    id: 'cebola-roxa',
    name: 'Cebola Roxa em Fatias Finas',
    category: 'veggies',
    price: 2.0,
    calories: 15,
    grams: 20,
    imagePath: '/cebolaroxa.png',
    layerHeight: 15,
    description: 'Crocância cítrica e frescor inconfundível',
  },

  // ==========================================
  // 5. MOLHOS DO TEMPLO (SAUCES)
  // ==========================================
  {
    id: 'molho-especial',
    name: 'Molho Especial Teseu (Defumado)',
    category: 'sauces',
    price: 3.0,
    calories: 75,
    grams: 25,
    imagePath: '/molhoespecial.png',
    layerHeight: 14,
    description: 'Receita secreta do oráculo à base de picles, páprica doce e ervas',
  },
  {
    id: 'molho-verde',
    name: 'Molho Verde Espartano',
    category: 'sauces',
    price: 3.0,
    calories: 70,
    grams: 25,
    imagePath: '/molhoverde.png',
    layerHeight: 14,
    description: 'Maionese verde cremosa aromatizada com salsinha fresca e alho assado',
  },
  {
    id: 'molho-barbecue',
    name: 'Barbecue Rústico com Cerveja Preta',
    category: 'sauces',
    price: 3.5,
    calories: 65,
    grams: 25,
    imagePath: '/molhobarbecue.png',
    layerHeight: 14,
    description: 'Molho denso, adocicado e defumado em lenha sagrada',
  },

  // ==========================================
  // 6. EXTRAS & CROCÂNCIAS (EXTRAS)
  // ==========================================
  {
    id: 'bacon-tiras',
    name: 'Tiras de Bacon Artesanal Grelhado',
    category: 'extras',
    price: 5.0,
    calories: 140,
    grams: 30,
    imagePath: '/tirasdebacon.png',
    layerHeight: 18,
    description: 'Fatias defumadas em madeira de macieira com crocância absoluta',
  },
  {
    id: 'farofa-bacon',
    name: 'Farofa Crocante de Bacon',
    category: 'extras',
    price: 4.5,
    calories: 120,
    grams: 25,
    imagePath: '/farofadebacon.png',
    layerHeight: 14,
    description: 'Pedaços dourados estaladiços salpicados sobre o queijo quente',
  },
  {
    id: 'aneis-cebola',
    name: 'Anéis de Cebola Empanados (2 unid)',
    category: 'extras',
    price: 5.0,
    calories: 150,
    grams: 40,
    imagePath: '/aneisdecebola.png',
    layerHeight: 24,
    description: 'Cebola fresca envolta em tempurá dourado e ultra estaladiço',
  },
];

export interface BurgerPreset {
  id: string;
  name: string;
  badge: string;
  description: string;
  ingredientIds: string[];
}

export const BURGER_PRESETS: BurgerPreset[] = [
  {
    id: 'preset-classic',
    name: 'The Olympian Classic',
    badge: 'Mais Vendido',
    description: 'Brioche, Smash Duplo 160g, Cheddar derretido, Picles e Molho Especial',
    ingredientIds: [
      'pao-baixo',
      'carne-smash',
      'queijo-cheddar',
      'carne-smash',
      'queijo-cheddar',
      'picles',
      'molho-especial',
      'pao-cima',
    ],
  },
  {
    id: 'preset-fury',
    name: 'Spartan Fury',
    badge: 'Crocante',
    description: 'Brioche, Smash Duplo 160g, Cheddar, Farofa de Bacon e Molho Verde',
    ingredientIds: [
      'pao-baixo',
      'molho-verde',
      'carne-smash',
      'queijo-cheddar',
      'carne-smash',
      'farofa-bacon',
      'bacon-tiras',
      'pao-cima',
    ],
  },
  {
    id: 'preset-salad',
    name: 'Deus da Floresta (Salad)',
    badge: 'Fresco',
    description: 'Brioche, Smash 80g, Queijo Prato, Alface, Tomate e Molho Especial',
    ingredientIds: [
      'pao-baixo',
      'carne-smash',
      'queijo-prato',
      'alface',
      'tomate',
      'molho-especial',
      'pao-cima',
    ],
  },
  {
    id: 'preset-scratch',
    name: 'Começar do Zero',
    badge: 'Personalizado',
    description: 'Apenas os pães selados para você criar livremente',
    ingredientIds: ['pao-baixo', 'pao-cima'],
  },
];
