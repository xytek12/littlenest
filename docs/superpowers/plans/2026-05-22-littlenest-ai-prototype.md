# LittleNest AI Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the LittleNest AI Expo Go prototype with Supabase auth/data, Gemini + OpenAI admin comparison, recipe web search, richer baby tracking, local reminders, and the approved parent-friendly UI direction.

**Architecture:** Use a small monorepo shape: Expo mobile app in `apps/mobile`, Supabase schema and Edge Functions in `supabase`, and specs/plans in `docs`. The Expo app never stores AI provider secrets; it calls Supabase Edge Functions, which route to Gemini and OpenAI and persist comparison metadata.

**Tech Stack:** Expo + React Native + TypeScript, React Navigation bottom tabs, Supabase Auth/Postgres/RLS/Edge Functions, Gemini API with Google Search grounding, OpenAI Responses API, Expo Notifications, Jest + React Native Testing Library.

---

## References Checked Before Planning

- Expo currently recommends `npx create-expo-app@latest` for new projects: https://docs.expo.dev/
- Supabase Edge Functions expose secrets through `Deno.env.get(...)` and support local `--env-file`: https://supabase.com/docs/guides/functions/secrets
- OpenAI's current generation interface is the Responses API: https://platform.openai.com/docs/api-reference/responses
- Gemini supports Google Search grounding and returns source metadata: https://ai.google.dev/gemini-api/docs/google-search

## File Structure

Create this structure:

```text
apps/mobile/
  App.tsx
  app.json
  package.json
  tsconfig.json
  src/
    ai/
      client.ts
      prompts.ts
      types.ts
    components/
      ActionCard.tsx
      AiSuggestionCard.tsx
      BottomTabIcon.tsx
      ChildSwitcher.tsx
      ConfidenceBadge.tsx
      FoodTestProgress.tsx
      Screen.tsx
    data/
      mockSeed.ts
    i18n/
      index.ts
      en.ts
      he.ts
      ru.ts
    navigation/
      RootNavigator.tsx
      tabs.ts
    notifications/
      localReminders.ts
    screens/
      AiScreen.tsx
      FamilySetupScreen.tsx
      FeedScreen.tsx
      FoodScreen.tsx
      GrowthScreen.tsx
      HomeScreen.tsx
      LoginScreen.tsx
      SleepScreen.tsx
      TwinsHomeScreen.tsx
    services/
      supabase.ts
      trackingRepository.ts
    theme/
      colors.ts
      theme.ts
      useAppTheme.ts
    types/
      domain.ts
      database.ts
    utils/
      age.ts
      confidence.ts
      foodTests.ts
  __tests__/
    age.test.ts
    confidence.test.ts
    foodTests.test.ts
    theme.test.ts
supabase/
  config.toml
  migrations/
    <created-by-supabase-cli>_initial_littlenest_schema.sql
  functions/
    _shared/
      aiProviders.ts
      cors.ts
      promptBuilder.ts
      responseSchema.ts
      supabaseAdmin.ts
    ai-router/
      index.ts
    recipe-search/
      index.ts
docs/superpowers/
  specs/
  plans/
```

Responsibilities:

- `apps/mobile/src/types/domain.ts`: product domain types used by UI and tests.
- `apps/mobile/src/theme/*`: light/dark base and baby/twins accent rules.
- `apps/mobile/src/i18n/*`: English-first copy with Hebrew/Russian keys ready.
- `apps/mobile/src/services/supabase.ts`: authenticated Supabase client only.
- `apps/mobile/src/services/trackingRepository.ts`: one interface for reading/writing tracking data.
- `apps/mobile/src/ai/client.ts`: calls Supabase Edge Functions, never direct Gemini/OpenAI calls.
- `supabase/migrations/*`: database tables, indexes, RLS, and policies.
- `supabase/functions/_shared/*`: provider routing, prompt building, CORS, and response validation.
- `supabase/functions/ai-router/index.ts`: Gemini + OpenAI comparison and normal recommended answer.
- `supabase/functions/recipe-search/index.ts`: grounded food/recipe search with sources.

## Task 1: Scaffold Expo Mobile App

**Files:**
- Create: `apps/mobile/`
- Create: `apps/mobile/App.tsx`
- Create: `apps/mobile/src/`
- Modify: `.gitignore`

- [ ] **Step 1: Create the Expo app**

Run:

```powershell
npx create-expo-app@latest apps/mobile --template blank-typescript
```

Expected: `apps/mobile/package.json`, `apps/mobile/App.tsx`, and TypeScript config are created.

- [ ] **Step 2: Install runtime dependencies**

Run:

```powershell
Set-Location apps/mobile
npx expo install react-native-screens react-native-safe-area-context @react-native-async-storage/async-storage expo-notifications expo-device
npm install @react-navigation/native @react-navigation/bottom-tabs @supabase/supabase-js zod
Set-Location ../..
```

Expected: dependencies are added to `apps/mobile/package.json`.

- [ ] **Step 3: Install test dependencies**

Run:

```powershell
Set-Location apps/mobile
npm install --save-dev jest jest-expo @testing-library/react-native @testing-library/jest-native react-test-renderer
Set-Location ../..
```

Expected: dev dependencies are added.

- [ ] **Step 4: Add ignore rules**

Modify `.gitignore` so it contains:

```gitignore
.superpowers/
node_modules/
apps/mobile/node_modules/
apps/mobile/.expo/
apps/mobile/dist/
.env
.env.*
supabase/.env
supabase/functions/.env
```

- [ ] **Step 5: Add basic scripts**

Modify `apps/mobile/package.json` scripts to include:

```json
{
  "start": "expo start",
  "android": "expo start --android",
  "ios": "expo start --ios",
  "web": "expo start --web",
  "test": "jest --watchAll=false"
}
```

- [ ] **Step 6: Verify the scaffold**

Run:

```powershell
Set-Location apps/mobile
npm test -- --passWithNoTests
Set-Location ../..
```

Expected: Jest exits successfully even before tests are added.

- [ ] **Step 7: Commit**

Run:

```powershell
git add .gitignore apps/mobile
git commit -m "chore: scaffold Expo mobile app"
```

## Task 2: Add Domain Types And Pure Utility Tests

**Files:**
- Create: `apps/mobile/src/types/domain.ts`
- Create: `apps/mobile/src/utils/age.ts`
- Create: `apps/mobile/src/utils/confidence.ts`
- Create: `apps/mobile/src/utils/foodTests.ts`
- Create: `apps/mobile/__tests__/age.test.ts`
- Create: `apps/mobile/__tests__/confidence.test.ts`
- Create: `apps/mobile/__tests__/foodTests.test.ts`

- [ ] **Step 1: Write age tests**

Create `apps/mobile/__tests__/age.test.ts`:

