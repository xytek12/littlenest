import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { GenderedBackground } from '../components/GenderedBackground';
import { RecipeIdeaCard } from '../components/RecipeIdeaCard';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import { getPalette, sectionAccents } from '../theme';
import {
  RecipeFetchLimitError,
  canFetchRecipes,
  searchRecipes,
  type StructuredRecipe,
} from '../ai/client';
import { getDailyRecipeIdeas } from '../data/recipeIdeas';
import { getDictionary, isRtlLanguage } from '../i18n';
import { hasSupabaseEnv } from '../services/supabase';
import { usePrototypeState } from '../state/PrototypeState';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeInMonths, getAgeLabel } from '../utils/age';

// Baby food bowl — used only when a recipe has no derived imageUrl.
const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=1200&q=80';

type DisplayRecipe = {
  id: string;
  title: string;
  summary: string;
  tag: string;
  imageUrl: string;
  url: string;
};

function aiRecipesToDisplay(recipes: StructuredRecipe[]): DisplayRecipe[] {
  return recipes.map((recipe, index) => ({
    id: `ai-${index}-${recipe.url}`,
    title: recipe.title,
    summary: recipe.description,
    tag: recipe.category || recipe.ageRangeMonths || '',
    imageUrl: recipe.imageUrl && recipe.imageUrl.length > 0 ? recipe.imageUrl : FALLBACK_IMAGE,
    url: recipe.url,
  }));
}

function seedRecipesToDisplay(
  language: 'en' | 'he' | 'ru',
  childAgeMonths: number,
  query: string,
  refreshNonce: number,
): DisplayRecipe[] {
  return getDailyRecipeIdeas({
    language,
    childAgeMonths,
    query,
    refreshCount: refreshNonce,
    limit: 6,
  }).map((idea) => ({
    id: idea.id,
    title: idea.title,
    summary: idea.summary,
    tag: idea.tag,
    imageUrl: idea.imageUrl,
    url: idea.source.url,
  }));
}

export function FoodScreen() {
  const theme = useAppTheme();
  const { activeChild, family } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.recipes;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );

  // Sage accent from food section tokens
  const foodAccent = theme.isDark
    ? sectionAccents.food.dark.text
    : sectionAccents.food.light.ink;

  const [query, setQuery] = useState('');
  const [refreshNonce, setRefreshNonce] = useState(0);
  const months = getAgeInMonths(activeChild.dateOfBirth);

  const [recipes, setRecipes] = useState<DisplayRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [usedFallback, setUsedFallback] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [canRefresh, setCanRefresh] = useState(true);

  const seedRecipes = useMemo(
    () => seedRecipesToDisplay(family.language, months, query, refreshNonce),
    [family.language, months, query, refreshNonce],
  );

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    setUsedFallback(false);
    setLimitReached(false);

    if (!hasSupabaseEnv()) {
      setRecipes(seedRecipesToDisplay(family.language, months, query, refreshNonce));
      setUsedFallback(true);
      setLoading(false);
      return;
    }

    try {
      const result = await searchRecipes({
        childId: activeChild.id,
        language: family.language,
        childAgeMonths: months,
        refreshNonce,
        query,
      });
      setRecipes(aiRecipesToDisplay(result));
    } catch (error) {
      if (error instanceof RecipeFetchLimitError) {
        setLimitReached(true);
      }
      setRecipes(seedRecipesToDisplay(family.language, months, query, refreshNonce));
      setUsedFallback(true);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChild.id, family.language, months, query, refreshNonce]);

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  useEffect(() => {
    let active = true;

    if (!hasSupabaseEnv()) {
      setCanRefresh(true);
      return;
    }

    canFetchRecipes(activeChild.id)
      .then((value) => {
        if (active) {
          setCanRefresh(value);
        }
      })
      .catch(() => {
        if (active) {
          setCanRefresh(true);
        }
      });

    return () => {
      active = false;
    };
  }, [activeChild.id, refreshNonce, recipes]);

  const refreshDisabled = loading || (!canRefresh && hasSupabaseEnv());

  const handleRefresh = useCallback(() => {
    if (refreshDisabled) {
      return;
    }
    setRefreshNonce((current) => current + 1);
  }, [refreshDisabled]);

  const visibleRecipes = recipes.length > 0 ? recipes : seedRecipes;

  return (
    <GenderedBackground>
      <Screen testID="screen-recipes" scroll>
        <TwinPickerCards compact />

        {/* Food / Recipes section card — no "+" (browse only) */}
        <SectionCard
          sectionType="food"
          title={labels.title}
          iconEmoji="🥗"
          label={getAgeLabel(activeChild.dateOfBirth, new Date(), family.language)}
          value={labels.helper(activeChild.displayName, getAgeLabel(activeChild.dateOfBirth, new Date(), family.language))}
        />

        {/* Search card — rounded with sage accent border on focus */}
        <View style={[styles.searchCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={[styles.searchLabel, rtlText, { color: theme.text }]}>{labels.searchLabel}</Text>
          <TextInput
            onChangeText={setQuery}
            placeholder={labels.queryPlaceholder}
            placeholderTextColor={theme.mutedText}
            style={[styles.input, rtlText, { color: theme.text, borderColor: theme.border }]}
            value={query}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: refreshDisabled }}
            disabled={refreshDisabled}
            onPress={handleRefresh}
            style={[
              styles.button,
              { backgroundColor: foodAccent },
              refreshDisabled ? styles.buttonDisabled : null,
            ]}
          >
            <Text style={[styles.buttonText, { color: theme.isDark ? '#0F2A2C' : '#FFFFFF' }]}>
              {labels.refresh}
            </Text>
          </Pressable>
        </View>

        {limitReached ? (
          <Text style={[styles.noticeText, rtlText, { color: theme.mutedText }]} testID="recipes-limit">
            {labels.limitReached}
          </Text>
        ) : null}
        {usedFallback && !limitReached ? (
          <Text style={[styles.noticeText, rtlText, { color: theme.mutedText }]} testID="recipes-fallback">
            {hasSupabaseEnv() ? labels.error : labels.offlineNote}
          </Text>
        ) : null}

        <Text style={[styles.resultsHeader, rtlText, { color: theme.text }]}>{labels.resultsHeader}</Text>

        {loading ? (
          <View style={styles.loadingRow} testID="recipes-loading">
            <ActivityIndicator color={foodAccent} />
            <Text style={[styles.loadingText, rtlText, { color: theme.mutedText }]}>{labels.loading}</Text>
          </View>
        ) : visibleRecipes.length === 0 ? (
          <Text style={[styles.noticeText, rtlText, { color: theme.mutedText }]} testID="recipes-empty">
            {labels.empty}
          </Text>
        ) : (
          visibleRecipes.map((recipe) => (
            <RecipeIdeaCard
              key={recipe.id}
              childSex={activeChild.sex}
              imageUrl={recipe.imageUrl}
              summary={recipe.summary}
              tag={recipe.tag}
              title={recipe.title}
              ctaLabel={labels.openSource}
              dailyLabel={labels.dailyLabel}
              onPress={() => Linking.openURL(recipe.url)}
            />
          ))
        )}
      </Screen>
    </GenderedBackground>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 13,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  noticeText: {
    lineHeight: 20,
    marginBottom: 12,
  },
  resultsHeader: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 10,
    marginTop: 8,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  loadingText: {
    lineHeight: 20,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
