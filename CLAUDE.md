# LittleNest — Worktree Reference

## Quick facts
- App: baby-tracking (sleep, nursing, growth, recipes, AI) · Expo SDK 54, RN 0.81, React 19, TypeScript
- Branch: `codex/littlenest-ai-prototype` (this worktree)
- GitHub: `xytek12/littlenest` · Supabase project ref: `lolesbmajbrhbsmvxgos`
- Test user: `test@gmail.com` / `Test1234!`

## Commands

Work from `.worktrees/littlenest-ai-prototype/apps/mobile/`.

**macOS** (Node via Homebrew at `/opt/homebrew/bin/`):
```bash
npm test                        # 69 Jest tests
npx tsc --noEmit                # TypeScript check
npx expo start --tunnel --clear # dev server (QR → Expo Go)
```
First-time macOS setup: `brew install node cocoapods` · install Xcode from App Store · `sudo xcode-select -s /Applications/Xcode.app/Contents/Developer` · `supabase link --project-ref lolesbmajbrhbsmvxgos`

**Windows** (Node at `C:\Program Files\nodejs` — must prepend PATH):
```powershell
$env:Path = "C:\Program Files\nodejs;" + $env:Path
& "C:\Program Files\nodejs\npm.cmd" test
& "C:\Program Files\nodejs\npx.cmd" tsc --noEmit
# Tunnel (opens a new cmd window):
Start-Process cmd -ArgumentList "/k", "cd /d ""<worktree>\apps\mobile"" && set Path=C:\Program Files\nodejs;%Path% && npx expo start --tunnel --clear"
```

## Architecture rules — never break these
- **State:** `src/state/PrototypeState.tsx` — call context methods only, never AsyncStorage directly
- **AI:** only via `supabase.functions.invoke('ai-router' | 'recipe-search')` — never call Gemini/OpenAI directly from the app
- **i18n:** add every user-facing string to `en.ts` first, then `he.ts`, then `ru.ts`. `en.ts` is the source of truth; `ru.ts` re-exports `en`.
- **Theme:** use `useAppTheme()` — never hardcode colors in components
- **Do NOT upgrade** Expo SDK 54 or React 19 — physical device Expo Go compatibility

## Secrets — NEVER read or print in transcript
`apps/mobile/.env.local` and `apps/mobile/ENV_LOCAL_EDIT_ME.txt`

## Navigation structure
| Tab (visible) | What |
|---|---|
| Recipes | FoodScreen |
| Home | HomeScreen — has Sleep/Feed/Growth/Tastings cards |
| AI | AiScreen |
| Settings | SettingsScreen |

Hidden tabs (navigated to from Home): `SleepFlow → SleepHistory`, `FeedFlow → FeedHistory`, `Growth → GrowthHistory`

Home cards: Sleep (SectionCard/active-card), Feed (FeedComposerSheet via "+"), Growth (GrowthComposerSheet via "+"), Food tasting

## Key files
| What | File |
|---|---|
| All state + context methods | `src/state/PrototypeState.tsx` |
| Home screen | `src/screens/HomeScreen.tsx` |
| Feed composer popup | `src/components/FeedComposerSheet.tsx` |
| Growth composer popup | `src/components/GrowthComposerSheet.tsx` |
| Sleep / Feed / Growth history | `src/screens/*HistoryScreen.tsx` |
| Theme tokens | `src/theme/index.ts` |
| Theme hook | `src/theme/useAppTheme.ts` |
| i18n source of truth | `src/i18n/en.ts` |
| Navigation root | `src/navigation/RootNavigator.tsx` |

## Theme tokens (key values)
- Boy: `#7FA6C9` / `#CFE0EE` / `#3E6A93` (primary / soft / deep)
- Girl: `#E8A6A0` / `#F6D9D2` / `#B65F5A`
- Dark canvas (Indigo Dream): bg `#161629`, text `#EFEAFF`, mutedText `#E8DAC8`
- Hebrew fonts: Frank Ruhl Libre (display) + Heebo (body)
- Section banners: `sectionAccents` in `src/theme/index.ts` (sleep/feed/food/learn)

## History screens pattern
All three history screens (Sleep, Feed, Growth) use the same date-grouped layout:
- `groupEntriesByDay` → day groups sorted newest-first
- `formatDayHeading` for the italic day heading
- `HistoryListRow` for each entry inside the day card

## User preferences
- Hebrew is the primary app language
- Baby: ענר (Aner), ~18 months
- Concise responses preferred
- Explain CLI steps (user is not a CLI expert)
