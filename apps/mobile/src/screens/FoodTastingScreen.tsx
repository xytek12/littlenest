import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { GenderedBackground } from '../components/GenderedBackground';
import { Screen } from '../components/Screen';
import { SectionCard } from '../components/SectionCard';
import { TwinPickerCards } from '../components/TwinPickerCards';
import {
  allergenReferenceItems,
  getLocalizedAllergenItem,
  getLocalizedAllergenSection,
  type AllergenReferenceItem,
} from '../data/allergenReference';
import { getDictionary, isRtlLanguage } from '../i18n';
import { fetchAllergenReferenceItems } from '../services/allergenRepository';
import { usePrototypeState } from '../state/PrototypeState';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';

export function FoodTastingScreen() {
  const theme = useAppTheme();
  const { activeChild, allergenExposures, family, markAllergenExposure } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.foodTasting;
  const tastings = dictionary.tastingsRedesign;
  const rtlText = isRtlLanguage(family.language) ? styles.rtlText : null;
  const [items, setItems] = useState<AllergenReferenceItem[]>(allergenReferenceItems);
  const accent = getAccentTheme(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType ?? 'boy_girl' }
      : { mode: 'single', sex: activeChild.sex },
  );

  useEffect(() => {
    let mounted = true;

    fetchAllergenReferenceItems()
      .then((nextItems) => {
        if (mounted) {
          setItems(nextItems);
        }
      })
      .catch(() => undefined);

    return () => {
      mounted = false;
    };
  }, []);

  const groupedSections = useMemo(
    () =>
      Array.from(
        items.reduce((map, item) => {
          const existing = map.get(item.section) ?? [];
          existing.push(item);
          map.set(item.section, existing);
          return map;
        }, new Map<string, AllergenReferenceItem[]>()),
      ),
    [items],
  );

  // Whisper card: use a high-contrast background in dark mode to avoid pink-on-pink
  const whisperBg = theme.isDark
    ? 'rgba(60, 180, 170, 0.18)'  // teal-tinted, clearly visible on jewel canvas
    : accent.softPrimary;
  const whisperBorderColor = theme.isDark
    ? 'rgba(60, 180, 170, 0.55)'
    : accent.primary;
  const whisperTextColor = theme.isDark ? '#ECF6D8' : theme.text;

  return (
    <GenderedBackground>
      <Screen testID="screen-food-tasting" scroll>
        <TwinPickerCards compact />

        {/* Whisper hint card — high-contrast in dark mode */}
        <View
          style={[
            styles.whisperCard,
            { backgroundColor: whisperBg, borderColor: whisperBorderColor },
          ]}
        >
          <Text style={[styles.whisperKicker, rtlText, { color: whisperBorderColor }]}>
            {dictionary.storybook.kickers.whisper.toUpperCase()}
          </Text>
          <Text style={[styles.whisperText, rtlText, { color: whisperTextColor }]}>
            {tastings.whisperHint(activeChild.displayName)}
          </Text>
        </View>

        {/* One SectionCard per allergen category — NO "+" button */}
        {groupedSections.map(([section, sectionItems]) => {
          const localizedSection = getLocalizedAllergenSection(
            family.language,
            section as AllergenReferenceItem['section'],
          );

          return (
            <SectionCard
              key={section}
              sectionType="food"
              title={localizedSection}
              compact
              // onPlusPress intentionally omitted — no "+" on this screen
            >
              {sectionItems.map((item) => {
                const count = allergenExposures[activeChild.id]?.[item.id] ?? item.testedCount;
                const isComplete = count >= 3;
                const statusLabel =
                  count === 0
                    ? labels.notStarted
                    : isComplete
                      ? labels.complete
                      : labels.progress(count);

                // Completed allergens use the child accent; in-progress use the section accent
                const pillAccent = isComplete
                  ? accent.primary
                  : accent.secondary ?? accent.primary;

                return (
                  <View key={item.id} style={styles.itemRow}>
                    <View style={[styles.itemText, rtlText ? styles.itemTextRtl : null]}>
                      <Text style={[styles.itemName, rtlText, { color: theme.text }]}>
                        {getLocalizedAllergenItem(family.language, item.id, item.name)}
                      </Text>
                      <Text style={[styles.itemStatus, rtlText, { color: theme.mutedText }]}>
                        {statusLabel}
                      </Text>
                    </View>
                    <FoodTestProgress
                      count={count}
                      accent={pillAccent}
                      itemName={item.name}
                      onSelect={(nextCount) => markAllergenExposure(item.id, nextCount)}
                    />
                  </View>
                );
              })}
            </SectionCard>
          );
        })}

        <Text style={[styles.footerNote, rtlText, { color: theme.mutedText }]}>
          {labels.footer}
        </Text>
      </Screen>
    </GenderedBackground>
  );
}

const styles = StyleSheet.create({
  whisperCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  whisperKicker: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.6,
    marginBottom: 6,
  },
  whisperText: {
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 21,
  },
  itemRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  itemText: {
    flex: 1,
  },
  itemTextRtl: {
    alignItems: 'flex-end',
  },
  itemName: {
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '800',
    lineHeight: 20,
  },
  itemStatus: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 2,
  },
  footerNote: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
