import type { APIRoute } from 'astro';
import demosData from '../data/demos.json';
import taxonomyData from '../data/taxonomy.json';
import type { Demo } from '../types';

export const prerender = true;

const TWIMG_AVATAR_PREFIX = 'https://pbs.twimg.com/profile_images/';

export const GET: APIRoute = async () => {
  const cats: Record<string, [string, string, string]> = {};
  for (const layer of taxonomyData.layers) {
    for (const group of layer.groups) {
      for (const cat of group.categories) {
        cats[cat.code] = [cat.enName, group.enName, group.code];
      }
    }
  }

  const items = (demosData as Demo[]).map((d) => {
    let avatar = d.author.avatarUrl;
    if (avatar.startsWith(TWIMG_AVATAR_PREFIX)) {
      avatar = avatar.slice(TWIMG_AVATAR_PREFIX.length);
    }
    const item: Record<string, unknown> = {
      i: d.id,
      d: d.description,
      t: d.createdAt,
      c: d.category,
      a: {
        n: d.author.name,
        h: d.author.handle,
        u: avatar,
      },
    };

    const defaultUrl = `https://x.com/${d.author.handle}/status/${d.id}`;
    if (d.url && d.url !== defaultUrl) item.url = d.url;

    const defaultCover = `/covers/${d.id}.webp`;
    if (d.cover && d.cover !== defaultCover) item.cov = d.cover;

    const defaultMediaType = 'video';
    if (d.mediaType && d.mediaType !== defaultMediaType) item.m = d.mediaType;

    const defaultSrc = `/previews/${d.id}.${(d.mediaType || 'video') === 'video' ? 'webm' : 'webp'}`;
    if (d.src && d.src !== defaultSrc) item.src = d.src;

    if (d.width && d.width !== 426) item.w = d.width;
    if (d.height && d.height !== 240) item.h = d.height;

    return item;
  });

  const payload = { cats, items };

  return new Response(JSON.stringify(payload), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
