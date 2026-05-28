/**
 * GrowthComposerSheet — single bottom-sheet popup that captures all three
 * growth measurements (weight, height, head circumference) at once. The
 * user can fill in just one field or all three; pressing "Save measurement"
 * commits one PrototypeGrowthEntry per field that has a value.
 *
 * Opened from the Growth SectionCard on the Home screen.
 */

import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { getDictionary, isRtlLanguage } from '../i18n';
import {
  usePrototypeState,
  type PrototypeGrowthKind,
  type PrototypeGrowthUnitSystem,
} from '../state/PrototypeState';
import { getPalette } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';

const metricUnits: Record<PrototypeGrowthKind, string> = {
  weight: 'kg',
  height: 'cm',
  head: 'cm',
};

const imperialUnits: Record<PrototypeGrowthKind, string> = {
  weight: 'lb',
  height: 'in',
  head: 'in',
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function GrowthComposerSheet({ visible, onClose }: Props) {
  const theme = useAppTheme();
  const { activeChild, family, saveGrowthEntry } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.growth;
  const commonLabels = dictionary.common;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );

  const [unitSystem, setUnitSystem] = useState<PrototypeGrowthUnitSystem>('metric');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [head, setHead] = useState('');

  // Reset drafts every time the sheet closes — measurements are
  // discrete one-shot entries (not a long-running session) so leftover
  // values would just confuse the next open.
  useEffect(() => {
    if (!visible) {
      setWeight('');
      setHeight('');
      setHead('');
    }
  }, [visible]);

  const units = unitSystem === 'metric' ? metricUnits : imperialUnits;

  function handleSave() {
    const fields: { kind: PrototypeGrowthKind; raw: string }[] = [
      { kind: 'weight', raw: weight },
      { kind: 'height', raw: height },
      { kind: 'head', raw: head },
    ];

    let savedAny = false;
    for (const { kind, raw } of fields) {
      const trimmed = raw.trim();
      if (!trimmed) continue;
      const parsed = Number.parseFloat(trimmed);
      if (!Number.isFinite(parsed)) continue;
      saveGrowthEntry({ kind, value: parsed, unit: units[kind], unitSystem });
      savedAny = true;
    }

    // Even if nothing was filled in, close the sheet so the user can dismiss.
    onClose();
    return savedAny;
  }

  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalOverlay}>
          <Pressable
            accessibilityLabel="Close growth composer"
            onPress={onClose}
            style={styles.modalBackdrop}
          />
          <View
            style={[
              styles.sheetCard,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
              <View style={styles.headerRow}>
                <Text style={[styles.sheetTitle, rtlText, { color: theme.text }]}>
                  {labels.title}
                </Text>
                <Pressable
                  accessibilityLabel="Close growth composer"
                  onPress={onClose}
                  style={[styles.closeButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.closeButtonText, { color: theme.text }]}>×</Text>
                </Pressable>
              </View>

              {/* Unit toggle */}
              <View style={[styles.segmentRow, { borderColor: theme.border }]}>
                {(['metric', 'imperial'] as const).map((nextSystem) => {
                  const selected = unitSystem === nextSystem;
                  return (
                    <Pressable
                      key={nextSystem}
                      onPress={() => setUnitSystem(nextSystem)}
                      style={[
                        styles.segment,
                        selected
                          ? { backgroundColor: palette.primarySoft, borderColor: palette.primary }
                          : { borderColor: theme.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.segmentText,
                          { color: selected ? palette.primaryDeep : theme.text },
                        ]}
                      >
                        {nextSystem === 'metric' ? labels.metric : labels.imperial}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Weight */}
              <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
                {labels.entryTitle(labels.weight, units.weight)}
              </Text>
              <TextInput
                accessibilityLabel={labels.weight}
                keyboardType="decimal-pad"
                onChangeText={setWeight}
                placeholder={labels.placeholder}
                placeholderTextColor={theme.mutedText}
                style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
                value={weight}
              />

              {/* Height */}
              <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
                {labels.entryTitle(labels.height, units.height)}
              </Text>
              <TextInput
                accessibilityLabel={labels.height}
                keyboardType="decimal-pad"
                onChangeText={setHeight}
                placeholder={labels.placeholder}
                placeholderTextColor={theme.mutedText}
                style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
                value={height}
              />

              {/* Head circumference */}
              <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>
                {labels.entryTitle(labels.head, units.head)}
              </Text>
              <TextInput
                accessibilityLabel={labels.head}
                keyboardType="decimal-pad"
                onChangeText={setHead}
                placeholder={labels.placeholder}
                placeholderTextColor={theme.mutedText}
                style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
                value={head}
              />

              {/* Footer actions */}
              <View style={styles.actionsRow}>
                <Pressable
                  onPress={onClose}
                  style={[styles.secondaryButton, { borderColor: theme.border }]}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.text }]}>
                    {commonLabels.cancel}
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityLabel={labels.save}
                  onPress={handleSave}
                  style={[styles.primaryButton, { backgroundColor: palette.primary }]}
                >
                  <Text style={[styles.primaryButtonText, { color: palette.primaryDeep }]}>
                    {labels.save}
                  </Text>
                </Pressable>
              </View>
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
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 32,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sheetTitle: {
    flex: 1,
    fontSize: 20,
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
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  segmentText: {
    fontSize: 15,
    fontWeight: '900',
  },
  fieldLabel: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 14,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButton: {
    alignItems: 'center',
    borderRadius: 14,
    flex: 1,
    paddingVertical: 14,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
