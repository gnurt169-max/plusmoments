import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const SESSION_COOKIE_NAME = 'admin_session';

function getSecretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET || 'plusmoments_super_secure_random_key_2026_xyz';
  return new TextEncoder().encode(secret);
}

async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifyToken(token);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  // 1. ADMIN CMS ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    // Login page handling
    if (pathname === '/admin/login') {
      if (session) {
        // Already logged in, redirect straight to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    }

    // All other /admin routes require an active valid session
    if (!session) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userRole = (session.role as string) || 'USER';

    // 2. STRICT ROLE-BASED ACCESS CONTROL (RBAC)

    // A. Role: USER (Editor / Content Creator)
    // Only permitted: /admin (Dashboard Overview), /admin/albums/:path*, /admin/blog/:path*, /admin/media/:path*
    if (userRole === 'USER') {
      const allowedUserPrefixes = [
        '/admin/albums',
        '/admin/blog',
        '/admin/media',
      ];
      const isDashboardRoot = pathname === '/admin';
      const isPermitted = isDashboardRoot || allowedUserPrefixes.some((prefix) => pathname.startsWith(prefix));

      if (!isPermitted) {
        // Block USER from /admin/settings, /admin/packages, /admin/leads, /admin/users, /admin/notifications, /admin/home, etc.
        const forbiddenUrl = new URL('/admin', request.url);
        forbiddenUrl.searchParams.set('error', '403_forbidden');
        return NextResponse.redirect(forbiddenUrl);
      }
    }

    // B. Role: ADMIN (Operational Administrator)
    // Permitted operational routes including scoped /admin/users

    // C. Role: SUPER_ADMIN has unrestricted access to 100% of admin routes

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|uploads).*)'],
};
