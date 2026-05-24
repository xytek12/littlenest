import { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

const bottlePresets = [30, 60, 90, 120, 160, 180, 210, 220, 240, 310, 330];

function formatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function FeedScreen() {
  const theme = useAppTheme();
  const {
    activeChild,
    activeNursingSession,
    feedEntries,
    finishNursingSession,
    recordBottleFeed,
    settings,
    startNursing,
    stopNursing,
  } = usePrototypeState();
  const [showComposer, setShowComposer] = useState(false);
  const [mode, setMode] = useState<'bottle' | 'nursing'>('bottle');
  const [selectedAmount, setSelectedAmount] = useState(120);
  const [manualAmount, setManualAmount] = useState('');
  const bottleAmount = useMemo(
    () => Number.parseInt(manualAmount, 10) || selectedAmount,
    [manualAmount, selectedAmount],
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
      <FlowHeader title="Feed" subtitle={`Quick feed tracking for ${activeChild.displayName}.`} />

      <ActionCard
        title="Bottle / nursing"
        subtitle="Choose the type, then record amount or side timing."
        accent={colors.sage}
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
              <Text style={[styles.sheetTitle, { color: theme.text }]}>Choose feed type</Text>
              <Pressable
                accessibilityLabel="Close feed composer"
                onPress={() => setShowComposer(false)}
                style={[styles.closeButton, { borderColor: theme.border }]}
              >
                <Text style={[styles.closeButtonText, { color: theme.text }]}>x</Text>
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
                      {nextMode === 'bottle' ? 'Bottle' : 'Nursing'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'bottle' ? (
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Bottle amount ({settings.feedUnit})
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
                  placeholder="Custom amount"
                  placeholderTextColor="#8B99AA"
                  style={[styles.input, { color: theme.text, borderColor: theme.border }]}
                  value={manualAmount}
                />
                <Pressable onPress={handleSaveBottle} style={styles.primaryButton}>
                  <Text style={styles.primaryButtonText}>Save bottle feed</Text>
                </Pressable>
              </View>
            ) : (
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Nursing session</Text>
                <View style={styles.nursingGrid}>
                  <View style={[styles.sideCard, { borderColor: theme.border }]}>
                    <Text style={[styles.sideTitle, { color: theme.text }]}>Left breast</Text>
                    <Text style={styles.sideHint}>{activeNursingSession.leftMinutes} min saved</Text>
                    <Pressable
                      onPress={
                        activeNursingSession.leftStartedAt
                          ? () => stopNursing('left')
                          : () => startNursing('left')
                      }
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {activeNursingSession.leftStartedAt ? 'Stop left' : 'Start left'}
                      </Text>
                    </Pressable>
                  </View>
                  <View style={[styles.sideCard, { borderColor: theme.border }]}>
                    <Text style={[styles.sideTitle, { color: theme.text }]}>Right breast</Text>
                    <Text style={styles.sideHint}>{activeNursingSession.rightMinutes} min saved</Text>
                    <Pressable
                      onPress={
                        activeNursingSession.rightStartedAt
                          ? () => stopNursing('right')
                          : () => startNursing('right')
                      }
                      style={styles.primaryButton}
                    >
                      <Text style={styles.primaryButtonText}>
                        {activeNursingSession.rightStartedAt ? 'Stop right' : 'Start right'}
                      </Text>
                    </Pressable>
                  </View>
                </View>
                <Pressable onPress={handleFinishNursing} style={styles.secondaryButton}>
                  <Text style={styles.secondaryButtonText}>Finish nursing session</Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>
      </Modal>

      <View style={[styles.statusCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.statusTitle, { color: theme.text }]}>Latest feed notes</Text>
        {feedEntries.length > 0 ? (
          feedEntries.slice(0, 4).map((entry) => (
            <Text key={entry.id} style={styles.logText}>
              {entry.kind === 'bottle'
                ? `${formatTimestamp(entry.timestamp)} | bottle ${entry.amount} ${entry.unit}`
                : `${formatTimestamp(entry.timestamp)} | nursing ${entry.totalMinutes} min total (${entry.leftMinutes}/${entry.rightMinutes})`}
            </Text>
          ))
        ) : (
          <Text style={styles.logText}>No feed note recorded yet.</Text>
        )}
      </View>
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
    fontSize: 18,
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
  statusCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 8,
  },
  logText: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
});