```ts
import { getAgeInMonths, getAgeLabel } from '../src/utils/age';

describe('age utilities', () => {
  it('calculates completed age in months', () => {
    expect(getAgeInMonths('2025-10-22', new Date('2026-05-22T12:00:00Z'))).toBe(7);
  });

  it('returns a friendly age label', () => {
    expect(getAgeLabel('2025-11-22', new Date('2026-05-22T12:00:00Z'))).toBe('6 months');
  });
});
```

- [ ] **Step 2: Write confidence tests**

Create `apps/mobile/__tests__/confidence.test.ts`:

```ts
import { toConfidenceLabel } from '../src/utils/confidence';

describe('confidence labels', () => {
  it('maps scores to parent-friendly labels', () => {
    expect(toConfidenceLabel(0.25)).toBe('Low');
    expect(toConfidenceLabel(0.58)).toBe('Medium');
    expect(toConfidenceLabel(0.83)).toBe('High');
  });
});
```

- [ ] **Step 3: Write food test tests**

Create `apps/mobile/__tests__/foodTests.test.ts`:

```ts
import { getFoodTestStatus, nextFoodTestCount } from '../src/utils/foodTests';

describe('food allergy test helpers', () => {
  it('caps food tests at three observations', () => {
    expect(nextFoodTestCount(0)).toBe(1);
    expect(nextFoodTestCount(2)).toBe(3);
    expect(nextFoodTestCount(3)).toBe(3);
  });

  it('describes test progress', () => {
    expect(getFoodTestStatus(0)).toBe('Not started');
    expect(getFoodTestStatus(1)).toBe('1/3 tested');
    expect(getFoodTestStatus(2)).toBe('2/3 tested');
    expect(getFoodTestStatus(3)).toBe('Completed');
  });
});
```

- [ ] **Step 4: Run tests and confirm failure**

Run:

```powershell
Set-Location apps/mobile
npm test
Set-Location ../..
```

Expected: tests fail because utility modules do not exist.

- [ ] **Step 5: Add domain types**

Create `apps/mobile/src/types/domain.ts`:

```ts
export type ChildSex = 'boy' | 'girl';
export type TwinType = 'boy_boy' | 'girl_girl' | 'boy_girl';
export type FamilyMode = 'single' | 'twins';
export type AppLanguage = 'en' | 'he' | 'ru';
export type ConfidenceLabel = 'Low' | 'Medium' | 'High';
export type AiProvider = 'gemini' | 'openai' | 'claude';
export type AiPromptType = 'sleep' | 'hunger' | 'food_tasting' | 'recipe';
export type AiFeedbackRating = 'good' | 'okay' | 'bad';

export type ChildProfile = {
  id: string;
  familyId: string;
  displayName: string;
  sex: ChildSex;
  dateOfBirth: string;
};

export type TrackingLogType =
  | 'sleep'
  | 'feed'
  | 'solid_food'
  | 'diaper'
  | 'mood'
  | 'note'
  | 'illness'
  | 'teething'
  | 'medication'
  | 'unusual_day';

export type FoodTestStatus = 'Not started' | '1/3 tested' | '2/3 tested' | 'Completed';
```

- [ ] **Step 6: Add age utilities**

Create `apps/mobile/src/utils/age.ts`:

```ts
export function getAgeInMonths(dateOfBirth: string, now = new Date()): number {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  let months = (now.getUTCFullYear() - birth.getUTCFullYear()) * 12;
  months += now.getUTCMonth() - birth.getUTCMonth();
  if (now.getUTCDate() < birth.getUTCDate()) {
    months -= 1;
  }
  return Math.max(0, months);
}

export function getAgeLabel(dateOfBirth: string, now = new Date()): string {
  const months = getAgeInMonths(dateOfBirth, now);
  return months === 1 ? '1 month' : `${months} months`;
}
```

- [ ] **Step 7: Add confidence utility**

Create `apps/mobile/src/utils/confidence.ts`:

```ts
import type { ConfidenceLabel } from '../types/domain';

export function toConfidenceLabel(score: number): ConfidenceLabel {
  if (score >= 0.75) return 'High';
  if (score >= 0.45) return 'Medium';
  return 'Low';
}
```

- [ ] **Step 8: Add food test utility**

Create `apps/mobile/src/utils/foodTests.ts`:

```ts
import type { FoodTestStatus } from '../types/domain';

export function nextFoodTestCount(currentCount: number): number {
  return Math.min(3, Math.max(0, currentCount) + 1);
}

export function getFoodTestStatus(count: number): FoodTestStatus {
  if (count >= 3) return 'Completed';
  if (count === 2) return '2/3 tested';
  if (count === 1) return '1/3 tested';
  return 'Not started';
}
```

- [ ] **Step 9: Run tests and confirm pass**

Run:

```powershell
Set-Location apps/mobile
npm test
Set-Location ../..
```

Expected: all utility tests pass.

- [ ] **Step 10: Commit**

Run:

```powershell
git add apps/mobile/src/types apps/mobile/src/utils apps/mobile/__tests__
git commit -m "test: add baby tracking domain utilities"
```

## Task 3: Add Theme System And Localization Shell

**Files:**
- Create: `apps/mobile/src/theme/colors.ts`
- Create: `apps/mobile/src/theme/theme.ts`
- Create: `apps/mobile/src/theme/useAppTheme.ts`
- Create: `apps/mobile/src/i18n/en.ts`
- Create: `apps/mobile/src/i18n/he.ts`
- Create: `apps/mobile/src/i18n/ru.ts`
- Create: `apps/mobile/src/i18n/index.ts`
- Create: `apps/mobile/__tests__/theme.test.ts`

- [ ] **Step 1: Write theme tests**

Create `apps/mobile/__tests__/theme.test.ts`:

```ts
import { getAccentTheme } from '../src/theme/theme';

describe('theme accent rules', () => {
  it('uses blue for one boy', () => {
    expect(getAccentTheme({ mode: 'single', sex: 'boy' }).primary).toBe('#72BDF2');
  });

  it('uses pink for one girl', () => {
    expect(getAccentTheme({ mode: 'single', sex: 'girl' }).primary).toBe('#F4A3C7');
  });

  it('uses blue for boy and boy twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'boy_boy' }).primary).toBe('#72BDF2');
  });

  it('uses pink for girl and girl twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'girl_girl' }).primary).toBe('#F4A3C7');
  });

  it('uses split colors only for boy and girl twins', () => {
    expect(getAccentTheme({ mode: 'twins', twinType: 'boy_girl' }).secondary).toBe('#F4A3C7');
  });
});
```

- [ ] **Step 2: Run tests and confirm failure**

Run:

```powershell
Set-Location apps/mobile
npm test -- theme.test.ts
Set-Location ../..
```

Expected: fails because theme files do not exist.

