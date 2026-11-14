import crypto from 'crypto';

const PROOFING_SECRET = process.env.SESSION_SECRET || 'plusmoments_proofing_auth_secret_2026';

export function getProofingCookieName(code: string): string {
  const cleanCode = code.toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return `pm_proofing_${cleanCode}`;
}

export function createProofingToken(code: string, pinCode: string): string {
  return crypto
    .createHmac('sha256', PROOFING_SECRET)
    .update(`${code.toLowerCase().trim()}:${pinCode.trim()}`)
    .digest('hex');
}

export function verifyProofingToken(code: string, pinCode: string, token?: string | null): boolean {
  if (!token) return false;
  const expected = createProofingToken(code, pinCode);
  try {
    const bufA = Buffer.from(token);
    const bufB = Buffer.from(expected);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}
