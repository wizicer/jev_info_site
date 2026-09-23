export const LOCALES = ['en', 'zh', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  ja: '日本語',
};

export const LOCALE_SHORT_LABELS: Record<Locale, string> = {
  en: 'EN',
  zh: '中',
  ja: '日',
};

export interface UIStrings {
  common: {
    search: string;
    searchShortcut: string;
    searchAria: string;
    themeToggleAria: string;
    menuToggleAria: string;
    githubTooltip: string;
    comingSoon: string;
    backToHome: string;
  };
  searchDialog: {
    title: string;
    closeAria: string;
    placeholder: string;
    statusCount: (count: number) => string;
    emptyPrompt: string;
    noResults: string;
  };
  nav: {
    home: string;
    useCases: string;
    tools: string;
    models: string;
    information: string;
  };
  footer: {
    tagline: string;
    stayUpdated: string;
    emailPlaceholder: string;
    subscribeAria: string;
    emailNote: string;
    quickLinks: string;
    about: string;
    contact: string;
    github: string;
    information: string;
    sponsor: string;
    terms: string;
    reportBug: string;
    contactUs: string;
    copyrightNotice: string;
    copyright: string;
  };
  home: {
    eyebrow: string;
    title: string;
    searchPlaceholder: string;
    searchAction: string;
    browseAll: string;
    latestAdditions: string;
    recentTitle: string;
  };
  useCases: {
    title: string;
    subtitle: string;
    curationSummary: (ingestion: string, screened: string, curated: string) => string;
    backToAll: string;
    examplesCount: (count: number) => string;
    groupStats: (subcategories: number, cases: number) => string;
    viewAll: string;
    originalPost: string;
    loadingPost: string;
    openOnX: string;
    postUnavailable: string;
    closeDetails: string;
    published: string;
    source: string;
    viewOriginalPost: string;
  };
  tools: {
    eyebrow: string;
    title: string;
    description: string;
    searchPlaceholder: string;
    searchAria: string;
    countSummary: (count: number) => string;
    starsLabel: string;
    forksLabel: string;
    emptyState: string;
    openRepoAria: (name: string) => string;
  };
  models: {
    eyebrow: string;
    title: string;
    description: string;
    countSummary: (count: number) => string;
    likesLabel: string;
    openOnHf: string;
    openOnHfAria: (name: string) => string;
    dialogEyebrow: string;
    dialogCloseAria: string;
    dialogSource: string;
    dialogLikes: string;
  };
  information: {
    eyebrow: string;
    title: string;
    description: string;
    sectionAboutNumber: string;
    sectionAboutTitle: string;
    sectionResourcesNumber: string;
    sectionResourcesTitle: string;
    animation: {
      by: string;
      step1: string;
      step2: string;
      traditionalLlm: string;
      jev: string;
      modeSequential: string;
      modeParallel: string;
      promptSample: string;
      llmGenerate: string;
      jevEvaluate: string;
      llmSub: string;
      llmFooter: string;
      llmStatus: string;
      jevFooter: string;
      jevEvaluating: string;
      jevReady: string;
      timeHeading: string;
      timeSub: string;
      timeStart: string;
      timeComplete: string;
      timeGenerating: string;
    };
  };
  sponsor: {
    eyebrow: string;
    title: string;
    description: string;
    lede: string;
    fundTitle: string;
    fundDesc: string;
    contactTitle: string;
    contactDesc: string;
    contactAction: string;
  };
  terms: {
    eyebrow: string;
    title: string;
    description: string;
    lede: string;
    communityTitle: string;
    communityDesc: string;
    contentTitle: string;
    contentDesc: string;
    externalTitle: string;
    externalDesc: string;
    warrantyTitle: string;
    warrantyDesc: string;
    changesTitle: string;
    changesDesc: string;
    askAction: string;
  };
  recipes: {
    title: string;
    description: string;
  };
  benchmarks: {
    title: string;
    description: string;
  };
  notFound: {
    eyebrow: string;
    title: string;
    description: string;
    back: string;
  };
}

