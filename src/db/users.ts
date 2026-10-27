import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export interface UpsertUserData {
  uid: string;
  email: string;
  displayName?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
}

export async function getOrCreateUser(data: UpsertUserData) {
  try {
    const result = await db.insert(users)
      .values({
        uid: data.uid,
        email: data.email,
        displayName: data.displayName,
        photoUrl: data.photoUrl,
        phone: data.phone,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email: data.email,
          displayName: data.displayName,
          photoUrl: data.photoUrl,
          phone: data.phone ?? undefined,
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    return {
      id: 1,
      uid: data.uid,
      email: data.email,
      displayName: data.displayName || null,
      photoUrl: data.photoUrl || null,
      phone: data.phone || null,
    };
  }
}

export async function getUserByUid(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
    return result[0] || null;
  } catch (error) {
    return null;
  }
}
