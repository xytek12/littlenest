import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { getDictionary } from '../i18n';
import type { RootTabParamList } from '../navigation/RootNavigator';
import { visibleTabs } from '../navigation/tabs';
import { usePrototypeState } from '../state/PrototypeState';
import { getPalette, paletteBase, paletteBoy, paletteGirl, paletteTwins, typography } from '../theme';
import { useAppTheme } from '../theme/useAppTheme';

const tabMeta = {
  Recipes: { emoji: '🍽️', labelKey: 'recipes' },
  Home: { emoji: '🏠', labelKey: 'home' },
  AI: { emoji: '✨', labelKey: 'ai' },
  Settings: { emoji: '⚙️', labelKey: 'settings' },
} satisfies Record<
  (typeof visibleTabs)[number],
  { emoji: string; labelKey: keyof ReturnType<typeof getDictionary>['tabs'] }
>;

function stickerColorFor(
  routeName: (typeof visibleTabs)[number],
  paletteType: 'girl' | 'boy' | 'twins',
  baseSticker: string,
): string {
  if (paletteType !== 'twins') {
    return baseSticker;
  }
  // alternate per tab for twins
  const index = visibleTabs.indexOf(routeName);
  const rotation = [paletteGirl.primary, paletteBoy.primary, paletteTwins.bridge, paletteGirl.primary, paletteBoy.primary];
  return rotation[index] ?? baseSticker;
}

function TabButton({
  selected,
  onPress,
  label,
  emoji,
  stickerColor,
  isDark,
  darkActiveBg,
  darkActiveText,
  darkInactiveText,
  darkBorder,
}: {
  selected: boolean;
  onPress: () => void;
  label: string;
  emoji: string;
  stickerColor: string;
  isDark: boolean;
  darkActiveBg: string;
  darkActiveText: string;
  darkInactiveText: string;
  darkBorder: string;
}) {
  const scale = useRef(new Animated.Value(selected ? 1.08 : 1)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: selected ? 1.08 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 140,
    }).start();
  }, [selected, scale]);

  function handlePressIn() {
    Animated.spring(scale, {
      toValue: 0.92,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, {
      toValue: selected ? 1.08 : 1,
      useNativeDriver: true,
      friction: 5,
      tension: 200,
    }).start();
  }

  return (
    <Pressable
      accessibilityLabel={`${label} tab`}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={styles.tabPressable}
    >
      <Animated.View
        style={[
          styles.tab,
          isDark
            ? {
                backgroundColor: selected ? darkActiveBg : 'transparent',
                borderColor: selected ? darkBorder : 'transparent',
                transform: [{ scale }],
              }
            : {
                backgroundColor: selected ? stickerColor : 'transparent',
                borderColor: selected ? paletteBase.stickerCharcoal : 'transparent',
                transform: [{ scale }],
              },
        ]}
      >
        <Text style={styles.emoji}>{emoji}</Text>
        <Text
          numberOfLines={1}
          style={[
            styles.label,
            {
              color: isDark
                ? selected
                  ? darkActiveText
                  : darkInactiveText
                : paletteBase.stickerCharcoal,
            },
          ]}
        >
          {label}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function BottomEmojiTabBar({ navigation, state }: BottomTabBarProps) {
  const theme = useAppTheme();
  const { family, activeChild } = usePrototypeState();
  const dictionary = getDictionary(family.language);
  const activeRouteName = state.routes[state.index]?.name as keyof RootTabParamList;
  const selectedTab = visibleTabs.includes(activeRouteName as (typeof visibleTabs)[number])
    ? (activeRouteName as (typeof visibleTabs)[number])
    : 'Home';
  const palette = getPalette(
    family.mode === 'twins'
      ? { mode: 'twins', twinType: family.twinType }
      : { mode: 'single', sex: activeChild.sex },
  );

  return (
    <View style={styles.outer}>
      <View
        accessibilityRole="tablist"
        style={[
          styles.container,
          theme.isDark
            ? {
                backgroundColor: theme.surface,
                borderColor: theme.border,
              }
            : {
                backgroundColor: '#FFFFFF',
              },
        ]}
      >
        {visibleTabs.map((routeName) => {
          const selected = selectedTab === routeName;
          const meta = tabMeta[routeName];
          const label = dictionary.tabs[meta.labelKey];
          const stickerColor = stickerColorFor(routeName, palette.type, palette.sticker);

          return (
            <TabButton
              key={routeName}
              selected={selected}
              label={label}
              emoji={meta.emoji}
              stickerColor={stickerColor}
              isDark={theme.isDark}
              darkActiveBg={theme.dockActiveBg}
              darkActiveText={theme.dockActiveText}
              darkInactiveText={theme.dockInactiveText}
              darkBorder={theme.border}
              onPress={() => navigation.navigate(routeName)}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
    paddingBottom: 10,
    paddingHorizontal: 12,
    paddingTop: 8,
  },
  container: {
    borderColor: paletteBase.stickerCharcoal,
    borderRadius: 26,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 6,
    height: 76,
    paddingHorizontal: 8,
    paddingVertical: 8,
    // hard offset sticker shadow
    shadowColor: paletteBase.stickerCharcoal,
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 8,
  },
  tabPressable: {
    flex: 1,
    minWidth: 0,
  },
  tab: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 2,
    flex: 1,
    justifyContent: 'center',
    minWidth: 0,
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
  emoji: {
    fontSize: 22,
    lineHeight: 26,
  },
  label: {
    fontFamily: typography.bodyBlack,
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },
});
