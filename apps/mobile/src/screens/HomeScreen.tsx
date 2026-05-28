import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GenderedBackground } from '../components/GenderedBackground';
import { SectionCard } from '../components/SectionCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import { WatercolorHeader } from '../components/WatercolorHeader';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getPalette, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';
import { formatDateLong } from '../utils/formatDateLong';

// Render a string so that any digit runs (e.g. "14" inside "14 ימי מעקב")
// get an explicit larger / bolder style. Fixes iOS substituting a smaller
// fallback font for digits when they sit next to Hebrew glyphs.
function renderWithStyledDigits(text: string, digitStyle: object) {
  return text.split(/(\d+)/).map((part, index) =>
    /^\d+$/.test(part) ? (
      <Text key={`n-${index}`} style={digitStyle}>
        {part}
      </Text>
    ) : (
      part
    ),
  );
}

function countTrackedDays(
  sleepSessions: { startedAt: string }[],
  feedEntries: { timestamp: string }[],
) {
  const keys = new Set<string>();

  sleepSessions.forEach((session) => keys.add(session.startedAt.slice(0, 10)));
  feedEntries.forEach((entry) => keys.add(entry.timestamp.slice(0, 10)));

  return keys.size;
}

export function HomeScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const {
    activeChild,
    activeSleepStartedAt,
    endSleep,
    family,
    feedEntries,
    sleepSessions,
    startSleep,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.home;
  const story = dictionary.storybook;
  const homeSleep = dictionary.homeSleep;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins' && family.children.length >= 2;
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const trackedDays = countTrackedDays(sleepSessions, feedEntries);
  const learningReady = trackedDays >= 14;

  const storybookTitle = isTwins
    ? story.homeTwins(family.children[0].displayName, family.children[1].displayName)
    : story.homeSingle(activeChild.displayName);

  // When a sleep session is currently running, swap the subtitle for a
  // gender-aware "sleeping peacefully" line (Hebrew: ישן / ישנה). The active
  // sleep is global (not per-child) so in twin mode the sleeping child is
  // whichever child is currently active.
  const sleepingChild = activeSleepStartedAt ? activeChild : null;
  const subtitle = sleepingChild
    ? labels.sleepingStatus(sleepingChild.displayName, sleepingChild.sex)
    : isTwins
      ? undefined
      : getAgeLabel(activeChild.dateOfBirth, new Date(), family.language);

  // Last sleep session (for idle state)
  const lastSleep = sleepSessions.length > 0 ? sleepSessions[sleepSessions.length - 1] : null;

  const insets = useSafeAreaInsets();

  return (
    <GenderedBackground>
      <ScrollView
        testID="screen-home"
        contentContainerStyle={[styles.content, { paddingBottom: 16 + insets.bottom }]}
        keyboardShouldPersistTaps="handled"
      >
        <WatercolorHeader
          title={storybookTitle}
          subtitle={subtitle}
          accent={palette.primary}
          accentSoft={palette.primarySoft}
        />

        <View
          style={[
            styles.learningCard,
            { borderColor: palette.primary, backgroundColor: theme.surface },
          ]}
        >
          <Text style={[styles.learningKicker, { color: palette.primaryDeep }]}>
            {learningReady ? labels.suggestionKicker : labels.learningKicker}
          </Text>
          <Text style={[styles.learningTitle, rtlText, { color: theme.text }]}>
            {learningReady
              ? labels.suggestionTitle
              : renderWithStyledDigits(labels.learningTitle, styles.learningTitleNumber)}
          </Text>
          <Text style={[styles.learningBody, rtlText, { color: theme.mutedText }]}>
            {learningReady
              ? labels.suggestionBody(activeChild.displayName)
              : renderWithStyledDigits(
                  labels.learningBody(trackedDays),
                  styles.learningBodyNumber,
                )}
          </Text>
        </View>

        <TwinPickerCards />

        {/* Sleep SectionCard — active vs. idle */}
        {activeSleepStartedAt ? (
          <SectionCard
            sectionType="sleep"
            title={homeSleep.sectionSleep}
            iconEmoji="🌙"
            label={homeSleep.activeSleepLabel}
            value={homeSleep.activeSleepSince(formatDateLong(activeSleepStartedAt, family.language))}
            footerLabel={homeSleep.viewHistory}
            onFooterPress={() => navigation.navigate('SleepFlow')}
            onPlusPress={() => {
              endSleep({ wakeCount: 0 });
            }}
            plusAccessibilityLabel={labels.sleepTitle}
          />
        ) : (
          <SectionCard
            sectionType="sleep"
            title={homeSleep.sectionSleep}
            iconEmoji="🌙"
            label={homeSleep.idleSleepLabel}
            value={
              lastSleep
                ? formatDateLong(lastSleep.startedAt, family.language)
                : homeSleep.noSessionYet
            }
            footerLabel={homeSleep.viewHistory}
            onFooterPress={() => navigation.navigate('SleepFlow')}
            onPlusPress={() => {
              startSleep();
              navigation.navigate('SleepFlow');
            }}
            plusAccessibilityLabel={labels.sleepTitle}
          />
        )}

        {/* Feed SectionCard */}
        <SectionCard
          sectionType="feed"
          title={homeSleep.sectionFeed}
          iconEmoji="🍼"
          footerLabel={homeSleep.viewHistory}
          onFooterPress={() => navigation.navigate('FeedFlow')}
          onPlusPress={() => navigation.navigate('FeedFlow')}
          plusAccessibilityLabel={labels.feedTitle}
        />

        {/* Food tasting SectionCard */}
        <SectionCard
          sectionType="food"
          title={homeSleep.sectionFood}
          iconEmoji="🥕"
          footerLabel={homeSleep.viewHistory}
          onFooterPress={() => navigation.navigate('FoodTastingFlow')}
          onPlusPress={() => navigation.navigate('FoodTastingFlow')}
          plusAccessibilityLabel={labels.foodTastingTitle}
        />
      </ScrollView>
    </GenderedBackground>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  learningCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  learningKicker: {
    fontFamily: typography.bodyBlack,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  learningTitle: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 8,
  },
  learningBody: {
    fontFamily: typography.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  // Match parent body font size so the digit baseline aligns with the
  // surrounding Hebrew glyphs (iOS otherwise substitutes a bigger fallback).
  learningBodyNumber: {
    fontFamily: typography.bodyBlack,
    fontSize: 15,
    fontWeight: '800',
  },
  learningTitleNumber: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
