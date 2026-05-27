# LittleNest — Memory Log

A running log of every change made to this project so we (and any Claude session) can pick up exactly where we left off. **Read this first** when resuming work.

> **Note:** This file lives in both `master` and `codex/littlenest-ai-prototype`. Keep them in sync.

---

## How to use this file

- **Newest entries at the top.** Add a new dated section every time you finish a meaningful change.
- **Each entry must include:** date, what changed, why, files touched, test status.
- **Be honest about half-finished work.** If something is broken or pending, write it down here.

---

## 2026-05-27 — Round 3-5 icon iterations + UI polish + recipe-search end-to-end + Gemini fix (Mac session, PR #2)

**Branch:** `codex/littlenest-ai-prototype` → PR #2 against `master`
**Commits:** `2a21d1b`, `91a25ae`, `2877cb1`, `bd7be03`, plus this MEMORY/secrets commit

### What changed

1. **"14" digit font fix in Hebrew learning title** — `HomeScreen.tsx` applies `renderWithStyledDigits` to `labels.learningTitle` now (previously only to `learningBody`). New `learningTitleNumber` style (`displayBold`, 24px, weight 900). The `14` in "רשמו שינה והאכלות במשך 14 ימים…" finally renders in the same display font instead of iOS substituting a smaller fallback.

2. **Bigger section labels on Home cards** — new `sectionTitle?: string` prop on `StorybookCard` renders a 20px bold header above the kicker. Home Sleep / Feed / FoodTasting cards now show prominent "שינה" / "הנקה" / "טעימות" labels (uses existing `labels.sleepTitle` / `feedTitle` / `foodTastingTitle` from i18n).

3. **Human-readable nursing history** — `FeedScreen.tsx` inline history rows switched from `formatDurationSeconds` (MM:SS like "00:14") → `formatDurationHuman` (e.g. "12 minutes"). Live timer + sheet still uses MM:SS since that's a real-time clock. `interactionFlows.test.tsx` regex updated to match the new format.

4. **Recipe search end-to-end fix (matkonia.co.il returned 0 results)** — old code passed FULL recipe titles to `?s=` which is keyword search; WordPress returned nothing. Now the AI is prompted to emit a short `searchQuery` field per recipe, and the full chain consumes it:
   - `_shared/recipePrompt.ts` — prompt asks for `searchQuery` (2-3 keywords). New `shortenSearchQuery()` helper clips any input to 3 tokens defensively. `buildSourceUrl()` takes a query (not a title).
   - `_shared/recipeParser.ts` — `StructuredRecipe` type + `normalizeRecipe()` now extract `searchQuery`.
   - `recipe-search/index.ts` — builds URL from `r.searchQuery || r.title` (fallback for older payloads).
   - `apps/mobile/src/ai/client.ts` — mirrors `shortenSearchQuery()` on the client; `StructuredRecipe.searchQuery?` added; `normalizeRecipeUrls()` and `buildClientSearchUrl()` prefer `searchQuery` over `title`. Old cached payloads still get clipped to 3 keywords on read so they don't 404 either.
   - **Critical gap caught during verification:** the first commit only updated the prompt — nothing actually read `searchQuery`. The full chain was wired in commit `91a25ae` after that gap was discovered.

5. **Gemini model fix** — `aiProviders.ts` default model `gemini-2.5-flash` (non-existent on public API) → `gemini-2.0-flash`. Same change in `FUNCTION_SECRETS_EDIT_ME.txt`. Fixes "Gemini could not answer this request right now" on AI compare screen.

