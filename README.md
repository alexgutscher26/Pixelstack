# Flowkit — AI Mobile Design Agent

[![CodeFactor](https://www.codefactor.io/repository/github/alexgutscher26/pixelstack/badge)](https://www.codefactor.io/repository/github/alexgutscher26/pixelstack)

Flowkit is an AI-powered mobile design agent that helps you generate polished app screens, apply themes, and export assets fast. It uses Next.js, Tailwind CSS, Prisma, Inngest, and OpenRouter AI to streamline ideation → mockups.

## Features

- Generate 8–12 screens from a prompt
- Canvas with zoom, hand tool, and background presets (Dots, Grid, Solid)
- Theme selector with CSS variables
- Export: Canvas PNG, per-frame PNG/HTML, batch export
- Real-time status updates via Inngest
- Project management: create, update theme/name, delete

## Tech Stack

- Next.js 16 (App Router, Turbopack)
- React 19
- Tailwind CSS v4
- Prisma (database)
- @tanstack/react-query
- Radix UI
- Inngest (functions + realtime)
- OpenRouter AI SDK
- Puppeteer Core + Sparticuz Chromium (server-side screenshots)

## Getting Started

1. Prerequisites
   - Node.js 18+
   - A compatible database (e.g., PostgreSQL) reachable via `DATABASE_URL`
   - API keys for required services

2. Install
   - `npm install`
   - `npm run postinstall` (or `npx prisma generate` if needed)

3. Environment
   Create a `.env` (or `.env.local`) with:
   - `NEXT_PUBLIC_SITE_URL=http://localhost:3000`
   - `DATABASE_URL=postgresql://USER:PASS@HOST:PORT/DB?schema=public`
   - `OPENROUTER_API_KEY=...`
   - Kinde Auth (example)
     - `KINDE_CLIENT_ID=...`
     - `KINDE_CLIENT_SECRET=...`
     - `KINDE_ISSUER_URL=...`
     - `KINDE_REDIRECT_URL=http://localhost:3000/api/auth/callback`
     - `KINDE_LOGOUT_REDIRECT_URL=http://localhost:3000/`

4. Dev
   - `npm run dev`
   - Turbopack will start on port 3000 (or fallback to 3001 if busy)

## Scripts

- `npm run dev` — Start local dev server
- `npm run build` — Build production bundle
- `npm run start` — Start production server
- `npm run lint` — Lint with ESLint
- `npm run format` — Format with Prettier
- `postinstall` — Prisma generate

## Key Paths

- App layout and metadata: `app/layout.tsx`
- Landing and project listing: `app/(routes)/_common/landing-section.tsx`
- Project canvas: `components/canvas/index.tsx`
- Canvas toolbar: `components/canvas/canvas-floating-toolbar.tsx`
- Canvas controls: `components/canvas/canvas-controls.tsx`
- Canvas state: `context/canvas-context.tsx`
- Themes: `lib/themes.ts`
- Inngest route: `app/api/inngest/route.ts`
- Project API: `app/api/project/[id]/route.ts`
- Frame export wrapper: `lib/frame-wrapper.ts`

## Development Notes

- The canvas background selector supports Dots/Grid/Solid, with a color picker. Screenshots and exports include the chosen background.
- Export flows use server-side screenshots via Puppeteer Core + Sparticuz Chromium.
- Inngest powers generation and realtime topic updates (e.g., analysis.start, generation.complete).
- Auth is handled with Kinde; middleware protects routes, with some public paths configured for development.

## Troubleshooting

- Port conflicts: If 3000 is in use, dev server will switch to 3001.
- TypeScript route errors: Ensure API handlers use `NextRequest` and the correct `params` signature.
- CSS import typing: Declared in `types/css.d.ts` for global CSS imports.

## License

Proprietary. All rights reserved.
