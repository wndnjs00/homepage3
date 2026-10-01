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
2. **`index.html`:** a header with nav, mobile nav (`#burger`, `.mnav`), a search overlay (`#srch`), and `#totop`. Then `<main>` holds a set of `<section class="page" id="page-*">` elements: `home`, `mirae`, `team`, `teamDetail`, `teamProj`, `news`, `newsDetail`, `projects`, `projDetail`, `businessLine`, `blDetail`, `contact`. Then the footer. Only the page with `.is-on` is visible. `data.js` must load before `app.js`.
3. **`js/data.js`:** top-level `var NEWS`, `PROJECTS` and `BL`, which are globals read by `app.js`. `NEWS` has `id`, `date`, `tag`, `ttl`, `body[]`, and optional `img` (news detail image; without it a placeholder from `NEWS_IMG` in `app.js` is used). `PROJECTS` has `t`, `d`, `y`, `c` (sector), `k` (SI/ITO/Solution), `s`, `cl`, and optional `p` (period) and `ov` (overview). `BL` holds business lines keyed `ito`/`si`/`infra`/`solution`, with `secs[]`. `TEAMS` (keys `ceo`/`ito`/`si`/`infra`/`solution`/`lab`) drives the team detail page. The CEO entry has `bio[]`, the team entries have `intro[]`/`funcs[]`/`caps[]`, and every entry has `prj[]` (Related Projects, 5 shown, then a 더보기 button). The team `prj` lists are placeholders picked from `PROJECTS`. A `prj` row whose `t` matches a `PROJECTS` title links to that project's detail (`#/business/projects/:index`); only team-only rows use `#/company/team/:key/:index` (`renderTeamProj`). Both detail pages are built by the shared `projHead`/`projBody` (image, Project Overview `ov`, Description `desc`, side box Type/Status/Name/Period/Client), so edit project detail content in `PROJECTS`; missing fields show the placeholder "설명이 들어갈 내용입니다.". An empty `prj` (the `lab` team) shows a "준비하고 있습니다" notice instead of the list. To add or edit news, projects or business-line content, change this file, not the HTML. Lists, filters, home news, search and detail pages all render from it.
4. **`js/app.js` (one IIFE):**
   - **Hash router.** `route()` maps `#/`, `#/company/{mirae,team[/:key[/:index]],news[/:id]}`, `#/business/{projects[/:index],business-line[/:key]}` and `#/contact` to a page id. `show()` toggles `.is-on` and re-runs `observeReveals()`. Project detail routes use the **array index** of `PROJECTS`, so reordering or inserting projects changes their URLs.
   - Renderers (`renderNews`, `renderProjects`, `renderBL`, `render*Detail`) build HTML strings. Escape any data you interpolate with `esc()`. Internal links carry `data-nav` so the mobile nav closes on click.
   - Filters are derived automatically from the data: news by year. Project filters are a fixed list (`PROJ_FILTERS` in `app.js`): Type (`k`), Industry (`c`), Status (`s`); a `PROJECTS` value outside those lists only shows under 전체.
   - Scroll effects: `.reveal` elements get `.is-in` through an IntersectionObserver. `.nums b[data-count]` elements animate as counters (`data-plain="1"` turns off zero-padding).

## Content constraints

- Content is meant to reflect only MRINT's publicly posted information. Where real detail is missing, the page shows the placeholder "설명이 들어갈 내용입니다." instead of invented text (project detail fields without data). Project Period (`p`) values are currently arbitrary placeholder dates set at the user's request. Don't fabricate client, project or news details to fill those gaps.
- The contact form is non-functional by design (`onsubmit="return false"`, labeled "시안이므로 실제 전송은 되지 않습니다").

## Known quirk

In `route()`, `document.title = title` runs after the detail renderers, which overwrites the per-item titles that `renderNewsDetail` and `renderBLDetail` set. (`renderProjDetail` and `renderTeamProj` avoid this by returning their title to `route()`.)
