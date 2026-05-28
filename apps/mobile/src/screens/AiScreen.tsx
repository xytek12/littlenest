import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AiSuggestionCard } from '../components/AiSuggestionCard';
import { StorybookCard } from '../components/StorybookCard';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { GenderedBackground } from '../components/GenderedBackground';
import { Screen } from '../components/Screen';
import { WatercolorHeader } from '../components/WatercolorHeader';
import { getPalette } from '../theme';
import { requestAiGuidance } from '../ai/client';
import {
  compactAiText,
  formatAiRequestError,
  formatSourceTitle,
  normalizeProviderAnswer,
} from '../ai/format';
import type { ProviderAnswer } from '../ai/types';
import { getDictionary, isRtlLanguage } from '../i18n';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';
import { getAgeInMonths } from '../utils/age';

export function AiScreen() {
  const theme = useAppTheme();
  const { activeChild, family, logs } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.ai;
  const story = dictionary.storybook;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
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
    <GenderedBackground>
    <Screen testID="screen-ai" scroll>
      <WatercolorHeader
        title={story.ai}
        subtitle={labels.subtitle}
        accent={palette.primary}
        accentSoft={palette.primarySoft}
      />
      <Text style={[styles.subtitle, rtlText, { color: theme.mutedText }]} accessibilityElementsHidden>{labels.title}</Text>

      <StorybookCard
        kicker={story.kickers.ai}
        title={labels.compareTitle}
        subtitle={loading ? labels.checking : labels.compareSubtitle}
        primaryAction={{
          label: story.actions.runComparison,
          accessibilityLabel: labels.compareTitle,
          disabled: loading,
          onPress: handleCompare,
        }}
      >
        <Text style={[styles.actionHint, rtlText, { color: theme.mutedText }]}>
          {labels.currentPrompt(activeChild.displayName)}
        </Text>
      </StorybookCard>

      {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

      {recommended ? (
        <AiSuggestionCard
          title={recommended.title}
          explanation={compactAiText(recommended.body, 190)}
          confidence={recommended.confidenceLabel}
          accent={colors.berry}
        />
      ) : (
        <StorybookCard
          kicker={story.kickers.ai}
          title={labels.sleepPrediction}
          subtitle={labels.sleepPredictionSubtitle}
        />
      )}

      {safetyNote ? <Text style={[styles.safety, rtlText, { color: theme.mutedText }]}>{dictionary.safety.doctor}</Text> : null}

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
              mutedText={theme.mutedText}
              confidenceLabel={labels.confidence}
              feedbackOptions={labels.feedback}
              rtlText={rtlText}
            />
          ))}
        </ScrollView>
      ) : null}
    </Screen>
    </GenderedBackground>
  );
}

function ProviderCard({
  answer,
  feedback,
  onFeedback,
  borderColor,
  surface,
  text,
  mutedText,
  confidenceLabel,
  feedbackOptions,
  rtlText,
}: {
  answer: ProviderAnswer;
  feedback?: string;
  onFeedback: (provider: ProviderAnswer['provider'], rating: string) => void;
  borderColor: string;
  surface: string;
  text: string;
  mutedText: string;
  confidenceLabel: string;
  feedbackOptions: string[];
  rtlText: object | null;
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
      <Text style={[styles.providerTitle, rtlText, { color: text }]}>{answer.title}</Text>
      <Text style={[styles.providerBody, rtlText, { color: mutedText }]}>{compactAiText(answer.body, 260)}</Text>
      <View style={styles.confidenceRow}>
        <Text style={[styles.confidenceLabel, rtlText, { color: mutedText }]}>{confidenceLabel}</Text>
        <ConfidenceBadge label={answer.confidenceLabel} />
      </View>

      {answer.sources.length > 0 ? (
        <View style={styles.sourcesBlock}>
          {answer.sources.slice(0, 3).map((source) => (
            <Text key={`${answer.provider}-${source.url}`} style={[styles.sourceText, { color: colors.blue }]}>
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
                { borderColor },
                selected ? styles.feedbackButtonSelected : null,
              ]}
            >
              <Text
                style={[
                  styles.feedbackLabel,
                  { color: mutedText },
                  selected ? styles.feedbackLabelSelected : null,
                ]}
              >
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
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
