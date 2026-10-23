import type { PageServerLoad, Actions } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import {
  COOKIE_NAME,
  SESSION_MAX_AGE,
  createSessionToken,
  verifyPasscode,
  verifySessionToken,
  isRateLimited,
  recordFailure,
  clearFailures
} from '#lib/server/auth.js';

// Only allow same-origin relative paths; blocks open-redirects like //evil.com.
const safeRedirect = (v: unknown) =>
  typeof v === 'string' && v.startsWith('/') && !v.startsWith('//') && !v.startsWith('/login') ? v : '/';

export const load: PageServerLoad = async ({ cookies, url }) => {
  const redirectTo = safeRedirect(url.searchParams.get('redirect'));
  if (verifySessionToken(cookies.get(COOKIE_NAME))) throw redirect(303, redirectTo);
  return { redirectTo };
};

export const actions: Actions = {
  login: async ({ request, cookies, url, getClientAddress }) => {
    const data = await request.formData();
    const passcode = String(data.get('passcode') ?? '');
    const redirectTo = safeRedirect(data.get('redirect'));
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || getClientAddress();

    if (isRateLimited(ip)) {
      return fail(429, { error: 'Terlalu banyak percobaan. Coba lagi 15 menit lagi.' });
    }
    if (!passcode || passcode.length > 128) {
      return fail(400, { error: 'Masukkan passcode tim.' });
    }

    const token = createSessionToken();
    if (!token) {
      console.error('[auth] AGENCY_PASSCODE / SESSION_SECRET belum di-set di environment');
      return fail(503, { error: 'Auth server belum dikonfigurasi. Hubungi tech lead.' });
    }
    if (!verifyPasscode(passcode)) {
      recordFailure(ip);
      return fail(401, { error: 'Passcode salah.' });
    }

    clearFailures(ip);
    cookies.set(COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      // ponytail: secure follows the actual protocol; once ops.endra.web.id runs on HTTPS it's always true.
      secure: url.protocol === 'https:',
      maxAge: SESSION_MAX_AGE
    });
    throw redirect(303, redirectTo);
  },

  logout: async ({ cookies }) => {
    cookies.delete(COOKIE_NAME, { path: '/' });
    throw redirect(303, '/login');
  }
};
