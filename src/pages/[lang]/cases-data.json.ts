import type { APIRoute } from 'astro';
import { buildCasesPayload } from '../../lib/cases-payload';
import type { Locale } from '../../i18n/ui';

export const prerender = true;

export function getStaticPaths() {
  return [
    { params: { lang: 'zh' } },
    { params: { lang: 'ja' } },
  ];
}

export const GET: APIRoute = async ({ params }) => {
  const locale = (params.lang as Locale) || 'en';
  const payload = buildCasesPayload(locale);

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
