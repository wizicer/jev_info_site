import type { Demo } from '../types';

type ClientDemo = Demo & {
  categoryName: string;
  groupName: string;
  groupCode: string;
};

interface CompactItem {
  i: string;
  d: string;
  t: string;
  c: string;
  a: {
    n: string;
    h: string;
    u: string;
  };
  url?: string;
  cov?: string;
  m?: string;
  src?: string;
  w?: number;
  h?: number;
}

interface CompactPayload {
  cats: Record<string, [string, string, string]>;
  items: CompactItem[];
}

const TWIMG_AVATAR_PREFIX = 'https://pbs.twimg.com/profile_images/';

function normalizeDemo(item: CompactItem, cats: Record<string, [string, string, string]>): ClientDemo {
  const mediaType = (item.m as 'video' | 'image') ?? 'video';
  const cat = cats[item.c] ?? [item.c, '', ''];
  const avatar = item.a.u.startsWith('http') ? item.a.u : TWIMG_AVATAR_PREFIX + item.a.u;
  const id = item.i;
  const handle = item.a.h;

  return {
    id,
    description: item.d,
    createdAt: item.t,
    category: item.c,
    categoryName: cat[0],
    groupName: cat[1],
    groupCode: cat[2],
    author: {
      name: item.a.n,
      handle,
      avatarUrl: avatar,
      isVerified: false,
    },
    mediaType,
    width: item.w ?? 426,
    height: item.h ?? 240,
    cover: item.cov ?? `/covers/${id}.webp`,
    src: item.src ?? `/previews/${id}.${mediaType === 'video' ? 'webm' : 'webp'}`,
    url: item.url ?? `https://x.com/${handle}/status/${id}`,
    score: 0,
  };
}

function getLang(): string {
  if (typeof document !== 'undefined') {
    return document.documentElement.lang || 'en';
  }
  return 'en';
}

function getPrefix(): string {
  const lang = getLang();
  return lang === 'en' ? '' : `/${lang}`;
}

let demosPromise: Promise<{ demos: ClientDemo[]; demoMap: Map<string, ClientDemo> }> | null = null;

function loadDemos(): Promise<{ demos: ClientDemo[]; demoMap: Map<string, ClientDemo> }> {
  if (!demosPromise) {
    const prefix = getPrefix();
    demosPromise = fetch(`${prefix}/cases-data.json`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load cases data');
        return res.json() as Promise<CompactPayload>;
      })
      .then((payload) => {
        const list = payload.items.map((item) => normalizeDemo(item, payload.cats));
        const map = new Map(list.map((d) => [d.id, d]));
        return { demos: list, demoMap: map };
      })
      .catch((err) => {
        console.error('Error loading cases:', err);
        return { demos: [], demoMap: new Map() };
      });
  }
  return demosPromise;
}

let initialized = false;

