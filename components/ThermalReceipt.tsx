'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { Printer, X, Check, Copy, FileText, Scissors, ExternalLink, Smartphone, Share2, Download } from 'lucide-react';
import { SpartanHelmetIcon } from './GreekOrnament';

export interface PrintableOrderData {
  id: number;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string | null;
  deliveryMethod: string;
  paymentMethod: string;
  status: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
  itemsJson: string;
  createdAt: string;
  paymentConfirmedAt?: string | null;
  productionCost?: number | null;
}

interface ThermalReceiptProps {
  order: PrintableOrderData | null;
  onClose: () => void;
  autoPrint?: boolean;
}

export function ThermalReceiptModal({ order, onClose, autoPrint = false }: ThermalReceiptProps) {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [receiptType, setReceiptType] = useState<'cozinha' | 'cliente' | 'completa'>('completa');
  const receiptRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  if (!order) return null;

  let parsedItems: any[] = [];
  try {
    parsedItems = JSON.parse(order.itemsJson);
  } catch {
    parsedItems = [];
  }

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('pt-BR');
  const formattedTime = orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const isDelivery = order.deliveryMethod === 'delivery';

  // Format payment method title
  const getPaymentLabel = (m: string) => {
    const lower = (m || '').toLowerCase();
    if (lower.includes('pix')) return 'PIX';
    if (lower.includes('card') || lower.includes('cartao') || lower.includes('cartão')) return 'CARTÃO DE CRÉDITO/DÉBITO';
    if (lower.includes('dinheiro') || lower.includes('cash')) return 'DINHEIRO';
    return m.toUpperCase();
  };

  const buildPlainTextComanda = () => {
    return [
      '================================',
      '        TESEU BURGER 🏛️         ',
      '      O SABOR DOS DEUSES        ',
      '================================',
      `COMANDA: #${order.orderNumber.replace(/^(TB-|PED-)/, '')} (${order.orderNumber})`,
      `DATA: ${formattedDate} às ${formattedTime}`,
      `TIPO: ${isDelivery ? '🛵 ENTREGA EM DOMICÍLIO' : '🏛️ RETIRADA NO BALCÃO'}`,
      '--------------------------------',
      'DADOS DO CLIENTE:',
      `NOME: ${order.customerName}`,
      `TEL: ${order.customerPhone}`,
      ...(isDelivery && order.customerAddress ? [`END: ${order.customerAddress}`] : []),
      '--------------------------------',
      'ITENS DO PEDIDO:',
      ...parsedItems.map((item, idx) => {
        let str = `${idx + 1}. [${item.quantity}x] ${item.name.toUpperCase()} - R$ ${(item.totalPrice || item.unitPrice * item.quantity).toFixed(2)}`;
        if (item.doneness) str += `\n   • Ponto: ${item.doneness}`;
        if (item.selectedToppings && item.selectedToppings.length > 0) {
          str += `\n   • Extras: ${item.selectedToppings.map((t: any) => t.name).join(', ')}`;
        }
        if (item.selectedSauces && item.selectedSauces.length > 0) {
          str += `\n   • Molhos: ${item.selectedSauces.map((s: any) => s.name).join(', ')}`;
        }
        if (item.selectedFries) {
          str += `\n   • Batata: ${item.selectedFries.name}`;
        }
        if (item.comboCasal) {
          str += `\n   • BURGER 1: ${item.comboCasal.burger1.name.toUpperCase()} (${item.comboCasal.burger1.doneness || 'AO PONTO'})`;
          str += `\n   • BURGER 2: ${item.comboCasal.burger2.name.toUpperCase()} (${item.comboCasal.burger2.doneness || 'AO PONTO'})`;
          str += `\n   • REFRI 1: ${item.comboCasal.drink1.name.toUpperCase()}`;
          str += `\n   • REFRI 2: ${item.comboCasal.drink2.name.toUpperCase()}`;
          str += `\n   • BATATA 1: ${item.comboCasal.fries1.name.toUpperCase()}`;
          str += `\n   • BATATA 2: ${item.comboCasal.fries2.name.toUpperCase()}`;
        }
        if (item.selectedDrink) {
          str += `\n   • Refri: ${item.selectedDrink.name}`;
        }
        if (item.drawnSweetGift) {
          str += `\n   • 🎁 BRINDE SORTEADO: ${item.drawnSweetGift.toUpperCase()}`;
        }
        if (item.isComboUpgrade) {
          str += `\n   • Combo: Batatas Espartanas + ${item.comboDrink || 'Bebida'}`;
        }
        if (item.notes) {
          str += `\n   *** OBS: ${item.notes.toUpperCase()} ***`;
        }
        return str;
      }),
      '--------------------------------',
      `SUBTOTAL: R$ ${(order.subtotal / 100).toFixed(2).replace('.', ',')}`,
      ...(isDelivery ? [`TAXA ENTREGA: R$ ${(order.deliveryFee / 100).toFixed(2).replace('.', ',')}`] : []),
      `TOTAL: R$ ${(order.total / 100).toFixed(2).replace('.', ',')}`,
      `PAGAMENTO: ${getPaymentLabel(order.paymentMethod)}`,
      ...(order.notes ? ['--------------------------------', `OBS DO CLIENTE:\n${order.notes}`] : []),
      '================================',
      '    IMPRESSO PELO TERMINAL KDS  ',
      '================================',
    ].join('\n');
  };

  const handlePrint = () => {
    try {
      window.print();
    } catch {
      window.open(`/comanda/${order.orderNumber}?auto=1`, '_blank');
    }
  };

  const handleCopyText = () => {
    const textLines = buildPlainTextComanda();
    navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadTxt = () => {
    const text = buildPlainTextComanda();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comanda-${order.orderNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = buildPlainTextComanda();
    const encoded = encodeURIComponent(text);
    window.open(`https://wa.me/5561992055050?text=${encoded}`, '_blank');
  };

  return (
    <>
      {/* ========================================================================= */}
      {/* 1. PRINT-ONLY CSS CONTAINER (Visible strictly during window.print())     */}
      {/* ========================================================================= */}
      <div
        id="thermal-print-area"
        className="hidden print:block text-black bg-white"
        style={{
          width: paperWidth === '80mm' ? '72mm' : '52mm',
          margin: '0 auto',
          padding: paperWidth === '80mm' ? '2mm' : '1mm',
          fontFamily: '"Courier New", Courier, monospace, monospace',
          fontSize: paperWidth === '80mm' ? '12px' : '10px',
          lineHeight: '1.25',
          color: '#000000',
        }}
      >
        {/* Header */}
        <div className="text-center pb-2">
          <p className="font-bold text-base tracking-wider uppercase">TESEU BURGER</p>
          <p className="text-[10px] uppercase tracking-widest">O SABOR DOS DEUSES</p>
          <p className="text-[9px] mt-0.5">BRASÍLIA - DF</p>
          <p className="my-1 border-b border-black border-dashed" />
          <p className="font-black text-sm uppercase">
            {receiptType === 'cozinha' && '--- COMANDA DA COZINHA ---'}
            {receiptType === 'cliente' && '--- VIA DE ENTREGA / CLIENTE ---'}
            {receiptType === 'completa' && '--- CONTROLE GERAL / PRODUÇÃO ---'}
          </p>
          <p className="font-black text-2xl my-1">#{order.orderNumber.replace(/^(TB-|PED-)/, '')}</p>
          <p className="text-[10px] font-mono">({order.orderNumber})</p>
        </div>

        {/* Date & Service Type */}
        <div className="border-t border-b border-black border-dashed py-1 my-1 text-[11px]">
          <div className="flex justify-between">
            <span>DATA: {formattedDate}</span>
            <span>HORA: {formattedTime}</span>
          </div>
          <div className="mt-1 font-bold">
            <span>TIPO: </span>
            <span className="uppercase underline">
              {isDelivery ? '🛵 ENTREGA EM DOMICÍLIO' : '🏛️ RETIRADA NO BALCÃO'}
            </span>
          </div>
        </div>

        {/* Customer Information */}
        <div className="border-b border-black border-dashed pb-2 my-1">
          <p className="font-bold uppercase text-[11px]">DADOS DO CLIENTE:</p>
          <p className="font-bold text-xs">{order.customerName}</p>
          <p className="text-[11px]">TEL: {order.customerPhone}</p>
          {isDelivery && order.customerAddress && (
            <div className="mt-1 p-1 bg-black/5 border border-black/20 text-[11px] leading-tight">
              <p className="font-bold">ENDEREÇO DE ENTREGA:</p>
              <p>{order.customerAddress}</p>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="border-b border-black border-dashed pb-2 my-1">
          <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-black/40 border-dotted mb-1">
            <span>QTD ITEM</span>
            <span>TOTAL</span>
          </div>

          <div className="space-y-2">
            {parsedItems.map((item, index) => (
              <div key={index} className="text-[11px]">
                <div className="flex justify-between items-start font-bold">
                  <span className="text-xs">
                    [{item.quantity}x] {item.name.toUpperCase()}
                  </span>
                  <span>R$ {(item.totalPrice || item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                </div>

                {item.doneness && (
                  <p className="pl-2 font-bold">• PONTO: {item.doneness.toUpperCase()}</p>
                )}

                {item.selectedToppings && item.selectedToppings.length > 0 && (
                  <p className="pl-2">• EXTRAS: {item.selectedToppings.map((t: any) => t.name).join(', ')}</p>
                )}

                {item.isComboUpgrade && (
                  <div className="pl-2 italic">
                    <p>+ COMBO ESPARTANO</p>
                    <p>• Batatas Espartanas</p>
                    <p>• {item.comboDrink || 'Refrigerante'}</p>
                  </div>
                )}

                {item.notes && (
                  <div className="mt-0.5 p-1 bg-black text-white font-bold text-[10px] uppercase">
                    *** OBS: {item.notes} ***
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="border-b border-black border-dashed py-1 text-[11px] space-y-0.5">
          <div className="flex justify-between">
            <span>SUBTOTAL:</span>
            <span>R$ {(order.subtotal / 100).toFixed(2).replace('.', ',')}</span>
          </div>
          {isDelivery && (
            <div className="flex justify-between">
              <span>TAXA DE ENTREGA:</span>
              <span>R$ {(order.deliveryFee / 100).toFixed(2).replace('.', ',')}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-sm pt-1 border-t border-black/40 border-dotted">
            <span>TOTAL:</span>
            <span>R$ {(order.total / 100).toFixed(2).replace('.', ',')}</span>
          </div>
          <div className="flex justify-between font-bold text-[11px] pt-1">
            <span>PAGAMENTO:</span>
            <span className="uppercase">[{getPaymentLabel(order.paymentMethod)}]</span>
          </div>
        </div>

        {/* General Customer Notes */}
        {order.notes && (
          <div className="border-b border-black border-dashed py-1 text-[10px]">
            <p className="font-bold">OBSERVAÇÕES DO PEDIDO:</p>
            <p className="italic">{order.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-2 text-[10px] space-y-1">
          <p className="font-bold">*** OBRIGADO PELA PREFERÊNCIA! ***</p>
          <p className="text-[9px]">Siga nosso Instagram @teseuburger</p>
          <p className="text-[8px] text-gray-700">Impresso em {formattedDate} {formattedTime}</p>
          <div className="pt-4 flex items-center justify-center gap-1 text-[8px] text-gray-500">
            <span>- - - - - CORTE AQUI - - - - -</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ON-SCREEN INTERACTIVE MODAL & PREVIEW (Hidden during window.print())   */}
      {/* ========================================================================= */}
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 print:hidden animate-in fade-in">
        <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border-2 border-[#CD9C20]/40 overflow-hidden flex flex-col max-h-[92vh]">
          {/* Modal Header */}
          <div className="bg-[#161616] text-white px-5 py-4 flex items-center justify-between border-b border-[#CD9C20]/30 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#222] border border-[#CD9C20]/40 flex items-center justify-center text-[#F5CB5C]">
                <Printer className="w-4 h-4 text-[#F5CB5C]" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm tracking-wide text-white uppercase">
                  Imprimir Comanda Térmica
                </h3>
                <span className="text-[10px] text-[#CD9C20] font-mono">
                  Pedido #{order.orderNumber.replace(/^(TB-|PED-)/, '')} • {order.customerName}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Config Bar */}
          <div className="bg-[#F8F6F0] border-b border-[#CD9C20]/20 p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Paper Size selector */}
            <div className="flex items-center gap-1">
              <span className="text-neutral-600 font-bold text-[11px]">Largura:</span>
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  paperWidth === '80mm'
                    ? 'bg-[#161616] text-[#F5CB5C] shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-300'
                }`}
              >
                80mm (Padrão)
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  paperWidth === '58mm'
                    ? 'bg-[#161616] text-[#F5CB5C] shadow-xs'
                    : 'bg-white text-neutral-600 border border-neutral-300'
                }`}
              >
                58mm (Mini)
              </button>
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1">
              <select
                value={receiptType}
                onChange={(e) => setReceiptType(e.target.value as any)}
                className="py-1 px-2 rounded-lg bg-white border border-[#CD9C20]/30 text-xs font-semibold text-neutral-800"
              >
                <option value="completa">Comanda Completa</option>
                <option value="cozinha">Cozinha (Chapa)</option>
                <option value="cliente">Entrega / Cliente</option>
              </select>
            </div>
          </div>

          {/* Thermal Receipt Visual Preview (Simulating paper roll) */}
          <div className="flex-1 overflow-y-auto p-4 bg-neutral-100 flex justify-center">
            <div
              ref={receiptRef}
              className={`bg-white border border-neutral-300 shadow-md p-4 text-black text-left transition-all ${
                paperWidth === '80mm' ? 'w-[300px]' : 'w-[230px]'
              }`}
              style={{
                fontFamily: '"Courier New", Courier, monospace',
                fontSize: paperWidth === '80mm' ? '12px' : '10px',
                lineHeight: '1.3',
              }}
            >
              {/* Receipt Header */}
              <div className="text-center pb-2">
                <div className="flex justify-center mb-1">
                  <SpartanHelmetIcon size={20} color="#000000" />
                </div>
                <p className="font-bold text-sm tracking-wider uppercase">TESEU BURGER</p>
                <p className="text-[10px] uppercase">O SABOR DOS DEUSES</p>
                <div className="my-1.5 border-b border-black border-dashed" />
                <p className="font-bold text-xs uppercase">
                  {receiptType === 'cozinha' && '--- COMANDA COZINHA ---'}
                  {receiptType === 'cliente' && '--- VIA ENTREGA / CLIENTE ---'}
                  {receiptType === 'completa' && '--- PRODUÇÃO & EXPEDIÇÃO ---'}
                </p>
                <p className="font-black text-2xl my-1">
                  #{order.orderNumber.replace(/^(TB-|PED-)/, '')}
                </p>
                <p className="text-[10px]">({order.orderNumber})</p>
              </div>

              {/* Date & Time */}
              <div className="border-t border-b border-black border-dashed py-1.5 my-1.5 text-[11px]">
                <div className="flex justify-between">
                  <span>{formattedDate}</span>
                  <span>{formattedTime}</span>
                </div>
                <div className="mt-1 font-bold">
                  {isDelivery ? '🛵 ENTREGA EM DOMICÍLIO' : '🏛️ RETIRADA NO BALCÃO'}
                </div>
              </div>

              {/* Customer */}
              <div className="border-b border-black border-dashed pb-2 my-1.5">
                <p className="font-bold text-[11px] uppercase">CLIENTE:</p>
                <p className="font-bold text-xs">{order.customerName}</p>
                <p className="text-[11px]">TEL: {order.customerPhone}</p>
                {isDelivery && order.customerAddress && (
                  <div className="mt-1 p-1.5 bg-neutral-100 border border-neutral-300 text-[10px] leading-tight">
                    <p className="font-bold">ENDEREÇO:</p>
                    <p>{order.customerAddress}</p>
                  </div>
                )}
              </div>

              {/* Items */}
              <div className="border-b border-black border-dashed pb-2 my-1.5">
                <p className="font-bold text-[11px] uppercase pb-1 border-b border-black/40 border-dotted mb-1 flex justify-between">
                  <span>ITENS</span>
                  <span>VALOR</span>
                </p>

                <div className="space-y-2">
                  {parsedItems.map((item, idx) => (
                    <div key={idx} className="text-[11px]">
                      <div className="flex justify-between items-start font-bold">
                        <span>
                          [{item.quantity}x] {item.name.toUpperCase()}
                        </span>
                        <span>R$ {(item.totalPrice || item.unitPrice * item.quantity).toFixed(2).replace('.', ',')}</span>
                      </div>

                      {item.doneness && (
                        <p className="pl-2 font-bold text-neutral-800">• Ponto: {item.doneness}</p>
                      )}

                      {item.selectedToppings && item.selectedToppings.length > 0 && (
                        <p className="pl-2 text-[10px] text-neutral-700">
                          • Extras: {item.selectedToppings.map((t: any) => t.name).join(', ')}
                        </p>
                      )}

                      {item.selectedSauces && item.selectedSauces.length > 0 && (
                        <p className="pl-2 text-[10px] text-neutral-700">
                          • Molhos: {item.selectedSauces.map((s: any) => s.name).join(', ')}
                        </p>
                      )}

                      {item.selectedFries && (
                        <p className="pl-2 text-[10px] font-bold text-amber-900">
                          • Batata: {item.selectedFries.name.toUpperCase()}
                        </p>
                      )}

                      {item.selectedDrink && (
                        <p className="pl-2 text-[10px] font-bold text-neutral-900">
                          • Refri: {item.selectedDrink.name.toUpperCase()}
                        </p>
                      )}

                      {item.comboCasal && (
                        <div className="pl-2 text-[10px] space-y-0.5 text-neutral-900 border-l border-black my-1">
                          <p className="font-bold">• Burger 1: {item.comboCasal.burger1.name.toUpperCase()} ({item.comboCasal.burger1.doneness || 'Ao ponto'})</p>
                          <p className="font-bold">• Burger 2: {item.comboCasal.burger2.name.toUpperCase()} ({item.comboCasal.burger2.doneness || 'Ao ponto'})</p>
                          <p>• Refri 1: {item.comboCasal.drink1.name.toUpperCase()}</p>
                          <p>• Refri 2: {item.comboCasal.drink2.name.toUpperCase()}</p>
                          <p>• Batata 1: {item.comboCasal.fries1.name.toUpperCase()}</p>
                          <p>• Batata 2: {item.comboCasal.fries2.name.toUpperCase()}</p>
                        </div>
                      )}

                      {item.drawnSweetGift && (
                        <p className="pl-2 text-[10px] font-black text-amber-900">
                          • 🎁 BRINDE SORTEADO: {item.drawnSweetGift.toUpperCase()}
                        </p>
                      )}

                      {item.isComboUpgrade && (
                        <div className="pl-2 text-[10px] italic">
                          <p>• Batatas Espartanas</p>
                          <p>• {item.comboDrink || 'Bebida Gelada'}</p>
                        </div>
                      )}

                      {item.notes && (
                        <div className="mt-0.5 p-1 bg-black text-white font-bold text-[10px] uppercase">
                          OBS: {item.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="border-b border-black border-dashed py-1.5 text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {(order.subtotal / 100).toFixed(2).replace('.', ',')}</span>
                </div>
                {isDelivery && (
                  <div className="flex justify-between">
                    <span>Taxa Entrega:</span>
                    <span>R$ {(order.deliveryFee / 100).toFixed(2).replace('.', ',')}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs pt-1 border-t border-black/30 border-dotted">
                  <span>TOTAL:</span>
                  <span>R$ {(order.total / 100).toFixed(2).replace('.', ',')}</span>
                </div>
                <div className="flex justify-between font-bold text-[11px] pt-1">
                  <span>PAGAMENTO:</span>
                  <span>{getPaymentLabel(order.paymentMethod)}</span>
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <div className="border-b border-black border-dashed py-1.5 text-[10px]">
                  <p className="font-bold">OBS. CLIENTE:</p>
                  <p className="italic">{order.notes}</p>
                </div>
              )}

              {/* Receipt Footer with scissors cut mark */}
              <div className="text-center pt-2 text-[10px] space-y-1">
                <p className="font-bold">TESEU BURGER</p>
                <p className="text-[9px] text-neutral-600">Obrigado pela preferência!</p>
                <div className="pt-3 flex items-center justify-center gap-1 text-[9px] text-neutral-500 border-t border-neutral-300 border-dashed">
                  <Scissors className="w-3 h-3" />
                  <span>Destaque para o pedido</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bluetooth & Pop-up Advice Strip */}
          <div className="mx-4 my-2 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-[11px] text-amber-900 flex items-start gap-2 shrink-0">
            <Smartphone className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-tight">
              <span className="font-bold">Mini Impressoras Bluetooth ou Celular:</span>
              <span className="text-amber-800"> Caso o pop-up não abra automaticamente, use </span>
              <Link
                href={`/comanda/${order.orderNumber}?auto=1`}
                target="_blank"
                className="font-bold underline text-amber-950 hover:text-black"
              >
                Abrir em Nova Aba
              </Link>
              <span className="text-amber-800"> ou copie o texto para apps como RawBT ou Bluetooth POS.</span>
            </div>
          </div>

          {/* Action Buttons Bar */}
          <div className="p-4 bg-white border-t border-neutral-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handleCopyText}
                className="py-2 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Copiar texto puro da comanda para colar no WhatsApp ou app Bluetooth"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadTxt}
                className="py-2 px-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Baixar arquivo de texto para impressoras USB/Bluetooth"
              >
                {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Download className="w-3.5 h-3.5" />}
                <span>.TXT</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="py-2 px-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1 transition-colors border border-emerald-200"
                title="Enviar comanda via WhatsApp para entregador ou impressora"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Zap</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/comanda/${order.orderNumber}`}
                target="_blank"
                className="py-2 px-3 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                title="Abrir comanda em página inteira sem iframe"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Nova Aba</span>
              </Link>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2 px-4 rounded-xl gold-gradient-bg hover:brightness-105 active:scale-[0.98] text-[#0B0B0B] border border-[#CD9C20]/50 font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all"
              >
                <Printer className="w-4 h-4 text-[#0B0B0B]" />
                <span>Imprimir Agora</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
