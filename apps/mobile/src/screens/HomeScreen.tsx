import { useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { FeedComposerSheet } from '../components/FeedComposerSheet';
import { GenderedBackground } from '../components/GenderedBackground';
import { GrowthComposerSheet } from '../components/GrowthComposerSheet';
import { SectionCard } from '../components/SectionCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import { WatercolorHeader } from '../components/WatercolorHeader';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getPalette, typography, typographyHe } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';
import { formatDateLong } from '../utils/formatDateLong';
import { formatHistoryTime } from '../utils/formatHistoryDate';
import { useTickEverySecond } from '../utils/useTickEverySecond';

function getRunningMinutes(startedAt: string) {
  return Math.max(0, Math.floor((Date.now() - Date.parse(startedAt)) / 60000));
}

// Render a string so that any digit runs (e.g. "14" inside "14 ימי מעקב")
// get an explicit larger / bolder style, using the correct font for the active
// language. Fixes iOS substituting a smaller fallback font for digits next to
// Hebrew glyphs, and ensures visual consistency with Frank Ruhl Libre.
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
    activeNursingSession,
    activeSleepStartedAt,
    endSleep,
    family,
    feedEntries,
    growthEntries,
    sleepSessions,
    startSleep,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.home;
  const story = dictionary.storybook;
  const homeSleep = dictionary.homeSleep;
  const commonLabels = dictionary.common;
  const isRtl = isRtlLanguage(family.language);
  const rtlText = isRtl ? styles.rtlText : null;
  const isTwins = family.mode === 'twins' && family.children.length >= 2;
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const trackedDays = countTrackedDays(sleepSessions, feedEntries);
  const learningReady = trackedDays >= 14;

  const [showSleepModal, setShowSleepModal] = useState(false);
  const [showFeedSheet, setShowFeedSheet] = useState(false);
  const [showGrowthSheet, setShowGrowthSheet] = useState(false);

  const isNursingActive =
    activeNursingSession.leftStartedAt != null || activeNursingSession.rightStartedAt != null;
  const lastFeed = feedEntries[0];
  // Newest growth entry first (state stores them prepended on save).
  const latestGrowth = growthEntries[0];

  // Keep ticker active so the active-sleep card and modal update each minute
  useTickEverySecond(activeSleepStartedAt != null);

  const storybookTitle = isTwins
    ? story.homeTwins(family.children[0].displayName, family.children[1].displayName)
    : story.homeSingle(activeChild.displayName);

  const sleepingChild = activeSleepStartedAt ? activeChild : null;
  const subtitle = sleepingChild
    ? labels.sleepingStatus(sleepingChild.displayName, sleepingChild.sex)
    : isTwins
      ? undefined
      : getAgeLabel(activeChild.dateOfBirth, new Date(), family.language);

  // Last 2 sleeps for the idle card. State stores newest first via
  // `[session, ...current]`, but to be safe we sort descending by startedAt.
  const recentSleeps = [...sleepSessions]
    .sort((a, b) => Date.parse(b.startedAt) - Date.parse(a.startedAt))
    .slice(0, 2);

  const insets = useSafeAreaInsets();

  // Language-aware digit styles for the learning-card "14 days" copy.
  // Hebrew mode: Frank Ruhl Libre (same font used for the surrounding Hebrew
  // text) — avoids iOS falling back to a mismatched system font for the digit.
  const digitTitleStyle = isRtl
    ? { ...styles.learningTitleNumber, fontFamily: typographyHe.displayHe }
    : styles.learningTitleNumber;
  const digitBodyStyle = isRtl
    ? { ...styles.learningBodyNumber, fontFamily: typographyHe.bodyBoldHe }
    : styles.learningBodyNumber;

  const activeMinutes = activeSleepStartedAt
    ? getRunningMinutes(activeSleepStartedAt)
    : 0;

  function openSleepHistory() {
    // Navigate into the nested SleepStack and land directly on SleepHistory.
    navigation.navigate('SleepFlow', { screen: 'SleepHistory' });
  }

  function openFeedHistory() {
    navigation.navigate('FeedFlow', { screen: 'FeedHistory' });
  }

  function openGrowthHistory() {
    navigation.navigate('Growth', { screen: 'GrowthHistory' });
  }

  function getGrowthKindLabel(kind: 'weight' | 'height' | 'head') {
    return kind === 'weight'
      ? dictionary.growth.weight
      : kind === 'height'
        ? dictionary.growth.height
        : dictionary.growth.head;
  }

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
              : renderWithStyledDigits(labels.learningTitle, digitTitleStyle)}
          </Text>
          <Text style={[styles.learningBody, rtlText, { color: theme.mutedText }]}>
            {learningReady
              ? labels.suggestionBody(activeChild.displayName)
              : renderWithStyledDigits(
                  labels.learningBody(trackedDays),
                  digitBodyStyle,
                )}
          </Text>
        </View>

        <TwinPickerCards />

        {/* Sleep card — active vs idle */}
        {activeSleepStartedAt ? (
          <Pressable
            testID="home-active-sleep-card"
            onPress={() => setShowSleepModal(true)}
            accessibilityRole="button"
            accessibilityLabel={homeSleep.sleepingNowTitle(activeChild.displayName, activeChild.sex)}
            style={[
              styles.activeSleepCard,
              {
                backgroundColor: theme.surface,
                borderColor: palette.primary,
              },
            ]}
          >
            <Text style={styles.moonGlyph}>🌙</Text>
            <Text
              style={[
                styles.activeSleepTitle,
                rtlText,
                { color: theme.text, fontFamily: isRtl ? typographyHe.displayHe : typography.displayBold },
              ]}
            >
              {homeSleep.sleepingNowTitle(activeChild.displayName, activeChild.sex)}
            </Text>
            <Text style={[styles.activeSleepSubtitle, rtlText, { color: theme.mutedText }]}>
              {homeSleep.sleepingNowSubtitle(
                formatHistoryTime(activeSleepStartedAt, family.language),
                activeMinutes,
              )}
            </Text>
            <Text style={[styles.activeSleepHint, rtlText, { color: palette.primaryDeep }]}>
              {homeSleep.sleepingNowHint}
            </Text>
            <Pressable
              onPress={openSleepHistory}
              accessibilityRole="button"
              hitSlop={8}
              style={[styles.activeSleepHistoryRow, isRtl ? styles.alignEnd : null]}
            >
              <Text style={[styles.activeSleepHistoryText, rtlText, { color: palette.primaryDeep }]}>
                {homeSleep.viewHistory}
              </Text>
            </Pressable>
          </Pressable>
        ) : (
          <SectionCard
            sectionType="sleep"
            title={homeSleep.sectionSleep}
            iconEmoji="🌙"
            footerLabel={homeSleep.viewHistory}
            onFooterPress={openSleepHistory}
            onPlusPress={() => setShowSleepModal(true)}
            plusAccessibilityLabel={labels.sleepTitle}
          >
            <Text style={[styles.idleSleepLabel, rtlText, { color: theme.mutedText }]}>
              {homeSleep.recentSleepsLabel}
            </Text>
            {recentSleeps.length === 0 ? (
              <Text style={[styles.idleSleepEmpty, rtlText, { color: theme.text }]}>
                {homeSleep.noRecentSleeps}
              </Text>
            ) : (
              recentSleeps.map((session) => {
                const startTime = formatHistoryTime(session.startedAt, family.language);
                const endTime = formatHistoryTime(session.endedAt, family.language);
                const dateLabel = formatDateLong(session.startedAt, family.language);
                return (
                  <View key={session.id} style={styles.recentSleepRow}>
                    <Text style={[styles.recentSleepDate, rtlText, { color: theme.text }]}>
                      {dateLabel}
                    </Text>
                    {/* Force LTR so start time stays on the LEFT, end on the RIGHT,
                        even in Hebrew. The user explicitly wants chronological ordering. */}
                    <Text style={[styles.recentSleepRange, { color: theme.text }]}>
                      {homeSleep.sleepTimeRange(startTime, endTime)}
                    </Text>
                  </View>
                );
              })
            )}
          </SectionCard>
        )}

        {/* Feed SectionCard — "+" opens chooser popup. The card body is
            tappable when a nursing session is in progress so the parent can
            resume the live timers without losing state. */}
        <SectionCard
          sectionType="feed"
          title={homeSleep.sectionFeed}
          iconEmoji="🍼"
          footerLabel={homeSleep.viewHistory}
          onFooterPress={openFeedHistory}
          onPlusPress={() => setShowFeedSheet(true)}
          plusAccessibilityLabel={labels.feedTitle}
        >
          {/* Body is display-only; only the "+" button opens the composer. */}
          <View style={styles.feedBody}>
            {isNursingActive ? (
              <>
                <Text style={[styles.feedActiveLabel, rtlText, { color: palette.primaryDeep }]}>
                  {homeSleep.feedActiveLabel}
                </Text>
                <Text style={[styles.feedActiveValue, rtlText, { color: theme.text }]}>
                  {dictionary.feed.nursingSession}
                </Text>
                <Text style={[styles.feedActiveHint, rtlText, { color: theme.mutedText }]}>
                  {homeSleep.feedActiveResume}
                </Text>
              </>
            ) : (
              <>
                <Text style={[styles.feedActiveLabel, rtlText, { color: theme.mutedText }]}>
                  {homeSleep.feedLastLabel}
                </Text>
                <Text style={[styles.feedActiveValue, rtlText, { color: theme.text }]}>
                  {lastFeed
                    ? formatDateLong(lastFeed.timestamp, family.language)
                    : homeSleep.feedNoneYet}
                </Text>
              </>
            )}
          </View>
        </SectionCard>

        {/* Growth SectionCard — "+" opens the unified weight/height/head popup.
            Growth is no longer a bottom-dock tab; it lives here so parents see
            it alongside sleep and feed at a glance. */}
        <SectionCard
          sectionType="learn"
          title={homeSleep.sectionGrowth}
          iconEmoji="📊"
          footerLabel={homeSleep.viewHistory}
          onFooterPress={openGrowthHistory}
          onPlusPress={() => setShowGrowthSheet(true)}
          plusAccessibilityLabel={dictionary.growth.title}
        >
          <Pressable
            testID="home-growth-card-body"
            onPress={() => setShowGrowthSheet(true)}
            style={styles.feedBody}
          >
            <Text style={[styles.feedActiveLabel, rtlText, { color: theme.mutedText }]}>
              {homeSleep.growthLatestLabel}
            </Text>
            <Text style={[styles.feedActiveValue, rtlText, { color: theme.text }]}>
              {latestGrowth
                ? homeSleep.growthLatestValue(
                    getGrowthKindLabel(latestGrowth.kind),
                    latestGrowth.value,
                    latestGrowth.unit,
                  )
                : homeSleep.growthNoMeasurementsYet}
            </Text>
          </Pressable>
        </SectionCard>

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

      {/* Feed composer sheet — minimizable. Closing keeps internal state so
          the user can resume the nursing timer or finish a bottle draft. */}
      <FeedComposerSheet
        visible={showFeedSheet}
        onMinimize={() => setShowFeedSheet(false)}
        onCommitted={() => setShowFeedSheet(false)}
      />

      {/* Growth composer sheet — unified popup for weight/height/head. */}
      <GrowthComposerSheet
        visible={showGrowthSheet}
        onClose={() => setShowGrowthSheet(false)}
      />

      {/* Sleep start / end popup */}
      <Modal
        animationType="slide"
        onRequestClose={() => setShowSleepModal(false)}
        transparent
        visible={showSleepModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close sleep popup"
            onPress={() => setShowSleepModal(false)}
            style={styles.modalBackdrop}
          />
          <View style={[styles.sheetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {activeSleepStartedAt ? (
              <>
                <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
                  {homeSleep.endSleepTitle}
                </Text>
                <Text style={[styles.sheetBody, rtlText, { color: theme.mutedText }]}>
                  {homeSleep.endSleepBody(activeMinutes)}
                </Text>
                <View style={styles.sheetActions}>
                  <Pressable
                    onPress={() => setShowSleepModal(false)}
                    style={[styles.secondaryBtn, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                      {commonLabels.cancel}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityLabel="End sleep session"
                    onPress={() => {
                      // Don't touch wake count — saved silently as 0 per user spec.
                      endSleep({ wakeCount: 0 });
                      setShowSleepModal(false);
                    }}
                    style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
                  >
                    <Text style={[styles.primaryBtnText, { color: palette.primaryDeep }]}>
                      {homeSleep.endSleepConfirm}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
                  {homeSleep.sectionSleep}
                </Text>
                <Text style={[styles.sheetBody, rtlText, { color: theme.mutedText }]}>
                  {homeSleep.startPrompt}
                </Text>
                <View style={styles.sheetActions}>
                  <Pressable
                    onPress={() => setShowSleepModal(false)}
                    style={[styles.secondaryBtn, { borderColor: theme.border }]}
                  >
                    <Text style={[styles.secondaryBtnText, { color: theme.text }]}>
                      {commonLabels.cancel}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      startSleep();
                      setShowSleepModal(false);
                    }}
                    style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
                  >
                    <Text style={[styles.primaryBtnText, { color: palette.primaryDeep }]}>
                      {dictionary.sleep.start}
                    </Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    fontSize: 16,
    lineHeight: 24,
    marginTop: 10,
  },
  learningBodyNumber: {
    fontFamily: typography.bodyBlack,
    fontSize: 16,
    fontWeight: '800',
  },
  learningTitleNumber: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
  alignEnd: { alignSelf: 'flex-end' },
  // Active sleep card — big, tappable
  activeSleepCard: {
    borderRadius: 22,
    borderWidth: 2,
    marginBottom: 12,
    paddingHorizontal: 20,
    paddingVertical: 22,
  },
  moonGlyph: {
    fontSize: 36,
    marginBottom: 6,
  },
  activeSleepTitle: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
  },
  activeSleepSubtitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    marginTop: 8,
  },
  activeSleepHint: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 12,
    textTransform: 'uppercase',
  },
  activeSleepHistoryRow: {
    marginTop: 14,
  },
  activeSleepHistoryText: {
    fontSize: 14,
    fontWeight: '700',
  },
  // Idle sleep card body (inside SectionCard children)
  idleSleepLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  idleSleepEmpty: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 22,
  },
  recentSleepRow: {
    marginBottom: 10,
  },
  recentSleepDate: {
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 22,
  },
  // Feed card body (inside SectionCard)
  feedBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  feedActiveLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  feedActiveValue: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 6,
  },
  feedActiveHint: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  recentSleepRange: {
    fontSize: 17,
    fontVariant: ['tabular-nums'],
    fontWeight: '800',
    letterSpacing: 0.5,
    lineHeight: 24,
    marginTop: 2,
    // Force LTR ordering so the chronological start is on the LEFT.
    writingDirection: 'ltr',
    textAlign: 'left',
  },
  // Sleep modal
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.42)',
  },
  sheetCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    paddingBottom: 32,
  },
  sheetTitle: {
    fontFamily: typography.displayBold,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
  sheetBody: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  sheetActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  secondaryBtn: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryBtn: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '900',
  },
});
