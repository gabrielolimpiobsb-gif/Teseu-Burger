'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  LaurelWreathIcon,
  SpartanHelmetIcon,
  ParthenonIcon,
} from '@/components/GreekOrnament';
import {
  CheckCircle2,
  Clock,
  Flame,
  PackageCheck,
  Bike,
  ShieldCheck,
  MessageSquare,
  ArrowLeft,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  MapPin,
  Phone,
  User,
  CheckSquare,
  Sparkles,
} from 'lucide-react';
import { STORE_INFO } from '@/lib/data';

interface OrderLiveTrackerProps {
  initialOrderNumber: string;
}

export const KDS_STATUSES = [
  {
    key: 'awaiting_payment',
    label: 'Aguardando Comprovante',
    sub: 'Envie o comprovante pelo WhatsApp',
    icon: Clock,
    color: 'text-amber-800 bg-amber-100 border-amber-300',
  },
  {
    key: 'payment_confirmed',
    label: 'Pagamento Confirmado',
    sub: 'Liberado pela cozinha para produção',
    icon: ShieldCheck,
    color: 'text-emerald-800 bg-emerald-100 border-emerald-300',
  },
  {
    key: 'preparing',
    label: 'Em Preparo',
    sub: 'Carnes e queijos na chapa viva a 230°C',
    icon: Flame,
    color: 'text-orange-800 bg-orange-100 border-orange-300',
  },
  {
    key: 'ready',
    label: 'Pronto & Embalado',
    sub: 'Lanches selados e conferidos na estufa',
    icon: PackageCheck,
    color: 'text-blue-800 bg-blue-100 border-blue-300',
  },
  {
    key: 'awaiting_courier',
    label: 'Aguardando Entregador',
    sub: 'Pronto aguardando saída do motoboy',
    icon: Clock,
    color: 'text-indigo-800 bg-indigo-100 border-indigo-300',
  },
  {
    key: 'out_for_delivery',
    label: 'Saiu para Entrega',
    sub: 'Entregador imperial a caminho do seu endereço',
    icon: Bike,
    color: 'text-purple-800 bg-purple-100 border-purple-300',
  },
  {
    key: 'completed',
    label: 'Pedido Concluído',
    sub: 'Banquete entregue. Bom apetite!',
    icon: CheckCircle2,
    color: 'text-emerald-900 bg-emerald-200 border-emerald-400',
  },
];

