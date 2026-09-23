import type { APIRoute } from 'astro';
import toolsData from '../data/tools.json';
import metricsData from '../data/repository-metrics.json';

export const prerender = true;

const GH_PREFIX = 'https://github.com/';

type Tool = { name: string; url: string; description: string; stars?: number; forks?: number };
type ToolMetrics = Record<string, { stars: number; forks: number }>;

export const GET: APIRoute = async () => {
  const toolMetrics = (metricsData.snapshots?.at(-1)?.metrics ?? {}) as ToolMetrics;
  const tools = (toolsData as Tool[])
    .map((tool) => ({ ...tool, ...toolMetrics[tool.url] }))
    .sort((a, b) => (b.stars || 0) - (a.stars || 0) || (b.forks || 0) - (a.forks || 0) || a.name.localeCompare(b.name, 'en'));

  const items = tools.map((t) => [
    t.name,
    t.url.startsWith(GH_PREFIX) ? t.url.slice(GH_PREFIX.length) : t.url,
    t.description,
    t.stars || 0,
    t.forks || 0,
  ]);

  return new Response(JSON.stringify(items), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
