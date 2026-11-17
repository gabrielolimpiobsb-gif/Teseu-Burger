'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { CartItem, CustomerDetails, OrderType, PaymentMethod } from '@/types/burger';
import { STORE_INFO, MENU_ITEMS, NEIGHBORHOOD_FEES, NEIGHBORHOOD_COUPONS, getStoreWhatsAppUrl } from '@/lib/data';
import { ProductImage } from '@/components/ProductImage';
import { LaurelWreathIcon, SpartanHelmetIcon } from '@/components/GreekOrnament';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  TicketPercent,
  CheckCircle2,
  Truck,
  Store,
  QrCode,
  CreditCard,
  Banknote,
  AlertCircle,
  AlertTriangle,
  Gift,
  Sparkles,
  MessageSquare,
  Info,
  Check,
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
  // 3 Distinct Steps: 1: Conferir Pedido | 2: Informações | 3: Forma de Pagamento
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Step 2: Customer & Delivery Info
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState(Object.keys(NEIGHBORHOOD_FEES)[0]);
  const [orderNotes, setOrderNotes] = useState('');

  // Step 3: Payment Method (internal control only, zero site charging)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardType, setCardType] = useState<'debito' | 'credito'>('debito');
  const [cashChangeFor, setCashChangeFor] = useState('');

  // Coupons
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [appliedNeighborhoodCoupon, setAppliedNeighborhoodCoupon] = useState<{
    code: string;
    neighborhood: string;
    giftTitle: string;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? (NEIGHBORHOOD_FEES[neighborhood] || 6.0) : 0;
  const isEligibleCoupon = appliedCoupon === 'OLYMPUS10' || appliedCoupon === 'RIOT10';
  const discount = isEligibleCoupon ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);
  const totalQuantity = items.reduce((acc, i) => acc + i.quantity, 0);

  // Regra: Válido exclusivamente 1 brinde por compra de Combo Casal. Fora disso o brinde não é válido!
  const hasStandaloneGift = items.some(
    (item) =>
      item.menuItemId.startsWith('brinde-') ||
      (item.unitPrice === 0 && item.drawnSweetGift && !item.comboCasal)
  );
  const hasComboCasal = items.some(
    (item) => Boolean(item.comboCasal) || item.menuItemId === 'combo-casal'
  );
  const needsComboCasalForGift = hasStandaloneGift && !hasComboCasal;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();
    if (code === 'OLYMPUS10' || code === 'RIOT10') {
      setAppliedCoupon(code);
      setAppliedNeighborhoodCoupon(null);
      setCouponInput('');
    } else if (NEIGHBORHOOD_COUPONS[code]) {
      const nCoupon = NEIGHBORHOOD_COUPONS[code];
      setAppliedNeighborhoodCoupon(nCoupon);
      setAppliedCoupon(code);
      setCouponInput('');
    } else {
      setCouponError('Cupom inválido. Use OLYMPUS10 para 10% OFF ou o código do seu bairro.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedNeighborhoodCoupon(null);
    setCouponError(null);
  };

  const validateStep2 = () => {
    setValidationError(null);
    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setValidationError('Por favor, informe um WhatsApp válido com DDD.');
      return false;
    }
    if (orderType === 'delivery') {
      if (!addressStreet.trim()) {
        setValidationError('Por favor, informe a rua ou avenida de entrega.');
        return false;
      }
      if (!addressNumber.trim()) {
        setValidationError('Por favor, informe o número da residência.');
        return false;
      }
    }
    return true;
  };

  const handleNextFromStep1 = () => {
    setValidationError(null);
    if (items.length === 0) {
      setValidationError('Seu pedido está vazio.');
      return;
    }
    if (needsComboCasalForGift) {
      setValidationError('O brinde gratuito é válido exclusivamente na compra de 1 Combo Casal. Adicione 1 Combo Casal para continuar!');
      return;
    }
    setCurrentStep(2);
  };

  const handleNextFromStep2 = () => {
    if (validateStep2()) {
      setCurrentStep(3);
    }
  };

  const generateWhatsAppMessage = (orderId: string) => {
    const itemsText = items
      .map((item, idx) => {
        let details = '';
        if (item.comboCasal) {
          details += `\n   🍔 *Burger 1:* ${item.comboCasal.burger1.name} ${item.comboCasal.burger1.doneness ? `(${item.comboCasal.burger1.doneness})` : ''}`;
          details += `\n   🍔 *Burger 2:* ${item.comboCasal.burger2.name} ${item.comboCasal.burger2.doneness ? `(${item.comboCasal.burger2.doneness})` : ''}`;
          details += `\n   🥤 *Bebidas:* ${item.comboCasal.drink1.name} + ${item.comboCasal.drink2.name}`;
          details += `\n   🍟 *Batatas:* ${item.comboCasal.fries1.name} + ${item.comboCasal.fries2.name}`;
        } else {
          if (item.doneness) details += `\n   - Ponto: ${item.doneness}`;
          if (item.selectedToppings.length > 0) {
            details += `\n   - Extras: ${item.selectedToppings.map((t) => t.name).join(', ')}`;
          }
          if (item.selectedSauces && item.selectedSauces.length > 0) {
            details += `\n   - Molhos: ${item.selectedSauces.map((s) => s.name).join(', ')}`;
          }
          if (item.selectedFries) {
            details += `\n   - Batata: ${item.selectedFries.name}`;
          }
          if (item.selectedDrink) {
            details += `\n   - Bebida: ${item.selectedDrink.name}`;
          }
        }

        if (item.drawnSweetGift) {
          details += `\n   🎁 *Doce Brinde:* ${item.drawnSweetGift} (100% Grátis no Caça-Níqueis)`;
        }

        if (item.notes) details += `\n   - Obs: "${item.notes}"`;

        return `${idx + 1}. *${item.quantity}x ${item.name}* (R$ ${item.totalPrice.toFixed(2).replace('.', ',')})${details}`;
      })
      .join('\n\n');

    const addressText =
      orderType === 'delivery'
        ? `*Endereço:* ${addressStreet.trim()}, nº ${addressNumber.trim()}${
            addressComplement.trim() ? ` (${addressComplement.trim()})` : ''
          } - ${neighborhood}`
        : `*Modalidade:* RETIRADA NO TEMPLO (${STORE_INFO.address})`;

    let paymentLabel = '';
    if (paymentMethod === 'pix') {
      paymentLabel = 'PIX (Solicito a chave Pix no WhatsApp)';
    } else if (paymentMethod === 'card') {
      paymentLabel = `Cartão na Maquininha (${cardType === 'debito' ? 'Débito' : 'Crédito'})`;
    } else {
      paymentLabel = `Dinheiro na Entrega ${cashChangeFor.trim() ? `(Troco para R$ ${cashChangeFor.trim()})` : '(Sem troco)'}`;
    }

    const neighborhoodCouponData =
      appliedCoupon ? NEIGHBORHOOD_COUPONS[appliedCoupon.toUpperCase()] : null;

    const sweetGiftCouponText = neighborhoodCouponData
      ? `🎁 *DOCE BRINDE DO BAIRRO:* ${neighborhoodCouponData.giftTitle} (Cupom: ${appliedCoupon})\n----------------------------------------\n`
      : '';

    const obsText = orderNotes.trim() ? `\n*Observações do Cliente:* "${orderNotes.trim()}"\n` : '';

    const rawMessage = `🏛️ *PEDIDO TESEU BURGER // TEMPLO DO SMASH*
*Comanda:* #${orderId}
----------------------------------------
*Cliente:* ${customerName.trim()}
*WhatsApp:* ${customerPhone.trim()}
${addressText}${obsText}
----------------------------------------
*ITENS DO PEDIDO:*
${itemsText}
----------------------------------------
${sweetGiftCouponText}*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}
${discount > 0 ? `*Desconto Oráculo:* - R$ ${discount.toFixed(2).replace('.', ',')}\n` : ''}*Taxa de Entrega:* ${deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis'}
*TOTAL DO PEDIDO:* R$ ${total.toFixed(2).replace('.', ',')}
----------------------------------------
*Forma de Pagamento Desejada:* ${paymentLabel}
----------------------------------------
_Pedido enviado pelo cardápio digital do Teseu Burger._`;

    return encodeURIComponent(rawMessage);
  };

  const handleFinalSubmitOrder = async () => {
    setValidationError(null);

    if (!validateStep2()) {
      setCurrentStep(2);
      return;
    }

    const orderId = generateOrderId();
    const fullAddress =
      orderType === 'delivery'
        ? `${addressStreet.trim()}, ${addressNumber.trim()}${
            addressComplement.trim() ? ` - ${addressComplement.trim()}` : ''
          } - ${neighborhood}`
        : undefined;

    setIsSubmittingOrder(true);

    const paymentNotes =
      paymentMethod === 'cash' && cashChangeFor.trim()
        ? `Troco para R$ ${cashChangeFor.trim()}`
        : paymentMethod === 'card'
        ? `Cartão: ${cardType}`
        : undefined;

    const finalNotes = [orderNotes.trim(), paymentNotes].filter(Boolean).join(' | ') || undefined;

    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            name: customerName.trim(),
            phone: customerPhone.trim(),
            address: fullAddress,
            deliveryMethod: orderType,
            paymentMethod,
            notes: finalNotes,
          },
          items,
          subtotal,
          discount,
          deliveryFee,
          total,
          appliedCoupon: appliedCoupon || undefined,
        }),
      });
    } catch {
      // Seamless graceful fallback
    }

    // Build WhatsApp URL and open directly in a new window/tab
    const waUrl = getStoreWhatsAppUrl(generateWhatsAppMessage(orderId));
    window.open(waUrl, '_blank');

    setIsSubmittingOrder(false);

    onCheckoutComplete({
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
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-white border-l-2 border-[#CD9C20] shadow-2xl flex flex-col text-[#1c1c1c] relative z-10">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#CD9C20]/30 bg-gradient-to-b from-[#FBF9F5] via-[#F5F2EA] to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#F2ECDD] border border-[#CD9C20] rounded-xl text-[#CD9C20]">
                <LaurelWreathIcon size={22} color="#CD9C20" />
              </div>
              <div>
                <h3 className="font-display uppercase text-base sm:text-lg tracking-wider text-[#1c1c1c]">
                  Carrinho de Pedidos
                </h3>
                <span className="text-xs text-neutral-500 font-ancient">
                  {totalQuantity === 0
                    ? 'Nenhum item adicionado'
                    : `${totalQuantity} ${totalQuantity === 1 ? 'item adicionado' : 'itens adicionados'}`}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-neutral-600 hover:text-black bg-white hover:bg-neutral-100 border border-neutral-300 rounded-full transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3-Step Navigation Stepper Tabs */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-[#FAF8F5] border-b border-neutral-200 flex items-center justify-between text-xs font-ancient font-bold select-none">
              {/* Step 1 Tab */}
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  currentStep === 1
                    ? 'bg-[#1c1c1c] text-[#F5CB5C] shadow-xs'
                    : currentStep > 1
                    ? 'text-emerald-700 hover:bg-[#F2ECDD]'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-[#CD9C20] text-black font-black'
                }`}>
                  {currentStep > 1 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '1'}
                </span>
                <span className="text-[11px] sm:text-xs">1. Pedido</span>
              </button>

              <span className="text-neutral-300">→</span>

              {/* Step 2 Tab */}
              <button
                type="button"
                onClick={() => {
                  if (items.length > 0) setCurrentStep(2);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  currentStep === 2
                    ? 'bg-[#1c1c1c] text-[#F5CB5C] shadow-xs'
                    : currentStep > 2
                    ? 'text-emerald-700 hover:bg-[#F2ECDD]'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep > 2 ? 'bg-emerald-600 text-white' : currentStep === 2 ? 'bg-[#CD9C20] text-black font-black' : 'bg-neutral-300 text-neutral-700'
                }`}>
                  {currentStep > 2 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '2'}
                </span>
                <span className="text-[11px] sm:text-xs">2. Informações</span>
              </button>

              <span className="text-neutral-300">→</span>

              {/* Step 3 Tab */}
              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all ${
                  currentStep === 3
                    ? 'bg-[#1c1c1c] text-[#F5CB5C] shadow-xs'
                    : 'text-neutral-500 hover:text-black'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  currentStep === 3 ? 'bg-[#CD9C20] text-black font-black' : 'bg-neutral-300 text-neutral-700'
                }`}>
                  3
                </span>
                <span className="text-[11px] sm:text-xs">3. Pagamento</span>
              </button>
            </div>
          )}

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white text-xs">
            {/* Empty State */}
            {items.length === 0 ? (
              <div className="py-16 text-center space-y-4">
                <div className="w-20 h-20 mx-auto rounded-full bg-[#F8F6F0] border border-[#CD9C20]/50 flex items-center justify-center text-[#CD9C20]">
                  <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
                </div>
                <div>
                  <h4 className="font-display text-lg uppercase text-[#1c1c1c]">Seu carrinho está vazio</h4>
                  <p className="text-neutral-600 max-w-xs mx-auto mt-1 font-normal">
                    Adicione hambúrgueres artesanais forjados no fogo sagrado para começar seu banquete!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2.5 gold-gradient-bg text-[#0B0B0B] font-display font-black uppercase tracking-wider rounded-xl hover:brightness-105 transition-colors shadow-sm"
                >
                  Ver Cardápio
                </button>
              </div>
            ) : (
              <>
                {/* ======================================================== */}
                {/* ETAPA 1: CONFERIR PEDIDO                                 */}
                {/* ======================================================== */}
                {currentStep === 1 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-ancient font-bold uppercase text-[11px] tracking-wider text-[#CD9C20]">
                        Itens Selecionados ({totalQuantity})
                      </span>
                      <span className="text-[11px] text-neutral-500">
                        Revise antes de avançar
                      </span>
                    </div>

                    {/* Alerta de Regra: Brinde Condicionado ao Combo Casal */}
                    {needsComboCasalForGift && (
                      <div className="p-3 bg-amber-50 border-2 border-amber-400 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-sm animate-pulse">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="font-bold text-amber-950 uppercase tracking-wide">
                            Regra Oficial do Brinde:
                          </p>
                          <p className="text-[11px] text-amber-900 mt-0.5 leading-snug">
                            Cada usuário pode ganhar só <strong>1 brinde por compra de Combo Casal</strong>. Fora da compra do combo, o brinde não é válido!
                          </p>
                          <Link
                            href="/produto/combo-casal"
                            onClick={onClose}
                            className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-zinc-950 rounded-lg font-black text-[10px] uppercase tracking-wider hover:brightness-110 transition shadow-xs"
                          >
                            <span>Adicionar Combo Casal</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    )}

                    {/* Item Cards */}
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 bg-[#FAF8F5] border border-[#CD9C20]/40 rounded-xl flex items-start gap-3 relative shadow-xs hover:border-[#CD9C20] transition-colors"
                        >
                          {/* Thumbnail */}
                          <div className="w-14 h-14 bg-white rounded-lg shrink-0 flex items-center justify-center border border-neutral-200 overflow-hidden relative">
                            <ProductImage
                              src={
                                item.image ||
                                MENU_ITEMS.find((m) => m.id === item.menuItemId)?.image ||
                                item.comboCasal?.burger1?.image ||
                                (item.menuItemId?.startsWith('custom-burger') ? '/zeus.png' : undefined)
                              }
                              alt={item.name}
                              imageCodeHint={item.image || `/${item.imageType}.png`}
                              size={52}
                              compactFallback
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h5 className="font-display text-xs font-bold text-[#1c1c1c] uppercase truncate">
                                {item.name}
                              </h5>
                              <button
                                type="button"
                                onClick={() => onRemoveItem(item.id)}
                                className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                                title="Remover item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Combo Casal Breakdown */}
                            {item.comboCasal ? (
                              <div className="mt-1.5 p-2 bg-[#F5F0E4] rounded-lg border border-[#CD9C20]/30 space-y-1 text-[11px]">
                                <div className="text-neutral-800">
                                  <span className="font-bold text-[#CD9C20]">🍔 Burgers:</span>{' '}
                                  1. {item.comboCasal.burger1.name} {item.comboCasal.burger1.doneness && `(${item.comboCasal.burger1.doneness})`} |{' '}
                                  2. {item.comboCasal.burger2.name} {item.comboCasal.burger2.doneness && `(${item.comboCasal.burger2.doneness})`}
                                </div>
                                <div className="text-neutral-800">
                                  <span className="font-bold text-[#CD9C20]">🥤 Bebidas:</span>{' '}
                                  {item.comboCasal.drink1.name} e {item.comboCasal.drink2.name}
                                </div>
                                <div className="text-neutral-800">
                                  <span className="font-bold text-[#CD9C20]">🍟 Batatas:</span>{' '}
                                  {item.comboCasal.fries1.name} {item.comboCasal.fries1.extraPrice > 0 && `(+R$ ${item.comboCasal.fries1.extraPrice.toFixed(2).replace('.', ',')})`}{' '}
                                  e {item.comboCasal.fries2.name} {item.comboCasal.fries2.extraPrice > 0 && `(+R$ ${item.comboCasal.fries2.extraPrice.toFixed(2).replace('.', ',')})`}
                                </div>
                              </div>
                            ) : (
                              /* Single Item Modifiers */
                              <div className="mt-1 space-y-0.5 text-[11px] text-neutral-600">
                                {item.doneness && (
                                  <p>
                                    <span className="text-neutral-800 font-medium">Ponto da carne:</span> {item.doneness}
                                  </p>
                                )}
                                {item.selectedToppings.length > 0 && (
                                  <p>
                                    <span className="text-neutral-800 font-medium">Extras:</span>{' '}
                                    {item.selectedToppings.map((t) => t.name).join(', ')}
                                  </p>
                                )}
                                {item.selectedSauces && item.selectedSauces.length > 0 && (
                                  <p>
                                    <span className="text-neutral-800 font-medium">Molhos:</span>{' '}
                                    {item.selectedSauces.map((s) => s.name).join(', ')}
                                  </p>
                                )}
                                {item.selectedFries && (
                                  <p className="text-amber-800 font-semibold">
                                    🍟 {item.selectedFries.name}
                                  </p>
                                )}
                                {item.selectedDrink && (
                                  <div className="flex items-center gap-1.5 text-neutral-800 font-medium">
                                    {item.selectedDrink.image && (
                                      <span className="w-4 h-4 rounded overflow-hidden shrink-0 inline-flex items-center justify-center">
                                        <Image
                                          src={item.selectedDrink.image}
                                          alt={item.selectedDrink.name}
                                          width={16}
                                          height={16}
                                          referrerPolicy="no-referrer"
                                          className="object-contain"
                                        />
                                      </span>
                                    )}
                                    <span>🥤 {item.selectedDrink.name}</span>
                                  </div>
                                )}
                                {item.isComboUpgrade && (
                                  <p className="text-[#CD9C20] font-bold">
                                    ★ Combo Completo (+ Batatas + {item.comboDrink})
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Free Sweet Prize Badge */}
                            {item.drawnSweetGift && (
                              <div className="mt-1.5 flex items-center justify-between bg-emerald-50 text-emerald-800 px-2 py-1 rounded-md border border-emerald-300 text-[10px]">
                                <span className="flex items-center gap-1 font-semibold truncate">
                                  <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                  <span className="truncate">Doce: {item.drawnSweetGift}</span>
                                </span>
                                <span className="font-bold uppercase tracking-wider text-emerald-700 shrink-0">
                                  ★ GRÁTIS ★
                                </span>
                              </div>
                            )}

                            {item.notes && (
                              <p className="mt-1 italic text-neutral-500 text-[10px]">
                                Obs: &quot;{item.notes}&quot;
                              </p>
                            )}

                            {/* Price & Quantity stepper */}
                            <div className="mt-2.5 pt-2 border-t border-neutral-200/60 flex items-center justify-between">
                              <span className="font-mono font-black text-xs text-[#1c1c1c]">
                                R$ {item.totalPrice.toFixed(2).replace('.', ',')}
                              </span>

                              <div className="flex items-center border border-neutral-300 rounded-lg bg-white p-0.5 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.id, -1)}
                                  className="p-1 text-neutral-600 hover:text-black transition-colors"
                                  aria-label="Diminuir quantidade"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-7 text-center font-bold text-xs font-mono text-[#1c1c1c]">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateQuantity(item.id, 1)}
                                  className="p-1 text-neutral-600 hover:text-black transition-colors"
                                  aria-label="Aumentar quantidade"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Coupon Input */}
                    <div className="p-3 bg-[#FAF8F5] border border-neutral-300 rounded-xl">
                      {appliedCoupon ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Cupom &quot;{appliedCoupon}&quot; ativado!</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemoveCoupon}
                            className="text-[11px] text-neutral-500 hover:text-black underline font-ancient shrink-0 ml-2"
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
                              placeholder="Cupom de desconto (Ex: OLYMPUS10)"
                              className="w-full bg-white border border-neutral-300 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-[#1c1c1c] uppercase placeholder-neutral-400 focus:outline-none focus:border-[#CD9C20]"
                            />
                          </div>
                          <button
                            type="submit"
                            className="px-3 py-1.5 gold-gradient-bg hover:brightness-105 font-ancient font-black text-[#0B0B0B] rounded-lg transition-colors shrink-0 shadow-xs"
                          >
                            Aplicar
                          </button>
                        </form>
                      )}
                      {couponError && <p className="mt-1 text-[10px] text-red-600 font-medium">{couponError}</p>}
                    </div>

                    {/* Step 1 Subtotal preview */}
                    <div className="p-3 bg-[#FAF8F5] rounded-xl border border-neutral-200 space-y-1.5">
                      <div className="flex justify-between text-neutral-600 font-ancient">
                        <span>Subtotal dos itens</span>
                        <span className="font-mono font-semibold text-neutral-800">
                          R$ {subtotal.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-bold font-ancient">
                          <span>Desconto do Cupom (10%)</span>
                          <span className="font-mono">- R$ {discount.toFixed(2).replace('.', ',')}</span>
                        </div>
                      )}
                      <p className="text-[10px] text-neutral-500 pt-1">
                        * A taxa de entrega será calculada no próximo passo com base no seu bairro.
                      </p>
                    </div>

                    {/* Step 1 Advance Button */}
                    <button
                      type="button"
                      onClick={handleNextFromStep1}
                      className="w-full py-3.5 px-4 gold-gradient-bg hover:brightness-105 active:scale-[0.98] text-[#0B0B0B] font-display font-black text-sm uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Avançar para Informações (Etapa 2)</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                )}

                {/* ======================================================== */}
                {/* ETAPA 2: INFORMAÇÕES DE ENTREGA / RETIRADA               */}
                {/* ======================================================== */}
                {currentStep === 2 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-ancient font-bold uppercase text-[11px] tracking-wider text-[#CD9C20]">
                        Informações do Cliente
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        Etapa 2 de 3
                      </span>
                    </div>

                    {/* Modalidade Toggle */}
                    <div>
                      <label className="block text-[11px] font-ancient font-bold text-neutral-700 uppercase mb-1.5">
                        Como deseja receber seu pedido? *
                      </label>
                      <div className="grid grid-cols-2 gap-2 bg-[#FAF8F5] p-1.5 rounded-xl border border-neutral-300">
                        <button
                          type="button"
                          onClick={() => setOrderType('delivery')}
                          className={`flex items-center justify-center gap-2 py-2 rounded-lg font-ancient font-bold text-xs transition-all ${
                            orderType === 'delivery'
                              ? 'gold-gradient-bg text-[#0B0B0B] shadow-sm'
                              : 'text-neutral-600 hover:text-black'
                          }`}
                        >
                          <Truck className="w-4 h-4" />
                          <span>Entrega (Delivery)</span>
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
                          <Store className="w-4 h-4" />
                          <span>Retirar no Templo</span>
                        </button>
                      </div>
                    </div>

                    {/* Contact Details */}
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-neutral-200 space-y-3">
                      <div>
                        <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                          Seu Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: João da Silva"
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                          WhatsApp com DDD (para envio da comanda) *
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ex: (61) 99999-8888"
                          className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                          required
                        />
                      </div>
                    </div>

                    {/* Address for Delivery or Pickup Details */}
                    {orderType === 'delivery' ? (
                      <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-neutral-200 space-y-3">
                        <span className="block font-ancient font-bold uppercase text-[10px] text-[#CD9C20] tracking-wider">
                          Endereço de Entrega
                        </span>

                        <div>
                          <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                            Bairro (Taxa de Entrega Dinâmica) *
                          </label>
                          <select
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                          >
                            {Object.entries(NEIGHBORHOOD_FEES).map(([name, fee]) => (
                              <option key={name} value={name}>
                                {name} (+ R$ {fee.toFixed(2).replace('.', ',')})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                              Rua / Avenida *
                            </label>
                            <input
                              type="text"
                              value={addressStreet}
                              onChange={(e) => setAddressStreet(e.target.value)}
                              placeholder="Ex: Rua 14 Sul"
                              className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                              Número *
                            </label>
                            <input
                              type="text"
                              value={addressNumber}
                              onChange={(e) => setAddressNumber(e.target.value)}
                              placeholder="104"
                              className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                              required
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                            Complemento / Referência (Opcional)
                          </label>
                          <input
                            type="text"
                            value={addressComplement}
                            onChange={(e) => setAddressComplement(e.target.value)}
                            placeholder="Ex: Apto 302, Bloco C / Em frente à praça"
                            className="w-full bg-white border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#CD9C20]/50 space-y-2">
                        <div className="flex items-center gap-2 text-[#CD9C20] font-ancient font-bold text-xs uppercase">
                          <Store className="w-4 h-4" />
                          <span>Endereço de Retirada no Balcão</span>
                        </div>
                        <p className="text-neutral-800 font-medium text-xs">
                          {STORE_INFO.address}
                        </p>
                        <div className="p-2 bg-white rounded-lg border border-neutral-200 text-[11px] text-neutral-600">
                          ⏱️ <strong>Tempo estimado de forja:</strong> 20 a 30 minutos após o envio do pedido no WhatsApp.
                        </div>
                      </div>
                    )}

                    {/* Order General Notes */}
                    <div>
                      <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                        Observações gerais para a cozinha (Opcional)
                      </label>
                      <input
                        type="text"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Ex: Interfone quebrado, deixar na portaria..."
                        className="w-full bg-[#FAF8F5] border border-neutral-300 rounded-lg p-2 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                      />
                    </div>

                    {/* Validation Error banner */}
                    {validationError && (
                      <div className="p-3 bg-red-50 border border-red-300 rounded-lg text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                        <span className="text-[11px] font-medium">{validationError}</span>
                      </div>
                    )}

                    {/* Step 2 Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="py-3 px-3 bg-[#FAF8F5] hover:bg-[#F2ECDD] text-neutral-700 font-ancient font-bold text-xs uppercase rounded-xl border border-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar ao Pedido</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextFromStep2}
                        className="py-3 px-3 gold-gradient-bg hover:brightness-105 active:scale-[0.98] text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        <span>Ir para Pagamento</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                      </button>
                    </div>
                  </div>
                )}

                {/* ======================================================== */}
                {/* ETAPA 3: FORMA DE PAGAMENTO & FINALIZAÇÃO NO WHATSAPP    */}
                {/* ======================================================== */}
                {currentStep === 3 && (
                  <div className="space-y-4 animate-in fade-in duration-150">
                    <div className="flex items-center justify-between">
                      <span className="font-ancient font-bold uppercase text-[11px] tracking-wider text-[#CD9C20]">
                        Forma de Pagamento
                      </span>
                      <span className="text-[10px] text-neutral-500 font-semibold">
                        Etapa 3 de 3
                      </span>
                    </div>

                    {/* Important Zero-Website-Charge Notice */}
                    <div className="p-3.5 bg-amber-50/80 border border-amber-300/80 rounded-xl text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-amber-800">
                        <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Você não paga nada pelo site!</span>
                      </div>
                      <p className="text-[11px] text-amber-950 font-normal leading-relaxed">
                        As opções abaixo servem apenas para controle da nossa equipe. O pagamento será acertado diretamente pelo <strong>WhatsApp</strong> ou na entrega!
                      </p>
                    </div>

                    {/* Payment Options Selection Cards */}
                    <div className="space-y-2.5">
                      {/* PIX Option */}
                      <div
                        onClick={() => setPaymentMethod('pix')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === 'pix'
                            ? 'bg-[#FDF9EE] border-[#CD9C20] shadow-xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${paymentMethod === 'pix' ? 'bg-[#CD9C20] text-black' : 'bg-neutral-100 text-neutral-600'}`}>
                              <QrCode className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-[#1c1c1c]">PIX Instantâneo</h5>
                              <p className="text-[11px] text-neutral-600">
                                Receba a chave Pix oficial direto na conversa do WhatsApp.
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === 'pix' ? 'border-[#CD9C20] bg-[#CD9C20]' : 'border-neutral-300'
                          }`}>
                            {paymentMethod === 'pix' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </div>
                        </div>
                      </div>

                      {/* Card Option */}
                      <div
                        onClick={() => setPaymentMethod('card')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === 'card'
                            ? 'bg-[#FDF9EE] border-[#CD9C20] shadow-xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${paymentMethod === 'card' ? 'bg-[#CD9C20] text-black' : 'bg-neutral-100 text-neutral-600'}`}>
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-[#1c1c1c]">Cartão (Maquininha)</h5>
                              <p className="text-[11px] text-neutral-600">
                                Pagamento na maquininha na entrega ou retirada no templo.
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === 'card' ? 'border-[#CD9C20] bg-[#CD9C20]' : 'border-neutral-300'
                          }`}>
                            {paymentMethod === 'card' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </div>
                        </div>

                        {paymentMethod === 'card' && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-200 flex items-center gap-4 text-xs">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="cardType"
                                checked={cardType === 'debito'}
                                onChange={() => setCardType('debito')}
                                className="accent-[#CD9C20]"
                              />
                              <span className="font-medium text-neutral-800">Cartão de Débito</span>
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="radio"
                                name="cardType"
                                checked={cardType === 'credito'}
                                onChange={() => setCardType('credito')}
                                className="accent-[#CD9C20]"
                              />
                              <span className="font-medium text-neutral-800">Cartão de Crédito</span>
                            </label>
                          </div>
                        )}
                      </div>

                      {/* Cash Option */}
                      <div
                        onClick={() => setPaymentMethod('cash')}
                        className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                          paymentMethod === 'cash'
                            ? 'bg-[#FDF9EE] border-[#CD9C20] shadow-xs'
                            : 'bg-white border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`p-2 rounded-lg ${paymentMethod === 'cash' ? 'bg-[#CD9C20] text-black' : 'bg-neutral-100 text-neutral-600'}`}>
                              <Banknote className="w-5 h-5" />
                            </div>
                            <div>
                              <h5 className="font-bold text-xs text-[#1c1c1c]">Dinheiro em Espécie</h5>
                              <p className="text-[11px] text-neutral-600">
                                Pagamento ao entregador ou no balcão da loja.
                              </p>
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            paymentMethod === 'cash' ? 'border-[#CD9C20] bg-[#CD9C20]' : 'border-neutral-300'
                          }`}>
                            {paymentMethod === 'cash' && <Check className="w-3 h-3 text-black stroke-[3]" />}
                          </div>
                        </div>

                        {paymentMethod === 'cash' && (
                          <div className="mt-3 pt-2.5 border-t border-neutral-200 space-y-1">
                            <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase">
                              Precisa de troco? Para quanto?
                            </label>
                            <input
                              type="text"
                              value={cashChangeFor}
                              onChange={(e) => setCashChangeFor(e.target.value)}
                              placeholder="Ex: R$ 50,00 ou R$ 100,00 (Deixe em branco se não precisar)"
                              className="w-full bg-white border border-neutral-300 rounded p-1.5 text-xs text-[#1c1c1c] focus:outline-none focus:border-[#CD9C20]"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Summary Card of the Order before WhatsApp */}
                    <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-neutral-200 space-y-2 text-xs">
                      <div className="flex justify-between items-center text-neutral-700">
                        <span>Destinatário:</span>
                        <strong className="text-black">{customerName || 'Não informado'}</strong>
                      </div>
                      <div className="flex justify-between items-center text-neutral-700">
                        <span>Modalidade:</span>
                        <strong className="text-black">
                          {orderType === 'delivery' ? `Entrega (${neighborhood})` : 'Retirada no Templo'}
                        </strong>
                      </div>
                      <div className="flex justify-between items-center text-neutral-700">
                        <span>Itens:</span>
                        <span>{totalQuantity} {totalQuantity === 1 ? 'item' : 'itens'}</span>
                      </div>
                    </div>

                    {/* Step 3 Navigation Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="py-3 px-3 bg-[#FAF8F5] hover:bg-[#F2ECDD] text-neutral-700 font-ancient font-bold text-xs uppercase rounded-xl border border-neutral-300 flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Voltar às Informações</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleFinalSubmitOrder}
                        disabled={isSubmittingOrder}
                        className="py-3 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-75 text-white font-display font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center justify-center gap-1.5 transition-all"
                      >
                        {isSubmittingOrder ? (
                          <>
                            <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare className="w-4 h-4" />
                            <span>Enviar no WhatsApp</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Drawer Footer with Financial Breakdown */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 bg-white border-t-2 border-[#CD9C20]/40 space-y-2.5 shadow-lg">
              <div className="space-y-1 text-xs">
                <div className="flex justify-between text-neutral-600 font-ancient">
                  <span>Subtotal</span>
                  <span className="font-mono text-neutral-800 font-semibold">
                    R$ {subtotal.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#CD9C20] font-bold font-ancient">
                    <span>Desconto Oráculo (10%)</span>
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
                    Total
                  </span>
                  <span className="font-display font-black text-xl text-[#1c1c1c] tracking-tight">
                    R$ {total.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
