# Seven Dot Inc. — Static HTML Website

Plain HTML/CSS/JS version of the site — no build step, no Node.js required.
Uses Three.js and GSAP via CDN for the particle background, material
visualization, and scroll animations.

## Files

```
index.html                     the entire site (all sections)
assets/styles.css              all styling
assets/script.js               particles, animations, nav, form logic
assets/presentation/           put your real presentation PDF/PPT here
robots.txt, sitemap.xml        basic SEO files
```

## Running it

There's nothing to install. Just open `index.html` in a browser, or for
best results (some browsers restrict local file access) serve it with any
static server, e.g.:

```bash
npx serve .
```

## Before going live

1. **Presentation file** — add the real file to `assets/presentation/` as
   `Seven-Dot-Company-Presentation.pdf` (or update the three download links
   in `index.html` if you use a different name/format).
2. **Contact form — this needs one manual step.** A static site has no
   server to send email, so the form needs a form backend:
   - **Easiest:** sign up free at [formspree.io](https://formspree.io),
     create a form pointed at `Manil.patel@sevendot.ca`, and paste the
     endpoint URL into `FORM_ENDPOINT` at the top of `assets/script.js`.
   - Until you do that, the form falls back to opening the visitor's own
     email client with the message pre-filled — it still works, just less
     seamless.
   - If your host offers PHP (common on shared hosting), you can instead
     replace the fetch call with a simple `mail()` script — ask if you'd
     like that version.
3. **OG image / favicon** — add `assets/og-image.jpg` (1200×630) and
   `assets/favicon.ico`, and update the `<link>`/`<meta>` tags in
   `index.html` if you place them elsewhere.
4. Upload the whole folder to any static host (Netlify, GitHub Pages,
   Vercel, or your existing sevendot.ca hosting/cPanel) and point your
   domain at it.

## Content notes

Copy avoids unverified technical specs, certifications, partnerships,
customer names, or environmental-impact percentages, per the brief.
