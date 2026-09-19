import type { Demo } from '../types';

let initialized = false;

export function initSite() {
  if (initialized) return;
  initialized = true;

  const root = document.documentElement;
  const body = document.body;
  const caseData = document.querySelector<HTMLScriptElement>('#case-data');
  const demos: Demo[] = caseData ? JSON.parse(caseData.textContent || '[]') : [];
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

  const replayTimers = new WeakMap<HTMLVideoElement, number>();
  const videoObserver = new IntersectionObserver((entries) => {
    if (reduceMotion) return;
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0.55 && !caseDialog?.open && !document.hidden) {
        video.play().catch(() => undefined);
      } else {
        video.pause();
        const timer = replayTimers.get(video);
        if (timer) window.clearTimeout(timer);
      }
    });
  }, { threshold: [0, 0.55, 1] });

  document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => {
    videoObserver.observe(video);
    video.addEventListener('ended', () => {
      const timer = window.setTimeout(() => {
        if (!document.hidden && !caseDialog?.open) {
          video.currentTime = 0;
          video.play().catch(() => undefined);
        }
      }, 3000);
      replayTimers.set(video, timer);
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

  const openCase = (demo: Demo, push = true) => {
    if (!caseDialog) return;
    previousUrl = push ? location.pathname : previousUrl;
    activeDemoId = demo.id;
    const mediaHost = caseDialog.querySelector<HTMLElement>('.dialog-media')!;
    const media = demo.mediaType === 'video' ? document.createElement('video') : document.createElement('img');
    media.src = demo.src;
    if (media instanceof HTMLVideoElement) {
      media.muted = true; media.autoplay = true; media.playsInline = true; media.controls = true;
    } else media.alt = '';
    mediaHost.replaceChildren(media);
    caseDialog.querySelector<HTMLElement>('.dialog-description')!.textContent = demo.description;
    caseDialog.querySelector<HTMLImageElement>('.dialog-author img')!.src = demo.author.avatarUrl;
    caseDialog.querySelector<HTMLElement>('.dialog-author strong')!.textContent = demo.author.name;
    caseDialog.querySelector<HTMLElement>('.dialog-author span')!.textContent = `@${demo.author.handle}`;
    caseDialog.querySelector<HTMLElement>('.dialog-date')!.textContent = new Intl.DateTimeFormat('en', { dateStyle: 'long' }).format(new Date(demo.createdAt));
    const source = caseDialog.querySelector<HTMLAnchorElement>('.dialog-source')!;
    source.href = demo.url;
    const taxonomy = caseDialog.querySelector<HTMLElement>('.dialog-taxonomy')!;
    taxonomy.textContent = demo.category.replaceAll('_', ' ');
    const embed = caseDialog.querySelector<HTMLElement>('.dialog-embed')!;
    embed.innerHTML = `<a href="${demo.url}" target="_blank" rel="noreferrer">Loading original post…</a>`;
    if (!caseDialog.open) caseDialog.showModal();
    body.classList.add('no-scroll');
    document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => video.pause());
    if (push) history.pushState({ caseId: demo.id }, '', `/use-cases/${demo.id}`);
    loadTweet(demo.id, embed);
  };

  async function loadTweet(id: string, host: HTMLElement) {
    type TwitterWindow = Window & { twttr?: { widgets: { createTweet: (id: string, host: HTMLElement, options: object) => Promise<HTMLElement> } } };
    const twitterWindow = window as TwitterWindow;
    if (!twitterWindow.twttr) {
      await new Promise<void>((resolve) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-twitter-widget]');
        if (existing) { existing.addEventListener('load', () => resolve(), { once: true }); return; }
        const script = document.createElement('script');
        script.src = 'https://platform.twitter.com/widgets.js';
        script.async = true; script.dataset.twitterWidget = 'true';
        script.onload = () => resolve();
        script.onerror = () => resolve();
        document.head.append(script);
      });
    }
    if (activeDemoId !== id) return;
    host.replaceChildren();
    twitterWindow.twttr?.widgets.createTweet(id, host, { theme: root.dataset.theme === 'dark' ? 'dark' : 'light', dnt: true }).catch(() => {
      host.innerHTML = '<p>Original post could not be embedded. Use the source link above.</p>';
    });
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

  document.querySelector('.search-trigger')?.addEventListener('click', () => {
    searchDialog?.showModal(); body.classList.add('no-scroll');
    window.setTimeout(() => searchDialog?.querySelector('input')?.focus(), 30);
  });
  const closeSearch = () => { searchDialog?.close(); body.classList.remove('no-scroll'); };
  searchDialog?.querySelector('.search-close')?.addEventListener('click', closeSearch);
  searchDialog?.addEventListener('cancel', (event) => { event.preventDefault(); closeSearch(); });
  const input = searchDialog?.querySelector<HTMLInputElement>('input');
  input?.addEventListener('input', () => {
    if (!searchDialog) return;
    const query = input.value.trim().toLowerCase();
    let count = 0;
    searchDialog.querySelectorAll<HTMLElement>('.search-results > [data-search]').forEach((item) => {
      const visible = !query || item.dataset.search?.includes(query);
      item.hidden = !visible; if (visible) count++;
    });
    searchDialog.querySelector<HTMLElement>('.search-status')!.textContent = `${count} use case${count === 1 ? '' : 's'}`;
    searchDialog.querySelector<HTMLElement>('.search-empty')!.hidden = count !== 0;
  });
}

