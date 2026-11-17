'use client';
 
import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { CartDrawer } from '@/components/CartDrawer';
import { OrderSuccessModal } from '@/components/OrderSuccessModal';
import { Check, ShoppingBag, X, Sparkles, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductImage } from '@/components/ProductImage';

export function GlobalCartModals() {
  const router = useRouter();
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
    lastAddedItem,
    dismissAddedNotification,
    totalCartCount,
    totalCartPrice,
  } = useCart();

  const handleCheckoutComplete = (data: any) => {
    setOrderSuccessData(data);
    setIsCartOpen(false);
    setIsSuccessModalOpen(true);
    clearCart();
  };

  const handleOpenCartFromToast = () => {
    dismissAddedNotification();
    router.push('/carinho');
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

      {/* Prominent Animated Toast when an item is added to the cart */}
      <AnimatePresence>
        {lastAddedItem && (
          <motion.div
            key={lastAddedItem.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 450, damping: 28 }}
            className="fixed bottom-5 sm:bottom-8 right-3 sm:right-8 left-3 sm:left-auto z-50 max-w-md pointer-events-auto"
          >
            <div className="bg-[#0f0e0c]/95 backdrop-blur-md text-white border-2 border-[#CD9C20] rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.7),0_0_20px_rgba(205,156,32,0.35)] flex items-center gap-3.5 relative overflow-hidden">
              {/* Subtle gold decorative gradient line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-[#CD9C20] to-emerald-400" />

              {/* Product Thumbnail or Icon */}
              <div className="w-14 h-14 rounded-xl bg-neutral-900 border border-[#CD9C20]/50 shrink-0 flex items-center justify-center overflow-hidden relative shadow-inner">
                {lastAddedItem.image ? (
                  <ProductImage
                    src={lastAddedItem.image}
                    alt={lastAddedItem.name}
                    imageCodeHint={lastAddedItem.image}
                    size={56}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#CD9C20]/20 to-black text-[#CD9C20]">
                    <ShoppingBag className="w-6 h-6 stroke-[2]" />
                  </div>
                )}
                {/* Floating mini check badge */}
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-black flex items-center justify-center text-white shadow-xs">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
              </div>

              {/* Information */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Adicionado ao Pedido!</span>
                </div>
                <h4 className="font-display text-xs sm:text-sm font-bold text-white truncate uppercase tracking-tight mt-0.5">
                  {lastAddedItem.quantity}x {lastAddedItem.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs text-neutral-300">
                  <span className="font-mono font-bold text-[#F5CB5C]">
                    R$ {lastAddedItem.totalPrice.toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-neutral-500">•</span>
                  <span className="text-[11px] text-neutral-400">
                    {totalCartCount} {totalCartCount === 1 ? 'item no total' : 'itens no total'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={dismissAddedNotification}
                  className="p-1 text-neutral-400 hover:text-white rounded-full transition-colors"
                  aria-label="Fechar notificação"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleOpenCartFromToast}
                  className="gold-gradient-bg text-[#0B0B0B] font-display font-black text-[11px] sm:text-xs px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm hover:brightness-105 active:scale-95 transition-all"
                >
                  <span>Ver Pedido</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Standard simple toast fallback */}
      {toastMessage && !lastAddedItem && (
        <div className="fixed bottom-6 right-4 sm:right-6 left-4 sm:left-auto max-w-sm z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-none">
          <div className="bg-[#181818]/95 backdrop-blur-sm border border-[#CD9C20] text-white px-4 py-3 rounded-xl shadow-[0_8px_25px_rgba(0,0,0,0.6)] flex items-center gap-3 pointer-events-auto">
            <div className="w-6 h-6 rounded-full bg-emerald-600 flex items-center justify-center text-white shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        </div>
      )}
    </>
  );
}