- [ ] **Step 3: Add color constants**

Create `apps/mobile/src/theme/colors.ts`:

```ts
export const colors = {
  blue: '#72BDF2',
  blueSoft: '#EAF6FF',
  pink: '#F4A3C7',
  pinkSoft: '#FFF0F7',
  white: '#FFFFFF',
  black: '#05070A',
  textLight: '#17202B',
  textDark: '#F4F7FB',
  neutral: '#F7F4EE',
  sage: '#7FA99B',
  berry: '#B95773',
  warning: '#F0C979',
} as const;
```

- [ ] **Step 4: Add theme resolver**

Create `apps/mobile/src/theme/theme.ts`:

```ts
import type { ChildSex, TwinType } from '../types/domain';
import { colors } from './colors';

export type AccentInput =
  | { mode: 'single'; sex: ChildSex }
  | { mode: 'twins'; twinType: TwinType };

export type AccentTheme = {
  primary: string;
  secondary?: string;
  softPrimary: string;
  softSecondary?: string;
};

export function getAccentTheme(input: AccentInput): AccentTheme {
  if (input.mode === 'single') {
    return input.sex === 'boy'
      ? { primary: colors.blue, softPrimary: colors.blueSoft }
      : { primary: colors.pink, softPrimary: colors.pinkSoft };
  }

  if (input.twinType === 'boy_girl') {
    return {
      primary: colors.blue,
      secondary: colors.pink,
      softPrimary: colors.blueSoft,
      softSecondary: colors.pinkSoft,
    };
  }

  return input.twinType === 'boy_boy'
    ? { primary: colors.blue, softPrimary: colors.blueSoft }
    : { primary: colors.pink, softPrimary: colors.pinkSoft };
}
```

- [ ] **Step 5: Add system-mode hook**

Create `apps/mobile/src/theme/useAppTheme.ts`:

```ts
import { useColorScheme } from 'react-native';
import { colors } from './colors';

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    background: isDark ? colors.black : colors.white,
    text: isDark ? colors.textDark : colors.textLight,
    surface: isDark ? '#111820' : colors.white,
    border: isDark ? '#263443' : '#E6EDF5',
  };
}
```

- [ ] **Step 6: Add English copy**

Create `apps/mobile/src/i18n/en.ts`:

```ts
export const en = {
  tabs: { sleep: 'Sleep', food: 'Food', home: 'Home', feed: 'Feed', ai: 'AI' },
  confidence: { low: 'Low', medium: 'Medium', high: 'High' },
  actions: { logSleep: 'Log sleep', logFeed: 'Log feed', askAi: 'Ask AI', searchRecipes: 'Search recipes' },
  safety: { doctor: 'Follow your doctor for medical concerns or unusual symptoms.' },
};
```

- [ ] **Step 7: Add Hebrew copy shell**

Create `apps/mobile/src/i18n/he.ts`:

```ts
export const he = {
  tabs: { sleep: 'Sleep', food: 'Food', home: 'Home', feed: 'Feed', ai: 'AI' },
  confidence: { low: 'Low', medium: 'Medium', high: 'High' },
  actions: { logSleep: 'Log sleep', logFeed: 'Log feed', askAi: 'Ask AI', searchRecipes: 'Search recipes' },
  safety: { doctor: 'Follow your doctor for medical concerns or unusual symptoms.' },
};
```

- [ ] **Step 8: Add Russian copy shell**

Create `apps/mobile/src/i18n/ru.ts`:

```ts
export const ru = {
  tabs: { sleep: 'Sleep', food: 'Food', home: 'Home', feed: 'Feed', ai: 'AI' },
  confidence: { low: 'Low', medium: 'Medium', high: 'High' },
  actions: { logSleep: 'Log sleep', logFeed: 'Log feed', askAi: 'Ask AI', searchRecipes: 'Search recipes' },
  safety: { doctor: 'Follow your doctor for medical concerns or unusual symptoms.' },
};
```

- [ ] **Step 9: Add localization selector**

Create `apps/mobile/src/i18n/index.ts`:

```ts
import type { AppLanguage } from '../types/domain';
import { en } from './en';
import { he } from './he';
import { ru } from './ru';

const dictionaries = { en, he, ru };

export function getDictionary(language: AppLanguage) {
  return dictionaries[language];
}
```

- [ ] **Step 10: Run tests and commit**

Run:

```powershell
Set-Location apps/mobile
npm test
Set-Location ../..
git add apps/mobile/src/theme apps/mobile/src/i18n apps/mobile/__tests__/theme.test.ts
git commit -m "feat: add adaptive baby theme system"
```

## Task 4: Build Navigation And Core UI Components

**Files:**
- Modify: `apps/mobile/App.tsx`
- Create: `apps/mobile/src/navigation/RootNavigator.tsx`
- Create: `apps/mobile/src/navigation/tabs.ts`
- Create: `apps/mobile/src/components/Screen.tsx`
- Create: `apps/mobile/src/components/ActionCard.tsx`
- Create: `apps/mobile/src/components/AiSuggestionCard.tsx`
- Create: `apps/mobile/src/components/ConfidenceBadge.tsx`
- Create: `apps/mobile/src/components/FoodTestProgress.tsx`

- [ ] **Step 1: Add tab config**

Create `apps/mobile/src/navigation/tabs.ts`:

```ts
export const tabs = [
  { name: 'Sleep', label: 'Sleep' },
  { name: 'Food', label: 'Food' },
  { name: 'Home', label: 'Home' },
  { name: 'Feed', label: 'Feed' },
  { name: 'AI', label: 'AI' },
] as const;
```

- [ ] **Step 2: Add Screen wrapper**

Create `apps/mobile/src/components/Screen.tsx`:

```tsx
import type { PropsWithChildren } from 'react';
import { SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

export function Screen({ children }: PropsWithChildren) {
  const theme = useAppTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { padding: 16, paddingBottom: 96 },
});
```

- [ ] **Step 3: Add ActionCard**

Create `apps/mobile/src/components/ActionCard.tsx`:

```tsx
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppTheme } from '../theme/useAppTheme';

type Props = PropsWithChildren<{
  title: string;
  subtitle: string;
  accent: string;
  onPress?: () => void;
}>;

export function ActionCard({ title, subtitle, accent, onPress, children }: Props) {
  const theme = useAppTheme();
  return (
    <Pressable onPress={onPress} style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <View style={[styles.marker, { backgroundColor: accent }]} />
      <View style={styles.body}>
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
        {children}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 14, flexDirection: 'row', gap: 12, marginBottom: 10 },
  marker: { width: 8, borderRadius: 8 },
  body: { flex: 1 },
  title: { fontSize: 17, fontWeight: '800' },
  subtitle: { color: '#6B7D91', marginTop: 4 },
});
```

- [ ] **Step 4: Add ConfidenceBadge**

