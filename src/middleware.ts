import createIntlMiddleware from 'next-intl/middleware';
import { type NextRequest, NextResponse } from 'next/server';

import { defaultLocale, locales } from '@/i18n/config';
import { updateSession } from '@/middleware/supabase';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix: 'as-needed',
});

const PUBLIC_PATHS = ['/login', '/signup'];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((p) => pathname === p || pathname.endsWith(p));
}

function isAppPath(pathname: string) {
  return (
    pathname.includes('/dashboard') ||
    pathname.includes('/receipts') ||
    pathname.includes('/upload') ||
    pathname.includes('/settings')
  );
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Public routes: skip Supabase entirely, just run i18n.
  if (!isAppPath(pathname)) {
    return intlMiddleware(request);
  }

  // Protected routes: verify session, redirect to login if missing.
  try {
    const { response: authResponse, user } = await updateSession(request);
    const intlResponse = intlMiddleware(request);

    authResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    if (!user) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    return intlResponse;
  } catch {
    // If Supabase is unreachable, redirect to login rather than hanging.
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ['/', '/(en|ko|de)/:path*', '/((?!api|_next|_vercel|.*\\..*).*)'],
};
