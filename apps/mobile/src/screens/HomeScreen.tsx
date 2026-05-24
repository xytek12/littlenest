import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeLabel } from '../utils/age';

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
    family,
    feedEntries,
    logs,
    sleepSessions,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.home;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const accent = getAccentTheme(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType ?? 'boy_girl' }
      : { mode: 'single', sex: activeChild.sex },
  );
  const trackedDays = countTrackedDays(sleepSessions, feedEntries);
  const learningReady = trackedDays >= 14;

  return (
    <Screen testID="screen-home" scroll>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.title, { color: theme.text }]}>{activeChild.displayName}</Text>
          <Text style={[styles.subtitle, rtlText]}>{getAgeLabel(activeChild.dateOfBirth)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={labels.openSettings}
          onPress={() => navigation.navigate('Settings')}
          style={[styles.settingsButton, { borderColor: theme.border, backgroundColor: theme.surface }]}
        >
          <Ionicons name="settings-outline" size={18} color={theme.text} />
        </Pressable>
      </View>

      <View
        style={[
          styles.learningCard,
          { borderColor: accent.primary, backgroundColor: theme.surface },
        ]}
      >
        <Text style={[styles.learningKicker, { color: accent.primary }]}>
          {learningReady ? labels.suggestionKicker : labels.learningKicker}
        </Text>
        <Text style={[styles.learningTitle, rtlText, { color: theme.text }]}>
          {learningReady ? labels.suggestionTitle : labels.learningTitle}
        </Text>
        <Text style={[styles.learningBody, rtlText]}>
          {learningReady
            ? labels.suggestionBody(activeChild.displayName)
            : labels.learningBody(trackedDays)}
        </Text>
      </View>

      <ActionCard
        title={labels.sleepTitle}
        subtitle={labels.sleepSubtitle}
        accent={accent.primary}
        onPress={() => navigation.navigate('SleepFlow')}
      />
      <ActionCard
        title={labels.feedTitle}
        subtitle={labels.feedSubtitle}
        accent={family.mode === 'single' && activeChild.sex === 'girl' ? colors.pink : colors.sage}
        onPress={() => navigation.navigate('FeedFlow')}
      />
      <ActionCard
        title={labels.foodTastingTitle}
        subtitle={labels.foodTastingSubtitle}
        accent={accent.secondary ?? accent.primary}
        onPress={() => navigation.navigate('FoodTastingFlow')}
      />
      <ActionCard
        title={labels.familySetupTitle}
        subtitle={family.mode === 'twins' ? labels.familySetupTwins : labels.familySetupSingle}
        accent={accent.secondary ?? accent.primary}
        onPress={() => navigation.navigate('Settings')}
      />

      {logs.slice(0, 3).map((log) => (
        <Text key={log.id} style={styles.logLine}>
          {log.title}: {log.note}
        </Text>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontSize: 32, fontWeight: '900' },
  subtitle: { color: '#6B7D91', marginTop: 2 },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  learningCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
  },
  learningKicker: {
    fontWeight: '900',
    fontSize: 15,
  },
  learningTitle: {
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: 8,
  },
  learningBody: {
    color: '#6B7D91',
    lineHeight: 22,
    marginTop: 10,
  },
  logLine: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
