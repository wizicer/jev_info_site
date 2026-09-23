import type { APIRoute } from 'astro';
import { buildToolsPayload } from '../lib/tools-payload';

export const prerender = true;

export const GET: APIRoute = async () => {
  const items = buildToolsPayload('en');

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
