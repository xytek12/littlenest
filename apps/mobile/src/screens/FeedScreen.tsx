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

  // Quick-add sheet state
  const [showComposer, setShowComposer] = useState(false);
  const [mode, setMode] = useState<'bottle' | 'nursing'>('bottle');
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

  // Last feed for the section card body
  const lastFeed = filteredFeedEntries[0];
  const lastFeedValue = lastFeed
    ? lastFeed.kind === 'bottle'
      ? `${formatDateLong(lastFeed.timestamp, family.language)}`
      : `${formatDateLong(lastFeed.timestamp, family.language)}`
    : '';
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

  function handleSaveBottle() {
    recordBottleFeed({ amount: bottleAmount });
    setShowComposer(false);
    setManualAmount('');
  }

  function handleFinishNursing() {
    finishNursingSession();
    setShowComposer(false);
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
          onPlusPress={() => setShowComposer(true)}
          label={lastFeed ? labels.feed_redesign_lastLabel : labels.feed_redesign_noneLabel}
          value={lastFeedValue || labels.feed_redesign_noFeedYet}
          rightLabel={lastFeed ? lastFeedRightLabel : undefined}
          rightSublabel={lastFeed ? lastFeedRightSublabel : undefined}
          footerLabel={labels.feed_redesign_viewHistory}
          onFooterPress={() => navigation.navigate('FeedHistory')}
        />

        {/* Grouped history inline card */}
        <GroupedHistoryCard
          days={historyDays}
          windowLabel={grouped.lastWeek}
          emptyLabel={grouped.emptyWeek}
          onPress={() => navigation.navigate('FeedHistory')}
          testID="feed-inline-history"
        />

        {/* Quick-add bottom sheet — Nursing & Bottle only (no Solids) */}
        <Modal
          animationType="slide"
          onRequestClose={() => setShowComposer(false)}
          transparent
          visible={showComposer}
        >
          <View style={styles.modalOverlay}>
            <Pressable
              accessibilityLabel="Close feed composer"
              onPress={() => setShowComposer(false)}
              style={styles.modalBackdrop}
            />
            <View
              style={[
                styles.sheetCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.sheetHeader}>
                <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
                  {labels.sheetTitle}
                </Text>
                <Pressable
                  accessibilityLabel="Close feed composer"
                  onPress={() => setShowComposer(false)}
                  style={[styles.closeButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.closeButtonText, { color: theme.text }]}>×</Text>
                </Pressable>
              </View>

              {/* Mode picker — Nursing | Bottle only */}
              <View style={styles.modeRow}>
                {(['bottle', 'nursing'] as const).map((nextMode) => {
                  const selected = mode === nextMode;
                  return (
                    <Pressable
                      key={nextMode}
                      onPress={() => setMode(nextMode)}
                      style={[
                        styles.modeChip,
                        {
                          borderColor: selected ? activeAccent.primary : theme.border,
                          backgroundColor: selected ? activeAccent.primarySoft : 'transparent',
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modeChipText,
                          { color: selected ? activeAccent.primaryDeep : theme.text },
                        ]}
                      >
                        {nextMode === 'bottle' ? labels.bottle : labels.nursing}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {mode === 'bottle' ? (
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
                <View>
                  <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>
                    {labels.nursingSession}
                  </Text>
                  <View style={styles.nursingGrid}>
                    <View style={[styles.sideCard, { borderColor: theme.border }]}>
                      <Text style={[styles.sideTitle, rtlText, { color: theme.text }]}>
                        {labels.leftBreast}
                      </Text>
                      <Text style={[styles.sideHint, rtlText, { color: theme.mutedText }]}>
                        {labels.savedDuration(
                          formatDurationSeconds(getLiveSideSeconds('left', activeNursingSession)),
                        )}
                      </Text>
                      <Pressable
                        onPress={
                          activeNursingSession.leftStartedAt
                            ? () => stopNursing('left')
                            : () => startNursing('left')
                        }
                        style={[styles.primaryButton, { backgroundColor: activeAccent.primary }]}
                      >
                        <Text
                          style={[styles.primaryButtonText, { color: activeAccent.primaryDeep }]}
                        >
                          {activeNursingSession.leftStartedAt ? labels.stopLeft : labels.startLeft}
                        </Text>
                      </Pressable>
                    </View>
                    <View style={[styles.sideCard, { borderColor: theme.border }]}>
                      <Text style={[styles.sideTitle, rtlText, { color: theme.text }]}>
                        {labels.rightBreast}
                      </Text>
                      <Text style={[styles.sideHint, rtlText, { color: theme.mutedText }]}>
                        {labels.savedDuration(
                          formatDurationSeconds(getLiveSideSeconds('right', activeNursingSession)),
                        )}
                      </Text>
                      <Pressable
                        onPress={
                          activeNursingSession.rightStartedAt
                            ? () => stopNursing('right')
                            : () => startNursing('right')
                        }
                        style={[styles.primaryButton, { backgroundColor: activeAccent.primary }]}
                      >
                        <Text
                          style={[styles.primaryButtonText, { color: activeAccent.primaryDeep }]}
                        >
                          {activeNursingSession.rightStartedAt
                            ? labels.stopRight
                            : labels.startRight}
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                  <Pressable
                    onPress={handleFinishNursing}
                    style={[styles.secondaryButton, { backgroundColor: activeAccent.primarySoft }]}
                  >
                    <Text
                      style={[styles.secondaryButtonText, { color: activeAccent.primaryDeep }]}
                    >
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
    paddingBottom: 26,
  },
  sheetHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '900',
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
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  modeChip: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  modeChipText: {
    fontWeight: '900',
  },
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
  nursingGrid: {
    flexDirection: 'column',
    gap: 16,
  },
  sideCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  sideTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 6,
  },
  sideHint: {
    lineHeight: 20,
    marginBottom: 12,
    marginTop: 6,
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 12,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
