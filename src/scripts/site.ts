import type { Demo } from '../types';

type ClientDemo = Demo & {
  categoryName: string;
  groupName: string;
  groupCode: string;
};

let initialized = false;

export function initSite() {
  if (initialized) return;
  initialized = true;

  const root = document.documentElement;
  const body = document.body;
  const caseData = document.querySelector<HTMLScriptElement>('#case-data');
  const demos: ClientDemo[] = caseData ? JSON.parse(caseData.textContent || '[]') : [];
  const demoMap = new Map(demos.map((demo) => [demo.id, demo]));
  const caseDialog = document.querySelector<HTMLDialogElement>('.case-dialog');
  const searchDialog = document.querySelector<HTMLDialogElement>('.search-dialog');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousUrl = location.pathname;
  let activeDemoId: string | null = null;

  document.querySelectorAll<HTMLImageElement>("img[data-fallback-media]").forEach((image) => {
    image.addEventListener("error", () => { image.hidden = true; });
  });

  const themeToggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
  themeToggle?.addEventListener('click', () => {
    const computedDark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = computedDark ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('jev-theme', next);
  });

  const languageButton = document.querySelector<HTMLButtonElement>('.language button');
  const languageMenu = document.querySelector<HTMLElement>('#language-menu');
  languageButton?.addEventListener('click', () => {
    const opening = languageMenu?.hidden ?? true;
    if (languageMenu) languageMenu.hidden = !opening;
    languageButton.setAttribute('aria-expanded', String(opening));
  });

  const navToggle = document.querySelector<HTMLButtonElement>('.mobile-nav-toggle');
  const nav = document.querySelector<HTMLElement>('.site-header nav');
  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open') ?? false;
    navToggle.setAttribute('aria-expanded', String(open));
  });


  const attachPlaybackEasing = (video: HTMLVideoElement) => {
    video.addEventListener('timeupdate', () => {
      if (!Number.isFinite(video.duration) || video.duration <= 0) return;
      const progress = video.currentTime / video.duration;
      if (progress < 0.75) {
        video.playbackRate = 1;
        return;
      }
      const finalQuarter = Math.min(1, (progress - 0.75) / 0.25);
      video.playbackRate = Math.max(0.18, 1 - 0.82 * finalQuarter * finalQuarter);
    });
  };

  const videoObserver = new IntersectionObserver((entries) => {
    if (reduceMotion) return;
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0.55 && !caseDialog?.open && !document.hidden) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.55, 1] });

  document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => {
    videoObserver.observe(video);
    attachPlaybackEasing(video);
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.playbackRate = 1;
      if (!document.hidden && !caseDialog?.open) video.play().catch(() => undefined);
    });
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) document.querySelectorAll<HTMLVideoElement>('video').forEach((video) => video.pause());
  });

  const closeCase = (restoreHistory = true) => {
    if (!caseDialog?.open) return;
    caseDialog.close();
    caseDialog.querySelector('video')?.pause();
    caseDialog.querySelector('.dialog-media')?.replaceChildren(Object.assign(document.createElement('div'), { className: 'dialog-placeholder', textContent: 'jev' }));
    activeDemoId = null;
    body.classList.remove('no-scroll');
    if (restoreHistory && location.pathname.startsWith('/use-cases/')) history.pushState({}, '', previousUrl);
  };

  const showMediaFallback = (demo: Demo, host: HTMLElement) => {
    if (!caseDialog) return;
    caseDialog.classList.add('tweet-failed');
    host.innerHTML = '<p>Original post could not be embedded. Showing the preview instead.</p>';
    const mediaHost = caseDialog.querySelector<HTMLElement>('.dialog-media')!;
    mediaHost.hidden = false;
    const media = demo.mediaType === 'video' ? document.createElement('video') : document.createElement('img');
    media.src = demo.src;
    if (media instanceof HTMLVideoElement) {
      media.muted = true; media.autoplay = true; media.playsInline = true; media.controls = true;
      attachPlaybackEasing(media);
    } else media.alt = '';
      media.poster = demo.cover;
    mediaHost.replaceChildren(media);
  };

  const openCase = (demo: ClientDemo, push = true) => {
    if (!caseDialog) return;
    previousUrl = push ? location.pathname : previousUrl;
    activeDemoId = demo.id;
    caseDialog.classList.remove('tweet-failed');
    caseDialog.querySelector<HTMLElement>('.dialog-description')!.textContent = demo.description;
    caseDialog.querySelector<HTMLImageElement>('.dialog-author img')!.src = demo.author.avatarUrl;
    caseDialog.querySelector<HTMLElement>('.dialog-author strong')!.textContent = demo.author.name;
    caseDialog.querySelector<HTMLElement>('.dialog-author span')!.textContent = `@${demo.author.handle}`;
    caseDialog.querySelector<HTMLElement>('.dialog-date')!.textContent = new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(demo.createdAt));
    const source = caseDialog.querySelector<HTMLAnchorElement>('.dialog-source')!;
    source.href = demo.url;
    const taxonomy = caseDialog.querySelector<HTMLElement>('.dialog-taxonomy')!;
    taxonomy.replaceChildren();
    if (demo.groupName && demo.groupCode) {
      const groupLink = document.createElement('a');
      groupLink.href = `/use-cases/${demo.groupCode}`;
      groupLink.textContent = demo.groupName;
      const separator = document.createElement('span');
      separator.textContent = '/';
      taxonomy.append(groupLink, separator);
    }
    taxonomy.append(document.createTextNode(demo.categoryName));
    const embed = caseDialog.querySelector<HTMLElement>('.dialog-embed')!;
    embed.innerHTML = `<div class="embed-loading" role="status"><span aria-hidden="true"></span><strong>Loading original post…</strong><small>This may take a few seconds.</small><a href="${demo.url}" target="_blank" rel="noreferrer">Open directly ↗</a></div>`;
    if (!caseDialog.open) caseDialog.showModal();
    body.classList.add('no-scroll');
    document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => video.pause());
    if (push) history.pushState({ caseId: demo.id }, '', `/use-cases/${demo.id}`);
    loadTweet(demo, embed);
  };

  const tweetExists = (id: string) => new Promise<boolean>((resolve) => {
    const callback = '__jevOembed' + id + Math.random().toString(36).slice(2);
    const jsonpWindow = window as unknown as Record<string, unknown>;
    const script = document.createElement('script');
    let settled = false;
    const finish = (available: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      script.remove();
      delete jsonpWindow[callback];
      resolve(available);
    };
    jsonpWindow[callback] = () => finish(true);
    script.onerror = () => finish(false);
    script.src = `https://publish.x.com/oembed?url=${encodeURIComponent('https://x.com/i/status/' + id)}&omit_script=true&dnt=true&callback=${callback}`;
    const timer = window.setTimeout(() => finish(false), 6000);
    document.head.append(script);
  });
  async function loadTweet(demo: Demo, host: HTMLElement) {
    type TwitterWindow = Window & { twttr?: { widgets: { createTweet: (id: string, host: HTMLElement, options: object) => Promise<HTMLElement> } } };
    const twitterWindow = window as TwitterWindow;
    if (!(await tweetExists(demo.id))) { if (activeDemoId === demo.id) showMediaFallback(demo, host); return; }
    if (!twitterWindow.twttr) {
      await new Promise<void>((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-twitter-widget]');
        if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); existing.addEventListener('error', () => resolve(), { once: true }); return; }
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true; script.dataset.twitterWidget = 'true';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.append(script);
      });
    }
    if (activeDemoId !== demo.id) return;
    host.replaceChildren();
    if (!twitterWindow.twttr) { showMediaFallback(demo, host); return; }
    try {
      const result = await twitterWindow.twttr.widgets.createTweet(demo.id, host, { theme: root.dataset.theme === 'dark' ? 'dark' : 'light', dnt: true });
      if (!result) throw new Error('Tweet unavailable');
    } catch {
      if (activeDemoId === demo.id) showMediaFallback(demo, host);
    }
  }

  document.addEventListener('click', (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-case-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const demo = demoMap.get(link.dataset.id || '');
    if (!demo) return;
    event.preventDefault();
    if (searchDialog?.open) searchDialog.close();
    openCase(demo);
  });
  caseDialog?.querySelector('.dialog-close')?.addEventListener('click', () => closeCase());
  caseDialog?.addEventListener('click', (event) => { if (event.target === caseDialog) closeCase(); });
  caseDialog?.addEventListener('cancel', (event) => { event.preventDefault(); closeCase(); });
  addEventListener('popstate', () => {
    const match = location.pathname.match(/^\/use-cases\/(\d+)$/);
    if (match && demoMap.has(match[1])) openCase(demoMap.get(match[1])!, false);
    else closeCase(false);
  });

  const openSearch = () => {
    searchDialog?.showModal(); body.classList.add('no-scroll');
    window.setTimeout(() => searchDialog?.querySelector('input')?.focus(), 30);
  };
  document.querySelectorAll('.search-trigger, .home-search-trigger').forEach((trigger) => {
    trigger.addEventListener('click', openSearch);
  });
  const closeSearch = () => { searchDialog?.close(); body.classList.remove('no-scroll'); };
  searchDialog?.querySelector('.search-close')?.addEventListener('click', closeSearch);
  searchDialog?.addEventListener('cancel', (event) => { event.preventDefault(); closeSearch(); });
  const input = searchDialog?.querySelector<HTMLInputElement>('input');
  const searchResults = searchDialog?.querySelector<HTMLElement>('.search-results');
  const searchStatus = searchDialog?.querySelector<HTMLElement>('.search-status');
  const searchEmpty = searchDialog?.querySelector<HTMLElement>('.search-empty');
  const createSearchResult = (demo: ClientDemo) => {
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = `/use-cases/${demo.id}`;
    link.dataset.caseLink = '';
    link.dataset.id = demo.id;

    const frame = document.createElement('div');
    frame.className = 'search-result-frame';
    const fallback = document.createElement('div');
    fallback.className = 'search-result-fallback';
    fallback.ariaHidden = 'true';
    fallback.textContent = 'jev';
    frame.append(fallback);

    const media = demo.mediaType === 'video' ? document.createElement('video') : document.createElement('img');
    media.className = 'search-result-media';
    media.src = demo.src;
    media.width = demo.width;
    media.height = demo.height;
    if (media instanceof HTMLVideoElement) {
      media.classList.add('case-video');
      media.muted = true;
      media.playsInline = true;
      media.poster = demo.cover;
      media.preload = 'none';
      media.setAttribute('aria-label', demo.description);
      attachPlaybackEasing(media);
      videoObserver.observe(media);
    } else {
      media.alt = '';
      media.loading = 'lazy';
      media.addEventListener('error', () => { media.hidden = true; });
    }
    frame.append(media);
    const context = document.createElement('div');
    context.className = 'search-result-context';
    context.textContent = `${demo.groupName} / ${demo.categoryName} · @${demo.author.handle}`;
    const description = document.createElement('p');
    description.className = 'line-clamp-2';
    description.textContent = demo.description;
    link.append(frame, context, description);
    return link;
  };
  input?.addEventListener('input', () => {
    if (!searchDialog || !searchResults || !searchStatus || !searchEmpty) return;
    const query = input.value.trim().toLowerCase();
    searchResults.querySelectorAll<HTMLVideoElement>('video').forEach((video) => videoObserver.unobserve(video));
    const matches = query ? demos.filter((demo) =>
      `${demo.description} ${demo.author.name} ${demo.author.handle} ${demo.categoryName} ${demo.groupName}`.toLowerCase().includes(query),
    ) : [];
    const resultLimit = matchMedia('(max-width: 760px)').matches ? 12 : 16;
    const visible = matches.slice(0, resultLimit);
    searchResults.replaceChildren(...visible.map(createSearchResult));
    searchStatus.textContent = query
      ? `${matches.length} use case${matches.length === 1 ? '' : 's'}${matches.length > visible.length ? ` · showing first ${visible.length}` : ''}`
      : `Search ${demos.length} use cases`;
    searchEmpty.textContent = query ? 'No use cases found.' : 'Start typing to find a use case.';
    searchEmpty.hidden = visible.length !== 0;
  });

}

