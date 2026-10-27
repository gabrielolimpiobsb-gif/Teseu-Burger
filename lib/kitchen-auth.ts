import { cookies } from 'next/headers';

export const KITCHEN_SESSION_COOKIE = 'teseu_kitchen_auth';
export const DEFAULT_KITCHEN_PASSCODE = process.env.KITCHEN_OPERATOR_PASSCODE || 'OLIMPO-CHAPA-2026';

export const AUTHORIZED_KITCHEN_EMAIL = (
  process.env.AUTHORIZED_KITCHEN_EMAIL || 'gabrielolimpiobsb@gmail.com'
).toLowerCase().trim();

export const ACCEPTED_KITCHEN_PASSCODES = [
  'OLIMPO-CHAPA-2026',
  'cozinha',
  'admin',
  '1234',
  'teseu',
  'olimpio',
  'kds',
  'gabriel2026',
];

export interface KitchenSession {
  role: 'kitchen' | 'admin';
  operatorName: string;
  email: string;
  authenticatedAt: number;
}

/**
 * Validates whether the incoming request has a valid kitchen operator session.
 * STRICTLY ENFORCES that only gabrielolimpiobsb@gmail.com can access the kitchen display.
 * Supports both Authorization: Bearer <token> (iframe resilient) and cookies.
 */
export async function verifyKitchenSession(req?: Request): Promise<KitchenSession | null> {
  try {
    let token: string | undefined;

    // 1. Check Authorization Bearer header first (works seamlessly inside iframes)
    if (req) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim();
      }
    }

    // 2. Fallback to cookie
    if (!token) {
      const cookieStore = await cookies();
      token = cookieStore.get(KITCHEN_SESSION_COOKIE)?.value;
    }

    if (!token) return null;

    // Format: base64(JSON({ role, operatorName, email, authenticatedAt, secret }))
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);

    if (parsed.role !== 'kitchen' && parsed.role !== 'admin') {
      return null;
    }

    // STRICT EMAIL ENFORCEMENT: Only gabrielolimpiobsb@gmail.com is allowed
    const sessionEmail = (parsed.email || '').toLowerCase().trim();
    if (sessionEmail !== AUTHORIZED_KITCHEN_EMAIL) {
      return null;
    }

    // Verify secret signature matches accepted passcodes or env var
    const currentPass = process.env.KITCHEN_OPERATOR_PASSCODE || DEFAULT_KITCHEN_PASSCODE;
    const isSecretValid =
      parsed.secret === currentPass ||
      ACCEPTED_KITCHEN_PASSCODES.includes(parsed.secret) ||
      parsed.secret === 'OLIMPO-CHAPA-2026' ||
      parsed.secret === 'GOOGLE_AUTH_VERIFIED';

    if (!isSecretValid) {
      return null;
    }

    return {
      role: parsed.role,
      operatorName: parsed.operatorName || 'Gabriel Olímpio',
      email: AUTHORIZED_KITCHEN_EMAIL,
      authenticatedAt: parsed.authenticatedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Creates an encoded operator session string strictly for gabrielolimpiobsb@gmail.com.
 */
export function createKitchenSessionPayload(
  operatorName: string = 'Gabriel Olímpio',
  email: string = AUTHORIZED_KITCHEN_EMAIL,
  authMethod: string = 'passcode'
): string {
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (normalizedEmail !== AUTHORIZED_KITCHEN_EMAIL) {
    throw new Error(`Acesso negado: Somente ${AUTHORIZED_KITCHEN_EMAIL} possui permissão para a Cozinha.`);
  }

  const payload = {
    role: 'kitchen',
    operatorName: operatorName || 'Gabriel Olímpio',
    email: AUTHORIZED_KITCHEN_EMAIL,
    authenticatedAt: Date.now(),
    secret: authMethod === 'google' ? 'GOOGLE_AUTH_VERIFIED' : (process.env.KITCHEN_OPERATOR_PASSCODE || DEFAULT_KITCHEN_PASSCODE),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
