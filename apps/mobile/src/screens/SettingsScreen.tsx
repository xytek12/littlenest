import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

export function SettingsScreen() {
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const theme = useAppTheme();
  const { family, settings, updateFeedUnit, updateLanguage } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.settings;
  const story = dictionary.storybook;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;

  return (
    <Screen testID="screen-settings" scroll>
      <FlowHeader
        title={labels.title}
        subtitle={labels.subtitle}
        storybookTitle={story.settings}
      />

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>{labels.feedUnit}</Text>
        <View style={styles.segmentRow}>
          {(['mL', 'oz'] as const).map((unit) => {
            const selected = settings.feedUnit === unit;
            return (
              <Pressable
                key={unit}
                onPress={() => updateFeedUnit(unit)}
                style={[
                  styles.segment,
                  {
                    borderColor: selected ? colors.blue : theme.border,
                    backgroundColor: selected ? colors.blueSoft : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.segmentText, { color: selected ? '#284D71' : theme.text }]}>
                  {unit}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>{labels.language}</Text>
        <View style={styles.segmentRow}>
          {(['en', 'he', 'ru'] as const).map((language) => {
            const selected = family.language === language;
            return (
              <Pressable
                key={language}
                onPress={() => updateLanguage(language)}
                style={[
                  styles.segment,
                  {
                    borderColor: selected ? colors.pink : theme.border,
                    backgroundColor: selected ? colors.pinkSoft : 'transparent',
                  },
                ]}
              >
                <Text style={[styles.segmentText, { color: selected ? '#8A2C56' : theme.text }]}>
                  {language.toUpperCase()}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Pressable
        onPress={() => navigation.navigate('FamilySetupFlow')}
        style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      >
        <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>{labels.familySetup}</Text>
        <Text style={[styles.rowText, rtlText]}>{labels.familySetupText}</Text>
      </Pressable>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>{labels.subscription}</Text>
        <Text style={[styles.rowText, rtlText]}>{labels.subscriptionText}</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 18, padding: 16, marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '900', marginBottom: 10 },
  segmentRow: { flexDirection: 'row', gap: 10 },
  segment: { flex: 1, borderWidth: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  segmentText: { fontWeight: '900' },
  rowText: { color: '#6B7D91', lineHeight: 20 },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
