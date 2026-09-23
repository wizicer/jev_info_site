# jev.info 多语言（i18n）技术规范

本文档为 `jev.info` 网站多语言支持的官方规范。涵盖文件组织、数据源字段映射、原文留存与变更判定算法、UI 文案管理以及多语言路由。

---

## 1. 目录结构与职责分工

所有多语言翻译数据独立存储在 `src/data/translations/` 目录下，按 ISO 639-1 语言代码进行划分。

```
src/
├── data/
│   ├── (原始生成数据，由抓取/同步工作流更新，不得直接手工编辑)
│   │   ├── awesome.json
│   │   ├── demos.json
│   │   ├── models.json
│   │   ├── repository-metrics.json
│   │   ├── site-metadata.json
│   │   ├── taxonomy.json
│   │   └── tools.json
│   │
│   └── translations/                     # [翻译数据] 由翻译脚本维护
│       ├── zh/                           # 简体中文 (Simplified Chinese)
│       │   ├── awesome.json
│       │   ├── demos.json
│       │   ├── models.json
│       │   ├── site-metadata.json
│       │   ├── taxonomy.json
│       │   └── tools.json
│       └── ja/                           # 日语 (Japanese)
│           ├── awesome.json
│           ├── demos.json
│           ├── models.json
│           ├── site-metadata.json
│           ├── taxonomy.json
│           └── tools.json
│
└── i18n/                                 # [界面文案与运行时工具]
    ├── ui.ts                             # 界面纯静态文案字典 (en / zh / ja)
    └── utils.ts                          # 语言提取、路由生成与数据回退工具函数
```

---

## 2. 原文留存与 3 状态变更判定算法 (Diff & Sync)

### 2.1 原文留存规则 (`source` 字段)
为了在“上游字符串发生变更，但唯一 ID 保持不变”的情况下准确感知内容更新，所有翻译文件中的数据项**必须同时保存原始字符串 `source`**。

示例：
```json
{
  "2100044305536889015": {
    "source": "Open-sourced Qwen-2.5-1B-RLCD achieves 5x faster on-device inference for type-safe JSON workloads...",
    "description": "开源的 Qwen-2.5-1B-RLCD 在无需重新训练的情况下，通过同时批量处理所有 JSON 键并生成类别概率，实现了设备端类型安全 JSON 工作负载 5 倍的推理加速...",
    "updatedAt": "2026-09-23T12:00:00.000Z"
  }
}
```

### 2.2 状态判定算法
翻译脚本在处理源数据项 `(item.id, item.sourceText)` 与已有翻译记录 `existing = translations[lang]?.[item.id]` 时，按以下三种状态流转：

1. **NEW（新增条目）**：
   - 判定条件：`!existing`
   - 处理逻辑：加入翻译队列，调用翻译后写入 `source: item.sourceText`、`description: 译文` 与 `updatedAt`。
2. **UP-TO-DATE（命中缓存）**：
   - 判定条件：`existing && existing.source === item.sourceText`
   - 处理逻辑：原文字符串未发生改变，保留现有翻译，跳过调用（0 额外开销）。
3. **STALE（原文更新）**：
   - 判定条件：`existing && existing.source !== item.sourceText`
   - 处理逻辑：ID 相同但原文已被上游修改，标记为过期失效，加入重译队列；重新翻译后更新 `source`、`description` 与 `updatedAt`。

---

## 3. 数据源字段映射与 JSON Schema 规范

