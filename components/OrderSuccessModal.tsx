'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CartItem, CustomerDetails } from '@/types/burger';
import { STORE_INFO } from '@/lib/data';
import { LaurelWreathIcon, SpartanHelmetIcon, ParthenonIcon } from '@/components/GreekOrnament';
import { Check, Copy, MessageSquare, X, QrCode, Sparkles } from 'lucide-react';

interface OrderSuccessModalProps {
  orderData: {
    items: CartItem[];
    customer: CustomerDetails;
    subtotal: number;
    discount: number;
    deliveryFee: number;
    total: number;
    orderId: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
}

export function OrderSuccessModal({ orderData, isOpen, onClose }: OrderSuccessModalProps) {
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen || !orderData) return null;

  const { items, customer, subtotal, discount, deliveryFee, total, orderId } = orderData;

  const pixKeySimulated = `00020126580014BR.GOV.BCB.PIX0136olympus-smash-${orderId.toLowerCase()}520400005303986540${total.toFixed(2)}5802BR5916TESEU BURGER6009SAO PAULO62070503***6304`;

  const copyPixCode = () => {
    navigator.clipboard.writeText(pixKeySimulated);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const generateWhatsAppMessage = () => {
    const itemsText = items
      .map((item, idx) => {
        let details = '';
        if (item.doneness) details += `\n   - Ponto: ${item.doneness}`;
        if (item.selectedToppings.length > 0) {
          details += `\n   - Extras: ${item.selectedToppings.map((t) => t.name).join(', ')}`;
        }
        if (item.isComboUpgrade) {
          details += `\n   - Combo: Batatas Espartanas + ${item.comboDrink || 'Bebida'}`;
        }
        if (item.notes) details += `\n   - Obs: "${item.notes}"`;

        return `${idx + 1}. *${item.quantity}x ${item.name}* (R$ ${item.totalPrice.toFixed(2).replace('.', ',')})${details}`;
      })
      .join('\n\n');

    const addressText =
      customer.orderType === 'delivery'
        ? `*Endereço:* ${customer.address}, nº ${customer.number}${
            customer.complement ? ` - ${customer.complement}` : ''
          } - ${customer.neighborhood}`
        : `*Tipo:* RETIRADA NO TEMPLO (${STORE_INFO.address})`;

    const paymentText =
      customer.paymentMethod === 'pix'
        ? 'PIX Instantâneo'
        : customer.paymentMethod === 'card'
        ? 'Cartão na Entrega'
        : `Dinheiro na Entrega ${customer.cashChangeFor ? `(Troco para: ${customer.cashChangeFor})` : '(Sem troco)'}`;

    const rawMessage = `🏛️ *BANQUETE SAGRADO TESEU BURGER // OLIMPO*
*Comanda do Templo:* #${orderId}
----------------------------------------
*Cidadão:* ${customer.name}
*WhatsApp:* ${customer.phone}
${addressText}
----------------------------------------
*OFERENDAS DO BANQUETE:*
${itemsText}
----------------------------------------
*Subtotal:* R$ ${subtotal.toFixed(2).replace('.', ',')}
${discount > 0 ? `*Desconto Oráculo:* - R$ ${discount.toFixed(2).replace('.', ',')}\n` : ''}*Taxa Entrega:* R$ ${deliveryFee.toFixed(2).replace('.', ',')}
*TOTAL DO BANQUETE:* R$ ${total.toFixed(2).replace('.', ',')}
*Forma de Pagamento:* ${paymentText}
----------------------------------------
_Enviado com a bênção dos deuses do smash!_`;

    return encodeURIComponent(rawMessage);
  };

  const whatsappUrl = `https://wa.me/${STORE_INFO.whatsapp}?text=${generateWhatsAppMessage()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-white border-2 border-[#CD9C20] rounded-2xl shadow-2xl overflow-hidden text-[#1c1c1c]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header in Gold & Roman Marble */}
        <div className="p-6 bg-gradient-to-r from-[#FBF9F5] to-[#F2ECDD] border-b border-[#CD9C20]/30 text-[#1c1c1c] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white border border-[#CD9C20] flex items-center justify-center">
              <LaurelWreathIcon size={24} color="#CD9C20" />
            </div>
            <div>
              <span className="text-[10px] font-ancient font-bold uppercase tracking-widest text-[#CD9C20]">
                Oferenda Confirmada!
              </span>
              <h3 className="font-display text-xl sm:text-2xl uppercase tracking-wide text-[#1c1c1c]">
                Comanda #{orderId}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-600 hover:text-black bg-white border border-neutral-300 rounded-full transition-colors"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-xs bg-white">
          {/* Status Tracker */}
          <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#CD9C20]/40">
            <div className="flex items-center justify-between mb-3">
              <span className="font-ancient font-bold text-[#CD9C20] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <SpartanHelmetIcon size={14} color="#CD9C20" />
                Status da Forja:
              </span>
              <span className="text-[10px] bg-[#F2ECDD] text-[#CD9C20] font-ancient font-bold px-2 py-0.5 rounded-full border border-[#CD9C20]/50">
                Recebido no Olimpo
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="p-2 rounded-lg bg-white border-2 border-[#CD9C20] text-[#CD9C20] font-ancient font-bold shadow-sm">
                1. Recebido ✓
              </div>
              <div className="p-2 rounded-lg bg-white border border-neutral-300 text-neutral-700 font-ancient font-bold animate-pulse">
                2. Na Brasa 🔥
              </div>
              <div className="p-2 rounded-lg bg-white border border-neutral-200 text-neutral-400 font-ancient">
                3. Em Rota 🛵
              </div>
            </div>
          </div>

          {/* Marble Tablet Print Style Box */}
          <div className="marble-tablet text-[#0B0B0B] p-5 shadow-lg border border-[#e2ddd3]">
            <div className="text-center pb-3 border-b border-[#dcd4c0]">
              <div className="flex justify-center mb-1.5">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-[#CD9C20] shadow-xs bg-[#f4eedf]">
                  <Image
                    src="/logo.png"
                    alt="Teseu Burger Logo"
                    fill
                    referrerPolicy="no-referrer"
                    className="object-cover"
                    sizes="36px"
                  />
                </div>
              </div>
              <h4 className="font-display text-lg uppercase tracking-widest text-[#0B0B0B] font-bold">
                TESEU BURGER // TEMPLO DO SMASH
              </h4>
              <p className="text-[10px] text-neutral-700 font-mono">
                {STORE_INFO.address}
              </p>
              <p suppressHydrationWarning className="text-[10px] text-neutral-700 font-mono mt-0.5">
                DATA: {new Date().toLocaleDateString('pt-BR')} • #{orderId}
              </p>
            </div>

            {/* Customer data */}
            <div className="py-2.5 border-b border-[#dcd4c0] font-mono text-[11px] space-y-1">
              <p>
                <span className="font-bold">CIDADÃO:</span> {customer.name} ({customer.phone})
              </p>
              {customer.orderType === 'delivery' ? (
                <p>
                  <span className="font-bold">DESTINO:</span> {customer.address}, nº {customer.number}
                  {customer.complement ? ` (${customer.complement})` : ''} - {customer.neighborhood}
                </p>
              ) : (
                <p>
                  <span className="font-bold">MODALIDADE:</span> RETIRADA NO TEMPLO
                </p>
              )}
              <p>
                <span className="font-bold">PAGAMENTO:</span>{' '}
                {customer.paymentMethod === 'pix'
                  ? 'PIX INSTANTÂNEO'
                  : customer.paymentMethod === 'card'
                  ? 'CARTÃO NA ENTREGA'
                  : `DINHEIRO ${customer.cashChangeFor ? `(Troco p/ ${customer.cashChangeFor})` : ''}`}
              </p>
            </div>

            {/* Items */}
            <div className="py-3 border-b border-[#dcd4c0] space-y-2">
              {items.map((item) => (
                <div key={item.id} className="text-[11px] font-mono">
                  <div className="flex justify-between font-bold">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>R$ {item.totalPrice.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {item.doneness && <p className="text-[10px] text-neutral-600">• Ponto: {item.doneness}</p>}
                  {item.selectedToppings.length > 0 && (
                    <p className="text-[10px] text-neutral-600">
                      • Extras: {item.selectedToppings.map((t) => t.name).join(', ')}
                    </p>
                  )}
                  {item.isComboUpgrade && (
                    <p className="text-[10px] text-neutral-700 font-bold">
                      • Banquete Completo (+ Fritas + {item.comboDrink})
                    </p>
                  )}
                  {item.notes && <p className="text-[10px] italic text-neutral-600">• Obs: &quot;{item.notes}&quot;</p>}
                </div>
              ))}
            </div>

            {/* Financial summary */}
            <div className="pt-2.5 font-mono text-[11px] space-y-1">
              <div className="flex justify-between text-neutral-700">
                <span>SUBTOTAL:</span>
                <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#CD9C20] font-bold">
                  <span>DESCONTO ORÁCULO:</span>
                  <span>- R$ {discount.toFixed(2).replace('.', ',')}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-700">
                <span>TAXA DE ENTREGA:</span>
                <span>{deliveryFee > 0 ? `R$ ${deliveryFee.toFixed(2).replace('.', ',')}` : 'GRÁTIS'}</span>
              </div>
              <div className="pt-1.5 border-t-2 border-[#0B0B0B] flex justify-between font-bold text-sm text-[#0B0B0B]">
                <span>TOTAL DO BANQUETE:</span>
                <span>R$ {total.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>

          {/* PIX payment box */}
          {customer.paymentMethod === 'pix' && (
            <div className="p-4 bg-[#F8F6F0] rounded-xl border border-[#CD9C20]/60 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-ancient font-bold text-[#CD9C20] uppercase text-[11px] flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-[#CD9C20]" />
                  Chave Pix Instantânea do Templo
                </span>
                <span className="font-mono text-xs font-bold text-[#1c1c1c]">
                  R$ {total.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="p-2.5 bg-white rounded-lg border border-neutral-300 font-mono text-[10px] text-neutral-800 break-all select-all">
                {pixKeySimulated}
              </div>

              <button
                type="button"
                onClick={copyPixCode}
                className="w-full py-2.5 px-3 gold-gradient-bg text-[#0B0B0B] font-ancient font-bold rounded-lg flex items-center justify-center gap-2 hover:brightness-105 transition-colors text-xs shadow-sm"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-4 h-4 stroke-[2.5]" />
                    <span>Chave Pix Copiada com Glória!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 stroke-[2.5]" />
                    <span>Copiar Código Pix</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-5 bg-white border-t border-[#CD9C20]/30 space-y-3">
          <Link
            href={`/pedido/${orderId}`}
            onClick={onClose}
            className="w-full py-3 px-4 gold-gradient-bg hover:brightness-105 active:scale-[0.98] text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Acompanhar Pedido na Cozinha (Ao Vivo) →</span>
          </Link>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-display font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enviar Pedido ao WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 bg-[#F2ECDD] hover:bg-[#eae3d1] text-[#1c1c1c] font-display text-xs uppercase tracking-wider rounded-xl transition-colors shrink-0 border border-neutral-300"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
