import React from 'react';
import type { Metadata } from 'next';
import { KitchenDisplaySystem } from '@/components/KitchenDisplaySystem';

export const metadata: Metadata = {
  title: 'KDS // Painel da Cozinha | Teseu Burger',
  description: 'Sistema de Display da Cozinha (KDS) em tempo real para controle de produção e comandas.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function KitchenPage() {
  return <KitchenDisplaySystem />;
}
