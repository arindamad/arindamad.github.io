# arindamad.github.io

Personal portfolio of Arindam Sarkar, a full-stack (MERN) developer. Hosted on GitHub Pages.

- `index.html` — the main page (static HTML, no build step)
- `css/modern.css` — theme and layout
- `js/modern.js` — animations (GSAP + ScrollTrigger + SplitText + ScrambleText, Lenis smooth scroll), loaded from CDNs
- `js/space.js` — space theme: starfield, mission rail (scroll progress + section nav), tech-stack universe, AI UFO
- `js/ai-assistant.js` — on-site AI assistant and project scoper; works offline with a built-in knowledge base
- `js/form.js` — contact form (Firebase Realtime Database)
- `ai-proxy/` — optional Cloudflare Worker that lets the assistant answer with Claude (see its README)

SEO: meta/Open Graph tags and JSON-LD structured data in `index.html`, plus `robots.txt` and `sitemap.xml`. After deploying, submit `https://arindamad.github.io/sitemap.xml` in Google Search Console and Bing Webmaster Tools.

Run locally: `python3 -m http.server 8000`, then open http://localhost:8000.
