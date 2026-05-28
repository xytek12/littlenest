# LittleNest — Project Guide for Claude

## What this project is
LittleNest is a **baby-tracking mobile app for parents** (sleep, nursing, growth, recipes, AI advice). Built as a React Native / Expo prototype with a Supabase backend. Owner: GitHub account **xytek12**.

---

## Repo
- **GitHub**: `xytek12/littlenest`
- **Active branch**: `codex/littlenest-ai-prototype` ← all app code lives here
- `master` has the design spec + implementation plan; `main` has only a README

```bash
git clone https://github.com/xytek12/littlenest.git
cd littlenest
git checkout codex/littlenest-ai-prototype
```

---

## Stack
| Layer | Tech |
|---|---|
| Mobile app | React Native, Expo SDK 54, TypeScript |
| Navigation | React Navigation (bottom tabs + stack) |
| State | React Context + AsyncStorage (`littlenest.prototype.state.v3`) |
| Backend | Supabase (auth, DB, Edge Functions) |
| AI | Gemini / OpenAI via Supabase Edge Functions |
| i18n | Custom — `en.ts` / `he.ts` / `ru.ts` (ru re-exports en) |

---

## Mono-repo structure
```
littlenest/
├── apps/mobile/          ← Expo app (all UI code here)
│   ├── src/
│   │   ├── components/   ← Reusable components
│   │   ├── i18n/         ← en.ts, he.ts, ru.ts
│   │   ├── navigation/   ← RootNavigator, tabs.ts
│   │   ├── screens/      ← One file per screen
│   │   ├── services/     ← supabase.ts client
│   │   ├── state/        ← PrototypeState.tsx (React Context)
│   │   ├── theme/        ← colors.ts, theme.ts, fonts.ts, index.ts, useAppTheme.ts
│   │   └── utils/        ← age.ts, formatDuration.ts, etc.
│   ├── __tests__/        ← Jest tests (69 tests, all passing)
│   ├── .env              ← EXPO_PUBLIC_SUPABASE_URL + EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY
│   └── package.json
├── supabase/
│   ├── functions/
│   │   ├── recipe-search/   ← Edge function (language-aware recipe search)
│   │   └── _shared/         ← recipePrompt.ts, recipeParser.ts, aiProviders.ts
│   └── config.toml
├── .claude/
│   └── launch.json       ← Dev server configs for Claude Code preview
└── CLAUDE.md             ← This file
```

---

## Environment setup (new machine checklist)

### 1. Homebrew + Node
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
```
Node lives at `/opt/homebrew/bin/node` — **always use full path in scripts**.

### 2. Install app dependencies
```bash
cd apps/mobile
npm install
```

### 3. Xcode (iOS Simulator)
- Install Xcode from the App Store
- Run: `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer`
- Accept license: `sudo xcodebuild -license accept`
- Download iOS runtime: Xcode → Settings → Platforms → iOS → install latest
- Verify: `xcrun simctl list runtimes` (should show at least one iOS runtime)

### 4. CocoaPods
```bash
brew install cocoapods
```

### 5. Supabase CLI
```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref lolesbmajbrhbsmvxgos
```

### 6. Environment variables
Create `apps/mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=https://lolesbmajbrhbsmvxgos.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your anon/publishable key from Supabase dashboard>
```
Get the key from: https://supabase.com/dashboard/project/lolesbmajbrhbsmvxgos/settings/api

### 7. GitHub CLI (optional, for PR management)
```bash
brew install gh
gh auth login
```

---

## Running the app

### First time (native build — required after new dependencies)
```bash
cd apps/mobile
PATH="/opt/homebrew/bin:$PATH" LANG=en_US.UTF-8 node node_modules/.bin/expo run:ios
```
This takes ~5–10 min first time (compiles native iOS app + CocoaPods).

### Subsequent runs (Metro only — fast)
```bash
cd apps/mobile
PATH="/opt/homebrew/bin:$PATH" node node_modules/.bin/expo start --ios --dev-client --clear
```

### CRITICAL PATH RULE
Node/npm/npx are at `/opt/homebrew/bin/` — **NOT on the default subprocess PATH**.  
Always use full paths in scripts and Claude tool calls:
- ✅ `/opt/homebrew/bin/node`
- ✅ `/opt/homebrew/bin/npm`
- ✅ `/opt/homebrew/bin/npx`
- ❌ `node`, `npm`, `npx` (will fail with "No such file or directory")

For Expo: `node node_modules/.bin/expo` not `npx expo`.

---

## .claude/launch.json configs
The project has pre-configured dev server configs for Claude Code's `preview_start`:
- **Expo iOS Simulator** — `expo start --ios --dev-client --clear` on port 8081
- **Expo Dev Server (Metro)** — plain metro on port 8081
- **Expo Web** — web mode on port 8081
- **Supabase Local Stack** — port 54323
- **UI Lookbook** — static HTML theme preview on port 4321

---

## i18n pattern
- `src/i18n/en.ts` is the **source of truth**
- `Dictionary` type is `typeof en` — adding a field to `en.ts` auto-extends the type
- `he.ts` has Hebrew translations (add the same keys)
- `ru.ts` re-exports `en` (Russian falls back to English)
- Access via `getDictionary(language)` → `dictionary.sleep.title` etc.

---

## Theme system
Introduced in the last session. Central file: `src/theme/index.ts`.

- `getPalette(babyType)` — returns palette for `{mode: 'single', sex: 'boy'|'girl'}` or `{mode: 'twins', twinType: ...}`
- **Girl**: petal pink `#E8A6A0` accent, blush `#F6D9D2` highlight
- **Boy**: cornflower `#7FA6C9` accent, sky `#CFE0EE` highlight  
- **Twins**: pink for twin A + blue for twin B, lavender `#C9BBD9` shared
- Fonts: Fraunces (display) + Nunito (body) + Cormorant Garamond italic (storybook headers)
- **Hebrew fonts**: Frank Ruhl Libre (display) + Heebo (body) — packages `@expo-google-fonts/frank-ruhl-libre` + `@expo-google-fonts/heebo`
- Bottom dock bar: Sticker Pop style (chunky, hard shadow, active pill)
- Screen headers: Magical Storybook gradient with ⋆ stars (via `WatercolorHeader` component)
- New tokens in `src/theme/index.ts`: `genderedBg`, `jewelDark`, `sectionAccents`, `typographyHe`
- Dark mode canvas: Indigo Dream — `#161629` bg, `#EFEAFF` text, `#D9C8B6` mutedText

