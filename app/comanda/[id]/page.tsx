import React from 'react';
import type { Metadata } from 'next';
import { getOrderByNumber, getOrderById } from '@/src/db/orders';
import { ComandaPrintView } from '@/components/ComandaPrintView';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ auto?: string; width?: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Comanda #${id} | Teseu Burger`,
    description: `Comanda térmica de produção para o pedido #${id}`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function ComandaPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sParams = await searchParams;
  const autoPrint = sParams.auto === '1' || sParams.auto === 'true';

  let order: any = null;
  if (id) {
    order = await getOrderByNumber(id);
    if (!order && !isNaN(Number(id))) {
      order = await getOrderById(Number(id));
    }
  }

  return <ComandaPrintView order={order} autoPrint={autoPrint} />;
}
