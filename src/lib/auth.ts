import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { AdminRole } from '@prisma/client';

export interface SessionUser {
  userId: string;
  username: string;
  fullName: string;
  email?: string | null;
  role: AdminRole;
}

export const SESSION_COOKIE_NAME = 'admin_session';
export const SESSION_DURATION = 60 * 60 * 8; // 8 hours in seconds

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'plusmoments_super_secure_random_key_2026_xyz';
  return new TextEncoder().encode(secret);
}

/**
 * Asserts that the session exists and the user has one of the required roles.
 * Returns { authorized: true, session } if authorized,
 * or { authorized: false, response: NextResponse } with status 401 or 403.
 */
export function assertRole(
  session: SessionUser | null,
  allowedRoles: AdminRole[]
): { authorized: true; session: SessionUser } | { authorized: false; response: NextResponse } {
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { success: false, error: 'Chưa đăng nhập hoặc phiên làm việc đã hết hạn' },
        { status: 401 }
      ),
    };
  }

  if (!allowedRoles.includes(session.role)) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          success: false,
          error: `Bạn không có quyền thực hiện hành động này. Yêu cầu quyền: ${allowedRoles.join(', ')}`,
        },
        { status: 403 }
      ),
    };
  }

  return { authorized: true, session };
}

/**
 * Hashes a plaintext password using bcrypt with salt factor 12
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plaintext password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Creates a signed JWT session token (HS256) valid for 8 hours
 */
export async function createSessionToken(user: SessionUser): Promise<string> {
  return new SignJWT({
    userId: user.userId,
    username: user.username,
    fullName: user.fullName,
    email: user.email || null,
    role: user.role,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey());
}

/**
 * Verifies a JWT session token in Node.js or Edge Runtime
 */
export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      fullName: payload.fullName as string,
      email: (payload.email as string) || null,
      role: payload.role as AdminRole,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session in Server Components and Route Handlers
 */
export async function getAdminSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

/**
 * Sets the secure HTTP-Only admin session cookie
 */
export function setAdminSessionCookie(token: string) {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION,
  });
}

/**
 * Clears the admin session cookie on logout
 */
export function clearAdminSessionCookie() {
  const cookieStore = cookies();
  cookieStore.set(SESSION_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}

