// ============================================================
// MIDDLEWARE - Admin Panel
// IP Whitelist Protection (Optional - for separate deployment)
// ============================================================

import { NextResponse } from 'next/server';

// Add your IP addresses here (get from https://api.ipify.org?format=json)
const ALLOWED_IPS = [
  // '123.456.789.0', // Your IP address
  // Add more IPs as needed
];

export function middleware(request) {
  // Only enable in production
  if (process.env.NODE_ENV === 'production') {
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown';

    // Extract first IP if multiple (x-forwarded-for can have multiple)
    const ip = clientIP.split(',')[0].trim();

    // If IP whitelist is configured, check it
    if (ALLOWED_IPS.length > 0 && !ALLOWED_IPS.includes(ip)) {
      return NextResponse.json(
        { error: 'Access denied. Your IP is not whitelisted.' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
