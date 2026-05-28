import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AiSuggestionCard } from '../components/AiSuggestionCard';
import { ConfidenceBadge } from '../components/ConfidenceBadge';
import { GenderedBackground } from '../components/GenderedBackground';
import { Screen } from '../components/Screen';
import { WatercolorHeader } from '../components/WatercolorHeader';
import { getChildAccent, getPalette } from '../theme';
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

type Topic = 'sleep' | 'feed' | 'general';

export function AiScreen() {
  const theme = useAppTheme();
  const { activeChild, family, logs } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.ai;
  const story = dictionary.storybook;
  const isRtl = isRtlLanguage(family.language);
  const rtlText = isRtl ? styles.rtlText : null;
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );
  const activeIndex = family.children.findIndex((c) => c.id === activeChild.id);
  const activeAccent = getChildAccent(activeChild, Math.max(0, activeIndex), palette);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [safetyNote, setSafetyNote] = useState<string | null>(null);
  const [recommended, setRecommended] = useState<ProviderAnswer | null>(null);
  const [comparison, setComparison] = useState<ProviderAnswer[]>([]);
  const [feedbackByProvider, setFeedbackByProvider] = useState<Record<string, string>>({});
  const [selectedTopic, setSelectedTopic] = useState<Topic>('sleep');

  const childAgeMonths = useMemo(
    () => getAgeInMonths(activeChild.dateOfBirth),
    [activeChild.dateOfBirth],
  );

  const topics: { key: Topic; label: string }[] = [
    { key: 'sleep', label: labels.topicSleep },
    { key: 'feed', label: labels.topicFeed },
    { key: 'general', label: labels.topicGeneral },
  ];

  async function handleAsk() {
    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await requestAiGuidance({
        language: family.language,
        promptType: 'sleep',
        childAgeMonths,
        childProfile: activeChild,
        recentLogs: logs.slice(0, 6),
        userQuestion: `Which provider gives the best next suggestion for ${activeChild.displayName}'s ${selectedTopic === 'sleep' ? 'sleep or hunger timing' : selectedTopic === 'feed' ? 'feeding schedule' : 'overall routine'}?`,
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

        {/* ── Ask AI hero card ── */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: theme.surface, borderColor: activeAccent.primary },
          ]}
        >
          <Text style={styles.heroEmoji}>✨</Text>
          <Text style={[styles.heroTitle, rtlText, { color: theme.text }]}>
            {labels.heroTitle}
          </Text>
          <Text style={[styles.heroSubtitle, rtlText, { color: theme.mutedText }]}>
            {labels.heroSubtitle(activeChild.displayName)}
          </Text>

          {/* Topic chips */}
          <View style={[styles.topicRow, isRtl ? styles.topicRowRtl : null]}>
            {topics.map((topic) => {
              const active = selectedTopic === topic.key;
              return (
                <Pressable
                  key={topic.key}
                  onPress={() => setSelectedTopic(topic.key)}
                  style={[
                    styles.topicChip,
                    {
                      borderColor: active ? activeAccent.primary : theme.border,
                      backgroundColor: active ? activeAccent.primarySoft : 'transparent',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.topicChipText,
                      { color: active ? activeAccent.primaryDeep : theme.mutedText },
                    ]}
                  >
                    {topic.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Ask button */}
          <Pressable
            onPress={handleAsk}
            disabled={loading}
            accessibilityLabel={labels.compareTitle}
            style={[
              styles.askButton,
              { backgroundColor: activeAccent.primary },
              loading ? styles.askButtonLoading : null,
            ]}
          >
            <Text style={[styles.askButtonText, { color: activeAccent.primaryDeep }]}>
              {loading ? labels.loadingBtn : labels.askButton}
            </Text>
          </Pressable>
        </View>

        {/* Error */}
        {errorMessage ? (
          <View style={[styles.errorCard, { borderColor: colors.berry }]}>
            <Text style={[styles.errorText, { color: colors.berry }]}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* ── Result area ── */}
        {recommended ? (
          <>
            <Text style={[styles.sectionLabel, rtlText, { color: theme.mutedText }]}>
              {labels.recommendedLabel}
            </Text>
            <AiSuggestionCard
              title={recommended.title}
              explanation={compactAiText(recommended.body, 220)}
              confidence={recommended.confidenceLabel}
              accent={activeAccent.primary}
            />

            {safetyNote ? (
              <Text style={[styles.safety, rtlText, { color: theme.mutedText }]}>
                {dictionary.safety.doctor}
              </Text>
            ) : null}

            {comparison.length > 0 ? (
              <>
                <Text style={[styles.sectionLabel, rtlText, { color: theme.mutedText }]}>
                  {labels.compareLabel}
                </Text>
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
                      theme={theme}
                      confidenceLabel={labels.confidence}
                      feedbackOptions={labels.feedback}
                      rtlText={rtlText}
                    />
                  ))}
                </ScrollView>
              </>
            ) : null}
          </>
        ) : (
          /* Empty / pre-ask state */
          !errorMessage ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={styles.emptyEmoji}>🌙</Text>
              <Text style={[styles.emptyText, rtlText, { color: theme.mutedText }]}>
                {labels.noResultYet}
              </Text>
            </View>
          ) : null
        )}
      </Screen>
    </GenderedBackground>
  );
}

/* ── Provider comparison card ─────────────────────────────────────── */

function ProviderCard({
  answer,
  feedback,
  onFeedback,
  theme,
  confidenceLabel,
  feedbackOptions,
  rtlText,
}: {
  answer: ProviderAnswer;
  feedback?: string;
  onFeedback: (provider: ProviderAnswer['provider'], rating: string) => void;
  theme: ReturnType<typeof import('../theme/useAppTheme').useAppTheme>;
  confidenceLabel: string;
  feedbackOptions: string[];
  rtlText: object | null;
}) {
  return (
    <View
      style={[
        styles.providerCard,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}
    >
      <Text style={[styles.providerBadge, { color: colors.berry }]}>
        {answer.provider.toUpperCase()}
      </Text>
      <Text style={[styles.providerTitle, rtlText, { color: theme.text }]}>{answer.title}</Text>
      <Text style={[styles.providerBody, rtlText, { color: theme.mutedText }]}>
        {compactAiText(answer.body, 260)}
      </Text>

      <View style={styles.confidenceRow}>
        <Text style={[styles.confidenceLabel, { color: theme.mutedText }]}>{confidenceLabel}</Text>
        <ConfidenceBadge label={answer.confidenceLabel} />
      </View>

      {answer.sources.length > 0 ? (
        <View style={styles.sourcesBlock}>
          {answer.sources.slice(0, 3).map((source) => (
            <Text
              key={`${answer.provider}-${source.url}`}
              style={[styles.sourceText, { color: colors.blue }]}
            >
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
                { borderColor: theme.border },
                selected
                  ? { backgroundColor: theme.isDark ? '#2A3F58' : '#DFF0FF', borderColor: colors.blue }
                  : null,
              ]}
            >
              <Text
                style={[
                  styles.feedbackLabel,
                  { color: selected ? colors.blue : theme.mutedText },
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
  // Hero "Ask AI" card
  heroCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    marginBottom: 16,
    padding: 20,
  },
  heroEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '900',
    lineHeight: 30,
  },
  heroSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    marginTop: 4,
    marginBottom: 16,
  },
  topicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  topicRowRtl: {
    flexDirection: 'row-reverse',
  },
  topicChip: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topicChipText: {
    fontSize: 14,
    fontWeight: '800',
  },
  askButton: {
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 16,
  },
  askButtonLoading: {
    opacity: 0.65,
  },
  askButtonText: {
    fontSize: 17,
    fontWeight: '900',
  },
  // Error
  errorCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    marginBottom: 12,
    padding: 14,
  },
  errorText: {
    fontWeight: '700',
    lineHeight: 20,
  },
  // Section labels (between result blocks)
  sectionLabel: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  // Safety note
  safety: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    marginTop: 4,
  },
  // Empty / pre-ask state
  emptyCard: {
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1,
    gap: 10,
    marginTop: 4,
    padding: 32,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    textAlign: 'center',
  },
  // Horizontal comparison row
  comparisonRow: {
    paddingBottom: 8,
    gap: 12,
  },
  // Provider cards
  providerCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    width: 290,
  },
  providerBadge: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  providerTitle: {
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
    marginTop: 8,
  },
  providerBody: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  confidenceRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  confidenceLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  sourcesBlock: {
    gap: 6,
    marginTop: 12,
  },
  sourceText: {
    fontSize: 13,
  },
  feedbackRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 14,
  },
  feedbackButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  feedbackLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
