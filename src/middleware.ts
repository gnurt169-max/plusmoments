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

  // Generate dynamic cryptographic nonce for CSP
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');

  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'strict-dynamic';
    style-src 'self' 'unsafe-inline';
    img-src 'self' blob: data: https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://www.google.com.vn https://googleads.g.doubleclick.net https://lh3.googleusercontent.com https://images.unsplash.com https://plus.unsplash.com https://res.cloudinary.com https://img.vietqr.io https://api.vietqr.io https://www.facebook.com;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://www.googleadservices.com https://www.googleapis.com https://api.vietqr.io https://connect.facebook.net https://analytics.tiktok.com;
    frame-src 'self' https://www.googletagmanager.com https://bid.g.doubleclick.net https://docs.google.com https://drive.google.com https://www.google.com https://maps.google.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  // Helper to attach CSP to response
  const applyCspToResponse = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', cspHeader);
    return response;
  };

  // 1. ADMIN CMS ROUTE PROTECTION
  if (pathname.startsWith('/admin')) {
    // Login page handling
    if (pathname === '/admin/login') {
      if (session) {
        // Already logged in, redirect straight to dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return applyCspToResponse(
        NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        })
      );
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

    return applyCspToResponse(
      NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })
    );
  }

  return applyCspToResponse(
    NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  );
}

export const config = {
  matcher: [
    {
      source: '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|llms.txt|uploads).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
