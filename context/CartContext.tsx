'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, CustomerDetails, ExtraTopping, MeatDoneness, MenuItem } from '@/types/burger';

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartShake: boolean;
  triggerCartAnimation: () => void;
  addToCart: (customized: {
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
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  orderSuccessData: {
    items: CartItem[];
    customer: CustomerDetails;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    orderId: string;
  } | null;
  setOrderSuccessData: (data: any) => void;
  isSuccessModalOpen: boolean;
  setIsSuccessModalOpen: (open: boolean) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  totalCartCount: number;
  totalCartPrice: number;
  isNavigating: boolean;
  navigatingItemName: string | null;
  startNavigation: (itemName?: string) => void;
  stopNavigation: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartShake, setCartShake] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [orderSuccessData, setOrderSuccessData] = useState<any | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingItemName, setNavigatingItemName] = useState<string | null>(null);

  // Load cart from localStorage asynchronously after client mount to eliminate SSR mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const saved = localStorage.getItem('stackriot_cart');
        if (saved) {
          setCartItems(JSON.parse(saved));
        }
      } catch {
        // ignore
      } finally {
        setIsLoaded(true);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const startNavigation = React.useCallback((itemName?: string) => {
    setIsNavigating(true);
    if (itemName) setNavigatingItemName(itemName);
  }, []);

  const stopNavigation = React.useCallback(() => {
    setIsNavigating(false);
    setNavigatingItemName(null);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem('stackriot_cart', JSON.stringify(cartItems));
    } catch {
      // ignore
    }
  }, [cartItems, isLoaded]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const triggerCartAnimation = () => {
    setCartShake(true);
    setTimeout(() => setCartShake(false), 500);
  };

  const addToCart = (customized: {
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
  }) => {
    const newItem: CartItem = {
      id: `${customized.menuItemId}-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      ...customized,
    };

    setCartItems((prev) => [...prev, newItem]);
    triggerCartAnimation();
    showToast(`"${customized.name}" adicionado ao pedido!`);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              totalPrice: item.unitPrice * newQty,
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const removeItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    showToast('Item removido da comanda.');
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, i) => acc + i.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setIsCartOpen,
        cartShake,
        triggerCartAnimation,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        orderSuccessData,
        setOrderSuccessData,
        isSuccessModalOpen,
        setIsSuccessModalOpen,
        toastMessage,
        showToast,
        totalCartCount,
        totalCartPrice,
        isNavigating,
        navigatingItemName,
        startNavigation,
        stopNavigation,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
