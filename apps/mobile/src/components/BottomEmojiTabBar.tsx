import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { getDictionary } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { visibleTabs } from '../navigation/tabs';
import { usePrototypeState } from '../state/PrototypeState';
import { colors } from '../theme/colors';
import { useAppTheme } from '../theme/useAppTheme';

const tabMeta = {
  Recipes: { emoji: '🍽️', labelKey: 'recipes' },
  Home: { emoji: '🏠', labelKey: 'home' },
  AI: { emoji: '✨', labelKey: 'ai' },
  Growth: { emoji: '📊', labelKey: 'growth' },
} satisfies Record<
  (typeof visibleTabs)[number],
  { emoji: string; labelKey: keyof ReturnType<typeof getDictionary>['tabs'] }
>;

export function BottomEmojiTabBar({ navigation, state }: BottomTabBarProps) {
  const theme = useAppTheme();
  const { family } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const activeRouteName = state.routes[state.index]?.name as keyof RootTabParamList;
  const selectedTab = visibleTabs.includes(activeRouteName as (typeof visibleTabs)[number])
    ? activeRouteName
    : 'Home';

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.container,
        {
          backgroundColor: theme.isDark ? '#0D1218' : colors.white,
          borderTopColor: theme.border,
        },
      ]}
    >
      {visibleTabs.map((routeName) => {
        const selected = selectedTab === routeName;
        const meta = tabMeta[routeName];
        const label = dictionary.tabs[meta.labelKey];

        return (
          <Pressable
            key={routeName}
            accessibilityLabel={`${label} tab`}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => navigation.navigate(routeName)}
            style={[
              styles.tab,
              selected
                ? {
                    backgroundColor: theme.isDark ? '#152638' : colors.blueSoft,
                    borderColor: colors.blue,
                  }
                : { borderColor: 'transparent' },
            ]}
          >
            <Text style={styles.emoji}>{meta.emoji}</Text>
            <Text
              numberOfLines={1}
              style={[
                styles.label,
                { color: selected ? colors.blue : theme.mutedText },
              ]}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    flexDirection: 'row',
    gap: 6,
    height: 82,
    paddingBottom: 10,
    paddingHorizontal: 10,
    paddingTop: 8,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  emoji: {
    fontSize: 21,
    lineHeight: 25,
  },
  label: {
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
});
