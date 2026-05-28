import { useColorScheme } from 'react-native';
import { paletteBase, jewelDark } from './index';

// Indigo Dream dark palette (lookbook variant 6).
// mutedText bumped twice: #A8A2C9 → #D9C8B6 → #E8DAC8 for legibility on
// the jewel canvas — the previous value tested ~7:1 against surface but
// looked dim in actual phone use, so we lift it further toward warm white.
const indigoDream = {
  background: '#161629',
  surface: '#1F1F38',
  text: '#EFEAFF',
  mutedText: '#E8DAC8',
  border: '#4A4A78',     // brighter so card edges read on the dark canvas
  // Dock pill — pastel lilac highlight on indigo bg.
  dockActiveBg: '#9FB7E8',
  dockActiveText: '#161629',
  // Inactive label boosted from 0.7 → 0.85 for legibility.
  dockInactiveText: 'rgba(239, 234, 255, 0.85)',
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    background: isDark ? indigoDream.background : paletteBase.paperCream,
    text: isDark ? indigoDream.text : paletteBase.ink,
    mutedText: isDark ? indigoDream.mutedText : paletteBase.inkSoft,
    surface: isDark ? indigoDream.surface : paletteBase.cardWash,
    border: isDark ? indigoDream.border : paletteBase.border,
    // Dock-specific tokens (only meaningful in dark mode; light mode keeps its
    // existing Sticker Pop colors hardcoded in BottomEmojiTabBar).
    dockActiveBg: indigoDream.dockActiveBg,
    dockActiveText: indigoDream.dockActiveText,
    dockInactiveText: indigoDream.dockInactiveText,
    // NEW: Moonlit Jewel dark canvas tokens (for GenderedBackground dark mode)
    jewelDark,
  };
}
