import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { usePrototypeState, type ConfigureFamilyInput } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import type { ChildSex, FamilyMode, TwinType } from '../types/domain';

const familyOptions = [
  {
    id: 'single',
    title: 'One baby',
    subtitle: 'Choose boy or girl, then test the matching soft color.',
    accent: colors.blue,
  },
  {
    id: 'twins-boy-boy',
    title: 'Twin boys',
    subtitle: 'Both children use light blue accents.',
    accent: colors.blue,
  },
  {
    id: 'twins-girl-girl',
    title: 'Twin girls',
    subtitle: 'Both children use light pink accents.',
    accent: colors.pink,
  },
  {
    id: 'twins-boy-girl',
    title: 'Twins, boy + girl',
    subtitle: 'Split the interface between light blue and light pink.',
    accent: colors.berry,
  },
] as const;

export function FamilySetupScreen() {
  const theme = useAppTheme();
  const { configureFamily } = usePrototypeState();
  const [selectedOption, setSelectedOption] = useState<string>('single');
  const [childName, setChildName] = useState('Maya');
  const [secondChildName, setSecondChildName] = useState('Noam');
  const [dateOfBirth, setDateOfBirth] = useState('2025-09-22');
  const [childSex, setChildSex] = useState<ChildSex>('girl');

  const selectedFamily = familyOptions.find((option) => option.id === selectedOption);
  const isTwins = selectedOption !== 'single';

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
      dateOfBirth,
    };
  }

  return (
    <Screen testID="screen-family-setup" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Family setup</Text>
      <Text style={styles.subtitle}>
        Set the child profile first so sleep, food, feed, and AI screens use your test child.
      </Text>

      {familyOptions.map((option) => {
        const selected = selectedOption === option.id;

        return (
          <ActionCard
            key={option.id}
            title={option.title}
            subtitle={option.subtitle}
            accent={option.accent}
            onPress={() => setSelectedOption(option.id)}
          >
            {selected ? <Text style={styles.selected}>Selected for this prototype</Text> : null}
          </ActionCard>
        );
      })}

      <View style={[styles.formCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.summaryTitle, { color: theme.text }]}>Child details</Text>
        <TextInput
          onChangeText={setChildName}
          placeholder="Child name"
          placeholderTextColor="#8B99AA"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
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
                      borderColor: selected ? colors.blue : theme.border,
                      backgroundColor: selected ? colors.blueSoft : 'transparent',
                    },
                  ]}
                >
                  <Text style={[styles.segmentText, { color: selected ? '#284D71' : theme.text }]}>
                    {sex === 'girl' ? 'Girl' : 'Boy'}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        ) : null}
        {isTwins ? (
          <TextInput
            onChangeText={setSecondChildName}
            placeholder="Second child name"
            placeholderTextColor="#8B99AA"
            style={[styles.input, { color: theme.text, borderColor: theme.border }]}
            value={secondChildName}
          />
        ) : null}
        <TextInput
          onChangeText={setDateOfBirth}
          placeholder="YYYY-MM-DD"
          placeholderTextColor="#8B99AA"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          value={dateOfBirth}
        />
        <Pressable
          onPress={() => configureFamily(getFamilyInput())}
          style={[styles.continueButton, { backgroundColor: selectedFamily?.accent ?? colors.blue }]}
        >
          <Text style={styles.continueText}>Start testing LittleNest</Text>
        </Pressable>
      </View>

      <View
        style={[
          styles.summaryCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.summaryTitle, { color: theme.text }]}>Prototype note</Text>
        <Text style={styles.summaryText}>
          This first build stays admin-only. Your setup is saved on this phone for prototype
          testing.
        </Text>
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
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  selected: {
    color: colors.berry,
    fontWeight: '700',
    marginTop: 10,
  },
  formCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 2,
    marginBottom: 10,
    gap: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    fontWeight: '700',
  },
  segmentRow: {
    flexDirection: 'row',
    gap: 10,
  },
  segment: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  segmentText: {
    fontWeight: '900',
  },
  continueButton: {
    borderRadius: 14,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 2,
  },
  continueText: {
    color: '#072235',
    fontWeight: '900',
    fontSize: 16,
  },
  summaryCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginTop: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  summaryText: {
    color: '#6B7D91',
    lineHeight: 20,
  },
});
