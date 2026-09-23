import toolsData from '../data/tools.json';
import metricsData from '../data/repository-metrics.json';
import zhTools from '../data/translations/zh/tools.json';
import jaTools from '../data/translations/ja/tools.json';
import type { Locale } from '../i18n/ui';

const GH_PREFIX = 'https://github.com/';

type Tool = { id: string; name: string; url: string; description: string; stars?: number; forks?: number };
type ToolMetrics = Record<string, { stars: number; forks: number }>;

const toolsTranslations: Record<string, Record<string, { description?: string }>> = {
  zh: zhTools as Record<string, { description?: string }>,
  ja: jaTools as Record<string, { description?: string }>,
};

export function buildToolsPayload(locale: Locale = 'en') {
  const toolMetrics = (metricsData.snapshots?.at(-1)?.metrics ?? {}) as ToolMetrics;
  const tools = (toolsData as Tool[])
    .map((tool) => {
      const desc = locale === 'en' ? tool.description : (toolsTranslations[locale]?.[tool.id]?.description || tool.description);
      return {
        ...tool,
        ...toolMetrics[tool.url],
        description: desc,
      };
    })
    .sort((a, b) => (b.stars || 0) - (a.stars || 0) || (b.forks || 0) - (a.forks || 0) || a.name.localeCompare(b.name, 'en'));

  return tools.map((t) => [
    t.name,
    t.url.startsWith(GH_PREFIX) ? t.url.slice(GH_PREFIX.length) : t.url,
    t.description,
    t.stars || 0,
    t.forks || 0,
  ]);
}
