# LittleNest — Memory Log

A running log of every change made to this project so we (and any Claude session) can pick up exactly where we left off. **Read this first** when resuming work.

> **Note:** This file lives in both `master` and `codex/littlenest-ai-prototype`. Keep them in sync.

---

## How to use this file

- **Newest entries at the top.** Add a new dated section every time you finish a meaningful change.
- **Each entry must include:** date, what changed, why, files touched, test status.
- **Be honest about half-finished work.** If something is broken or pending, write it down here.

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
