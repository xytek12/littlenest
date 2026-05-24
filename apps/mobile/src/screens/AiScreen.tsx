import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ActionCard } from '../components/ActionCard';
import { AiSuggestionCard } from '../components/AiSuggestionCard';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { Screen } from '../components/Screen';
import { requestAiGuidance } from '../ai/client';
import {
  compactAiText,
  formatAiRequestError,
  formatSourceTitle,
  normalizeProviderAnswer,
} from '../ai/format';
import type { ProviderAnswer } from '../ai/types';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeInMonths } from '../utils/age';

const feedbackOptions = ['Good', 'Okay', 'Bad'] as const;

export function AiScreen() {
  const theme = useAppTheme();
  const { activeChild, family, logs } = usePrototypeState();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [safetyNote, setSafetyNote] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<ProviderAnswer | null>(null);
  const [comparison, setComparison] = useState<ProviderAnswer[]>([]);
  const [feedbackByProvider, setFeedbackByProvider] = useState<Record<string, string>>({});
  const childAgeMonths = useMemo(
    () => getAgeInMonths(activeChild.dateOfBirth),
    [activeChild.dateOfBirth],
  );

  async function handleCompare() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await requestAiGuidance({
        language: family.language,
        promptType: 'sleep',
        childAgeMonths,
        childProfile: activeChild,
        recentLogs: logs.slice(0, 6),
        userQuestion: `Which provider gives the best next suggestion for ${activeChild.displayName}'s sleep or hunger timing?`,
      });

      setRecommended(normalizeProviderAnswer(response.recommended));
      setComparison(response.comparison.map(normalizeProviderAnswer));
      setSafetyNote(response.safetyNote);
    } catch (error) {
      setErrorMessage(formatAiRequestError(error));
    } finally {
      setLoading(false);
    }
  }

  function handleFeedback(provider: ProviderAnswer['provider'], rating: string) {
    setFeedbackByProvider((current) => ({
      ...current,
      [provider]: rating,
    }));
  }

  return (
    <Screen testID="screen-ai" scroll>
      <Text style={[styles.title, { color: theme.text }]}>AI</Text>
      <Text style={styles.subtitle}>
        Admin mode compares provider answers side by side while the parent-facing app can still show
        one final recommendation.
      </Text>

      <ActionCard
        title="Compare Gemini + OpenAI"
        subtitle={loading ? 'Checking both providers...' : 'Run a live comparison for the latest prompt.'}
        accent={colors.blue}
        onPress={handleCompare}
      >
        <Text style={styles.actionHint}>
          Current test prompt: sleep window and likely next need for {activeChild.displayName}.
        </Text>
      </ActionCard>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {recommended ? (
        <AiSuggestionCard
          title={recommended.title}
          explanation={compactAiText(recommended.body, 190)}
          confidence={recommended.confidenceLabel}
          accent={colors.berry}
        />
      ) : (
        <ActionCard
          title="Sleep prediction"
          subtitle="Compare Gemini and OpenAI in admin mode."
          accent={colors.blue}
        />
      )}

      <ActionCard title="Recipe ideas" subtitle="Search with trusted sources first." accent={colors.pink} />

      {safetyNote ? <Text style={styles.safety}>{safetyNote}</Text> : null}

      {comparison.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.comparisonRow}
        >
          {comparison.map((answer) => (
            <ProviderCard
              key={answer.provider}
              answer={answer}
              feedback={feedbackByProvider[answer.provider]}
              onFeedback={handleFeedback}
              borderColor={theme.border}
              surface={theme.surface}
              text={theme.text}
            />
          ))}
        </ScrollView>
      ) : null}
    </Screen>
  );
}

function ProviderCard({
  answer,
  feedback,
  onFeedback,
  borderColor,
  surface,
  text,
}: {
  answer: ProviderAnswer;
  feedback?: string;
  onFeedback: (provider: ProviderAnswer['provider'], rating: string) => void;
  borderColor: string;
  surface: string;
  text: string;
}) {
  return (
    <View
      style={[
        styles.providerCard,
        {
          borderColor,
          backgroundColor: surface,
        },
      ]}
    >
      <Text style={styles.providerName}>{answer.provider.toUpperCase()}</Text>
      <Text style={[styles.providerTitle, { color: text }]}>{answer.title}</Text>
      <Text style={styles.providerBody}>{compactAiText(answer.body, 260)}</Text>
      <View style={styles.confidenceRow}>
        <Text style={styles.confidenceLabel}>Confidence</Text>
        <ConfidenceBadge label={answer.confidenceLabel} />
      </View>

      {answer.sources.length > 0 ? (
        <View style={styles.sourcesBlock}>
          {answer.sources.slice(0, 3).map((source) => (
            <Text key={`${answer.provider}-${source.url}`} style={styles.sourceText}>
              {source.title || formatSourceTitle(source.url)}
            </Text>
          ))}
        </View>
      ) : null}

      <View style={styles.feedbackRow}>
        {feedbackOptions.map((option) => {
          const selected = feedback === option;

          return (
            <Pressable
              key={`${answer.provider}-${option}`}
              onPress={() => onFeedback(answer.provider, option)}
              style={[
                styles.feedbackButton,
                selected ? styles.feedbackButtonSelected : null,
              ]}
            >
              <Text style={[styles.feedbackLabel, selected ? styles.feedbackLabelSelected : null]}>
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 28, fontWeight: '900' },
  subtitle: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 16,
  },
  actionHint: {
    color: '#6B7D91',
    marginTop: 10,
  },
  error: {
    color: colors.berry,
    fontWeight: '700',
    marginBottom: 12,
  },
  safety: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 12,
  },
  comparisonRow: {
    paddingBottom: 8,
    gap: 12,
  },
  providerCard: {
    width: 290,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  providerName: {
    color: colors.berry,
    fontSize: 12,
    fontWeight: '900',
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginTop: 8,
    color: '#17202B',
  },
  providerBody: {
    color: '#5B6B7C',
    marginTop: 8,
    lineHeight: 20,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  confidenceLabel: {
    color: '#5B6B7C',
    fontWeight: '700',
  },
  sourcesBlock: {
    marginTop: 12,
    gap: 6,
  },
  sourceText: {
    color: '#4D78A6',
    fontSize: 13,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  feedbackButton: {
    borderWidth: 1,
    borderColor: '#D6E2EF',
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  feedbackButtonSelected: {
    backgroundColor: colors.blueSoft,
    borderColor: colors.blue,
  },
  feedbackLabel: {
    color: '#4F6072',
    fontWeight: '700',
  },
  feedbackLabelSelected: {
    color: '#284D71',
  },
});
