#!/usr/bin/env node

import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  process.loadEnvFile(resolve(root, '.env'));
} catch (error) {
  if (error?.code !== 'ENOENT') throw error;
}
const toolsPath = resolve(root, 'src/data/tools.json');
const modelsPath = resolve(root, 'src/data/models.json');
const awesomePath = resolve(root, 'src/data/awesome.json');
const metricsPath = resolve(root, 'src/data/repository-metrics.json');
const githubToken = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const huggingFaceToken = process.env.HF_TOKEN;
const concurrency = 5;

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const readJsonOrEmpty = async (path) => readJson(path).catch((error) => {
  if (error?.code === 'ENOENT') return {};
  throw error;
});

function repositoryFromUrl(url, host) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== host) return null;
    const [owner, name] = parsed.pathname.split('/').filter(Boolean);
    return owner && name ? `${owner}/${name.replace(/\.git$/, '')}` : null;
  } catch {
    return null;
  }
}

function metricTarget(url) {
  const github = repositoryFromUrl(url, 'github.com');
  if (github) return { platform: 'github', repository: github };
  const huggingFace = repositoryFromUrl(url, 'huggingface.co');
  if (huggingFace) return { platform: 'huggingface', repository: huggingFace };
  return null;
}

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds));
}

async function fetchJson(url, headers, label) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { headers });
    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === 2) {
      const body = await response.text();
      throw new Error(`${label}: HTTP ${response.status}${body ? ` — ${body.slice(0, 160)}` : ''}`);
    }
    const retryAfter = Number(response.headers.get('retry-after'));
    await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : 500 * (2 ** attempt));
  }
}

const githubHeaders = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'jev-info-metrics-updater',
  ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}),
};

async function fetchMetrics(target) {
  if (target.platform === 'github') {
    const data = await fetchJson(`https://api.github.com/repos/${target.repository}`, githubHeaders, target.repository);
    if (!isCount(data.stargazers_count) || !isCount(data.forks_count)) throw new Error(`${target.repository}: response did not include valid counts`);
    return { stars: data.stargazers_count, forks: data.forks_count };
  }
  const data = await fetchJson(`https://huggingface.co/api/models/${target.repository}`, huggingFaceToken ? { Authorization: `Bearer ${huggingFaceToken}` } : {}, target.repository);
  if (!isCount(data.likes)) throw new Error(`${target.repository}: response did not include a valid like count`);
  return { likes: data.likes };
}

async function mapWithConcurrency(items, worker) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const run = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index]);
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, run));
  return results;
}

function isCount(value) {
  return Number.isInteger(value) && value >= 0;
}

async function main() {
  const [tools, models, awesome, previous] = await Promise.all([readJson(toolsPath), readJson(modelsPath), readJson(awesomePath), readJsonOrEmpty(metricsPath)]);
  const snapshots = Array.isArray(previous?.snapshots) ? previous.snapshots : [];
  const previousMetrics = {};
  for (const snapshot of snapshots) Object.assign(previousMetrics, snapshot.metrics);
  const today = new Date().toISOString().slice(0, 10);
  const failures = [];
  if (!githubToken) console.warn('Warning: GITHUB_TOKEN is not set. GitHub allows only 60 unauthenticated requests/hour; this catalog has more repositories.');

  const sources = [
    { items: tools, optional: false },
    { items: awesome, optional: true },
    { items: models, optional: false },
  ];
  const urls = [...new Set(sources.flatMap((source) => source.items.map((item) => item.url)))];
  const results = new Map(await mapWithConcurrency(urls, async (url) => {
    const target = metricTarget(url);
    if (!target) return [url, null];
    try {
      return [url, { metrics: await fetchMetrics(target) }];
    } catch (error) {
      return [url, { error: error.message }];
    }
  }));

  const metrics = {};
  for (const source of sources) {
    for (const item of source.items) {
      const result = results.get(item.url);
      if (result?.metrics) metrics[item.url] = result.metrics;
      else if (result?.error) {
        const retained = previousMetrics[item.url];
        if (retained) metrics[item.url] = retained;
        failures.push(result.error);
      } else if (!source.optional) failures.push(`Unsupported metrics URL: ${item.url}`);
    }
  }

  const existing = snapshots.findIndex((snapshot) => snapshot.date === today);
  if (existing >= 0) snapshots[existing] = { date: today, metrics };
  else snapshots.push({ date: today, metrics });
  snapshots.sort((a, b) => a.date.localeCompare(b.date));

  const temporaryPath = `${metricsPath}.tmp`;
  await mkdir(dirname(metricsPath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify({ version: 2, snapshots }, null, 2)}\n`);
  await rename(temporaryPath, metricsPath);
  console.log(`Recorded metrics for ${Object.keys(metrics).length} of ${urls.length} catalog URLs in the ${today} snapshot (${snapshots.length} snapshot(s) on file).`);
  if (failures.length) { console.error(`Completed with ${failures.length} failure(s); previous successful values were retained.`); for (const failure of failures) console.error(`- ${failure}`); process.exitCode = 1; }
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
