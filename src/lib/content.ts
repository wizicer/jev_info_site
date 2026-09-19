import demosData from '../data/demos.json';
import taxonomyData from '../data/taxonomy.json';
import type { Category, Demo, Group } from '../types';

export const demos = demosData as Demo[];

const groupNames: Record<string, string> = {
  automation: 'Software Automation',
  interaction: 'Human Interaction',
  gaming: 'Game Worlds',
  physical: 'Physical',
  creative: 'Creative',
  parked: 'To Be Classified',
};

const usedCategoryCodes = new Set(demos.map((demo) => demo.category));

export const groups: Group[] = taxonomyData.layers
  .flatMap((layer) => layer.groups)
  .filter((group) => group.categories.some((category) => usedCategoryCodes.has(category.code)))
  .map((group) => ({
    ...group,
    enName: groupNames[group.code] ?? group.code,
  }));

export const categories = groups.flatMap((group) => group.categories) as Category[];
export const categoryByCode = new Map(categories.map((category) => [category.code, category]));
export const groupByCode = new Map(groups.map((group) => [group.code, group]));

export const sortedDemos = [...demos].sort((a, b) =>
  b.score - a.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
);

export function demosForGroup(group: Group) {
  const codes = new Set(group.categories.map((category) => category.code));
  return sortedDemos.filter((demo) => codes.has(demo.category));
}

export function demosForCategory(categoryCode: string) {
  return sortedDemos.filter((demo) => demo.category === categoryCode);
}

export function getDemoContext(demo: Demo) {
  const category = categoryByCode.get(demo.category);
  const group = groups.find((candidate) => candidate.categories.some((item) => item.code === demo.category));
  return { category, group };
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(value));
}
