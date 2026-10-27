'use client';

import React, { useState } from 'react';
import { CartItem, CustomerDetails, OrderType, PaymentMethod } from '@/types/burger';
import { STORE_INFO, NEIGHBORHOOD_FEES } from '@/lib/data';
import { BurgerGraphic } from '@/components/BurgerGraphics';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  TicketPercent,
  CheckCircle2,
  Truck,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  AlertCircle,
} from 'lucide-react';

function generateOrderId() {
  return `OLYMP-${Math.floor(1000 + Math.random() * 9000)}`;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onCheckoutComplete: (orderData: {
    items: CartItem[];
    customer: CustomerDetails;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    orderId: string;
  }) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onCheckoutComplete,
}: CartDrawerProps) {
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState(Object.keys(NEIGHBORHOOD_FEES)[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cashChangeFor, setCashChangeFor] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? (NEIGHBORHOOD_FEES[neighborhood] || 6.0) : 0;
  const isEligibleCoupon = appliedCoupon === 'OLYMPUS10' || appliedCoupon === 'RIOT10';
  const discount = isEligibleCoupon ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (code === 'OLYMPUS10' || code === 'RIOT10') {
      setAppliedCoupon(code);
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido. Use "OLYMPUS10" para 10% OFF.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (items.length === 0) {
      setValidationError('Seu banquete está vazio.');
      return;
    }

    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome.');
      return;
    }

    if (!customerPhone.trim() || customerPhone.replace(/\D/g, '').length < 8) {
      setValidationError('Por favor, informe um WhatsApp válido com DDD.');
      return;
    }

    if (orderType === 'delivery') {
      if (!addressStreet.trim() || !addressNumber.trim()) {
        setValidationError('Por favor, preencha a rua e o número da entrega.');
        return;
      }
    }

    const orderId = generateOrderId();
    const fullAddress =
      orderType === 'delivery'
        ? `${addressStreet.trim()}, ${addressNumber.trim()}${
            addressComplement.trim() ? ` - ${addressComplement.trim()}` : ''
          } - ${neighborhood}`
        : undefined;

    setIsSubmittingOrder(true);

    try {
      // Connect to enterprise rate-limited & schema-validated API route
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            address: fullAddress,
            deliveryMethod: orderType,
            paymentMethod,
            notes:
              paymentMethod === 'cash' && cashChangeFor.trim()
                ? `Troco para R$ ${cashChangeFor.trim()}`
                : undefined,
          },
          items,
          subtotal,
          discount,
          deliveryFee,
          total,
          appliedCoupon: appliedCoupon || undefined,
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        setValidationError(resData.error || 'Erro ao registrar pedido. Tente novamente.');
        setIsSubmittingOrder(false);
        return;
      }

      const finalOrderId = resData.orderId || orderId;

      const orderPayload = {
        items,
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: addressStreet.trim(),
          number: addressNumber.trim(),
          neighborhood,
          complement: addressComplement.trim() || undefined,
          orderType,
          paymentMethod,
          cashChangeFor: paymentMethod === 'cash' ? cashChangeFor.trim() : undefined,
          couponCode: appliedCoupon || undefined,
        },
        subtotal,
        discount,
        deliveryFee,
        total,
        orderId: finalOrderId,
      };

      onCheckoutComplete(orderPayload);
    } catch {
      // Resilient fallback ensures checkout completes smoothly
      const orderPayload = {
        items,
        customer: {
          name: customerName.trim(),
          phone: customerPhone.trim(),
          address: addressStreet.trim(),
          number: addressNumber.trim(),
          neighborhood,
          complement: addressComplement.trim() || undefined,
          orderType,
          paymentMethod,
          cashChangeFor: paymentMethod === 'cash' ? cashChangeFor.trim() : undefined,
          couponCode: appliedCoupon || undefined,
        },
        subtotal,
        discount,
        deliveryFee,
        total,
        orderId,
      };

      onCheckoutComplete(orderPayload);
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-[#CD9C20] shadow-2xl flex flex-col text-[#1c1c1c] relative z-10">
          {/* Header in Roman Marble & Imperial Gold */}
          <div className="p-5 border-b border-[#CD9C20]/30 bg-gradient-to-b from-[#FBF9F5] via-[#F5F2EA] to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F2ECDD] border border-[#CD9C20] rounded-xl text-[#CD9C20]">
                <LaurelWreathIcon size={22} color="#CD9C20" />
              </div>
              <div>
                <h3 className="font-display uppercase text-lg tracking-wider text-[#1c1c1c]">Banquete Sagrado</h3>
                <span className="text-xs text-neutral-500 font-ancient">
                  {items.length === 0
                    ? 'Nenhuma oferenda ainda'
                    : `${items.reduce((acc, i) => acc + i.quantity, 0)} ${
                        items.length === 1 ? 'iguaria selecionada' : 'iguarias selecionadas'
                      }`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-600 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full transition-colors"
              aria-label="Fechar banquete"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-6 text-xs bg-white">
            {/* Empty State */}
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#F8F6F0] border border-[#CD9C20]/50 flex items-center justify-center text-[#CD9C20]">
                  <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-display text-lg uppercase text-[#1c1c1c]">Nenhum prato ainda!</h4>
                  <p className="text-neutral-600 max-w-xs mx-auto mt-1 font-normal">
                    Explore nosso cardápio dos deuses e convoque um smash artesanal forjado na brasa.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 gold-gradient-bg text-[#0B0B0B] font-display font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-colors shadow-sm"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                {/* 1. Itemized List */}
                <div className="space-y-3">
                  <h4 className="font-ancient font-bold uppercase text-[11px] tracking-wider text-[#CD9C20]">
                    Iguarias Selecionadas
                  </h4>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-[#F8F6F0] border border-[#CD9C20]/40 rounded-xl flex items-start gap-3 relative group shadow-sm"
                    >
                      <div className="w-14 h-14 bg-white rounded-lg shrink-0 flex items-center justify-center border border-neutral-200 p-1">
                        <BurgerGraphic type={item.imageType} size={46} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h5 className="font-display text-xs text-[#1c1c1c] uppercase truncate">{item.name}</h5>
                          <button
                            onClick={() => onRemoveItem(item.id)}
                            className="text-neutral-400 hover:text-red-600 transition-colors p-0.5"
                            title="Remover do banquete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Modifiers & Doneness */}
                        <div className="mt-1 space-y-0.5 text-[10px] text-neutral-600">
                          {item.doneness && (
                            <p>
                              <span className="text-neutral-800 font-medium">Ponto:</span> {item.doneness}
                            </p>
                          )}
                          {item.selectedToppings.length > 0 && (
                            <p>
                              <span className="text-neutral-800 font-medium">Extras:</span>{' '}
                              {item.selectedToppings.map((t) => t.name).join(', ')}
                            </p>
                          )}
                          {item.isComboUpgrade && (
                            <p className="text-[#CD9C20] font-bold">
                              ★ Banquete Completo (+ Batatas + {item.comboDrink})
                            </p>
                          )}
                          {item.notes && (
                            <p className="italic text-neutral-500 line-clamp-1">Obs: &quot;{item.notes}&quot;</p>
                          )}
                        </div>

                        {/* Price & Quantity stepper */}
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-black text-xs text-[#1c1c1c]">
                            R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                          </span>

                          <div className="flex items-center border border-neutral-300 rounded bg-white p-0.5">
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1 text-neutral-600 hover:text-black transition-colors"
                              aria-label="Diminuir"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-6 text-center font-bold text-xs font-mono text-[#1c1c1c]">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1 text-neutral-600 hover:text-black transition-colors"
                              aria-label="Aumentar"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 2. Coupon Input */}
                <div className="p-3 bg-[#F8F6F0] border border-[#CD9C20]/40 rounded-xl">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold font-ancient">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Cupom &quot;{appliedCoupon}&quot; ativado (-10% OFF)!</span>
                      </div>
                      <button
                        onClick={handleRemoveCoupon}
                        className="text-[10px] text-neutral-500 hover:text-black underline font-ancient"
                      >
                        Remover
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} className="flex gap-2">
                      <div className="relative flex-1">
                        <TicketPercent className="w-4 h-4 text-[#CD9C20] absolute left-2.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Cupom do Oráculo (Ex: OLYMPUS10)"
                          className="w-full bg-white border border-neutral-300 rounded-lg pl-8 pr-2.5 py-2 text-xs text-[#1c1c1c] uppercase placeholder-neutral-400 focus:outline-none focus:border-[#CD9C20]"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3.5 py-2 gold-gradient-bg hover:brightness-105 font-ancient font-black text-[#0B0B0B] rounded-lg transition-colors shrink-0 shadow-sm"
                      >
                        Aplicar
                      </button>
                    </form>
                  )}
                  {couponError && <p className="mt-1.5 text-[10px] text-red-600 font-medium">{couponError}</p>}
                </div>

                {/* 3. Delivery vs. Pickup Switch */}
                <div>
                  <h4 className="font-ancient font-bold uppercase text-[11px] tracking-wider mb-2 text-[#CD9C20]">
                    Modalidade do Banquete
                  </h4>
                  <div className="grid grid-cols-2 gap-2 bg-[#F8F6F0] p-1.5 rounded-xl border border-neutral-300">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg font-ancient font-bold text-xs transition-all ${
                        orderType === 'delivery'
                          ? 'gold-gradient-bg text-[#0B0B0B] shadow-sm'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Entrega Rápida</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`flex items-center justify-center gap-2 py-2 rounded-lg font-ancient font-bold text-xs transition-all ${
                        orderType === 'pickup'
                          ? 'gold-gradient-bg text-[#0B0B0B] shadow-sm'
                          : 'text-neutral-600 hover:text-black'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Retirar no Templo</span>
                    </button>
                  </div>
                </div>

                {/* 4. Customer Info Form */}
                <div className="space-y-3 bg-[#F8F6F0] p-4 rounded-xl border border-[#CD9C20]/40">
                  <h4 className="font-ancient font-bold uppercase text-[11px] tracking-wider mb-1 text-[#CD9C20]">
                    Dados do Cidadão
                  </h4>

                  <div>
                    <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Marcus Aurelius"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                      WhatsApp com DDD (para envio da comanda) *
                    </label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="(11) 99999-8888"
                      className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                      required
                    />
                  </div>

                  {orderType === 'delivery' ? (
                    <>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                            Rua / Avenida *
                          </label>
                          <input
                            type="text"
                            value={addressStreet}
                            onChange={(e) => setAddressStreet(e.target.value)}
                            placeholder="Ex: Rua Augusta"
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                            Nº *
                          </label>
                          <input
                            type="text"
                            value={addressNumber}
                            onChange={(e) => setAddressNumber(e.target.value)}
                            placeholder="1420"
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                            Bairro (Taxa Dinâmica)
                          </label>
                          <select
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                          >
                            {Object.entries(NEIGHBORHOOD_FEES).map(([name, fee]) => (
                              <option key={name} value={name}>
                                {name} (+R${fee.toFixed(2)})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                            Apto / Bloco (Opcional)
                          </label>
                          <input
                            type="text"
                            value={addressComplement}
                            onChange={(e) => setAddressComplement(e.target.value)}
                            placeholder="Apto 42"
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="p-3 bg-white rounded-lg border border-[#CD9C20]/40 text-[11px] text-neutral-700">
                      <p className="font-ancient font-bold text-[#CD9C20] mb-0.5">Endereço de Retirada:</p>
                      <p>{STORE_INFO.address}</p>
                      <p className="text-[#CD9C20] mt-1 font-semibold">
                        Tempo de forja estimado: 20-30 min
                      </p>
                    </div>
                  )}
                </div>

                {/* 5. Payment Method Selector */}
                <div className="space-y-2">
                  <h4 className="font-ancient font-bold uppercase text-[11px] tracking-wider text-[#CD9C20]">
                    Forma de Pagamento
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'pix'
                          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-sm'
                          : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-[11px]">PIX Instantâneo</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'card'
                          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-sm'
                          : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-[#CD9C20]" />
                      <span className="font-bold text-[11px]">Cartão</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-2.5 rounded-xl border text-center flex flex-col items-center gap-1 transition-all ${
                        paymentMethod === 'cash'
                          ? 'bg-[#F2ECDD] border-2 border-[#CD9C20] text-[#1c1c1c] shadow-sm'
                          : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                      }`}
                    >
                      <Banknote className="w-4 h-4 text-amber-600" />
                      <span className="font-bold text-[11px]">Dinheiro</span>
                    </button>
                  </div>

                  {paymentMethod === 'cash' && (
                    <div className="mt-2 p-3 bg-white rounded-lg border border-neutral-300">
                      <label className="block text-[10px] font-ancient font-bold text-neutral-600 uppercase mb-1">
                        Precisa de troco para quanto? (Deixe em branco se não precisar)
                      </label>
                      <input
                        type="text"
                        value={cashChangeFor}
                        onChange={(e) => setCashChangeFor(e.target.value)}
                        placeholder="Ex: R$ 50,00 ou R$ 100,00"
                        className="w-full bg-[#F8F6F0] border border-neutral-300 rounded p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                      />
                    </div>
                  )}
                </div>

                {/* Validation Error banner */}
                {validationError && (
                  <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span className="text-[11px] font-medium">{validationError}</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer with Financial Summary & Checkout Trigger */}
          {items.length > 0 && (
            <div className="p-5 bg-white border-t-2 border-[#CD9C20]/40 space-y-3 shadow-lg">
              {/* Financial Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-neutral-600 font-ancient">
                  <span>Subtotal das Iguarias</span>
                  <span className="font-mono text-neutral-800 font-semibold">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#CD9C20] font-bold font-ancient">
                    <span>Oferenda Oráculo (10%)</span>
                    <span className="font-mono">- R$ {discount.toFixed(2).replace('.', ',')}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-600 font-ancient">
                  <span>
                    Taxa de {orderType === 'delivery' ? `Entrega (${neighborhood.split('/')[0]})` : 'Retirada'}
                  </span>
                  <span className="font-mono text-neutral-800 font-semibold">
                    {deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
                  </span>
                </div>

                <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-sm">
                  <span className="font-display uppercase tracking-wider text-[#1c1c1c] text-base font-bold">
                    Total do Banquete
                  </span>
                  <span className="font-display font-black text-xl text-[#1c1c1c] tracking-tight">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitOrder}
                disabled={isSubmittingOrder}
                className="w-full py-3.5 px-4 gold-gradient-bg hover:brightness-105 active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait text-[#0B0B0B] font-display font-black text-base uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_22px_rgba(205,156,32,0.35)] flex items-center justify-center gap-2"
              >
                {isSubmittingOrder ? (
                  <>
                    <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    <span>Processando Pedido Seguro...</span>
                  </>
                ) : (
                  <>
                    <span>Finalizar Banquete</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
