import React from 'react';
import type { Metadata } from 'next';
import { CartPageContent } from '@/components/CartPageContent';

export const metadata: Metadata = {
  title: 'Carrinho de Pedidos | Teseu Burger',
  description: 'Confira seus hambúrgueres artesanais, adicione brindes e finalize seu pedido com total facilidade e clareza no Teseu Burger.',
};

export default function CarinhoPage() {
  return <CartPageContent />;
}
