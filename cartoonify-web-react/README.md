# Cartoonify Web — React

A single-page React app that converts photos into cartoon-like images entirely in the browser.

This build adds visual, modern UI effects inspired by reactbits.dev:
- layered blurred colored blobs in the background
- glassmorphism cards with soft borders and shadows
- micro-interactions and framer-motion animations
- responsive and mobile-friendly layout

## Run locally (recommended: Vite)
1. `npm install`
2. `npx tailwindcss init -p` (or already included devDeps — ensure Tailwind is configured)
3. Ensure `tailwind.config.cjs` has `content` set to `["./index.html","./src/**/*.{js,jsx}"]`
4. `npm run dev`

Files included:
- public/index.html
- src/main.jsx
- src/App.jsx
- src/index.css
- package.json
- README.md

