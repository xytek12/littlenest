import { useState } from 'react';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GenderedBackground } from '../components/GenderedBackground';
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
import { formatDurationHuman } from '../utils/formatDuration';
import { useTickEverySecond } from '../utils/useTickEverySecond';

function getRunningDuration(startedAt: string, language = 'he') {
  return formatDurationHuman(
    Math.max(0, Math.round((Date.now() - Date.parse(startedAt)) / 1000)),
    language,
  );
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

  // Keep ticker active so the sleep modal shows a live timer when open
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

  const lastSleep = sleepSessions.length > 0 ? sleepSessions[sleepSessions.length - 1] : null;

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

        {/* Sleep SectionCard — both states open the sleep modal */}
        {activeSleepStartedAt ? (
          <SectionCard
            sectionType="sleep"
            title={homeSleep.sectionSleep}
            iconEmoji="🌙"
            label={homeSleep.activeSleepLabel}
            value={homeSleep.activeSleepSince(formatDateLong(activeSleepStartedAt, family.language))}
            footerLabel={homeSleep.viewHistory}
            onFooterPress={() => navigation.navigate('SleepFlow')}
            onPlusPress={() => setShowSleepModal(true)}
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
            onPlusPress={() => setShowSleepModal(true)}
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

      {/* Sleep start / stop popup */}
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
            <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
              {homeSleep.sectionSleep}
            </Text>

            {activeSleepStartedAt ? (
              <>
                <Text style={[styles.sheetBody, rtlText, { color: theme.mutedText }]}>
                  {homeSleep.activeSleepSince(formatDateLong(activeSleepStartedAt, family.language))}
                </Text>
                <Text style={[styles.timerDisplay, { color: theme.text }]}>
                  {getRunningDuration(activeSleepStartedAt, family.language)}
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
                      endSleep({ wakeCount: 0 });
                      setShowSleepModal(false);
                    }}
                    style={[styles.primaryBtn, { backgroundColor: palette.primary }]}
                  >
                    <Text style={[styles.primaryBtnText, { color: palette.primaryDeep }]}>
                      {homeSleep.activeSleepStopButton}
                    </Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
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
                      navigation.navigate('SleepFlow');
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
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
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
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 8,
  },
  sheetBody: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
  },
  timerDisplay: {
    fontFamily: typography.displayBold,
    fontSize: 36,
    fontWeight: '900',
    marginBottom: 16,
    textAlign: 'center',
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
    fontWeight: '800',
  },
  primaryBtn: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 14,
  },
  primaryBtnText: {
    fontWeight: '900',
  },
});
