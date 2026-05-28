import { useColorScheme } from 'react-native';
import { paletteBase, jewelDark } from './index';

// Indigo Dream dark palette (lookbook variant 6).
// mutedText bumped from #A8A2C9 → #D9C8B6 for legibility on jewel canvas.
const indigoDream = {
  background: '#161629',
  surface: '#1F1F38',
  text: '#EFEAFF',
  mutedText: '#D9C8B6',   // bumped per design spec
  border: '#363659',
  // Dock pill — pastel lilac highlight on indigo bg.
  dockActiveBg: '#9FB7E8',
  dockActiveText: '#161629',
  // Inactive label = body text at 0.7 opacity, baked into a single rgba.
  dockInactiveText: 'rgba(239, 234, 255, 0.7)',
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
