import { notFound } from 'next/navigation';
import { MENU_ITEMS } from '@/lib/data';
import { ProductDetailView } from './ProductDetailView';

// Pre-render all product pages at build time for instant loading (0ms navigation delay)
export function generateStaticParams() {
  return MENU_ITEMS.map((item) => ({
    id: item.id,
  }));
}

interface ProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;
  const item = MENU_ITEMS.find((m) => m.id === id);

  if (!item) {
    notFound();
  }

  return <ProductDetailView item={item} />;
}
