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
  const now = new Date().toISOString();
  const failures = [];
  if (!githubToken) console.warn('Warning: GITHUB_TOKEN is not set. GitHub allows only 60 unauthenticated requests/hour; this catalog has more repositories.');

  const toolResults = await mapWithConcurrency(tools, async (tool) => {
    const repository = repositoryFromUrl(tool.url, 'github.com');
    if (!repository) return { id: tool.id, error: `Unsupported GitHub URL: ${tool.url}` };
    try {
      const data = await fetchJson(`https://api.github.com/repos/${repository}`, { Accept: 'application/vnd.github+json', 'User-Agent': 'jev-info-metrics-updater', ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}) }, repository);
      if (!isCount(data.stargazers_count) || !isCount(data.forks_count)) throw new Error(`${repository}: response did not include valid counts`);
      return { id: tool.id, metrics: { stars: data.stargazers_count, forks: data.forks_count, updatedAt: now } };
    } catch (error) { return { id: tool.id, error: error.message }; }
  });
  const awesomeResults = await mapWithConcurrency(awesome, async (resource) => {
    const repository = repositoryFromUrl(resource.url, 'github.com');
    if (!repository) return { id: resource.id };
    try {
      const data = await fetchJson(`https://api.github.com/repos/${repository}`, { Accept: 'application/vnd.github+json', 'User-Agent': 'jev-info-metrics-updater', ...(githubToken ? { Authorization: `Bearer ${githubToken}` } : {}) }, repository);
      if (!isCount(data.stargazers_count) || !isCount(data.forks_count)) throw new Error(`${repository}: response did not include valid counts`);
      return { id: resource.id, metrics: { stars: data.stargazers_count, forks: data.forks_count, updatedAt: now } };
    } catch (error) { return { id: resource.id, error: error.message }; }
  });
  const modelResults = await mapWithConcurrency(models, async (model) => {
    const repository = repositoryFromUrl(model.url, 'huggingface.co');
    if (!repository) return { id: model.id, error: `Unsupported Hugging Face URL: ${model.url}` };
    try {
      const data = await fetchJson(`https://huggingface.co/api/models/${repository}`, huggingFaceToken ? { Authorization: `Bearer ${huggingFaceToken}` } : {}, repository);
      if (!isCount(data.likes)) throw new Error(`${repository}: response did not include a valid like count`);
      return { id: model.id, metrics: { likes: data.likes, updatedAt: now } };
    } catch (error) { return { id: model.id, error: error.message }; }
  });
  const next = { version: 1, updatedAt: now, tools: {}, models: {}, awesome: {} };
  for (const result of toolResults) {
    const metrics = result.metrics || previous.tools?.[result.id];
    if (metrics) next.tools[result.id] = metrics;
    else failures.push(`GitHub ${result.error}`);
  }
  for (const result of awesomeResults) {
    const metrics = result.metrics || previous.awesome?.[result.id];
    if (metrics) next.awesome[result.id] = metrics;
    if (result.error) failures.push(`GitHub ${result.error}`);
  }
  for (const result of modelResults) {
    const metrics = result.metrics || previous.models?.[result.id];
    if (metrics) next.models[result.id] = metrics;
    else failures.push(`Hugging Face ${result.error}`);
  }
  const temporaryPath = `${metricsPath}.tmp`;
  await mkdir(dirname(metricsPath), { recursive: true });
  await writeFile(temporaryPath, `${JSON.stringify(next, null, 2)}\n`);
  await rename(temporaryPath, metricsPath);
  console.log(`Updated ${toolResults.filter((result) => result.metrics).length}/${tools.length} GitHub repositories and ${modelResults.filter((result) => result.metrics).length} Hugging Face models.`);
  if (failures.length) { console.error(`Completed with ${failures.length} failure(s); previous successful values were retained.`); for (const failure of failures) console.error(`- ${failure}`); process.exitCode = 1; }
}

main().catch((error) => { console.error(error.stack || error.message); process.exitCode = 1; });