| 数据源文件 (Source) | 翻译目标文件 (Target) | 唯一主键 (Key) | 需翻译的核心字段 | 原文保存字段 |
| :--- | :--- | :--- | :--- | :--- |
| `src/data/demos.json` | `translations/{lang}/demos.json` | `item.id`（推文 ID） | `description` | `source` |
| `src/data/taxonomy.json` | `translations/{lang}/taxonomy.json` | `group.code`<br>`category.code` | `groups[code].name`<br>`categories[code].name`<br>`categories[code].description` | `source` |
| `src/data/tools.json` | `translations/{lang}/tools.json` | `item.id`（工具 ID） | `description` | `source` |
| `src/data/models.json` | `translations/{lang}/models.json` | `item.id`（模型 ID） | `description` | `source` |
| `src/data/awesome.json` | `translations/{lang}/awesome.json` | `item.id`（资源 ID） | `description` (可选: `title`) | `source` |
| `src/data/site-metadata.json` | `translations/{lang}/site-metadata.json` | `communityResources.primary` | `primary.description` | `source` |
| `src/data/repository-metrics.json` | *(无需翻译)* | - | - | - |

### 3.1 `demos.json`
- **源文件**：`src/data/demos.json`
- **结构规范**：
  ```json
  {
    "<tweetId>": {
      "source": "<originalEnglishDescription>",
      "description": "<translatedDescription>",
      "updatedAt": "<isoTimestamp>"
    }
  }
  ```

### 3.2 `taxonomy.json`
- **源文件**：`src/data/taxonomy.json`
- **结构规范**：
  ```json
  {
    "groups": {
      "<groupCode>": {
        "source": "<originalGroupName>",
        "name": "<translatedGroupName>"
      }
    },
    "categories": {
      "<categoryCode>": {
        "source": {
          "name": "<originalCategoryName>",
          "description": "<originalCategoryDescription>"
        },
        "name": "<translatedCategoryName>",
        "description": "<translatedCategoryDescription>"
      }
    }
  }
  ```

### 3.3 `tools.json` / `models.json` / `awesome.json`
- **结构规范**：
  ```json
  {
    "<candidateId>": {
      "source": "<originalEnglishDescription>",
      "description": "<translatedDescription>",
      "updatedAt": "<isoTimestamp>"
    }
  }
  ```

---

## 4. 界面静态文案管理 (`src/i18n/ui.ts`)

非数据源驱动的界面元素由 `src/i18n/ui.ts` 集中管理。所有支持的语言必须实现 `UIStrings` 接口，保证类型安全。

涵盖模块：
1. **全局导航与通用组件**：Header, Navigation, Theme switcher, Language dropdown, Global search (⌘K), Footer.
2. **首页**：Hero 标题、副标题、分类直达胶囊、近期精选模块.
3. **案例库**：Use Cases 页面标题、卡片统计、详情对话框、来源外链提示.
4. **工具库**：Tools 页面标题、搜索过滤占位符、排序与空状态提示、Star/Fork 指标.
5. **模型库**：Models 页面说明、Hugging Face 点赞数、详情对话框.
6. **背景信息**：Information 页面章节、Jev 与传统 LLM 并行评估图表文案.
7. **辅助与政策页面**：Sponsor, Terms & Conditions, Recipes, Benchmarks, 404.

---

## 5. 数据回退原则 (Graceful Fallback)

1. **优先使用当前语言译文**：当请求某条数据且目标语言翻译存在时，展示目标语言内容。
2. **无缝回退英文**：若目标语言未翻译、条目缺失或处于失效重译状态，自动回退到英文源数据。
3. **禁止空内容与异常报错**：无论翻译文件是否就绪，页面渲染和客户端接口绝不因此发生白屏、报错或留空。

---

## 6. 路由与多语言切换规范

1. **默认语言**：英语 (`en`)，直接映射到根路径（例如 `/`, `/use-cases`, `/tools`, `/models`, `/information`）。
2. **本地化语言**：
   - 中文 (`zh`)：`/zh`, `/zh/use-cases`, `/zh/tools`, `/zh/models`, `/zh/information` 等。
   - 日语 (`ja`)：`/ja`, `/ja/use-cases`, `/ja/tools`, `/ja/models`, `/ja/information` 等。
3. **语言切换器交互**：
   - 用户在页面上切换语言时，自动保持当前路由（例如从 `/zh/tools` 切换至英文跳转到 `/tools`，切换至日文跳转到 `/ja/tools`）。
