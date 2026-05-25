# LittleNest UI Refresh Execution Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved LittleNest prototype refresh so navigation, home actions, sleep/feed flows, settings, recipes, and food tasting match the saved design review.

**Architecture:** Keep the Expo Go prototype centered on the existing `PrototypeStateProvider`, but expand it from flat note logs into structured sleep/feed/session data. Rebuild navigation around four visible bottom tabs plus hidden flow screens, and keep visual changes localized to the current screen/component structure instead of introducing a new design system.

**Tech Stack:** Expo SDK 54, React Native, React Navigation bottom tabs, AsyncStorage-backed prototype state, Supabase schema/functions already present for later live data.

---

## File Map

- `apps/mobile/src/navigation/RootNavigator.tsx`
  - Replace the old five-tab shell with four visible tabs plus hidden flow screens.
- `apps/mobile/src/navigation/tabs.ts`
  - Define the new visible bottom-nav order.
- `apps/mobile/src/state/PrototypeState.tsx`
  - Expand persisted prototype data for settings, structured sleep sessions, nursing/bottle feeds, and richer home learning state.
- `apps/mobile/src/screens/HomeScreen.tsx`
  - Replace static summary cards with the approved learning-state hub and action routing.
- `apps/mobile/src/screens/SleepScreen.tsx`
  - Add a real running sleep session flow with start/end, timer, and wake-count entry.
- `apps/mobile/src/screens/FeedScreen.tsx`
  - Add bottle vs nursing flow, left/right breast controls, presets, and richer feed history.
- `apps/mobile/src/screens/FoodScreen.tsx`
  - Convert recipe search into image-first cards with daily idea rotation and readable summaries.
- `apps/mobile/src/screens/AiScreen.tsx`
  - Clean provider error presentation and remove raw provider failure text from the parent-facing surface.
- `apps/mobile/src/screens/GrowthScreen.tsx`
  - Keep growth as a visible bottom tab and align header/settings affordance.
- `apps/mobile/src/screens/FamilySetupScreen.tsx`
  - Fix keyboard overlap and align setup colors with strict single-child/twins rules.
- `apps/mobile/src/screens/SettingsScreen.tsx`
  - New hidden route for language, feed units, subscription placeholder, family setup entry, and logout.
- `apps/mobile/src/components/*`
  - Add small focused components only where they reduce duplication for headers, empty states, and recipe cards.
- `apps/mobile/__tests__/app.test.tsx`
  - Verify the new visible shell and route transitions.
- `apps/mobile/__tests__/prototypeState.test.tsx`
  - Drive the new structured sleep/feed/settings behavior from the provider.
- `apps/mobile/__tests__/foodScreen.test.tsx`
  - Lock readable recipe-card rendering and direct source CTA layout.
- `supabase/migrations/<new migration>.sql`
  - Add allergen reference tables and seed data once the mobile flows are stable.

### Task 1: Reshape Prototype State For The Refreshed Flows

**Files:**
- Modify: `apps/mobile/src/state/PrototypeState.tsx`
- Create: `apps/mobile/__tests__/prototypeState.test.tsx`

- [ ] Add failing provider tests for:
  - settings feed unit default/update
  - sleep start/end with duration and wake count
  - bottle feed preset/manual amount logging
  - nursing left/right duration totals
- [ ] Run: `npm test -- --watchAll=false prototypeState`
- [ ] Implement the minimal state shape and actions to satisfy the tests.
- [ ] Re-run the same test target until green.

### Task 2: Replace The Five-Tab Shell

**Files:**
- Modify: `apps/mobile/src/navigation/RootNavigator.tsx`
- Modify: `apps/mobile/src/navigation/tabs.ts`
- Modify: `apps/mobile/__tests__/app.test.tsx`
- Create: `apps/mobile/src/screens/SettingsScreen.tsx`

- [ ] Write failing navigation test updates for visible tabs:
  - `Recipes`
  - `Home`
  - `AI`
  - `Growth`
- [ ] Extend the same test or add one that proves Home routes into hidden Sleep/Feed/Food Tasting screens.
- [ ] Run: `npm test -- --watchAll=false app`
- [ ] Implement the new tab map, hidden flow routes, and settings route with the smallest working change.
- [ ] Re-run the test target until green.

### Task 3: Rebuild Home, Sleep, And Feed Around Real Actions

**Files:**
- Modify: `apps/mobile/src/screens/HomeScreen.tsx`
- Modify: `apps/mobile/src/screens/SleepScreen.tsx`
- Modify: `apps/mobile/src/screens/FeedScreen.tsx`
- Modify: `apps/mobile/src/components/ActionCard.tsx`
- Modify: `apps/mobile/src/components/Screen.tsx`

- [ ] Write failing UI tests for:
  - Home learning-state card when there are fewer than 14 days of logs
  - Sleep start/end behavior shown in-screen
  - Feed nursing/bottle controls shown with readable history rows
- [ ] Run focused Jest targets for the touched screens.
- [ ] Implement:
  - Home action routing
  - keyboard-safe setup/screen behavior
  - Sleep timer/status layout
  - Feed choice flow and history cards
- [ ] Re-run the focused tests, then the full suite.

### Task 4: Rebuild Recipes And Food Tasting Presentation

**Files:**
- Modify: `apps/mobile/src/screens/FoodScreen.tsx`
- Create or modify: focused recipe-card component(s)
- Create: `apps/mobile/__tests__/foodScreen.test.tsx`

- [ ] Write failing tests that prove:
  - dish title is below the image
  - short benefit summary is visible
  - source CTA remains separate and readable
- [ ] Run the focused food test target.
- [ ] Implement the new recipe card layout and daily-rotation state usage.
- [ ] Re-run focused tests until green.

### Task 5: Add Settings And Allergen Data Follow-Through

**Files:**
- Modify: `apps/mobile/src/screens/SettingsScreen.tsx`
- Modify: `apps/mobile/src/screens/FamilySetupScreen.tsx`
- Create: `supabase/migrations/20260524_add_allergen_reference.sql`

- [ ] Add failing tests for feed-unit switching and settings navigation.
- [ ] Implement the mobile settings surface and family-setup keyboard/layout fixes.
- [ ] Add the allergen reference migration with grouped categories and detailed fish/nut items.
- [ ] Run mobile tests plus `npx tsc --noEmit`.

### Task 6: Final Verification And Device Preview

**Files:**
- No new product files expected beyond any small follow-up fixes.

- [ ] Run: `npm test -- --watchAll=false`
- [ ] Run: `npx tsc --noEmit`
- [ ] Run: `npx expo install --check`
- [ ] Start Expo again for device review and open the local browser preview if needed.
- [ ] Commit the refresh work in logical slices.
