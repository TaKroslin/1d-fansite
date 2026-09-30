# FIVE GUYS ONE DIRECTION

A Mainland China Directioner hub built on top of the archived One Direction website. Original Studio Output visual design, with several new editorial sections bolted on.

> **Unofficial fan project.** Not affiliated with One Direction, their management, or any record label. All trademarks belong to their respective owners.

---

## Open source

The site stopped updating officially on **1 October 2026**. Rather than let it disappear, the full source is released under the **MIT License**:

**<https://github.com/TaKroslin/1d-fansite>**

You are free to use, copy, modify, redesign, and build on this code — including turning it into your own fan site or personal project. You do not need to ask, and you do not need to worry that the original author will come back and ask you to stop.

Two things worth knowing before you dive in:

- **The license covers the code, not the art.** Images, text, fan works, and other third-party content on the rendered site belong to their respective rightsholders and stay under whatever terms originally applied to them. See [LICENSE](LICENSE) for the full note.
- **"Five Guys" is this project's name, not a brand you inherit.** If you fork it, use your own name and your own domain.

The site's own farewell is written up in two places: [the announcement](pages/notice.html) and [the webmaster's letter](pages/letter.html).

---

## What is in this site

**Cloned from the original One Direction site (Studio Output / Kleber / Sony Music Entertainment UK):**

- Home — hero + journal + video + news + music + moment + newsletter + gallery cover + tweet
- Music — five albums, 82 song pages, every press shot
- Journal — 21 archival posts
- Band — five members with parallax photo panels
- Tour — 433 dates from 2011–2015

**Added by FIVE GUYS ONE DIRECTION:**

- **Blog** — original essays (6 published)
- **Gallery** — five curated photo collections (70 panels across members / on-stage / behind-the-scenes / press / fan-art)
- **This Is Us** — Mainland China fan-account directory
- **About** — project statement
- **The Only Direction Home** — an original 111-chapter fan novel, serialised under `pages/blog/the-only-direction-home/`
- **Letter** — the webmaster's farewell, presented as a stack of handwritten pages that flips like paper
- **Notice** — the shutdown + open-source announcement

**Top of the home page:** the #16YearsOf1D anniversary panel, a site-introduction panel, latest posts, and entry cards for the new sections.

---

## File structure

```text
1d-fansite/
├── index.html                       # Home (hero + anniversary + intro + latest + section entries + cloned panels)
├── pages/                           # All non-home pages
│   ├── music.html                   # Album index
│   ├── journal.html                 # Cloned journal index
│   ├── band.html                    # Band members
│   ├── tour.html                    # Tour archive (433 dates)
│   ├── blog.html                    # Blog listing — auto-generated, do not hand-edit
│   ├── gallery.html                 # Gallery index
│   ├── this-is-us.html              # Fan-account directory
│   ├── about.html                   # Project statement
│   ├── notice.html                  # Shutdown + open-source announcement
│   ├── letter.html                  # The webmaster's letter (full-screen)
│   ├── shop.html                    # Locked — do not modify
│   ├── music/albums/                # 5 albums + 82 song pages
│   ├── blog/YYYY-MM-DD/<slug>/      # Essays: article.md is the source, index.html is built
│   ├── blog/the-only-direction-home/chapters/   # Novel, 111 chapters (generated)
│   └── gallery/<category>/          # members / on-stage / behind-the-scenes / press / fan-art
├── journal/YYYY-MM-DD/<slug>/       # Cloned journal posts
├── css/
│   ├── styles.css                   # Official stylesheet (minified, single line — append only)
│   ├── letter.css                   # Letter page (self-contained)
│   ├── site-notice.css              # Shutdown notice bar
│   └── larry-anniv-*.css            # Anniversary panels
├── js/
│   ├── main.js                      # Official script (Waypoints, hover-cycle, play-button, retinafy)
│   ├── letter.js / letter-data.js   # Letter page controller + the letter text
│   ├── letter-gate.js               # Shows the letter before the home page
│   ├── site-notice.js               # Notice bar controller
│   ├── translate.js                 # Bilingual EN/中文 toggle
│   └── jquery.min.js
├── images/                          # gfx / media / tour / fan art
├── assets/fonts/                    # Self-hosted CJK fonts (no external font CDN)
├── tools/                           # Build, audit, and translation scripts
├── AGENTS/                          # Working handbook: rules, methods, log
└── LICENSE
```

