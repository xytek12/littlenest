import { Ionicons } from '@expo/vector-icons';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { Screen } from '../components/Screen';
import { WatercolorHeader } from '../components/WatercolorHeader';
import { getDictionary, isRtlLanguage } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { usePrototypeState } from '../state/PrototypeState';
import { getChildAccent, getPalette, paletteBase, typography } from '../theme';
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
    selectChild,
    sleepSessions,
  } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.home;
  const story = dictionary.storybook;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const isTwins = family.mode === 'twins' && family.children.length >= 2;
  const palette = getPalette(
    isTwins
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const trackedDays = countTrackedDays(sleepSessions, feedEntries);
  const learningReady = trackedDays >= 14;

  const storybookTitle = isTwins
    ? story.homeTwins(family.children[0].displayName, family.children[1].displayName)
    : story.homeSingle(activeChild.displayName);

  return (
    <Screen testID="screen-home" scroll>
      <WatercolorHeader
        title={storybookTitle}
        subtitle={isTwins ? undefined : getAgeLabel(activeChild.dateOfBirth, new Date(), family.language)}
        accent={palette.primary}
        accentSoft={palette.primarySoft}
        trailing={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={labels.openSettings}
            onPress={() => navigation.navigate('Settings')}
            style={[styles.settingsButton, { borderColor: paletteBase.stickerCharcoal, backgroundColor: theme.surface }]}
          >
            <Ionicons name="settings-outline" size={18} color={paletteBase.stickerCharcoal} />
          </Pressable>
        }
      />

      <View
        style={[
          styles.learningCard,
          { borderColor: palette.primary, backgroundColor: theme.surface },
        ]}
      >
        <Text style={[styles.learningKicker, { color: palette.primaryDeep }]}>
          {learningReady ? labels.suggestionKicker : labels.learningKicker}
        </Text>
        <Text style={[styles.learningTitle, rtlText, { color: theme.text }]}>
          {learningReady ? labels.suggestionTitle : labels.learningTitle}
        </Text>
        <Text style={[styles.learningBody, rtlText, { color: theme.mutedText }]}>
          {learningReady
            ? labels.suggestionBody(activeChild.displayName)
            : labels.learningBody(trackedDays)}
        </Text>
      </View>

      {isTwins ? (
        <View style={styles.twinRow}>
          {family.children.map((child, index) => {
            const accent = getChildAccent(child, index, palette);
            return (
              <Pressable
                key={child.id}
                accessibilityRole="button"
                onPress={() => selectChild(child.id)}
                style={[
                  styles.twinCard,
                  {
                    backgroundColor: theme.surface,
                    borderColor: accent.primary,
                  },
                ]}
              >
                <Text style={[styles.twinName, { color: accent.primaryDeep }]}>
                  {child.displayName}
                </Text>
                <Text style={[styles.twinAge, { color: theme.mutedText }]}>
                  {getAgeLabel(child.dateOfBirth, new Date(), family.language)}
                </Text>
                <View style={styles.twinQuickList}>
                  <Text style={[styles.twinQuickRow, { color: theme.text }]}>
                    🛏️ {labels.sleepTitle}
                  </Text>
                  <Text style={[styles.twinQuickRow, { color: theme.text }]}>
                    🍼 {labels.feedTitle}
                  </Text>
                  <Text style={[styles.twinQuickRow, { color: theme.text }]}>
                    📏 {dictionary.growth.title}
                  </Text>
                </View>
                <View
                  style={[
                    styles.twinChip,
                    { backgroundColor: accent.primarySoft, borderColor: accent.primary },
                  ]}
                >
                  <Text style={[styles.twinChipText, { color: accent.primaryDeep }]}>
                    {activeChild.id === child.id ? '★ Active' : 'Tap to focus'}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      <ActionCard
        title={labels.sleepTitle}
        subtitle={labels.sleepSubtitle}
        accent={palette.primary}
        onPress={() => navigation.navigate('SleepFlow')}
      />
      <ActionCard
        title={labels.feedTitle}
        subtitle={labels.feedSubtitle}
        accent={palette.secondary ?? paletteBase.sage}
        onPress={() => navigation.navigate('FeedFlow')}
      />
      <ActionCard
        title={labels.foodTastingTitle}
        subtitle={labels.foodTastingSubtitle}
        accent={palette.bridge ?? palette.primary}
        onPress={() => navigation.navigate('FoodTastingFlow')}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  settingsButton: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  learningCard: {
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 14,
    padding: 18,
  },
  learningKicker: {
    fontFamily: typography.bodyBlack,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  learningTitle: {
    fontFamily: typography.displayBold,
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: 8,
  },
  learningBody: {
    fontFamily: typography.body,
    lineHeight: 22,
    marginTop: 10,
  },
  twinRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  twinCard: {
    borderRadius: 22,
    borderWidth: 2,
    flex: 1,
    padding: 14,
  },
  twinName: {
    fontFamily: typography.displayBold,
    fontSize: 20,
    fontWeight: '900',
  },
  twinAge: {
    fontFamily: typography.body,
    fontSize: 12,
    marginTop: 2,
  },
  twinQuickList: {
    gap: 4,
    marginTop: 10,
  },
  twinQuickRow: {
    fontFamily: typography.body,
    fontSize: 13,
    lineHeight: 18,
  },
  twinChip: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  twinChipText: {
    fontFamily: typography.bodyBlack,
    fontSize: 11,
    fontWeight: '900',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