export const ui: Record<Locale, UIStrings> = {
  en: {
    common: {
      search: 'Search',
      searchShortcut: '⌘K',
      searchAria: 'Search use cases (Press ⌘K or /)',
      themeToggleAria: 'Change color theme',
      menuToggleAria: 'Open menu',
      githubTooltip: 'View project on GitHub',
      comingSoon: 'Coming soon',
      backToHome: 'Back to home',
    },
    searchDialog: {
      title: 'Search use cases',
      closeAria: 'Close search',
      placeholder: 'Search descriptions, authors, or categories…',
      statusCount: (count: number) => `Search ${count} use cases`,
      emptyPrompt: 'Start typing to find a use case.',
      noResults: 'No matching use cases found.',
    },
    nav: {
      home: 'Home',
      useCases: 'Use Cases',
      tools: 'Tools',
      models: 'Models',
      information: 'Information',
    },
    footer: {
      tagline: 'A community index collecting people, projects, and real-world use cases around Jev.',
      stayUpdated: 'Stay updated',
      emailPlaceholder: 'Email updates coming soon',
      subscribeAria: 'Subscriptions are coming soon',
      emailNote: 'Email updates are coming soon.',
      quickLinks: 'Quick links',
      about: 'About',
      contact: 'Contact',
      github: 'GitHub',
      information: 'Information',
      sponsor: 'Sponsor',
      terms: 'Terms & Conditions',
      reportBug: 'Report bug',
      contactUs: 'Contact us',
      copyrightNotice: 'Content links to original posts. Copyright belongs to the respective authors.',
      copyright: '© 2026 jev.info',
    },
    home: {
      eyebrow: 'A community index',
      title: 'The index of Jev projects and use cases.',
      searchPlaceholder: 'What are you looking for?',
      searchAction: 'Search',
      browseAll: 'Browse all use cases',
      latestAdditions: 'Latest additions',
      recentTitle: 'Recent',
    },
    useCases: {
      title: 'Use cases',
      subtitle: 'Real-world examples of fast, typed decisions.',
      curationSummary: (ingestion, screened, curated) => `We collected ${ingestion} demos, screened ${screened}, and curated ${curated} use cases for this catalog.`,
      backToAll: '← All use cases',
      examplesCount: (count: number) => `${count} examples`,
      groupStats: (subcategories: number, cases: number) => `${subcategories} subcategories · ${cases} use cases`,
      viewAll: 'View all',
      originalPost: 'Original post',
      loadingPost: 'Loading original post…',
      openOnX: 'Open on X ↗',
      postUnavailable: 'Original post unavailable · Showing preview',
      closeDetails: 'Close details',
      published: 'Published',
      source: 'Source',
      viewOriginalPost: 'View original post ↗',
    },
    tools: {
      eyebrow: 'OPEN-SOURCE CATALOG',
      title: 'Tools',
      description: 'Browse community tools built with Jev. Ranked by GitHub stars, then forks, then name.',
      searchPlaceholder: 'Search tools…',
      searchAria: 'Search tools',
      countSummary: (count: number) => `${count} tools`,
      starsLabel: 'GitHub stars',
      forksLabel: 'GitHub forks',
      emptyState: 'No tools match that search.',
      openRepoAria: (name: string) => `Open ${name} repository`,
    },
    models: {
      eyebrow: 'MODEL CATALOG',
      title: 'Models',
      description: 'Models in the Jev ecosystem.',
      countSummary: (count: number) => `${count} models`,
      likesLabel: 'Hugging Face likes',
      openOnHf: 'Open on Hugging Face ↗',
      openOnHfAria: (name: string) => `Open ${name} on Hugging Face`,
      dialogEyebrow: 'MODEL',
      dialogCloseAria: 'Close model details',
      dialogSource: 'Source',
      dialogLikes: 'Likes',
    },
    information: {
      eyebrow: 'REFERENCE',
      title: 'Information',
      description: 'References and community resources for the Jev ecosystem.',
      sectionAboutNumber: '01 / ABOUT JEV',
      sectionAboutTitle: 'Traditional LLM generation vs. Jev evaluation.',
      sectionResourcesNumber: '02 / ECOSYSTEM DIRECTORY',
      sectionResourcesTitle: 'Community directories, tutorials, and deep dives.',
      animation: {
        by: 'by',
        step1: '1',
        step2: '2',
        traditionalLlm: 'Traditional LLM',
        jev: 'Jev',
        modeSequential: 'SEQUENTIAL',
        modeParallel: 'PARALLEL',
        promptSample: '“The deploy failed twice. Customers see 500s.”',
        llmGenerate: 'GENERATE',
        jevEvaluate: 'EVALUATE',
        llmSub: 'ONE TOKEN FOLLOWS ANOTHER',
        llmFooter: 'Generate text first, then parse it.',
        llmStatus: 'Generating…',
        jevFooter: 'Each answer distribution sums to 1.',
        jevEvaluating: 'Evaluating…',
        jevReady: '4 decisions ready',
        timeHeading: 'Relative completion time',
        timeSub: 'Conceptual animation, not benchmark data',
        timeStart: 'start',
        timeComplete: 'complete',
        timeGenerating: 'generating',
      },
    },
    sponsor: {
      eyebrow: 'Project',
      title: 'Sponsor jev.info',
      description: 'Support the jev.info community index.',
      lede: 'jev.info is a community index. Sponsorship options are being prepared.',
      fundTitle: 'What support will fund',
      fundDesc: 'Hosting, data maintenance, media delivery, translation, and the ongoing work required to keep the use case archive accurate and accessible.',
      contactTitle: 'Get in touch',
      contactDesc: 'Until a sponsorship program is available, you can open a contact request in the project repository.',
      contactAction: 'Contact the project ↗',
    },
    terms: {
      eyebrow: 'Last updated · September 19, 2026',
      title: 'Terms & Conditions',
      description: 'Terms and conditions for using jev.info.',
      lede: 'These interim terms describe the basic conditions for using jev.info while the project is under development.',
      communityTitle: 'Community project',
      communityDesc: 'jev.info is a community index and is not an official Jev website. Information is provided for reference and may change as the underlying projects evolve.',
      contentTitle: 'Content and attribution',
      contentDesc: 'Posts, media, names, trademarks, and other third-party material remain the property of their respective owners. jev.info links to original sources whenever available.',
      externalTitle: 'External links',
      externalDesc: 'The site links to third-party services, including GitHub and X. We do not control their availability, content, or privacy practices.',
      warrantyTitle: 'No warranty',
      warrantyDesc: 'The site is provided as-is without warranties of accuracy, completeness, availability, or fitness for a particular purpose.',
      changesTitle: 'Changes and questions',
      changesDesc: 'These terms may be updated as the project develops. Questions can be submitted through the project’s GitHub issue tracker.',
      askAction: 'Ask a question ↗',
    },
    recipes: {
      title: 'Recipes — jev.info',
      description: 'Practical patterns and implementation guides for Jev.',
    },
    benchmarks: {
      title: 'Benchmarks — jev.info',
      description: 'Measured performance, cost, and quality comparisons for Jev.',
    },
    notFound: {
      eyebrow: '404',
      title: 'Page not found',
      description: 'The page you are looking for does not exist or has been moved.',
      back: 'Back to home',
    },
  },
  zh: {
    common: {
      search: '搜索',
      searchShortcut: '⌘K',
      searchAria: '搜索应用案例 (按 ⌘K 或 /)',
      themeToggleAria: '切换色彩主题',
      menuToggleAria: '打开菜单',
      githubTooltip: '在 GitHub 上查看项目',
      comingSoon: '即将推出',
      backToHome: '返回首页',
    },
    searchDialog: {
      title: '搜索应用案例',
      closeAria: '关闭搜索',
      placeholder: '搜索案例描述、作者或分类…',
      statusCount: (count: number) => `在 ${count} 个案例中搜索`,
      emptyPrompt: '输入关键词以查找应用案例。',
      noResults: '未找到匹配的应用案例。',
    },
    nav: {
      home: '首页',
      useCases: '应用场景',
      tools: '工具库',
      models: '模型库',
      information: '资料背景',
    },
    footer: {
      tagline: '收集围绕 Jev 的生态人物、开源项目与真实落地场景的社区索引。',
      stayUpdated: '保持关注',
      emailPlaceholder: '邮件订阅即将上线',
      subscribeAria: '订阅功能即将上线',
      emailNote: '邮件动态订阅即将上线，敬请期待。',
      quickLinks: '快捷链接',
      about: '关于我们',
      contact: '联系反馈',
      github: 'GitHub',
      information: '资料背景',
      sponsor: '赞助支持',
      terms: '使用条款',
      reportBug: '反馈问题',
      contactUs: '联系我们',
      copyrightNotice: '内容链接至原始动态。版权归原作者所有。',
      copyright: '© 2026 jev.info',
    },
    home: {
      eyebrow: '社区精选索引',
      title: 'Jev 实践项目与应用场景全景索引。',
      searchPlaceholder: '你在寻找什么应用案例？',
      searchAction: '搜索',
      browseAll: '浏览全部案例',
      latestAdditions: '最新收录',
      recentTitle: '近期精选',
    },
    useCases: {
      title: '应用场景',
      subtitle: '快速、类型化决策的真实落地案例与实战代码。',
      curationSummary: (ingestion, screened, curated) => `我们收集了 ${ingestion} 个演示，筛选了其中 ${screened} 个，最终精选 ${curated} 个应用案例收录于此。`,
      backToAll: '← 全部应用场景',
      examplesCount: (count: number) => `${count} 个案例`,
      groupStats: (subcategories: number, cases: number) => `${subcategories} 个子分类 · ${cases} 个案例`,
      viewAll: '查看全部',
      originalPost: '原始动态',
      loadingPost: '正在加载原动态…',
      openOnX: '在 X 上查看 ↗',
      postUnavailable: '原动态暂无法嵌入 · 正在展示预览',
      closeDetails: '关闭详情',
      published: '发布时间',
      source: '来源',
      viewOriginalPost: '查看原推文 ↗',
    },
    tools: {
      eyebrow: '开源目录',
      title: '工具生态',
      description: '探索基于 Jev 构建的社区开源工具。默认按 GitHub Stars、Forks 及名称排序。',
      searchPlaceholder: '搜索工具…',
      searchAria: '搜索工具',
      countSummary: (count: number) => `共 ${count} 个工具`,
      starsLabel: 'GitHub Stars',
      forksLabel: 'GitHub Forks',
      emptyState: '没有找到匹配的工具。',
      openRepoAria: (name: string) => `打开 ${name} 仓库`,
    },
    models: {
      eyebrow: '模型目录',
      title: '模型库',
      description: 'Jev 生态中的开源决策模型与权重。',
      countSummary: (count: number) => `共 ${count} 个模型`,
      likesLabel: 'Hugging Face 点赞数',
      openOnHf: '在 Hugging Face 查看 ↗',
      openOnHfAria: (name: string) => `在 Hugging Face 上打开 ${name}`,
      dialogEyebrow: '模型详情',
      dialogCloseAria: '关闭模型详情',
      dialogSource: '来源',
      dialogLikes: '喜欢数',
    },
    information: {
      eyebrow: '背景与资料',
      title: '资料与背景',
      description: 'Jev 生态的核心参考资料与社区精选导航。',
      sectionAboutNumber: '01 / 关于 JEV',
      sectionAboutTitle: '传统 LLM 文本生成 vs. Jev 并行决策评估。',
      sectionResourcesNumber: '02 / 生态导航',
      sectionResourcesTitle: '社区精选目录、深度教程与技术解析。',
      animation: {
        by: '作者',
        step1: '1',
        step2: '2',
        traditionalLlm: '传统 LLM',
        jev: 'Jev 决策模型',
        modeSequential: '串行生成',
        modeParallel: '并行评估',
        promptSample: '“部署失败了两次，用户正在遭遇 500 报错。”',
        llmGenerate: '文本生成',
        jevEvaluate: '并行评估',
        llmSub: '逐字顺序生成 (ONE TOKEN FOLLOWS ANOTHER)',
        llmFooter: '必须先完整生成文本，再进行提取与解析。',
        llmStatus: '生成中…',
        jevFooter: '每个选项的答案概率分布总和为 1。',
        jevEvaluating: '评估中…',
        jevReady: '4 个决策就绪',
        timeHeading: '相对完成耗时对比',
        timeSub: '概念演示动画，非真实基准测试数据',
        timeStart: '开始',
        timeComplete: '完成',
        timeGenerating: '生成中',
      },
    },
    sponsor: {
      eyebrow: '项目支持',
      title: '赞助 jev.info',
      description: '支持 jev.info 社区索引的持续维护。',
      lede: 'jev.info 是一个公益性质的社区索引，赞助方案正在筹备中。',
      fundTitle: '资金将用于什么',
      fundDesc: '服务器托管、数据抓取与维护、媒体资源分发、多语言翻译，以及保障案例库长期准确与可访问的日常工作。',
      contactTitle: '与我们联系',
      contactDesc: '在正式赞助计划上线前，您可以直接在项目仓库中提交联系请求。',
      contactAction: '联系项目组 ↗',
    },
    terms: {
      eyebrow: '最近更新 · 2026年9月19日',
      title: '使用条款与声明',
      description: 'jev.info 网站的使用条款与免责声明。',
      lede: '这些临时条款说明了在项目开发和试运行期间使用 jev.info 的基本规范。',
      communityTitle: '社区项目声明',
      communityDesc: 'jev.info 是一个非官方的社区索引站点。所有信息仅供技术参考，可能随着上游项目的演进而更新。',
      contentTitle: '内容与知识产权',
      contentDesc: '引用的推文、视频、图片、名称与商标均属于其各自的版权所有者。jev.info 尽可能保留并链接至原始来源。',
      externalTitle: '外部链接',
      externalDesc: '本站包含指向 GitHub、X (Twitter) 等第三方服务的链接。我们无法控制其可用性、内容或隐私政策。',
      warrantyTitle: '免责声明',
      warrantyDesc: '本站内容按“现状”提供，不包含对准确性、完整性、实时性或特定用途适用性的明示或暗示保证。',
      changesTitle: '条款变更与联系',
      changesDesc: '这些条款可能会随着网站的完善而更新。如有疑问，可通过 GitHub Issue 提交咨询。',
      askAction: '提出疑问 ↗',
    },
    recipes: {
      title: '实用方案 — jev.info',
      description: 'Jev 实用架构范式与实战集成指南。',
    },
    benchmarks: {
      title: '性能基准 — jev.info',
      description: 'Jev 的实测性能、成本与质量横向对比数据。',
    },
    notFound: {
      eyebrow: '404',
      title: '页面未找到',
      description: '您访问的页面不存在或已被移除。',
      back: '返回首页',
    },
  },
  ja: {
    common: {
      search: '検索',
      searchShortcut: '⌘K',
      searchAria: 'ユースケースを検索 (⌘K または /)',
      themeToggleAria: 'テーマを切り替える',
      menuToggleAria: 'メニューを開く',
      githubTooltip: 'GitHub でプロジェクトを表示',
      comingSoon: '近日公開',
      backToHome: 'ホームに戻る',
    },
    searchDialog: {
      title: 'ユースケースを検索',
      closeAria: '検索を閉じる',
      placeholder: '説明、作者、カテゴリーを検索…',
      statusCount: (count: number) => `${count} 件の事例から検索`,
      emptyPrompt: 'キーワードを入力してユースケースを検索。',
      noResults: '一致するユースケースが見つかりませんでした。',
    },
    nav: {
      home: 'ホーム',
      useCases: 'ユースケース',
      tools: 'ツール',
      models: 'モデル',
      information: '情報',
    },
    footer: {
      tagline: 'Jev を取り巻くコミュニティ、オープンソースプロジェクト、実践的な活用事例を集約したインデックス。',
      stayUpdated: '最新情報を受け取る',
      emailPlaceholder: 'メール配信は近日公開',
      subscribeAria: '購読機能は準備中です',
      emailNote: 'メールによる最新情報の配信は近日公開予定です。',
      quickLinks: 'クイックリンク',
      about: 'このサイトについて',
      contact: 'お問い合わせ',
      github: 'GitHub',
      information: '情報',
      sponsor: 'スポンサー',
      terms: '利用規約',
      reportBug: 'バグを報告',
      contactUs: 'お問い合わせ',
      copyrightNotice: 'コンテンツは元の投稿にリンクしています。著作権は各作者に帰属します。',
      copyright: '© 2026 jev.info',
    },
    home: {
      eyebrow: 'コミュニティインデックス',
      title: 'Jev プロジェクトとユースケースの全景インデックス。',
      searchPlaceholder: '何をお探しですか？',
      searchAction: '検索',
      browseAll: 'すべてのユースケースを見る',
      latestAdditions: '新着事例',
      recentTitle: '最近の追加',
    },
    useCases: {
      title: 'ユースケース',
      subtitle: '高速な型付き意思決定の実際の導入事例。',
      curationSummary: (ingestion, screened, curated) => `${ingestion} 件のデモを収集し、${screened} 件を精査して、${curated} 件のユースケースをこのカタログに厳選しました。`,
      backToAll: '← すべてのユースケース',
      examplesCount: (count: number) => `${count} 件の事例`,
      groupStats: (subcategories: number, cases: number) => `${subcategories} 個のサブカテゴリー · ${cases} 件の事例`,
      viewAll: 'すべて見る',
      originalPost: '元の投稿',
      loadingPost: '元の投稿を読み込み中…',
      openOnX: 'X で見る ↗',
      postUnavailable: '元の投稿を表示できません · プレビューを表示中',
      closeDetails: '詳細を閉じる',
      published: '公開日',
      source: 'ソース',
      viewOriginalPost: '元の投稿を表示 ↗',
    },
    tools: {
      eyebrow: 'オープンソースカタログ',
      title: 'ツール',
      description: 'Jev を活用したオープンソースツール。GitHub Stars、Forks、名前順で表示。',
      searchPlaceholder: 'ツールを検索…',
      searchAria: 'ツールを検索',
      countSummary: (count: number) => `${count} 件のツール`,
      starsLabel: 'GitHub スター',
      forksLabel: 'GitHub フォーク',
      emptyState: '一致するツールが見つかりませんでした。',
      openRepoAria: (name: string) => `${name} のリポジトリを開く`,
    },
    models: {
      eyebrow: 'モデルカタログ',
      title: 'モデル',
      description: 'Jev エコシステムにおけるモデル一覧。',
      countSummary: (count: number) => `${count} 件のモデル`,
      likesLabel: 'Hugging Face いいね数',
      openOnHf: 'Hugging Face で開く ↗',
      openOnHfAria: (name: string) => `Hugging Face で ${name} を開く`,
      dialogEyebrow: 'モデル詳細',
      dialogCloseAria: '詳細を閉じる',
      dialogSource: 'ソース',
      dialogLikes: 'いいね数',
    },
    information: {
      eyebrow: 'リファレンス',
      title: '情報',
      description: 'Jev エコシステムの参考資料とコミュニティリソース。',
      sectionAboutNumber: '01 / JEV について',
      sectionAboutTitle: '従来の LLM 生成 vs. Jev 評価。',
      sectionResourcesNumber: '02 / エコシステムディレクトリ',
      sectionResourcesTitle: 'コミュニティディレクトリ、チュートリアル、解説記事。',
      animation: {
        by: '作成者',
        step1: '1',
        step2: '2',
        traditionalLlm: '従来の LLM',
        jev: 'Jev モデル',
        modeSequential: '順次生成',
        modeParallel: '並列評価',
        promptSample: '“デプロイが2回失敗しました。ユーザーに500エラーが表示されています。”',
        llmGenerate: 'テキスト生成',
        jevEvaluate: '並列評価',
        llmSub: 'トークンを1つずつ順番に生成',
        llmFooter: 'テキストを最後まで生成してからパースが必要。',
        llmStatus: '生成中…',
        jevFooter: '各回答の確率分布の合計は 1 になります。',
        jevEvaluating: '評価中…',
        jevReady: '4件の決定が完了',
        timeHeading: '相対完了時間の比較',
        timeSub: '概念アニメーションであり、ベンチマークデータではありません',
        timeStart: '開始',
        timeComplete: '完了',
        timeGenerating: '生成中',
      },
    },
    sponsor: {
      eyebrow: 'プロジェクト支援',
      title: 'jev.info をスポンサー',
      description: 'jev.info コミュニティインデックスを支援する。',
      lede: 'jev.info はコミュニティインデックスです。現在スポンサー枠を準備中です。',
      fundTitle: '支援金の使途',
      fundDesc: 'ホスティング費用、データ保守、メディア配信、翻訳、アーカイブの品質向上と正確性の維持に活用されます。',
      contactTitle: 'お問い合わせ',
      contactDesc: '公式プログラム開始までは、GitHub リポジトリからお問い合わせいただけます。',
      contactAction: 'プロジェクトに連絡 ↗',
    },
    terms: {
      eyebrow: '最終更新日 · 2026年9月19日',
      title: '利用規約',
      description: 'jev.info の利用規約。',
      lede: '本規約は、開発中の jev.info の基本的な利用条件を定めるものです。',
      communityTitle: 'コミュニティプロジェクト',
      communityDesc: 'jev.info は非公式のコミュニティインデックスです。情報は参考目的で提供されており、上游プロジェクトの変更に伴い更新される場合があります。',
      contentTitle: 'コンテンツと帰属',
      contentDesc: '掲載されている投稿、メディア、商標等はそれぞれの所有者に帰属します。可能な限り元のソースへリンクしています。',
      externalTitle: '外部リンク',
      externalDesc: 'GitHub や X などの第三者サービスへのリンクが含まれます。外部サイトの可用性やプライバシー慣行について当社は管理しません。',
      warrantyTitle: '無保証',
      warrantyDesc: '本サイトは現状有姿で提供され、正確性、完全性、特定目的への適合性についていかなる保証も行いません。',
      changesTitle: '変更と問い合わせ',
      changesDesc: '規約は必要に応じて改定されます。ご不明な点は GitHub Issue よりお問い合わせください。',
      askAction: '質問を投稿 ↗',
    },
    recipes: {
      title: 'レシピ — jev.info',
      description: 'Jev の実践的なパターンと実装ガイド。',
    },
    benchmarks: {
      title: 'ベンチマーク — jev.info',
      description: 'Jev の実測パフォーマンス、コスト、精度の比較。',
    },
    notFound: {
      eyebrow: '404',
      title: 'ページが見つかりません',
      description: 'お探しのページは存在しないか、移動した可能性があります。',
      back: 'ホームに戻る',
    },
  },
};
