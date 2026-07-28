# FIVE GUYS ONE DIRECTION

A Mainland China Directioner hub built on top of the archived One Direction website. Original Studio Output visual design, with four new editorial sections bolted on.

> Unofficial fan project. Not affiliated with One Direction, their management, or any record label. All trademarks belong to their respective owners.

---

## What is in this site

**Cloned from the original One Direction site (Studio Output / Kleber / Sony Music Entertainment UK):**

- Home — hero + journal + video + news + music + moment + newsletter + gallery cover + tweet
- Music — five albums, all 65 songs, every press shot
- Journal — 20 archival posts from 2015–2020
- Band — five members with parallax photo panels
- Tour — 433 dates from 2011–2015

**Added by FIVE GUYS ONE DIRECTION:**

- **Blog** — original essays (4 published)
- **Gallery** — five curated photo collections (37 images)
- **This Is Us** — Mainland China fan-account directory (7 platforms)
- **About** — project statement

**Top of the home page:** #16YearsOf1D anniversary panel (mirror of the 2020 #10YearsOf1D panel) + a site-introduction panel + latest posts + four new-section entry cards.

---

## File structure

```
1d-fansite/
├── index.html                       # Home (hero + 16yrs + intro + latest + 4 new-section entries + cloned panels)
├── css/styles.css                   # Official stylesheet (minified, do not edit by hand)
├── js/main.js                       # Official script (Waypoints, hover-cycle, play-button, retinafy)
├── js/jquery.min.js
├── js/isotope.pkgd.min.js
├── images/
│   ├── gfx/                         # 39 official assets (logos, filmstrips, hero, album covers)
│   │   └── 5guys/                   # FIVE GUYS ONE DIRECTION branding (logos)
│   ├── media/article-images/        # Journal + music article images
│   ├── media/article-logos/         # Album logos
│   ├── media/gallery-images/        # Gallery cover images
│   └── tour/                        # Tour images
├── tools/                           # Build & maintenance scripts
│   ├── build_blog.py                # Markdown → HTML builder (run after editing article.md)
│   ├── extract_articles.py          # HTML → Markdown converter (one-shot migration)
│   └── templates/                   # Jinja-style HTML templates for build_blog.py
│       ├── article.html
│       └── blog_list.html
├── pages/                           # All non-home pages live here
│   ├── music.html
│   ├── journal.html
│   ├── band.html
│   ├── tour.html
│   ├── shop.html
│   ├── blog.html                    # Auto-generated — blog listing (do not edit by hand)
│   ├── gallery.html
│   ├── this-is-us.html
│   ├── about.html
│   ├── music/albums/                # 5 album pages + 20 sub-pages + 65 song pages
│   ├── tour/                        # Tour archive (433 dates)
│   ├── blog/                        # 4 essays at pages/blog/YYYY-MM-DD/slug/
│   │   └── 2026-07-27/
│   │       ├── why-this-site-exists/
│   │       │   ├── article.md       # ✏️  Edit this
│   │       │   └── index.html       # 🤖  Auto-generated
│   │       ├── every-july-23rd-we-come-home/
│   │       │   ├── article.md
│   │       │   └── index.html
│   │       ├── why-i-love-1d-so-bad/
│   │       │   ├── article.md
│   │       │   └── index.html
│   │       └── ready-to-run/
│   │           ├── article.md
│   │           └── index.html
│   └── gallery/                     # 5 category pages at pages/gallery/<category>/
│       ├── members/index.html
│       ├── on-stage/index.html
│       ├── behind-the-scenes/index.html
│       ├── press/index.html
│       └── fan-art/index.html
└── journal/                         # Cloned journal articles (20 posts, 2015–2020)
    └── YYYY-MM-DD/<slug>/index.html
```

---

## Local preview

```bash
cd "E:\文档\GitHub\1d-fansite"
python -m http.server 8765
# Open http://localhost:8765/
```

Or use any other static server (`npx serve`, VS Code Live Server, etc.). No build step, no dependencies to install.

---

## How to add content

> **All submissions, edits, account additions, and corrections go by email to [takionkroslin@icloud.com](mailto:takionkroslin@icloud.com).** That is the only channel — there is no CMS, no comment form, no admin login. This is deliberate; the whole site is plain HTML so it can be reviewed and updated in plain text by hand.

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
   og_image: ../../../../images/gfx/hero-2015-rect-sml.jpg
   scaler: 60%
   -->
   
   Your first paragraph here.
   
   Your second paragraph here.
   ```
3. Write the body in plain Markdown (paragraphs separated by blank lines, `*italic*`, `**bold**`, `> blockquote`, `[links]()`).

**Step 2: Register the post**

Add an entry to `META` and `SCALERS` in `tools/build_blog.py`:
```python
"2026-08-01/your-post-slug": {
    "title": "Your Post Title",
    "date_display": "1st August 2026",
    "author": "Takion Kroslin",
    "description": "A one-sentence summary.",
    "keywords": "One Direction, keyword, another keyword",
    "og_image": "../../../../images/gfx/hero-2015-rect-sml.jpg",
},
```

**Step 3: Build**

```bash
python tools/build_blog.py
```

This auto-generates:
- `pages/blog/YYYY-MM-DD/<slug>/index.html` — the full article page
- `pages/blog.html` — the blog listing page (with cards)
- `posts.json` — metadata for the home page "Latest" section

All generated HTML is pure static — no JS rendering, works perfectly on Cloudflare Pages.

To edit an existing post, just edit its `article.md` and re-run `python tools/build_blog.py`.

### 2. Add a new gallery category

1. Create a folder: `pages/gallery/<category>/index.html` (e.g. `pages/gallery/awards-2016/index.html`)
2. Copy `pages/gallery/members/index.html` as the template
3. Update the meta, `panel-header`, `h2`, and each gallery-item panel (`.bg retinafy` background image, title, year caption)
4. Update the depth-correct relative paths (depth 2 — `../css/styles.css`, `../../index.html`, etc.)
5. Add a cover card to `pages/gallery.html`:
   ```html
   <div class="panel gallery-cover">
     <div class="bg retinafy" style="background-image: url(../images/.../cover.jpg);"></div>
     <div class="panel-header">
       <div class="title">Awards 2016</div>
       <div class="section-name"><a href="gallery/awards-2016/index.html">Gallery</a></div>
     </div>
     <div class="inline"></div>
     <div class="panel-content center-content"><h2>Awards 2016</h2></div>
     <div class="count"><span>3</span></div>
     <div class="info">
       <a class="more" href="gallery/awards-2016/index.html">View images</a>
     </div>
   </div>
   ```
6. Bump the count badge to match the actual number of images in the new category.

### 3. Add a fan account to "This Is Us"

There is no template file to copy — just edit `pages/this-is-us.html` and add a new `.panel-group` block (or extend an existing one) with another platform card. Use any of the existing platform panels (微博 / Bilibili / RedNote / Douyin / Instagram / X / YouTube) as the visual template. Inline-style the background color to match the platform's brand color, and the h2 colour to white. Link the panel-header `.section-name` and the h2 to the actual account URL.

### 4. Add a hero image to the #16YearsOf1D panel

The `#16YearsOf1D` panel on the home page currently uses the existing `images/gfx/1D_Logotype_Black.jpg` as its centerpiece. To swap in a real photo collection:

1. Drop 1–16 images into `images/gfx/16years/` (or wherever convenient)
2. In `index.html`, find the `#16YearsOf1D` panel and replace the single-image `<div class="image">` block with a small `.panel-group` grid (2×2 or 4×4) of `.panel` blocks, each with a `.bg retinafy` background

### 5. Edit any existing page

Every page uses the same head + header + footer skeleton. The fastest way to edit a page is:

1. Open the file
2. Find the panel or text you want to change
3. Save
4. Refresh the browser — no build step, no cache, no service worker

---

## Design rules (do not break)

These rules come from the original Studio Output system. Violating them produces pages that feel off, even if you cannot say why.

- **Panels are square.** A `.panel` outside a `.journal-article` or `.journal-news` context fills its container with `padding: 50% 0 0 0; height: 0`. The only panels that are not square are `.journal-article`, `.journal-news`, `.newsletter`, `.four-zero-four`, and any panel with a `panel-content-inner` — those are auto-height.
- **Two per row on desktop, one per row under 767px.** Wrap pairs of square panels in `<div class="panel-group">` and you get the duo layout for free.
- **The menu cycles fonts on hover.** Each `<li class="hover-cycle">` already has a `menu1`–`menu6` class assigned. The script rotates them every 75ms. Do not change the font classes; the rotation is part of the design.
- **Logo is hidden behind an image.** The `<h1 class="logo"><a>...</a></h1>` text is hidden by CSS, replaced with the 1D diamond logo image. You can put any text inside the `<a>`, but the visible result is always the logo.
- **Footer is three blocks:** `back-to-top` → `social` (icons) → `credits` (legal/contact). Always in that order. Always with the new copyright text `© {year} Takion Kroslin & 5 GUYS 1 DIRECTION`.
- **All submissions by email.** Every CTA that asks the user to send something (a draft, an image, an account link, a bug report) opens a `mailto:takionkroslin@icloud.com?subject=...` link. Do not add a form; do not add a comments section; do not add an upload widget. Email is the API.
- **No tracking, no analytics, no service worker.** The site has no Google Tag Manager, no cookies beyond the optional `smecookienotice` (which is dead code anyway), no CDN scripts beyond Google Fonts and jQuery. Keep it that way.
- **Brand name is FIVE GUYS ONE DIRECTION.** Logo text, title tags, og:site_name, footer credits, social handles — all use the new name. "One Direction" is reserved for referring to the band itself.

---

## Tech notes

- **No framework, no build step.** Plain HTML + one CSS + one JS + jQuery. The whole site is one directory and opens with `python -m http.server`.
- **Minified CSS.** `css/styles.css` is one line, 91KB. New CSS rules are appended at the end of the file. Do not reformat it.
- **Waypoints, hover-cycle, play-button, retinafy** are all in `js/main.js`. That file is also minified; do not edit it. Add page-specific JS in a `<script>` block at the bottom of the page instead.
- **Image dimensions matter.** Every `.bg retinafy` element does an `XMLHttpRequest` HEAD check to look for a higher-res `-med` or `-lrg` variant of the same image. If the variant does not exist, the script silently falls back to the `-sml` file. Use the convention `<filename>-sml.jpg` / `<filename>-med.jpg` / `<filename>-lrg.jpg` when adding new image sets.
- **The 767px breakpoint is the only responsive switch.** Below 767px the site goes from `body.duo` to `body.mono` — every panel goes from 50% width to 100% width, the menu collapses into a fullscreen overlay, and the homepage video info panel flips from left/right to top/bottom. Above 767px the design is fixed. Do not try to make a third breakpoint.
- **Font scaling is automatic.** Between 350px and 2400px viewport width, the body font-size scales in ~4% steps. Do not set font-sizes in pixels; use percentages or ems.

---

## Contact

Editorial, corrections, account additions, gallery submissions, fan art, bug reports, anything:

**[takionkroslin@icloud.com](mailto:takionkroslin@icloud.com)**

Reply window is whenever the inbox is open. Most pitches get a response within 48 hours.
