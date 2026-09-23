import type { APIRoute } from 'astro';
import { buildCasesPayload } from '../lib/cases-payload';

export const prerender = true;

export const GET: APIRoute = async () => {
  const payload = buildCasesPayload('en');

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
