# LittleNest — Memory Log

A running log of every change made to this project so we (and any Claude session) can pick up exactly where we left off. **Read this first** when resuming work.

> **Note:** This file lives in both `master` and `codex/littlenest-ai-prototype`. Keep them in sync.

---

## How to use this file

- **Newest entries at the top.** Add a new dated section every time you finish a meaningful change.
- **Each entry must include:** date, what changed, why, files touched, test status.
- **Be honest about half-finished work.** If something is broken or pending, write it down here.

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

**Branch:** `master` (cherry-pick to `codex/littlenest-ai-prototype` if still active)
**Commit:** `e210588`

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
- **Hebrew RTL:** Watch text alignment. Use the `rtlText` style pattern from existing screens.
- **Folder name quirk:** The host folder is literally `web desgin` (typo intentional). Quote paths.

---

## Pending / open items

- ✏️ *Add items here as they come up.*
- ✏️ Redeploy `recipe-search` edge function to apply the `www.` → bare domain fix.
- ✏️ Verify on real iPhone (via Expo Go) that the human duration format renders correctly in RTL.
