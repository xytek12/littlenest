import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GenderedBackground } from '../components/GenderedBackground';
import { GroupedHistoryCard, type GroupedHistoryDay } from '../components/GroupedHistoryCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { FeedStackParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette } from '../theme';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationHuman, formatDurationSeconds } from '../utils/formatDuration';
import { formatDateLong } from '../utils/formatDateLong';
import { formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLastDays, groupEntriesByDay } from '../utils/historyFilters';
import { useTickEverySecond } from '../utils/useTickEverySecond';

const bottlePresets = [30, 60, 90, 120, 160, 180, 210, 220, 240, 310, 330];

type ComposerStep = null | 'choice' | 'bottle' | 'nursing';

function getLiveSideSeconds(
  side: 'left' | 'right',
  session: {
    leftSeconds: number;
    rightSeconds: number;
    leftStartedAt: string | null;
    rightStartedAt: string | null;
  },
): number {
  const accumulated = side === 'left' ? session.leftSeconds : session.rightSeconds;
  const startedAt = side === 'left' ? session.leftStartedAt : session.rightStartedAt;
  if (!startedAt) return accumulated;
  const elapsedSinceStart = Math.max(0, (Date.now() - Date.parse(startedAt)) / 1000);
  return accumulated + elapsedSinceStart;
}