---

## Local preview

```bash
git clone https://github.com/TaKroslin/1d-fansite.git
cd 1d-fansite
python -m http.server 8000
# open http://localhost:8000/
```

Or use any other static server (`npx serve`, VS Code Live Server, …). There is no build step and nothing to install to *view* the site.

> The letter shows every time you land on the home page — it is not a one-off. To go straight to the home page while developing (or bookmark it to skip the letter permanently), open `http://localhost:8000/index.html?skipletter=1`.

Python is only needed for the optional maintenance scripts in `tools/` (`build_blog.py`, the audits, the font subsetter).

---

## How to add content

> **All submissions, edits, account additions, and corrections go by email to [contact@5guys1direction.asia](mailto:contact@5guys1direction.asia).** That is the only channel — there is no CMS, no comment form, no admin login. This is deliberate; the whole site is plain HTML so it can be reviewed and updated in plain text by hand.

### 1. Add a new blog post (Markdown workflow)

Blog posts are authored in Markdown and then built into static HTML — no hand-editing HTML required.

**Step 1: Create the article**

1. Create a folder: `pages/blog/YYYY-MM-DD/<slug>/`
2. Write `article.md` with front matter at the top:
   ```md
   <!--
   title: Your Post Title
   date: 2026-08-01
   slug: your-post-slug
   date_display: 1st August 2026
   author: Takion Kroslin
   header_img: ../../../../images/gfx/5guys/logo-black.png
   header_img_size: 50% contain
   header_img_position: center
   description: A one-sentence summary for SEO and cards.
   keywords: One Direction, keyword, another keyword
   og_image: ../../../../images/gfx/hero-2015-rect-lrg.jpg
   scaler: 60%
   -->
   ```
3. Write the body in plain Markdown (paragraphs separated by blank lines, `*italic*`, `**bold**`, `> blockquote`, `[links]()`).
4. For a Chinese version, add `article.zh.md` alongside it.

**Step 2: Register the post**

Add an entry to `META` and `SCALERS` in `tools/build/build_blog.py`.

**Step 3: Build**

```bash
python tools/build/build_blog.py
```

This regenerates:
- `pages/blog/YYYY-MM-DD/<slug>/index.html` — the article page
- `pages/blog.html` — the listing page
- `pages/blog/posts.json` — metadata for the home page "Latest" section

All generated HTML is pure static — no JS rendering.

### 2. Add a new gallery category

1. Create `pages/gallery/<category>/index.html`
2. Copy `pages/gallery/members/index.html` as the template
3. Update the meta, `panel-header`, `h2`, and each gallery-item panel
4. Fix the relative depth (category pages are two levels deep: `../../css/styles.css`, `../../index.html`)
5. Add a cover card to `pages/gallery.html` and bump the count badge

### 3. Add a fan account to "This Is Us"

Edit `pages/this-is-us.html` and add a `.panel-group` block with another platform card. Use any existing platform panel as the visual template; inline-style the background colour to match the platform brand, and link the `.section-name` and `h2` to the account URL.

### 4. Edit any existing page

Every page shares the same head + header + footer skeleton. Open the file, find the panel or text, save, refresh. No build step, no cache, no service worker.

### 5. Change the letter text

The letter's full text lives in a single file: `js/letter-data.js`, as an array of paragraphs. Edit it, then bump the `?v=` on its `<script>` tag in `pages/letter.html`.

