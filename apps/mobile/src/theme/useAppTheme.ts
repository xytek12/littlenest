import { useColorScheme } from 'react-native';
import { paletteBase } from './index';

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    isDark,
    background: isDark ? '#1A1517' : paletteBase.paperCream,
    text: isDark ? '#F4EFE9' : paletteBase.ink,
    mutedText: isDark ? '#9F948F' : paletteBase.inkSoft,
    surface: isDark ? '#26201F' : paletteBase.cardWash,
    border: isDark ? '#3A3232' : paletteBase.border,
  };
}
