# My PWA Template

This is a complete Progressive Web App starter template.

## How to run
1. You need HTTPS or localhost for service workers to work.
2. Use VS Code Live Server, or run: `python -m http.server 8000`
3. Open http://localhost:8000 in Chrome

## How to test PWA
1. Open DevTools > Application tab
2. Check Manifest and Service Workers sections
3. Go offline in Network tab and reload - site should still work
4. On mobile Chrome, you'll see "Add to Home Screen" prompt

## Deploy
Upload to Netlify, Vercel, or GitHub Pages. Must be HTTPS.

## Customize
1. Replace icons in /icons/ with your own 192x192 and 512x512 PNGs
2. Edit manifest.json name, colors, description
3. Update CACHE_NAME in service-worker.js when you change files
