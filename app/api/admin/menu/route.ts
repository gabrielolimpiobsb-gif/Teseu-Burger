import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/admin-auth';
import { getAllMenuOverrides, upsertMenuOverride, toggleItemStock } from '@/src/db/menu';
import { MENU_ITEMS } from '@/lib/data';
import { ITEM_BASE_COSTS } from '@/lib/financial-engine';

// Public GET: returns list of menu items merged with active database overrides & cost prices
export async function GET() {
  try {
    const overrides = await getAllMenuOverrides();
    const overridesMap = new Map(overrides.map((o) => [o.itemId, o]));

    const mergedItems = MENU_ITEMS.map((item) => {
      const override = overridesMap.get(item.id);
      const defaultCost = ITEM_BASE_COSTS[item.id]?.cost || Math.round(item.price * 0.35 * 100) / 100;
      if (!override) {
        return {
          ...item,
          costPrice: defaultCost,
          isAvailable: 1,
        };
      }
      return {
        ...item,
        name: override.name || item.name,
        description: override.description || item.description,
        price: override.price ? override.price / 100 : item.price,
        costPrice: override.costPrice ? override.costPrice / 100 : defaultCost,
        isAvailable: override.isAvailable,
        imageUrl: override.imageUrl || undefined,
      };
    });

    return NextResponse.json({ items: mergedItems, overrides });
  } catch (error) {
    console.error('Failed to get menu items:', error);
    return NextResponse.json({ error: 'Erro ao carregar cardápio.' }, { status: 500 });
  }
}

// Protected POST: admin only updates product, cost price, or toggles stock
export async function POST(req: NextRequest) {
  const session = await verifyAdminSession(req);
  if (!session) {
    return NextResponse.json(
      { error: 'Acesso restrito. Apenas o proprietário pode alterar o cardápio e estoque.' },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { itemId, name, description, price, costPrice, isAvailable, imageUrl, action } = body;

    if (!itemId) {
      return NextResponse.json({ error: 'ID do item é obrigatório.' }, { status: 400 });
    }

    if (action === 'toggle_stock') {
      const updated = await toggleItemStock(itemId, isAvailable === 0 ? 0 : 1);
      return NextResponse.json({
        success: true,
        message: `Estoque do item "${itemId}" atualizado para ${isAvailable === 0 ? 'Esgotado' : 'Ativo'}.`,
        item: updated,
      });
    }

    // Full item update (name, description, price, costPrice in cents, stock, string image URL)
    const priceInCents = price !== undefined && price !== '' ? Math.round(Number(price) * 100) : undefined;
    const costPriceInCents = costPrice !== undefined && costPrice !== '' ? Math.round(Number(costPrice) * 100) : undefined;
    
    const updated = await upsertMenuOverride({
      itemId,
      name,
      description,
      price: priceInCents,
      costPrice: costPriceInCents,
      isAvailable,
      imageUrl,
    });

    return NextResponse.json({
      success: true,
      message: 'Item e custos do produto atualizados com sucesso.',
      item: updated,
    });
  } catch (error) {
    console.error('Failed to update menu item:', error);
    return NextResponse.json({ error: 'Falha ao salvar alterações do cardápio.' }, { status: 500 });
  }
}
