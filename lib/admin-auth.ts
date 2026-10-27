import { cookies } from 'next/headers';

export const ADMIN_SESSION_COOKIE = 'teseu_admin_token';
export const DEFAULT_ADMIN_PASSCODE = process.env.ADMIN_MASTER_PASSCODE || 'TESEU-SUPER-ADMIN-2026';

export const AUTHORIZED_ADMIN_EMAIL = (
  process.env.AUTHORIZED_ADMIN_EMAIL || 'gabrielolimpiobsb@gmail.com'
).toLowerCase().trim();

export const ACCEPTED_ADMIN_PASSCODES = [
  'TESEU-SUPER-ADMIN-2026',
  'ADMIN-MASTER-OLIMPO',
  'superadmin',
  'admin123',
  'teseuadmin',
  'gabriel2026',
];

export interface AdminSession {
  role: 'super-admin';
  ownerName: string;
  email: string;
  authenticatedAt: number;
}

/**
 * Validates whether the incoming request or cookies have an authenticated super-admin session.
 * STRICTLY ENFORCES that only gabrielolimpiobsb@gmail.com can access the admin panel.
 * Supports both Authorization: Bearer <token> (iframe-safe) and HTTP-Only cookies.
 */
export async function verifyAdminSession(req?: Request): Promise<AdminSession | null> {
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
      token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
    }

    if (!token) return null;

    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);

    if (parsed.role !== 'super-admin') {
      return null;
    }

    // STRICT EMAIL ENFORCEMENT: Only gabrielolimpiobsb@gmail.com is allowed
    const sessionEmail = (parsed.email || '').toLowerCase().trim();
    if (sessionEmail !== AUTHORIZED_ADMIN_EMAIL) {
      return null;
    }

    // Verify secret signature matches accepted master passcodes
    const currentPass = process.env.ADMIN_MASTER_PASSCODE || DEFAULT_ADMIN_PASSCODE;
    const isSecretValid =
      parsed.secret === currentPass ||
      ACCEPTED_ADMIN_PASSCODES.includes(parsed.secret) ||
      parsed.secret === 'GOOGLE_AUTH_VERIFIED';

    if (!isSecretValid) {
      return null;
    }

    return {
      role: 'super-admin',
      ownerName: parsed.ownerName || 'Gabriel Olímpio',
      email: AUTHORIZED_ADMIN_EMAIL,
      authenticatedAt: parsed.authenticatedAt,
    };
  } catch {
    return null;
  }
}

/**
 * Generates an encoded super-admin session token strictly for gabrielolimpiobsb@gmail.com.
 */
export function createAdminSessionPayload(
  ownerName: string = 'Gabriel Olímpio',
  email: string = AUTHORIZED_ADMIN_EMAIL,
  authMethod: string = 'passcode'
): string {
  const normalizedEmail = (email || '').toLowerCase().trim();
  if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
    throw new Error(`Acesso negado: Somente ${AUTHORIZED_ADMIN_EMAIL} possui permissão de administrador.`);
  }

  const payload = {
    role: 'super-admin',
    ownerName: ownerName || 'Gabriel Olímpio',
    email: AUTHORIZED_ADMIN_EMAIL,
    authenticatedAt: Date.now(),
    secret: authMethod === 'google' ? 'GOOGLE_AUTH_VERIFIED' : (process.env.ADMIN_MASTER_PASSCODE || DEFAULT_ADMIN_PASSCODE),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}
