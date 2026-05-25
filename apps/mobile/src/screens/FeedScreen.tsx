import { useMemo, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { InlineHistoryCard, type InlineHistoryRow } from '../components/InlineHistoryCard';
import { Screen } from '../components/Screen';
import { TwinSelector } from '../components/TwinSelector';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { FeedStackParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette } from '../theme';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationSeconds } from '../utils/formatDuration';
import { formatHistoryDate, formatHistoryTime } from '../utils/formatHistoryDate';
import { entriesInLast24h } from '../utils/historyFilters';
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
    selectChild,
    settings,
    startNursing,
    stopNursing,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.feed;
  const story = dictionary.storybook;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins';
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const activeIndex = family.children.findIndex((child) => child.id === activeChild.id);
  const activeAccent = getChildAccent(activeChild, Math.max(0, activeIndex), palette);
  const [twinFilter, setTwinFilter] = useState<string | null>(isTwins ? activeChild.id : null);
  const isNursingActive =
    activeNursingSession.leftStartedAt != null || activeNursingSession.rightStartedAt != null;
  useTickEverySecond(isNursingActive);
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
    if (!isTwins || twinFilter == null) return feedEntries;
    return feedEntries.filter((entry) => entry.childId === twinFilter);
  }, [feedEntries, isTwins, twinFilter]);

  const inlineRows = useMemo<InlineHistoryRow[]>(
    () =>
      entriesInLast24h(filteredFeedEntries, (entry) => entry.timestamp)
        .slice(0, 5)
        .map((entry) => {
          const date = formatHistoryDate(entry.timestamp, family.language);
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
              ? labels.history.bottleRow(date, time, entry.amount, entry.unit)
              : labels.history.nursingRow(
                  date,
                  time,
                  formatDurationSeconds(entry.totalSeconds),
                  formatDurationSeconds(entry.leftSeconds),
                  formatDurationSeconds(entry.rightSeconds),
                );
          return { key: entry.id, primary, secondary, accentColor };
        }),
    [childById, family.children, family.language, filteredFeedEntries, isTwins, labels.history, palette],
  );

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
    <Screen testID="screen-feed" scroll>
      <FlowHeader
        title={labels.title}
        subtitle={labels.subtitle(activeChild.displayName)}
        storybookTitle={story.nursing}
      />

      {isTwins ? (
        <TwinSelector
          selectedChildId={twinFilter}
          onSelect={(id) => {
            setTwinFilter(id);
            if (id) selectChild(id);
          }}
        />
      ) : null}

      <ActionCard
        title={labels.actionTitle}
        subtitle={labels.actionSubtitle}
        accent={activeAccent.primary}
        onPress={() => setShowComposer(true)}
      />

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
          <View style={[styles.sheetCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>{labels.sheetTitle}</Text>
              <Pressable
                accessibilityLabel="Close feed composer"
                onPress={() => setShowComposer(false)}
                style={[styles.closeButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>×</Text>
              </Pressable>
            </View>

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
                        borderColor: selected ? colors.blue : theme.border,
                        backgroundColor: selected ? colors.blueSoft : 'transparent',
                      },
                    ]}
                  >
                    <Text style={[styles.modeChipText, { color: selected ? '#284D71' : theme.text }]}>
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
                            borderColor: selected ? colors.pink : theme.border,
                            backgroundColor: selected ? colors.pinkSoft : 'transparent',
                          },
                        ]}
                      >
                        <Text style={[styles.presetText, { color: selected ? colors.berry : theme.text }]}>
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
                  placeholderTextColor="#8B99AA"
                  style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
                  value={manualAmount}
                />
                <Pressable onPress={handleSaveBottle} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>{labels.saveBottle}</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>{labels.nursingSession}</Text>
                <View style={styles.nursingGrid}>
                  <View style={[styles.sideCard, { borderColor: theme.border }]}>
                    <Text style={[styles.sideTitle, rtlText, { color: theme.text }]}>{labels.leftBreast}</Text>
                    <Text style={[styles.sideHint, rtlText]}>
                      {labels.savedDuration(
                        formatDurationSeconds(getLiveSideSeconds('left', activeNursingSession)),
                      )}
                    </Text>
                    <Pressable
                      onPress={
                        activeNursingSession.leftStartedAt ? () => stopNursing('left') : () => startNursing('left')
                      }
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {activeNursingSession.leftStartedAt ? labels.stopLeft : labels.startLeft}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={[styles.sideCard, { borderColor: theme.border }]}>
                    <Text style={[styles.sideTitle, rtlText, { color: theme.text }]}>{labels.rightBreast}</Text>
                    <Text style={[styles.sideHint, rtlText]}>
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
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {activeNursingSession.rightStartedAt ? labels.stopRight : labels.startRight}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={handleFinishNursing} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>{labels.finishNursing}</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <InlineHistoryCard
        rows={inlineRows}
        onPress={() => navigation.navigate('FeedHistory')}
        testID="feed-inline-history"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    flexDirection: 'row',
    gap: 10,
  },
  sideCard: {
    borderRadius: 16,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  sideTitle: {
    fontSize: 15,
    fontWeight: '900',
  },
  sideHint: {
    color: '#6B7D91',
    lineHeight: 20,
    marginBottom: 12,
    marginTop: 6,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.blue,
    borderRadius: 14,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#0C2944',
    fontWeight: '900',
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.pinkSoft,
    borderRadius: 14,
    marginTop: 12,
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: colors.berry,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
