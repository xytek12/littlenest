import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { searchRecipes } from '../ai/client';
import { ActionCard } from '../components/ActionCard';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { Screen } from '../components/Screen';
import { mockChild, mockFamily, mockFood } from '../data/mockSeed';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeInMonths } from '../utils/age';

export function FoodScreen() {
  const theme = useAppTheme();
  const [query, setQuery] = useState('first tastes and recipes');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof searchRecipes>>
  >([]);

  async function handleSearch() {
    setErrorMessage(null);
    setLoading(true);

    try {
      const nextResults = await searchRecipes({
        language: mockFamily.language,
        childAgeMonths: getAgeInMonths(mockChild.dateOfBirth),
        query,
      });
      setResults(nextResults);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Recipe search failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen testID="screen-food" scroll>
      <Text style={[styles.title, { color: theme.text }]}>Food</Text>
      <Text style={styles.subtitle}>4-24 months</Text>
      <ActionCard
        title="Food tasting"
        subtitle="Mark 1/3, 2/3, or 3/3."
        accent={colors.pink}
      >
        <FoodTestProgress count={mockFood.testCount} accent={colors.pink} />
      </ActionCard>

      <View
        style={[
          styles.searchCard,
          {
            backgroundColor: theme.surface,
            borderColor: theme.border,
          },
        ]}
      >
        <Text style={[styles.searchLabel, { color: theme.text }]}>Recipe search</Text>
        <TextInput
          onChangeText={setQuery}
          placeholder="first tastes and recipes"
          placeholderTextColor="#8B99AA"
          style={[styles.input, { color: theme.text, borderColor: theme.border }]}
          value={query}
        />
        <Pressable onPress={handleSearch} style={styles.button}>
          <Text style={styles.buttonText}>
            {loading ? 'Searching...' : 'Search trusted recipe ideas'}
          </Text>
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
      </View>

      {results.map((result) => (
        <View
          key={`${result.provider}-${result.title}`}
          style={[
            styles.resultCard,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.resultHeader}>
            <Text style={[styles.resultTitle, { color: theme.text }]}>{result.title}</Text>
            <ConfidenceBadge label={result.confidenceLabel} />
          </View>
          <Text style={styles.resultBody}>{result.body}</Text>
          {result.sources.slice(0, 3).map((source) => (
            <Text key={source.url} style={styles.sourceText}>
              {source.title} - {source.url}
            </Text>
          ))}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: {
    color: '#6B7D91',
    marginTop: 6,
    marginBottom: 16,
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
  resultCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  resultTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '900',
  },
  resultBody: {
    color: '#5B6B7C',
    lineHeight: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  sourceText: {
    color: '#4D78A6',
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
});