If you add characters that were not in the original letter, re-run the font subsetter so the handwriting font still covers them:

```bash
python tools/fonts/subset_hardpen_xingshu.py --apply
```

Otherwise new characters silently fall back to a different typeface mid-sentence.

---

## Design rules (do not break)

These come from the original Studio Output system. Violating them produces pages that feel off, even if you cannot say why.

- **Panels are square.** A `.panel` outside a `.journal-article` or `.journal-news` context fills its container with `padding: 50% 0 0 0; height: 0`. The exceptions are `.journal-article`, `.journal-news`, `.newsletter`, `.four-zero-four`, and any panel with a `panel-content-inner` — those are auto-height.
- **Two per row on desktop, one per row under 767px.** Wrap pairs of square panels in `<div class="panel-group">` and the duo layout is free.
- **The menu cycles fonts on hover.** Each `<li class="hover-cycle">` carries a `menu1`–`menu6` class that the script rotates. Do not change those font classes.
- **The logo is hidden behind an image.** The `<h1 class="logo"><a>` text is replaced by the 1D diamond logo via CSS.
- **Footer is three blocks:** `back-to-top` → `social` → `credits`, always in that order.
- **All submissions by email.** Every CTA that asks the user to send something opens a `mailto:` link. Do not add a form, a comments section, or an upload widget.
- **No tracking, no analytics, no service worker.** Keep it that way.
- **Brand name is FIVE GUYS ONE DIRECTION** in titles, og tags, and footer credits. "One Direction" refers to the band itself.

---

## Tech notes

- **No framework, no build step to view.** Plain HTML + CSS + one JS file + jQuery. The whole site is one directory.
- **Minified CSS.** `css/styles.css` is a single 91 KB line. Append new rules at the end; do not reformat it.
- **Bump `?v=` after editing CSS.** There is no cache-control header, so browsers heuristically cache stylesheets. Change `styles.css?v=YYYYMMDD` in the pages that reference it or users keep seeing the old styles.
- **New page-specific CSS goes in its own file.** `css/letter.css` and `css/site-notice.css` are self-contained components rather than additions to `styles.css`.
- **`js/main.js` is minified — do not edit it.** Add page-specific JS in a `<script>` tag or a new guarded file.
- **Self-hosted fonts.** No external font CDN, because the audience is mainly in Mainland China where Google Fonts and jsDelivr are unreliable. `assets/fonts/` holds subsets; the full `.ttf` sources are gitignored.
- **Handwriting font is subset per use.** `assets/fonts/zhangqingping-hyx/` covers exactly the characters the site renders. Add new copy containing new characters and you must re-run the subsetter (see above).
- **Image dimensions matter.** Every `.bg retinafy` element HEAD-checks for a higher-res `-med` / `-lrg` variant and silently falls back to `-sml`. Follow the `<name>-sml.jpg` / `-med` / `-lrg` convention.
- **767px is the only responsive switch.** Below it the site goes from `body.duo` to a single-column layout. Do not add a third breakpoint.
- **Font scaling is automatic.** Body font-size scales in steps between 350px and 2400px viewport width. Use percentages or ems, not pixels.
- **The letter page deliberately does not load `styles.css`.** That stylesheet contains global `p{width:60%}` and `p{margin:0!important}` rules that would wreck the letter's typography. It is self-contained on purpose.

---

## License

**Code:** [MIT](LICENSE) — © 2026 Takion Kroslin & 5 GUYS 1 DIRECTION.

**Content:** images, text, fan works, and other third-party media visible on the rendered site are **not** covered by the MIT License. They remain under the terms of their original rightsholders. If you fork this project, replace them with your own assets or clear the rights first.

---

## Contact

Editorial, corrections, account additions, gallery submissions, fan art, bug reports, anything:

**[contact@5guys1direction.asia](mailto:contact@5guys1direction.asia)**

Issues and pull requests are also welcome on [GitHub](https://github.com/TaKroslin/1d-fansite).
