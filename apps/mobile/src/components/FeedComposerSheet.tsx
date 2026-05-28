/**
 * FeedComposerSheet — bottom-sheet popup for the Feed composer.
 *
 * Three steps: 'choice' (bottle vs nursing), 'bottle' (presets + custom),
 * and 'nursing' (left/right live timers + finish). Minimizable: the parent
 * controls `visible` and can hide the sheet without losing the internal
 * step / draft amount (and the nursing timers keep running in global state
 * regardless because they live in PrototypeState).
 *
 * Used on both HomeScreen (Feed card "+") and FeedScreen.
 */

import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';
import { formatDurationSeconds } from '../utils/formatDuration';
import { useTickEverySecond } from '../utils/useTickEverySecond';

export type FeedComposerStep = 'choice' | 'bottle' | 'nursing';

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

type Props = {
  /** Controls whether the modal is visible. Setting to false MINIMIZES — internal step + draft survive. */
  visible: boolean;
  /** Called when user dismisses via backdrop or X — does NOT clear state. */
  onMinimize: () => void;
  /** Called after a successful save (bottle or nursing finish) so the parent can hide the sheet. */
  onCommitted?: () => void;
};

export function FeedComposerSheet({ visible, onMinimize, onCommitted }: Props) {
  const theme = useAppTheme();
  const {
    activeChild,
    activeNursingSession,
    family,
    finishNursingSession,
    recordBottleFeed,
    settings,
    startNursing,
    stopNursing,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.feed;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const activeIndex = family.children.findIndex((child) => child.id === activeChild.id);
  const activeAccent = getChildAccent(activeChild, Math.max(0, activeIndex), palette);
  const isNursingActive =
    activeNursingSession.leftStartedAt != null || activeNursingSession.rightStartedAt != null;
  useTickEverySecond(visible && isNursingActive);

  // Persistent step state survives minimize/restore. Defaults to 'choice'
  // for first open; if user already started nursing elsewhere, jump straight
  // to the nursing screen on next open.
  const [step, setStep] = useState<FeedComposerStep>('choice');
  const [selectedAmount, setSelectedAmount] = useState(120);
  const [manualAmount, setManualAmount] = useState('');

  // When the user activates nursing timers from another surface, force the
  // sheet to land on the nursing step the next time it becomes visible.
  useEffect(() => {
    if (visible && isNursingActive && step === 'choice') {
      setStep('nursing');
    }
  }, [visible, isNursingActive, step]);

  const bottleAmount = useMemo(
    () => Number.parseInt(manualAmount, 10) || selectedAmount,
    [manualAmount, selectedAmount],
  );

  function handleSaveBottle() {
    recordBottleFeed({ amount: bottleAmount });
    // Reset draft so the next "+" starts fresh.
    setManualAmount('');
    setSelectedAmount(120);
    setStep('choice');
    onCommitted?.();
  }

  function handleFinishNursing() {
    finishNursingSession();
    setStep('choice');
    onCommitted?.();
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onMinimize}
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close feed composer"
            onPress={onMinimize}
            style={styles.modalBackdrop}
          />
          <View
            style={[
              styles.sheetCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
              {/* Header row: back + title + minimize */}
              <View style={styles.sheetHeader}>
                {step !== 'choice' ? (
                  <Pressable
                    onPress={() => setStep('choice')}
                    style={styles.backButton}
                    accessibilityLabel="Back to feed type choice"
                  >
                    <Text style={[styles.backButtonText, { color: theme.mutedText }]}>‹</Text>
                  </Pressable>
                ) : (
                  <View style={styles.backButtonPlaceholder} />
                )}
                <Text style={[styles.sheetTitle, { color: theme.text }]}>
                  {step === 'choice'
                    ? labels.sheetTitle
                    : step === 'bottle'
                      ? labels.bottle
                      : labels.nursing}
                </Text>
                <Pressable
                  accessibilityLabel="Minimize feed composer"
                  onPress={onMinimize}
                  style={[styles.closeButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.closeButtonText, { color: theme.text }]}>×</Text>
                </Pressable>
              </View>

              {/* STEP 1: Choose bottle or nursing */}
              {step === 'choice' ? (
                <View style={styles.choiceGrid}>
                  <Pressable
                    onPress={() => setStep('bottle')}
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
                    onPress={() => setStep('nursing')}
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

              ) : step === 'bottle' ? (
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
            </ScrollView>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
