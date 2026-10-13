# ALWAYSSS — Visual Storytelling Website

Premium portfolio & business website for @always_shrestha — travel photographer & cinematographer.

## Pages
| File | Purpose |
|---|---|
| index.html | Homepage — hero, featured work, clients, services, about, testimonials, Instagram CTA |
| work.html | Filterable portfolio (Hotels, Travel, Personal Brands, Food, Cinematography, Social…) |
| project.html?id=… | Case-study page (hero, meta, gallery, lightbox, testimonial, share buttons, prev/next) |
| services.html | All 11 services with visuals — each links into the enquiry form |
| about.html | Bio, philosophy, stats, reviews |
| reviews.html | Rating summary + approved reviews + moderated submission form (1–5 stars, photo upload) |
| contact.html | Full enquiry form (project type, budget, services, source…) with validation + spam protection |
| book.html | Book-a-consultation request with available time slots |
| admin.html | **Your dashboard** — approve/feature/edit/delete reviews, add/reorder/delete projects, read enquiries, bookings, analytics, settings |
| privacy.html / terms.html | Legal & trust pages |

## Admin Dashboard
- URL: `/admin.html` (linked in the footer as "Client Login")
- Default password: **always2026** → change it immediately in Settings
- Reviews never appear publicly until you approve them. Mark great ones "Featured" to pin them on the homepage.

## Publishing (free)
1. Go to [Netlify](https://app.netlify.com) → drag this entire folder onto "Deploy manually", or connect a Git repo.
2. You get a free, clean subdomain like **always-shrestha.netlify.app** — short, professional, perfect for an Instagram bio. (A custom .com is never free — typically ~$10–15/year via Namecheap/Porkbun if you later want one; Netlify/Vercel both connect custom domains free.)
3. Alternative free hosts: Vercel, Cloudflare Pages, GitHub Pages.

## Email delivery
The enquiry form has three layers:
1. **Netlify Forms** — the static `name="enquiry"` form is auto-detected when deployed on Netlify; submissions arrive in your Netlify dashboard and can email you (Site settings → Forms → Notifications).
2. **Local dashboard** — every enquiry is also stored in your `/admin.html` dashboard.
3. **Fallback** — the confirmation screen shows your direct email + Instagram DM buttons.

## Things to personalise
- Replace all images in `assets/img/` with your own work (keep the same filenames or update `assets/js/data.js`).
- Update `baseUrl` in `assets/js/data.js` (settings) to your real domain so Open Graph share images work.
- Edit projects/services/clients/reviews in `assets/js/data.js`, or use the Admin dashboard (no code needed).
- Add your Google Analytics ID in Admin → Settings if you want full analytics (a privacy-conscious built-in tracker already runs).

## SEO included
Semantic headings, per-page meta descriptions, Open Graph/Twitter cards, JSON-LD structured data (ProfessionalService), `sitemap.xml`, `robots.txt`, descriptive alt text, clean URLs, lazy-loaded WebP images (whole image set ≈ 1.5 MB).

*All photos currently in `assets/img/` are temporary placeholders (Pexels/Unsplash) — replace with your portfolio before launch.*