export function FeedScreen() {
  const theme = useAppTheme();
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const {
    activeChild,
    activeNursingSession,
    family,
    feedEntries,
    finishNursingSession,
    recordBottleFeed,
    settings,
    startNursing,
    stopNursing,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.feed;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const activeIndex = family.children.findIndex((child) => child.id === activeChild.id);
  const activeAccent = getChildAccent(activeChild, Math.max(0, activeIndex), palette);
  const isNursingActive =
    activeNursingSession.leftStartedAt != null || activeNursingSession.rightStartedAt != null;
  useTickEverySecond(isNursingActive);

  // Two-step composer state: null → choice → bottle | nursing
  const [composerStep, setComposerStep] = useState<ComposerStep>(null);
  const [selectedAmount, setSelectedAmount] = useState(120);
  const [manualAmount, setManualAmount] = useState('');
  const bottleAmount = useMemo(
    () => Number.parseInt(manualAmount, 10) || selectedAmount,
    [manualAmount, selectedAmount],
  );

  const childById = useMemo(() => {
    const map = new Map<string, (typeof family.children)[number]>();
    family.children.forEach((child) => map.set(child.id, child));
    return map;
  }, [family.children]);

  const filteredFeedEntries = useMemo(() => {
    if (!isTwins) return feedEntries;
    return feedEntries.filter((entry) => entry.childId === activeChild.id);
  }, [activeChild.id, feedEntries, isTwins]);

  const grouped = dictionary.groupedHistory;
  const historyDays = useMemo<GroupedHistoryDay[]>(() => {
    const windowed = entriesInLastDays(filteredFeedEntries, (entry) => entry.timestamp, 7);
    return groupEntriesByDay(windowed, (entry) => entry.timestamp).map((day) => ({
      dayKey: day.dayKey,
      representativeIso: day.representativeIso,
      rows: day.entries.map((entry) => {
        const time = formatHistoryTime(entry.timestamp, family.language);
        const child = childById.get(entry.childId);
        const secondary = isTwins ? child?.displayName : undefined;
        const childIndex = family.children.findIndex((c) => c.id === entry.childId);
        const accentForTwin = child
          ? getChildAccent(child, Math.max(0, childIndex), palette).primary
          : palette.primary;
        const accentColor = isTwins
          ? accentForTwin
          : entry.kind === 'bottle'
            ? colors.pink
            : colors.sage;
        const primary =
          entry.kind === 'bottle'
            ? labels.history.bottleRowInDay(time, entry.amount, entry.unit)
            : labels.history.nursingRowInDay(
                time,
                formatDurationHuman(entry.totalSeconds, family.language),
                formatDurationHuman(entry.leftSeconds, family.language),
                formatDurationHuman(entry.rightSeconds, family.language),
              );
        return { key: entry.id, primary, secondary, accentColor };
      }),
    }));
  }, [childById, family.children, family.language, filteredFeedEntries, isTwins, labels.history, palette]);

  // Last feed for the section card body
  const lastFeed = filteredFeedEntries[0];
  const lastFeedValue = lastFeed ? formatDateLong(lastFeed.timestamp, family.language) : '';
  const lastFeedRightLabel = lastFeed
    ? lastFeed.kind === 'bottle'
      ? `${lastFeed.amount} ${lastFeed.unit}`
      : formatDurationHuman(lastFeed.totalSeconds, family.language)
    : '';
  const lastFeedRightSublabel = lastFeed
    ? lastFeed.kind === 'bottle'
      ? labels.bottle
      : labels.nursing
    : '';

  function openComposer() {
    // Skip choice step if nursing timers are already running
    setComposerStep(isNursingActive ? 'nursing' : 'choice');
  }

  function closeComposer() {
    setComposerStep(null);
    setManualAmount('');
  }

  function handleSaveBottle() {
    recordBottleFeed({ amount: bottleAmount });
    closeComposer();
  }

  function handleFinishNursing() {
    finishNursingSession();
    closeComposer();
  }

  return (
    <GenderedBackground>
      <Screen testID="screen-feed" scroll contentContainerStyle={styles.screenContent}>
        <TwinPickerCards compact />

        {/* Feed section card */}
        <SectionCard
          sectionType="feed"
          title={labels.title}
          iconEmoji="🍼"
          onPlusPress={openComposer}
          label={lastFeed ? labels.feed_redesign_lastLabel : labels.feed_redesign_noneLabel}
          value={lastFeedValue || labels.feed_redesign_noFeedYet}
          rightLabel={lastFeed ? lastFeedRightLabel : undefined}
          rightSublabel={lastFeed ? lastFeedRightSublabel : undefined}
          footerLabel={labels.feed_redesign_viewHistory}
          onFooterPress={() => navigation.navigate('FeedHistory')}
        />

        {/* Inline 7-day history preview */}
        <GroupedHistoryCard
          days={historyDays}
          windowLabel={grouped.lastWeek}
          emptyLabel={grouped.emptyWeek}
          onPress={() => navigation.navigate('FeedHistory')}
          testID="feed-inline-history"
        />

        {/* Two-step composer modal */}
        <Modal
          animationType="slide"
          onRequestClose={closeComposer}
          transparent
          visible={composerStep !== null}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              accessibilityLabel="Close feed composer"
              onPress={closeComposer}
              style={styles.modalBackdrop}
            />
            <View
              style={[
                styles.sheetCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {/* Header row */}
              <View style={styles.sheetHeader}>
                {composerStep !== 'choice' ? (
                  <Pressable
                    onPress={() => setComposerStep('choice')}
                    style={styles.backButton}
                    accessibilityLabel="Back to feed type choice"
                  >
                    <Text style={[styles.backButtonText, { color: theme.mutedText }]}>‹</Text>
                  </Pressable>
                ) : (
                  <View style={styles.backButtonPlaceholder} />
                )}
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  {composerStep === 'choice'
                    ? labels.sheetTitle
                    : composerStep === 'bottle'
                      ? labels.bottle
                      : labels.nursing}
                </Text>
                <Pressable
                  accessibilityLabel="Close feed composer"
                  onPress={closeComposer}
                  style={[styles.closeButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.closeButtonText, { color: theme.text }]}>×</Text>
                </Pressable>
              </View>

              {/* STEP 1: Choose bottle or nursing */}
              {composerStep === 'choice' ? (
                <View style={styles.choiceGrid}>
                  <Pressable
                    onPress={() => setComposerStep('bottle')}
                    style={[
                      styles.choiceCard,
                      { borderColor: activeAccent.primary, backgroundColor: activeAccent.primarySoft },
                    ]}
                  >
                    <Text style={styles.choiceEmoji}>🍼</Text>
                    <Text style={[styles.choiceLabel, { color: activeAccent.primaryDeep }]}>
                      {labels.bottle}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setComposerStep('nursing')}
                    style={[
                      styles.choiceCard,
                      { borderColor: activeAccent.primary, backgroundColor: activeAccent.primarySoft },
                    ]}
                  >
                    <Text style={styles.choiceEmoji}>🤱</Text>
                    <Text style={[styles.choiceLabel, { color: activeAccent.primaryDeep }]}>
                      {labels.nursing}
                    </Text>
                  </Pressable>
                </View>

              ) : composerStep === 'bottle' ? (
                /* STEP 2a: Bottle */
                <View>
                  <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>
                    {labels.bottleAmount(settings.feedUnit)}
                  </Text>
                  <View style={styles.presetWrap}>
                    {bottlePresets.map((preset) => {
                      const selected = bottleAmount === preset && manualAmount.length === 0;
                      return (
                        <Pressable
                          key={preset}
                          onPress={() => {
                            setSelectedAmount(preset);
                            setManualAmount('');
                          }}
                          style={[
                            styles.presetChip,
                            {
                              borderColor: selected ? activeAccent.primary : theme.border,
                              backgroundColor: selected ? activeAccent.primarySoft : 'transparent',
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.presetText,
                              { color: selected ? activeAccent.primaryDeep : theme.text },
                            ]}
                          >
                            {preset}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <TextInput
                    keyboardType="number-pad"
                    onChangeText={setManualAmount}
                    placeholder={labels.customAmount}
                    placeholderTextColor={theme.mutedText}
                    style={[
                      styles.input,
                      rtlText,
                      { color: theme.text, borderColor: theme.border },
                    ]}
                    value={manualAmount}
                  />
                  <Pressable
                    onPress={handleSaveBottle}
                    style={[styles.primaryButton, { backgroundColor: activeAccent.primary }]}
                  >
                    <Text style={[styles.primaryButtonText, { color: activeAccent.primaryDeep }]}>
                      {labels.saveBottle}
                    </Text>
                  </Pressable>
                </View>

              ) : (
                /* STEP 2b: Nursing — left/right live timers */
                <View>
                  <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>
                    {labels.nursingSession}
                  </Text>
                  <View style={styles.nursingGrid}>
                    {(['left', 'right'] as const).map((side) => {
                      const isRunning = side === 'left'
                        ? activeNursingSession.leftStartedAt != null
                        : activeNursingSession.rightStartedAt != null;
                      const liveSeconds = getLiveSideSeconds(side, activeNursingSession);
                      const sideLabel = side === 'left' ? labels.leftBreast : labels.rightBreast;
                      const startLabel = side === 'left' ? labels.startLeft : labels.startRight;
                      const stopLabel = side === 'left' ? labels.stopLeft : labels.stopRight;
                      return (
                        <View
                          key={side}
                          style={[
                            styles.sideCard,
                            {
                              borderColor: isRunning ? activeAccent.primary : theme.border,
                              backgroundColor: isRunning ? activeAccent.primarySoft : 'transparent',
                            },
                          ]}
                        >
                          <Text style={[styles.sideTitle, rtlText, { color: theme.text }]}>
                            {sideLabel}
                          </Text>
                          <Text style={[styles.sideHint, rtlText, { color: isRunning ? activeAccent.primaryDeep : theme.mutedText }]}>
                            {labels.savedDuration(formatDurationSeconds(liveSeconds))}
                          </Text>
                          <Pressable
                            onPress={isRunning ? () => stopNursing(side) : () => startNursing(side)}
                            style={[
                              styles.sideButton,
                              {
                                backgroundColor: isRunning ? activeAccent.primaryDeep : activeAccent.primary,
                              },
                            ]}
                          >
                            <Text style={[styles.sideButtonText, { color: isRunning ? '#fff' : activeAccent.primaryDeep }]}>
                              {isRunning ? stopLabel : startLabel}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                  <Pressable
                    onPress={handleFinishNursing}
                    style={[styles.primaryButton, { backgroundColor: activeAccent.primary, marginTop: 16 }]}
                  >
                    <Text style={[styles.primaryButtonText, { color: activeAccent.primaryDeep }]}>
                      {labels.finishNursing}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </Screen>
    </GenderedBackground>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingTop: 8 },
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
    padding: 18,
    paddingBottom: 32,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
  },
  backButton: {
    alignItems: 'center',
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  backButtonText: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 30,
  },
  backButtonPlaceholder: {
    height: 34,
    width: 34,
  },
  closeButton: {
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '900',
    lineHeight: 22,
  },
  // STEP 1: choice grid
  choiceGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  choiceCard: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    flex: 1,
    paddingVertical: 24,
    gap: 10,
  },
  choiceEmoji: {
    fontSize: 36,
  },
  choiceLabel: {
    fontSize: 16,
    fontWeight: '900',
  },
  // Bottle
  sectionTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  presetChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  presetText: {
    fontWeight: '800',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 15,
    fontWeight: '900',
  },
  // Nursing
  nursingGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  sideCard: {
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    flex: 1,
    gap: 8,
    padding: 14,
  },
  sideTitle: {
    fontSize: 14,
    fontWeight: '900',
  },
  sideHint: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  sideButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    width: '100%',
  },
  sideButtonText: {
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
