# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A design mockup (시안) of the renewed MRINT (미래아이엔텍, financial-IT services company) homepage, being carried forward into real development. It is a static site with no build system, package manager, linter, or test suite.

```
index.html          HTML structure only
css/style.css       all styles
js/data.js          content data (NEWS, PROJECTS, BL)
js/app.js           router, renderers, scroll effects
images/             logo.png, hero.jpg, ceo.jpg
```

`mrint-homepage-renewalsss.html` is the original single-file version (CSS/JS inline, images as base64). It is kept only as a reference. Make changes in the split files.

To preview, open `index.html` in a browser. It works from `file://` because the scripts are classic `<script src>`, not modules. Navigate with hash URLs such as `#/business/projects`.

## Working with the files

- External dependencies: the Pretendard font (jsdelivr CDN), and the Business Line and project-detail images hot-linked from `sspark.genspark.ai` (URLs in `js/data.js` and `renderProjDetail` in `js/app.js`).
- The tiny inline `<script>` in `<head>` that sets `document.documentElement.className='js'` must stay inline and early. CSS uses the `.js` class to hide `.reveal` elements before they animate in.
- Output is Korean-first. Keep the existing tone, and keep `word-break:keep-all` typography in mind.
- Emails are plain text (`mrint01@mrint.co.kr`), matching what the live Cloudflare-served page displayed. Avoid wrapping them in `<a>` inside `.mnav`: `.mnav a` styles every link there as a large block menu item.

## Architecture

1. **`css/style.css`:** design tokens on `:root` (`--navy`, `--midnight`, `--blue`, `--cyan`, `--gray`, `--text`, `--ink-60/40`, `--hair`, `--hair-l`, `--mono`, `--wrap`, `--gut`, `--ease`) and utility/component classes (`.wrap`, `.sec`, `.sec--dark/gray/mid`, `.h-xl/.h-lg/.h-md`, `.btn--blue/line/sm`, `.chip`, `.reveal`, `.dtl`, `.dtl__body`, `.dtl__side`, …). The tail section (`.stack`, `.frm`, `.fgrp`) came from a second style block. Reuse these tokens and classes instead of adding new colors.
2. **`index.html`:** a header with nav, mobile nav (`#burger`, `.mnav`), a search overlay (`#srch`), and `#totop`. Then `<main>` holds a set of `<section class="page" id="page-*">` elements: `home`, `mirae`, `team`, `news`, `newsDetail`, `projects`, `projDetail`, `businessLine`, `blDetail`, `contact`. Then the footer. Only the page with `.is-on` is visible. `data.js` must load before `app.js`.
3. **`js/data.js`:** top-level `var NEWS`, `PROJECTS` and `BL`, which are globals read by `app.js`. `NEWS` has `id`, `date`, `tag`, `ttl`, `body[]`. `PROJECTS` has `t`, `d`, `y`, `c` (sector), `k` (SI/ITO/Solution), `s`, `cl`, and optional `p` (period) and `ov` (overview). `BL` holds business lines keyed `ito`/`si`/`infra`/`solution`, with `secs[]`. To add or edit news, projects or business-line content, change this file, not the HTML. Lists, filters, home news, search and detail pages all render from it.
4. **`js/app.js` (one IIFE):**
   - **Hash router.** `route()` maps `#/`, `#/company/{mirae,team,news[/:id]}`, `#/business/{projects[/:index],business-line[/:key]}` and `#/contact` to a page id. `show()` toggles `.is-on` and re-runs `observeReveals()`. Project detail routes use the **array index** of `PROJECTS`, so reordering or inserting projects changes their URLs.
   - Renderers (`renderNews`, `renderProjects`, `renderBL`, `render*Detail`) build HTML strings. Escape any data you interpolate with `esc()`. Internal links carry `data-nav` so the mobile nav closes on click.
   - Filters are derived automatically from the data: news by year, projects by `c` and `k`.
   - Scroll effects: `.reveal` elements get `.is-in` through an IntersectionObserver. `.nums b[data-count]` elements animate as counters (`data-plain="1"` turns off zero-padding).

## Content constraints

- Content is meant to reflect only MRINT's publicly posted information. Where real detail is missing, the page shows explicit `※ 안내` placeholder notes instead of invented text (news bodies, project overviews without `ov`). Don't fabricate client, project or news details to fill those gaps.
- The contact form is non-functional by design (`onsubmit="return false"`, labeled "시안이므로 실제 전송은 되지 않습니다").

## Known quirk

In `route()`, `document.title = title` runs after the detail renderers, which overwrites the per-item titles that `renderNewsDetail`, `renderProjDetail` and `renderBLDetail` set.