export function initSite() {
  if (initialized) return;
  initialized = true;

  const root = document.documentElement;
  const body = document.body;
  const caseDialog = document.querySelector<HTMLDialogElement>('.case-dialog');
  const searchDialog = document.querySelector<HTMLDialogElement>('.search-dialog');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let previousUrl = location.pathname;
  let activeDemoId: string | null = null;

  if ('requestIdleCallback' in window) {
    (window as unknown as { requestIdleCallback: (cb: () => void) => void }).requestIdleCallback(() => { loadDemos(); });
  } else {
    setTimeout(() => { loadDemos(); }, 1500);
  }

  const prefetchDemos = () => { loadDemos(); };
  document.querySelectorAll('.search-trigger, .home-search-trigger, [data-case-link]').forEach((el) => {
    el.addEventListener('pointerenter', prefetchDemos, { once: true, passive: true });
  });

  document.querySelectorAll<HTMLImageElement>("img[data-fallback-media]").forEach((image) => {
    image.addEventListener("error", () => { image.hidden = true; });
  });

  const themeToggle = document.querySelector<HTMLButtonElement>('.theme-toggle');
  const themeColor = document.querySelector<HTMLMetaElement>('meta[data-theme-color]');
  const syncThemeColor = () => {
    if (themeColor) themeColor.content = getComputedStyle(root).getPropertyValue('--paper').trim();
  };
  syncThemeColor();
  themeToggle?.addEventListener('click', () => {
    const computedDark = root.dataset.theme === 'dark' || (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    const next = computedDark ? 'light' : 'dark';
    root.dataset.theme = next;
    localStorage.setItem('jev-theme', next);
    syncThemeColor();
  });

  const languageButton = document.querySelector<HTMLButtonElement>('.language button');
  const languageMenu = document.querySelector<HTMLElement>('#language-menu');
  const closeLanguageMenu = () => {
    if (languageMenu) languageMenu.hidden = true;
    languageButton?.setAttribute('aria-expanded', 'false');
  };
  languageButton?.addEventListener('click', () => {
    const opening = languageMenu?.hidden ?? true;
    if (languageMenu) languageMenu.hidden = !opening;
    languageButton.setAttribute('aria-expanded', String(opening));
    if (opening) closeMobileNav();
  });

  const categoryLinks = [...document.querySelectorAll<HTMLAnchorElement>('.category-nav a')];
  const categoryHeadings = [...document.querySelectorAll<HTMLElement>('.category-section h2[id]')];
  if (categoryLinks.length && categoryHeadings.length) {
    const setActiveCategory = (id: string) => {
      categoryLinks.forEach((link) => {
        const active = link.hash === `#${id}`;
        link.classList.toggle('active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    };
    const updateActiveCategory = () => {
      const current = [...categoryHeadings].reverse().find((heading) => heading.getBoundingClientRect().top <= 150) ?? categoryHeadings[0];
      setActiveCategory(current.id);
    };
    let categoryUpdateScheduled = false;
    addEventListener('scroll', () => {
      if (categoryUpdateScheduled) return;
      categoryUpdateScheduled = true;
      requestAnimationFrame(() => {
        categoryUpdateScheduled = false;
        updateActiveCategory();
      });
    }, { passive: true });
    updateActiveCategory();
    categoryLinks.forEach((link) => link.addEventListener('click', () => {
      const id = decodeURIComponent(link.hash.slice(1));
      if (id) setActiveCategory(id);
    }));
  }
  const navToggle = document.querySelector<HTMLButtonElement>('.mobile-nav-toggle');
  const nav = document.querySelector<HTMLElement>('.site-header nav');
  function closeMobileNav() {
    nav?.classList.remove('open');
    navToggle?.setAttribute('aria-expanded', 'false');
    navToggle?.setAttribute('aria-label', 'Open menu');
  }
  navToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open') ?? false;
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) closeLanguageMenu();
  });
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.language')) closeLanguageMenu();
    if (!target.closest('.site-header nav, .mobile-nav-toggle')) closeMobileNav();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    const languageWasOpen = languageMenu && !languageMenu.hidden;
    const navWasOpen = nav?.classList.contains('open');
    closeLanguageMenu();
    closeMobileNav();
    if (languageWasOpen) languageButton?.focus();
    else if (navWasOpen) navToggle?.focus();
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

  const isPreviewVisible = (video: HTMLVideoElement) => {
    const rect = video.getBoundingClientRect();
    const visibleHeight = Math.min(rect.bottom, innerHeight) - Math.max(rect.top, 0);
    return visibleHeight > rect.height * 0.55;
  };
  const playPreview = (video: HTMLVideoElement) => {
    if (reduceMotion || document.hidden || caseDialog?.open) return;
    video.play().catch(() => undefined);
  };
  const videoObserver = new IntersectionObserver((entries) => {
    if (reduceMotion) return;
    entries.forEach((entry) => {
      const video = entry.target as HTMLVideoElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0.55 && !caseDialog?.open && !document.hidden) {
        playPreview(video);
      } else {
        video.pause();
      }
    });
  }, { threshold: [0, 0.55, 1] });

  const setupPreviewVideo = (video: HTMLVideoElement) => {
    if (video.dataset.previewReady) return;
    video.dataset.previewReady = 'true';
    videoObserver.observe(video);
    attachPlaybackEasing(video);
    video.addEventListener('playing', () => video.classList.add('is-playing'));
    video.addEventListener('pause', () => video.classList.remove('is-playing'));
    video.addEventListener('error', () => video.classList.remove('is-playing'));
    video.addEventListener('ended', () => {
      video.currentTime = 0;
      video.playbackRate = 1;
      playPreview(video);
    });
    const frame = video.closest<HTMLElement>('.media-frame, .search-result-frame');
    frame?.addEventListener('pointerenter', () => playPreview(video));
    frame?.addEventListener('touchstart', () => playPreview(video), { passive: true });
  };
  document.querySelectorAll<HTMLVideoElement>('.case-video').forEach(setupPreviewVideo);
  const resumeVisiblePreviews = () => {
    document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => {
      if (isPreviewVisible(video)) playPreview(video);
    });
  };
  document.addEventListener('visibilitychange', () => {
    const videos = [...document.querySelectorAll<HTMLVideoElement>('.case-video')];
    if (document.hidden) {
      videos.forEach((video) => video.pause());
      return;
    }
    resumeVisiblePreviews();
  });

  const closeCase = (restoreHistory = true) => {
    if (!caseDialog?.open) return;
    caseDialog.close();
    const mediaHost = caseDialog.querySelector<HTMLElement>('.dialog-media');
    if (mediaHost) {
      mediaHost.style.display = 'none';
      mediaHost.replaceChildren(Object.assign(document.createElement('div'), { className: 'dialog-placeholder', textContent: 'jev' }));
    }
    const embed = caseDialog.querySelector<HTMLElement>('.dialog-embed');
    if (embed) {
      embed.classList.remove('is-staging');
      embed.hidden = true;
      embed.replaceChildren();
    }
    activeDemoId = null;
    body.classList.remove('no-scroll');
    resumeVisiblePreviews();
    const prefix = getPrefix();
    const casePathPrefix = `${prefix}/use-cases/`;
    if (restoreHistory && location.pathname.startsWith(casePathPrefix)) history.pushState({}, '', previousUrl);
  };

  const setTweetStatus = (state: 'loading' | 'failed' | 'loaded', demo?: ClientDemo | Demo) => {
    if (!caseDialog) return;
    const statusBar = caseDialog.querySelector<HTMLElement>('.tweet-status-bar');
    if (!statusBar) return;
    const statusText = statusBar.querySelector<HTMLElement>('.tweet-status-text');
    const statusLink = statusBar.querySelector<HTMLAnchorElement>('.tweet-status-link');
    const lang = getLang();

    if (state === 'loading') {
      statusBar.classList.remove('is-failed', 'is-loaded');
      statusBar.hidden = false;
      if (statusText) statusText.textContent = lang === 'zh' ? '正在加载原帖…' : lang === 'ja' ? '元の投稿を読み込み中…' : 'Loading original post…';
      if (statusLink && demo) statusLink.href = demo.url;
    } else if (state === 'failed') {
      statusBar.classList.remove('is-loaded');
      statusBar.classList.add('is-failed');
      statusBar.hidden = false;
      if (statusText) statusText.textContent = lang === 'zh' ? '原帖暂时无法显示 · 展示预览' : lang === 'ja' ? '元の投稿を表示できません · プレビューを表示中' : 'Original post unavailable · Showing preview';
      if (statusLink && demo) statusLink.href = demo.url;
    } else if (state === 'loaded') {
      statusBar.classList.remove('is-failed');
      statusBar.classList.add('is-loaded');
      statusBar.hidden = true;
    }
  };

  const renderCaseMedia = (demo: ClientDemo | Demo) => {
    if (!caseDialog) return;
    const mediaHost = caseDialog.querySelector<HTMLElement>('.dialog-media')!;
    mediaHost.style.display = 'flex';
    const img = document.createElement('img');
    img.className = 'dialog-cover-img';
    img.src = demo.cover;
    img.alt = demo.description || '';
    mediaHost.replaceChildren(img);
  };

  const openCase = (demo: ClientDemo, push = true) => {
    if (!caseDialog) return;
    previousUrl = push ? location.pathname : previousUrl;
    activeDemoId = demo.id;
    const lang = getLang();
    const prefix = getPrefix();
    const dateLocale = lang === 'zh' ? 'zh-CN' : lang === 'ja' ? 'ja-JP' : 'en';

    caseDialog.querySelector<HTMLElement>('.dialog-description')!.textContent = demo.description;
    caseDialog.querySelector<HTMLImageElement>('.dialog-author img')!.src = demo.author.avatarUrl;
    caseDialog.querySelector<HTMLElement>('.dialog-author strong')!.textContent = demo.author.name;
    caseDialog.querySelector<HTMLElement>('.dialog-author span')!.textContent = `@${demo.author.handle}`;
    caseDialog.querySelector<HTMLElement>('.dialog-date')!.textContent = new Intl.DateTimeFormat(dateLocale, { dateStyle: 'long' }).format(new Date(demo.createdAt));
    const source = caseDialog.querySelector<HTMLAnchorElement>('.dialog-source')!;
    source.href = demo.url;
    const taxonomy = caseDialog.querySelector<HTMLElement>('.dialog-taxonomy')!;
    taxonomy.replaceChildren();
    if (demo.groupName && demo.groupCode) {
      const groupLink = document.createElement('a');
      groupLink.href = `${prefix}/use-cases/${demo.groupCode}`;
      groupLink.textContent = demo.groupName;
      const separator = document.createElement('span');
      separator.textContent = '/';
      taxonomy.append(groupLink, separator);
    }
    taxonomy.append(document.createTextNode(demo.categoryName));

    // 1. Immediately render only the static cover image
    renderCaseMedia(demo);

    // 2. Set status bar to loading
    setTweetStatus('loading', demo);

    // 3. Prepare embed host (staging mode: keep in layout for measurement, but hidden offscreen)
    const embed = caseDialog.querySelector<HTMLElement>('.dialog-embed')!;
    embed.hidden = false;
    embed.classList.add('is-staging');
    embed.replaceChildren();

    if (!caseDialog.open) caseDialog.showModal();
    body.classList.add('no-scroll');
    document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => video.pause());
    if (push) history.pushState({ caseId: demo.id }, '', `${prefix}/use-cases/${demo.id}`);
    loadTweet(demo, embed);
  };

  async function loadTweet(demo: Demo | ClientDemo, host: HTMLElement) {
    type TwitterWindow = Window & {
      twttr?: {
        widgets: {
          createVideo: (id: string, host: HTMLElement, options: object) => Promise<HTMLElement | undefined>;
          createTweet: (id: string, host: HTMLElement, options: object) => Promise<HTMLElement | undefined>;
        };
      };
    };
    const twitterWindow = window as TwitterWindow;

    const loadTwitterScript = () => new Promise<void>((resolve) => {
      if (twitterWindow.twttr) return resolve();
      const existing = document.querySelector<HTMLScriptElement>('script[data-twitter-widget]');
      if (existing) {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => resolve(), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.dataset.twitterWidget = 'true';
      script.onload = () => resolve();
      script.onerror = () => resolve();
      document.head.append(script);
    });

    const currentId = demo.id;
    const tweetPromise = (async () => {
      try {
        await loadTwitterScript();
        if (!twitterWindow.twttr) return false;
        let result = await twitterWindow.twttr.widgets.createVideo(currentId, host, {
          theme: root.dataset.theme === 'dark' ? 'dark' : 'light',
          dnt: true
        });
        if (!result) {
          result = await twitterWindow.twttr.widgets.createTweet(currentId, host, {
            theme: root.dataset.theme === 'dark' ? 'dark' : 'light',
            dnt: true
          });
        }
        return !!result;
      } catch {
        return false;
      }
    })();

    const timeoutPromise = new Promise<boolean>((resolve) => setTimeout(() => resolve(false), 10000));
    const ok = await Promise.race([tweetPromise, timeoutPromise]);
    if (activeDemoId !== currentId) return;

    if (ok) {
      setTweetStatus('loaded', demo);
      const mediaHost = caseDialog?.querySelector<HTMLElement>('.dialog-media');
      if (mediaHost) mediaHost.style.display = 'none';
      host.classList.remove('is-staging');
      host.hidden = false;
    } else {
      setTweetStatus('failed', demo);
      const mediaHost = caseDialog?.querySelector<HTMLElement>('.dialog-media');
      if (mediaHost) mediaHost.style.display = 'flex';
      host.classList.remove('is-staging');
      host.hidden = true;
    }
  }

  document.addEventListener('click', async (event) => {
    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>('[data-case-link]');
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const id = link.dataset.id || '';
    if (!id) return;
    event.preventDefault();

    if (searchDialog?.open) closeSearch();

    if (activeDemoId !== id) {
      activeDemoId = id;
      if (!caseDialog?.open) {
        caseDialog?.showModal();
        body.classList.add('no-scroll');
      }
      document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => video.pause());
      const descEl = caseDialog?.querySelector<HTMLElement>('.dialog-description');
      const lang = getLang();
      if (descEl) descEl.textContent = lang === 'zh' ? '正在加载用例详情…' : lang === 'ja' ? '事例の詳細を読み込み中…' : 'Loading use case details…';
      const embedEl = caseDialog?.querySelector<HTMLElement>('.dialog-embed');
      const loadingLabel = lang === 'zh' ? '正在加载…' : lang === 'ja' ? '読み込み中…' : 'Loading…';
      if (embedEl) embedEl.innerHTML = `<div class="embed-loading" role="status"><span aria-hidden="true"></span><strong>${loadingLabel}</strong></div>`;
    }

    try {
      const { demoMap } = await loadDemos();
      const demo = demoMap.get(id);
      if (!demo) {
        location.href = link.href;
        return;
      }
      if (activeDemoId === id) {
        openCase(demo);
      }
    } catch {
      location.href = link.href;
    }
  });

  caseDialog?.querySelector('.dialog-close')?.addEventListener('click', () => closeCase());
  caseDialog?.addEventListener('click', (event) => { if (event.target === caseDialog) closeCase(); });
  caseDialog?.addEventListener('cancel', (event) => { event.preventDefault(); closeCase(); });

  addEventListener('popstate', async () => {
    const prefix = getPrefix();
    const regex = new RegExp(`^${prefix}/use-cases/(\\d+)$`);
    const match = location.pathname.match(regex);
    if (match) {
      const { demoMap } = await loadDemos();
      const demo = demoMap.get(match[1]);
      if (demo) openCase(demo, false);
      else closeCase(false);
    } else {
      closeCase(false);
    }
  });

  const openSearch = () => {
    loadDemos();
    document.querySelectorAll<HTMLVideoElement>('.case-video').forEach((video) => video.pause());
    searchDialog?.showModal(); body.classList.add('no-scroll');
    input?.dispatchEvent(new Event('input'));
    window.setTimeout(() => searchDialog?.querySelector('input')?.focus(), 30);
  };
  document.querySelectorAll('.search-trigger, .home-search-trigger').forEach((trigger) => {
    trigger.addEventListener('click', openSearch);
  });
  const closeSearch = () => {
    searchResults?.querySelectorAll<HTMLVideoElement>('video').forEach((video) => videoObserver.unobserve(video));
    searchResults?.replaceChildren();
    searchDialog?.close();
    body.classList.remove('no-scroll');
    resumeVisiblePreviews();
  };
  searchDialog?.querySelector('.search-close')?.addEventListener('click', closeSearch);
  searchDialog?.addEventListener('cancel', (event) => { event.preventDefault(); closeSearch(); });

  document.addEventListener('keydown', (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (searchDialog?.open) closeSearch();
      else openSearch();
      return;
    }

    if (event.key === '/' && !searchDialog?.open && !caseDialog?.open) {
      const activeEl = document.activeElement;
      const isInput = activeEl instanceof HTMLInputElement || activeEl instanceof HTMLTextAreaElement || (activeEl as HTMLElement)?.isContentEditable;
      if (!isInput) {
        event.preventDefault();
        openSearch();
      }
    }
  });
  const input = searchDialog?.querySelector<HTMLInputElement>('input');
  const searchResults = searchDialog?.querySelector<HTMLElement>('.search-results');
  const searchStatus = searchDialog?.querySelector<HTMLElement>('.search-status');
  const searchEmpty = searchDialog?.querySelector<HTMLElement>('.search-empty');
  const createSearchResult = (demo: ClientDemo) => {
    const prefix = getPrefix();
    const link = document.createElement('a');
    link.className = 'search-result';
    link.href = `${prefix}/use-cases/${demo.id}`;
    link.dataset.caseLink = '';
    link.dataset.id = demo.id;

    const frame = document.createElement('div');
    frame.className = 'search-result-frame';
    const fallback = document.createElement('div');
    fallback.className = 'search-result-fallback';
    fallback.ariaHidden = 'true';
    fallback.textContent = 'jev';
    const cover = document.createElement('img');
    cover.className = 'search-result-cover';
    cover.src = demo.cover;
    cover.width = demo.width;
    cover.height = demo.height;
    cover.alt = '';
    cover.loading = 'lazy';
    frame.append(fallback, cover);

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
    } else {
      media.alt = '';
      media.loading = 'lazy';
      media.addEventListener('error', () => { media.hidden = true; });
    }
    frame.append(media);
    if (media instanceof HTMLVideoElement) setupPreviewVideo(media);
    const context = document.createElement('div');
    context.className = 'search-result-context';
    context.textContent = `${demo.groupName} / ${demo.categoryName} · @${demo.author.handle}`;
    const description = document.createElement('p');
    description.className = 'line-clamp-2';
    description.textContent = demo.description;
    link.append(frame, context, description);
    return link;
  };
  input?.addEventListener('input', async () => {
    if (!searchDialog || !searchResults || !searchStatus || !searchEmpty) return;
    const query = input.value.trim().toLowerCase();
    const lang = getLang();
    searchResults.querySelectorAll<HTMLVideoElement>('video').forEach((video) => videoObserver.unobserve(video));

    if (!query) {
      searchResults.replaceChildren();
      const { demos } = await loadDemos();
      if (lang === 'zh') {
        searchStatus.textContent = `搜索 ${demos.length || '全部'} 个用例`;
        searchEmpty.textContent = '输入关键词以查找用例。';
      } else if (lang === 'ja') {
        searchStatus.textContent = `${demos.length || 'すべての'}事例を検索`;
        searchEmpty.textContent = 'キーワードを入力して事例を検索します。';
      } else {
        searchStatus.textContent = `Search ${demos.length || 'all'} use cases`;
        searchEmpty.textContent = 'Start typing to find a use case.';
      }
      searchEmpty.hidden = false;
      return;
    }

    searchStatus.textContent = lang === 'zh' ? '搜索中…' : lang === 'ja' ? '検索中…' : 'Searching…';
    const { demos } = await loadDemos();
    if (input.value.trim().toLowerCase() !== query) return;

    const matches = demos.filter((demo) =>
      `${demo.description} ${demo.author.name} ${demo.author.handle} ${demo.categoryName} ${demo.groupName}`.toLowerCase().includes(query),
    );
    const resultLimit = matchMedia('(max-width: 760px)').matches ? 12 : 16;
    const visible = matches.slice(0, resultLimit);
    searchResults.replaceChildren(...visible.map(createSearchResult));
    if (lang === 'zh') {
      searchStatus.textContent = `找到 ${matches.length} 个用例${matches.length > visible.length ? ` · 显示前 ${visible.length} 个` : ''}`;
      searchEmpty.textContent = '未找到匹配的用例。';
    } else if (lang === 'ja') {
      searchStatus.textContent = `${matches.length} 件の事例が見つかりました${matches.length > visible.length ? ` · 最初の ${visible.length} 件を表示` : ''}`;
      searchEmpty.textContent = '該当する事例が見つかりませんでした。';
    } else {
      searchStatus.textContent = `${matches.length} use case${matches.length === 1 ? '' : 's'}${matches.length > visible.length ? ` · showing first ${visible.length}` : ''}`;
      searchEmpty.textContent = 'No use cases found.';
    }
    searchEmpty.hidden = visible.length !== 0;
  });

}

