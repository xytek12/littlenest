# LittleNest UI Refresh Design

Date: 2026-05-24

## Goal

Lock the next prototype redesign before implementation so the mobile app becomes easier to use, visually friendlier, and more honest about when AI guidance is and is not ready.

## Final UI Direction

- Overall direction: structured caregiver workflow.
- Visual style: blend of the earlier soft dashboard plus story-card warmth.
- Single child color rule:
  - single boy uses only light blue accents
  - single girl uses only light pink accents
- Twins color rule:
  - boy + boy uses only light blue
  - girl + girl uses only light pink
  - boy + girl uses both light blue and light pink
- Light mode base stays white.
- Dark mode base stays black / deep charcoal, but top and bottom accent bars must remain visibly light blue or light pink with readable text.

## Navigation

- Bottom navigation changes to:
  - Recipes
  - Home
  - AI
  - Growth
- Sleep, Feed, and Food Tasting are no longer permanent bottom tabs.
- Home becomes the action hub:
  - tapping Sleep opens the dedicated sleep control screen
  - tapping Feed opens the feed flow
  - tapping Food Tasting opens the tasting / allergen tracking flow

## Header And Settings

- Header keeps only:
  - child name / age on the left
  - settings gear on the right
- Remove the extra top icon from the header.
- In Hebrew the header direction should flip naturally.
- Settings screen must include:
  - family setup
  - language
  - feed unit toggle `mL / oz`
  - subscription
  - logout

## Home Behavior

- Home AI card must not show a prediction when there is not enough real data yet.
- Until enough data exists, show an honest learning-state card such as:
  - LittleNest is still learning this child.
  - Track sleep and feeds for 14 days to unlock better predictions.
- AI unlock rule:
  - do not show predictive home guidance until 14 days of real tracking data exist
- Home cards should route into the detailed flows instead of being static summaries.

## Sleep Flow

- Sleep screen must support a running timer after the parent taps Start Sleep.
- Sleep card on Home must open the sleep control screen.
- Sleep control screen should show:
  - running timer while active
  - exact session start time
  - start button
  - end button
- When the parent ends sleep, the UI must ask:
  - how many times did the child wake up during this sleep session
- Parent enters the wake count manually.
- After end, store and display:
  - total sleep duration
  - exact start time
  - exact end time
  - wake count

## Feed Flow

- Feed opens from Home.
- Main feed entry opens as a bottom sheet.
- Bottom sheet first lets the parent choose:
  - Nursing
  - Bottle
- Nursing mode must show left and right breast side by side.
- Each breast section needs its own:
  - Start
  - Stop
  - running or recorded duration
- Feed history should show:
  - exact hour
  - total nursing duration
  - enough timing detail for later AI hunger-window analysis
- Bottle mode must support preset amounts:
  - 30
  - 60
  - 90
  - 120
  - 160
  - 180
  - 210
  - 220
  - 240
  - 310
  - 330
- Parent must also be able to manually override the amount.
- Feed unit is controlled by settings and can switch between `mL` and `oz`.

## Recipes And Food Tasting

- Recipes stay as a main bottom section near Home and AI.
- Recipe cards must:
  - show a real food photo, not color placeholders
  - show the dish name below the image
  - show a short readable summary of what the dish gives the child
  - keep a direct source button that opens the source website immediately
- Recipe ideas should rotate once per calendar day and stay stable for that day.
- Recipe search should prefer trusted sources first, but still allow broader recipe inspiration where appropriate.

## First Tastes And Allergen Tracking

- Food Tasting opens from Home as its own flow.
- Create a Supabase-backed allergen reference table seeded from trusted health sources.
- Group the allergen reference data by section, including categories such as:
  - eggs
  - dairy
  - wheat
  - soy
  - sesame
  - nuts
  - fish
  - shellfish
- For fish and nuts, store detailed sub-items rather than only a generic parent category.
- Food tasting UI must make it easy to see:
  - what has been tried
  - how many of 3 allergy checks are complete
  - what still needs testing

## AI Rules

- Gemini can remain useful during prototype learning mode, but the final target is that Gemini and OpenAI both work.
- OpenAI must not show raw quota, JSON, or provider error text directly in the UI.
- Admin mode can still compare providers side by side, but error presentation must be clean if a provider is unhealthy.
- Desired end state:
  - AI knows the child better over time using sleep, wake count, feed timing, feed amount, and food progression
  - better sleep suggestions
  - better wake-window predictions
  - better hunger timing suggestions

## App Icon

- The approved prototype shell removes the extra header icon.
- The real app icon still needs to load correctly in Expo Go on actual device startup and launcher surfaces.
- Keep this as an implementation requirement during the next execution pass.
