'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { Check } from 'lucide-react';

export function GlobalCartModals() {
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    clearCart,
    orderSuccessData,
    setOrderSuccessData,
    isSuccessModalOpen,
    setIsSuccessModalOpen,
    toastMessage,
  } = useCart();

  const handleCheckoutComplete = (data: any) => {
    setOrderSuccessData(data);
    setIsCartOpen(false);
    setIsSuccessModalOpen(true);
    clearCart();
  };

  return (
    <>
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onCheckoutComplete={handleCheckoutComplete}
      />

      <OrderSuccessModal
        orderData={orderSuccessData}
        isOpen={isSuccessModalOpen}
        onClose={() => setIsSuccessModalOpen(false)}
      />

      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
          <div className="bg-[#181818] border border-[#D91E18] text-white px-4 py-3 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-3 pointer-events-auto">
            <div className="w-6 h-6 rounded-full bg-[#D91E18] flex items-center justify-center text-white shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
