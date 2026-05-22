# LittleNest AI Prototype Design

Date: 2026-05-22

## Decision Summary

Build **Approach A: Expo UI + Real AI + Supabase Lite**.

LittleNest AI will start as an Expo Go prototype for admin testing. The prototype will include real mobile UI, Supabase auth/database, a secure AI proxy, Gemini and OpenAI comparison, food and recipe web search, richer baby tracking, local reminders, and an approved gender-neutral app icon direction. Public parent signup, subscriptions, store release, push notifications, and full admin CMS are later phases.

## Product Scope

The first build is for one admin/test user only. It supports one family profile with either one baby or twins. Public parent accounts are not enabled in the prototype, but the database will be designed with per-user security so public accounts can be added later.

Core prototype screens:

- Login for the admin/test user.
- Family setup.
- One baby or twins setup.
- Home dashboard.
- Sleep tracking.
- Feed tracking.
- Food and recipe tracking.
- Growth tracking.
- AI assistant.
- Admin/test AI comparison.
- Local reminder settings.

Twin profiles use one shared dashboard with separate child tabs/cards. Each child keeps separate sleep, feeding, growth, food, and allergy-test logs.

## UI And Branding

The app should feel friendly, simple, and useful for tired parents. It should not look like a grey clinical dashboard.

The base UI follows the phone system setting:

- Light mode: white base.
- Dark mode: black base.

Theme accents:

- One boy: light blue accents.
- One girl: light pink accents.
- Boy + boy twins: light blue accents.
- Girl + girl twins: light pink accents.
- Boy + girl twins: split light blue and light pink accents.

Navigation uses bottom tabs:

- Sleep
- Food
- Home
- Feed
- AI

The approved dashboard direction combines:

- **Soft List Dashboard** as the main structure.
- **Playful AI/recipe cards** for suggestions and highlights.
- **Twins dashboard structure** for all twin profiles, with both children visible and separate child logs.
- **Split-color twins styling** only when the profile is boy + girl twins.

The approved app icon direction is **Family Mark**: parent + baby + care, using neutral warm colors rather than gender colors. The heart should use a deeper berry color so it remains visible at small sizes.

The prototype name is **LittleNest AI**. This is a temporary working name and can be changed before release.

## Language Support

The first UI implementation will be English-first, with the language switcher and localization structure included from the start.

Target languages:

- English
- Hebrew
- Russian

AI prompts and responses should be testable in English, Hebrew, and Russian earlier than the full UI translation. Recipe and food-search behavior should use the selected app language.

## Data And Tracking

The prototype stores one family profile and either one child or twins.

Each child profile includes:

- Date of birth.
- Age derived from date of birth.
- Sex.
- Weight entries over time.
- Height entries over time.
- Head circumference entries over time.

Daily tracking should collect richer context so the AI can be evaluated meaningfully:

- Sleep start and end.
- Wake windows.
- Feed type.
- Feed amount.
- Solid foods.
- Food recipes.
- Food allergy test count.
- Mood or state.
- Diaper.
- Parent notes.
- Optional illness marker.
- Optional teething marker.
- Optional medication marker.
- Optional unusual-day marker.

Food tracking includes first tastings and older baby foods from 4 to 24 months. Older baby meals focus on 6 to 24 months.

Each tested food has three allergy observation steps:

- 1/3 tested.
- 2/3 tested.
- 3/3 completed.

The app should show foods already tested, foods still in progress, and foods still needing allergy observation.

## AI System

The AI must be included in the prototype. AI calls go through a secure Supabase Edge Function or proxy so provider API keys are never stored in the Expo app.

Initial providers:

- Gemini.
- OpenAI.

Future provider:

- Claude, added through the same provider interface.

Normal app mode shows one final recommended answer. Admin/test mode, visible only to the owner, shows side-by-side Gemini and OpenAI answers for comparison.

AI output for normal app mode uses confidence labels:

- Low
- Medium
- High

Normal parent-facing UI should not show exact confidence percentages because that can imply false medical precision. Admin/test mode may show deeper comparison notes.

AI features:

- Sleep window suggestions.
- Hunger timing suggestions.
- Explanation of why the AI suggested something.
- Food tasting ideas.
- Older baby recipe ideas.
- Web search for food and recipes.
- Source links for review.
- Hebrew, English, and Russian output testing.

The AI should use the child profile, recent logs, selected language, and age range when generating suggestions.

## Recipe And Web Search

Food and recipe search is included in the prototype.

Search behavior:

- Prefer trusted medical, health, parenting, and child nutrition sources first.
- Allow general recipe sites for inspiration.
- Clearly label general recipe results as inspiration, not medical or allergy guidance.
- Show source links so the owner can review the recommendations.
- Filter by child age and selected language.

The parent/admin chooses which searched foods or recipes to save into the food checklist.

## Admin/Test Mode

The first prototype is for the owner only. Admin/test mode includes tools that normal parents should not see.

Admin/test mode includes:

- Side-by-side Gemini and OpenAI answers.
- Prompt context preview.
- Provider used.
- Language.
- Child age.
- Prompt type.
- Response.
- Feedback rating.
- Optional feedback note.

Feedback ratings:

- Good
- Okay
- Bad

This feedback will help compare provider quality for sleep, hunger, food tasting, and recipes.

## Backend And Security

Use Supabase for:

- Auth.
- Postgres database.
- Row Level Security.
- Edge Functions or secure AI proxy.

Even though the prototype has only one admin/test login, database tables should use per-user Row Level Security from the beginning.

Supabase stores:

- Admin/test user.
- Family profile.
- Child profiles.
- Tracking logs.
- Growth entries.
- Food test records.
- Selected recipe/search results.
- AI prompts.
- AI responses.
- AI provider comparisons.
- AI feedback ratings.
- Local reminder settings.

The Expo app must never contain service-role keys or AI provider secret keys.

## Local Reminders

The prototype includes local reminders only.

Prototype reminders:

- Possible nap window soon.
- Possible feeding time soon.
- Food test 2/3 reminder.
- Food test 3/3 reminder.

Full push notifications are a later phase.

## Safety Boundaries

The app must not present AI output as medical diagnosis.

The prototype can show guidance, explanations, and Low/Medium/High confidence. It must not promise true 95% accuracy until there is real outcome validation and professional medical review.

The app should defer to doctor guidance for:

- Starting solids at 4 months.
- Allergy concerns.
- Illness.
- Medication.
- Growth concerns.
- Unusual sleep or feeding patterns.
- Any urgent or worrying symptoms.

## Later Phases

Later phases include:

- Public parent registration.
- Multi-family support.
- Full admin CMS.
- Subscriptions and payments.
- Real push notifications.
- App Store and Google Play publishing.
- Hebrew and Russian full UI translations.
- Claude provider integration.
- Medical/content review.
- Accuracy validation for prediction claims.

## Implementation Readiness

This design is scoped for one implementation plan:

1. Scaffold Expo app.
2. Build approved UI shell and screens.
3. Add Supabase auth/database.
4. Add secure AI proxy for Gemini and OpenAI.
5. Add recipe web search flow.
6. Add tracking and local reminders.
7. Add admin/test AI comparison and feedback.
8. Verify continuously in Expo Go.
