import { db } from './index.ts';
import { menuOverrides } from './schema.ts';
import { eq } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

export interface MenuOverrideData {
  itemId: string;
  name?: string;
  description?: string;
  price?: number; // in cents
  costPrice?: number; // in cents (production cost / CMV)
  isAvailable?: number; // 1 or 0
  imageUrl?: string;
}

const MENU_CACHE_FILE = path.join(process.cwd(), '.menu_cache.json');

function readLocalMenuOverrides(): any[] {
  try {
    if (fs.existsSync(MENU_CACHE_FILE)) {
      const data = fs.readFileSync(MENU_CACHE_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {}
  return [];
}

function saveLocalMenuOverrides(list: any[]) {
  try {
    fs.writeFileSync(MENU_CACHE_FILE, JSON.stringify(list, null, 2), 'utf-8');
  } catch {}
}

export async function getAllMenuOverrides() {
  try {
    const rows = await db.select().from(menuOverrides);
    if (rows && rows.length > 0) {
      saveLocalMenuOverrides(rows);
      return rows;
    }
  } catch (error) {
    // Cloud SQL proxy connection error fallback
  }

  return readLocalMenuOverrides();
}

export async function upsertMenuOverride(data: MenuOverrideData) {
  // Always update local persistent cache
  const localList = readLocalMenuOverrides();
  const existingIdx = localList.findIndex((item) => item.itemId === data.itemId);
  const now = new Date().toISOString();

  let localResult: any = null;
  if (existingIdx >= 0) {
    localList[existingIdx] = {
      ...localList[existingIdx],
      name: data.name !== undefined ? data.name : localList[existingIdx].name,
      description: data.description !== undefined ? data.description : localList[existingIdx].description,
      price: data.price !== undefined ? data.price : localList[existingIdx].price,
      costPrice: data.costPrice !== undefined ? data.costPrice : localList[existingIdx].costPrice,
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : localList[existingIdx].isAvailable,
      imageUrl: data.imageUrl !== undefined ? data.imageUrl : localList[existingIdx].imageUrl,
      updatedAt: now,
    };
    localResult = localList[existingIdx];
  } else {
    localResult = {
      id: Date.now(),
      itemId: data.itemId,
      name: data.name,
      description: data.description,
      price: data.price,
      costPrice: data.costPrice,
      isAvailable: data.isAvailable ?? 1,
      imageUrl: data.imageUrl,
      updatedAt: now,
    };
    localList.push(localResult);
  }
  saveLocalMenuOverrides(localList);

  // Attempt database persistence
  try {
    const existing = await db
      .select()
      .from(menuOverrides)
      .where(eq(menuOverrides.itemId, data.itemId))
      .limit(1);

    if (existing.length > 0) {
      const updated = await db
        .update(menuOverrides)
        .set({
          name: data.name !== undefined ? data.name : existing[0].name,
          description: data.description !== undefined ? data.description : existing[0].description,
          price: data.price !== undefined ? data.price : existing[0].price,
          costPrice: data.costPrice !== undefined ? data.costPrice : existing[0].costPrice,
          isAvailable: data.isAvailable !== undefined ? data.isAvailable : existing[0].isAvailable,
          imageUrl: data.imageUrl !== undefined ? data.imageUrl : existing[0].imageUrl,
          updatedAt: new Date(),
        })
        .where(eq(menuOverrides.itemId, data.itemId))
        .returning();

      return updated[0];
    } else {
      const inserted = await db
        .insert(menuOverrides)
        .values({
          itemId: data.itemId,
          name: data.name,
          description: data.description,
          price: data.price,
          costPrice: data.costPrice,
          isAvailable: data.isAvailable ?? 1,
          imageUrl: data.imageUrl,
          updatedAt: new Date(),
        })
        .returning();

      return inserted[0];
    }
  } catch (error) {
    // Return the updated local record safely
    return localResult;
  }
}

export async function toggleItemStock(itemId: string, isAvailable: number) {
  return upsertMenuOverride({
    itemId,
    isAvailable,
  });
}