6. **Icon iterations — Rounds 3, 4, 5 in `ui-lookbook/icons.html`** — six SVG concepts per round, hand-built inline SVGs on dark gallery page. All previous rounds (1-2) rejected before this session.
   - **Round 3 (rejected):** Sleeping Fox / Watercolor Sketch / Liquid Glass / Sticker-Pop Crescent / Constellation Baby / Olive Branch Nest
   - **Round 4 (rejected):** Hebrew Lamed monogram / Cross-Stitch Heart / Wooden Letter Block / Risograph Print / Parent-Baby Grip / Botanical Plate
   - **Round 5 (latest):** Nestling Mascot / Cradle Loop (Apple Fitness style) / Holographic Infinity / Hanko Wax Seal / Tarot The Sun / Pixel Baby 8-bit
   - Each round used a Sonnet 4.6 subagent for the heavy SVG work while Opus 4.7 orchestrated. Round 5 brief was informed by App Store research (Huckleberry's "Berry" mascot, BabyCenter's lettermark, Nara's vibrancy).
   - A ChatGPT/nano-banana prompt was also handed to the user for parallel image-gen comparisons.

### Files changed

| File | Change |
|------|--------|
| `apps/mobile/src/screens/HomeScreen.tsx` | `renderWithStyledDigits` on `learningTitle`; `learningTitleNumber` style; `sectionTitle` prop passed to 3 Home cards |
| `apps/mobile/src/components/StorybookCard.tsx` | NEW `sectionTitle?` prop renders a 20px bold header above the kicker |
| `apps/mobile/src/screens/FeedScreen.tsx` | `formatDurationHuman` for nursing history rows (live timer still MM:SS) |
| `apps/mobile/__tests__/interactionFlows.test.tsx` | Regex updated for "12 minutes (L 7 minutes / R 5 minutes)" format |
| `apps/mobile/src/ai/client.ts` | `StructuredRecipe.searchQuery?`; mirror `shortenSearchQuery()`; `buildClientSearchUrl()` clips; `normalizeRecipeUrls()` prefers `searchQuery` |
| `supabase/functions/_shared/recipePrompt.ts` | Prompt asks for `searchQuery`; `shortenSearchQuery()` helper; `buildSourceUrl()` takes query not title |
| `supabase/functions/_shared/recipeParser.ts` | `StructuredRecipe.searchQuery?` + extracted in `normalizeRecipe` |
| `supabase/functions/recipe-search/index.ts` | URL built from `r.searchQuery || r.title` |
| `supabase/functions/_shared/aiProviders.ts` | Default `GEMINI_MODEL` → `gemini-2.0-flash` |
| `supabase/functions/FUNCTION_SECRETS_EDIT_ME.txt` | `GEMINI_MODEL=gemini-2.0-flash` |
| `ui-lookbook/icons.html` | Rebuilt 3 times (Round 3, 4, 5 concepts) |

### Backend ops

- **NOT deployed yet:** The `recipe-search` edge function changes are in the repo but not pushed to Supabase. User must run `supabase functions deploy recipe-search` for the `searchQuery` wiring to reach production.
- **GEMINI_MODEL secret on Supabase** also needs updating from `gemini-2.5-flash` → `gemini-2.0-flash` on the project dashboard.

### Tests

- **All 69 Jest tests pass** ✅
- **TypeScript clean** ✅ (`tsc --noEmit`)

### Notes for next session

- **Round 5 icons pending user review.** Six concepts in `ui-lookbook/icons.html` open in browser. User may want Round 6 in a specific direction, or want one of the 5 concepts implemented as the actual iOS app icon (`apps/mobile/assets/icon.png` + AppIcon set).
- **PR #2 is open:** https://github.com/xytek12/littlenest/pull/2 — against `master`. All session work landed there.
- **Sonnet 4.6 subagents** were used for icon design heavy-lift. Brief them with what's been rejected; rounds 1-5 are all documented above so future agents can avoid repeating rejected tropes.

---

## 2026-05-26 — Indigo Dream dark mode + gender-aware sleep verb + twin picker cards + per-recipe images (Mac session)

**Branch:** `codex/littlenest-ai-prototype`

### What changed

1. **Indigo Dream dark mode applied (light mode untouched)**
   - User picked variant 6 ("Indigo Dream") from the dark-mode lookbook (`ui-lookbook/dark.html`).
   - `useAppTheme.ts`: replaced sepia-brown dark palette with indigo. New tokens: `background: #161629`, `surface: #1F1F38`, `text: #EFEAFF`, `mutedText: #A8A2C9`, `border: #363659`. Added derived dock tokens: `dockActiveBg: #9FB7E8`, `dockActiveText: #161629`, `dockInactiveText: rgba(239,234,255,0.7)`.
   - `BottomEmojiTabBar.tsx`: kept Sticker Pop geometry (chunky border + hard offset shadow + active pill). Dark mode branch reads the new dock tokens; light mode code path is **byte-identical to before** (same `#FFFFFF` bg, same `stickerCharcoal` border + labels + sticker colors).
   - `WatercolorHeader.tsx`: unchanged — existing 0.32/0.22 dark overlays harmonize with indigo bg.

2. **Gender-aware Hebrew sleep status in Home header**
   - User feedback: lookbook mockup showed "ענר ישנה בשקט" — feminine verb but ענר is a boy's name. Fix: verb must agree with `activeChild.sex`.
   - Added i18n keys: `home.sleepingStatus(name, sex)` in `en.ts` ("${name} is sleeping peacefully"), `he.ts` ("בוקר טוב, ${name} ${sex === 'boy' ? 'ישן' : 'ישנה'} בשקט"). `ru.ts` re-exports `en.ts` so it picks up automatically.
   - `HomeScreen.tsx` subtitle logic: if `activeSleepStartedAt` is set, show `sleepingStatus(name, sex)`; else age label (single mode) or `undefined` (twins). NOTE: `activeSleepStartedAt` is a single global value in `PrototypeState`, so the sleeping child is always `activeChild` — no per-child branch needed.

3. **Twin picker cards on 5 screens (Home + 4 detail screens)**
   - Created `apps/mobile/src/components/TwinPickerCards.tsx` — reusable two-card child picker (extracted from inline JSX in `HomeScreen`). Prop `compact?: boolean` omits the home-only quick list. Returns `null` for single-baby families.
   - Added i18n keys `home.twinActive` / `home.twinTapToFocus` (en: "★ Active" / "Tap to focus", he: "★ פעיל" / "לחצו לבחירה") — replaces the hardcoded English literals.
   - `HomeScreen.tsx`: replaced inline twin block with `<TwinPickerCards />`.
   - `SleepScreen.tsx`, `FeedScreen.tsx`, `GrowthScreen.tsx`: **replaced** `<TwinSelector ... />` segmented control with `<TwinPickerCards compact />`. Removed unused `selectedChildId` local state — data now filters by global `activeChild.id`.
   - `FoodTastingScreen.tsx`, `FoodScreen.tsx`: **added** `<TwinPickerCards compact />` near the top (they had no twin handling before).
   - `TwinSelector.tsx` kept on disk in case re-needed; no longer imported anywhere.

4. **Per-recipe Unsplash images + new fallback (from earlier same-day work)**
   - `supabase/functions/_shared/recipePrompt.ts`: added `buildRecipeImageUrl(category)` — strips non-ASCII, takes up to 2 tokens from category, appends `baby,food`, returns `https://source.unsplash.com/600x400/?<keywords>`.
   - `recipe-search/index.ts`: imports + sets `imageUrl` on every returned recipe. **Deployed to Supabase project `lolesbmajbrhbsmvxgos`.**
   - `apps/mobile/src/ai/client.ts`: `StructuredRecipe.imageUrl?: string` added.
   - `FoodScreen.tsx`: `aiRecipesToDisplay()` uses `recipe.imageUrl ?? FALLBACK_IMAGE`. New `FALLBACK_IMAGE` = baby-food bowl (`photo-1604908176997-125f25cc6f3d`), replaces the "guys-at-computers" photo.
   - `data/recipeIdeas.ts`: 6 seed Unsplash URLs replaced with deterministic food themes (avocado, pancakes, oatmeal, sweet potato, salmon, baby-food bowl).

### Files changed

| File | Change |
|------|--------|
| `apps/mobile/src/theme/useAppTheme.ts` | Indigo Dream palette + 3 new dock tokens |
| `apps/mobile/src/components/BottomEmojiTabBar.tsx` | `isDark` branch reads dock tokens (light path byte-identical) |
| `apps/mobile/src/components/TwinPickerCards.tsx` | NEW component (extracted from HomeScreen) |
| `apps/mobile/src/screens/HomeScreen.tsx` | Subtitle uses `sleepingStatus` when sleeping; uses `TwinPickerCards` |
| `apps/mobile/src/screens/SleepScreen.tsx` | TwinSelector → TwinPickerCards, removed local selectedChildId |
| `apps/mobile/src/screens/FeedScreen.tsx` | TwinSelector → TwinPickerCards |
| `apps/mobile/src/screens/GrowthScreen.tsx` | TwinSelector → TwinPickerCards |
| `apps/mobile/src/screens/FoodTastingScreen.tsx` | Added TwinPickerCards |
| `apps/mobile/src/screens/FoodScreen.tsx` | Added TwinPickerCards + uses per-recipe imageUrl |
| `apps/mobile/src/i18n/en.ts` | + `sleepingStatus`, `twinActive`, `twinTapToFocus` |
| `apps/mobile/src/i18n/he.ts` | + Hebrew translations (gender-aware verb) |
| `apps/mobile/src/ai/client.ts` | `StructuredRecipe.imageUrl?: string` |
| `apps/mobile/src/data/recipeIdeas.ts` | Food-themed deterministic Unsplash URLs |
| `supabase/functions/_shared/recipePrompt.ts` | `buildRecipeImageUrl(category)` helper |
| `supabase/functions/recipe-search/index.ts` | Attaches `imageUrl` to every recipe |
| `ui-lookbook/dark.html` | NEW — 6-variant dark-mode lookbook (Hebrew RTL, 3 phones each) |
| `ui-lookbook/index.html` | Added nav link to dark.html |

### Backend ops performed

- **Deployed:** `recipe-search` edge function (per-recipe images live in production)
- **Verified:** Supabase secrets `GEMINI_API_KEY`, `GEMINI_MODEL`, `OPENAI_API_KEY`, `OPENAI_MODEL` all set on project `lolesbmajbrhbsmvxgos`

### Tests

- **All 69 tests passing** ✅
- TypeScript clean ✅

### Notes for next session

- **Light mode is intentionally unchanged.** User explicitly requested only dark mode shift to Indigo Dream. Any future dark-mode tweaks must continue gating on `theme.isDark`.
- **Sleep status string assumes single active sleep session.** If `PrototypeState` ever supports per-child concurrent sleep sessions (e.g. both twins napping at once), `HomeScreen` subtitle logic needs to detect which child is sleeping rather than assuming `activeChild`.
- **`TwinSelector.tsx` is dead code now** — left on disk for safety. Delete in a follow-up if not re-used in 1-2 sessions.
- The "תזכורת" (reminder): the user runs `expo start --tunnel --clear` to get a QR scannable from anywhere (not just same Wi-Fi). Tunnel mode uses ngrok-style relay, so it's slower than LAN but works through corporate networks / cellular.

---

## 2026-05-25 — Dark mode polish + Supabase env + recipe-page age + settings icon (Windows session, latest)

**Branch:** `master` + `codex/littlenest-ai-prototype` (same fixes on both)

### Issues fixed (round 4 — from device screenshots in dark mode)

7. **Recipes / AI screens both showed "missing Supabase public connection settings" — recipes were offline, OpenAI/Gemini compare didn't run**
   - **Root cause:** `apps/mobile/.env` did not exist on this machine — only `.env.example` (template) and `ENV_LOCAL_EDIT_ME.txt` (real values). Expo only loads `.env` at Metro startup, so `process.env.EXPO_PUBLIC_SUPABASE_*` were the placeholders, and `hasSupabaseEnv()` returned `false`.
   - **Fix:** Copied `ENV_LOCAL_EDIT_ME.txt` → `apps/mobile/.env` (file is gitignored — secrets stayed local). Verified both `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are present and not placeholder strings. Metro restart with `--clear` picks them up.
   - **Result:** `hasSupabaseEnv()` now returns true → recipe-search edge function fires, ai-router fires, login flow works.

8. **Recipes page showed "גיל 18 חודשים" (months only) while Home page showed "שנה ו-6 חודשים" (years + months)**
   - **Root cause:** `i18n.recipes.helper(name, months)` was hard-coded to format months. Home page uses the shared `getAgeLabel()` util which handles years + months in Hebrew correctly.
   - **Fix:** Changed `helper` signature in `en.ts` and `he.ts` from `(name, months: number)` to `(name, ageLabel: string)`. `FoodScreen.tsx` now passes `getAgeLabel(activeChild.dateOfBirth, new Date(), family.language)` instead of the raw month count. (`ru.ts` re-exports `en.ts` so it picks up the change automatically.)
   - **Result:** Recipes page now shows the same age label as Home (`שנה ו-6 חודשים` / `1 year and 6 months`).

9. **Settings gear icon in the Home page WatercolorHeader was invisible in dark mode**
   - **Root cause:** Icon + border were hard-coded to `paletteBase.stickerCharcoal` (#2B2B3A) which sits on a near-black `theme.surface` (#2A2424) in dark mode — invisible.
   - **Fix:** In `HomeScreen.tsx`, swap `stickerCharcoal` for `theme.text` when `theme.isDark` (both the icon `color` and the button `borderColor`). Light mode behaviour is unchanged.
   - **Result:** Gear icon is now legible in both themes.

10. **Watercolor storybook header looked like a "washed-out grey blob" in dark mode**
    - **Root cause:** `WatercolorHeader` hard-coded `paletteBase.paperCream` for the bottom strip and `paletteBase.ink` for title text. On the dark `#1F1A1A` background, the cream strip created a weird light band and the dark `ink` text was unreadable on the muted accent overlay. The accent overlay opacity (0.55) over the dark page also turned the accent into mud.
    - **Fix:** Made `WatercolorHeader` theme-aware via `useAppTheme()`:
      - Bottom "paper" strip now uses `theme.background` (blends seamlessly in both modes)
      - Title / subtitle / sparkles now use `theme.text` / `theme.mutedText`
      - Accent overlay opacity drops to `0.32` (top) / `0.22` (mid) in dark mode, so the accent still tints the header but doesn't wash it out
    - **Result:** Header reads cleanly in both light and dark mode; the storybook title remains the visual anchor instead of a grey smudge.

### Files changed

| File | Change |
|------|--------|
| `apps/mobile/.env` (new, gitignored) | Copied from `ENV_LOCAL_EDIT_ME.txt` so Expo picks up the real Supabase publishable key |
| `apps/mobile/src/i18n/en.ts` | `recipes.helper(name, months: number)` → `(name, ageLabel: string)` |
| `apps/mobile/src/i18n/he.ts` | Same signature change for Hebrew helper |
| `apps/mobile/src/screens/FoodScreen.tsx` | Pass `getAgeLabel(dob, now, lang)` instead of raw months |
| `apps/mobile/src/screens/HomeScreen.tsx` | Settings gear `color` + `borderColor` now react to `theme.isDark` |
| `apps/mobile/src/components/WatercolorHeader.tsx` | Theme-aware: bottom strip uses `theme.background`, text uses `theme.text` / `theme.mutedText`, accent overlays use lower opacity in dark |

### Tests

- **All 69 tests passing** ✅

### Notes for next session

- `.env` is intentionally gitignored. If someone clones this on a fresh machine, repeat `cp apps/mobile/ENV_LOCAL_EDIT_ME.txt apps/mobile/.env` before `npx expo start`.
- Other screens (`AiScreen`, `FoodTastingScreen`, etc.) inherit the `WatercolorHeader` dark-mode improvements automatically since they all use that component. The card surfaces use `theme.surface` already — they're fine.

---

## 2026-05-25 — Learning card "14" font + Hebrew brand name (Windows session, latest)

**Branch:** `master` + `codex/littlenest-ai-prototype` (same fixes on both)

### Issues fixed

5. **Learning card body — the number `14` inside "...{trackedDays} ימי מעקב..." rendered with a smaller iOS fallback font next to Hebrew**
   - **Root cause:** Same digit-font-substitution issue we hit in `WatercolorHeader` — the entire `labels.learningBody(trackedDays)` string was one `<Text>`, so iOS swapped a different font for the digits when they sat next to Hebrew.
   - **Fix:** Added a `renderWithStyledDigits(text, digitStyle)` helper in `HomeScreen.tsx` (splits on `/(\d+)/` and wraps digit runs in an inner `<Text>`). Added a `learningBodyNumber` style (`typography.bodyBlack`, `fontSize: 18`, `fontWeight: '800'`).
   - **Result:** The `14` in "קן קטן עוקב — כרגע יש לקן הקטן **14** ימי מעקב..." now matches the body font and stands out at the larger size, the way the user wanted.

6. **The brand name "LittleNest" stayed in Latin letters even when the UI language was Hebrew**
   - **Root cause:** `he.ts` had hard-coded "LittleNest" inside three Hebrew strings (`home.learningKicker`, `home.learningBody`, `familySetup.startTesting`).
   - **Fix:** Translated to literal Hebrew meaning — "קן קטן" ("little nest"). With grammar tweaks:
     - kicker: `LittleNest עוקבת` → `קן קטן עוקב` (verb agrees with masculine "קן")
     - body: `כרגע יש ל-LittleNest ${n} ימי מעקב…` → `כרגע יש לקן הקטן ${n} ימי מעקב…` (definite article merges cleanly with the lamed prefix)
     - setup CTA: `התחלת בדיקת LittleNest` → `התחלת בדיקה ב-קן קטן`
   - **Result:** A Hebrew-locale user no longer sees Latin "LittleNest" inside Hebrew sentences; the brand reads as "קן קטן" throughout.

### Files changed

| File | Change |
|------|--------|
| `apps/mobile/src/screens/HomeScreen.tsx` | New `renderWithStyledDigits` helper + apply to `learningBody`; added `learningBodyNumber` style |
| `apps/mobile/src/i18n/he.ts` | Replaced 3 hard-coded `LittleNest` strings with `קן קטן` (grammar-adjusted) |

### Tests

- **All 69 tests passing** ✅

### Notes for next session

- English (`en.ts`) and Russian (`ru.ts`) **still say "LittleNest"** by design — only Hebrew was translated, because the user asked specifically for the Hebrew localization. If we later want a translated brand name in Russian too, we'd add it to `ru.ts` (currently re-exports `en`).
- The earlier `WatercolorHeader` subtitle digit-styling fix (item 4 below) is intentionally **kept** as a side benefit for the age subtitle (`14 חודשים`), even though the user originally meant the learning-card "14".

---

## 2026-05-25 — Home header age number font fix (Windows session, later)

**Branch:** `master` + `codex/littlenest-ai-prototype` (same fix on both)

### Issue fixed

4. **Home page header — baby age number (e.g. `14`) used a mismatched fallback font next to the Hebrew text**
   - **Root cause:** `WatercolorHeader.tsx` rendered the entire subtitle (`14 חודשים`) inside a single `<Text>` using `typography.body`. On iOS, when digits are mixed inline with Hebrew glyphs, the system substitutes a different font for the digits, which made the `14` look smaller and visually disconnected from `חודשים`.
   - **Fix:** Split the subtitle string on digit runs (`/(\d+)/`) and wrap each digit run in an inner `<Text>` with an explicit style (`typography.bodyBlack`, `fontSize: 17`, `fontWeight: '800'`). Non-digit parts keep the parent style.
   - **Result:** The number now stands out at a slightly larger size with the body-black font, and matches the rest of the header visually. Works for any age value (`1`, `14`, `18`, `24` …) and for English (`14 months`) and Russian (`14 месяцев`) too.

### Files changed

| File | Change |
|------|--------|
| `apps/mobile/src/components/WatercolorHeader.tsx` | Subtitle now parses out digit runs and styles them with `subtitleNumber` (fontSize 17, bodyBlack, weight 800). Added `subtitleNumber` style. |

### Tests

- **All 69 tests passing** ✅
- TypeScript clean.

---

## 2026-05-25 — Bug fixes from device testing (Windows session)

**Branch:** `master` + `codex/littlenest-ai-prototype` (same fixes on both)

### Issues fixed

1. **Sleep timer still showed `00:00:15` format instead of human Hebrew/English**
   - **Root cause:** `SleepScreen.tsx` was calling `formatDurationSeconds(seconds, true)` which always returns `HH:MM:SS`. The new `formatDurationHuman()` helper from `formatDuration.ts` was never wired in.
   - **Fix:** Imported `formatDurationHuman`, updated `getRunningDuration()` to accept a `language` param, and updated both the live timer and the inline history rows to use the human format.
   - **Result:** Timer now shows `12 שניות` → `5 דקות` → `1 שעה ו-35 דקות` in Hebrew, and `12 seconds` / `5 minutes` / `1 hr 35 min` in English.

2. **Recipe links to matkonia.co.il were 404ing**
   - **Root cause:** `buildSourceUrl()` in `supabase/functions/_shared/recipePrompt.ts` generated `https://www.matkonia.co.il/?s=<title>`. The site does NOT have a `www` subdomain — only `matkonia.co.il`.
   - **Verified:** Manually tested `https://matkonia.co.il/?s=עוף` — returns 9 chicken recipes. The bare domain works; `www.` does not.
   - **Fix:** Removed `www.` from the Hebrew search URL.
   - **Result:** Hebrew recipe links now resolve to real search results.

3. **Nursing buttons (ימין / שמאל) needed more spacing**
   - **Root cause:** `FeedScreen.tsx` `nursingGrid` style was `flexDirection: 'row'` with `gap: 10` — too cramped for the Hebrew labels and dual-button layout.
   - **Fix:** Changed `nursingGrid` to `flexDirection: 'column'` with `gap: 16`. Added `marginBottom: 6` to `sideTitle`.
   - **Result:** Left and right nursing cards now stack vertically with a clear row of space between them.

### Files changed

| File | Change |
|------|--------|
| `apps/mobile/src/screens/SleepScreen.tsx` | Import + use `formatDurationHuman` for live timer and history |
| `apps/mobile/src/screens/FeedScreen.tsx` | Nursing grid → column layout with proper spacing |
| `supabase/functions/_shared/recipePrompt.ts` | `www.matkonia.co.il` → `matkonia.co.il` |
| `apps/mobile/__tests__/sleepHistoryScreen.test.tsx` | Updated regex for new human duration format |
| `apps/mobile/__tests__/interactionFlows.test.tsx` | Updated 3 duration regex patterns |

### Tests

- **All 69 tests passing** ✅
- TypeScript clean (no `tsc --noEmit` errors triggered by these changes)

### Reminder for next session

The Supabase edge function `recipe-search` must be **redeployed** for the `www.` fix to take effect in production. The fix is in the repo, but the deployed function still has the old URL until someone runs:

```bash
supabase functions deploy recipe-search
```

---

## 2026-05-25 — Documentation: CLAUDE.md added (earlier today)

**Branch:** `codex/littlenest-ai-prototype` → merged to `master` via PR #1
**Commit:** `26f926b` (codex), merged into master.

- Added `CLAUDE.md` at the repo root documenting the worktree-vs-stub gotcha, commands, the Node-not-on-PATH workaround, architecture rules, and secrets handling.
- Prevents new Claude sessions from getting lost exploring the empty repo-root `apps/mobile/` directory.

---

## 2026-05-25 — PR #1 merged: Mixed Watercolor/Storybook UI + Twin support

**Branch merged:** `codex/littlenest-ai-prototype` → `master`
**Commit:** `0855a05`

### New theme system (`src/theme/`)
- `colors.ts` — central palette tokens
- `fonts.ts` — typography
- `index.ts` — exports
- `theme.ts` — `getAccentTheme(mode, sex, twinType)` returns the right accent based on context
- `useAppTheme.ts` — hook every component now uses (no more hardcoded colors)

### Visual identity
- Base: Soft Pastel Watercolor
- Headers (recipes / AI): Magical Storybook
- Bottom tab bar: Sticker Pop style
- Settings tab added to bottom dock

### Twin support
- Separate cards per child on Home screen
- `TwinSelector.tsx` (new component) on Sleep, Nursing, Growth
- `WatercolorHeader.tsx` (new component)
- `TwinsHomeScreen.tsx` (new screen)
- Accent color follows child sex (blue boy / pink girl); twins render two cards

### Hebrew UX polish
- Sleep duration: `12 שניות` / `5 דקות` / `1 שעה ו-14 דק'`
- Nursing rows: full `ימין` / `שמאל` labels, two-line layout
- Baby age: `18 חודשים`
- Recipe/AI storybook headers: `מתכונים טעימים` / `עצות חכמות`

### Recipe link fix (round 1 — partially worked)
- Switched from AI-generated direct URLs (which 404'd) to search-endpoint URLs
- Hebrew → `matkonia.co.il` (had `www.` bug, fixed on 2026-05-25 — see above)
- English/Russian → `solidstarts.com`

### Backend
- Supabase env wired up (`EXPO_PUBLIC_SUPABASE_URL` + key)
- `recipe-search` edge function: 6-recipe JSON array, age-appropriate prompts, locale-matched sourcing

### Tests
- All 69 tests passing
- TypeScript clean

---

## 2026-05-24 — Earlier work (summary from commit history)

- **AI-powered daily recipes** (`2b1787f`) — `recipe-search` edge function with 6-recipe JSON output, parsed by `recipeParser.ts`. Caches per child/date/language/nonce. Capped at 5 fresh fetches/day. Falls back to seed ideas offline.
- **History screens** (`14e1581`) — Growth / Sleep / Feed history (90-day cap), inline "Last 24 hours" card on each main screen. Added `HistoryListRow`, `InlineHistoryCard`, `historyFilters`, `formatHistoryDate` shared utilities.
- **Live-ticking timers** (`bf32b75`) — `useTickEverySecond` hook + shared `formatDuration` util. Sleep + nursing screens now re-render every second while active.
- **Android adaptive icons** (`18ad0e6`) — Fixed 512×512 placeholder icons; replaced with proper 1024×1024 RGBA.

---

## 2026-05-23 — Initial project bring-up

- Repo created.
- Expo SDK 54, React Native 0.81, React 19, TypeScript.
- Supabase backend connected (Auth + Postgres + Edge Functions).
- AI router edge function added (`bcabd11`).
- Local prototype reminders added (`07a0004`).
- All work happened in a git worktree at `.worktrees/littlenest-ai-prototype/` — repo-root `apps/mobile/` is intentionally empty.

---

## Standing reminders

- **Worktree structure:** Active code lives in `.worktrees/littlenest-ai-prototype/`, NOT at repo root.
- **i18n discipline:** Every new user-facing string MUST be added to `src/i18n/en.ts`, `he.ts`, AND `ru.ts`.
- **No direct AI calls:** All AI requests go through Supabase edge functions (`ai-router` or `recipe-search`). API keys live only in edge function env.
- **Theme discipline:** Never hardcode colors. Use `useAppTheme()` and `getChildAccent()`.
- **State discipline:** Mutate via `usePrototypeState()` context methods only. No direct AsyncStorage writes.
- **Windows host:** Node not on PATH. Prepend `export PATH="/c/Program Files/nodejs:$PATH"` (Bash) or `$env:Path = "C:\Program Files\nodejs;" + $env:Path` (PowerShell) before npm/npx.
- **Mac host:** Node at `/opt/homebrew/bin/`. Use full paths in scripts.
- **Hebrew RTL:** Watch text alignment. Use the `rtlText` style pattern from existing screens.
- **Folder name quirk:** The host folder is literally `web desgin` (typo intentional). Quote paths.

---

## Pending / open items

- ✏️ *Add items here as they come up.*
- ✏️ Redeploy `recipe-search` edge function to apply the `www.` → bare domain fix.
- ✏️ Verify on real iPhone (via Expo Go) that the human duration format renders correctly in RTL.
