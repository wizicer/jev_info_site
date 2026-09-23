import demosData from '../data/demos.json';
import taxonomyData from '../data/taxonomy.json';
import zhTaxonomy from '../data/translations/zh/taxonomy.json';
import jaTaxonomy from '../data/translations/ja/taxonomy.json';
import zhDemos from '../data/translations/zh/demos.json';
import jaDemos from '../data/translations/ja/demos.json';
import type { Category, Demo, Group } from '../types';
import type { Locale } from '../i18n/ui';

export const demos = demosData as Demo[];

const usedCategoryCodes = new Set(demos.map((demo) => demo.category));

export const groups: Group[] = taxonomyData.layers
  .flatMap((layer) => layer.groups)
  .filter((group) => group.categories.some((category) => usedCategoryCodes.has(category.code)));

export const categories = groups.flatMap((group) => group.categories) as Category[];
export const categoryByCode = new Map(categories.map((category) => [category.code, category]));
export const groupByCode = new Map(groups.map((group) => [group.code, group]));

export const sortedDemos = [...demos].sort((a, b) =>
  b.score - a.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
);

interface TaxonomyTranslation {
  groups?: Record<string, { source?: string; name: string }>;
  categories?: Record<string, { source?: { name?: string; description?: string }; name: string; description?: string }>;
}

const taxonomyTranslations: Record<string, TaxonomyTranslation> = {
  zh: zhTaxonomy,
  ja: jaTaxonomy,
};

const demosTranslations: Record<string, Record<string, { description?: string }>> = {
  zh: zhDemos as Record<string, { description?: string }>,
  ja: jaDemos as Record<string, { description?: string }>,
};

export function getLocalizedDemo(demo: Demo, locale: Locale = 'en'): Demo {
  if (locale === 'en') return demo;
  const trans = demosTranslations[locale]?.[demo.id];
  if (!trans || !trans.description) return demo;
  return {
    ...demo,
    description: trans.description,
  };
}

export function getLocalizedCategory(category: Category, locale: Locale = 'en'): Category {
  if (locale === 'en') {
    return {
      ...category,
      name: category.name,
    };
  }
  const trans = taxonomyTranslations[locale]?.categories?.[category.code];
  return {
    ...category,
    name: trans?.source?.name === category.name ? (trans.name || category.name) : category.name,
    description: trans?.source?.description === category.description ? (trans.description || category.description) : category.description,
  };
}

export function getLocalizedGroup(group: Group, locale: Locale = 'en'): Group {
  const trans = taxonomyTranslations[locale]?.groups?.[group.code];
  const groupName = locale !== 'en' && trans?.source === group.name ? (trans.name || group.name) : group.name;

  return {
    ...group,
    name: groupName,
    categories: group.categories.map((c) => getLocalizedCategory(c, locale)),
  };
}

export function getLocalizedGroups(locale: Locale = 'en'): Group[] {
  return groups.map((g) => getLocalizedGroup(g, locale));
}

export function demosForGroup(group: Group, locale: Locale = 'en') {
  const codes = new Set(group.categories.map((category) => category.code));
  const list = sortedDemos.filter((demo) => codes.has(demo.category));
  return locale === 'en' ? list : list.map((d) => getLocalizedDemo(d, locale));
}

export function demosForCategory(categoryCode: string, locale: Locale = 'en') {
  const list = sortedDemos.filter((demo) => demo.category === categoryCode);
  return locale === 'en' ? list : list.map((d) => getLocalizedDemo(d, locale));
}

export function getDemoContext(demo: Demo, locale: Locale = 'en') {
  const rawCategory = categoryByCode.get(demo.category);
  const rawGroup = groups.find((candidate) => candidate.categories.some((item) => item.code === demo.category));
  const category = rawCategory ? getLocalizedCategory(rawCategory, locale) : undefined;
  const group = rawGroup ? getLocalizedGroup(rawGroup, locale) : undefined;
  return { category, group };
}

export function formatDate(value: string, locale: Locale = 'en') {
  const intlLocale = locale === 'zh' ? 'zh-CN' : locale === 'ja' ? 'ja-JP' : 'en';
  return new Intl.DateTimeFormat(intlLocale, { dateStyle: 'long' }).format(new Date(value));
}
