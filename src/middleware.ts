import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose/jwt/verify';

const SESSION_COOKIE_NAME = 'admin_session';
const DEFAULT_FALLBACK_SECRET = 'plusmoments_super_secure_random_key_2026_xyz';
let hasWarnedMissingSecretMiddleware = false;

function getSecretKey(): Uint8Array {
  const envSecret = process.env.SESSION_SECRET?.trim();
  if (
    process.env.NODE_ENV === 'production' &&
    (!envSecret || envSecret === DEFAULT_FALLBACK_SECRET) &&
    !hasWarnedMissingSecretMiddleware
  ) {
    hasWarnedMissingSecretMiddleware = true;
    console.error(
      '[SECURITY WARNING] SESSION_SECRET is missing in production! Please configure a strong random secret in .env'
    );
  }
  const secret = envSecret || DEFAULT_FALLBACK_SECRET;
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

  const isDev = process.env.NODE_ENV !== 'production';
  const host = request.headers.get('host') || '';
  const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

  // In development or on localhost: relax CSP to allow Next.js fast refresh, eval, and unencrypted local cookies
  const upgradeInsecureRequests = (isDev || isLocalhost) ? '' : 'upgrade-insecure-requests;';

  const scriptSrcDirective = (isDev || isLocalhost)
    ? `'self' 'unsafe-eval' 'unsafe-inline' https: http:;`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https: http:;`;

  const cspHeader = `
    default-src 'self';
    script-src ${scriptSrcDirective}
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: blob: https:;
    font-src 'self' data: https://fonts.gstatic.com;
    connect-src 'self' https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com https://*.g.doubleclick.net https://*.googleadservices.com https://*.google.com https://*.google.com.vn https:;
    frame-src 'self' https://www.googletagmanager.com https://td.doubleclick.net https://bid.g.doubleclick.net https://docs.google.com https://drive.google.com https://www.google.com https://maps.google.com https://www.youtube.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'self';
    ${upgradeInsecureRequests}
  `.replace(/\s{2,}/g, ' ').trim();

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', cspHeader);

  const isAdminRoute = pathname.startsWith('/admin');
  const coopValue = isAdminRoute ? 'same-origin-allow-popups' : 'same-origin';

  // Helper to attach CSP and Security headers to response
  const applyCspToResponse = (response: NextResponse) => {
    response.headers.set('Content-Security-Policy', cspHeader);
    if (!isLocalhost && !isDev) {
      response.headers.set(
        'Strict-Transport-Security',
        'max-age=63072000; includeSubDomains; preload'
      );
    }
    response.headers.set('Cross-Origin-Opener-Policy', coopValue);
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
      source:
        '/((?!api|_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|apple-touch-icon.png|robots.txt|sitemap.xml|llms.txt|uploads).*)',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
};
