import type { RequestEvent } from '@sveltejs/kit';
import { verifySessionToken, COOKIE_NAME } from '#lib/server/auth.js';

const PUBLIC_PATHS = ['/login', '/favicon', '/robots.txt'];

export async function handle({
  event,
  resolve
}: {
  event: RequestEvent;
  resolve: (event: RequestEvent) => Promise<Response>;
}) {
  const { pathname, search } = event.url;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/')) || pathname.startsWith('/_app/');

  if (!isPublic && !verifySessionToken(event.cookies.get(COOKIE_NAME))) {
    // Form actions / fetches get a plain 401 instead of an HTML redirect.
    if (event.request.method !== 'GET') return new Response('Unauthorized', { status: 401 });
    const target = encodeURIComponent(pathname + search);
    return new Response(null, { status: 303, headers: { location: `/login?redirect=${target}` } });
  }

  const response = await resolve(event);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
