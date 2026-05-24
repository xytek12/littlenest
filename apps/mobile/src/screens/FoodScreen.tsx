import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { searchRecipes } from '../ai/client';
import { formatRecipeSearchError, normalizeProviderAnswer } from '../ai/format';
import { RecipeIdeaCard } from '../components/RecipeIdeaCard';
import { Screen } from '../components/Screen';
import { getDailyRecipeIdeas } from '../data/recipeIdeas';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeInMonths } from '../utils/age';

function summarizeRecipeBody(body: string) {
  const firstLine = body.split('\n').find((line) => line.trim().length > 0) ?? body;
  return firstLine.length > 110 ? `${firstLine.slice(0, 107)}...` : firstLine;
}

export function FoodScreen() {
  const theme = useAppTheme();
  const { activeChild, family } = usePrototypeState();
  const labels = getDictionary(family.language).recipes;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const [query, setQuery] = useState(labels.queryPlaceholder);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<
    Awaited<ReturnType<typeof searchRecipes>>
  >([]);
  const dailyIdeas = useMemo(() => getDailyRecipeIdeas(new Date()), []);
  const months = getAgeInMonths(activeChild.dateOfBirth);
  const liveResultsWithSources = liveResults.filter((result) => result.sources[0]);

  async function handleSearch() {
    setErrorMessage(null);
    setLoading(true);

    try {
      const nextResults = await searchRecipes({
        language: family.language,
        childAgeMonths: months,
        query,
      });
      setLiveResults(nextResults.map(normalizeProviderAnswer));
    } catch (error) {
      setErrorMessage(formatRecipeSearchError(error));
    } finally {
      setLoading(false);
    }
  }

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
        <Pressable onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>{loading ? labels.searching : labels.refresh}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <Text style={[styles.helperText, rtlText]}>
        {labels.helper(activeChild.displayName, months)}
      </Text>

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

      {liveResultsWithSources.length > 0 ? (
        <>
          <Text style={[styles.resultsHeader, rtlText, { color: theme.text }]}>{labels.resultsHeader}</Text>
          {liveResultsWithSources.map((result, index) => {
            const fallbackImage = dailyIdeas[index % dailyIdeas.length]?.imageUrl ?? dailyIdeas[0].imageUrl;
            const primarySource = result.sources[0]!;

            return (
              <RecipeIdeaCard
                key={`${result.provider}-${result.title}`}
                imageUrl={fallbackImage}
                summary={summarizeRecipeBody(result.body)}
                tag={result.confidenceLabel}
                title={result.title}
                ctaLabel={labels.openSource}
                dailyLabel={labels.dailyLabel}
                onPress={() => Linking.openURL(primarySource.url)}
              />
            );
          })}
        </>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: {
    color: '#6B7D91',
    marginTop: 8,
    marginBottom: 16,
    lineHeight: 20,
  },
  searchCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  searchLabel: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: colors.warning,
    borderRadius: 16,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 12,
  },
  buttonText: {
    color: '#4F3B0A',
    fontWeight: '800',
    fontSize: 15,
  },
  error: {
    color: colors.berry,
    fontWeight: '700',
    marginTop: 12,
  },
  helperText: {
    color: '#6B7D91',
    marginBottom: 12,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
    marginBottom: 10,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
