# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A design mockup (시안) of the renewed MRINT (미래아이엔텍, financial-IT services company) homepage. The entire site is **one self-contained file**: `mrint-homepage-renewalsss.html` (~590 KB, ~1600 lines). There is no build system, package manager, linter, or test suite, and the folder is not a git repo.

To preview, open the file in a browser (or serve the folder with any static server, e.g. `python -m http.server`). Navigate with hash URLs such as `#/business/projects`.

## Working with the file

- The file is large because of inline base64 images (`data:image/...`), such as the logo on lines ~489 and ~1202, the hero image, and the team image. Those lines are huge. Don't Read the whole file at once. Grep for anchors (`id="page-`, `function `, `var NEWS`) and read by line range instead.
- Keep everything inline. The only external dependencies are the Pretendard font (jsdelivr CDN) and the Business Line and project detail images, which are hot-linked from `sspark.genspark.ai`.
- Output is Korean-first. Keep the existing tone, and keep `word-break:keep-all` typography in mind.

## Architecture

The file has three layers in order:

1. **`<style>` design system (top of file):** CSS custom properties on `:root` (`--navy`, `--midnight`, `--blue`, `--cyan`, `--gray`, `--text`, `--ink-60/40`, `--hair`, `--mono`, `--wrap`, `--gut`, `--ease`) plus utility and component classes (`.wrap`, `.sec`, `.sec--dark/gray/mid`, `.h-xl/.h-lg/.h-md`, `.btn--blue/line/sm`, `.chip`, `.reveal`, `.dtl`, `.dtl__body`, `.dtl__side`, …). A second small `<style>` block just before the script adds `.stack`, `.frm` (contact form) and `.fgrp` (filter groups). Reuse these tokens and classes instead of adding new colors.
2. **Markup:** a header with nav, mobile nav (`#burger`), a search overlay (`#srch`), and `#totop`. Then `<main>` holds a set of `<section class="page" id="page-*">` elements: `home`, `mirae`, `team`, `news`, `newsDetail`, `projects`, `projDetail`, `businessLine`, `blDetail`, `contact`. Then the footer. Only the page with `.is-on` is visible.
3. **Script (bottom, one IIFE):**
   - **Data arrays are the content source.** `NEWS` (`id`, `date`, `tag`, `ttl`, `body[]`), `PROJECTS` (`t`, `d`, `y`, `c` = sector, `k` = SI/ITO/Solution, `s`, `cl`, optional `p` = period and `ov` = overview), and `BL` (business lines keyed `ito`/`si`/`infra`/`solution` with `secs[]`). To add or edit news, projects or business-line content, change these arrays, not the HTML. Lists, filters, home news, search and detail pages all render from them.
   - **Hash router.** `route()` maps `#/`, `#/company/{mirae,team,news[/:id]}`, `#/business/{projects[/:index],business-line[/:key]}` and `#/contact` to a page id. `show()` toggles `.is-on` and re-runs `observeReveals()`. Project detail routes use the **array index** of `PROJECTS`, so reordering or inserting projects changes their URLs.
   - Renderers (`renderNews`, `renderProjects`, `renderBL`, `render*Detail`) build HTML strings. Escape any data you interpolate with `esc()`. Internal links carry `data-nav` so the mobile nav closes on click.
   - Filters are derived automatically from the data: news by year, projects by `c` and `k`.
   - Scroll effects: `.reveal` elements get `.is-in` through an IntersectionObserver. `.nums b[data-count]` elements animate as counters (`data-plain="1"` turns off zero-padding).

## Content constraints

- Content is meant to reflect only MRINT's publicly posted information. Where real detail is missing, the page shows explicit `※ 안내` placeholder notes instead of invented text (news bodies, project overviews without `ov`). Don't fabricate client, project or news details to fill those gaps.
- The contact form is non-functional by design (`onsubmit="return false"`, labeled "시안이므로 실제 전송은 되지 않습니다").

## Saved-from-Cloudflare artifacts

The file was saved from a Cloudflare-served page, so it contains:
- Emails obfuscated as `<a class="__cf_email__" data-cfemail=...>` that depend on `/cdn-cgi/scripts/.../email-decode.min.js`. That script doesn't exist locally, so emails render as "[email protected]". The real address is `mrint01@mrint.co.kr`. Replace these with plain `mailto:` links if editing them.
- A Cloudflare Insights beacon `<script>` at the end of `<body>`.

## Known quirk

In `route()`, `document.title = title` runs after the detail renderers, which overwrites the per-item titles that `renderNewsDetail`, `renderProjDetail` and `renderBLDetail` set.
