import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { RecipeIdeaCard } from '../components/RecipeIdeaCard';
import { getDailyRecipeIdeas } from '../data/recipeIdeas';
import { getDictionary, isRtlLanguage } from '../i18n';
import { Screen } from '../components/Screen';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeInMonths } from '../utils/age';

export function FoodScreen() {
  const theme = useAppTheme();
  const { activeChild, family } = usePrototypeState();
  const labels = getDictionary(family.language).recipes;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const [query, setQuery] = useState('');
  const [refreshCount, setRefreshCount] = useState(0);
  const months = getAgeInMonths(activeChild.dateOfBirth);
  const dailyIdeas = useMemo(
    () =>
      getDailyRecipeIdeas({
        language: family.language,
        childAgeMonths: months,
        query,
        refreshCount,
      }),
    [family.language, months, query, refreshCount],
  );

  return (
    <Screen testID="screen-recipes" scroll>
      <Text style={[styles.title, rtlText, { color: theme.text }]}>{labels.title}</Text>
      <Text style={[styles.subtitle, rtlText]}>{labels.subtitle}</Text>

      <View style={[styles.searchCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.searchLabel, rtlText, { color: theme.text }]}>{labels.searchLabel}</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder={labels.queryPlaceholder}
          placeholderTextColor="#8B99AA"
          style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
          value={query}
        />
        <Pressable onPress={() => setRefreshCount((current) => current + 1)} style={styles.button}>
          <Text style={styles.buttonText}>{labels.refresh}</Text>
        </Pressable>
      </View>

      <Text style={[styles.helperText, rtlText]}>{labels.helper(activeChild.displayName, months)}</Text>
      <Text style={[styles.resultsHeader, rtlText, { color: theme.text }]}>{labels.resultsHeader}</Text>

      {dailyIdeas.map((idea) => (
        <RecipeIdeaCard
          key={idea.id}
          imageUrl={idea.imageUrl}
          summary={idea.summary}
          tag={idea.tag}
          title={idea.title}
          ctaLabel={labels.openSource}
          dailyLabel={labels.dailyLabel}
          onPress={() => Linking.openURL(idea.source.url)}
        />
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: {
    color: '#6B7D91',
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 8,
  },
  searchCard: {
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  input: {
    borderRadius: 16,
    borderWidth: 1,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    alignItems: 'center',
    backgroundColor: colors.warning,
    borderRadius: 16,
    marginTop: 12,
    paddingVertical: 13,
  },
  buttonText: {
    color: '#4F3B0A',
    fontSize: 15,
    fontWeight: '800',
  },
  helperText: {
    color: '#6B7D91',
    marginBottom: 12,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 8,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
