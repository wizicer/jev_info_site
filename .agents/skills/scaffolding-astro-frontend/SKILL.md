---
name: scaffolding-astro-frontend
description: Generates production-ready Astro components, pages, and UI islands using Astro, Tailwind CSS, and optional React islands. Use when the user asks for Astro pages, layouts, content-driven sites, or interactive UI sections inside an Astro project.
---

# Building Astro Frontends

## Tech Stack Guidelines

* **Framework:** Astro v7 or later (use the latest stable version; never use an older major version)
* **Language:** TypeScript
* **Styling:** Tailwind CSS (mobile-first)
* **UI Strategy:**

  * Static UI → `.astro` components
  * Interactive UI → framework islands (React only when needed)
* **Icons:** Use `astro-icon` with a specific [Iconify icon set](https://icon-sets.iconify.design/). At initial setup, ask the user to choose an icon set; if they have no preference, default to Material Symbols.
* **Theming:** refer to `astro-theme.md` (System/Dark/Light)
* **Routing:** File-based routing (`src/pages`)

## Core Architecture Rules (Astro Model)

### 1. Default to Static Rendering

Astro is **not** a client-side SPA.

* Prefer static HTML rendered at build time.
* Do **not** default to client-side React apps.
* Only introduce interactive islands when required.

Bad:

```jsx
<App /> mounted to root
```

Good:

```astro
---
// Static layout
import Counter from "../components/Counter.tsx";
---
<h1>Welcome</h1>
<Counter client:load />
```


### 2. Islands Architecture

Use framework components **only when interactivity exists**.

| Case              | Implementation                           |
| ----------------- | ---------------------------------------- |
| Static content    | `.astro` component                       |
| Small interaction | React island with `client:*` directive   |
| Forms             | Native HTML first, React only if dynamic |
| Navigation        | Native links, not client router          |

Client directives:

* `client:load` → immediate hydration
* `client:idle` → low priority
* `client:visible` → hydrate on viewport
* `client:only="react"` → React-only island

### 3. React Usage is Optional, Not Default

If React is used:

* Use it only inside islands.
* Do not assume a global React app.
* No React Router. Astro handles routing.

### 4. Data Fetching Model

Prefer Astro server-side and build-time fetching:

* Use `fetch` in frontmatter (`---`) for build-time or SSR.
* Avoid client fetching unless UI truly needs live updates.
* No `useEffect` data fetching unless inside an interactive island.

### 5. Mandatory Build Verification

You have access to terminal tools. You **MUST** rely on build verification to ensure code integrity.

* **Install First:** Before generating/editing files, verify dependencies. If a package is missing, execute `npm install <package>` immediately.
* **Verify by Building:** After generating or modifying code, you **MUST** execute `npm run build` (or `npx astro check`) to verify the integrity of your changes.
* **Fix Errors:** If the build fails, analyze the error log, fix the code, and **retry the build** until it passes.
* **Do Not Ask:** Do not ask the user "Should I run the build?". **Just do it.**
* **Final Output:** Only present the final code after you have confirmed it compiles successfully.

## UI & Theming

* Mobile-first Tailwind usage.
* Default support for light / dark / system themes.
* No hardcoded black or white backgrounds.
* Ensure good contrast in both themes.

## UX Defaults

Even in static sites, include:

* Empty states for content-driven lists
* Loading states only inside islands
* Accessible focus and keyboard navigation

## Output Format

* Prefer full files over snippets.
* Label file paths clearly, for example:

  * `src/pages/index.astro`
  * `src/components/Hero.astro`
* Split interactive parts into separate island components.
* Content heavy part prefer markdown format.

## Execution Protocol

If the user's request involves:
1. Creating a new component
2. Modifying imports
3. Changing configuration files (astro.config.*, tailwind.config.*)

You **MUST** trigger the terminal tool to run `npx astro check` or `npm run build` before finalizing your response. Treat the build exit code `0` as the only definition of "Done".

## Source Code

### Git

Assume Git version control. Include a standard `.gitignore` for Astro + Node.
