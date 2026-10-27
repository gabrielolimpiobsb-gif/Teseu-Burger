import React from 'react';
import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Painel Admin Master | Teseu Burger',
  description: 'Controle mestre de vendas, finanças, estoque do cardápio e inteligência de mercado.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
