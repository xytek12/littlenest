import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState, type ConfigureFamilyInput } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';
import type { ChildSex, FamilyMode, TwinType } from '../types/domain';

const currentYear = new Date().getFullYear();

function parseDateParts(value: string) {
  const [year = '2025', month = '09', day = '22'] = value.split('-');
  return { day, month, year };
}

function padDatePart(value: string, width = 2) {
  return value.padStart(width, '0');
}

function clampNumber(value: string, min: number, max: number, fallback: number) {
  const parsed = Number.parseInt(value, 10);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(min, Math.min(max, parsed));
}

function buildDate(day: string, month: string, year: string) {
  const safeYear = clampNumber(year, 2023, currentYear, 2025);
  const safeMonth = clampNumber(month, 1, 12, 9);
  const safeDay = clampNumber(day, 1, 31, 22);

  return `${safeYear}-${padDatePart(String(safeMonth))}-${padDatePart(String(safeDay))}`;
}

const familyOptionIds = [
  'single',
  'twins-boy-boy',
  'twins-girl-girl',
  'twins-boy-girl',
] as const;

type Props = {
  embeddedInTabs?: boolean;
  onComplete?: () => void;
};

export function FamilySetupScreen({ embeddedInTabs = false, onComplete }: Props) {
  const theme = useAppTheme();
  const { configureFamily, family } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.familySetup;
  const commonLabels = dictionary.common;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const firstChild = family.children[0];
  const secondChild = family.children[1];
  const initialDate = parseDateParts(firstChild?.dateOfBirth ?? '2025-09-22');
  const [selectedOption, setSelectedOption] = useState<(typeof familyOptionIds)[number]>(() => {
    if (family.mode !== 'twins') {
      return 'single';
    }

    if (family.twinType === 'boy_boy') {
      return 'twins-boy-boy';
    }

    if (family.twinType === 'girl_girl') {
      return 'twins-girl-girl';
    }

    return 'twins-boy-girl';
  });
  const [childName, setChildName] = useState(firstChild?.displayName ?? 'Maya');
  const [secondChildName, setSecondChildName] = useState(secondChild?.displayName ?? 'Noam');
  const [day, setDay] = useState(initialDate.day);
  const [month, setMonth] = useState(initialDate.month);
  const [year, setYear] = useState(initialDate.year);
  const [childSex, setChildSex] = useState<ChildSex>(firstChild?.sex ?? 'girl');

  const selectedFamilyOption = useMemo(() => {
    switch (selectedOption) {
      case 'single':
        return {
          title: labels.singleTitle,
          subtitle: labels.singleSubtitle,
          accent: colors.blue,
        };
      case 'twins-boy-boy':
        return {
          title: labels.twinBoysTitle,
          subtitle: labels.twinBoysSubtitle,
          accent: colors.blue,
        };
      case 'twins-girl-girl':
        return {
          title: labels.twinGirlsTitle,
          subtitle: labels.twinGirlsSubtitle,
          accent: colors.pink,
        };
      case 'twins-boy-girl':
      default:
        return {
          title: labels.twinBoyGirlTitle,
          subtitle: labels.twinBoyGirlSubtitle,
          accent: colors.berry,
        };
    }
  }, [labels, selectedOption]);

  const isTwins = selectedOption !== 'single';
  const singleAccent = getAccentTheme({ mode: 'single', sex: childSex });

  function getFamilyInput(): ConfigureFamilyInput {
    let mode: FamilyMode = 'single';
    let twinType: TwinType | undefined;
    let firstSex = childSex;
    let secondSex: ChildSex | undefined;

    if (selectedOption === 'twins-boy-boy') {
      mode = 'twins';
      twinType = 'boy_boy';
      firstSex = 'boy';
      secondSex = 'boy';
    }

    if (selectedOption === 'twins-girl-girl') {
      mode = 'twins';
      twinType = 'girl_girl';
      firstSex = 'girl';
      secondSex = 'girl';
    }

    if (selectedOption === 'twins-boy-girl') {
      mode = 'twins';
      twinType = 'boy_girl';
      firstSex = 'boy';
      secondSex = 'girl';
    }

    return {
      mode,
      twinType,
      childName,
      childSex: firstSex,
      secondChildName: isTwins ? secondChildName : undefined,
      secondChildSex: secondSex,
      dateOfBirth: buildDate(day, month, year),
    };
  }

  function handleCompleteSetup() {
    configureFamily(getFamilyInput());

    onComplete?.();
  }

  return (
    <Screen testID="screen-family-setup" scroll>
      {embeddedInTabs ? (
        <FlowHeader title={labels.title} subtitle={labels.subtitle} />
      ) : (
        <>
          <Text style={[styles.title, rtlText, { color: theme.text }]}>{labels.title}</Text>
          <Text style={[styles.subtitle, rtlText, { color: theme.mutedText }]}>{labels.subtitle}</Text>
        </>
      )}

      {familyOptionIds.map((optionId) => {
        const option =
          optionId === 'single'
            ? { title: labels.singleTitle, subtitle: labels.singleSubtitle, accent: colors.blue }
            : optionId === 'twins-boy-boy'
              ? { title: labels.twinBoysTitle, subtitle: labels.twinBoysSubtitle, accent: colors.blue }
              : optionId === 'twins-girl-girl'
                ? { title: labels.twinGirlsTitle, subtitle: labels.twinGirlsSubtitle, accent: colors.pink }
                : {
                    title: labels.twinBoyGirlTitle,
                    subtitle: labels.twinBoyGirlSubtitle,
                    accent: colors.berry,
                  };

        return (
          <ActionCard
            key={optionId}
            title={option.title}
            subtitle={option.subtitle}
            accent={option.accent}
            onPress={() => setSelectedOption(optionId)}
          >
            {selectedOption === optionId ? (
              <Text style={[styles.selected, rtlText]}>{commonLabels.selected}</Text>
            ) : null}
          </ActionCard>
        );
      })}

      <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.summaryTitle, rtlText, { color: theme.text }]}>{labels.childDetails}</Text>
        <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>{labels.childName}</Text>
        <TextInput
          onChangeText={setChildName}
          placeholder={labels.childName}
          placeholderTextColor={theme.mutedText}
          style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
          value={childName}
        />

        {selectedOption === 'single' ? (
          <View style={styles.segmentRow}>
            {(['girl', 'boy'] as const).map((sex) => {
              const selected = childSex === sex;
              return (
                <Pressable
                  key={sex}
                  onPress={() => setChildSex(sex)}
                  style={[
                    styles.segment,
                    {
                      borderColor: selected ? singleAccent.primary : theme.border,
                      backgroundColor: selected ? singleAccent.softPrimary : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.segmentText, { color: selected ? singleAccent.primary : theme.text }]}>
                    {sex === 'girl' ? labels.girl : labels.boy}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        {isTwins ? (
          <>
            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>{labels.secondChildName}</Text>
            <TextInput
              onChangeText={setSecondChildName}
              placeholder={labels.secondChildName}
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
              value={secondChildName}
            />
          </>
        ) : null}

        <View style={styles.dateRow}>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>{commonLabels.day}</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setDay}
              placeholder="22"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
              value={day}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>{commonLabels.month}</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setMonth}
              placeholder="09"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
              value={month}
            />
          </View>
          <View style={styles.dateField}>
            <Text style={[styles.fieldLabel, rtlText, { color: theme.text }]}>{commonLabels.year}</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setYear}
              placeholder="2025"
              placeholderTextColor={theme.mutedText}
              style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
              value={year}
            />
          </View>
        </View>

        <Pressable
          onPress={handleCompleteSetup}
          style={[
            styles.continueButton,
            {
              backgroundColor:
                selectedOption === 'single' ? singleAccent.primary : selectedFamilyOption.accent,
            },
          ]}
        >
          <Text style={styles.continueText}>{labels.startTesting}</Text>
        </Pressable>
      </View>

      <View style={[styles.summaryCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.summaryTitle, rtlText, { color: theme.text }]}>{labels.prototypeNote}</Text>
        <Text style={[styles.summaryText, rtlText, { color: theme.mutedText }]}>{labels.prototypeNoteText}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: '#6B7D91',
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  selected: {
    color: colors.berry,
    fontWeight: '700',
    marginTop: 10,
  },
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    gap: 10,
    marginBottom: 10,
    marginTop: 2,
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  input: {
    borderRadius: 14,
    borderWidth: 1,
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segment: {
    alignItems: 'center',
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 12,
  },
  segmentText: {
    fontWeight: '900',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 10,
  },
  dateField: {
    flex: 1,
    gap: 6,
  },
  continueButton: {
    alignItems: 'center',
    borderRadius: 14,
    marginTop: 2,
    paddingVertical: 14,
  },
  continueText: {
    color: '#072235',
    fontSize: 16,
    fontWeight: '900',
  },
  summaryCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginTop: 8,
    padding: 16,
  },
  summaryText: {
    color: '#6B7D91',
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
});