Create `apps/mobile/src/components/ConfidenceBadge.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import type { ConfidenceLabel } from '../types/domain';

export function ConfidenceBadge({ label }: { label: ConfidenceLabel }) {
  const color = label === 'High' ? '#5EA96E' : label === 'Medium' ? '#F0C979' : '#B95773';
  return (
    <View style={[styles.badge, { borderColor: color }]}>
      <Text style={[styles.text, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  text: { fontWeight: '800', fontSize: 12 },
});
```

- [ ] **Step 5: Add AI suggestion card**

Create `apps/mobile/src/components/AiSuggestionCard.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { ConfidenceBadge } from './ConfidenceBadge';
import type { ConfidenceLabel } from '../types/domain';
import { useAppTheme } from '../theme/useAppTheme';

type Props = {
  title: string;
  explanation: string;
  confidence: ConfidenceLabel;
  accent: string;
};

export function AiSuggestionCard({ title, explanation, confidence, accent }: Props) {
  const theme = useAppTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: accent }]}>
      <Text style={[styles.eyebrow, { color: accent }]}>AI suggestion</Text>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      <Text style={styles.explanation}>{explanation}</Text>
      <ConfidenceBadge label={confidence} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 22, padding: 16, marginBottom: 12 },
  eyebrow: { fontSize: 12, fontWeight: '800' },
  title: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  explanation: { color: '#6B7D91', marginVertical: 8 },
});
```

- [ ] **Step 6: Add food progress component**

Create `apps/mobile/src/components/FoodTestProgress.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { getFoodTestStatus } from '../utils/foodTests';

export function FoodTestProgress({ count, accent }: { count: number; accent: string }) {
  return (
    <View>
      <Text style={styles.label}>{getFoodTestStatus(count)}</Text>
      <View style={styles.row}>
        {[1, 2, 3].map((step) => (
          <View key={step} style={[styles.dot, { backgroundColor: count >= step ? accent : '#E6EDF5' }]} />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { color: '#6B7D91', marginBottom: 6 },
  row: { flexDirection: 'row', gap: 6 },
  dot: { width: 28, height: 8, borderRadius: 8 },
});
```

- [ ] **Step 7: Add first-pass screens needed by navigator**

Create each screen in `apps/mobile/src/screens/` with this pattern, changing the title string:

```tsx
import { Text } from 'react-native';
import { Screen } from '../components/Screen';

export function SleepScreen() {
  return (
    <Screen>
      <Text>Sleep</Text>
    </Screen>
  );
}
```

Required files and exported functions:

- `SleepScreen.tsx` -> `SleepScreen`
- `FoodScreen.tsx` -> `FoodScreen`
- `HomeScreen.tsx` -> `HomeScreen`
- `FeedScreen.tsx` -> `FeedScreen`
- `AiScreen.tsx` -> `AiScreen`
- `LoginScreen.tsx` -> `LoginScreen`
- `FamilySetupScreen.tsx` -> `FamilySetupScreen`
- `GrowthScreen.tsx` -> `GrowthScreen`
- `TwinsHomeScreen.tsx` -> `TwinsHomeScreen`

- [ ] **Step 8: Add root navigator**

Create `apps/mobile/src/navigation/RootNavigator.tsx`:

```tsx
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useColorScheme } from 'react-native';
import { AiScreen } from '../screens/AiScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { FoodScreen } from '../screens/FoodScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SleepScreen } from '../screens/SleepScreen';

export type RootTabParamList = {
  Sleep: undefined;
  Food: undefined;
  Home: undefined;
  Feed: undefined;
  AI: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

export function RootNavigator() {
  const scheme = useColorScheme();
  return (
    <NavigationContainer theme={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Tab.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
        <Tab.Screen name="Sleep" component={SleepScreen} />
        <Tab.Screen name="Food" component={FoodScreen} />
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Feed" component={FeedScreen} />
        <Tab.Screen name="AI" component={AiScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

- [ ] **Step 9: Wire App**

Modify `apps/mobile/App.tsx`:

```tsx
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App() {
  return <RootNavigator />;
}
```

- [ ] **Step 10: Verify navigation compiles**

Run:

```powershell
Set-Location apps/mobile
npm test
npx expo start --clear
Set-Location ../..
```

Expected: tests pass and Expo starts with the Home tab visible in Expo Go.

- [ ] **Step 11: Commit**

Run:

```powershell
git add apps/mobile
git commit -m "feat: add mobile navigation shell"
```

## Task 5: Build Approved Dashboard Screens With Mock Data

**Files:**
- Create: `apps/mobile/src/data/mockSeed.ts`
- Modify: `apps/mobile/src/screens/HomeScreen.tsx`
- Modify: `apps/mobile/src/screens/TwinsHomeScreen.tsx`
- Modify: `apps/mobile/src/screens/SleepScreen.tsx`
- Modify: `apps/mobile/src/screens/FeedScreen.tsx`
- Modify: `apps/mobile/src/screens/FoodScreen.tsx`
- Modify: `apps/mobile/src/screens/AiScreen.tsx`
- Modify: `apps/mobile/src/screens/GrowthScreen.tsx`

- [ ] **Step 1: Add mock seed**

Create `apps/mobile/src/data/mockSeed.ts`:

```ts
import type { ChildProfile } from '../types/domain';

export const mockFamily = {
  id: 'family-demo',
  mode: 'single' as const,
  language: 'en' as const,
};

export const mockChild: ChildProfile = {
  id: 'child-demo',
  familyId: mockFamily.id,
  displayName: 'Maya',
  sex: 'girl',
  dateOfBirth: '2025-09-22',
};

export const mockAiSuggestion = {
  title: 'Nap window starts around 13:10',
  explanation: "Based on Maya's last wake time and yesterday's pattern.",
  confidence: 'Medium' as const,
};

export const mockFood = {
  name: 'Avocado',
  testCount: 2,
  ageRange: '6+ months',
};
```

- [ ] **Step 2: Replace Home screen**

Modify `apps/mobile/src/screens/HomeScreen.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { AiSuggestionCard } from '../components/AiSuggestionCard';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { mockAiSuggestion, mockChild, mockFood } from '../data/mockSeed';
import { colors } from '../theme/colors';
import { Screen } from '../components/Screen';
import { getAgeLabel } from '../utils/age';