export function OrderLiveTracker({ initialOrderNumber }: OrderLiveTrackerProps) {
  const [order, setOrder] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchStatus = React.useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch(`/api/orders/${initialOrderNumber}/status`);
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error fetching order live status:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [initialOrderNumber]);

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const res = await fetch(`/api/orders/${initialOrderNumber}/status`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setOrder(data);
          setLastUpdated(new Date());
        }
      } catch (err) {
        console.error('Error fetching order live status:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadStatus();
    const interval = setInterval(loadStatus, 3500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [initialOrderNumber]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-[#1C1C1C] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-3 border-[#CD9C20]/40 border-t-[#CD9C20] rounded-full animate-spin mb-4" />
        <h2 className="font-display font-black text-xl uppercase tracking-wider text-[#1C1C1C]">
          Sincronizando com a Cozinha...
        </h2>
        <p className="text-xs text-neutral-500 mt-1 font-ancient">Consultando o status do banquete em tempo real</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] text-[#1C1C1C] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-rose-500" />
        </div>
        <h2 className="font-display font-black text-2xl uppercase tracking-wider">Pedido Não Localizado</h2>
        <p className="text-xs text-neutral-600 mt-1.5 max-w-sm">
          A comanda #{initialOrderNumber} não foi encontrada nos registros ativos.
        </p>
        <Link
          href="/"
          className="mt-6 py-3 px-6 rounded-xl gold-gradient-bg text-black font-display font-bold text-xs uppercase shadow-sm"
        >
          Voltar ao Cardápio
        </Link>
      </div>
    );
  }

  const currentStatusIndex = KDS_STATUSES.findIndex((s) => s.key === order.status);
  const activeStatusIndex = currentStatusIndex !== -1 ? currentStatusIndex : 0;
  const currentStatusObj = KDS_STATUSES[activeStatusIndex] || KDS_STATUSES[0];

  const orderDate = new Date(order.createdAt);
  const elapsedMinutes = Math.floor((currentTime.getTime() - orderDate.getTime()) / 60000);

  const pixKeySimulated = `00020126580014BR.GOV.BCB.PIX0136olympus-smash-${order.orderNumber.toLowerCase()}520400005303986540${order.total.toFixed(
    2
  )}5802BR5916TESEU BURGER6009SAO PAULO62070503***6304`;

  const whatsappMessage = encodeURIComponent(
    `🏛️ *COMPROVANTE / PEDIDO TESEU BURGER*\nComanda: *#${order.orderNumber}*\nCliente: *${order.customerName}*\nTotal: *R$ ${order.total.toFixed(
      2
    )}*\n\nOlá equipe Teseu, segue meu comprovante de pagamento!`
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1C1C1C] pb-24 selection:bg-[#F5CB5C] selection:text-black">
      {/* ========================================================= */}
      {/* 1. TOP HEADER (MATCHING KDS LAYOUT & REFERENCE IMAGE)     */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200 px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-display font-bold text-neutral-600 hover:text-black py-1.5 px-3 rounded-xl bg-neutral-100 hover:bg-neutral-200 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cardápio</span>
          </Link>

          <div className="relative h-8 w-28 sm:w-32">
            <Image
              src="/logo.png"
              alt="Teseu Burger"
              fill
              priority
              referrerPolicy="no-referrer"
              className="object-contain object-left"
              sizes="128px"
            />
          </div>
        </div>

        {/* Center: Live Digital Clock ("14:12") */}
        <div className="hidden sm:block font-display font-black text-2xl text-[#1C1C1C] tracking-wider px-3.5 py-1 rounded-xl bg-[#F8F6F0] border border-[#CD9C20]/30 shadow-xs">
          <span suppressHydrationWarning>
            {currentTime.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>

        {/* Right: Refresh & Live Pulse */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-ancient font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>Sincronizado ao Vivo</span>
          </div>

          <button
            onClick={fetchStatus}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 transition-colors"
            title="Atualizar status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#CD9C20]' : ''}`} />
          </button>
        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN ORDER TRACKING CONTAINER                          */}
      {/* Layout matching attached reference image with #F5F5F5      */}
      {/* ========================================================= */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">
        {/* SUBHEADER: View Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b-2 border-neutral-300">
          <div>
            <span className="text-[10px] font-ancient font-bold tracking-[0.25em] text-[#CD9C20] uppercase block">
              STATUS DO SEU BANQUETE
            </span>
            <h1 className="font-display font-black text-2xl sm:text-3xl uppercase tracking-wider text-[#1C1C1C]">
              Acompanhar Pedido
            </h1>
          </div>

          <span
            suppressHydrationWarning
            className="text-xs font-mono text-neutral-500 self-start sm:self-auto"
          >
            Última checagem: {lastUpdated.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
        </div>

        {/* MAIN ORDER CARD (IDENTICAL ANATOMY TO KDS REFERENCE IMAGE) */}
        <div className="bg-white rounded-3xl border-2 border-neutral-200 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Card Top Row: Giant Order Number + Elapsed Time + Customer Name */}
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-neutral-100">
            <div>
              <div className="flex items-baseline gap-2.5">
                <span className="font-display font-black text-4xl sm:text-5xl text-[#1C1C1C] tracking-tight">
                  #{order.orderNumber.replace(/^(TB-|PED-)/, '')}
                </span>
                <span className="text-sm font-mono text-neutral-400 font-bold">
                  ({order.orderNumber})
                </span>
              </div>
              <span className="text-xs text-neutral-500 font-ancient block mt-1">
                {order.deliveryMethod === 'delivery' ? '🛵 Entrega em Domicílio' : '🏛️ Retirada no Balcão'} • Feito às {orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <div className="text-right shrink-0">
              <span
                suppressHydrationWarning
                className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full bg-amber-500 text-black font-black shadow-xs"
              >
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{elapsedMinutes}m atrás</span>
              </span>

              <h4 className="font-display font-bold text-base text-[#1C1C1C] mt-1.5">
                {order.customerName}
              </h4>
            </div>
          </div>

          {/* Current Status Highlight Banner */}
          <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${currentStatusObj.color}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0 shadow-xs">
                <currentStatusObj.icon className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-ancient uppercase tracking-wider font-bold opacity-80">
                  Status Atual na Cozinha:
                </span>
                <h3 className="font-display font-black text-base sm:text-lg uppercase tracking-wide leading-tight">
                  {currentStatusObj.label}
                </h3>
              </div>
            </div>

            <span className="hidden sm:inline-block text-xs font-medium opacity-90 text-right max-w-xs">
              {currentStatusObj.sub}
            </span>
          </div>

          {/* Delivery Address Box */}
          {order.customerAddress && (
            <div className="p-3.5 rounded-xl bg-[#F8F6F0] border border-neutral-200 text-xs text-neutral-800 flex items-start gap-2 leading-relaxed">
              <MapPin className="w-4 h-4 text-[#CD9C20] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-[11px] font-ancient uppercase text-neutral-600">Endereço de Entrega:</strong>
                <span>{order.customerAddress}</span>
              </div>
            </div>
          )}

          {/* Checklist Items (Matching KDS Reference Image Checklist Style) */}
          <div className="space-y-3 pt-2">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-neutral-500">
              Itens do seu Banquete
            </h4>

            <div className="space-y-3 divide-y divide-neutral-100">
              {order.items.map((item: any, idx: number) => (
                <div key={idx} className="pt-3 first:pt-0">
                  <div className="flex items-start gap-3">
                    <CheckSquare className="w-4 h-4 text-[#CD9C20] stroke-[2.5] mt-0.5 shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-display font-bold text-sm sm:text-base text-[#1C1C1C]">
                          <span className="text-[#CD9C20] font-black">{item.quantity}x</span> {item.name}
                        </span>
                        <span className="font-mono text-xs sm:text-sm font-bold text-[#1C1C1C] shrink-0">
                          R$ {(item.totalPrice || item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}
                        </span>
                      </div>

                      {/* Doneness Tag */}
                      {item.doneness && (
                        <p className="text-xs text-amber-800 font-medium mt-0.5 pl-1">
                          • Ponto da carne: <strong>{item.doneness}</strong>
                        </p>
                      )}

                      {/* Observations */}
                      {item.notes && (
                        <p className="text-xs text-rose-700 font-bold mt-1 pl-1 bg-rose-50 px-2 py-0.5 rounded border border-rose-200 inline-block">
                          Obs: {item.notes}
                        </p>
                      )}

                      {/* Extra toppings */}
                      {item.selectedToppings && item.selectedToppings.length > 0 && (
                        <p className="text-xs text-emerald-800 font-medium mt-0.5 pl-1">
                          • Adicionais: {item.selectedToppings.map((t: any) => t.name).join(', ')}
                        </p>
                      )}

                      {/* Combo breakdown */}
                      {item.isComboUpgrade && (
                        <div className="mt-1 pl-2 text-xs text-neutral-600 font-medium space-y-0.5 border-l-2 border-[#CD9C20]/50">
                          <p>• 🍟 1x Batatas Espartanas Douradas</p>
                          <p>• 🥤 1x {item.comboDrink || 'Bebida Gelada'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Row */}
            <div className="pt-4 border-t-2 border-neutral-200 flex items-center justify-between text-[#1C1C1C]">
              <div>
                <span className="text-xs font-ancient uppercase text-neutral-500 block">Forma de Pagamento:</span>
                <span className="font-display font-black text-sm uppercase text-[#CD9C20]">
                  {order.paymentMethod === 'pix' ? 'PIX WhatsApp' : order.paymentMethod === 'card' ? 'Cartão na Entrega' : 'Dinheiro'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-ancient uppercase text-neutral-500 block">Total do Banquete:</span>
                <span className="font-display font-black text-2xl text-[#1C1C1C]">
                  R$ {order.total.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Prominent Luminous WhatsApp Action Button (Matching Reference Image!) */}
          <div className="pt-4 space-y-3">
            <a
              href={`https://wa.me/${STORE_INFO.whatsapp}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 bg-[#25D366] hover:bg-[#20bd5a] active:scale-[0.98] text-[#0B0B0B] font-display font-black text-sm uppercase tracking-wider rounded-2xl shadow-[0_4px_22px_rgba(37,211,102,0.4)] flex items-center justify-center gap-2.5 transition-all"
            >
              <MessageSquare className="w-5 h-5 fill-black stroke-black" />
              <span>ENVIAR COMPROVANTE NO WHATSAPP</span>
            </a>

            {/* PIX Copy Box (if awaiting payment) */}
            {order.status === 'awaiting_payment' && order.paymentMethod === 'pix' && (
              <div className="p-4 bg-[#F8F6F0] rounded-2xl border border-[#CD9C20]/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-ancient font-bold text-[#CD9C20] uppercase flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    Chave PIX Copia e Cola:
                  </span>
                  <span className="font-bold text-neutral-900 font-mono">
                    R$ {order.total.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-neutral-300 font-mono text-[11px] text-neutral-800 break-all select-all">
                  {pixKeySimulated}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(pixKeySimulated);
                    setCopiedPix(true);
                    setTimeout(() => setCopiedPix(false), 2500);
                  }}
                  className="w-full py-2.5 px-3 gold-gradient-bg text-black font-display font-bold text-xs uppercase rounded-xl flex items-center justify-center gap-2 hover:brightness-105 transition-all shadow-xs"
                >
                  {copiedPix ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Chave PIX Copiada com Sucesso!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Chave PIX</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 7-Step KDS Progress Timeline in Clean Gold/White Aesthetics */}
        <div className="bg-white rounded-3xl border border-neutral-200 p-6 space-y-4 shadow-sm">
          <h3 className="font-display font-black text-xs uppercase tracking-wider text-neutral-700 flex items-center gap-2">
            <SpartanHelmetIcon size={16} color="#CD9C20" />
            <span>Etapas da Forja & Cozinha</span>
          </h3>

          <div className="space-y-2.5">
            {KDS_STATUSES.map((step, idx) => {
              const isPast = idx < activeStatusIndex;
              const isCurrent = idx === activeStatusIndex;
              const StepIcon = step.icon;

              return (
                <div
                  key={step.key}
                  className={`flex items-start gap-3 p-3 rounded-xl border transition-all ${
                    isCurrent
                      ? 'bg-[#FBF9F5] border-[#CD9C20] shadow-sm'
                      : isPast
                      ? 'bg-neutral-50/80 border-neutral-200 opacity-70'
                      : 'bg-transparent border-neutral-100 opacity-40'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      isCurrent
                        ? 'gold-gradient-bg text-black font-black shadow-xs'
                        : isPast
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : <StepIcon className="w-3.5 h-3.5" />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4
                        className={`font-display text-xs uppercase tracking-wider ${
                          isCurrent ? 'text-[#1C1C1C] font-black' : isPast ? 'text-neutral-700 font-bold' : 'text-neutral-400'
                        }`}
                      >
                        {step.label}
                      </h4>
                      {isCurrent && (
                        <span className="text-[9px] font-ancient font-bold px-2 py-0.5 rounded-full bg-[#CD9C20]/20 text-[#CD9C20] border border-[#CD9C20]/40 animate-pulse">
                          EM ANDAMENTO
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-0.5">{step.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
