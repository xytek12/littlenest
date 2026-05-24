import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { FoodTestProgress } from '../components/FoodTestProgress';
import { FlowHeader } from '../components/FlowHeader';
import { Screen } from '../components/Screen';
import {
  allergenReferenceItems,
  type AllergenReferenceItem,
} from '../data/allergenReference';
import { fetchAllergenReferenceItems } from '../services/allergenRepository';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { getAccentTheme } from '../theme/theme';
import { useAppTheme } from '../theme/useAppTheme';

export function FoodTastingScreen() {
  const theme = useAppTheme();
  const { activeChild, family } = usePrototypeState();
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
        title="Food tasting"
        subtitle={`Track first tastes three times and see what still needs allergy testing for ${activeChild.displayName}.`}
      />

      {groupedSections.map(([section, items]) => (
        <View
          key={section}
          style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>{section}</Text>
          {items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <View style={styles.itemText}>
                <Text style={[styles.itemName, { color: theme.text }]}>{item.name}</Text>
                <Text style={styles.itemHint}>
                  {item.testedCount === 0
                    ? 'Still needs testing'
                    : `${item.testedCount}/3 allergy checks complete`}
                </Text>
              </View>
              <FoodTestProgress count={item.testedCount} accent={accent.secondary ?? accent.primary} />
            </View>
          ))}
        </View>
      ))}

      <Text style={styles.footerNote}>Reference list loads from Supabase when the app is connected.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  itemText: {
    flex: 1,
  },
  itemName: {
    fontWeight: '800',
    fontSize: 15,
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
});
