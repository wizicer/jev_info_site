#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dataDir = resolve(root, 'src/data');
const readmePath = resolve(root, 'README.md');
const siteUrl = 'https://jev.info';

const topTools = 30;
const topDemosPerCategory = 3;
const descriptionLimit = 140;

const readJson = async (name) => JSON.parse(await readFile(resolve(dataDir, name), 'utf8'));

function decodeEntities(text) {
  return String(text ?? '')
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');
}

function truncate(text, limit = descriptionLimit) {
  const clean = decodeEntities(text).replace(/\s+/g, ' ').trim();
  if (clean.length <= limit) return clean;
  const cut = clean.slice(0, limit);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(' '), limit * 0.6))}…`;
}

function label(text) {
  return decodeEntities(text).replace(/\[/g, '(').replace(/\]/g, ')').trim();
}

function cellText(text) {
  return decodeEntities(text).replace(/\s+/g, ' ').replace(/\|/g, '\\|').replace(/\[/g, '(').replace(/\]/g, ')').trim();
}

function compactCount(value) {
  if (!Number.isFinite(value)) return '';
  return value >= 1000 ? `${(value / 1000).toFixed(1).replace(/\.0$/, '')}k` : String(value);
}

function starsBadge(count) {
  return Number.isFinite(count) ? ` ★${compactCount(count)}` : '';
}

async function main() {
  const [demos, taxonomy, tools, models, awesome, metrics] = await Promise.all([
    readJson('demos.json'),
    readJson('taxonomy.json'),
    readJson('tools.json'),
    readJson('models.json'),
    readJson('awesome.json'),
    readJson('repository-metrics.json').catch(() => ({})),
  ]);

  const usedCategoryCodes = new Set(demos.map((demo) => demo.category));
  const groups = taxonomy.layers
    .flatMap((layer) => layer.groups)
    .filter((group) => group.export !== false)
    .map((group) => ({
      ...group,
      categories: group.categories.filter(
        (category) => category.export !== false && usedCategoryCodes.has(category.code),
      ),
    }))
    .filter((group) => group.categories.length > 0);

  const sortedDemos = [...demos].sort(
    (a, b) => b.score - a.score || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const demosForGroup = (group) => {
    const codes = new Set(group.categories.map((category) => category.code));
    return sortedDemos.filter((demo) => codes.has(demo.category));
  };
  const demosForCategory = (code) => sortedDemos.filter((demo) => demo.category === code);

  const toolMetrics = metrics.tools ?? {};
  const sortedTools = [...tools].sort(
    (a, b) => (toolMetrics[b.id]?.stars ?? b.stars ?? 0) - (toolMetrics[a.id]?.stars ?? a.stars ?? 0),
  );
  const modelMetrics = metrics.models ?? {};
  const sortedModels = [...models].sort(
    (a, b) => (modelMetrics[b.id]?.likes ?? 0) - (modelMetrics[a.id]?.likes ?? 0),
  );
  const awesomeMetrics = metrics.awesome ?? {};
  const sortedAwesome = [...awesome].sort(
    (a, b) => (awesomeMetrics[b.id]?.stars ?? 0) - (awesomeMetrics[a.id]?.stars ?? 0),
  );

  const totalUseCases = groups.reduce((sum, group) => sum + demosForGroup(group).length, 0);
  const lines = [];
  const push = (...chunks) => lines.push(...chunks);

  push(
    '# Awesome Jev · jev.info',
    '',
    '[![Awesome](https://awesome.re/badge.svg)](https://github.com/sindresorhus/awesome)',
    `[![Site](https://img.shields.io/badge/site-jev.info-0a7ea4)](${siteUrl})`,
    `![Use cases](https://img.shields.io/badge/use%20cases-${totalUseCases}-blue)`,
    `![Tools](https://img.shields.io/badge/tools-${tools.length}-blue)`,
    `![Models](https://img.shields.io/badge/models-${models.length}-blue)`,
    `![Resources](https://img.shields.io/badge/resources-${awesome.length}-blue)`,
    '',
    '> A community-maintained index of projects, SDKs, models, tools, and real-world use cases built on **Jev** — TypeSafe AI\'s System One model for typed probabilistic decisions.',
    '',
    `**[jev.info](${siteUrl}) is the canonical home of this catalog.** Browse it there for full-text search, video demos, category filters, and live repository metrics. This README is generated from the same dataset by \`scripts/generate-readme.mjs\` — do not edit it by hand.`,
    '',
    '## Contents',
    '',
    '- [Community Resources](#community-resources)',
    '- [Models](#models)',
    '- [Tools](#tools)',
    '- [Use Cases](#use-cases)',
    ...groups.flatMap((group) => [
      `  - [${group.enName}](#${group.code})`,
      ...group.categories.map((category) => `    - [${category.enName ?? category.name}](#${category.code})`),
    ]),
    '',
    '## Community Resources',
    '',
    `Curated lists, articles, and community hubs about Jev — mirrored on [jev.info/information](${siteUrl}/information).`,
    '',
    ...sortedAwesome.map(
      (resource) => `- [${label(resource.name)}](${resource.url})${starsBadge(awesomeMetrics[resource.id]?.stars)} — ${truncate(resource.description)}`,
    ),
    '',
    '## Models',
    '',
    `Fine-tunes and derivatives of the Jev family on Hugging Face — mirrored on [jev.info/models](${siteUrl}/models).`,
    '',
    ...sortedModels.map(
      (model) => `- [${label(model.name)}](${model.url})${modelMetrics[model.id]?.likes ? ` ♥${compactCount(modelMetrics[model.id].likes)}` : ''} — ${truncate(model.description)}`,
    ),
    '',
    '## Tools',
    '',
    `Top ${Math.min(topTools, tools.length)} of ${tools.length} open-source tools and integrations by GitHub stars — browse the full catalog on [jev.info/tools](${siteUrl}/tools).`,
    '',
    ...sortedTools.slice(0, topTools).map(
      (tool) => `- [${label(tool.name)}](${tool.url})${starsBadge(toolMetrics[tool.id]?.stars ?? tool.stars)} — ${truncate(tool.description)}`,
    ),
    '',
    `→ [All ${tools.length} tools](${siteUrl}/tools)`,
    '',
    '## Use Cases',
    '',
    `Real-world demos of Jev in action, grouped by application area — browse all ${totalUseCases} with video previews on [jev.info/use-cases](${siteUrl}/use-cases).`,
  );

  for (const group of groups) {
    const groupDemos = demosForGroup(group);
    push(
      '',
      `### ${group.enName} <a id="${group.code}"></a>`,
      '',
      `[Browse all ${groupDemos.length} on jev.info →](${siteUrl}/use-cases/${group.code})`,
    );
    for (const category of group.categories) {
      const categoryDemos = demosForCategory(category.code);
      const top = categoryDemos.slice(0, topDemosPerCategory);
      push(
        '',
        `#### ${category.enName ?? category.name} (${categoryDemos.length}) <a id="${category.code}"></a>`,
        '',
        `| ${top.map((demo) => `<a href="${siteUrl}/use-cases/${demo.id}"><img src="${siteUrl}${demo.cover}" width="260" alt="${category.enName ?? category.name} demo"></a>`).join(' | ')} |`,
        `|${top.map(() => ':---:').join('|')}|`,
        `| ${top.map((demo) => `[${truncate(cellText(demo.description), 70)}](${siteUrl}/use-cases/${demo.id})<br>@${demo.author.handle}`).join(' | ')} |`,
      );
      const remaining = categoryDemos.length - topDemosPerCategory;
      if (remaining > 0) push('', `[+ ${remaining} more →](${siteUrl}/use-cases/${group.code})`);
    }
  }

  push(
    '',
    '## Contributing',
    '',
    `This list is generated from the dataset behind [jev.info](${siteUrl}). To add or fix an entry, update the JSON files in \`src/data/\` (or open an issue) and run \`npm run generate:readme\`.`,
    '',
    '---',
    '',
    `Each linked project retains its own license. Maintained by the community — not affiliated with TypeSafe AI.`,
    '',
  );

  await writeFile(readmePath, `${lines.join('\n')}`);
  console.log(`Wrote ${readmePath}`);
  console.log(`  ${sortedAwesome.length} resources, ${sortedModels.length} models, ${Math.min(topTools, tools.length)}/${tools.length} tools, ${totalUseCases} use cases in ${groups.length} groups`);
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