---

## Key screens & their files
| Screen | File |
|---|---|
| Home | `src/screens/HomeScreen.tsx` |
| Sleep timer + history | `src/screens/SleepScreen.tsx`, `SleepHistoryScreen.tsx` |
| Nursing/bottle + history | `src/screens/FeedScreen.tsx`, `FeedHistoryScreen.tsx` |
| Growth tracking | `src/screens/GrowthScreen.tsx` |
| AI advice | `src/screens/AiScreen.tsx` |
| Recipes | `src/screens/FoodScreen.tsx`, `FoodTastingScreen.tsx` |
| Settings | `src/screens/SettingsScreen.tsx` |
| Family setup | `src/screens/FamilySetupScreen.tsx` |

---

## Supabase Edge Functions
- **recipe-search**: Language-aware recipe search
  - Hebrew → only `matkonia.co.il` (search URL: `matkonia.co.il/?s=TERM`)
  - English → `solidstarts.com`, `babyfoode.com`, `weelicious.com`
  - Russian → falls back to English sources
  - Deploy: `supabase functions deploy recipe-search`
- **ai-router**: Routes AI requests to Gemini/OpenAI

---

## What was built (session history)

### Sleep section
- Live timer (start/stop)
- Manual edit modal: ✏️ button on history rows → edit start time, end time, wake count
- Midnight crossover logic (if end < start, add 1 day)
- Human-readable duration: "12 שניות" / "5 דקות" / "1 שעה ו-14 דק'" (not raw HH:MM:SS)
- Wakes count on its own row below the duration

### Nursing section
- Bottle and nursing tracking
- Two-line history rows: date + "הנקה" label on top, "שמאל: 13 דק' | ימין: 11 דק'" on bottom
- Full "ימין"/"שמאל" words (not abbreviations)

### AI mode
- Supabase connection wired (requires `.env` to be filled)
- Compares OpenAI + Gemini for sleep suggestions

### Recipes
- Language-aware source restriction
- Links use search URLs (not AI-hallucinated page URLs → fixes 404s)

### UI theme (mixed)
- Soft Pastel Watercolor base
- Magical Storybook headers ("פרק: שעת חלום ⋆")
- Sticker Pop bottom dock bar
- Settings tab added to dock
- Twin mode: separate child cards on Home, twin selector on detail screens

### Auth
- Test user: `test@gmail.com` / `Test1234!` (reset via Supabase SQL)

---

## Tests
```bash
cd apps/mobile
PATH="/opt/homebrew/bin:$PATH" npx jest          # run all (69 tests)
PATH="/opt/homebrew/bin:$PATH" npx tsc --noEmit  # TypeScript check
```
All 69 tests passing. TypeScript clean.

---

## New Components (2026-05-27 redesign)

| Component | File | Notes |
|---|---|---|
| SectionCard | `src/components/SectionCard.tsx` | Nara-style card with colored banner, "+" pill, last-event row, "View History ›" footer |
| GenderedBackground | `src/components/GenderedBackground.tsx` | Reads `family`+`activeChild` from PrototypeState; light=pastel, dark=jewel canvas |
| formatDateLong | `src/utils/formatDateLong.ts` | Explicit dates (not relative); EN + HE formats |

## Supabase Edge Functions

| Function | Version | Notes |
|---|---|---|
| `ai-router` | v17 | Gemini 2.5-flash; structured error logging; `Promise.allSettled` |
| `recipe-search` | v23 | Per-stage logging; parser tolerates fences + object wrapper + trailing commas |

Gemini model: `gemini-2.5-flash` (set in `supabase/functions/_shared/aiProviders.ts` + Supabase secret)

---

## User preferences
- **Non-expert in CLI** — needs step-by-step guidance for tooling setup
- **Prefers concise responses**
- **Hebrew** is the primary language for the app
- Baby name in test data: **ענר** (Aner), age ~18 months
- Supabase project ref: `lolesbmajbrhbsmvxgos`
