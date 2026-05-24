# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Where the code lives

**The repo-root `apps/mobile/` is empty.** All active code lives in the worktree:

- `.worktrees/littlenest-ai-prototype/` — branch `codex/littlenest-ai-prototype`
- Inside it: `apps/mobile/` (Expo app), `supabase/` (edge functions + migrations), `docs/` (mirrors parent)

Run `git worktree list` to confirm. Always `cd` into the worktree before editing source, running tests, or starting Expo.

## Project shape

- **Mobile:** Expo SDK 54, React Native 0.81, React 19, TypeScript — under `apps/mobile/`
- **Backend:** Supabase (Auth + Postgres + Edge Functions) — under `supabase/`
- **Planning artifacts:** Superpowers convention — `docs/superpowers/{plans,specs}/<YYYY-MM-DD>-<slug>.md`

## Commands

Run from `<worktree>/apps/mobile/`:

- `npm test` — Jest (jest-expo preset), single run, no watch
- `npm start` / `npm run ios` / `npm run android` / `npm run web` — Expo dev server
- `npm start -- --tunnel` — Expo dev server over a tunnel (scan the QR code in Expo Go on a physical phone)

There is no lint, format, or typecheck script. For TypeScript checking, invoke `npx tsc --noEmit` directly.

**Node is not on PATH** on this Windows host. Prepend it before any `node`/`npm`/`npx` call:
- Bash tool: `export PATH="/c/Program Files/nodejs:$PATH"` then `npm test`
- PowerShell: `$env:Path = "C:\Program Files\nodejs;" + $env:Path` then `& "C:\Program Files\nodejs\npm.cmd" test`

## Architecture facts to get right

- **State:** single React Context in `src/state/PrototypeState.tsx` with AsyncStorage persistence. No Redux/Zustand. Mutate through context methods (`startSleep`, `recordBottleFeed`, `markAllergenExposure`, etc.) — never write to AsyncStorage directly.
- **AI:** the app never calls Gemini/OpenAI directly. All AI calls go through `supabase.functions.invoke('ai-router' | 'recipe-search')`. API keys live only in Supabase Edge Function env. Prompts are built server-side in `supabase/functions/_shared/promptBuilder.ts` (ai-router) and `recipePrompt.ts` (recipe-search); Gemini JSON is parsed by `recipeParser.ts`.
- **i18n:** every user-facing string lives in `src/i18n/{en,he,ru}.ts`. Adding a UI string means adding all three translations.
- **Theme:** accent colors come from `getAccentTheme(mode, sex, twinType)` in `src/theme/theme.ts`. Don't hardcode colors in components — use `useAppTheme()`.

## Environment & secrets

- `apps/mobile/.env.local` and `apps/mobile/ENV_LOCAL_EDIT_ME.txt` contain the real Supabase publishable key. Don't read or print their contents in transcripts.
- `apps/mobile/.env.example` is the committed template. Schema changes go there, not to `.env.local`.

## Repo etiquette

- Host is Windows + PowerShell. Quote paths — the repo folder is literally `web desgin` (the typo is intentional and load-bearing).
- GitHub remote: `https://github.com/xytek12/littlenest.git`. `gh` CLI is installed.
- Plans and specs follow the Superpowers naming convention under `docs/superpowers/`. Don't invent new doc locations.
