# Contributing to Flowkit

Welcome! This guide helps new developers set up the project, understand the architecture, and contribute effectively.

## Project Overview

- Framework: Next.js 16 (App Router, Turbopack)
- Language: TypeScript
- Styling: Tailwind CSS v4, Prettier with Tailwind plugin
- Auth: Kinde Auth
- Data: Prisma (MongoDB)
- Background jobs & realtime: Inngest
- AI: OpenRouter (text generation), OpenAI Moderations (content safety)
- Headless browser: puppeteer / chromium-min

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm (project uses npm scripts)
- MongoDB (Atlas or local) for Prisma datasource
- Accounts/keys:
  - OPENROUTER_API_KEY (OpenRouter)
  - OPENAI_API_KEY (OpenAI Moderations)
  - Kinde auth configuration (see Kinde docs)

## Setup

1. Clone the repository.
2. Create `.env` in the project root and set:
   - `DATABASE_URL` — MongoDB connection string
   - `OPENROUTER_API_KEY` — OpenRouter key
   - `OPENAI_API_KEY` — OpenAI key for moderation
   - Kinde variables as required by `@kinde-oss/kinde-auth-nextjs`
3. Install dependencies:
   - `npm install`
4. Generate Prisma client:
   - `npm run postinstall` runs `prisma generate` automatically, or run `npx prisma generate`.

## Common Scripts

- `npm run dev` — start Next.js dev server
- `npm run build` — production build
- `npm start` — start production server
- `npm run lint` — run ESLint
- `npm run format` — Prettier write

## Architecture Notes

- App routes live under `app/(routes)/*`
- API routes are under `app/api/*` with `route.ts` handlers
- Prisma schema: `prisma/schema.prisma` (MongoDB datasource)
- Generated Prisma client output: `lib/generated/prisma`
- Inngest client: `inngest/client.ts`
- OpenRouter client: `lib/openrouter.ts`
- Content moderation utility: `lib/moderation.ts`

## Development Guidelines

- Follow TypeScript types and existing patterns in neighboring files.
- Keep ESLint and Prettier clean before pushing code.
- Maintain accessibility (labels, aria attributes) and consistent UI primitives.
- Do not log or commit secrets; never print API keys or tokens.
- For components using `useSearchParams` or other client-side navigation hooks, wrap the rendering in `Suspense` to satisfy Next.js 16 CSR bailout requirements.

## Content Safety

- All prompts are checked via OpenAI Moderations (`omni-moderation-latest`) server-side:
  - Project creation: `app/api/project/route.ts`
  - Prompt enhancement: `app/api/prompt/enhance/route.ts`
- If a prompt is flagged, the API returns HTTP 400 with a safe error message.
- Ensure `OPENAI_API_KEY` is set to enforce moderation.

## Database

- Schema models: `Project`, `Frame`
- Set `DATABASE_URL` to your MongoDB connection string.
- After schema changes:
  - Run `npx prisma generate` to update the generated client.

## Background Jobs & Realtime

- Events are sent via Inngest for generating screens and related work.
- Client is configured in `inngest/client.ts`.

## Branching & Pull Requests

- Create a feature branch from `main`.
- Keep changes focused and small; write clear PR descriptions.
- Prefer Conventional Commits style (e.g., `feat:`, `fix:`, `chore:`) for clarity.
- Run lint and build locally before opening a PR.

## Coding Style

- Use ESLint (v9) and Prettier (v3) with Tailwind plugin.
- Keep components small, typed, and composable.
- Prefer server routes for secrets and external API calls.

## Troubleshooting

- Build failures complaining about `useSearchParams`:
  - Wrap the component rendering in `<Suspense fallback={null}>...</Suspense>`.
- Next.js notice: “middleware” convention is deprecated — use “proxy” per Next.js 16 docs when migrating middleware.

## Security

- Do not commit `.env` or any secret values.
- Avoid logging user data, tokens, or credentials.
- Validate and sanitize inputs for API routes.

## How to Propose Changes

1. Open an issue describing the change or problem.
2. Implement on a feature branch.
3. Ensure `npm run lint` and `npm run build` succeed.
4. Open a PR with context, tests if applicable, and screenshots for UI.

Thanks for contributing!
