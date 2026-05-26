import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
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
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';

export function FoodTastingScreen() {
  const theme = useAppTheme();
  const { activeChild, allergenExposures, family, markAllergenExposure } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const labels = dictionary.foodTasting;
  const story = dictionary.storybook;
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

  return (
    <Screen testID="screen-food-tasting" scroll>
      <FlowHeader
        title={labels.title}
        subtitle={labels.subtitle(activeChild.displayName)}
        storybookTitle={story.foodTasting}
      />

      <TwinPickerCards compact />

      {groupedSections.map(([section, sectionItems]) => (
        <View
          key={section}
          style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[styles.sectionTitle, rtlText, { color: theme.text }]}>
            {getLocalizedAllergenSection(family.language, section as AllergenReferenceItem['section'])}
          </Text>
          {sectionItems.map((item) => {
            const count = allergenExposures[activeChild.id]?.[item.id] ?? item.testedCount;
            const statusLabel =
              count === 0 ? labels.notStarted : count >= 3 ? labels.complete : labels.progress(count);

            return (
              <View key={item.id} style={styles.itemRow}>
                <View style={styles.itemText}>
                  <Text style={[styles.itemName, rtlText, { color: theme.text }]}>
                    {getLocalizedAllergenItem(family.language, item.id, item.name)}
                  </Text>
                  <Text style={[styles.itemHint, rtlText, { color: theme.mutedText }]}>{statusLabel}</Text>
                </View>
                <FoodTestProgress
                  count={count}
                  accent={accent.secondary ?? accent.primary}
                  itemName={item.name}
                  onSelect={(nextCount) => markAllergenExposure(item.id, nextCount)}
                />
              </View>
            );
          })}
        </View>
      ))}

      <Text style={[styles.footerNote, rtlText]}>{labels.footer}</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '800',
  },
  itemHint: {
    color: '#6B7D91',
    lineHeight: 20,
    marginTop: 4,
  },
  footerNote: {
    color: colors.berry,
    fontWeight: '700',
    lineHeight: 20,
  },
  rtlText: { textAlign: 'right', writingDirection: 'rtl' },
});
