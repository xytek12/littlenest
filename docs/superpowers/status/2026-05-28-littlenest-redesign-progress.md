# LittleNest — Redesign & AI Fix Handoff

Date: 2026-05-28
Branch: `codex/littlenest-ai-prototype`
Status: **Local-only — not pushed to GitHub yet** (awaiting user device test + approval)

---

## What Was Done In This Session

### 1. Gemini Fix (`63e1aa6`, `9db1673`)

- Bumped default model from `gemini-2.0-flash` → `gemini-2.5-flash` in `supabase/functions/_shared/aiProviders.ts`
- Added structured `[gemini]` / `[openai]` error logging with status + response body snippet + stack
- Fixed `ai-router/index.ts` silent swallow of Gemini `Promise.allSettled` rejections — now logs verbatim reason
- Deployed: `ai-router` v17, `recipe-search` v23

### 2. Recipe-Search Fix (`cd105dd`)

- Per-stage structured logging: `[recipe-search][gemini]`, `[recipe-search][parse]`, `[recipe-search][domain_filter]`
- `stage` field in 500/502 response bodies (no prompt content leaked)
- Parser robustness in `recipeParser.ts`:
  - tolerates whitespace around markdown code fences
  - object-extraction fallback for `{"recipes":[...]}` wrapper
  - trailing-comma stripping

### 3. UI Redesign — Infrastructure (`5d87e9f`)

New files:
- `apps/mobile/src/components/SectionCard.tsx` — Nara-style card
  - Props: `sectionType`, `title`, `onPlusPress?` (omit = no "+" button), `iconEmoji?`, `label?`, `value?`, `rightLabel?`, `rightSublabel?`, `footerLabel?`, `onFooterPress?`, `compact?`, `children?`
  - Colored 60px banner per `sectionType` using child accent color
  - Italic-serif title + "View History ›" footer
- `apps/mobile/src/components/GenderedBackground.tsx` — reads `family` + `activeChild` from PrototypeState
  - Light: sky-blue (boy), blush-rose (girl), diagonal gradient (twins)
  - Dark: layered plum `#1B0F2C` + midnight `#2A1346` + teal `#0F2A2C` with radial glows
- `apps/mobile/src/utils/formatDateLong.ts`
  - `formatDateLong(ts, lang)` → EN: `Wed, May 27 · 19:14` / HE: `יום שלישי, 26.5 · 19:14`
  - Also exports `formatTimeShort`, `formatDayHeading`

Modified:
- `src/screens/HomeScreen.tsx` — `GenderedBackground` + `SectionCard`; sleep card shows live timer when `activeSleepStartedAt` is set
- `src/screens/SleepScreen.tsx` — `SectionCard` with elapsed timer + Stop button
- `src/screens/SleepHistoryScreen.tsx` — uses `homeSleep.sleepHistoryTitle` i18n key
- `src/components/WatercolorHeader.tsx` — dark-mode overlay opacity bumped (top 0.42→0.55, mid 0.26→0.32)
- `src/theme/fonts.ts` — Frank Ruhl Libre + Heebo registered; TS2322 fixed
- `src/theme/index.ts` — added `genderedBg`, `jewelDark`, `sectionAccents`, `typographyHe` tokens
- `src/theme/useAppTheme.ts` — `mutedText` `#A8A2C9`→`#D9C8B6`, `text` lifted for dark contrast
- `src/i18n/en.ts` + `he.ts` — added `naraCard` + `homeSleep` blocks

### 4. UI Redesign — Feed + Food + Tastings (`f0ea806`)

- `src/screens/FeedHistoryScreen.tsx` — day-grouped layout, `formatDateLong`, italic-serif day headings
- `src/screens/FoodScreen.tsx` — wrapped in `GenderedBackground`; `SectionCard` header; kept search/fetch logic
- `src/screens/FoodTastingScreen.tsx` — wrapped in `GenderedBackground`; compact `SectionCard` per allergen; **NO "+" BUTTON**; allergen 1/2/3 pills preserved; whisper teal hint in dark mode

### 5. Feed Screen + Hebrew Fonts (`691f2d8`)

- `src/screens/FeedScreen.tsx` — `GenderedBackground` + `SectionCard sectionType="feed"` + `formatDateLong`; quick-add: Nursing + Bottle only (no Solids)
- `apps/mobile/package.json` + lock — added `@expo-google-fonts/frank-ruhl-libre`, `@expo-google-fonts/heebo`

### 6. UI Lookbook (`679f0d5`)

- `ui-lookbook/proposal-2026-05-27.html` — 10 phone frames showing light/dark, EN/HE, boy/girl/twins

---

## Current Verification State

- `npx tsc --noEmit`: **clean**
- `npm test`: **69/69 passing**
- Edge Functions: `ai-router` v17, `recipe-search` v23 deployed to `lolesbmajbrhbsmvxgos`

---

## Preserved (Do Not Break)

- Bottom dock: 5 tabs, Sticker Pop style
- Allergen 1/2/3 pill tapping pattern on Tastings screen
- State methods: `startSleep`, `recordBottleFeed`, `markAllergenExposure`, etc.
- Expo SDK 54 + React 19 (physical device Expo Go compatibility)
- All AI calls through `supabase.functions.invoke('ai-router' | 'recipe-search')` only

---

## Pending

- User tests on physical device via Expo Go (tunnel or LAN)
- After approval: `git push origin codex/littlenest-ai-prototype`
- Supabase project: `lolesbmajbrhbsmvxgos`
- Test account: `test@gmail.com` / `Test1234!`

---

## Do Not Forget

- `.env.local` and `ENV_LOCAL_EDIT_ME.txt` contain real keys — never print contents in transcripts
- Expo tunnel (`ngrok`) is unreliable on this Windows machine — use `--lan` as fallback
- Node must be prepended to PATH: `export PATH="/c/Program Files/nodejs:$PATH"` (Bash) or `$env:Path = "C:\Program Files\nodejs;" + $env:Path` (PowerShell)
