import React from 'react';
import { OrderLiveTracker } from '@/components/OrderLiveTracker';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderTrackingPage({ params }: PageProps) {
  const { id } = await params;
  return <OrderLiveTracker initialOrderNumber={id} />;
}