export function HomeScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <View>
          <Text style={styles.kicker}>Good morning</Text>
          <Text style={styles.title}>{mockChild.displayName}</Text>
          <Text style={styles.subtitle}>{getAgeLabel(mockChild.dateOfBirth)}</Text>
        </View>
      </View>

      <AiSuggestionCard
        title={mockAiSuggestion.title}
        explanation={mockAiSuggestion.explanation}
        confidence={mockAiSuggestion.confidence}
        accent={colors.pink}
      />

      <ActionCard title="Sleep" subtitle="Last nap ended at 09:35" accent={colors.blue} />
      <ActionCard title="Feed" subtitle="Likely hungry near 11:40" accent="#5EA96E" />
      <ActionCard title="Food tasting" subtitle={`${mockFood.name} test progress`} accent={colors.pink}>
        <FoodTestProgress count={mockFood.testCount} accent={colors.pink} />
      </ActionCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 16 },
  kicker: { color: '#6B7D91', fontWeight: '700' },
  title: { fontSize: 32, fontWeight: '900', color: '#17202B' },
  subtitle: { color: '#6B7D91', marginTop: 2 },
});
```

- [ ] **Step 3: Add real content to remaining screens**

For each screen, replace the first-pass title-only screen with a `Screen`, one title, and two `ActionCard`s:

```tsx
import { Text } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

export function SleepScreen() {
  return (
    <Screen>
      <Text style={{ fontSize: 28, fontWeight: '900', marginBottom: 16 }}>Sleep</Text>
      <ActionCard title="Start sleep" subtitle="Record when the nap begins." accent={colors.blue} />
      <ActionCard title="End sleep" subtitle="Record wake-up time and mood." accent={colors.blue} />
    </Screen>
  );
}
```

Use these titles/subtitles:

- `FeedScreen`: "Bottle / nursing", "Record type and amount."; "Hunger note", "Add signs like rooting, crying, or calm."
- `FoodScreen`: "Food tasting", "Mark 1/3, 2/3, or 3/3."; "Recipe search", "Find trusted ideas by age and language."
- `AiScreen`: "Sleep prediction", "Compare Gemini and OpenAI in admin mode."; "Recipe ideas", "Search with trusted sources first."
- `GrowthScreen`: "Weight", "Add a new weight entry."; "Head circumference", "Track changes over time."

- [ ] **Step 4: Create twins home mockup screen**

Modify `apps/mobile/src/screens/TwinsHomeScreen.tsx`:

```tsx
import { StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { colors } from '../theme/colors';

export function TwinsHomeScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Twins dashboard</Text>
      <View style={styles.row}>
        <View style={[styles.childCard, { borderColor: colors.blue }]}>
          <Text style={[styles.childName, { color: colors.blue }]}>Baby A</Text>
          <Text>Nap around 13:10</Text>
          <Text>Apple 1/3</Text>
        </View>
        <View style={[styles.childCard, { borderColor: colors.pink }]}>
          <Text style={[styles.childName, { color: colors.pink }]}>Baby B</Text>
          <Text>Feed around 11:35</Text>
          <Text>Pear 3/3</Text>
        </View>
      </View>
      <ActionCard title="AI comparison" subtitle="Baby A may need sleep first. Baby B may need feeding first." accent={colors.sage} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900', marginBottom: 16 },
  row: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  childCard: { flex: 1, borderWidth: 1, borderRadius: 22, padding: 14, backgroundColor: '#FFFFFF' },
  childName: { fontWeight: '900', marginBottom: 6 },
});
```

- [ ] **Step 5: Verify in Expo Go**

Run:

```powershell
Set-Location apps/mobile
npx expo start --clear
Set-Location ../..
```

Expected: Expo QR opens in Expo Go, bottom tabs work, Home shows the approved soft list layout and playful AI card.

- [ ] **Step 6: Commit**

Run:

```powershell
git add apps/mobile/src
git commit -m "feat: build approved prototype dashboard screens"
```

## Task 6: Create Supabase Project Skeleton And Database Schema

**Files:**
- Create: `supabase/config.toml`
- Create: `supabase/migrations/<created-by-cli>_initial_littlenest_schema.sql`
- Create: `apps/mobile/src/types/database.ts`

- [ ] **Step 1: Confirm Supabase CLI commands**

Run:

```powershell
npx supabase --help
npx supabase migration --help
```

Expected: CLI help is printed. If `npx supabase` prompts to install the CLI, approve it.

- [ ] **Step 2: Initialize Supabase config**

Run:

```powershell
npx supabase init
```

Expected: `supabase/config.toml` is created.

- [ ] **Step 3: Create migration file through CLI**

Run:

```powershell
npx supabase migration new initial_littlenest_schema
```

Expected: Supabase creates a timestamped SQL file in `supabase/migrations/`.

- [ ] **Step 4: Add schema SQL**

Open the migration file created in Step 3 and replace its contents with:

```sql
create type public.family_mode as enum ('single', 'twins');
create type public.child_sex as enum ('boy', 'girl');
create type public.twin_type as enum ('boy_boy', 'girl_girl', 'boy_girl');
create type public.app_language as enum ('en', 'he', 'ru');
create type public.tracking_log_type as enum (
  'sleep',
  'feed',
  'solid_food',
  'diaper',
  'mood',
  'note',
  'illness',
  'teething',
  'medication',
  'unusual_day'
);
create type public.ai_provider as enum ('gemini', 'openai', 'claude');
create type public.ai_prompt_type as enum ('sleep', 'hunger', 'food_tasting', 'recipe');
create type public.ai_feedback_rating as enum ('good', 'okay', 'bad');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.families (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My family',
  mode public.family_mode not null,
  twin_type public.twin_type,
  language public.app_language not null default 'en',
  created_at timestamptz not null default now(),
  constraint valid_twin_type check (
    (mode = 'single' and twin_type is null)
    or (mode = 'twins' and twin_type is not null)
  )
);

create table public.children (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  sex public.child_sex not null,
  date_of_birth date not null,
  created_at timestamptz not null default now()
);

create table public.growth_entries (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(5,2),
  height_cm numeric(5,2),
  head_circumference_cm numeric(5,2),
  note text
);

