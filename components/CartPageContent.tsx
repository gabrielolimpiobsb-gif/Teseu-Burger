'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { STORE_INFO, NEIGHBORHOOD_FEES, NEIGHBORHOOD_COUPONS, getStoreWhatsAppUrl } from '@/lib/data';
import { ProductImage } from '@/components/ProductImage';
import { LaurelWreathIcon } from '@/components/GreekOrnament';
import { OrderType, PaymentMethod } from '@/types/burger';
import {
  ArrowLeft,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Truck,
  Store,
  TicketPercent,
  CreditCard,
  QrCode,
  Banknote,
  Gift,
  AlertTriangle,
  ArrowRight,
  MessageSquare,
  Sparkles,
  Info,
  Clock,
  Check,
} from 'lucide-react';

function generateOrderId() {
  return `OLYMP-${Math.floor(1000 + Math.random() * 9000)}`;
}

export function CartPageContent() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeItem,
    clearCart,
    totalCartCount,
    totalCartPrice,
    showToast,
    setOrderSuccessData,
    setIsSuccessModalOpen,
  } = useCart();

  // Etapa do fluxo: 1 = Conferência dos Itens | 2 = Dados & Entrega | 3 = Pagamento & Envio
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);

  // Etapa 2: Dados de Entrega
  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressNumber, setAddressNumber] = useState('');
  const [addressComplement, setAddressComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState(Object.keys(NEIGHBORHOOD_FEES)[0] || 'Asa Norte');
  const [orderNotes, setOrderNotes] = useState('');

  // Etapa 3: Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [cardType, setCardType] = useState<'debito' | 'credito'>('debito');
  const [cashChangeFor, setCashChangeFor] = useState('');

  // Cupons
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
  const [confirmClear, setConfirmClear] = useState(false);

  // Cálculos financeiros
  const subtotal = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const deliveryFee = orderType === 'delivery' ? (NEIGHBORHOOD_FEES[neighborhood] ?? 6.0) : 0;
  const isEligibleCoupon = appliedCoupon === 'OLYMPUS10' || appliedCoupon === 'RIOT10';
  const discount = isEligibleCoupon ? subtotal * 0.1 : 0;
  const total = Math.max(0, subtotal - discount + deliveryFee);

  // Regra do Brinde da Máquina Retrô: Válido exclusivamente 1 brinde por Combo Casal
  const hasStandaloneGift = cartItems.some(
    (item) =>
      item.menuItemId.startsWith('brinde-') ||
      (item.unitPrice === 0 && item.drawnSweetGift && !item.comboCasal)
  );
  const hasComboCasal = cartItems.some(
    (item) => Boolean(item.comboCasal) || item.menuItemId === 'combo-casal'
  );
  const needsComboCasalForGift = hasStandaloneGift && !hasComboCasal;

  const handleApplyCoupon = (e?: React.FormEvent, customCode?: string) => {
    if (e) e.preventDefault();
    setCouponError(null);
    const code = (customCode || couponInput).trim().toUpperCase();

    if (!code) {
      setCouponError('Digite um código de cupom.');
      return;
    }

    if (code === 'OLYMPUS10' || code === 'RIOT10') {
      setAppliedCoupon(code);
      setAppliedNeighborhoodCoupon(null);
      setCouponInput('');
      showToast('🎉 Cupom OLYMPUS10 ativado com sucesso! 10% OFF');
    } else if (NEIGHBORHOOD_COUPONS[code]) {
      const nCoupon = NEIGHBORHOOD_COUPONS[code];
      setAppliedNeighborhoodCoupon(nCoupon);
      setAppliedCoupon(code);
      setCouponInput('');
      showToast(`🎁 Cupom de bairro ativado: Ganhe 1 ${nCoupon.giftTitle}!`);
    } else {
      setCouponError('Cupom inválido. Use OLYMPUS10 (10% OFF) ou o cupom do seu bairro.');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setAppliedNeighborhoodCoupon(null);
    setCouponError(null);
    showToast('Cupom removido.');
  };

  const validateStep2 = () => {
    setValidationError(null);
    if (!customerName.trim()) {
      setValidationError('Por favor, informe seu nome completo.');
      return false;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setValidationError('Por favor, informe seu WhatsApp com DDD para envio da comanda.');
      return false;
    }
    if (orderType === 'delivery') {
      if (!addressStreet.trim()) {
        setValidationError('Por favor, informe sua rua ou avenida de entrega.');
        return false;
      }
      if (!addressNumber.trim()) {
        setValidationError('Por favor, informe o número da sua residência.');
        return false;
      }
    }
    return true;
  };

  const handleGoToStep2 = () => {
    if (cartItems.length === 0) {
      showToast('Seu carrinho está vazio!');
      return;
    }
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoToStep3 = () => {
    if (!validateStep2()) {
      return;
    }
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const buildWhatsAppMessage = (orderId: string) => {
    const itemsText = cartItems
      .map((item, idx) => {
        let details = '';

        if (item.comboCasal) {
          details += `\n   💑 *Combo Casal Sagrado:*`;
          details += `\n   - Burger 1: ${item.comboCasal.burger1.name}${
            item.comboCasal.burger1.doneness ? ` (${item.comboCasal.burger1.doneness})` : ''
          }`;
          details += `\n   - Burger 2: ${item.comboCasal.burger2.name}${
            item.comboCasal.burger2.doneness ? ` (${item.comboCasal.burger2.doneness})` : ''
          }`;
          details += `\n   - Batatas: 2x ${item.comboCasal.fries1.name}`;
          details += `\n   - Bebidas: ${item.comboCasal.drink1.name} + ${item.comboCasal.drink2.name}`;
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
          details += `\n   🎁 *Doce Brinde Cortesia:* ${item.drawnSweetGift} (100% Grátis no Caça-Níqueis)`;
        }

        if (item.notes) details += `\n   - Obs: "${item.notes}"`;

        return `${idx + 1}. *${item.quantity}x ${item.name}* (R$ ${item.totalPrice
          .toFixed(2)
          .replace('.', ',')})${details}`;
      })
      .join('\n\n');

    const addressText =
      orderType === 'delivery'
        ? `*Endereço de Entrega:* ${addressStreet.trim()}, nº ${addressNumber.trim()}${
            addressComplement.trim() ? ` (${addressComplement.trim()})` : ''
          } - ${neighborhood}`
        : `*Modalidade:* RETIRADA NO TEMPLO (${STORE_INFO.address})`;

    let paymentLabel = '';
    if (paymentMethod === 'pix') {
      paymentLabel = 'PIX (Solicito a chave Pix no WhatsApp)';
    } else if (paymentMethod === 'card') {
      paymentLabel = `Cartão na Maquininha (${cardType === 'debito' ? 'Débito' : 'Crédito'})`;
    } else {
      paymentLabel = `Dinheiro na Entrega ${
        cashChangeFor.trim() ? `(Troco para R$ ${cashChangeFor.trim()})` : '(Sem troco)'
      }`;
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
${discount > 0 ? `*Desconto Cupom:* - R$ ${discount.toFixed(2).replace('.', ',')}\n` : ''}*Taxa de Entrega:* ${
      deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'Grátis (Retirada)'
    }
*TOTAL DO PEDIDO:* R$ ${total.toFixed(2).replace('.', ',')}
----------------------------------------
*Forma de Pagamento:* ${paymentLabel}
----------------------------------------
_Pedido enviado com facilidade pelo cardápio digital do Teseu Burger._`;

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
          items: cartItems.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            name: item.name,
            quantity: item.quantity,
            price: item.unitPrice,
            totalPrice: item.totalPrice,
            doneness: item.doneness,
            notes: item.notes,
            drawnSweetGift: item.drawnSweetGift,
            selectedToppings: item.selectedToppings || [],
            selectedSauces: item.selectedSauces || [],
            selectedFries: item.selectedFries,
            selectedDrink: item.selectedDrink,
            comboCasal: item.comboCasal,
          })),
          subtotal,
          discount,
          deliveryFee,
          total,
          status: 'pending',
          orderId,
        }),
      });
    } catch (err) {
      console.warn('Registro local de pedido salvo.');
    }

    const encodedMessage = buildWhatsAppMessage(orderId);
    const whatsappUrl = getStoreWhatsAppUrl(encodedMessage);

    const orderSummary = {
      items: [...cartItems],
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: addressStreet.trim(),
        number: addressNumber.trim(),
        neighborhood,
        complement: addressComplement.trim(),
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

    setOrderSuccessData(orderSummary);
    setIsSuccessModalOpen(true);
    clearCart();

    // Redireciona para o WhatsApp de forma suave
    setTimeout(() => {
      window.location.href = whatsappUrl;
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#1c1c1c] selection:bg-[#F5CB5C] selection:text-[#0B0B0B] font-sans pb-28 sm:pb-16">
      {/* 1. CABEÇALHO OFICIAL ESTILO MÁRMORE ROMANO & OURO IMPERIAL */}
      <header className="sticky top-0 z-40 bg-gradient-to-b from-[#FBF9F5] via-[#F5F2EA] to-white border-b border-[#CD9C20]/35 shadow-xs">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between gap-2">
          {/* Voltar ao Cardápio */}
          <Link
            href="/#lendas"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#CD9C20]/35 text-neutral-700 text-xs font-ancient font-bold uppercase tracking-wider hover:text-[#CD9C20] hover:border-[#CD9C20] transition-colors shadow-2xs shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#CD9C20]" />
            <span className="hidden sm:inline">Continuar Comprando</span>
            <span className="sm:hidden">Cardápio</span>
          </Link>

          {/* Título e Emblema Central */}
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="p-1.5 sm:p-2 bg-[#F2ECDD] border border-[#CD9C20] rounded-xl text-[#CD9C20] shrink-0 shadow-2xs">
              <LaurelWreathIcon size={20} color="#CD9C20" />
            </div>
            <div className="min-w-0">
              <h1 className="font-display font-black text-sm sm:text-lg uppercase tracking-wider text-[#1c1c1c] truncate">
                Carrinho de Pedidos
              </h1>
            </div>
          </div>

          {/* Quantidade & Limpar */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-ancient font-bold text-neutral-600 whitespace-nowrap">
              {totalCartCount} {totalCartCount === 1 ? 'item' : 'itens'}
            </span>
            {cartItems.length > 0 && (
              confirmClear ? (
                <button
                  type="button"
                  onClick={() => {
                    clearCart();
                    setConfirmClear(false);
                    showToast('Carrinho esvaziado.');
                  }}
                  onBlur={() => setConfirmClear(false)}
                  className="px-2 py-1 rounded-lg bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider hover:bg-red-700 transition-colors"
                >
                  Confirmar?
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmClear(true)}
                  className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Esvaziar Carrinho"
                  aria-label="Esvaziar carrinho"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )
            )}
          </div>
        </div>

        {/* 2. BARRA DE ETAPAS PADRÃO DO TEMPLO */}
        {cartItems.length > 0 && (
          <div className="bg-[#FAF8F5] border-t border-neutral-200 px-3 sm:px-6 py-2">
            <div className="max-w-5xl mx-auto grid grid-cols-3 gap-1.5 sm:gap-3 font-ancient font-bold select-none">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 1
                    ? 'bg-[#1c1c1c] text-[#F5CB5C] shadow-xs'
                    : currentStep > 1
                    ? 'bg-[#F2ECDD] text-emerald-800 border border-[#CD9C20]/30 hover:bg-[#e9e0ca]'
                    : 'bg-white text-neutral-500 border border-neutral-200 hover:text-black'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    currentStep > 1
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#CD9C20] text-black font-black'
                  }`}
                >
                  {currentStep > 1 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '1'}
                </span>
                <span className="truncate">Pedido</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (currentStep === 1) handleGoToStep2();
                  else setCurrentStep(2);
                }}
                className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 2
                    ? 'bg-[#1c1c1c] text-[#F5CB5C] shadow-xs'
                    : currentStep > 2
                    ? 'bg-[#F2ECDD] text-emerald-800 border border-[#CD9C20]/30 hover:bg-[#e9e0ca]'
                    : 'bg-white text-neutral-500 border border-neutral-200 hover:text-black'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    currentStep > 2
                      ? 'bg-emerald-600 text-white'
                      : currentStep === 2
                      ? 'bg-[#CD9C20] text-black font-black'
                      : 'bg-neutral-300 text-neutral-700'
                  }`}
                >
                  {currentStep > 2 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '2'}
                </span>
                <span className="truncate">Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (validateStep2()) setCurrentStep(3);
                }}
                className={`py-2 px-2 rounded-xl text-[11px] sm:text-xs transition-all flex items-center justify-center gap-1.5 ${
                  currentStep === 3
                    ? 'bg-[#1c1c1c] text-[#F5CB5C] shadow-xs'
                    : 'bg-white text-neutral-500 border border-neutral-200 hover:text-black'
                }`}
              >
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                    currentStep === 3
                      ? 'bg-[#CD9C20] text-black font-black'
                      : 'bg-neutral-300 text-neutral-700'
                  }`}
                >
                  3
                </span>
                <span className="truncate">Pagamento</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Friso Decorativo Grego Sutil */}
      <div className="greek-meander-horizontal opacity-25" />

      {/* CONTEÚDO PRINCIPAL */}
      <main className="relative z-10 max-w-5xl mx-auto px-3 sm:px-6 pt-4 sm:pt-6">
        {/* CASO: CARRINHO VAZIO */}
        {cartItems.length === 0 ? (
          <div className="max-w-lg mx-auto my-8 sm:my-12 bg-white border border-[#CD9C20]/40 rounded-2xl p-8 sm:p-10 text-center shadow-sm flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[#F8F6F0] border border-[#CD9C20]/50 flex items-center justify-center text-[#CD9C20] mb-4 shadow-2xs">
              <ShoppingBag className="w-9 h-9 stroke-[1.5]" />
            </div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#1c1c1c] uppercase tracking-wider">
              Seu Carrinho está Vazio
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mt-2 mb-6 leading-relaxed">
              Adicione hambúrgueres artesanais forjados no fogo sagrado para começar seu banquete ou gire a roleta de brindes!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
              <Link
                href="/#lendas"
                className="w-full py-3.5 px-5 rounded-xl gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition text-center"
              >
                Explorar Cardápio
              </Link>

              <Link
                href="/brindes"
                className="w-full py-3.5 px-5 rounded-xl bg-[#FAF8F5] border border-[#CD9C20]/50 text-[#1c1c1c] font-display font-bold text-xs uppercase tracking-wider hover:bg-[#F2ECDD] transition text-center flex items-center justify-center gap-1.5"
              >
                <Gift className="w-4 h-4 text-[#CD9C20]" />
                <span>Girar Brindes</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* COLUNA ESQUERDA: ETAPAS 1, 2 OU 3 */}
            <div className="lg:col-span-7 space-y-4">
              {/* ERRO DE VALIDAÇÃO GLOBAL */}
              {validationError && (
                <div className="p-3.5 bg-red-50 border border-red-300 rounded-xl flex items-center gap-2.5 text-xs text-red-700 animate-in fade-in">
                  <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
                  <span className="font-medium">{validationError}</span>
                </div>
              )}

              {/* AVISO DO BRINDE DA MÁQUINA DE DOCES */}
              {needsComboCasalForGift && (
                <div className="p-3.5 bg-amber-50 border-2 border-amber-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                  <div className="flex items-start gap-2.5">
                    <Gift className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black text-amber-950 uppercase tracking-wide">
                        Regra Oficial do Brinde
                      </h4>
                      <p className="text-[11px] text-amber-900 leading-snug mt-0.5">
                        Cada usuário pode ganhar só <strong>1 brinde por compra de Combo Casal</strong>. Adicione o Combo Casal para validar seu doce grátis!
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/produto/combo-casal"
                    className="py-2 px-3.5 gold-gradient-bg text-[#0B0B0B] font-display font-black text-[11px] uppercase tracking-wider rounded-xl shadow-xs hover:brightness-105 transition shrink-0"
                  >
                    Ver Combo Casal
                  </Link>
                </div>
              )}

              {/* ========================================================= */}
              {/* ETAPA 1: CONFERÊNCIA DOS ITENS */}
              {/* ========================================================= */}
              {currentStep === 1 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[#1c1c1c] flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#CD9C20]" />
                      <span>Itens Selecionados</span>
                    </h2>
                    <span className="text-[11px] text-neutral-500 font-ancient">
                      Revise antes de avançar
                    </span>
                  </div>

                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white border border-[#CD9C20]/40 hover:border-[#CD9C20] rounded-2xl p-3.5 sm:p-4 shadow-xs transition-colors flex flex-col gap-3"
                    >
                      {/* Topo do Card: Imagem + Nome + Subtotal */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-[#FAF8F5] border border-neutral-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                          {item.image ? (
                            <ProductImage
                              src={item.image}
                              alt={item.name}
                              imageCodeHint={item.image || `/${item.imageType}.png`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#F2ECDD] text-[#CD9C20] text-2xl">
                              {item.unitPrice === 0 ? '🎁' : '🍔'}
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h3 className="font-display font-bold text-xs sm:text-sm text-[#1c1c1c] uppercase tracking-tight leading-snug">
                                {item.name}
                              </h3>
                              <span className="text-[11px] text-neutral-500 font-mono">
                                {item.quantity}x de R$ {item.unitPrice.toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                            <span className="font-mono font-black text-xs sm:text-sm text-[#1c1c1c] shrink-0">
                              {item.totalPrice === 0
                                ? 'GRÁTIS'
                                : `R$ ${item.totalPrice.toFixed(2).replace('.', ',')}`}
                            </span>
                          </div>

                          {/* Se for Combo Casal, decompõe os itens */}
                          {item.comboCasal && (
                            <div className="mt-2 p-2.5 rounded-xl bg-[#FAF8F5] border border-[#CD9C20]/30 text-[11px] space-y-1 text-neutral-700">
                              <p className="font-bold text-[#CD9C20] uppercase text-[10px] tracking-wider">
                                Seleção do Combo Casal
                              </p>
                              <p>
                                <strong className="text-[#1c1c1c]">Burgers:</strong>{' '}
                                1. {item.comboCasal.burger1.name}{' '}
                                {item.comboCasal.burger1.doneness && `(${item.comboCasal.burger1.doneness})`} ·{' '}
                                2. {item.comboCasal.burger2.name}{' '}
                                {item.comboCasal.burger2.doneness && `(${item.comboCasal.burger2.doneness})`}
                              </p>
                              <p>
                                <strong className="text-[#1c1c1c]">Batatas:</strong>{' '}
                                {item.comboCasal.fries1.name} e {item.comboCasal.fries2.name}
                              </p>
                              <p>
                                <strong className="text-[#1c1c1c]">Bebidas:</strong>{' '}
                                {item.comboCasal.drink1.name} & {item.comboCasal.drink2.name}
                              </p>
                            </div>
                          )}

                          {/* Detalhes do item avulso */}
                          {!item.comboCasal && (
                            <div className="mt-1.5 space-y-1 text-[11px] text-neutral-600">
                              {item.doneness && (
                                <p>
                                  <span className="font-semibold text-neutral-800">Ponto da carne:</span>{' '}
                                  {item.doneness}
                                </p>
                              )}

                              {item.selectedToppings && item.selectedToppings.length > 0 && (
                                <p>
                                  <span className="font-semibold text-neutral-800">Extras:</span>{' '}
                                  {item.selectedToppings
                                    .map((t) => `${t.name} (+R$ ${t.price.toFixed(2).replace('.', ',')})`)
                                    .join(', ')}
                                </p>
                              )}

                              {item.selectedSauces && item.selectedSauces.length > 0 && (
                                <p>
                                  <span className="font-semibold text-neutral-800">Molhos:</span>{' '}
                                  {item.selectedSauces.map((s) => s.name).join(', ')}
                                </p>
                              )}

                              {item.selectedFries && (
                                <p className="text-amber-800 font-semibold">
                                  Batata: {item.selectedFries.name}
                                </p>
                              )}

                              {item.selectedDrink && (
                                <p className="text-neutral-800 font-medium">
                                  Bebida: {item.selectedDrink.name}
                                </p>
                              )}

                              {item.isComboUpgrade && (
                                <p className="text-[#CD9C20] font-bold">
                                  Combo Completo (+ Batatas + {item.comboDrink})
                                </p>
                              )}
                            </div>
                          )}

                          {/* Doce Brinde Sorteado */}
                          {item.drawnSweetGift && (
                            <div className="mt-2 p-2 rounded-lg bg-emerald-50 border border-emerald-300 text-[11px] flex items-center justify-between gap-2 text-emerald-800">
                              <span className="flex items-center gap-1.5 font-semibold truncate">
                                <Gift className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">Doce Brinde: {item.drawnSweetGift}</span>
                              </span>
                              <span className="font-bold uppercase text-[10px] text-emerald-700 shrink-0">
                                Grátis
                              </span>
                            </div>
                          )}

                          {/* Observações */}
                          {item.notes && (
                            <p className="text-[11px] text-neutral-500 italic mt-1.5 bg-[#FAF8F5] px-2.5 py-1.5 rounded-lg border border-neutral-200">
                              Obs: &quot;{item.notes}&quot;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Base do Card: Remover & Stepper de Quantidade */}
                      <div className="flex items-center justify-between pt-2.5 border-t border-neutral-200/80">
                        <button
                          type="button"
                          onClick={() => removeItem(item.id)}
                          className="text-[11px] font-bold text-neutral-500 hover:text-red-600 flex items-center gap-1.5 py-1.5 px-2.5 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remover</span>
                        </button>

                        <div className="flex items-center border border-neutral-300 rounded-xl bg-[#FAF8F5] p-0.5 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-9 h-9 rounded-lg bg-white hover:bg-neutral-100 active:scale-95 text-neutral-700 flex items-center justify-center transition border border-neutral-200"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center font-mono font-bold text-xs text-[#1c1c1c]">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-9 h-9 rounded-lg gold-gradient-bg hover:brightness-105 active:scale-95 text-[#0B0B0B] flex items-center justify-center transition shadow-2xs"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Atalhos Rápidos para Continuar Adicionando */}
                  <div className="p-3.5 bg-white border border-neutral-200 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
                    <span className="text-neutral-600 font-medium">Deseja adicionar mais itens?</span>
                    <div className="flex items-center gap-2">
                      <Link
                        href="/#lendas"
                        className="py-1.5 px-3 rounded-lg bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] font-ancient font-bold hover:border-[#CD9C20] hover:text-[#CD9C20] transition"
                      >
                        + Burgers
                      </Link>
                      <Link
                        href="/brindes"
                        className="py-1.5 px-3 rounded-lg bg-[#F2ECDD] border border-[#CD9C20]/40 text-[#1c1c1c] font-ancient font-bold hover:border-[#CD9C20] transition flex items-center gap-1"
                      >
                        <Gift className="w-3.5 h-3.5 text-[#CD9C20]" />
                        <span>Brindes</span>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ETAPA 2: DADOS DE ENTREGA E ENDEREÇO */}
              {/* ========================================================= */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[#1c1c1c] flex items-center gap-2">
                      <Truck className="w-4 h-4 text-[#CD9C20]" />
                      <span>Entrega & Seus Dados</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="text-xs font-ancient text-[#CD9C20] font-bold hover:underline"
                    >
                      ← Rever Itens
                    </button>
                  </div>

                  {/* Seletor Delivery vs. Retirada */}
                  <div className="grid grid-cols-2 gap-2 p-1.5 bg-white border border-[#CD9C20]/40 rounded-2xl shadow-2xs">
                    <button
                      type="button"
                      onClick={() => setOrderType('delivery')}
                      className={`py-3 px-3 rounded-xl font-ancient font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                        orderType === 'delivery'
                          ? 'gold-gradient-bg text-[#0B0B0B] shadow-sm font-black'
                          : 'text-neutral-600 hover:text-[#1c1c1c]'
                      }`}
                    >
                      <Truck className="w-4 h-4" />
                      <span>Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOrderType('pickup')}
                      className={`py-3 px-3 rounded-xl font-ancient font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 ${
                        orderType === 'pickup'
                          ? 'gold-gradient-bg text-[#0B0B0B] shadow-sm font-black'
                          : 'text-neutral-600 hover:text-[#1c1c1c]'
                      }`}
                    >
                      <Store className="w-4 h-4" />
                      <span>Retirar no Templo</span>
                    </button>
                  </div>

                  {/* Formulário de Identificação */}
                  <div className="bg-white border border-[#CD9C20]/40 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
                    <h3 className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20] tracking-wider">
                      Identificação do Cliente
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                          Seu Nome Completo *
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="Ex: Teseu de Atenas"
                          className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                          WhatsApp com DDD *
                        </label>
                        <input
                          type="tel"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="Ex: (61) 99999-8888"
                          className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
                        />
                      </div>
                    </div>

                    {orderType === 'delivery' ? (
                      <div className="pt-3 border-t border-neutral-200 space-y-3">
                        <h3 className="text-[11px] font-ancient font-bold uppercase text-[#CD9C20] tracking-wider">
                          Endereço de Entrega
                        </h3>

                        <div>
                          <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                            Bairro de Entrega *
                          </label>
                          <select
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
                          >
                            {Object.entries(NEIGHBORHOOD_FEES).map(([name, fee]) => (
                              <option key={name} value={name}>
                                {name} — Taxa: R$ {fee.toFixed(2).replace('.', ',')}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5">
                          <div className="col-span-2">
                            <label className="block text-[10px] font-ancient font-bold text-neutral-700 uppercase mb-1">
                              Rua / Avenida *
                            </label>
                            <input
                              type="text"
                              value={addressStreet}
                              onChange={(e) => setAddressStreet(e.target.value)}
                              placeholder="Ex: CLN 204 Bloco B"
                              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
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
                              placeholder="Nº"
                              className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
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
                            placeholder="Apto 302, Bloco, Casa..."
                            className="w-full py-2.5 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
                          />
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#FDF9EE] border border-[#CD9C20]/30 flex items-center gap-2 text-[11px] text-neutral-700">
                          <Clock className="w-4 h-4 text-[#CD9C20] shrink-0" />
                          <span>
                            Tempo médio de entrega: <strong className="text-[#1c1c1c]">{STORE_INFO.avgTime}</strong>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-3 border-t border-neutral-200 p-3.5 bg-[#FAF8F5] rounded-xl border border-[#CD9C20]/40 space-y-1.5">
                        <p className="text-xs font-ancient font-bold text-[#CD9C20] uppercase flex items-center gap-1.5">
                          <Store className="w-4 h-4" />
                          <span>Endereço para Retirada no Balcão</span>
                        </p>
                        <p className="text-xs font-semibold text-[#1c1c1c]">{STORE_INFO.address}</p>
                        <p className="text-[11px] text-neutral-600">
                          Seu pedido fica pronto para retirada em aproximadamente 20 a 30 minutos.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========================================================= */}
              {/* ETAPA 3: FORMA DE PAGAMENTO & FINALIZAÇÃO */}
              {/* ========================================================= */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="font-display font-bold text-sm uppercase tracking-wider text-[#1c1c1c] flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-[#CD9C20]" />
                      <span>Forma de Pagamento</span>
                    </h2>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="text-xs font-ancient text-[#CD9C20] font-bold hover:underline"
                    >
                      ← Alterar Endereço
                    </button>
                  </div>

                  {/* Aviso de Pagamento Zero no Site */}
                  <div className="p-3.5 bg-amber-50/90 border border-amber-300/80 rounded-xl text-amber-950 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-amber-800">
                      <Info className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Você não paga nada pelo site!</span>
                    </div>
                    <p className="text-[11px] text-amber-900 leading-relaxed">
                      As opções abaixo servem para agilizar sua comanda. O acerto é feito diretamente pelo <strong>WhatsApp</strong> ou na entrega.
                    </p>
                  </div>

                  {/* Cards de Pagamento Selecionáveis */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* PIX */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`p-3.5 rounded-2xl border-2 transition text-left flex flex-col justify-between ${
                        paymentMethod === 'pix'
                          ? 'bg-[#FDF9EE] border-[#CD9C20] shadow-xs'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            paymentMethod === 'pix'
                              ? 'bg-[#CD9C20] text-black'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <QrCode className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'pix' && (
                          <CheckCircle2 className="w-4 h-4 text-[#CD9C20]" />
                        )}
                      </div>
                      <span className="font-display font-bold text-xs uppercase text-[#1c1c1c] block">
                        PIX Direto
                      </span>
                      <span className="text-[10px] text-neutral-500">Chave via WhatsApp</span>
                    </button>

                    {/* CARTÃO */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3.5 rounded-2xl border-2 transition text-left flex flex-col justify-between ${
                        paymentMethod === 'card'
                          ? 'bg-[#FDF9EE] border-[#CD9C20] shadow-xs'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            paymentMethod === 'card'
                              ? 'bg-[#CD9C20] text-black'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <CreditCard className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'card' && (
                          <CheckCircle2 className="w-4 h-4 text-[#CD9C20]" />
                        )}
                      </div>
                      <span className="font-display font-bold text-xs uppercase text-[#1c1c1c] block">
                        Cartão
                      </span>
                      <span className="text-[10px] text-neutral-500">Maquininha na entrega</span>
                    </button>

                    {/* DINHEIRO */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-3.5 rounded-2xl border-2 transition text-left flex flex-col justify-between ${
                        paymentMethod === 'cash'
                          ? 'bg-[#FDF9EE] border-[#CD9C20] shadow-xs'
                          : 'bg-white border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <div
                          className={`p-2 rounded-lg ${
                            paymentMethod === 'cash'
                              ? 'bg-[#CD9C20] text-black'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          <Banknote className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'cash' && (
                          <CheckCircle2 className="w-4 h-4 text-[#CD9C20]" />
                        )}
                      </div>
                      <span className="font-display font-bold text-xs uppercase text-[#1c1c1c] block">
                        Dinheiro
                      </span>
                      <span className="text-[10px] text-neutral-500">Pagar na entrega</span>
                    </button>
                  </div>

                  {/* Sub-opções de Cartão (Débito vs Crédito) */}
                  {paymentMethod === 'card' && (
                    <div className="p-3.5 bg-white border border-[#CD9C20]/40 rounded-2xl flex items-center gap-3 shadow-2xs">
                      <span className="text-xs font-bold text-neutral-700">Tipo de Cartão:</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCardType('debito')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                            cardType === 'debito'
                              ? 'gold-gradient-bg text-[#0B0B0B] font-black shadow-2xs'
                              : 'bg-[#FAF8F5] text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          Débito
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardType('credito')}
                          className={`py-1.5 px-3 rounded-lg text-xs font-bold transition ${
                            cardType === 'credito'
                              ? 'gold-gradient-bg text-[#0B0B0B] font-black shadow-2xs'
                              : 'bg-[#FAF8F5] text-neutral-700 border border-neutral-200'
                          }`}
                        >
                          Crédito
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Troco para Dinheiro */}
                  {paymentMethod === 'cash' && (
                    <div className="p-3.5 bg-white border border-[#CD9C20]/40 rounded-2xl space-y-1.5 shadow-2xs">
                      <label className="block text-xs font-bold text-neutral-700">
                        Precisa de troco para quanto?
                      </label>
                      <input
                        type="text"
                        value={cashChangeFor}
                        onChange={(e) => setCashChangeFor(e.target.value)}
                        placeholder="Ex: R$ 100,00 (ou deixe em branco se não precisar)"
                        className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white"
                      />
                    </div>
                  )}

                  {/* Observações Gerais */}
                  <div className="bg-white border border-[#CD9C20]/40 rounded-2xl p-4 space-y-2 shadow-2xs">
                    <label className="block text-[11px] font-ancient font-bold text-neutral-700 uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#CD9C20]" />
                      <span>Observações para a Cozinha ou Motoboy</span>
                    </label>
                    <textarea
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Ex: Tocar interfone 202, deixar na portaria, caprichar no molho..."
                      rows={2}
                      className="w-full py-2 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs focus:outline-none focus:border-[#CD9C20] focus:bg-white transition resize-none"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* COLUNA DIREITA: RESUMO FINANCEIRO & CUPOM */}
            <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-32">
              {/* CARD DE CUPOM DE DESCONTO */}
              <div className="bg-white border border-[#CD9C20]/40 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-[#1c1c1c]">
                  <TicketPercent className="w-4 h-4 text-[#CD9C20]" />
                  <h3 className="font-display font-bold text-xs uppercase tracking-wider">
                    Cupom de Desconto
                  </h3>
                </div>

                {appliedCoupon ? (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-300 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <span className="font-mono font-black text-xs text-emerald-950">
                          {appliedCoupon}
                        </span>
                        <span className="text-[10px] text-emerald-800 block">
                          {appliedNeighborhoodCoupon
                            ? `Ganhe 1 ${appliedNeighborhoodCoupon.giftTitle}`
                            : '10% de desconto aplicado'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] font-bold text-neutral-600 hover:text-black underline transition"
                    >
                      Remover
                    </button>
                  </div>
                ) : (
                  <div>
                    <form onSubmit={(e) => handleApplyCoupon(e)} className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Ex: OLYMPUS10"
                        className="flex-1 py-2 px-3 rounded-xl bg-[#FAF8F5] border border-neutral-300 text-[#1c1c1c] placeholder-neutral-400 text-xs font-mono uppercase focus:outline-none focus:border-[#CD9C20] focus:bg-white transition"
                      />
                      <button
                        type="submit"
                        className="py-2 px-3.5 rounded-xl gold-gradient-bg text-[#0B0B0B] font-ancient font-black text-xs uppercase tracking-wider hover:brightness-105 transition shadow-2xs"
                      >
                        Aplicar
                      </button>
                    </form>

                    {couponError && (
                      <p className="text-[10px] text-red-600 mt-1 font-semibold">{couponError}</p>
                    )}

                    {/* Atalho 1 toque para OLYMPUS10 */}
                    <button
                      type="button"
                      onClick={() => handleApplyCoupon(undefined, 'OLYMPUS10')}
                      className="mt-2.5 w-full py-2 px-2.5 rounded-xl bg-[#FAF8F5] border border-[#CD9C20]/30 text-[11px] text-neutral-700 hover:text-[#1c1c1c] hover:border-[#CD9C20] transition text-center flex items-center justify-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#CD9C20]" />
                      <span>
                        Usar cupom <strong className="text-[#1c1c1c]">OLYMPUS10</strong> (10% OFF)
                      </span>
                    </button>
                  </div>
                )}
              </div>

              {/* RESUMO TOTAL DA COMPRA */}
              <div className="bg-white border-2 border-[#CD9C20]/50 rounded-2xl p-4 sm:p-5 shadow-md space-y-3">
                <h3 className="font-display font-bold text-xs uppercase tracking-wider text-[#1c1c1c] border-b border-neutral-200 pb-2">
                  Resumo dos Valores
                </h3>

                <div className="space-y-1.5 text-xs text-neutral-600 font-ancient">
                  <div className="flex items-center justify-between">
                    <span>
                      Subtotal ({totalCartCount} {totalCartCount === 1 ? 'item' : 'itens'})
                    </span>
                    <span className="font-mono font-bold text-[#1c1c1c]">
                      R$ {subtotal.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex items-center justify-between text-emerald-700 font-bold">
                      <span>Desconto Cupom (10%)</span>
                      <span className="font-mono">
                        - R$ {discount.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>
                      Taxa de Entrega ({orderType === 'delivery' ? neighborhood : 'Retirada'})
                    </span>
                    <span className="font-mono font-bold text-[#1c1c1c]">
                      {orderType === 'delivery'
                        ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}`
                        : 'Grátis'}
                    </span>
                  </div>

                  <div className="pt-2.5 border-t border-neutral-200 flex items-center justify-between text-sm sm:text-base font-black text-[#1c1c1c]">
                    <span className="font-display uppercase tracking-wider">Total</span>
                    <span className="font-display font-black text-xl text-[#1c1c1c]">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* BOTÕES DE AVANÇO (DESKTOP) */}
                <div className="hidden sm:block pt-2">
                  {currentStep === 1 && (
                    <button
                      type="button"
                      onClick={handleGoToStep2}
                      className="w-full py-3.5 px-4 rounded-xl gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      <span>Avançar para Entrega</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}

                  {currentStep === 2 && (
                    <button
                      type="button"
                      onClick={handleGoToStep3}
                      className="w-full py-3.5 px-4 rounded-xl gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider shadow-md hover:brightness-105 active:scale-[0.98] transition flex items-center justify-center gap-2"
                    >
                      <span>Ir para Forma de Pagamento</span>
                      <ArrowRight className="w-4 h-4 stroke-[3]" />
                    </button>
                  )}

                  {currentStep === 3 && (
                    <button
                      type="button"
                      onClick={handleFinalSubmitOrder}
                      disabled={isSubmittingOrder}
                      className="w-full py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-md active:scale-[0.98] transition flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>{isSubmittingOrder ? 'Enviando...' : 'Finalizar Pedido no WhatsApp'}</span>
                    </button>
                  )}
                </div>

                <div className="pt-1 text-[10px] text-neutral-500 text-center">
                  Pedido protegido · Atendimento oficial {STORE_INFO.name}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. BARRA FIXA INFERIOR NO MOBILE (STICKY BOTTOM BAR) */}
      {cartItems.length > 0 && (
        <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#CD9C20]/50 p-3 shadow-[0_-8px_25px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-neutral-500 uppercase font-ancient font-bold block">
                Total ({totalCartCount})
              </span>
              <span className="font-display font-black text-lg text-[#1c1c1c]">
                R$ {total.toFixed(2).replace('.', ',')}
              </span>
            </div>

            <div className="flex-1">
              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={handleGoToStep2}
                  className="w-full py-3 px-4 rounded-xl gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <span>Continuar</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={handleGoToStep3}
                  className="w-full py-3 px-4 rounded-xl gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition flex items-center justify-center gap-1.5"
                >
                  <span>Pagamento</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleFinalSubmitOrder}
                  disabled={isSubmittingOrder}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition flex items-center justify-center gap-1.5 disabled:opacity-70"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>{isSubmittingOrder ? 'Enviando...' : 'Enviar no WhatsApp'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
