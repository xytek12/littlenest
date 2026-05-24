import { useMemo, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { searchRecipes } from '../ai/client';
import { normalizeProviderAnswer } from '../ai/format';
import { RecipeIdeaCard } from '../components/RecipeIdeaCard';
import { Screen } from '../components/Screen';
import { getDailyRecipeIdeas } from '../data/recipeIdeas';
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
  const [query, setQuery] = useState('first tastes and recipes');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [liveResults, setLiveResults] = useState<
    Awaited<ReturnType<typeof searchRecipes>>
  >([]);
  const dailyIdeas = useMemo(() => getDailyRecipeIdeas(new Date()), []);
  const months = getAgeInMonths(activeChild.dateOfBirth);

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
      setErrorMessage(error instanceof Error ? error.message : 'Recipe search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen testID="screen-recipes" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Recipe ideas</Text>
      <Text style={styles.subtitle}>
        AI summarizes, then the parent taps straight into the source website. Daily ideas refresh automatically.
      </Text>

      <View style={[styles.searchCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[styles.searchLabel, { color: theme.text }]}>Search trusted sources first</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder="first tastes and recipes"
          placeholderTextColor="#8B99AA"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          value={query}
        />
        <Pressable onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>{loading ? 'Searching...' : 'Refresh recipe ideas'}</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      <Text style={styles.helperText}>
        Ideas for {activeChild.displayName}, {months} months old.
      </Text>

      {dailyIdeas.map((idea) => (
        <RecipeIdeaCard
          key={idea.id}
          imageUrl={idea.imageUrl}
          summary={idea.summary}
          tag={idea.tag}
          title={idea.title}
          onPress={() => Linking.openURL(idea.source.url)}
        />
      ))}

      {liveResults.length > 0 ? (
        <>
          <Text style={[styles.resultsHeader, { color: theme.text }]}>Fresh AI recipe finds</Text>
          {liveResults.map((result, index) => {
            const fallbackImage = dailyIdeas[index % dailyIdeas.length]?.imageUrl ?? dailyIdeas[0].imageUrl;
            const primarySource = result.sources[0];

            return (
              <RecipeIdeaCard
                key={`${result.provider}-${result.title}`}
                imageUrl={fallbackImage}
                summary={summarizeRecipeBody(result.body)}
                tag={result.confidenceLabel}
                title={result.title}
                onPress={() => Linking.openURL(primarySource?.url ?? 'https://www.google.com')}
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
});
