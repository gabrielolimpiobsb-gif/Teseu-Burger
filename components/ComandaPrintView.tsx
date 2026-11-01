'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Printer,
  Copy,
  Check,
  Download,
  Share2,
  ArrowLeft,
  Scissors,
  Smartphone,
  FileText,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
} from 'lucide-react';
import { SpartanHelmetIcon } from '@/components/GreekOrnament';

interface ComandaPrintViewProps {
  order: any;
  autoPrint?: boolean;
}

export function ComandaPrintView({ order, autoPrint = false }: ComandaPrintViewProps) {
  const [paperWidth, setPaperWidth] = useState<'80mm' | '58mm'>('80mm');
  const [receiptType, setReceiptType] = useState<'cozinha' | 'cliente' | 'completa'>('completa');
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [printError, setPrintError] = useState<string | null>(null);

  // Auto-print on mount if requested via URL param ?auto=1
  useEffect(() => {
    if (autoPrint && typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (err: any) {
          console.warn('Auto print was blocked:', err);
          setPrintError('O navegador bloqueou a impressão automática. Clique no botão "Imprimir Comanda" abaixo.');
        }
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [autoPrint]);

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F5F5F5] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-amber-600 mb-3" />
        <h1 className="text-xl font-bold text-neutral-800">Pedido não encontrado</h1>
        <p className="text-sm text-neutral-500 mt-1 max-w-sm">
          Não localizamos nenhuma comanda com este identificador.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/cozinha"
            className="px-4 py-2 bg-[#161616] text-[#F5CB5C] rounded-xl text-xs font-bold"
          >
            Voltar para a Cozinha (KDS)
          </Link>
          <Link
            href="/admin"
            className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold"
          >
            Ir para o Admin
          </Link>
        </div>
      </div>
    );
  }

  let parsedItems: any[] = [];
  try {
    parsedItems = typeof order.itemsJson === 'string' ? JSON.parse(order.itemsJson) : order.itemsJson || [];
  } catch {
    parsedItems = [];
  }

  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('pt-BR');
  const formattedTime = orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  const isDelivery = order.deliveryMethod === 'delivery';

  // Format payment method
  const getPaymentLabel = (m: string) => {
    const lower = (m || '').toLowerCase();
    if (lower.includes('pix')) return 'PIX';
    if (lower.includes('card') || lower.includes('cartao') || lower.includes('cartão')) return 'CARTÃO DE CRÉDITO/DÉBITO';
    if (lower.includes('dinheiro') || lower.includes('cash')) return 'DINHEIRO';
    return m ? m.toUpperCase() : 'A DEFINIR';
  };

  // Plain-text thermal formatted text for WhatsApp or Mini Bluetooth Printers (RawBT / ESC-POS)
  const buildPlainTextComanda = () => {
    const lines = [
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
    ];
    return lines.join('\n');
  };

  const handlePrint = () => {
    setPrintError(null);
    try {
      window.print();
    } catch (err: any) {
      console.error('Print failed:', err);
      setPrintError('Erro ao abrir diálogo de impressão do navegador. Tente usar "Copiar Texto" ou salvar como arquivo.');
    }
  };

  const handleCopyText = () => {
    const text = buildPlainTextComanda();
    navigator.clipboard.writeText(text);
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
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F0EDE6] text-neutral-900 font-sans">
      {/* ========================================================= */}
      {/* 1. TOP CONTROL BAR (HIDDEN IN PRINT)                      */}
      {/* ========================================================= */}
      <header className="print:hidden sticky top-0 z-40 bg-[#161616] text-white border-b border-[#CD9C20]/40 shadow-lg px-4 py-3">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link
              href="/cozinha"
              className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs font-bold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Cozinha</span>
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <SpartanHelmetIcon size={18} color="#F5CB5C" />
                <h1 className="font-display font-bold text-sm tracking-wide text-white uppercase">
                  Comanda #{order.orderNumber.replace(/^(TB-|PED-)/, '')}
                </h1>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {order.customerName} • {isDelivery ? 'Entrega' : 'Retirada'}
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Paper Size Selector */}
            <div className="flex items-center bg-neutral-800 p-0.5 rounded-xl border border-neutral-700 text-xs">
              <button
                type="button"
                onClick={() => setPaperWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  paperWidth === '80mm'
                    ? 'bg-[#F5CB5C] text-[#0B0B0B] shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                80mm
              </button>
              <button
                type="button"
                onClick={() => setPaperWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  paperWidth === '58mm'
                    ? 'bg-[#F5CB5C] text-[#0B0B0B] shadow-xs'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                58mm
              </button>
            </div>

            {/* Receipt Type */}
            <select
              value={receiptType}
              onChange={(e) => setReceiptType(e.target.value as any)}
              className="bg-neutral-800 text-neutral-200 border border-neutral-700 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
            >
              <option value="completa">Completa</option>
              <option value="cozinha">Cozinha</option>
              <option value="cliente">Cliente</option>
            </select>

            {/* Print Button Primary */}
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl gold-gradient-bg text-[#0B0B0B] font-display font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4 stroke-[2.5]" />
              <span>Imprimir</span>
            </button>
          </div>
        </div>

        {/* Secondary helpers strip */}
        <div className="max-w-4xl mx-auto mt-2 pt-2 border-t border-neutral-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-400">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyText}
              className="hover:text-[#F5CB5C] flex items-center gap-1 transition-colors"
              title="Copiar comanda para colar no app de mini impressora Bluetooth (RawBT/ESC-POS)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Texto Copiado!' : 'Copiar Texto Puro'}</span>
            </button>

            <span className="text-neutral-600">•</span>

            <button
              type="button"
              onClick={handleDownloadTxt}
              className="hover:text-[#F5CB5C] flex items-center gap-1 transition-colors"
            >
              {downloaded ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloaded ? 'Baixado!' : 'Baixar .TXT'}</span>
            </button>

            <span className="text-neutral-600">•</span>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="hover:text-emerald-400 flex items-center gap-1 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar no WhatsApp</span>
            </button>
          </div>

          <div className="text-[10px] text-neutral-500 font-mono">
            Atalho: Pressione Ctrl+P (ou Cmd+P) para imprimir
          </div>
        </div>

        {printError && (
          <div className="max-w-4xl mx-auto mt-2 p-2 bg-amber-900/60 border border-amber-600 rounded-xl text-amber-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span>{printError}</span>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* 2. RECEIPT CANVAS / PAPER (SCREEN + PRINT)                */}
      {/* ========================================================= */}
      <main className="py-8 px-4 flex justify-center print:p-0 print:m-0 print:bg-white">
        <div
          id="thermal-receipt-document"
          className="bg-white text-black shadow-2xl print:shadow-none border border-neutral-300 print:border-none transition-all relative"
          style={{
            width: paperWidth === '80mm' ? '76mm' : '54mm',
            padding: paperWidth === '80mm' ? '4mm 3mm' : '3mm 2mm',
            fontFamily: '"Courier New", Courier, monospace, monospace',
            fontSize: paperWidth === '80mm' ? '12px' : '10px',
            lineHeight: '1.25',
            color: '#000000',
            backgroundColor: '#ffffff',
          }}
        >
          {/* Header */}
          <div className="text-center pb-2">
            <p className="font-bold text-base tracking-wider uppercase">TESEU BURGER</p>
            <p className="text-[10px] uppercase tracking-widest">O SABOR DOS DEUSES</p>
            <p className="text-[9px] mt-0.5">BRASÍLIA - DF</p>
            <p className="my-1 border-b border-black border-dashed" />
            <p className="font-black text-xs uppercase">
              {receiptType === 'cozinha' && '--- COMANDA DA COZINHA ---'}
              {receiptType === 'cliente' && '--- VIA DE ENTREGA / CLIENTE ---'}
              {receiptType === 'completa' && '--- CONTROLE GERAL / PRODUÇÃO ---'}
            </p>
            <p className="font-black text-2xl my-1">#{order.orderNumber.replace(/^(TB-|PED-)/, '')}</p>
            <p className="text-[10px] font-mono">({order.orderNumber})</p>
          </div>

          {/* Date & Service Type */}
          <div className="border-t border-b border-black border-dashed py-1.5 my-1 text-[11px]">
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
              <div className="mt-1 p-1.5 bg-black/5 border border-black/20 text-[11px] leading-tight">
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

                  {item.selectedSauces && item.selectedSauces.length > 0 && (
                    <p className="pl-2">• MOLHOS: {item.selectedSauces.map((s: any) => s.name).join(', ')}</p>
                  )}

                  {item.selectedFries && (
                    <p className="pl-2 font-bold">• BATATA: {item.selectedFries.name.toUpperCase()}</p>
                  )}

                  {item.selectedDrink && (
                    <p className="pl-2 font-bold">• REFRI: {item.selectedDrink.name.toUpperCase()}</p>
                  )}

                  {item.drawnSweetGift && (
                    <p className="pl-2 font-black">• 🎁 BRINDE SORTEADO: {item.drawnSweetGift.toUpperCase()}</p>
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

          {/* Footer with tear line */}
          <div className="text-center pt-2 text-[10px] space-y-1">
            <p className="font-bold">*** OBRIGADO PELA PREFERÊNCIA! ***</p>
            <p className="text-[9px]">Siga nosso Instagram @teseuburger</p>
            <p className="text-[8px] text-gray-700">Impresso em {formattedDate} {formattedTime}</p>
            <div className="pt-4 flex items-center justify-center gap-1 text-[8px] text-gray-500">
              <Scissors className="w-3 h-3" />
              <span>- - - - - CORTE AQUI - - - - -</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