create table public.tracking_logs (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  log_type public.tracking_log_type not null,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  amount_ml numeric(6,2),
  food_name text,
  mood text,
  diaper_kind text,
  note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.food_tests (
  id uuid primary key default gen_random_uuid(),
  child_id uuid not null references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  food_name text not null,
  test_count integer not null default 0 check (test_count >= 0 and test_count <= 3),
  last_tested_at timestamptz,
  allergy_note text,
  source_url text,
  created_at timestamptz not null default now(),
  unique (child_id, lower(food_name))
);

create table public.ai_requests (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  prompt_type public.ai_prompt_type not null,
  language public.app_language not null,
  context jsonb not null,
  created_at timestamptz not null default now()
);

create table public.ai_responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.ai_requests(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  provider public.ai_provider not null,
  title text not null,
  body text not null,
  confidence_label text not null check (confidence_label in ('Low', 'Medium', 'High')),
  sources jsonb not null default '[]'::jsonb,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.ai_feedback (
  id uuid primary key default gen_random_uuid(),
  response_id uuid not null references public.ai_responses(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  rating public.ai_feedback_rating not null,
  note text,
  created_at timestamptz not null default now(),
  unique (response_id, owner_id)
);

create table public.local_reminder_settings (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.families(id) on delete cascade,
  child_id uuid references public.children(id) on delete cascade,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  reminder_kind text not null,
  enabled boolean not null default true,
  minutes_before integer not null default 15,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.families enable row level security;
alter table public.children enable row level security;
alter table public.growth_entries enable row level security;
alter table public.tracking_logs enable row level security;
alter table public.food_tests enable row level security;
alter table public.ai_requests enable row level security;
alter table public.ai_responses enable row level security;
alter table public.ai_feedback enable row level security;
alter table public.local_reminder_settings enable row level security;

create policy "profiles owner read" on public.profiles for select using (id = auth.uid());
create policy "profiles owner update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

create policy "families owner all" on public.families for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "children owner all" on public.children for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "growth owner all" on public.growth_entries for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "logs owner all" on public.tracking_logs for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "food tests owner all" on public.food_tests for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ai requests owner all" on public.ai_requests for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ai responses owner all" on public.ai_responses for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "ai feedback owner all" on public.ai_feedback for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "reminders owner all" on public.local_reminder_settings for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create index families_owner_id_idx on public.families(owner_id);
create index children_family_id_idx on public.children(family_id);
create index tracking_logs_child_started_idx on public.tracking_logs(child_id, started_at desc);
create index growth_entries_child_measured_idx on public.growth_entries(child_id, measured_at desc);
create index food_tests_child_idx on public.food_tests(child_id);
create index ai_requests_owner_created_idx on public.ai_requests(owner_id, created_at desc);
create index ai_responses_request_idx on public.ai_responses(request_id);
```

- [ ] **Step 5: Add mobile database type scaffold**

Create `apps/mobile/src/types/database.ts`:

```ts
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: Record<string, never>;
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      family_mode: 'single' | 'twins';
      child_sex: 'boy' | 'girl';
      twin_type: 'boy_boy' | 'girl_girl' | 'boy_girl';
      app_language: 'en' | 'he' | 'ru';
      ai_provider: 'gemini' | 'openai' | 'claude';
      ai_prompt_type: 'sleep' | 'hunger' | 'food_tasting' | 'recipe';
      ai_feedback_rating: 'good' | 'okay' | 'bad';
    };
  };
};
```

- [ ] **Step 6: Verify SQL locally or remotely**

Run one of these, depending on the available Supabase setup:

```powershell
npx supabase db reset
```

or apply the SQL in the Supabase SQL editor for the new project.

Expected: tables, indexes, and RLS policies are created without SQL errors.

- [ ] **Step 7: Commit**

Run:

```powershell
git add supabase apps/mobile/src/types/database.ts
git commit -m "feat: add Supabase prototype schema"
```

## Task 7: Connect Supabase Auth And Repository Layer

**Files:**
- Create: `apps/mobile/.env.example`
- Create: `apps/mobile/src/services/supabase.ts`
- Create: `apps/mobile/src/services/trackingRepository.ts`
- Modify: `apps/mobile/src/screens/LoginScreen.tsx`
- Modify: `apps/mobile/src/screens/FamilySetupScreen.tsx`

- [ ] **Step 1: Add env example**

Create `apps/mobile/.env.example`:

```text
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-or-anon-key
```

- [ ] **Step 2: Add Supabase client**

Create `apps/mobile/src/services/supabase.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase public environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

- [ ] **Step 3: Add repository methods**

Create `apps/mobile/src/services/trackingRepository.ts`:

```ts
import { supabase } from './supabase';

export async function signInAdmin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function getCurrentSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function insertTrackingLog(input: {
  childId: string;
  ownerId: string;
  logType: string;
  startedAt: string;
  endedAt?: string;
  note?: string;
}) {
  const { data, error } = await supabase
    .from('tracking_logs')
    .insert({
      child_id: input.childId,
      owner_id: input.ownerId,
      log_type: input.logType,
      started_at: input.startedAt,
      ended_at: input.endedAt,
      note: input.note,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
```

- [ ] **Step 4: Add login screen behavior**

Modify `apps/mobile/src/screens/LoginScreen.tsx` so it has email/password fields and calls `signInAdmin`. Use React Native `TextInput`, `Pressable`, and local `useState`.

Core handler:

```ts
async function handleLogin() {
  setErrorMessage(null);
  try {
    await signInAdmin(email.trim(), password);
    setStatusMessage('Signed in');
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Sign in failed');
  }
}
```

- [ ] **Step 5: Verify auth manually**

Run:

```powershell
Set-Location apps/mobile
npx expo start --clear
Set-Location ../..
```

Expected: entering the admin/test email and password signs into Supabase without exposing secret keys in the app.

- [ ] **Step 6: Commit**

Run:

```powershell
git add apps/mobile/.env.example apps/mobile/src/services apps/mobile/src/screens/LoginScreen.tsx apps/mobile/src/screens/FamilySetupScreen.tsx
git commit -m "feat: connect Supabase auth for admin prototype"
```

## Task 8: Add Supabase Edge Functions For AI Routing

**Files:**
- Create: `supabase/functions/_shared/cors.ts`
- Create: `supabase/functions/_shared/responseSchema.ts`
- Create: `supabase/functions/_shared/promptBuilder.ts`
- Create: `supabase/functions/_shared/aiProviders.ts`
- Create: `supabase/functions/ai-router/index.ts`
- Create: `supabase/functions/recipe-search/index.ts`
- Create: `supabase/.env.example`

- [ ] **Step 1: Add function env example**

Create `supabase/.env.example`:

```text
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
OPENAI_MODEL=gpt-5-mini
GEMINI_MODEL=gemini-2.5-flash
```

- [ ] **Step 2: Add CORS helper**

Create `supabase/functions/_shared/cors.ts`:

```ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
```

- [ ] **Step 3: Add response schema types**

Create `supabase/functions/_shared/responseSchema.ts`:

```ts
export type ConfidenceLabel = 'Low' | 'Medium' | 'High';
export type ProviderName = 'gemini' | 'openai';

export type AiSource = {
  title: string;
  url: string;
};

export type ProviderAnswer = {
  provider: ProviderName;
  title: string;
  body: string;
  confidenceLabel: ConfidenceLabel;
  sources: AiSource[];
  raw: unknown;
};

export type AiRouterResponse = {
  recommended: ProviderAnswer;
  comparison: ProviderAnswer[];
  safetyNote: string;
};
```

- [ ] **Step 4: Add prompt builder**

Create `supabase/functions/_shared/promptBuilder.ts`:

```ts
export type PromptInput = {
  language: 'en' | 'he' | 'ru';
  promptType: 'sleep' | 'hunger' | 'food_tasting' | 'recipe';
  childAgeMonths: number;
  childProfile: Record<string, unknown>;
  recentLogs: Record<string, unknown>[];
  userQuestion?: string;
};

const languageName = { en: 'English', he: 'Hebrew', ru: 'Russian' } as const;

export function buildBabyGuidancePrompt(input: PromptInput) {
  return `
You are helping a parent understand baby tracking logs.
Respond in ${languageName[input.language]}.
The child is ${input.childAgeMonths} months old.
Prompt type: ${input.promptType}.

Rules:
- Give practical guidance, not diagnosis.
- Use Low, Medium, or High confidence only.
- Explain which log patterns support the suggestion.
- For 4-month solids, allergy concerns, illness, medicine, growth concerns, or unusual symptoms, tell the parent to follow doctor guidance.
- If recipe or food guidance is requested, prefer age-appropriate and simple foods.

Child profile:
${JSON.stringify(input.childProfile, null, 2)}

Recent logs:
${JSON.stringify(input.recentLogs, null, 2)}

Parent question:
${input.userQuestion ?? 'Give the best next suggestion.'}

Return JSON with keys: title, body, confidenceLabel, sources.
`;
}
```

- [ ] **Step 5: Add provider calls**

Create `supabase/functions/_shared/aiProviders.ts`:

```ts
import type { ProviderAnswer } from './responseSchema.ts';

function requireSecret(name: string) {
  const value = Deno.env.get(name);
  if (!value) throw new Error(`Missing secret: ${name}`);
  return value;
}

function parseAnswer(provider: 'gemini' | 'openai', text: string, raw: unknown): ProviderAnswer {
  try {
    const parsed = JSON.parse(text);
    return {
      provider,
      title: String(parsed.title ?? 'Suggestion'),
      body: String(parsed.body ?? text),
      confidenceLabel: parsed.confidenceLabel === 'High' || parsed.confidenceLabel === 'Medium' ? parsed.confidenceLabel : 'Low',
      sources: Array.isArray(parsed.sources) ? parsed.sources : [],
      raw,
    };
  } catch {
    return { provider, title: 'Suggestion', body: text, confidenceLabel: 'Low', sources: [], raw };
  }
}

export async function callOpenAi(prompt: string): Promise<ProviderAnswer> {
  const apiKey = requireSecret('OPENAI_API_KEY');
  const model = Deno.env.get('OPENAI_MODEL') ?? 'gpt-5-mini';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: prompt,
      text: { format: { type: 'json_object' } },
    }),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(`OpenAI failed: ${JSON.stringify(json)}`);
  return parseAnswer('openai', String(json.output_text ?? ''), json);
}

export async function callGemini(prompt: string, useSearch: boolean): Promise<ProviderAnswer> {
  const apiKey = requireSecret('GEMINI_API_KEY');
  const model = Deno.env.get('GEMINI_MODEL') ?? 'gemini-2.5-flash';
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: useSearch ? [{ google_search: {} }] : undefined,
  };

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: 'POST',
    headers: {
      'x-goog-api-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const json = await response.json();
  if (!response.ok) throw new Error(`Gemini failed: ${JSON.stringify(json)}`);
  const text = json.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text ?? '').join('') ?? '';
  return parseAnswer('gemini', text, json);
}
```

- [ ] **Step 6: Add AI router function**

Create `supabase/functions/ai-router/index.ts`:

```ts
import { callGemini, callOpenAi } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { buildBabyGuidancePrompt } from '../_shared/promptBuilder.ts';
import type { AiRouterResponse } from '../_shared/responseSchema.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const input = await req.json();
    const prompt = buildBabyGuidancePrompt(input);
    const useSearch = input.promptType === 'recipe' || input.promptType === 'food_tasting';
    const [gemini, openai] = await Promise.all([
      callGemini(prompt, useSearch),
      callOpenAi(prompt),
    ]);

    const recommended = gemini.confidenceLabel === 'High' ? gemini : openai;
    const body: AiRouterResponse = {
      recommended,
      comparison: [gemini, openai],
      safetyNote: 'This is guidance, not medical diagnosis. Follow your doctor for medical concerns.',
    };

    return jsonResponse(body);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'AI router failed' }, 500);
  }
});
```

- [ ] **Step 7: Add recipe search function**

Create `supabase/functions/recipe-search/index.ts`:

```ts
import { callGemini } from '../_shared/aiProviders.ts';
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);

  try {
    const { language, childAgeMonths, query } = await req.json();
    const prompt = `
Find baby food or recipe ideas for a ${childAgeMonths}-month-old child.
Respond in ${language}.
Use trusted medical, health, parenting, and child nutrition sources first.
General recipe sites are allowed only as inspiration and must be labeled as inspiration.
Include source links.
Question: ${query}
Return JSON with keys: title, body, confidenceLabel, sources.
`;
    const answer = await callGemini(prompt, true);
    return jsonResponse({ results: [answer] });
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Recipe search failed' }, 500);
  }
});
```

- [ ] **Step 8: Serve functions locally**

Create a local `supabase/.env` from `supabase/.env.example`, then run:

```powershell
npx supabase functions serve ai-router --env-file supabase/.env
```

Expected: the function starts and reports a local URL.

- [ ] **Step 9: Commit**

Run:

```powershell
git add supabase/functions supabase/.env.example
git commit -m "feat: add AI router edge functions"
```

## Task 9: Connect Mobile AI And Admin Comparison

**Files:**
- Create: `apps/mobile/src/ai/types.ts`
- Create: `apps/mobile/src/ai/client.ts`
- Modify: `apps/mobile/src/screens/AiScreen.tsx`

- [ ] **Step 1: Add AI types**

Create `apps/mobile/src/ai/types.ts`:

```ts
import type { AiPromptType, ConfidenceLabel } from '../types/domain';

export type ProviderAnswer = {
  provider: 'gemini' | 'openai';
  title: string;
  body: string;
  confidenceLabel: ConfidenceLabel;
  sources: { title: string; url: string }[];
};

export type AiRequestInput = {
  language: 'en' | 'he' | 'ru';
  promptType: AiPromptType;
  childAgeMonths: number;
  childProfile: Record<string, unknown>;
  recentLogs: Record<string, unknown>[];
  userQuestion?: string;
};

export type AiRouterResponse = {
  recommended: ProviderAnswer;
  comparison: ProviderAnswer[];
  safetyNote: string;
};
```

- [ ] **Step 2: Add AI client**

Create `apps/mobile/src/ai/client.ts`:

```ts
import { supabase } from '../services/supabase';
import type { AiRequestInput, AiRouterResponse } from './types';

export async function requestAiGuidance(input: AiRequestInput): Promise<AiRouterResponse> {
  const { data, error } = await supabase.functions.invoke<AiRouterResponse>('ai-router', {
    body: input,
  });

  if (error) throw error;
  if (!data) throw new Error('AI returned no data');
  return data;
}
```

- [ ] **Step 3: Build admin comparison UI**

Modify `apps/mobile/src/screens/AiScreen.tsx` so it:

- Shows one button labeled `Compare Gemini + OpenAI`.
- Calls `requestAiGuidance`.
- Shows `recommended` at the top.
- Shows two side-by-side provider cards below.
- Includes three feedback buttons under each provider: `Good`, `Okay`, `Bad`.

Core provider card code:

```tsx
function ProviderCard({ answer }: { answer: ProviderAnswer }) {
  return (
    <View style={{ flex: 1, borderWidth: 1, borderColor: '#E6EDF5', borderRadius: 18, padding: 12 }}>
      <Text style={{ fontWeight: '900' }}>{answer.provider.toUpperCase()}</Text>
      <Text style={{ fontSize: 16, fontWeight: '800', marginTop: 8 }}>{answer.title}</Text>
      <Text style={{ color: '#6B7D91', marginTop: 6 }}>{answer.body}</Text>
      <Text style={{ marginTop: 8 }}>Confidence: {answer.confidenceLabel}</Text>
    </View>
  );
}
```

- [ ] **Step 4: Verify AI screen**

Run:

```powershell
Set-Location apps/mobile
npx expo start --clear
Set-Location ../..
```

Expected: tapping `Compare Gemini + OpenAI` calls the Edge Function and displays both provider answers.

- [ ] **Step 5: Commit**

Run:

```powershell
git add apps/mobile/src/ai apps/mobile/src/screens/AiScreen.tsx
git commit -m "feat: connect admin AI comparison"
```

## Task 10: Add Food And Recipe Search Flow

**Files:**
- Modify: `apps/mobile/src/ai/client.ts`
- Modify: `apps/mobile/src/screens/FoodScreen.tsx`

- [ ] **Step 1: Add recipe client method**

Modify `apps/mobile/src/ai/client.ts`:

```ts
export async function searchRecipes(input: {
  language: 'en' | 'he' | 'ru';
  childAgeMonths: number;
  query: string;
}) {
  const { data, error } = await supabase.functions.invoke<{ results: ProviderAnswer[] }>('recipe-search', {
    body: input,
  });

  if (error) throw error;
  return data?.results ?? [];
}
```

- [ ] **Step 2: Add Food screen search UI**

Modify `apps/mobile/src/screens/FoodScreen.tsx` so it includes:

- Age label `4-24 months`.
- Search input defaulted to `first tastes and recipes`.
- Button `Search trusted recipe ideas`.
- Result cards with title, body, confidence, and sources.
- Food test progress for selected foods.

Core handler:

```ts
async function handleSearch() {
  setErrorMessage(null);
  setLoading(true);
  try {
    const nextResults = await searchRecipes({
      language: 'en',
      childAgeMonths: 8,
      query,
    });
    setResults(nextResults);
  } catch (error) {
    setErrorMessage(error instanceof Error ? error.message : 'Recipe search failed');
  } finally {
    setLoading(false);
  }
}
```

- [ ] **Step 3: Verify search**

Run:

```powershell
Set-Location apps/mobile
npx expo start --clear
Set-Location ../..
```

Expected: recipe results appear with sources after tapping search.

- [ ] **Step 4: Commit**

Run:

```powershell
git add apps/mobile/src/ai/client.ts apps/mobile/src/screens/FoodScreen.tsx
git commit -m "feat: add recipe search prototype flow"
```

## Task 11: Add Local Prototype Reminders

**Files:**
- Create: `apps/mobile/src/notifications/localReminders.ts`
- Modify: `apps/mobile/src/screens/HomeScreen.tsx`

- [ ] **Step 1: Add local reminder helpers**

Create `apps/mobile/src/notifications/localReminders.ts`:

```ts
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export async function requestReminderPermission() {
  const existing = await Notifications.getPermissionsAsync();
  if (existing.granted) return true;
  const next = await Notifications.requestPermissionsAsync();
  return next.granted;
}

export async function schedulePrototypeReminder(input: {
  title: string;
  body: string;
  secondsFromNow: number;
}) {
  const allowed = await requestReminderPermission();
  if (!allowed) return null;

  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body },
    trigger: { seconds: input.secondsFromNow },
  });
}
```

- [ ] **Step 2: Add reminder action to Home**

Modify `apps/mobile/src/screens/HomeScreen.tsx`:

```ts
import { schedulePrototypeReminder } from '../notifications/localReminders';

async function handleNapReminder() {
  await schedulePrototypeReminder({
    title: 'Possible nap window soon',
    body: 'LittleNest AI thinks the next nap window may be close.',
    secondsFromNow: 60,
  });
}
```

Wire `handleNapReminder` to the Sleep `ActionCard` `onPress`.

- [ ] **Step 3: Verify local notification**

Run:

```powershell
Set-Location apps/mobile
npx expo start --clear
Set-Location ../..
```

Expected: tapping the Sleep card asks for notification permission and schedules a local reminder.

- [ ] **Step 4: Commit**

Run:

```powershell
git add apps/mobile/src/notifications apps/mobile/src/screens/HomeScreen.tsx
git commit -m "feat: add local prototype reminders"
```

## Task 12: Final Verification Pass

**Files:**
- Modify only files needed to fix verification failures.

- [ ] **Step 1: Run mobile tests**

Run:

```powershell
Set-Location apps/mobile
npm test
Set-Location ../..
```

Expected: all Jest tests pass.

- [ ] **Step 2: Run Expo**

Run:

```powershell
Set-Location apps/mobile
npx expo start --clear
Set-Location ../..
```

Expected: Expo starts and the app opens in Expo Go.

- [ ] **Step 3: Verify core mobile flows manually**

Check in Expo Go:

- Login screen appears.
- Bottom navigation contains Sleep, Food, Home, Feed, AI.
- Home uses soft list dashboard.
- AI card is visually prominent.
- Food screen includes recipe search.
- AI screen includes Gemini/OpenAI comparison.
- Theme uses white base in light mode and black base in dark mode.
- Boy/girl/twins accent rules match the spec.

- [ ] **Step 4: Verify Edge Functions locally**

Run:

```powershell
npx supabase functions serve ai-router --env-file supabase/.env
```

Expected: `ai-router` accepts a POST request and returns `recommended`, `comparison`, and `safetyNote`.

- [ ] **Step 5: Verify git cleanliness**

Run:

```powershell
git status --short
```

Expected: no uncommitted files except local `.env` files ignored by git.

- [ ] **Step 6: Commit final fixes if needed**

Run this only if verification required code changes:

```powershell
git add apps/mobile supabase
git commit -m "fix: complete prototype verification"
```
